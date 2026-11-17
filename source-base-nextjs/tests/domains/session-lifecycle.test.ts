/**
 * Vòng đời phiên — MỘT cơ chế refresh cho cả lúc khởi động lẫn interceptor 401.
 *
 * Bốn điều dễ làm sai nhất, mỗi điều đã từng là lỗi thật:
 *
 * 1. **F5 lúc backend trục trặc KHÔNG được coi là "chưa đăng nhập".** Bản cũ
 *    gom mọi lỗi của lượt refresh khởi động về `anonymous`, nên 503 hay mất
 *    mạng đều đá người dùng về trang đăng nhập dù phiên còn sống.
 *
 * 2. **Kết quả refresh về MUỘN hơn một lần đăng xuất không được ghi lại token.**
 *
 * 3. **N nơi cùng cần refresh → một lời gọi mạng.**
 *
 * 4. **Payload sai hợp đồng ≠ hết phiên.**
 *
 * 5. **Web Locks chỉ là tối ưu hoá đa tab.** `locks.request` bị từ chối (iframe sandbox, trình
 *    duyệt lạ) thì refresh chạy không khoá đúng một lần — không được kẹt ở `restoring`.
 *
 * 6. **Đăng xuất chậm của phiên A không được xoá phiên B** đăng nhập trong lúc chờ BE.
 *
 * 7. **Một listener `onSessionEnd` ném lỗi không được chặn các listener khác.**
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { configureHttp } from '@/core/http';
import {
  establishSession,
  getAccessToken,
  logout,
  onSessionEnd,
  refreshAccessToken,
  restoreSession,
  useSessionStore,
} from '@/domains/session';
import {
  REFRESH_LOCK_WAIT_MS,
  refreshSession,
} from '@/domains/session/lifecycle/session.lifecycle';
import { createDeferred } from '@tests/helpers/deferred';
import { mockHttp } from '@tests/helpers/http-mock';
import type { MockHandler, MockReply } from '@tests/helpers/http-mock';

const USER = {
  id: 'u1',
  email: 'an@congty.vn',
  name: 'Nguyễn Văn An',
  roles: ['editor'],
  permissions: ['user:view'],
};

const sessionReply = (accessToken = 'token-moi'): MockReply => ({
  status: 200,
  data: { data: { accessToken, user: USER } },
});

/** Chỉ trả lời `/auth/refresh` bằng `reply`; mọi đường khác 200 rỗng. */
const onRefresh =
  (reply: () => ReturnType<MockHandler>): MockHandler =>
  (config) =>
    config.url === '/auth/refresh' ? reply() : { status: 200, data: { data: null } };

let restore: () => void = () => {};

beforeEach(() => {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  localStorage.clear();
  // Nối y như `app/_providers/bootstrap.ts` — để interceptor 401 thật sự có đường đi refresh.
  configureHttp({ auth: { getAccessToken, refreshAccessToken } });
});
afterEach(() => {
  vi.useRealTimers();
  restore();
  configureHttp({});
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'locks');
});

describe('khôi phục phiên lúc khởi động', () => {
  it('còn phiên → authenticated, có token và hồ sơ', async () => {
    restore = mockHttp(onRefresh(() => sessionReply()));
    await restoreSession();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-moi',
      user: { id: 'u1' },
    });
  });

  it('401 → anonymous (máy chủ xác nhận không có phiên)', async () => {
    restore = mockHttp(onRefresh(() => ({ status: 401, data: {} })));
    await restoreSession();

    expect(useSessionStore.getState()).toMatchObject({ status: 'anonymous', accessToken: null });
  });

  it.each([
    ['503', (): MockReply => ({ status: 503, data: {} })],
    ['mất mạng', (): 'network-error' => 'network-error'],
    [
      '200 nhưng payload thiếu accessToken',
      (): MockReply => ({ status: 200, data: { data: { user: USER } } }),
    ],
    [
      '200 nhưng không có vỏ `data`',
      (): MockReply => ({ status: 200, data: { accessToken: 'x' } }),
    ],
  ])('⛔ %s → unavailable, KHÔNG phải anonymous', async (_name, reply) => {
    restore = mockHttp(onRefresh(reply));
    await restoreSession();

    expect(useSessionStore.getState().status).toBe('unavailable');
  });

  it('`unavailable` giữ nguyên hồ sơ đã lưu — chưa biết phiên chết hay sống', async () => {
    useSessionStore.setState({ user: USER });
    restore = mockHttp(onRefresh(() => 'network-error'));
    await restoreSession();

    expect(useSessionStore.getState().user).toEqual(USER);
  });

  it('thử lại từ `unavailable` khi máy chủ đã sống lại', async () => {
    let up = false;
    restore = mockHttp(onRefresh(() => (up ? sessionReply() : { status: 503, data: {} })));

    await restoreSession();
    expect(useSessionStore.getState().status).toBe('unavailable');

    up = true;
    await restoreSession();
    expect(useSessionStore.getState().status).toBe('authenticated');
  });

  it('gọi trùng (StrictMode, hai guard cùng mount) → một lời gọi mạng', async () => {
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    await Promise.all([restoreSession(), restoreSession(), restoreSession()]);
    expect(reply).toHaveBeenCalledTimes(1);
  });

  it('đã có phiên thì không gọi lại', async () => {
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));
    establishSession({ accessToken: 't', user: USER });

    await restoreSession();
    expect(reply).not.toHaveBeenCalled();
  });
});

describe('refresh khi đang có phiên', () => {
  beforeEach(() => establishSession({ accessToken: 'token-cu', user: USER }));

  it('N lời gọi đồng thời → một lời gọi mạng, cùng một kết quả', async () => {
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    const tokens = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    expect(reply).toHaveBeenCalledTimes(1);
    expect(tokens).toEqual(['token-moi', 'token-moi', 'token-moi']);
  });

  it('⛔ mạng chập / 5xx GIỮ NGUYÊN phiên', async () => {
    restore = mockHttp(onRefresh(() => ({ status: 502, data: {} })));

    await expect(refreshAccessToken()).resolves.toBeNull();
    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-cu',
    });
  });

  it('máy chủ nói phiên chết → dọn phiên và báo `expired`', async () => {
    const ended = vi.fn();
    const off = onSessionEnd(ended);
    restore = mockHttp(onRefresh(() => ({ status: 401, data: {} })));

    await expect(refreshSession()).resolves.toEqual({ status: 'unauthenticated' });

    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('expired');
    off();
  });

  it('⛔ refresh về SAU khi đăng xuất không được ghi token trở lại', async () => {
    const gate = createDeferred<MockReply>();
    restore = mockHttp(onRefresh(() => gate.promise));

    const pending = refreshSession();
    await logout();
    expect(useSessionStore.getState().status).toBe('anonymous');

    gate.resolve(sessionReply('token-cua-phien-cu'));
    const outcome = await pending;

    expect(outcome.status).toBe('unavailable');
    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
  });

  it('⛔ refresh về SAU khi đổi tài khoản không được ghi đè phiên mới', async () => {
    const gate = createDeferred<MockReply>();
    restore = mockHttp(onRefresh(() => gate.promise));

    const pending = refreshSession();
    establishSession({ accessToken: 'token-nguoi-moi', user: { ...USER, id: 'u2' } });

    gate.resolve(sessionReply('token-nguoi-cu'));
    await pending;

    expect(useSessionStore.getState()).toMatchObject({
      accessToken: 'token-nguoi-moi',
      user: { id: 'u2' },
    });
  });
});

describe('đăng xuất', () => {
  beforeEach(() => establishSession({ accessToken: 'token-cu', user: USER }));

  it('xoá phiên và báo `logout`', async () => {
    const ended = vi.fn();
    const off = onSessionEnd(ended);
    restore = mockHttp(() => ({ status: 200, data: { data: null } }));

    await logout();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('logout');
    off();
  });

  it('BE lỗi vẫn xoá phiên phía client — người dùng đã bấm đăng xuất', async () => {
    restore = mockHttp(() => ({ status: 500, data: {} }));
    await logout();
    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('401 của lời gọi đăng xuất KHÔNG kích hoạt refresh', async () => {
    const seen: string[] = [];
    restore = mockHttp((config) => {
      seen.push(config.url ?? '');
      return { status: 401, data: {} };
    });

    await logout();
    expect(seen).toEqual(['/auth/logout']);
  });
});

describe('lý do kết thúc (`endReason`) và đổi tài khoản (`switched`)', () => {
  const OTHER_USER = { ...USER, id: 'u2', name: 'Lê Bình' };
  const offs: (() => void)[] = [];
  const listen = () => {
    const listener = vi.fn();
    offs.push(onSessionEnd(listener));
    return listener;
  };
  afterEach(() => offs.splice(0).forEach((off) => off()));

  it('đăng xuất chủ động → `endReason: logout`; đăng nhập lại → về `null`', async () => {
    establishSession({ accessToken: 't', user: USER });
    restore = mockHttp(() => ({ status: 200, data: { data: null } }));

    await logout();
    expect(useSessionStore.getState().endReason).toBe('logout');

    establishSession({ accessToken: 't', user: USER });
    expect(useSessionStore.getState().endReason).toBeNull();
  });

  it('phiên ĐANG SỐNG bị máy chủ từ chối → `endReason: expired`', async () => {
    establishSession({ accessToken: 't', user: USER });
    restore = mockHttp(onRefresh(() => ({ status: 401, data: {} })));

    await refreshSession();
    expect(useSessionStore.getState().endReason).toBe('expired');
  });

  it('khởi động thấy "chưa từng đăng nhập" → `endReason` vẫn `null`, không báo gì', async () => {
    const ended = listen();
    restore = mockHttp(onRefresh(() => ({ status: 401, data: {} })));

    await restoreSession();

    expect(useSessionStore.getState()).toMatchObject({ status: 'anonymous', endReason: null });
    expect(ended).not.toHaveBeenCalled();
  });

  it('⛔ người KHÁC đăng nhập thế chỗ → báo đúng một lần `switched`, store đã mang người mới', () => {
    establishSession({ accessToken: 't', user: USER });
    let seen: unknown;
    const ended = listen();
    offs.push(onSessionEnd(() => (seen = useSessionStore.getState().user)));

    establishSession({ accessToken: 't2', user: OTHER_USER });

    expect(ended).toHaveBeenCalledExactlyOnceWith('switched');
    expect(seen).toMatchObject({ id: 'u2' });
  });

  it('refresh trả hồ sơ người khác (tab khác đăng nhập) → báo `switched`', async () => {
    establishSession({ accessToken: 't', user: USER });
    const ended = listen();
    restore = mockHttp(() => ({
      status: 200,
      data: { data: { accessToken: 'token-cua-binh', user: OTHER_USER } },
    }));

    await refreshSession();
    expect(ended).toHaveBeenCalledExactlyOnceWith('switched');
  });

  it('hồ sơ khôi phục từ localStorage là người khác với phiên refresh trả về → báo `switched`', async () => {
    useSessionStore.setState({ user: USER });
    const ended = listen();
    restore = mockHttp(
      onRefresh(() => ({
        status: 200,
        data: { data: { accessToken: 'token-cua-binh', user: OTHER_USER } },
      })),
    );

    await restoreSession();
    expect(ended).toHaveBeenCalledExactlyOnceWith('switched');
  });

  it('làm mới token của CÙNG người, hay đăng nhập khi chưa có ai → không báo gì', async () => {
    const ended = listen();
    establishSession({ accessToken: 't1', user: USER });
    restore = mockHttp(onRefresh(() => sessionReply('t2')));

    await refreshSession();

    expect(useSessionStore.getState().accessToken).toBe('t2');
    expect(ended).not.toHaveBeenCalled();
  });
});

describe('Web Locks hỏng không được làm kẹt phiên', () => {
  type LockRequest = (
    name: string,
    options: { signal?: AbortSignal },
    callback: () => Promise<unknown>,
  ) => Promise<unknown>;

  const stubLocks = (request: LockRequest) =>
    Object.defineProperty(navigator, 'locks', { configurable: true, value: { request } });

  const lockRejects = () =>
    stubLocks(() => Promise.reject(new DOMException('Khoá bị chặn', 'SecurityError')));

  it('⛔ `locks.request` bị từ chối + refresh OK → authenticated, refresh gọi đúng một lần', async () => {
    lockRejects();
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    await restoreSession();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-moi',
    });
    expect(reply).toHaveBeenCalledTimes(1);
  });

  it('⛔ `locks.request` bị từ chối + refresh 503 → unavailable, không kẹt ở restoring', async () => {
    lockRejects();
    const reply = vi.fn((): MockReply => ({ status: 503, data: {} }));
    restore = mockHttp(onRefresh(reply));

    await restoreSession();

    expect(useSessionStore.getState().status).toBe('unavailable');
    expect(reply).toHaveBeenCalledTimes(1);
  });

  it('`locks.request` bị từ chối + 401 → anonymous như khi không có khoá', async () => {
    lockRejects();
    restore = mockHttp(onRefresh(() => ({ status: 401, data: {} })));

    await restoreSession();

    expect(useSessionStore.getState().status).toBe('anonymous');
  });

  it('⛔ `locks.request` bị từ chối → `refreshAccessToken()` resolve ra token, không ném', async () => {
    establishSession({ accessToken: 'token-cu', user: USER });
    lockRejects();
    restore = mockHttp(onRefresh(() => sessionReply('token-moi')));

    await expect(refreshAccessToken()).resolves.toBe('token-moi');
  });

  it('khoá chạy bình thường → refresh nằm trong khoá, gọi đúng một lần', async () => {
    const request = vi.fn<LockRequest>((_name, _options, callback) => callback());
    stubLocks(request);
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    await restoreSession();

    expect(request).toHaveBeenCalledTimes(1);
    expect(reply).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().status).toBe('authenticated');
  });

  it('⛔ tab khác giữ khoá mãi không nhả → hết `REFRESH_LOCK_WAIT_MS` vẫn làm mới, không kẹt ở restoring', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    stubLocks(
      (_name, { signal }) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Hết thời gian chờ khoá', 'AbortError')),
          );
        }),
    );
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    const restoring = restoreSession();
    expect(useSessionStore.getState().status).toBe('restoring');
    expect(reply).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(REFRESH_LOCK_WAIT_MS);
    await restoring;

    expect(reply).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState().status).toBe('authenticated');
    vi.useRealTimers();
  });

  it('khoá được cấp trước hạn → hẹn giờ chờ bị huỷ, không refresh thêm lần nào', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    stubLocks((_name, _options, callback) => callback());
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    await restoreSession();
    await vi.advanceTimersByTimeAsync(REFRESH_LOCK_WAIT_MS * 2);

    expect(reply).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it('khoá chạy refresh xong mới từ chối → KHÔNG refresh lần hai, giữ kết quả đã có', async () => {
    stubLocks(async (_name, _options, callback) => {
      await callback();
      throw new DOMException('Khoá bị thu hồi', 'InvalidStateError');
    });
    const reply = vi.fn(() => sessionReply());
    restore = mockHttp(onRefresh(reply));

    await restoreSession();

    expect(reply).toHaveBeenCalledTimes(1);
    expect(useSessionStore.getState()).toMatchObject({ status: 'authenticated' });
  });

  it('⛔ kết quả refresh nổ bất ngờ khi ghi vào store → bootstrap không ném, kết thúc ở `unavailable`', async () => {
    restore = mockHttp(onRefresh(() => sessionReply()));
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const original = useSessionStore.setState;
    vi.spyOn(useSessionStore, 'setState').mockImplementation(
      (...args: Parameters<typeof original>) => {
        const [partial] = args;
        if (typeof partial === 'object' && partial.status === 'authenticated') {
          throw new Error('Bộ nhớ trình duyệt đầy');
        }
        return original(...args);
      },
    );

    await expect(restoreSession()).resolves.toBeUndefined();

    expect(useSessionStore.getState().status).toBe('unavailable');
    expect(errorLog).toHaveBeenCalled();
  });
});

describe('đăng xuất chậm không được xoá phiên mới', () => {
  const OTHER_USER = { ...USER, id: 'u2', email: 'binh@congty.vn', name: 'Lê Bình' };
  const OTHER_SESSION = { accessToken: 'token-cua-binh', user: OTHER_USER };
  const OK: MockReply = { status: 200, data: { data: null } };

  let broadcasts: unknown[] = [];
  const logoutSignals = () =>
    broadcasts.filter((signal) => (signal as { type: string }).type === 'logout');

  const offs: (() => void)[] = [];
  const listen = () => {
    const listener = vi.fn();
    offs.push(onSessionEnd(listener));
    return listener;
  };

  /** `/auth/logout` chờ `gate`; `/auth/refresh` trả `refreshReply` (nếu có). */
  const slowLogout = (gate: Promise<MockReply>, refreshReply?: MockReply) =>
    mockHttp((config) => {
      if (config.url === '/auth/logout') return gate;
      if (config.url === '/auth/refresh' && refreshReply) return refreshReply;
      return OK;
    });

  beforeEach(() => {
    establishSession({ accessToken: 'token-cua-an', user: USER });
    broadcasts = [];
    vi.spyOn(BroadcastChannel.prototype, 'postMessage').mockImplementation((message) => {
      broadcasts.push(message);
    });
  });
  afterEach(() => offs.splice(0).forEach((off) => off()));

  it('⛔ đăng nhập B trong lúc logout A chờ BE → B còn nguyên, chỉ báo `switched` (không `logout`)', async () => {
    const gate = createDeferred<MockReply>();
    restore = slowLogout(gate.promise);
    const ended = listen();

    const pending = logout();
    establishSession(OTHER_SESSION);
    gate.resolve(OK);
    await pending;

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-cua-binh',
      user: { id: 'u2' },
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('switched');
    expect(logoutSignals()).toEqual([]);
  });

  it('⛔ BE đăng xuất A trả lỗi sau khi B đã đăng nhập → B vẫn còn nguyên', async () => {
    const gate = createDeferred<MockReply>();
    restore = slowLogout(gate.promise);
    const ended = listen();

    const pending = logout();
    establishSession(OTHER_SESSION);
    gate.resolve({ status: 500, data: {} });
    await expect(pending).resolves.toBeUndefined();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      user: { id: 'u2' },
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('switched');
    expect(logoutSignals()).toEqual([]);
  });

  it('⛔ tab khác đăng nhập B (refresh trả B, không qua `establishSession`) → B còn nguyên', async () => {
    const gate = createDeferred<MockReply>();
    restore = slowLogout(gate.promise, {
      status: 200,
      data: { data: { accessToken: 'token-cua-binh', user: OTHER_USER } },
    });
    const ended = listen();

    const pending = logout();
    await refreshSession();
    expect(useSessionStore.getState().user?.id).toBe('u2');
    gate.resolve(OK);
    await pending;

    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-cua-binh',
      user: { id: 'u2' },
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('switched');
    expect(logoutSignals()).toEqual([]);
  });

  it('refresh xoay token của CHÍNH phiên A trong lúc chờ → vẫn xoá phiên và báo `logout`', async () => {
    const gate = createDeferred<MockReply>();
    restore = slowLogout(gate.promise, sessionReply('token-xoay-vong'));
    const ended = listen();

    const pending = logout();
    await refreshSession();
    expect(useSessionStore.getState().accessToken).toBe('token-xoay-vong');
    gate.resolve(OK);
    await pending;

    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('logout');
    expect(logoutSignals()).toEqual([{ type: 'logout' }]);
  });

  it('không có gì đổi trong lúc chờ → xoá phiên, báo `logout`, phát đúng một tín hiệu', async () => {
    restore = mockHttp(() => OK);
    const ended = listen();

    await logout();

    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
    expect(ended).toHaveBeenCalledExactlyOnceWith('logout');
    expect(logoutSignals()).toEqual([{ type: 'logout' }]);
  });

  it('BE lỗi mà không có gì đổi → vẫn xoá phiên và vẫn báo các tab khác', async () => {
    restore = mockHttp(() => ({ status: 500, data: {} }));
    const ended = listen();

    await expect(logout()).resolves.toBeUndefined();

    expect(useSessionStore.getState().status).toBe('anonymous');
    expect(ended).toHaveBeenCalledExactlyOnceWith('logout');
    expect(logoutSignals()).toEqual([{ type: 'logout' }]);
  });
});

describe('listener `onSessionEnd` lỗi không được chặn các listener khác', () => {
  const offs: (() => void)[] = [];
  const listen = (listener: (reason: string) => void = vi.fn()) => {
    offs.push(onSessionEnd(listener));
    return listener;
  };
  const failing = (error: Error) =>
    listen(() => {
      throw error;
    });

  beforeEach(() => establishSession({ accessToken: 'token-cu', user: USER }));
  afterEach(() => offs.splice(0).forEach((off) => off()));

  it('⛔ listener đầu ném → listener sau vẫn được gọi, `logout()` không ném, store đã xoá', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new Error('listener hỏng');
    failing(boom);
    const second = listen(vi.fn());
    restore = mockHttp(() => ({ status: 200, data: { data: null } }));

    await expect(logout()).resolves.toBeUndefined();

    expect(second).toHaveBeenCalledExactlyOnceWith('logout');
    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
    expect(errorLog.mock.calls.flat()).toContain(boom);
  });

  it('⛔ listener ném trong lúc refresh 401 → `refreshSession()` không bị từ chối', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    failing(new Error('listener hỏng'));
    const second = listen(vi.fn());
    restore = mockHttp(onRefresh(() => ({ status: 401, data: {} })));

    await expect(refreshSession()).resolves.toEqual({ status: 'unauthenticated' });

    expect(second).toHaveBeenCalledExactlyOnceWith('expired');
    expect(useSessionStore.getState()).toMatchObject({
      status: 'anonymous',
      accessToken: null,
      user: null,
    });
  });

  it('nhiều listener cùng ném → mỗi lỗi được báo riêng, listener lành vẫn chạy', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const first = new Error('lỗi một');
    const third = new Error('lỗi ba');
    failing(first);
    const healthy = listen(vi.fn());
    failing(third);
    restore = mockHttp(() => ({ status: 200, data: { data: null } }));

    await logout();

    expect(healthy).toHaveBeenCalledTimes(1);
    expect(errorLog.mock.calls.flat()).toEqual(expect.arrayContaining([first, third]));
  });

  it('store đã xoá trước khi listener được gọi', async () => {
    let seen: unknown;
    listen(() => {
      seen = useSessionStore.getState();
    });
    restore = mockHttp(() => ({ status: 200, data: { data: null } }));

    await logout();

    expect(seen).toMatchObject({ status: 'anonymous', accessToken: null, user: null });
  });
});

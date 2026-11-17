/**
 * Đồng bộ phiên GIỮA CÁC TAB.
 *
 * Cookie refresh dùng chung cho mọi tab, còn access token + hồ sơ thì mỗi tab
 * giữ một bản. Không báo cho nhau thì đăng xuất ở tab A mà tab B vẫn hiện giao
 * diện đã đăng nhập; đăng nhập tài khoản khác ở tab A mà tab B vẫn hiện dữ liệu
 * người cũ.
 *
 * "Tab khác" ở đây là một `BroadcastChannel` thứ hai cùng tên — đúng cơ chế
 * trình duyệt dùng, không mock.
 *
 * Kênh là tài nguyên chung của origin: một tin lạ không được đăng xuất người dùng, một lần phát
 * lỗi không được làm tab này điếc, và lỗi của lượt refresh do tín hiệu gây ra không được trôi
 * thành unhandled rejection.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  establishSession,
  logout,
  onSessionEnd,
  startSessionSync,
  useSessionStore,
} from '@/domains/session';
import { sessionApi } from '@/domains/session/api/session.api';
import { isSessionSignal, subscribeSessionSignals } from '@/domains/session/lifecycle/session.sync';

import { mockHttp } from '@tests/helpers/http-mock';

const USER = { id: 'u1', email: 'an@congty.vn', name: 'An', roles: [], permissions: [] };
const OTHER_USER = { ...USER, id: 'u2', name: 'Bình' };

let otherTab: BroadcastChannel;
let stopSync: () => void = () => {};
let restore: () => void = () => {};

beforeEach(() => {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
  otherTab = new BroadcastChannel('app:session');
  stopSync = startSessionSync();
});
afterEach(() => {
  stopSync();
  otherTab.close();
  restore();
  vi.restoreAllMocks();
});

describe('nhận tín hiệu từ tab khác', () => {
  it('tab khác đăng xuất → tab này dọn phiên, báo `remote`', async () => {
    establishSession({ accessToken: 't', user: USER });
    const ended = vi.fn();
    const off = onSessionEnd(ended);

    otherTab.postMessage({ type: 'logout' });

    await vi.waitFor(() => expect(useSessionStore.getState().status).toBe('anonymous'));
    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(ended).toHaveBeenCalledExactlyOnceWith('remote');
    off();
  });

  it('tab khác đăng nhập tài khoản KHÁC → tab này hỏi lại máy chủ và mang danh tính mới', async () => {
    establishSession({ accessToken: 'token-cua-an', user: USER });
    restore = mockHttp(() => ({
      status: 200,
      data: { data: { accessToken: 'token-cua-binh', user: OTHER_USER } },
    }));

    otherTab.postMessage({ type: 'login' });

    await vi.waitFor(() => expect(useSessionStore.getState().user?.id).toBe('u2'));
    expect(useSessionStore.getState().accessToken).toBe('token-cua-binh');
  });

  it('dừng nghe rồi thì tín hiệu không còn tác dụng', async () => {
    establishSession({ accessToken: 't', user: USER });
    stopSync();

    otherTab.postMessage({ type: 'logout' });
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(useSessionStore.getState().status).toBe('authenticated');
  });
});

describe('phát tín hiệu cho tab khác', () => {
  const nextSignal = () =>
    new Promise<unknown>((resolve) => {
      otherTab.onmessage = (event) => resolve(event.data);
    });

  it('đăng nhập ở tab này → tab khác nhận `login`', async () => {
    const signal = nextSignal();
    establishSession({ accessToken: 't', user: USER });
    await expect(signal).resolves.toEqual({ type: 'login' });
  });

  it('đăng xuất ở tab này → tab khác nhận `logout`', async () => {
    establishSession({ accessToken: 't', user: USER });
    restore = mockHttp(() => ({ status: 200, data: { data: null } }));

    const signal = new Promise<unknown>((resolve) => {
      otherTab.onmessage = (event) => {
        if ((event.data as { type: string }).type === 'logout') resolve(event.data);
      };
    });
    await logout();
    await expect(signal).resolves.toEqual({ type: 'logout' });
  });

  it('tín hiệu KHÔNG mang token hay hồ sơ — tab nhận tự hỏi máy chủ bằng cookie', async () => {
    const signal = nextSignal();
    establishSession({ accessToken: 'bi-mat', user: USER });
    expect(JSON.stringify(await signal)).not.toContain('bi-mat');
  });
});

describe('sessionApi.me', () => {
  it('trả hồ sơ đã kiểm schema, điền mặc định cho roles/permissions thiếu', async () => {
    restore = mockHttp(() => ({
      status: 200,
      data: { data: { id: 'u1', email: 'an@congty.vn', name: 'An' } },
    }));

    await expect(sessionApi.me()).resolves.toEqual({
      id: 'u1',
      email: 'an@congty.vn',
      name: 'An',
      roles: [],
      permissions: [],
    });
  });

  it('nhận `signal` — query bị huỷ thì request bị huỷ thật', async () => {
    restore = mockHttp(() => ({ status: 200, data: { data: USER } }));
    const controller = new AbortController();
    controller.abort();

    await expect(sessionApi.me(controller.signal)).rejects.toMatchObject({ kind: 'canceled' });
  });

  it('hồ sơ sai hình dạng → lỗi hợp đồng, không trả dữ liệu nửa vời', async () => {
    restore = mockHttp(() => ({ status: 200, data: { data: { id: '', email: 1 } } }));
    await expect(sessionApi.me()).rejects.toMatchObject({ kind: 'contract' });
  });
});

describe('tin lạ trên kênh phiên', () => {
  const JUNK: [string, unknown][] = [
    ['null', null],
    ['chuỗi', 'logout'],
    ['số', 42],
    ['mảng', [{ type: 'logout' }]],
    ['object rỗng', {}],
    ['type lạ', { type: 'ping' }],
    ['type sai hoa thường', { type: 'LOGOUT' }],
    ['type không phải chuỗi', { type: 1 }],
  ];

  it.each(JUNK)(
    '⛔ tin %s không tới handler — chỉ tin đúng `SessionSignal` mới được chuyển',
    async (_name, payload) => {
      const handler = vi.fn();
      const stop = subscribeSessionSignals(handler);

      otherTab.postMessage(payload);
      otherTab.postMessage({ type: 'logout' });

      await vi.waitFor(() => expect(handler).toHaveBeenCalled());
      expect(handler.mock.calls).toEqual([[{ type: 'logout' }]]);
      stop();
    },
  );

  it('⛔ tin `{ type: "ping" }` không đăng xuất người dùng — chỉ `login` sau nó đổi sang người mới', async () => {
    establishSession({ accessToken: 'token-cua-an', user: USER });
    const ended = vi.fn();
    const off = onSessionEnd(ended);
    restore = mockHttp(() => ({
      status: 200,
      data: { data: { accessToken: 'token-cua-binh', user: OTHER_USER } },
    }));

    otherTab.postMessage({ type: 'ping' });
    otherTab.postMessage({ type: 'login' });

    await vi.waitFor(() => expect(useSessionStore.getState().user?.id).toBe('u2'));
    expect(ended.mock.calls).toEqual([['switched']]);
    off();
  });
});

describe('refresh do tín hiệu `login` gây ra bị lỗi', () => {
  it('⛔ lỗi được báo bằng console.error, không thành unhandled rejection, state giữ nguyên', async () => {
    establishSession({ accessToken: 'token-cua-an', user: USER });
    restore = mockHttp(() => ({
      status: 200,
      data: { data: { accessToken: 'token-cua-binh', user: OTHER_USER } },
    }));
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const boom = new Error('Bộ nhớ trình duyệt đầy');
    const original = useSessionStore.setState;
    vi.spyOn(useSessionStore, 'setState').mockImplementation(
      (...args: Parameters<typeof original>) => {
        const [partial] = args;
        if (typeof partial === 'object' && partial.accessToken === 'token-cua-binh') throw boom;
        return original(...args);
      },
    );

    otherTab.postMessage({ type: 'login' });

    await vi.waitFor(() => expect(errorLog.mock.calls.flat()).toContain(boom));
    expect(useSessionStore.getState()).toMatchObject({
      status: 'authenticated',
      accessToken: 'token-cua-an',
      user: { id: 'u1' },
    });
  });
});

describe('kênh bị hỏng khi phát tin', () => {
  const failOnce = (closeChannel: boolean) =>
    vi.spyOn(BroadcastChannel.prototype, 'postMessage').mockImplementationOnce(function (
      this: BroadcastChannel,
    ) {
      if (closeChannel) this.close();
      throw new DOMException('Kênh không phát được', 'InvalidStateError');
    });

  it('⛔ phát lỗi vì kênh đã đóng → subscription cũ vẫn nghe được tab khác', async () => {
    failOnce(true);
    establishSession({ accessToken: 't', user: USER });
    const ended = vi.fn();
    const off = onSessionEnd(ended);

    otherTab.postMessage({ type: 'logout' });

    await vi.waitFor(() => expect(useSessionStore.getState().status).toBe('anonymous'));
    expect(ended).toHaveBeenCalledExactlyOnceWith('remote');
    off();
  });

  it('sau một lần phát lỗi, lần phát kế tiếp vẫn tới tab khác', async () => {
    failOnce(true);
    establishSession({ accessToken: 't', user: USER });

    const signal = new Promise<unknown>((resolve) => {
      otherTab.onmessage = (event) => resolve(event.data);
    });
    establishSession({ accessToken: 't', user: USER });

    await expect(signal).resolves.toEqual({ type: 'login' });
  });

  it('⛔ kênh hỏng nhưng còn sống không được ở lại nhận lại tin của chính tab này', async () => {
    const refresh = vi.fn(() => ({ status: 200, data: { data: null } }));
    restore = mockHttp(refresh);
    failOnce(false);
    establishSession({ accessToken: 't', user: USER });

    const delivered = new Promise<void>((resolve) => {
      otherTab.onmessage = () => resolve();
    });
    establishSession({ accessToken: 't', user: USER });
    await delivered;
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('isSessionSignal', () => {
  it.each([
    [{ type: 'login' }, true],
    [{ type: 'logout' }, true],
    [{ type: 'login', thua: 1 }, true],
    [null, false],
    [undefined, false],
    ['login', false],
    [{ type: 'ping' }, false],
    [{}, false],
  ])('%j → %s', (value, expected) => {
    expect(isSessionSignal(value)).toBe(expected);
  });
});

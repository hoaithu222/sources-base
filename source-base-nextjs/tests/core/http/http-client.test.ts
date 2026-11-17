/**
 * Interceptor của `apiClient` — phần tinh tế nhất của tầng HTTP.
 *
 * Những hành vi phải giữ bằng mọi giá:
 *
 * 1. **Một lượt refresh cho N request.** 5 request cùng ăn 401 thì chỉ MỘT lời
 *    gọi làm mới token; cả 5 chờ rồi phát lại. Nếu cả 5 cùng refresh, refresh
 *    token xoay vòng ở BE khiến 4 lời gọi sau mang cookie đã vô hiệu → phiên
 *    chết oan. Single-flight là hợp đồng của `HttpAuthAdapter.refreshAccessToken`
 *    (domain phiên lo) — phiên giả dưới đây giữ đúng hợp đồng đó.
 *
 * 2. **Không treo.** Request ăn 401 SAU khi lượt refresh đã xong vẫn phải được
 *    chữa. Bản cũ có một cửa sổ mà request rơi vào hàng đợi không ai xả, promise
 *    treo vĩnh viễn (`timeout` của axios không cứu được vì nó chỉ áp cho lời
 *    gọi HTTP, không áp cho chuỗi promise của interceptor).
 *
 * 3. **Không làm mới được thì trả lỗi 401 GỐC**, không phải một lỗi lạ.
 *
 * 4. **Lỗi ra khỏi tầng này luôn là `AppError`**; request bị huỷ không được báo
 *    như một lỗi.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient, configureHttp, isAppError } from '@/core/http';
import type { AppError } from '@/core/http';

import { createDeferred } from '@tests/helpers/deferred';
import { bearerOf, mockHttp } from '@tests/helpers/http-mock';
import type { MockReply } from '@tests/helpers/http-mock';

/**
 * Phiên giả: một token trong bộ nhớ + `refreshAccessToken` single-flight như hợp đồng đòi.
 * `refresh` là lượt làm mới THẬT (đếm được số lần gọi, đổi được kết quả).
 */
function fakeSession(initialToken: string | null) {
  let token = initialToken;
  let inflight: Promise<string | null> | null = null;
  const refresh = vi.fn(async (): Promise<string | null> => {
    token = 'token-moi';
    return token;
  });
  const refreshAccessToken = (): Promise<string | null> => {
    inflight ??= refresh().finally(() => {
      inflight = null;
    });
    return inflight;
  };
  return {
    refresh,
    refreshAccessToken,
    getAccessToken: () => token,
    setToken: (next: string | null) => {
      token = next;
    },
  };
}

async function rejection(promise: Promise<unknown>): Promise<AppError> {
  const error = await promise.then(
    () => {
      throw new Error('Lẽ ra phải reject');
    },
    (e: unknown) => e,
  );
  if (!isAppError(error)) throw new Error(`Không phải AppError: ${String(error)}`);
  return error;
}

let restore: () => void = () => {};

beforeEach(() => configureHttp({}));
afterEach(() => {
  restore();
  configureHttp({});
});

describe('gắn token', () => {
  it('request mang access token hiện tại', async () => {
    const session = fakeSession('token-cu');
    configureHttp({ auth: session });
    const seen: Array<string | null> = [];
    restore = mockHttp((config) => {
      seen.push(bearerOf(config));
      return { status: 200, data: { data: 1 } };
    });

    await apiClient.get('/users');
    expect(seen).toEqual(['token-cu']);
  });

  it('chưa đăng nhập thì không gắn header', async () => {
    configureHttp({ auth: fakeSession(null) });
    const seen: Array<string | null> = [];
    restore = mockHttp((config) => {
      seen.push(bearerOf(config));
      return { status: 200, data: {} };
    });

    await apiClient.get('/public');
    expect(seen).toEqual([null]);
  });
});

describe('refresh khi 401', () => {
  /** Token cũ → 401; token mới → 200. */
  const expireOldToken = (config: Parameters<typeof bearerOf>[0]): MockReply =>
    bearerOf(config) === 'token-moi'
      ? { status: 200, data: { data: config.url } }
      : { status: 401, data: {} };

  it('5 request cùng hết hạn → ĐÚNG MỘT lượt refresh, cả 5 phát lại bằng token mới', async () => {
    const session = fakeSession('token-cu');
    configureHttp({ auth: session });
    restore = mockHttp(expireOldToken);

    const results = await Promise.all(
      ['/a', '/b', '/c', '/d', '/e'].map((url) => apiClient.get<{ data: string }>(url)),
    );

    expect(session.refresh).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.data.data)).toEqual(['/a', '/b', '/c', '/d', '/e']);
  });

  it('⛔ 401 về MUỘN hơn lượt refresh vẫn được chữa — và không refresh thêm lần nữa', async () => {
    const session = fakeSession('token-cu');
    configureHttp({ auth: session });

    // `/cham` bay đi bằng token cũ nhưng máy chủ trả lời chậm: 401 của nó về
    // sau khi `/nhanh` đã refresh xong. Đây đúng là cửa sổ từng làm treo promise.
    const slow = createDeferred<MockReply>();
    restore = mockHttp((config) => {
      if (config.url === '/cham' && bearerOf(config) === 'token-cu') return slow.promise;
      return expireOldToken(config);
    });

    const slowRequest = apiClient.get<{ data: string }>('/cham');
    const fast = await apiClient.get<{ data: string }>('/nhanh');
    expect(fast.data.data).toBe('/nhanh');

    slow.resolve({ status: 401, data: {} });
    await expect(slowRequest).resolves.toMatchObject({ data: { data: '/cham' } });
    // Token đã đổi kể từ lúc `/cham` bay đi → dùng luôn, không xoay refresh token lần hai.
    expect(session.refresh).toHaveBeenCalledTimes(1);
  });

  it('không làm mới được → reject bằng lỗi 401 GỐC', async () => {
    const session = fakeSession('token-cu');
    session.refresh.mockResolvedValue(null);
    configureHttp({ auth: session });
    restore = mockHttp(() => ({ status: 401, data: { message: 'Phiên đã hết hạn rồi' } }));

    const error = await rejection(apiClient.get('/a'));
    expect(error.kind).toBe('unauthorized');
    expect(error.status).toBe(401);
    expect(error.message).toBe('Phiên đã hết hạn rồi');
  });

  it('hàm refresh ném lỗi → vẫn trả lỗi 401 gốc, không lộ lỗi lạ', async () => {
    const session = fakeSession('token-cu');
    session.refresh.mockRejectedValue(new Error('nổ'));
    configureHttp({ auth: session });
    restore = mockHttp(() => ({ status: 401, data: {} }));

    const error = await rejection(apiClient.get('/a'));
    expect(error.kind).toBe('unauthorized');
  });

  it('401 dai dẳng sau khi đã phát lại → dừng, KHÔNG refresh vô hạn', async () => {
    const session = fakeSession('token-cu');
    configureHttp({ auth: session });
    restore = mockHttp(() => ({ status: 401, data: {} }));

    await rejection(apiClient.get('/sai-scope'));
    expect(session.refresh).toHaveBeenCalledTimes(1);
  });

  it('`skipAuthRefresh` (endpoint công khai) → 401 không kích hoạt refresh', async () => {
    const session = fakeSession(null);
    configureHttp({ auth: session });
    restore = mockHttp(() => ({
      status: 401,
      data: { error: { code: 'AUTH_001', message: 'x' } },
    }));

    const error = await rejection(
      apiClient.post('/auth/login', { email: 'a@b.vn' }, { skipAuthRefresh: true }),
    );
    expect(session.refresh).not.toHaveBeenCalled();
    expect(error.code).toBe('AUTH_001');
    expect(error.message).toBe('Email hoặc mật khẩu không đúng');
  });

  it('chỗ gọi huỷ request trong lúc chờ refresh → KHÔNG phát lại', async () => {
    const session = fakeSession('token-cu');
    const gate = createDeferred<string | null>();
    session.refresh.mockImplementation(() => gate.promise);
    configureHttp({ auth: session });

    const handler = vi.fn((config: Parameters<typeof bearerOf>[0]) => expireOldToken(config));
    restore = mockHttp(handler);

    const controller = new AbortController();
    const request = apiClient.get('/a', { signal: controller.signal });
    await vi.waitFor(() => expect(session.refresh).toHaveBeenCalled());

    controller.abort();
    session.setToken('token-moi');
    gate.resolve('token-moi');

    const error = await rejection(request);
    expect(error.kind).toBe('canceled');
    // Chỉ có lượt đi đầu tiên (ăn 401) — không có lượt phát lại.
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('chuẩn hoá lỗi', () => {
  it('lỗi nghiệp vụ trả kèm HTTP 200 (`status: false`) → reject', async () => {
    restore = mockHttp(() => ({ status: 200, data: { status: false, errorCode: 'RES_002' } }));

    const error = await rejection(apiClient.post('/projects', {}));
    expect(error.kind).toBe('business');
    expect(error.code).toBe('RES_002');
    expect(error.message).toBe('Tài nguyên đã tồn tại');
  });

  it('`skipBusinessErrorHandling` → chỗ gọi tự đọc `status: false`', async () => {
    restore = mockHttp(() => ({ status: 200, data: { status: false, errorCode: 'RES_002' } }));

    const response = await apiClient.post('/import', {}, { skipBusinessErrorHandling: true });
    expect(response.data).toEqual({ status: false, errorCode: 'RES_002' });
  });

  it('mất mạng → `network`', async () => {
    restore = mockHttp(() => 'network-error');
    const error = await rejection(apiClient.get('/a'));
    expect(error.kind).toBe('network');
    expect(error.status).toBeUndefined();
  });

  it('5xx → `server`', async () => {
    restore = mockHttp(() => ({ status: 503, data: {} }));
    const error = await rejection(apiClient.get('/a'));
    expect(error.kind).toBe('server');
    expect(error.message).toBe('Đang bảo trì');
  });

  it('422 kèm lỗi theo trường → `validation` + `fieldErrors`', async () => {
    restore = mockHttp(() => ({
      status: 422,
      data: {
        title: 'One or more validation errors occurred.',
        errors: { email: ['Email đã dùng'] },
      },
    }));

    const error = await rejection(apiClient.post('/users', {}));
    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual({ email: ['Email đã dùng'] });
    expect(error.message).toBe('Email đã dùng');
  });
});

describe('quan sát lỗi (`observeError`)', () => {
  it('được gọi cho lỗi thật', async () => {
    const observeError = vi.fn();
    configureHttp({ observeError });
    restore = mockHttp(() => ({ status: 500, data: {} }));

    await rejection(apiClient.get('/a'));
    expect(observeError).toHaveBeenCalledTimes(1);
    expect(observeError.mock.calls[0][0]).toMatchObject({ kind: 'server', status: 500 });
  });

  it('⛔ request bị huỷ KHÔNG được báo như lỗi', async () => {
    const observeError = vi.fn();
    configureHttp({ observeError });
    restore = mockHttp(() => ({ status: 200, data: {} }));

    const controller = new AbortController();
    controller.abort();

    const error = await rejection(apiClient.get('/a', { signal: controller.signal }));
    expect(error.kind).toBe('canceled');
    expect(observeError).not.toHaveBeenCalled();
  });
});

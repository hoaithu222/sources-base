import type { BrowserContext, Route } from '@playwright/test';

import { BASE_URL, SESSION_COOKIE } from './env';

/**
 * FakeApi — backend giả của bộ e2e: chặn mọi `/api/**` ở tầng trình duyệt (`context.route`) nên request KHÔNG tới rewrite
 * của Next và không cần backend thật. Chỉ giả hợp đồng mà frontend dựa vào (`src/domains/session/api`, `src/features/auth/api`):
 *
 *   POST /api/auth/login    kiểm tài khoản, đặt cookie phiên HttpOnly, trả `{ data: { accessToken, user } }`
 *   POST /api/auth/refresh  có phiên → payload như login; không → 401; `refreshFault` giả 503 / mất mạng
 *   POST /api/auth/logout   thu hồi phiên, xoá cookie
 *
 * Phiên có HAI nửa như thật: "máy chủ" nhớ phiên còn sống (`serverSession`) và trình duyệt giữ cookie `SESSION_COOKIE` —
 * `proxy.ts` chỉ nhìn cookie, `AuthGate` chỉ tin kết quả refresh. Đường `/api/**` khác là test gọi thiếu giả lập → ghi vào
 * `unhandled` (fixture `api` ở `test.ts` buộc mảng này rỗng khi test xong).
 */

export const E2E_ACCOUNT = { email: 'e2e@example.com', password: 'Passw0rd!e2e' } as const;

/** Access token giả — test dùng để chắc nó KHÔNG lọt vào localStorage (token chỉ sống trong bộ nhớ). */
export const E2E_ACCESS_TOKEN = 'e2e-access-token-memory-only';

export const E2E_USER = {
  id: 'user-e2e-1',
  email: E2E_ACCOUNT.email,
  name: 'E2E Tester',
  avatar: null,
  roles: ['admin'],
  permissions: [],
} as const;

/** `unavailable` → 503 · `offline` → request bị cắt (mất mạng). Cả hai là "không hỏi được máy chủ", KHÁC với 401. */
type RefreshFault = 'unavailable' | 'offline';

const COOKIE_VALUE = 'e2e-refresh-token';

const sessionPayload = () => ({ data: { accessToken: E2E_ACCESS_TOKEN, user: E2E_USER } });

export class FakeApi {
  readonly calls = { login: 0, refresh: 0, logout: 0 };
  readonly unhandled: string[] = [];
  /** Đặt trước khi trang gọi refresh; `null` = máy chủ khoẻ. */
  refreshFault: RefreshFault | null = null;

  private serverSession = false;
  private readonly context: BrowserContext;

  private constructor(context: BrowserContext) {
    this.context = context;
  }

  static async install(context: BrowserContext): Promise<FakeApi> {
    const api = new FakeApi(context);
    await context.route(
      (url) => url.pathname.startsWith('/api/'),
      (route) => api.handle(route),
    );
    return api;
  }

  /** Người đã đăng nhập từ trước: máy chủ còn phiên + trình duyệt đã có cookie — vào thẳng vùng riêng tư, không qua form. */
  async seedReturningVisitor(): Promise<void> {
    this.serverSession = true;
    await this.context.addCookies([
      { name: SESSION_COOKIE, value: COOKIE_VALUE, url: BASE_URL, httpOnly: true, sameSite: 'Lax' },
    ]);
  }

  /** Máy chủ thu hồi phiên (hết hạn / bị khoá) nhưng trình duyệt vẫn giữ cookie cũ — refresh trả 401. */
  expireServerSession(): void {
    this.serverSession = false;
  }

  async hasSessionCookie(): Promise<boolean> {
    const cookies = await this.context.cookies(BASE_URL);
    return cookies.some((cookie) => cookie.name === SESSION_COOKIE);
  }

  private handle(route: Route): Promise<void> {
    const request = route.request();
    const endpoint = `${request.method()} ${new URL(request.url()).pathname.replace(/^\/api/, '')}`;

    switch (endpoint) {
      case 'POST /auth/login':
        return this.login(route);
      case 'POST /auth/refresh':
        return this.refresh(route);
      case 'POST /auth/logout':
        return this.logout(route);
      default:
        this.unhandled.push(endpoint);
        return route.fulfill({ status: 501, json: { message: `FakeApi chưa giả ${endpoint}` } });
    }
  }

  private async login(route: Route): Promise<void> {
    this.calls.login += 1;
    const body = route.request().postDataJSON() as { email?: string; password?: string } | null;
    if (body?.email !== E2E_ACCOUNT.email || body?.password !== E2E_ACCOUNT.password) {
      return route.fulfill({ status: 401, json: { message: 'Sai tài khoản hoặc mật khẩu' } });
    }

    this.serverSession = true;
    return route.fulfill({
      status: 200,
      headers: {
        'set-cookie': `${SESSION_COOKIE}=${COOKIE_VALUE}; Path=/; HttpOnly; SameSite=Lax`,
      },
      json: sessionPayload(),
    });
  }

  private refresh(route: Route): Promise<void> {
    this.calls.refresh += 1;
    if (this.refreshFault === 'offline') return route.abort('connectionreset');
    if (this.refreshFault === 'unavailable') {
      return route.fulfill({ status: 503, json: { message: 'Đang bảo trì' } });
    }
    if (!this.serverSession) return route.fulfill({ status: 401, json: { message: 'Hết phiên' } });
    return route.fulfill({ status: 200, json: sessionPayload() });
  }

  private logout(route: Route): Promise<void> {
    this.calls.logout += 1;
    this.serverSession = false;
    return route.fulfill({
      status: 204,
      headers: {
        'set-cookie': `${SESSION_COOKIE}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`,
      },
    });
  }
}

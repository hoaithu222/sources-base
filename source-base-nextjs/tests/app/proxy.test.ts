import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const SESSION_COOKIE = 'sbc_session';
const ORIGIN = 'http://localhost:3000';

type ProxyModule = typeof import('@/proxy');

interface ProxyEnv {
  mode: 'app' | 'demo';
  authEnabled?: string;
}

/** `proxy.ts` đọc env MỘT lần lúc nạp module nên mỗi kịch bản nạp lại module sau khi đặt env. */
async function loadProxy({ mode, authEnabled = '' }: ProxyEnv): Promise<ProxyModule> {
  vi.resetModules();
  vi.stubEnv('NEXT_PUBLIC_APP_MODE', mode);
  vi.stubEnv('NEXT_PUBLIC_AUTH_ENABLED', authEnabled);
  vi.stubEnv('AUTH_SESSION_COOKIE', SESSION_COOKIE);
  return import('@/proxy');
}

function request(path: string, cookies: Record<string, string> = {}): NextRequest {
  const cookie = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  return new NextRequest(`${ORIGIN}${path}`, { headers: cookie ? { cookie } : {} });
}

function redirectOf(response: Response): URL | null {
  const location = response.headers.get('location');
  return location ? new URL(location, ORIGIN) : null;
}

afterEach(() => vi.unstubAllEnvs());

describe('proxy — chế độ app (bật kiểm đăng nhập)', () => {
  let proxy: ProxyModule['default'];

  beforeEach(async () => {
    ({ default: proxy } = await loadProxy({ mode: 'app' }));
  });

  it('route cần đăng nhập, không có cookie phiên → 307 về /login?next=<đường định vào>', () => {
    const response = proxy(request('/dashboard'));

    expect(response.status).toBe(307);
    const target = redirectOf(response);
    expect(target?.pathname).toBe('/login');
    expect(target?.searchParams.get('next')).toBe('/dashboard');
  });

  it('`next` được mã hoá trong URL đích', () => {
    const location = proxy(request('/settings?tab=2')).headers.get('location');

    expect(location).toContain(`next=${encodeURIComponent('/settings?tab=2')}`);
  });

  it('giữ nguyên query của đường định vào trong `next`', () => {
    const target = redirectOf(proxy(request('/settings?tab=2&x=a%20b')));

    expect(target?.pathname).toBe('/login');
    expect(target?.searchParams.get('next')).toBe('/settings?tab=2&x=a%20b');
  });

  it('route con của vùng riêng tư cũng bị chặn', () => {
    const target = redirectOf(proxy(request('/demo/anything/deep')));

    expect(target?.pathname).toBe('/login');
    expect(target?.searchParams.get('next')).toBe('/demo/anything/deep');
  });

  it('tiền tố ngôn ngữ: /en/dashboard → /en/login?next=/dashboard (next KHÔNG mang /en)', () => {
    const target = redirectOf(proxy(request('/en/dashboard?tab=1')));

    expect(target?.pathname).toBe('/en/login');
    expect(target?.searchParams.get('next')).toBe('/dashboard?tab=1');
  });

  it('cookie ngôn ngữ en (URL không tiền tố) → đích đăng nhập có tiền tố /en', () => {
    const target = redirectOf(proxy(request('/profile', { NEXT_LOCALE: 'en' })));

    expect(target?.pathname).toBe('/en/login');
    expect(target?.searchParams.get('next')).toBe('/profile');
  });

  it('cookie ngôn ngữ không hợp lệ → rơi về ngôn ngữ mặc định (không tiền tố)', () => {
    const target = redirectOf(proxy(request('/profile', { NEXT_LOCALE: 'xx' })));

    expect(target?.pathname).toBe('/login');
  });

  it.each([
    ['/vi/about', '/about'],
    ['/vi', '/'],
    ['/vi/dashboard', '/dashboard'],
  ])(
    'tiền tố ngôn ngữ MẶC ĐỊNH %s (LocaleSwitcher sinh ra) → chuyển về URL chuẩn %s, KHÔNG render',
    (path, canonical) => {
      const response = proxy(request(path));

      expect(response.status).toBe(307);
      expect(redirectOf(response)?.pathname).toBe(canonical);
      expect(response.headers.get('x-middleware-rewrite')).toBeNull();
    },
  );

  it('có cookie phiên → không chuyển về /login, giao cho next-intl', () => {
    const response = proxy(request('/dashboard', { [SESSION_COOKIE]: 'abc' }));

    expect(redirectOf(response)).toBeNull();
    expect(response.headers.get('x-middleware-rewrite')).toContain('/vi/dashboard');
  });

  it('cookie mang TÊN khác AUTH_SESSION_COOKIE không được tính là có phiên', () => {
    const target = redirectOf(proxy(request('/dashboard', { refresh_token: 'abc' })));

    expect(target?.pathname).toBe('/login');
  });

  it.each(['/login', '/register', '/forgot-password', '/reset-password'])(
    'trang khách %s KHÔNG bị proxy chuyển đi, kể cả khi có cookie phiên (việc đó của GuestGate)',
    (path) => {
      const withAndWithoutSession: Record<string, string>[] = [{}, { [SESSION_COOKIE]: 'abc' }];
      for (const cookies of withAndWithoutSession) {
        const response = proxy(request(path, cookies));
        expect(redirectOf(response)).toBeNull();
        expect(response.headers.get('x-middleware-rewrite')).toContain(path);
      }
    },
  );

  it.each(['/about', '/403', '/en/about'])('trang công khai %s không bị chặn', (path) => {
    expect(redirectOf(proxy(request(path)))).toBeNull();
  });

  it('⛔ `?next` trong URL đến không biến thành open-redirect: đích luôn nằm trong chính site', () => {
    const attacks = ['//evil.example', '/\\evil.example', 'https://evil.example'];

    for (const attack of attacks) {
      const target = redirectOf(proxy(request(`/dashboard?next=${encodeURIComponent(attack)}`)));

      expect(target?.origin).toBe(ORIGIN);
      expect(target?.pathname).toBe('/login');
      expect(target?.searchParams.get('next')).toBe(
        `/dashboard?next=${encodeURIComponent(attack)}`,
      );
    }
  });

  it('⛔ đường định vào dạng `//host` không dựng được redirect ra ngoài site', () => {
    const target = redirectOf(proxy(request('/dashboard//evil.example')));

    expect(target?.origin).toBe(ORIGIN);
    expect(target?.searchParams.get('next')?.startsWith('//')).toBe(false);
  });
});

describe('proxy — kiểm đăng nhập tắt', () => {
  it('chế độ demo (authEnabled mặc định false) không bao giờ chuyển về /login', async () => {
    const { default: proxy } = await loadProxy({ mode: 'demo' });

    for (const path of ['/dashboard', '/en/settings', '/demo/x']) {
      expect(redirectOf(proxy(request(path)))).toBeNull();
    }
  });

  it('chế độ app nhưng NEXT_PUBLIC_AUTH_ENABLED=false → không chặn', async () => {
    const { default: proxy } = await loadProxy({ mode: 'app', authEnabled: 'false' });

    expect(redirectOf(proxy(request('/dashboard')))).toBeNull();
  });

  it('chế độ demo nhưng NEXT_PUBLIC_AUTH_ENABLED=true → chặn như app', async () => {
    const { default: proxy } = await loadProxy({ mode: 'demo', authEnabled: 'true' });

    expect(redirectOf(proxy(request('/dashboard')))?.pathname).toBe('/login');
  });
});

describe('proxy — config.matcher', () => {
  async function matcher(): Promise<RegExp> {
    const { config } = await loadProxy({ mode: 'app' });
    expect(config.matcher).toHaveLength(1);
    return new RegExp(`^${config.matcher[0]}$`);
  }

  it.each(['/', '/dashboard', '/en/about', '/login', '/en', '/demo/library'])(
    'khớp route trang %s',
    async (path) => {
      expect((await matcher()).test(path)).toBe(true);
    },
  );

  it.each([
    '/api/health',
    '/api/auth/refresh',
    '/trpc/x',
    '/_next/static/chunk.js',
    '/_next/image',
    '/_vercel/insights/script.js',
    '/favicon.svg',
    '/robots.txt',
    '/sitemap.xml',
    '/icons/icon-192.png',
    '/en/opengraph-image.png',
  ])('bỏ qua %s', async (path) => {
    expect((await matcher()).test(path)).toBe(false);
  });
});

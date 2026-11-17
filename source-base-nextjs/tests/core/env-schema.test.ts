/**
 * Schema biến môi trường — ba ca bản đọc env cũ để lọt, biến chỉ có ở server, và điều kiện chặn build.
 */

import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SITE_URL,
  EnvValidationError,
  findProductionIssues,
  parseAppEnv,
  parseServerEnv,
} from '@/core/config/env.schema';

/** Cấu hình production đầy đủ — mỗi bài kiểm bỏ ĐÚNG một biến để thấy đúng một lỗi. */
const FULL_APP = {
  NEXT_PUBLIC_API_BASE_URL: '/api',
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
};

describe('parseAppEnv', () => {
  it('không khai gì → mặc định an toàn của một ứng dụng thật', () => {
    expect(parseAppEnv({})).toMatchObject({
      appName: 'Base App',
      isDemo: false,
      siteUrl: DEFAULT_SITE_URL,
      siteUrlExplicit: false,
      apiBaseUrl: '/api',
      apiBaseUrlExplicit: false,
      apiTimeout: 30_000,
      enableErrorToast: true,
      enableApiLogging: false,
      // Chế độ `app` BẬT kiểm đăng nhập khi không ai nói gì.
      authEnabled: true,
    });
  });

  it('⛔ chuỗi RỖNG (chép từ .env.example) được coi là "không khai"', () => {
    const env = parseAppEnv({
      NEXT_PUBLIC_APP_NAME: '',
      NEXT_PUBLIC_SITE_URL: '',
      NEXT_PUBLIC_API_BASE_URL: '   ',
      NEXT_PUBLIC_API_TIMEOUT: '',
      NEXT_PUBLIC_AUTH_ENABLED: '',
    });
    expect(env.appName).toBe('Base App');
    expect(env.siteUrl).toBe(DEFAULT_SITE_URL);
    expect(env.siteUrlExplicit).toBe(false);
    expect(env.apiBaseUrl).toBe('/api');
    expect(env.apiTimeout).toBe(30_000);
    expect(env.authEnabled).toBe(true);
  });

  it('chế độ demo TẮT kiểm đăng nhập sẵn — nhưng bật tường minh thì vẫn bật', () => {
    expect(parseAppEnv({ NEXT_PUBLIC_APP_MODE: 'demo' }).authEnabled).toBe(false);
    expect(
      parseAppEnv({ NEXT_PUBLIC_APP_MODE: 'demo', NEXT_PUBLIC_AUTH_ENABLED: 'true' }).authEnabled,
    ).toBe(true);
  });

  it('bỏ dấu `/` cuối của gốc API', () => {
    expect(
      parseAppEnv({ NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com/api/' }).apiBaseUrl,
    ).toBe('https://api.example.com/api');
  });

  it('gốc site khai tường minh được giữ nguyên và đánh dấu `siteUrlExplicit`', () => {
    const env = parseAppEnv({ NEXT_PUBLIC_SITE_URL: 'https://example.com' });
    expect(env.siteUrl).toBe('https://example.com');
    expect(env.siteUrlExplicit).toBe(true);
  });

  it('cờ nhận cả `1` / `0`', () => {
    const env = parseAppEnv({
      NEXT_PUBLIC_ENABLE_API_LOGGING: '1',
      NEXT_PUBLIC_ENABLE_ERROR_TOAST: '0',
    });
    expect(env.enableApiLogging).toBe(true);
    expect(env.enableErrorToast).toBe(false);
  });

  it.each([
    ['NEXT_PUBLIC_API_TIMEOUT', '30000abc'],
    ['NEXT_PUBLIC_API_TIMEOUT', '0'],
    ['NEXT_PUBLIC_API_TIMEOUT', '-5'],
    ['NEXT_PUBLIC_API_TIMEOUT', '1.5'],
    // Gõ nhầm `true` — bản cũ âm thầm coi là false, tức TẮT kiểm đăng nhập.
    ['NEXT_PUBLIC_AUTH_ENABLED', 'ture'],
    ['NEXT_PUBLIC_ENABLE_API_LOGGING', 'yes'],
    ['NEXT_PUBLIC_APP_MODE', 'production'],
    ['NEXT_PUBLIC_API_BASE_URL', 'api.example.com'],
    // Gốc site KHÔNG kèm đường dẫn — canonical/hreflang ghép thêm `/<locale>/…` lên trên.
    ['NEXT_PUBLIC_SITE_URL', 'https://example.com/vi'],
    ['NEXT_PUBLIC_SITE_URL', 'example.com'],
  ])('⛔ %s=%s → từ chối, nêu đúng tên biến', (key, value) => {
    expect(() => parseAppEnv({ [key]: value })).toThrow(EnvValidationError);
    expect(() => parseAppEnv({ [key]: value })).toThrow(key);
  });

  it('⛔ tên biến cũ của Vite (`VITE_*`) không còn được đọc', () => {
    expect(parseAppEnv({ VITE_APP_MODE: 'demo', VITE_API_TIMEOUT: 'abc' })).toMatchObject({
      isDemo: false,
      apiTimeout: 30_000,
    });
  });

  it('liệt kê MỌI biến sai trong một lần, không dừng ở biến đầu', () => {
    try {
      parseAppEnv({ NEXT_PUBLIC_API_TIMEOUT: 'abc', NEXT_PUBLIC_AUTH_ENABLED: 'ture' });
      expect.unreachable();
    } catch (error) {
      expect((error as EnvValidationError).issues).toHaveLength(2);
    }
  });
});

describe('parseServerEnv', () => {
  it('không khai gì → mặc định phát triển', () => {
    expect(parseServerEnv({})).toEqual({
      apiProxyTarget: 'http://localhost:5000',
      authSessionCookie: 'refresh_token',
      allowIndexing: false,
      googleSiteVerification: undefined,
      bingSiteVerification: undefined,
      vercelProductionHost: undefined,
    });
  });

  it('bỏ dấu `/` cuối của đích proxy, chuỗi rỗng = không khai', () => {
    expect(parseServerEnv({ API_PROXY_TARGET: 'https://api.example.com/' }).apiProxyTarget).toBe(
      'https://api.example.com',
    );
    expect(parseServerEnv({ API_PROXY_TARGET: '  ' }).apiProxyTarget).toBe('http://localhost:5000');
    expect(parseServerEnv({ AUTH_SESSION_COOKIE: '' }).authSessionCookie).toBe('refresh_token');
  });

  it('đọc mã xác minh công cụ tìm kiếm và host production của Vercel', () => {
    expect(
      parseServerEnv({
        GOOGLE_SITE_VERIFICATION: 'g-token',
        BING_SITE_VERIFICATION: 'b-token',
        VERCEL_PROJECT_PRODUCTION_URL: 'app.example.com',
      }),
    ).toMatchObject({
      googleSiteVerification: 'g-token',
      bingSiteVerification: 'b-token',
      vercelProductionHost: 'app.example.com',
    });
  });

  it.each([
    ['API_PROXY_TARGET', 'localhost:5000'],
    ['SEO_ALLOW_INDEXING', 'maybe'],
  ])('⛔ %s=%s → từ chối, nêu đúng tên biến', (key, value) => {
    expect(() => parseServerEnv({ [key]: value })).toThrow(EnvValidationError);
    expect(() => parseServerEnv({ [key]: value })).toThrow(key);
  });

  describe('allowIndexing — suy từ môi trường triển khai', () => {
    it.each([
      // Ngoài Vercel: theo NODE_ENV.
      [{ NODE_ENV: 'production' }, true],
      [{ NODE_ENV: 'development' }, false],
      [{ NODE_ENV: 'test' }, false],
      [{}, false],
      // Trên Vercel: VERCEL_ENV thắng NODE_ENV (preview build cũng có NODE_ENV=production).
      [{ VERCEL_ENV: 'production', NODE_ENV: 'production' }, true],
      [{ VERCEL_ENV: 'preview', NODE_ENV: 'production' }, false],
      [{ VERCEL_ENV: 'development', NODE_ENV: 'development' }, false],
    ])('%j → %s', (raw, expected) => {
      expect(parseServerEnv(raw).allowIndexing).toBe(expected);
    });

    it('SEO_ALLOW_INDEXING khai tường minh thắng mọi suy luận', () => {
      expect(
        parseServerEnv({ NODE_ENV: 'production', SEO_ALLOW_INDEXING: 'false' }).allowIndexing,
      ).toBe(false);
      expect(
        parseServerEnv({ VERCEL_ENV: 'preview', SEO_ALLOW_INDEXING: 'true' }).allowIndexing,
      ).toBe(true);
      expect(parseServerEnv({ SEO_ALLOW_INDEXING: '1' }).allowIndexing).toBe(true);
      expect(
        parseServerEnv({ VERCEL_ENV: 'production', SEO_ALLOW_INDEXING: '0' }).allowIndexing,
      ).toBe(false);
    });
  });
});

describe('findProductionIssues — điều kiện build production', () => {
  const server = parseServerEnv({});

  it('chế độ demo không bị ràng buộc', () => {
    expect(findProductionIssues(parseAppEnv({ NEXT_PUBLIC_APP_MODE: 'demo' }), server)).toEqual([]);
  });

  it('⛔ ứng dụng thật mà tắt kiểm đăng nhập → chặn', () => {
    const issues = findProductionIssues(
      parseAppEnv({ ...FULL_APP, NEXT_PUBLIC_AUTH_ENABLED: 'false' }),
      server,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('NEXT_PUBLIC_AUTH_ENABLED');
  });

  it('⛔ ứng dụng thật mà không khai gốc API → chặn', () => {
    const issues = findProductionIssues(
      parseAppEnv({ NEXT_PUBLIC_SITE_URL: FULL_APP.NEXT_PUBLIC_SITE_URL }),
      server,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('NEXT_PUBLIC_API_BASE_URL');
  });

  it('⛔ ứng dụng thật mà không khai gốc site → chặn (canonical sẽ trỏ về localhost)', () => {
    const issues = findProductionIssues(
      parseAppEnv({ NEXT_PUBLIC_API_BASE_URL: FULL_APP.NEXT_PUBLIC_API_BASE_URL }),
      server,
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('NEXT_PUBLIC_SITE_URL');
    expect(issues[0]).toContain(DEFAULT_SITE_URL);
  });

  it('gốc site thiếu nhưng Vercel đã cấp host production → qua', () => {
    const onVercel = parseServerEnv({ VERCEL_PROJECT_PRODUCTION_URL: 'app.example.com' });
    expect(
      findProductionIssues(
        parseAppEnv({ NEXT_PUBLIC_API_BASE_URL: FULL_APP.NEXT_PUBLIC_API_BASE_URL }),
        onVercel,
      ),
    ).toEqual([]);
  });

  it('thiếu cả ba → liệt kê đủ ba lỗi một lần', () => {
    const issues = findProductionIssues(parseAppEnv({ NEXT_PUBLIC_AUTH_ENABLED: 'false' }), server);
    expect(issues).toHaveLength(3);
  });

  it('đủ cấu hình → qua', () => {
    expect(findProductionIssues(parseAppEnv(FULL_APP), server)).toEqual([]);
  });
});

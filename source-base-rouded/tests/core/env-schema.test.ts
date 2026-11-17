/**
 * Schema biến môi trường — ba ca bản đọc env cũ để lọt, và điều kiện chặn build.
 */

import { describe, expect, it } from 'vitest';

import { EnvValidationError, findProductionIssues, parseAppEnv } from '@/core/config/env.schema';

describe('parseAppEnv', () => {
  it('không khai gì → mặc định an toàn của một ứng dụng thật', () => {
    expect(parseAppEnv({})).toMatchObject({
      appName: 'Base App',
      isDemo: false,
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
      VITE_APP_NAME: '',
      VITE_API_BASE_URL: '   ',
      VITE_API_TIMEOUT: '',
      VITE_AUTH_ENABLED: '',
    });
    expect(env.appName).toBe('Base App');
    expect(env.apiBaseUrl).toBe('/api');
    expect(env.apiTimeout).toBe(30_000);
    expect(env.authEnabled).toBe(true);
  });

  it('chế độ demo TẮT kiểm đăng nhập sẵn — nhưng bật tường minh thì vẫn bật', () => {
    expect(parseAppEnv({ VITE_APP_MODE: 'demo' }).authEnabled).toBe(false);
    expect(parseAppEnv({ VITE_APP_MODE: 'demo', VITE_AUTH_ENABLED: 'true' }).authEnabled).toBe(
      true,
    );
  });

  it('bỏ dấu `/` cuối của gốc API', () => {
    expect(parseAppEnv({ VITE_API_BASE_URL: 'https://api.example.com/api/' }).apiBaseUrl).toBe(
      'https://api.example.com/api',
    );
  });

  it.each([
    ['VITE_API_TIMEOUT', '30000abc'],
    ['VITE_API_TIMEOUT', '0'],
    ['VITE_API_TIMEOUT', '-5'],
    ['VITE_API_TIMEOUT', '1.5'],
    // Gõ nhầm `true` — bản cũ âm thầm coi là false, tức TẮT kiểm đăng nhập.
    ['VITE_AUTH_ENABLED', 'ture'],
    ['VITE_ENABLE_API_LOGGING', 'yes'],
    ['VITE_APP_MODE', 'production'],
    ['VITE_API_BASE_URL', 'api.example.com'],
  ])('⛔ %s=%s → từ chối, nêu đúng tên biến', (key, value) => {
    expect(() => parseAppEnv({ [key]: value })).toThrow(EnvValidationError);
    expect(() => parseAppEnv({ [key]: value })).toThrow(key);
  });

  it('liệt kê MỌI biến sai trong một lần, không dừng ở biến đầu', () => {
    try {
      parseAppEnv({ VITE_API_TIMEOUT: 'abc', VITE_AUTH_ENABLED: 'ture' });
      expect.unreachable();
    } catch (error) {
      expect((error as EnvValidationError).issues).toHaveLength(2);
    }
  });
});

describe('findProductionIssues — điều kiện build production', () => {
  it('chế độ demo không bị ràng buộc', () => {
    expect(findProductionIssues(parseAppEnv({ VITE_APP_MODE: 'demo' }))).toEqual([]);
  });

  it('⛔ ứng dụng thật mà tắt kiểm đăng nhập → chặn', () => {
    const issues = findProductionIssues(
      parseAppEnv({ VITE_AUTH_ENABLED: 'false', VITE_API_BASE_URL: 'https://api.example.com' }),
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('VITE_AUTH_ENABLED');
  });

  it('⛔ ứng dụng thật mà không khai gốc API → chặn', () => {
    const issues = findProductionIssues(parseAppEnv({}));
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('VITE_API_BASE_URL');
  });

  it('đủ cấu hình → qua', () => {
    expect(findProductionIssues(parseAppEnv({ VITE_API_BASE_URL: '/api' }))).toEqual([]);
  });
});

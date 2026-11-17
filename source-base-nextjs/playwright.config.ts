import { defineConfig, devices } from '@playwright/test';

import { BASE_URL, E2E_PORT, SESSION_COOKIE } from './e2e/support/env';

/**
 * Playwright — browser smoke test chạy trên BẢN BUILD PRODUCTION chế độ app (`docs/rules/foundations/testing.md §8`).
 *
 * `webServer` tự build + start (`scripts/e2e-server.mjs`) vào `.next-e2e` cổng `E2E_PORT`, rồi tắt cả cây tiến trình khi xong.
 * Backend KHÔNG có: mọi `/api/**` do `page.route` giả lập (`e2e/support/fake-api.ts`), nên chỉ kiểm hợp đồng phía frontend.
 *
 * Biến môi trường: `E2E_SKIP_BUILD=1` chạy lại không build · `E2E_REUSE_SERVER=1` (chỉ ngoài CI) dùng lại server đang nghe ở
 * `E2E_PORT` thay vì báo lỗi "cổng đã bị chiếm" · `CI` bật thử lại + báo cáo HTML.
 * Lưu ý: dùng Chrome HỆ THỐNG (`channel: 'chrome'`), không tải trình duyệt — máy dev cần cài Chrome, runner `ubuntu-latest` có sẵn.
 */

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: isCI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE_URL,
    /** `Accept-Language` vi: không thì next-intl nhận `en-US` của Chrome và đưa `/` sang `/en`. */
    locale: 'vi-VN',
    /** Đóng băng hiệu ứng chạy tự động (`usePrefersReducedMotion`) cho số đo / ảnh ổn định. */
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1366, height: 768 },
      },
    },
  ],

  webServer: {
    command: 'node scripts/e2e-server.mjs',
    url: `${BASE_URL}/api/health`,
    /** Build production mất vài phút trên máy chậm — thời gian chờ gồm cả bước build. */
    timeout: 600_000,
    reuseExistingServer: !isCI && process.env.E2E_REUSE_SERVER === '1',
    stdout: isCI ? 'pipe' : 'ignore',
    stderr: 'pipe',
    env: {
      E2E_PORT: String(E2E_PORT),
      AUTH_SESSION_COOKIE: SESSION_COOKIE,
      SEO_ALLOW_INDEXING: 'true',
    },
  },
});

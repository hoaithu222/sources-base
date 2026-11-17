import type { Page } from '@playwright/test';

import { dashboardMarker } from './support/flows';
import { measureOverflow } from './support/layout';
import { vi } from './support/messages';
import { expect, test } from './support/test';

/**
 * Bố cục thật ở ba cỡ màn trên bản production: KHÔNG tràn ngang và không lỗi console (`consoleGuard` trong `test.ts` tự bắt
 * `pageerror` / `console.error`). Đây là lớp tối thiểu của ma trận `docs/rules/display/responsive-screens.md §6` — không thay
 * cho việc chụp đủ 36 cỡ khi đổi giao diện. Máy chạm giả lập `isMobile` + `hasTouch` (không thì `touch:` / `phone:` không khớp).
 */

const SCREENS = [
  {
    name: 'điện thoại 390×844',
    use: {
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
    },
  },
  {
    name: 'tablet 820×1180',
    use: {
      viewport: { width: 820, height: 1180 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    },
  },
  {
    name: 'laptop 1366×768',
    use: {
      viewport: { width: 1366, height: 768 },
      isMobile: false,
      hasTouch: false,
      deviceScaleFactor: 1,
    },
  },
];

async function expectNoHorizontalOverflow(page: Page, route: string): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  const report = await measureOverflow(page);
  const where = `${route} — phần tử vượt mép phải: ${JSON.stringify(report.offenders)}`;

  expect(report.page, `tài liệu tràn ngang. ${where}`).toBeLessThanOrEqual(0);
  expect(report.main, `vùng <main> bị cắt ngang. ${where}`).toBeLessThanOrEqual(0);
}

for (const { name, use } of SCREENS) {
  test.describe(name, () => {
    test.use(use);

    test('/ (trang công khai) không tràn ngang', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('h1')).toBeVisible();
      await expectNoHorizontalOverflow(page, '/');
    });

    test('/login không tràn ngang', async ({ page, api }) => {
      await page.goto('/login');
      await expect(page.getByRole('button', { name: vi('auth.login.submit') })).toBeVisible();
      await expect
        .poll(() => api.calls.refresh, { message: 'trang chưa hydrate' })
        .toBeGreaterThan(0);
      await expectNoHorizontalOverflow(page, '/login');
    });

    test('/dashboard (sau đăng nhập) không tràn ngang', async ({ page, api }) => {
      await api.seedReturningVisitor();
      await page.goto('/dashboard');
      await expect(dashboardMarker(page)).toBeVisible();
      await expectNoHorizontalOverflow(page, '/dashboard');
    });
  });
}

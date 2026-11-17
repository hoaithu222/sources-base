import { BASE_URL } from './support/env';
import { submitLoginForm } from './support/flows';
import { vi } from './support/messages';
import { expect, test } from './support/test';

/**
 * Hợp đồng `/demo` ở chế độ app (`architecture.md §15`: "`/demo` = `notFound()`"). Hành vi THỰC TẾ có hai lớp:
 *
 *   - `/demo` nằm trong `PROTECTED_PATH_PREFIXES` nên `proxy.ts` chạy TRƯỚC: người chưa đăng nhập nhận chuyển hướng về
 *     `/login?next=%2Fdemo`, không bao giờ thấy 404 (và cũng không biết route có tồn tại hay không).
 *   - Người đã đăng nhập mới tới `page.tsx` → `notFound()` → màn "không tìm thấy" + `noindex`, không có thư viện UI. HTTP status
 *     là 200 (không phải 404) vì trang được prerender — soft 404 đã ghi ở `known-issues.md`.
 */

const notFoundTitle = vi('errors.screens.notFound.title');

test.describe('/demo ở chế độ app', () => {
  test('chưa đăng nhập: proxy đưa về /login?next=%2Fdemo (không lộ 404); đăng nhập xong mới gặp 404', async ({
    page,
    api,
    request,
  }) => {
    const redirect = await request.get('/demo', { maxRedirects: 0 });
    expect(redirect.status()).toBe(307);
    expect(new URL(redirect.headers().location ?? '', BASE_URL).pathname).toBe('/login');

    await page.goto('/demo');
    await expect(page).toHaveURL('/login?next=%2Fdemo');
    await expect(page.getByRole('heading', { name: notFoundTitle })).toHaveCount(0);

    await submitLoginForm(page, api);

    await expect(page).toHaveURL('/demo');
    await expect(page.getByRole('heading', { name: notFoundTitle })).toBeVisible();
  });

  test('đã đăng nhập: màn "không tìm thấy" + noindex (HTTP 200 — soft 404 đã biết), không dựng thư viện UI', async ({
    page,
    api,
  }) => {
    await api.seedReturningVisitor();

    const response = await page.goto('/demo');

    /** Thực tế 200, không phải 404: `notFound()` ở trang PRERENDER vẫn trả 200 kèm HTML 404 + noindex — `known-issues.md` §F. Sửa thành 404 thì đổi dòng này. */
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: notFoundTitle })).toBeVisible();
    // Hai thẻ robots (metadata nhóm `(app)` + thẻ do not-found của Next): mọi thẻ đều phải là noindex.
    await expect(page.locator('meta[name="robots"]')).not.toHaveCount(0);
    await expect(page.locator('meta[name="robots"]:not([content*="noindex"])')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: vi('shell.nav.demoLibrary.title') }),
      'không có thư viện UI ở chế độ app',
    ).toHaveCount(0);
  });
});

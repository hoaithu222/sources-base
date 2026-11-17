import { BASE_URL, SESSION_COOKIE } from './support/env';
import { E2E_ACCESS_TOKEN, E2E_USER } from './support/fake-api';
import { dashboardMarker, readLocalStorage, submitLoginForm } from './support/flows';
import { vi } from './support/messages';
import { expect, test } from './support/test';

/**
 * Chế độ app trên bản production: cổng chặn của `proxy.ts` (server) + `AuthGate` / `GuestGate` (client) + vòng đời phiên.
 * Cookie phiên và endpoint lấy từ code thật: `AUTH_SESSION_COOKIE` (`refresh_token`), `/auth/{login,refresh,logout}`
 * (`src/features/auth/api`, `src/domains/session/api`). Backend do `FakeApi` giả — xem `e2e/support/fake-api.ts`.
 */

const SESSION_STORAGE_KEY = 'next-base:auth';

const userMenuTrigger = vi('ui.widgets.header.userMenu.trigger');
const logoutItem = vi('ui.widgets.header.userMenu.logout');
const unavailable = {
  title: vi('errors.screens.sessionUnavailable.title'),
  action: vi('errors.screens.sessionUnavailable.action'),
};

/** `location` của một phản hồi chuyển hướng, bỏ gốc (host chứa cổng e2e) — chỉ so đường + query. */
function redirectTarget(location: string | undefined): string {
  const url = new URL(location ?? '', BASE_URL);
  return `${url.pathname}${url.search}`;
}

test.describe('proxy.ts chặn sớm vùng riêng tư (chưa có cookie phiên)', () => {
  const cases = [
    { from: '/dashboard', to: '/login?next=%2Fdashboard' },
    { from: '/dashboard?tab=recent', to: '/login?next=%2Fdashboard%3Ftab%3Drecent' },
    { from: '/settings', to: '/login?next=%2Fsettings' },
    { from: '/en/dashboard', to: '/en/login?next=%2Fdashboard' },
  ];

  for (const { from, to } of cases) {
    test(`${from} → 307 ${to}`, async ({ request }) => {
      const response = await request.get(from, { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      expect(redirectTarget(response.headers().location)).toBe(to);
    });
  }

  test('có cookie phiên (không kiểm chữ ký) thì proxy cho qua; trang khách không bị chặn', async ({
    request,
  }) => {
    const withCookie = await request.get('/dashboard', {
      maxRedirects: 0,
      headers: { cookie: `${SESSION_COOKIE}=bat-ky-gia-tri` },
    });
    expect(withCookie.status()).toBe(200);

    const guestPage = await request.get('/login', {
      maxRedirects: 0,
      headers: { cookie: `${SESSION_COOKIE}=bat-ky-gia-tri` },
    });
    expect(guestPage.status(), 'proxy không đẩy người có cookie khỏi /login (tránh vòng lặp)').toBe(
      200,
    );
  });
});

test.describe('đăng nhập · khôi phục · đăng xuất', () => {
  test('chưa có phiên: /dashboard → /login?next → đăng nhập quay lại đúng trang, token chỉ ở bộ nhớ', async ({
    page,
    api,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login?next=%2Fdashboard');
    await expect(page.getByRole('button', { name: vi('auth.login.submit') })).toBeVisible();

    await submitLoginForm(page, api);

    await expect(page).toHaveURL('/dashboard');
    await expect(dashboardMarker(page)).toBeVisible();
    expect(api.calls.login).toBe(1);
    expect(await api.hasSessionCookie(), 'cookie phiên do BE đặt').toBe(true);

    const storage = await readLocalStorage(page);
    expect(storage[SESSION_STORAGE_KEY], 'hồ sơ được lưu để dựng lại giao diện').toContain(
      E2E_USER.email,
    );
    expect(JSON.stringify(storage), 'access token KHÔNG được vào localStorage').not.toContain(
      E2E_ACCESS_TOKEN,
    );
  });

  test('tải lại trang giữ phiên (một lượt refresh), không nháy về login', async ({ page, api }) => {
    await api.seedReturningVisitor();
    await page.goto('/dashboard');
    await expect(dashboardMarker(page)).toBeVisible();
    const refreshesBeforeReload = api.calls.refresh;

    await page.reload();

    await expect(dashboardMarker(page)).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
    expect(api.calls.refresh).toBeGreaterThan(refreshesBeforeReload);
    await expect(page.getByRole('button', { name: userMenuTrigger })).toBeVisible();
  });

  test('đăng xuất: về /login (không ?next), cookie + dữ liệu tài khoản biến mất, vùng riêng tư bị chặn lại', async ({
    page,
    api,
  }) => {
    await api.seedReturningVisitor();
    await page.goto('/dashboard');
    await expect(dashboardMarker(page)).toBeVisible();

    await page.getByRole('button', { name: userMenuTrigger }).click();
    await expect(page.getByRole('menu')).toContainText(E2E_USER.email);
    await page.getByRole('menuitem', { name: logoutItem }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: vi('auth.login.submit') })).toBeVisible();
    expect(api.calls.logout).toBe(1);
    expect(await api.hasSessionCookie()).toBe(false);

    await expect(page.locator('body')).not.toContainText(E2E_USER.email);
    const stored = JSON.parse((await readLocalStorage(page))[SESSION_STORAGE_KEY] ?? 'null') as {
      state: { user: unknown };
    } | null;
    expect(stored?.state.user ?? null, 'hồ sơ đã lưu bị xoá').toBeNull();

    const gated = await page.request.get('/dashboard', { maxRedirects: 0 });
    expect(gated.status(), 'mất cookie là proxy chặn lại').toBe(307);
  });
});

test.describe('khôi phục phiên: không hỏi được máy chủ KHÁC với hết hạn', () => {
  const outages = [
    { name: '503 (bảo trì)', fault: 'unavailable' as const },
    { name: 'mất mạng (request bị cắt)', fault: 'offline' as const },
  ];

  for (const { name, fault } of outages) {
    test(`${name}: màn "thử lại", GIỮ URL, bấm thử lại khi máy chủ khoẻ lại thì vào được`, async ({
      page,
      api,
    }) => {
      await api.seedReturningVisitor();
      api.refreshFault = fault;

      await page.goto('/dashboard');

      await expect(page.getByRole('heading', { name: unavailable.title })).toBeVisible();
      await expect(page).toHaveURL('/dashboard');
      await expect(page.getByRole('button', { name: vi('auth.login.submit') })).toHaveCount(0);

      api.refreshFault = null;
      await page.getByRole('button', { name: unavailable.action }).click();

      await expect(dashboardMarker(page)).toBeVisible();
      await expect(page).toHaveURL('/dashboard');
    });
  }

  test('401 (hết hạn): về /login?next=… ngay, KHÔNG có màn "thử lại"', async ({ page, api }) => {
    await api.seedReturningVisitor();
    api.expireServerSession();

    await page.goto('/dashboard');

    await expect(page).toHaveURL('/login?next=%2Fdashboard');
    await expect(page.getByRole('button', { name: vi('auth.login.submit') })).toBeVisible();
    await expect(page.getByRole('heading', { name: unavailable.title })).toHaveCount(0);
  });
});

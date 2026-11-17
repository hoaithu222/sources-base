/**
 * Smoke khởi động app — dựng THẬT cả cây provider + guard + khung shell trong jsdom, đúng thứ tự của route
 * `[locale]/layout` → `(workspace)/layout` → `(app)/layout`.
 *
 * Bắt thứ `tsc` không thấy: import vòng, thiếu provider, guard chuyển hướng sai, barrel trỏ vào file rỗng — "typecheck sạch +
 * build xong" vẫn có thể ra màn hình trắng.
 *
 * Kiểm CẢ HAI chế độ của `appConfig.authEnabled` vì hai chế độ cho hai đường khác nhau:
 *   - TẮT (demo) → vào thẳng khung shell, KHÔNG gọi mạng.
 *   - BẬT (app)  → chưa đăng nhập thì `AuthGate` đưa về /login; còn phiên thì vào khung.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_MEDIA_QUERY } from '@/shared/constants/media-query.constants';
import { navigationMock } from '@tests/helpers/navigation-mock';
import type { MockHandler } from '@tests/helpers/http-mock';

vi.mock('@/domains/session/lifecycle/session.sync', () => ({
  broadcastSessionSignal: vi.fn(),
  subscribeSessionSignals: vi.fn(() => vi.fn()),
}));

const USER = {
  id: 'u1',
  email: 'an@congty.vn',
  name: 'Nguyễn Văn An',
  roles: [],
  permissions: [],
};

const originalMatchMedia = window.matchMedia;
let restoreHttp: () => void = () => {};

/** `matchMedia` giả: chỉ khớp query điện thoại khi `phone` — hai bố cục khác nhau (Header + Dock ⇄ top bar + tab bar). */
function mockViewport({ phone }: { phone: boolean }) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: phone && query === PHONE_MEDIA_QUERY,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

/**
 * `appConfig` đọc env MỘT lần lúc nạp module, nên đổi chế độ bằng cách nạp lại module sau khi thay `@/core/config`. Mọi thứ phải
 * nạp SAU `resetModules` — kể cả `IntlWrapper`, nếu không provider và component dùng hai bản `next-intl` khác nhau.
 */
async function mountApp({
  authEnabled,
  http,
}: {
  authEnabled: boolean;
  http?: MockHandler;
}): Promise<{ http: ReturnType<typeof vi.fn<MockHandler>> }> {
  vi.resetModules();
  const actual = await vi.importActual<typeof import('@/core/config')>('@/core/config');
  vi.doMock('@/core/config', () => ({
    ...actual,
    appConfig: { ...actual.appConfig, authEnabled },
  }));

  const spy = vi.fn<MockHandler>(http ?? (() => ({ status: 200, data: {} })));
  const { mockHttp } = await import('@tests/helpers/http-mock');
  restoreHttp = mockHttp(spy);

  const [{ IntlWrapper }, { AppProviders, BaseProviders }, { AuthGate }, { AppShellLayout }] =
    await Promise.all([
      import('@tests/helpers/render'),
      import('@/app/_providers'),
      import('@/app/_guards'),
      import('@/app/_layouts'),
    ]);

  render(
    <IntlWrapper>
      <BaseProviders>
        <AppProviders>
          <AuthGate>
            <AppShellLayout>
              <h1>Trang thử</h1>
            </AppShellLayout>
          </AuthGate>
        </AppProviders>
      </BaseProviders>
    </IntlWrapper>,
  );
  return { http: spy };
}

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  window.history.replaceState({}, '', '/dashboard');
  navigationMock.setLocation('/dashboard');
  mockViewport({ phone: false });
});

afterEach(() => {
  restoreHttp();
  restoreHttp = () => {};
  window.matchMedia = originalMatchMedia;
  vi.doUnmock('@/core/config');
});

describe('khởi động app — demo (tắt kiểm đăng nhập)', () => {
  it('dựng khung shell máy tính: liên kết bỏ qua, header, <main id="main-content"> chứa trang, Dock — KHÔNG gọi mạng', async () => {
    const { http } = await mountApp({ authEnabled: false });

    const main = await screen.findByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main).toContainElement(screen.getByRole('heading', { name: 'Trang thử' }));
    expect(screen.getByRole('link', { name: 'Bỏ qua tới nội dung' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(document.querySelector('.dock-shell')).not.toBeNull();
    expect(navigationMock.replace).not.toHaveBeenCalled();
    expect(http).not.toHaveBeenCalled();
  });

  it('điện thoại: top bar + thanh tab đáy thay Header + Dock; vẫn đủ <main> và liên kết bỏ qua', async () => {
    mockViewport({ phone: true });
    await mountApp({ authEnabled: false });

    const main = await screen.findByRole('main');
    expect(main).toHaveAttribute('id', 'main-content');
    expect(screen.getByRole('link', { name: 'Bỏ qua tới nội dung' })).toBeInTheDocument();
    expect(document.querySelector('.dock-shell')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Trang thử' })).toBeInTheDocument();
  });

  it('nạp state đã lưu rồi áp lên <html> (BaseProviders): theme tối trong localStorage → class `dark`', async () => {
    localStorage.setItem(
      'next-base:theme',
      JSON.stringify({ state: { theme: 'dark', accent: 'blue' }, version: 1 }),
    );
    await mountApp({ authEnabled: false });

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));
    expect(document.documentElement.dataset.accent).toBe('blue');
    document.documentElement.classList.remove('dark');
    delete document.documentElement.dataset.accent;
  });
});

describe('khởi động app — bật kiểm đăng nhập', () => {
  it('chưa có phiên (401) → màn chờ rồi replace về /login kèm ?next=, KHÔNG lộ khung shell', async () => {
    const { http } = await mountApp({ authEnabled: true, http: () => ({ status: 401, data: {} }) });

    await waitFor(() =>
      expect(navigationMock.replace).toHaveBeenCalledWith(
        `/login?next=${encodeURIComponent('/dashboard')}`,
      ),
    );
    expect(http).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('main')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Trang thử' })).not.toBeInTheDocument();
  });

  it('còn phiên (refresh thành công) → vào khung shell, không chuyển trang', async () => {
    await mountApp({
      authEnabled: true,
      http: () => ({ status: 200, data: { data: { accessToken: 'token-moi', user: USER } } }),
    });

    expect(await screen.findByRole('heading', { name: 'Trang thử' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });

  it('máy chủ lỗi → màn "thử lại" ngoài khung, giữ URL, không về /login', async () => {
    await mountApp({ authEnabled: true, http: () => ({ status: 503, data: {} }) });

    expect(await screen.findByText('Không kiểm tra được phiên đăng nhập')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Trang thử' })).not.toBeInTheDocument();
    expect(navigationMock.replace).not.toHaveBeenCalled();
  });
});

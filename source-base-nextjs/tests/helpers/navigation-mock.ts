import { vi } from 'vitest';

/**
 * Trạng thái điều hướng GIẢ cho test — `tests/setup.ts` mock `next/navigation` để đọc từ đây; Next Router thật không có trong jsdom.
 *
 *   navigationMock.setLocation('/en/settings', '?tab=2')   đổi pathname + query mà component đang đọc
 *   expect(navigationMock.push).toHaveBeenCalledWith('/dashboard')
 *
 * Lưu ý: `usePathname` trả đường ĐÃ có tiền tố ngôn ngữ như Next thật; next-intl (`@/core/i18n`) tự bỏ tiền tố — nên test vẫn
 * viết `/settings` cho tiếng Việt và `/en/settings` cho tiếng Anh. `reset()` ở `afterEach` của setup.
 */
export const navigationMock = {
  pathname: '/',
  search: '',
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  /** Hook điều hướng giả (`tests/setup.ts`) đăng ký ở đây để component đang mount render lại khi `setLocation` đổi URL — như Next thật. */
  listeners: new Set<() => void>(),

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  setLocation(pathname: string, search = ''): void {
    this.pathname = pathname;
    this.search = search.startsWith('?') || search === '' ? search : `?${search}`;
    this.listeners.forEach((listener) => listener());
  },

  reset(): void {
    this.pathname = '/';
    this.search = '';
    [this.push, this.replace, this.back, this.forward, this.refresh, this.prefetch].forEach((fn) =>
      fn.mockReset(),
    );
  },
};

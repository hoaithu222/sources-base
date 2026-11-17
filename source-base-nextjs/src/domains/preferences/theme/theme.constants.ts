import type { AccentColor, ThemeState } from './theme.types';

/** Theme khi chưa lưu gì, hoặc khi dữ liệu đã lưu không hợp lệ. */
export const THEME_INITIAL_STATE: ThemeState = { theme: 'light', accent: 'vci' };

/** Thứ tự màu nhấn trong Cài đặt — như hàng chấm màu của macOS (VCI đứng đầu, xám cuối). */
export const ACCENT_COLORS = [
  'vci',
  'blue',
  'purple',
  'pink',
  'red',
  'orange',
  'yellow',
  'graphite',
] as const satisfies readonly AccentColor[];

/**
 * Khoá + bản dữ liệu ở localStorage (zustand `persist`) — đổi hình dạng state thì tăng `version`.
 * Khoá có tiền tố `next-base:` để không đụng ứng dụng khác chạy cùng origin (`localhost:3000`); `appearance-script.ts` đọc cùng khoá này.
 */
export const THEME_STORAGE = { key: 'next-base:theme', version: 1 } as const;

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
 * Khoá RIÊNG của `source-base-rouded`: `source-base` (tối HUD) ghi `theme-storage`, `source-base-light` ghi `light-base-theme`,
 * cả hai thường chạy cùng `localhost:5173`; dùng chung khoá là bản này mở ra đúng theme mà người dùng đã chọn ở bản kia.
 */
export const THEME_STORAGE = { key: 'rouded-base-theme', version: 1 } as const;

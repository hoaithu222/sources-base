import type { ThemeState } from './theme.types';

/** Theme khi chưa lưu gì, hoặc khi dữ liệu đã lưu không hợp lệ. */
export const THEME_INITIAL_STATE: ThemeState = { theme: 'dark' };

/** Khoá + bản dữ liệu ở localStorage (zustand `persist`) — đổi hình dạng state thì tăng `version`. */
export const THEME_STORAGE = { key: 'theme-storage', version: 1 } as const;

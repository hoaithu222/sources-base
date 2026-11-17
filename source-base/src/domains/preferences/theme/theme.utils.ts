import type { DisplayMode } from '../display/display.types';

import { THEME_INITIAL_STATE } from './theme.constants';
import type { ThemeMode, ThemeState } from './theme.types';

/** `'light'` / `'dark'` giữ nguyên; giá trị khác → `null` để nơi gọi bỏ qua, không ghi rác vào store. */
export function parseThemeMode(raw: unknown): ThemeMode | null {
  return raw === 'light' || raw === 'dark' ? raw : null;
}

/**
 * Dựng `ThemeState` hợp lệ từ dữ liệu đọc ở localStorage (không tin được): theme lạ về mặc định,
 * field lạ bị bỏ. Không bao giờ ném lỗi.
 */
export function sanitizeThemeState(raw: unknown): ThemeState {
  const { theme } = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<
    Record<keyof ThemeState, unknown>
  >;
  return { theme: parseThemeMode(theme) ?? THEME_INITIAL_STATE.theme };
}

/** Theme ĐANG HIỂN THỊ: chế độ TV luôn tối, ngoài TV là lựa chọn đã lưu. */
export function resolveEffectiveTheme(theme: ThemeMode, mode: DisplayMode): ThemeMode {
  return mode === 'tv' ? 'dark' : theme;
}

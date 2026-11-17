import type { DisplayMode } from '../display/display.types';

import { ACCENT_COLORS, THEME_INITIAL_STATE } from './theme.constants';
import type { AccentColor, ThemeMode, ThemePreference, ThemeState } from './theme.types';

/** `'light'` / `'dark'` / `'system'` giữ nguyên; giá trị khác → `null` để nơi gọi bỏ qua, không ghi rác vào store. */
export function parseThemeMode(raw: unknown): ThemePreference | null {
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null;
}

/** Màu nhấn hợp lệ (`ACCENT_COLORS`) giữ nguyên; giá trị khác → `null`. */
export function parseAccentColor(raw: unknown): AccentColor | null {
  return ACCENT_COLORS.find((accent) => accent === raw) ?? null;
}

/**
 * Dữ liệu theme đã lưu (đầu vào KHÔNG tin cậy) → state hợp lệ: field nào sai thì về mặc định, không vứt cả cục — theme
 * hợp lệ mà màu nhấn rác vẫn giữ theme.
 */
export function sanitizeThemeState(raw: unknown): ThemeState {
  const { theme, accent } = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<
    Record<keyof ThemeState, unknown>
  >;
  return {
    theme: parseThemeMode(theme) ?? THEME_INITIAL_STATE.theme,
    accent: parseAccentColor(accent) ?? THEME_INITIAL_STATE.accent,
  };
}

/** HĐH đang ở giao diện tối (`prefers-color-scheme`); ngoài trình duyệt → `false`. */
export function prefersDarkScheme(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  );
}

/** Theme ĐANG HIỂN THỊ: chế độ TV luôn tối; `system` theo HĐH; còn lại là lựa chọn đã lưu. */
export function resolveEffectiveTheme(
  theme: ThemePreference,
  mode: DisplayMode,
  prefersDark = false,
): ThemeMode {
  if (mode === 'tv') return 'dark';
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

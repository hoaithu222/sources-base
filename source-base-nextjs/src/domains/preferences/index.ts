/**
 * Tuỳ chọn hiển thị của người dùng: giao diện sáng/tối (`theme/`) và chế độ màn hình (`display/`, TV).
 *
 *   const theme = useEffectiveTheme();                         // theme đang hiển thị (TV ép tối)
 *   const uiScale = useDisplayStore(selectEffectiveUiScale);   // hệ số chữ đang áp (1 ngoài TV)
 *
 * Lưu ý: `shared/ui`, `shared/widgets`, `shared/charts` không đọc store này — nhận qua props.
 */

export { useThemeStore } from './theme/theme.store';
export { selectAccentColor, selectThemeMode } from './theme/theme.selectors';
export {
  parseAccentColor,
  parseThemeMode,
  prefersDarkScheme,
  resolveEffectiveTheme,
} from './theme/theme.utils';
export { ACCENT_COLORS } from './theme/theme.constants';
export { useEffectiveTheme } from './useEffectiveTheme';

export { useDisplayStore } from './display/display.store';
export { selectEffectiveUiScale, selectIsTv } from './display/display.selectors';
export { UI_SCALE_VALUES } from './display/display.constants';
export { nextDisplaySearch, parseUiScale, readDisplayOverrides } from './display/display.utils';

export type { AccentColor, ThemeMode, ThemePreference } from './theme/theme.types';
export type {
  DisplayMode,
  DisplayState,
  EffectiveUiScale,
  TvUiScale,
} from './display/display.types';

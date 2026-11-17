import type { ThemeState } from './theme.types';

/** Lựa chọn theme đã lưu. Theme ĐANG HIỂN THỊ (TV ép tối) thì dùng `useEffectiveTheme()`. */
export const selectThemeMode = (state: ThemeState) => state.theme;

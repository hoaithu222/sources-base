/** Theme ĐANG HIỂN THỊ (sau khi quy `system` về sáng / tối và TV ép tối). */
export type ThemeMode = 'light' | 'dark';

/** Lựa chọn ĐÃ LƯU: sáng · tối · `system` = theo hệ điều hành ("Tự động" trong Cài đặt hệ thống của macOS). */
export type ThemePreference = ThemeMode | 'system';

/** Màu nhấn (Accent color của macOS): `vci` = dải màu logo (mặc định); màu khác thay dải `primary-*` của toàn app. */
export type AccentColor =
  'vci' | 'blue' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'graphite';

export interface ThemeState {
  /** Lựa chọn ĐÃ LƯU — theme đang hiển thị có thể khác (`system`, TV ép tối): `useEffectiveTheme`. */
  theme: ThemePreference;
  accent: AccentColor;
}

interface ThemeActions {
  setTheme: (theme: ThemePreference) => void;
  /** Lật theo theme ĐANG HIỂN THỊ (đang `system` mà HĐH tối → chọn sáng). */
  toggleTheme: () => void;
  setAccent: (accent: AccentColor) => void;
}

export type ThemeStoreType = ThemeState & ThemeActions;

export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  /** Lựa chọn ĐÃ LƯU của người dùng — theme đang hiển thị có thể khác (TV ép tối): `useEffectiveTheme`. */
  theme: ThemeMode;
}

interface ThemeActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export type ThemeStoreType = ThemeState & ThemeActions;

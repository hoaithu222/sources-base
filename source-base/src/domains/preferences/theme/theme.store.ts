import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

import { THEME_INITIAL_STATE, THEME_STORAGE } from './theme.constants';
import type { ThemeStoreType } from './theme.types';
import { sanitizeThemeState } from './theme.utils';

/**
 * useThemeStore — lựa chọn theme sáng/tối của người dùng, mặc định dark, persist ở localStorage.
 *
 * Đọc lựa chọn đã lưu bằng `selectThemeMode`; theme ĐANG HIỂN THỊ thì dùng `useEffectiveTheme()`.
 * Lưu ý: TV chỉ ÉP theme hiển thị, không ghi đè lựa chọn này; tắt TV thì theme này được khôi phục.
 * Dữ liệu đã lưu được kiểm lại ở MỖI lần khôi phục (`merge`) lẫn khi đổi version (`migrate`): theme hợp
 * lệ được giữ qua mọi lần tăng `version`, giá trị lạ về dark.
 *
 * @example
 * const toggleTheme = useThemeStore((state) => state.toggleTheme);
 */
export const useThemeStore = create<ThemeStoreType>()(
  persist(
    (set, get) => ({
      ...THEME_INITIAL_STATE,

      setTheme: (theme) => {
        set({ theme });
      },

      toggleTheme: () => {
        set({ theme: get().theme === 'light' ? 'dark' : 'light' });
      },
    }),
    {
      name: THEME_STORAGE.key,
      version: THEME_STORAGE.version,
      storage: createSafeJSONStorage(),
      migrate: sanitizeThemeState,
      merge: (persisted, current) => ({ ...current, ...sanitizeThemeState(persisted) }),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

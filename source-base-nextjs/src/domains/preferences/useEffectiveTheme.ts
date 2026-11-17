'use client';

import { useMediaQuery } from '@/shared/hooks';

import { selectDisplayMode } from './display/display.selectors';
import { useDisplayStore } from './display/display.store';
import { selectThemeMode } from './theme/theme.selectors';
import { useThemeStore } from './theme/theme.store';
import type { ThemeMode } from './theme/theme.types';
import { resolveEffectiveTheme } from './theme/theme.utils';

/**
 * useEffectiveTheme — theme ĐANG HIỂN THỊ: chế độ TV ép tối; `system` theo HĐH (đổi theo ngay khi HĐH đổi sáng / tối);
 * còn lại là lựa chọn đã lưu.
 *
 * Dùng cho mọi chỗ vẽ theo theme (nút đổi theme, giá trị của ô chọn). Muốn đổi lựa chọn của người dùng
 * thì ghi `useThemeStore` — TV chỉ ép hiển thị, không ghi đè lựa chọn đó. Ngoài React: `resolveEffectiveTheme`.
 *
 * @example
 * const theme = useEffectiveTheme(); // 'dark' khi đang ở TV
 */
export function useEffectiveTheme(): ThemeMode {
  const theme = useThemeStore(selectThemeMode);
  const mode = useDisplayStore(selectDisplayMode);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  return resolveEffectiveTheme(theme, mode, prefersDark);
}

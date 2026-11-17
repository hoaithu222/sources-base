'use client';

import { useCallback, useMemo } from 'react';

import { useRouter } from '@/core/i18n';
import {
  selectIsTv,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
} from '@/domains/preferences';
import { logout, selectUser, useSessionStore } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';
import type { UserMenuStaticKey } from '@/shared/widgets/header';

const USER_MENU_PATHS = {
  profile: PATHS.PROFILE,
  settings: PATHS.SETTINGS,
} satisfies Record<Exclude<UserMenuStaticKey, 'logout'>, string>;

/**
 * useShellAccount — danh tính, theme và handler menu tài khoản dùng CHUNG cho `AppHeader` (laptop / tablet) và
 * `AppPhoneTopBar` (điện thoại): hai vỏ chỉ khác cách vẽ, không khác dữ liệu.
 *
 * Dùng:   const { headerUser, theme, toggleTheme, isTv, handleUserMenuSelect } = useShellAccount();
 * Lưu ý:  đăng xuất chỉ gọi `logout()` — `AuthGate` là nơi duy nhất điều hướng về trang đăng nhập. Chế độ TV: theme
 *         hiển thị là tối nên `isTv` để nơi dùng ẩn nút đổi theme.
 */
export function useShellAccount() {
  const router = useRouter();
  const user = useSessionStore(selectUser);
  const theme = useEffectiveTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isTv = useDisplayStore(selectIsTv);

  const headerUser = useMemo(
    () =>
      user
        ? { displayName: user.name, email: user.email, avatarUrl: user.avatar ?? undefined }
        : null,
    [user],
  );

  const handleUserMenuSelect = useCallback(
    (key: UserMenuStaticKey) => {
      if (key === 'logout') {
        void logout();
        return;
      }
      router.push(USER_MENU_PATHS[key]);
    },
    [router],
  );

  return { headerUser, theme, toggleTheme, isTv, handleUserMenuSelect };
}

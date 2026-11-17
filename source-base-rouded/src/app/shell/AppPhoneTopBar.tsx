import { memo, useMemo } from 'react';
import { useMatches } from 'react-router-dom';

import { resolvePageTitle } from '@/app/router/definition';
import { APP_NAME } from '@/shared/constants/app.constants';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { CommandPaletteTrigger } from '@/shared/widgets/command-palette';
import {
  HEADER_PHONE_BUTTON_CLASS,
  PhoneTopBar,
  type UserMenuExtraOption,
} from '@/shared/widgets/header';

import { useShellAccount } from './useShellAccount';

/**
 * AppPhoneTopBar — nối `PhoneTopBar` (thanh trên cùng của điện thoại) với phiên đăng nhập, theme và route: tên dự
 * phòng = `meta.title` của route đang mở, nút tìm nhanh, sheet tài khoản có mục đổi giao diện sáng / tối (nút đổi theme
 * rời của `Header` không còn trên điện thoại; chế độ TV thì ẩn mục này). `AppShellLayout` chọn nó thay `AppHeader`
 * khi `useIsPhone()`.
 */
const AppPhoneTopBar = memo(function AppPhoneTopBar() {
  const matches = useMatches();
  const { headerUser, theme, toggleTheme, isTv, handleUserMenuSelect } = useShellAccount();

  const title = resolvePageTitle(matches) ?? APP_NAME;

  const extraMenuOptions = useMemo<UserMenuExtraOption[]>(
    () =>
      isTv
        ? []
        : [
            {
              key: 'toggle-theme',
              label: theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối',
              icon: <SystemIcon name={theme === 'dark' ? 'sun-bold' : 'moon-bold'} size={16} />,
              onSelect: toggleTheme,
            },
          ],
    [isTv, theme, toggleTheme],
  );

  return (
    <PhoneTopBar
      actions={<CommandPaletteTrigger className={HEADER_PHONE_BUTTON_CLASS} />}
      extraMenuOptions={extraMenuOptions}
      title={title}
      user={headerUser}
      onUserMenuSelect={handleUserMenuSelect}
    />
  );
});

export default AppPhoneTopBar;

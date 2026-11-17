import { memo, useMemo } from 'react';

import { appConfig } from '@/core/config';
import { APP_NAME } from '@/shared/constants/app.constants';
import {
  BRAND_MARK_CLASS,
  BRAND_MARK_ICON,
  BRAND_MARK_SIZE_CLASSES,
} from '@/shared/constants/auth-motifs.constants';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { CommandPaletteTrigger } from '@/shared/widgets/command-palette';
import { useDockSettingsStore } from '@/shared/widgets/dock';
import {
  Header,
  HEADER_ICON_BUTTON_CLASS,
  HeaderContextChip,
  type UserMenuExtraOption,
} from '@/shared/widgets/header';

import { useShellAccount } from './useShellAccount';

const toggleDockHidden = () => useDockSettingsStore.getState().toggleHidden();

const BRAND_MARK = (
  <span aria-hidden className={cn(BRAND_MARK_CLASS, BRAND_MARK_SIZE_CLASSES.sm)}>
    <SystemIcon name={BRAND_MARK_ICON} />
  </span>
);

const HEADER_ACTIONS = <CommandPaletteTrigger className={HEADER_ICON_BUTTON_CLASS} />;

/** Chế độ demo: chip ngữ cảnh nói rõ đây là bản trình diễn (dự án thật truyền mã công trường / nhà máy đang chọn). */
const HEADER_CONTEXT = appConfig.isDemo ? (
  <HeaderContextChip code="DEMO" label="Bản trình diễn" />
) : null;

const BRAND_TAGLINE = appConfig.isDemo ? 'Giao diện điều hành' : undefined;

/**
 * AppHeader — nối `Header` với phiên đăng nhập, theme và Dock: menu tài khoản (hồ sơ · cài đặt · đăng
 * xuất) + mục "Ẩn / Hiện thanh Dock". Chế độ TV: theme hiển thị là tối, ẩn nút đổi theme.
 * Đăng xuất chỉ gọi `logout()` — `AuthGuard` là nơi duy nhất điều hướng về trang đăng nhập.
 * Logo: ô thương hiệu vát góc cỡ `sm` (`BRAND_MARK_*`, một nguồn với AuthLayout và trang trạng thái).
 * Chip ngữ cảnh + dòng phụ của logo chỉ có ở chế độ demo; thanh không có đồng hồ (giờ hiện ở chỗ nào cần thì trang tự đặt).
 * Dạng điện thoại là `AppPhoneTopBar` (cùng dữ liệu qua `useShellAccount`).
 */
const AppHeader = memo(function AppHeader() {
  const { headerUser, theme, toggleTheme, isTv, handleUserMenuSelect } = useShellAccount();
  const isDockHidden = useDockSettingsStore((s) => s?.mode === 'hidden');

  const extraMenuOptions = useMemo<UserMenuExtraOption[]>(
    () => [
      {
        key: 'toggle-dock',
        label: isDockHidden ? 'Hiện thanh Dock' : 'Ẩn thanh Dock',
        icon: <SystemIcon name={isDockHidden ? 'eye-outline' : 'eye-slash-outline'} size={16} />,
        onSelect: toggleDockHidden,
      },
    ],
    [isDockHidden],
  );

  return (
    <Header
      actions={HEADER_ACTIONS}
      brandLabel={APP_NAME}
      brandMark={BRAND_MARK}
      brandTagline={BRAND_TAGLINE}
      context={HEADER_CONTEXT}
      extraMenuOptions={extraMenuOptions}
      hideThemeToggle={isTv}
      sticky={false}
      theme={theme}
      user={headerUser}
      onThemeToggle={toggleTheme}
      onUserMenuSelect={handleUserMenuSelect}
    />
  );
});

export default AppHeader;

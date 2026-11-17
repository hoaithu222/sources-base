'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { appConfig } from '@/core/config';
import { Image } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import {
  COMMAND_PALETTE_SHORTCUT_LABEL,
  CommandPaletteTrigger,
} from '@/shared/widgets/command-palette';
import { useDockSettingsStore } from '@/shared/widgets/dock';
import { useWorkTabsStore } from '@/shared/widgets/work-tabs';
import {
  Header,
  HEADER_SEARCH_FIELD_CLASS,
  HeaderContextChip,
  type UserMenuExtraOption,
} from '@/shared/widgets/header';

import { useHeaderModules } from './useHeaderModules';
import { useShellAccount } from './useShellAccount';

const toggleDockHidden = () => useDockSettingsStore.getState().toggleHidden();
const toggleWorkTabs = () => {
  const store = useWorkTabsStore.getState();
  store.setEnabled(!store.enabled);
};

/**
 * Logo VCI đầy đủ (emblem + chữ) đặt trên VIÊN trắng: giữ đúng màu logo (vòng cung xanh lá → lam, chữ đỏ) trên nền gradient
 * của kiểu `brand` lẫn kính của kiểu `glass`. Đổi logo: thay `src/assets/image/logo-vci.svg` (+ `public/favicon.svg`).
 */
const BRAND_MARK = (
  <span className="inline-flex h-8 items-center rounded-full bg-neutral-0 px-3 shadow-[0_1px_2px_color-mix(in_srgb,var(--color-neutral-10)_18%,transparent)] ring-1 ring-border-default wide:h-9">
    <Image alt="VCI" fit="contain" height={22} loading="eager" name="logo-vci" width={56} />
  </span>
);

const HEADER_SEARCH = (
  <CommandPaletteTrigger className={HEADER_SEARCH_FIELD_CLASS} variant="field" />
);

/**
 * AppHeader — nối `Header` với phiên đăng nhập, theme, cấu hình điều hướng và Dock: nút ⊞ "Tất cả phân hệ"
 * (mọi phân hệ + màn hình), vệt phân hệ + dải màn hình, ĐỔI CẤP khi vào một màn hình (‹ · phân hệ › màn hình ▾ —
 * `useHeaderModules`), ô tìm kiếm ⌘K dạng field, menu tài khoản (đổi theme · hồ sơ · cài đặt · đăng xuất) + "Ẩn / Hiện
 * thanh Dock" + "Ẩn / Hiện thẻ làm việc". Chế độ TV: theme hiển thị là tối, ẩn mục đổi theme.
 * Đăng xuất chỉ gọi `logout()` — `AuthGate` là nơi duy nhất điều hướng về trang đăng nhập.
 * Dạng điện thoại là `AppPhoneTopBar` (cùng dữ liệu qua `useShellAccount`).
 */
const AppHeader = memo(function AppHeader() {
  const t = useTranslations('shell.header');
  const { headerUser, theme, toggleTheme, isTv, handleUserMenuSelect } = useShellAccount();
  /** Chế độ demo: chip ngữ cảnh nói rõ đây là bản trình diễn (dự án thật truyền công ty / chi nhánh đang chọn). */
  const context = appConfig.isDemo ? <HeaderContextChip code="DEMO" label={t('demoChip')} /> : null;
  const { modules, activeModuleId, moduleNav, level, backHref, moduleHref } = useHeaderModules();
  const isDockHidden = useDockSettingsStore((s) => s?.mode === 'hidden');
  const workTabsOn = useWorkTabsStore((s) => s.enabled);

  const extraMenuOptions = useMemo<UserMenuExtraOption[]>(
    () => [
      {
        key: 'toggle-dock',
        label: isDockHidden ? t('showDock') : t('hideDock'),
        icon: <SystemIcon name={isDockHidden ? 'eye-outline' : 'eye-slash-outline'} size={16} />,
        onSelect: toggleDockHidden,
      },
      {
        key: 'toggle-work-tabs',
        label: workTabsOn ? t('hideWorkTabs') : t('showWorkTabs'),
        icon: <SystemIcon name={workTabsOn ? 'eye-slash-outline' : 'eye-outline'} size={16} />,
        onSelect: toggleWorkTabs,
      },
    ],
    [isDockHidden, workTabsOn, t],
  );

  return (
    <Header
      activeModuleId={activeModuleId}
      backHref={backHref}
      brandLabel=""
      brandMark={BRAND_MARK}
      context={context}
      extraMenuOptions={extraMenuOptions}
      hideThemeToggle={isTv}
      level={level}
      moduleHref={moduleHref}
      moduleNav={moduleNav}
      modules={modules}
      search={HEADER_SEARCH}
      shortcutLabel={COMMAND_PALETTE_SHORTCUT_LABEL}
      sticky={false}
      theme={theme}
      user={headerUser}
      onThemeToggle={toggleTheme}
      onUserMenuSelect={handleUserMenuSelect}
    />
  );
});

export default AppHeader;

'use client';

import { memo, useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { HEADER_HEIGHT_CLASS } from '@/shared/constants/layout.constants';
import { cn } from '@/shared/utils/style/cn';

import { HeaderBackLink, Logo } from './chrome';
import './header-curves.css';
import { useHeaderAppearance } from './chrome/header-appearance.store';
import { HEADER_APPEARANCE_CLASSES, HEADER_SLOT_CLASSES } from './header.theme';
import ModuleNav from './modules/ModuleNav';
import ModulePlate from './modules/ModulePlate';
import ModuleSwitcher from './modules/ModuleSwitcher';
import { useHeaderModuleState } from './modules/useHeaderModuleState';
import { themeMenuOption } from './user-menu/useUserMenuOptions';
import type { HeaderLevel, HeaderModule, HeaderNavItem } from './modules';
import { useHeaderSlotRef } from './slots';
import { useHeaderPage } from './slots/header-slots.context';
import {
  UserMenu,
  type HeaderUser,
  type UserMenuExtraOption,
  type UserMenuStaticKey,
} from './user-menu';

interface HeaderProps {
  brandLabel?: string;
  brandTagline?: string;
  brandMark?: ReactNode;
  context?: ReactNode;
  homeHref?: string;
  onHomeClick?: () => void;
  modules?: readonly HeaderModule[];
  activeModuleId?: string;
  moduleNav?: readonly HeaderNavItem[];
  level?: HeaderLevel;
  moduleHref?: string;
  backHref?: string;
  shortcutLabel?: string;
  user?: HeaderUser | null;
  extraMenuOptions?: readonly UserMenuExtraOption[];
  onUserMenuSelect?: (key: UserMenuStaticKey) => void;
  search?: ReactNode;
  actions?: ReactNode;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  hideThemeToggle?: boolean;
  sticky?: boolean;
  className?: string;
}

const NO_MODULES: readonly HeaderModule[] = [];
const NO_NAV: readonly HeaderNavItem[] = [];

/**
 * Header — thanh trên cùng của app ERP, lưới 3 cột: TRÁI ⊞ · logo · ‹ (cấp ≥ 2) · nửa tab trái | GIỮA khối tiêu đề (CHỈ
 * tên trang, giữa hai khay cong) | PHẢI nửa tab phải · ô `end` · tìm kiếm · menu người dùng. Tab hai bên = tab của trang
 * (`PageHeader nav`) hoặc dải màn hình phân hệ. Kiểu thanh (`brand` · `glass`) đọc store `chrome/header-appearance.store`.
 * Bọc `<HeaderSlotsProvider>` quanh CẢ `<Header>` lẫn vùng nội dung. Widget THUẦN — `app/shell/AppHeader.tsx` nối store /
 * registry. Sửa giao diện: `header.theme.ts` (biến `--hdr-*`) · phân hệ → `modules/` · tab trang → `page-header/`.
 *
 * @param props.brandLabel - Wordmark của logo (ẩn dưới `md`). Mặc định "APP".
 * @param props.brandTagline - Dòng phụ viết hoa dưới wordmark; chỉ hiện từ `xl`.
 * @param props.brandMark - Emblem trước wordmark (thường `<AppTile>`).
 * @param props.context - Ngữ cảnh làm việc cạnh logo (công ty / chi nhánh — `<HeaderContextChip>`).
 * @param props.homeHref - Đích của logo. Mặc định `/`.
 * @param props.onHomeClick - Chạy khi click TRÁI vào logo, THAY cho điều hướng (Ctrl / Cmd vẫn mở tab mới).
 * @param props.modules - Phân hệ cho launcher của bộ chọn (`HeaderModule[]`, đã lọc quyền). Rỗng → không có bộ chọn.
 * @param props.activeModuleId - `id` phân hệ đang mở (tên trên nút bộ chọn).
 * @param props.moduleNav - Dải màn hình của phân hệ đang mở (`HeaderNavItem[]`) — chia đôi hai bên; < 2 mục → ẩn.
 * @param props.level - Cấp của URL (`HeaderLevel`): ≥ 2 thêm nút ‹, logo thu gọn, chip ngữ cảnh ẩn. Mặc định `0`.
 * @param props.moduleHref - Trang đích của phân hệ (thiếu → không có ‹).
 * @param props.backHref - Đích nút ‹ ở cấp ≥ 2 (thiếu → không đổi cấp).
 * @param props.shortcutLabel - Nhãn phím tắt bảng lệnh (chân launcher), vd "Ctrl K".
 * @param props.user - Danh tính cho menu người dùng (`HeaderUser`). Bỏ trống → "Khách" (theo ngôn ngữ).
 * @param props.extraMenuOptions - Mục app gắn thêm vào menu người dùng (vd "Ẩn thanh Dock"); giữ identity ổn định.
 * @param props.onUserMenuSelect - Gọi với key TĨNH `UserMenuStaticKey` (`profile` | `settings` | `logout`).
 * @param props.search - Ô tìm kiếm toàn cục (thường `<CommandPaletteTrigger variant="field" className={HEADER_SEARCH_FIELD_CLASS} />`).
 * @param props.actions - Nút icon toàn cục sau ô tìm (thông báo…); khung `HEADER_ICON_BUTTON_CLASS`.
 * @param props.theme - Chế độ màu ĐANG HIỆU LỰC. Thiếu `theme` hoặc `onThemeToggle` → menu tài khoản không có mục đổi theme.
 * @param props.onThemeToggle - Lật sáng / tối (mục đầu menu tài khoản — thanh gọn, không nút riêng).
 * @param props.hideThemeToggle - Ẩn mục đổi theme dù đã truyền (vd chế độ TV). Mặc định `false`.
 * @param props.sticky - `true` khi layout ngoài có cuộn (layout `h-dvh` không cần). Mặc định `false`.
 * @param props.className - Class thêm cho `<header>`.
 *
 * @example
 * <HeaderSlotsProvider>
 *   <Header brandLabel="ERP" modules={modules} activeModuleId="tai-chinh" moduleNav={nav} user={user} />
 *   <main>…</main>
 * </HeaderSlotsProvider>
 */
const Header = memo(function Header({
  brandLabel,
  brandTagline,
  brandMark,
  context,
  homeHref = '/',
  onHomeClick,
  modules = NO_MODULES,
  activeModuleId,
  moduleNav = NO_NAV,
  level = 0,
  moduleHref,
  backHref,
  shortcutLabel,
  user,
  extraMenuOptions,
  onUserMenuSelect,
  search,
  actions,
  theme,
  onThemeToggle,
  hideThemeToggle = false,
  sticky = false,
  className,
}: HeaderProps) {
  const t = useTranslations('ui.widgets');
  const appearance = useHeaderAppearance();
  const menuOptions = useMemo(() => {
    if (hideThemeToggle || !theme || !onThemeToggle) return extraMenuOptions;
    const labels = { dark: t('header.userMenu.themeDark'), light: t('header.userMenu.themeLight') };
    return [themeMenuOption(theme, onThemeToggle, labels), ...(extraMenuOptions ?? [])];
  }, [extraMenuOptions, hideThemeToggle, onThemeToggle, t, theme]);

  const startSlotRef = useHeaderSlotRef('start');
  const tabsLeftRef = useHeaderSlotRef('tabsLeft');
  const tabsRightRef = useHeaderSlotRef('tabsRight');
  const endSlotRef = useHeaderSlotRef('end');
  const page = useHeaderPage();
  const { active, activeItem, deep } = useHeaderModuleState({
    level,
    modules,
    activeModuleId,
    moduleNav,
    moduleHref,
    backHref,
  });
  const sideScreens = Boolean(active && !page?.hasTabs && moduleNav.length >= 2);

  const headerClassName = cn(
    HEADER_SLOT_CLASSES.root,
    HEADER_HEIGHT_CLASS.height,
    sticky && 'sticky top-0 z-50',
    className,
  );

  return (
    <header className={headerClassName} data-appearance={appearance} data-level={level}>
      <div className={cn(HEADER_SLOT_CLASSES.bar, HEADER_APPEARANCE_CLASSES[appearance])}>
        <span aria-hidden className={HEADER_SLOT_CLASSES.aurora} />
        <div className={HEADER_SLOT_CLASSES.left}>
          <ModuleSwitcher
            activeId={activeModuleId}
            modules={modules}
            shortcutLabel={shortcutLabel}
          />
          <Logo
            compact={level >= 2}
            href={homeHref}
            label={brandLabel}
            mark={brandMark}
            tagline={brandTagline}
            onClick={onHomeClick}
          />
          {level < 2 && context}
          {deep && backHref && <HeaderBackLink href={backHref} />}
          <div ref={startSlotRef} className={HEADER_SLOT_CLASSES.pageSlot} />
          <div
            className={cn(HEADER_SLOT_CLASSES.side, HEADER_SLOT_CLASSES.sideLeft)}
            data-header-side="left"
          >
            {sideScreens && <ModuleNav half="left" items={moduleNav} />}
            <div ref={tabsLeftRef} className={HEADER_SLOT_CLASSES.sideTarget} />
          </div>
        </div>

        <ModulePlate activeItem={activeItem} module={active} page={page} />

        <div className={HEADER_SLOT_CLASSES.right}>
          <div
            className={cn(HEADER_SLOT_CLASSES.side, HEADER_SLOT_CLASSES.sideRight)}
            data-header-side="right"
          >
            {sideScreens && <ModuleNav half="right" items={moduleNav} />}
            <div ref={tabsRightRef} className={HEADER_SLOT_CLASSES.sideTarget} />
          </div>
          <div ref={endSlotRef} className={HEADER_SLOT_CLASSES.pageSlot} />
          {search}
          {actions}

          <UserMenu extraOptions={menuOptions} user={user} onSelect={onUserMenuSelect} />
        </div>
      </div>
    </header>
  );
});

export default Header;

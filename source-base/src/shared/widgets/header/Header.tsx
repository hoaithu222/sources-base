import { memo } from 'react';
import type { ReactNode } from 'react';

import { HEADER_HEIGHT_CLASS } from '@/shared/constants/layout.constants';
import { ThemeToggle } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { useHeaderSkin } from './header-skin.store';
import { HEADER_SKIN_SPECS } from './page-header/header-skin.theme';
import { Logo } from './chrome';
import { HEADER_ICON_BUTTON_CLASS, HEADER_SLOT_CLASSES } from './header.theme';
import { useHeaderSlotRef } from './slots';
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
  user?: HeaderUser | null;
  extraMenuOptions?: readonly UserMenuExtraOption[];
  onUserMenuSelect?: (key: UserMenuStaticKey) => void;
  actions?: ReactNode;
  theme?: 'light' | 'dark';
  onThemeToggle?: () => void;
  hideThemeToggle?: boolean;
  sticky?: boolean;
  className?: string;
}

/** Trang trí tĩnh của thanh: vạch `rail` đáy (cả hai theme) + quầng giữa `railGlow` (chỉ `dark:`). */
const HEADER_DECOR_CLASSES: readonly string[] = [
  HEADER_SLOT_CLASSES.rail,
  HEADER_SLOT_CLASSES.railGlow,
];

const HeaderDecor = memo(function HeaderDecor() {
  return HEADER_DECOR_CLASSES.map((className) => (
    <span key={className} aria-hidden="true" className={className} />
  ));
});

const HeaderTick = memo(function HeaderTick() {
  return <span aria-hidden="true" className={HEADER_SLOT_CLASSES.tick} />;
});

/**
 * Header — thanh trên cùng của app: logo · chip ngữ cảnh · ô `start` | cụm tâm `title` | ô `end` · nút toàn
 * cục · menu người dùng. Page bơm tiêu đề / chip vào các ô qua `<PageHeader>` (portal).
 *
 * MỘT hàng mỏng (40 → 44 → 52px): logo · chip · nút · menu người dùng cùng cao `HEADER_CONTROL_HEIGHT`, canh GIỮA; tab của
 * page thấp hơn (`PAGE_CHIP_HEIGHT`) và ĐỨNG TRÊN ray đáy, vát song song cạnh bảng tên.
 *
 * Bọc `<HeaderSlotsProvider>` quanh CẢ `<Header>` lẫn vùng nội dung (thiếu thì `<PageHeader>` không hiện).
 * Widget THUẦN: danh tính, theme, handler vào qua props — tầng `app/shell/AppHeader.tsx` nối store.
 * Sửa giao diện: `header.theme.ts` (`HEADER_SLOT_CLASSES`) · kiểu khung → `page-header/header-skin.theme.ts`.
 * Lưu ý: kiểu khung đọc từ store CỤC BỘ `header-skin.store` (người dùng chọn trong menu), KHÔNG qua prop. Bảng tên
 * luôn ở GIỮA thanh. ⛔ Node slot `title` LUÔN đứng nguyên chỗ trong cây, đổi kiểu khung chỉ đổi class / biến: chuyển nó
 * giữa hai nhánh JSX thì ref callback detach / attach lệch thứ tự, xoá nhầm node → mất tiêu đề.
 *
 * @param props.brandLabel - Wordmark của logo (ẩn dưới `md`). Mặc định "APP".
 * @param props.brandTagline - Dòng phụ viết hoa dưới wordmark (tên đầy đủ của hệ thống); chỉ hiện từ `wide`.
 * @param props.brandMark - Emblem trước wordmark — `<Image>` / `<SystemIcon>` do app truyền.
 * @param props.context - Ngữ cảnh làm việc đứng ngay sau logo — thường `<HeaderContextChip>` (mã + tên công
 *   trường / nhà máy). Của APP, không đổi theo trang; node theo trang dùng `<PageHeader start>`.
 * @param props.homeHref - Đích của logo. Mặc định `/`.
 * @param props.onHomeClick - Chạy khi click TRÁI vào logo, THAY cho điều hướng tới `homeHref` (Ctrl / Cmd
 *   vẫn mở tab mới).
 * @param props.user - Danh tính cho menu người dùng (`HeaderUser`). Bỏ trống → hiện "Khách".
 * @param props.extraMenuOptions - Mục app gắn thêm vào menu người dùng, mỗi mục mang `onSelect` riêng (vd
 *   "Ẩn thanh Dock"); đứng sau "Cài đặt", trước "Kiểu header". Giữ identity ổn định (`useMemo`).
 * @param props.onUserMenuSelect - Gọi với key TĨNH `UserMenuStaticKey` (`profile` | `settings` | `logout`).
 * @param props.actions - Nút icon toàn cục đặt trước nút đổi theme (tìm nhanh, thông báo…); dùng
 *   `HEADER_ICON_BUTTON_CLASS` cho khung.
 * @param props.theme - Chế độ màu ĐANG HIỆU LỰC. Thiếu `theme` hoặc `onThemeToggle` → không có nút đổi theme.
 * @param props.onThemeToggle - Lật sáng / tối.
 * @param props.hideThemeToggle - Ẩn nút đổi theme dù đã truyền `theme` + `onThemeToggle` (vd chế độ TV).
 *   Mặc định `false`.
 * @param props.sticky - `true` khi layout ngoài có cuộn (layout `h-dvh` không cần). Mặc định `false`.
 * @param props.className - Class thêm cho `<header>`.
 *
 * @example
 * <HeaderSlotsProvider>
 *   <Header
 *     brandLabel="APP"
 *     context={<HeaderContextChip code="BDD-S02" label="Bãi đúc dầm số 2" />}
 *     user={{ displayName: 'An', role: 'Quản trị' }}
 *     actions={<CommandPaletteTrigger className={HEADER_ICON_BUTTON_CLASS} />}
 *     onUserMenuSelect={handleAccount}
 *   />
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
  user,
  extraMenuOptions,
  onUserMenuSelect,
  actions,
  theme,
  onThemeToggle,
  hideThemeToggle = false,
  sticky = false,
  className,
}: HeaderProps) {
  const headerSkin = useHeaderSkin();

  const startSlotRef = useHeaderSlotRef('start');
  const titleSlotRef = useHeaderSlotRef('title');
  const endSlotRef = useHeaderSlotRef('end');

  const headerClassName = cn(
    HEADER_SLOT_CLASSES.root,
    HEADER_HEIGHT_CLASS.height,
    HEADER_SKIN_SPECS[headerSkin].vars,
    sticky && 'sticky top-0 z-50',
    className,
  );

  return (
    <header className={headerClassName} data-skin={headerSkin}>
      <HeaderDecor />

      <div className={HEADER_SLOT_CLASSES.left}>
        <Logo
          href={homeHref}
          label={brandLabel}
          mark={brandMark}
          tagline={brandTagline}
          onClick={onHomeClick}
        />
        {context}
        <div ref={startSlotRef} className={HEADER_SLOT_CLASSES.pageSlot} />
      </div>

      <div ref={titleSlotRef} className={HEADER_SLOT_CLASSES.center} />

      <div className={HEADER_SLOT_CLASSES.right}>
        <div ref={endSlotRef} className={HEADER_SLOT_CLASSES.pageSlot} />

        <HeaderTick />
        {actions}

        {!hideThemeToggle && theme && onThemeToggle && (
          <ThemeToggle
            className={HEADER_ICON_BUTTON_CLASS}
            theme={theme}
            onToggle={onThemeToggle}
          />
        )}

        <UserMenu extraOptions={extraMenuOptions} user={user} onSelect={onUserMenuSelect} />
      </div>
    </header>
  );
});

export default Header;

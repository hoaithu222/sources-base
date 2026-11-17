import { memo } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { useHeaderSlotRef } from '../slots';
import { UserMenu } from '../user-menu';
import type { HeaderUser, UserMenuExtraOption, UserMenuStaticKey } from '../user-menu';
import { PHONE_TOPBAR_SLOT_CLASSES } from './phone-topbar.theme';

interface PhoneTopBarProps {
  title: string;
  actions?: ReactNode;
  user?: HeaderUser | null;
  extraMenuOptions?: readonly UserMenuExtraOption[];
  onUserMenuSelect?: (key: UserMenuStaticKey) => void;
  className?: string;
}

/**
 * PhoneTopBar — thanh trên cùng PHẲNG của điện thoại (thay `Header` khi `useIsPhone()`): cao 52px (xoay ngang
 * ≤ 44px), một hàng `[quay lại] tên trang + dòng phụ … [nút của trang] [tìm] [avatar → sheet tài khoản]`, dải tab của
 * trang cuộn ngang ngay dưới (chỉ hiện khi trang có `nav`).
 *
 * Nằm TRONG luồng đầu khung (không `fixed`) nên `<main>` chỉ còn phần dưới nó. Dùng CHUNG ba ô slot với `Header`
 * (`HeaderSlotsProvider`): trang vẫn chỉ gọi `<PageHeader>` — tên + dòng phụ vào ô `title`, quay lại / `start` vào ô
 * `start`, `end` vào ô `end`, tab vào ô `nav`. Không có `<PageHeader>` thì hiện `title` dự phòng (tên route).
 * Widget THUẦN: danh tính, handler, nút toàn cục vào qua props — `app/shell/AppPhoneTopBar.tsx` nối store.
 * Sửa giao diện: `phone-topbar.theme.ts` · nút → `HEADER_PHONE_BUTTON_CLASS` (`header.theme.ts`).
 * Lưu ý: chỉ mount khi `useIsPhone()`; không mount cùng `Header` (hai bên cùng đăng ký một ô slot sẽ tranh nhau).
 *
 * @param props.title - Tên dự phòng khi trang không có `<PageHeader>` (thường tên route).
 * @param props.actions - Nút icon toàn cục đứng trước avatar (tìm nhanh…); dùng `HEADER_PHONE_BUTTON_CLASS` cho khung.
 * @param props.user - Danh tính cho sheet tài khoản (`HeaderUser`). Bỏ trống → "Khách".
 * @param props.extraMenuOptions - Mục app gắn thêm vào sheet tài khoản (vd đổi giao diện sáng / tối), mỗi mục mang
 *   `onSelect` riêng. Giữ identity ổn định (`useMemo`).
 * @param props.onUserMenuSelect - Gọi với key TĨNH `UserMenuStaticKey` (`profile` | `settings` | `logout`).
 * @param props.className - Class thêm cho `<header>`.
 *
 * @example
 * <HeaderSlotsProvider>
 *   <PhoneTopBar title="Trang chủ" actions={<CommandPaletteTrigger className={HEADER_PHONE_BUTTON_CLASS} />} />
 * </HeaderSlotsProvider>
 */
const PhoneTopBar = memo(function PhoneTopBar({
  title,
  actions,
  user,
  extraMenuOptions,
  onUserMenuSelect,
  className,
}: PhoneTopBarProps) {
  const startSlotRef = useHeaderSlotRef('start');
  const titleSlotRef = useHeaderSlotRef('title');
  const endSlotRef = useHeaderSlotRef('end');
  const navSlotRef = useHeaderSlotRef('nav');

  return (
    <header className={cn(PHONE_TOPBAR_SLOT_CLASSES.root, className)}>
      <div className={PHONE_TOPBAR_SLOT_CLASSES.row}>
        <div ref={startSlotRef} className={PHONE_TOPBAR_SLOT_CLASSES.lead} />

        <div className={PHONE_TOPBAR_SLOT_CLASSES.text}>
          <div ref={titleSlotRef} className={PHONE_TOPBAR_SLOT_CLASSES.titleSlot} />
          <span className={PHONE_TOPBAR_SLOT_CLASSES.fallbackTitle}>{title}</span>
        </div>

        <div className={PHONE_TOPBAR_SLOT_CLASSES.actions}>
          <div ref={endSlotRef} className={PHONE_TOPBAR_SLOT_CLASSES.endSlot} />
          {actions}
          <UserMenu extraOptions={extraMenuOptions} phone user={user} onSelect={onUserMenuSelect} />
        </div>
      </div>

      <div ref={navSlotRef} className={PHONE_TOPBAR_SLOT_CLASSES.navStrip} />
    </header>
  );
});

export default PhoneTopBar;

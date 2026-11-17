import { memo } from 'react';
import type { ComponentProps } from 'react';

import { Avatar } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { USER_MENU_SLOT_CLASSES } from './user-menu.theme';

interface UserMenuTriggerProps extends ComponentProps<'button'> {
  displayName: string;
  subLabel?: string | null;
  avatarSrc?: string;
  phone?: boolean;
}

/**
 * UserMenuTrigger — khối danh tính (avatar + tên + vai trò + caret) ở mép phải thanh header; làm
 * `trigger` của `<Menu>` trong `UserMenu`.
 *
 * Nhận thêm mọi thuộc tính của `<button>` — Radix `asChild` bơm `onPointerDown` / `onKeyDown` /
 * `aria-expanded` / `data-state` vào qua `...rest`.
 * Sửa giao diện: `USER_MENU_SLOT_CLASSES` (trigger · avatarWrap · avatar · status · info · name · role · caret).
 * Lưu ý: làm trigger `asChild` phải có CẢ HAI: nhận `ref` và spread `...rest` SAU CÙNG lên `<button>`
 * (không spread thì nút CHẾT). `className` tách khỏi `...rest` rồi merge, để `className: undefined` do
 * Slot không xoá sạch style. Trạng thái mở đọc từ `data-state`, không nâng state lên React.
 *
 * @param props.displayName - Tên hiển thị (cũng là `alt` / chữ viết tắt của avatar).
 * @param props.subLabel - Dòng phụ dưới tên — VAI TRÒ, không phải email (`role` viết hoa giãn chữ nên địa
 *   chỉ dài chạm trần `max-w` ngay; email đã có chỗ trong panel).
 * @param props.avatarSrc - Ảnh đại diện; thiếu → chữ viết tắt.
 * @param props.phone - `true` → dạng ĐIỆN THOẠI: chỉ còn avatar trong nút 36px (`HEADER_PHONE_BUTTON_CLASS`), không tên /
 *   vai trò / caret. Mặc định `false`.
 * @param props.className - Class thêm cho nút.
 * @param props.ref - Trỏ tới `<button>` (React 19: `ref` là prop thường; Slot của Radix clone xuống).
 *
 * @example
 * <Menu trigger={<UserMenuTrigger displayName="An" subLabel="Quản trị" />} options={options} />
 */
const UserMenuTrigger = memo(function UserMenuTrigger({
  displayName,
  subLabel,
  avatarSrc,
  phone = false,
  className,
  ref,
  ...rest
}: UserMenuTriggerProps) {
  const triggerClassName = cn(
    phone ? USER_MENU_SLOT_CLASSES.phoneTrigger : USER_MENU_SLOT_CLASSES.trigger,
    className,
  );

  if (phone) {
    return (
      <button
        ref={ref}
        aria-label="Menu người dùng"
        className={triggerClassName}
        type="button"
        {...rest}
      >
        <Avatar
          alt={displayName}
          className={USER_MENU_SLOT_CLASSES.phoneAvatar}
          initialsCount={1}
          name={displayName}
          shape="square"
          size="sm"
          src={avatarSrc}
          variant="brand"
        />
        <span aria-hidden="true" className={USER_MENU_SLOT_CLASSES.status} />
      </button>
    );
  }

  return (
    <button
      ref={ref}
      aria-label="Menu người dùng"
      className={triggerClassName}
      type="button"
      {...rest}
    >
      <span aria-hidden="true" className={USER_MENU_SLOT_CLASSES.accentBar} />

      <span className={USER_MENU_SLOT_CLASSES.avatarWrap}>
        <Avatar
          alt={displayName}
          className={USER_MENU_SLOT_CLASSES.avatar}
          initialsCount={1}
          name={displayName}
          shape="square"
          size="sm"
          src={avatarSrc}
          variant="brand"
        />
        <span aria-hidden="true" className={USER_MENU_SLOT_CLASSES.status} />
      </span>

      <span className={USER_MENU_SLOT_CLASSES.info}>
        <span className={USER_MENU_SLOT_CLASSES.name} title={displayName}>
          {displayName}
        </span>
        {subLabel && (
          <span className={USER_MENU_SLOT_CLASSES.role} title={subLabel}>
            {subLabel}
          </span>
        )}
      </span>

      <SystemIcon className={USER_MENU_SLOT_CLASSES.caret} name="angle-down-bold" size={14} />
    </button>
  );
});

export default UserMenuTrigger;

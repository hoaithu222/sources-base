'use client';

import { memo, useCallback, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { Drawer } from '@/shared/ui';
import type { MenuOption } from '@/shared/ui';
import { POPUP_ITEM_CLASS, POPUP_ITEM_ICON_CLASS } from '@/shared/ui/overlays/popup-surface.theme';
import { cn } from '@/shared/utils/style/cn';

import { USER_MENU_SLOT_CLASSES } from './user-menu.theme';
import UserMenuTrigger from './UserMenuTrigger';

interface UserMenuSheetProps {
  header: ReactNode;
  options: readonly MenuOption[];
  displayName: string;
  role?: string | null;
  avatarSrc?: string;
  onSelect: (option: MenuOption) => void;
}

/**
 * UserMenuSheet — menu tài khoản ở ĐIỆN THOẠI: nút avatar mở sheet đáy (`Drawer side="bottom"`) thay cho popover
 * thả xuống. Phần của `UserMenu`.
 *
 * Popover bám vào nút 36px ở góc phải-trên thì hẹp, không có nút đóng, dòng cao ~40px; sheet có nút X, kéo / Esc /
 * bấm nền để đóng, dòng cao ≥ 48px, xoay ngang xếp 2 cột. Danh sách + handler dùng CHUNG với menu laptop
 * (`useUserMenuOptions`) — component này chỉ vẽ lại bề mặt. Chọn một mục → đóng sheet rồi mới báo `onSelect`.
 *
 * @param props.header - Thẻ danh tính (avatar + tên + vai trò + email) đứng đầu thân sheet.
 * @param props.options - Các mục menu (`MenuOption`): `key`, `label`, `icon?`, `danger?`, `disabled?`.
 * @param props.displayName - Tên hiển thị (alt / chữ viết tắt của avatar trên nút).
 * @param props.role - Vai trò; truyền cho nút mở.
 * @param props.avatarSrc - Ảnh đại diện; thiếu → chữ viết tắt.
 * @param props.onSelect - Gọi với mục được chọn, SAU khi sheet đã đóng.
 *
 * @example
 * <UserMenuSheet displayName="An" header={<b>An</b>} options={options} onSelect={handleSelect} />
 */
const UserMenuSheet = memo(function UserMenuSheet({
  header,
  options,
  displayName,
  role,
  avatarSrc,
  onSelect,
}: UserMenuSheetProps) {
  const t = useTranslations('ui.widgets');
  const [open, setOpen] = useState(false);

  const handleSelect = useCallback(
    (option: MenuOption) => {
      setOpen(false);
      onSelect(option);
    },
    [onSelect],
  );

  return (
    <Drawer
      open={open}
      side="bottom"
      size="sm"
      title={t('header.userMenu.account')}
      trigger={
        <UserMenuTrigger avatarSrc={avatarSrc} displayName={displayName} phone subLabel={role} />
      }
      onOpenChange={setOpen}
    >
      <div className="flex flex-col gap-2">
        <div className={USER_MENU_SLOT_CLASSES.sheetIdentity}>{header}</div>
        <ul className={USER_MENU_SLOT_CLASSES.sheetList}>
          {options.map((option) => (
            <li key={option.key} className={USER_MENU_SLOT_CLASSES.sheetItem}>
              <button
                className={cn(
                  POPUP_ITEM_CLASS,
                  USER_MENU_SLOT_CLASSES.sheetButton,
                  option.danger && USER_MENU_SLOT_CLASSES.sheetButtonDanger,
                )}
                disabled={option.disabled}
                type="button"
                onClick={() => handleSelect(option)}
              >
                {option.icon && (
                  <span
                    className={cn(
                      POPUP_ITEM_ICON_CLASS,
                      option.danger && USER_MENU_SLOT_CLASSES.sheetButtonDanger,
                    )}
                  >
                    {option.icon}
                  </span>
                )}
                <span className="min-w-0 flex-1">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
});

export default UserMenuSheet;

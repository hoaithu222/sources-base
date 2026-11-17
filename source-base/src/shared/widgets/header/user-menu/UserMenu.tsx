import { memo, useCallback, useMemo } from 'react';

import { Avatar, Badge, Menu, Text, type MenuOption } from '@/shared/ui';

import { useUserMenuOptions } from './useUserMenuOptions';
import { USER_MENU_SLOT_CLASSES } from './user-menu.theme';
import type { HeaderUser, UserMenuExtraOption, UserMenuStaticKey } from './user-menu.types';
import UserMenuSheet from './UserMenuSheet';
import UserMenuTrigger from './UserMenuTrigger';

interface UserMenuProps {
  user?: HeaderUser | null;
  extraOptions?: readonly UserMenuExtraOption[];
  onSelect?: (key: UserMenuStaticKey) => void;
  phone?: boolean;
}

/**
 * UserMenu — avatar + menu tài khoản ở mép phải thanh header (đơn tenant: không chuyển tổ chức). Phần
 * của `<Header>`; app không dựng trực tiếp.
 *
 * Danh sách mục + handler: `useUserMenuOptions.ts`; nút mở menu: `UserMenuTrigger.tsx`; dạng điện thoại (sheet đáy):
 * `UserMenuSheet.tsx`.
 * Sửa giao diện: `user-menu.theme.ts` (`USER_MENU_SLOT_CLASSES`).
 * Lưu ý: danh tính + handler vào qua props, không đọc store của app; chỉ store CỤC BỘ "kiểu header"
 * (`header-skin.store`) được đọc thẳng (`widget-composition.md` — Store cục bộ của widget).
 *
 * @param props.user - Danh tính (`displayName`, `email?`, `role?`, `avatarUrl?`). Bỏ trống → "Khách".
 * @param props.extraOptions - Mục app gắn thêm, mỗi mục mang `onSelect` riêng (vd "Ẩn thanh Dock").
 * @param props.onSelect - Gọi với key TĨNH khi chọn "Hồ sơ" · "Cài đặt" · "Đăng xuất".
 * @param props.phone - `true` → dạng ĐIỆN THOẠI: nút chỉ avatar, menu mở thành sheet đáy (không có mục "Kiểu header").
 *   Mặc định `false`.
 *
 * @example
 * <UserMenu user={{ displayName: 'An', role: 'Quản trị' }} onSelect={(key) => handleAccount(key)} />
 */
const UserMenu = memo(function UserMenu({
  user,
  extraOptions,
  onSelect,
  phone = false,
}: UserMenuProps) {
  const displayName = user?.displayName ?? 'Khách';
  const role = user?.role ?? null;

  const { options, handleSelect } = useUserMenuOptions({
    extraOptions,
    onSelect,
    phone,
  });

  const handleMenuSelect = useCallback(
    (option: MenuOption) => handleSelect(option.key),
    [handleSelect],
  );

  const header = useMemo(
    () => (
      <span className={USER_MENU_SLOT_CLASSES.panelHeader}>
        <Avatar
          alt={displayName}
          name={displayName}
          shape="square"
          size="md"
          src={user?.avatarUrl}
          variant="brand"
        />
        <span className={USER_MENU_SLOT_CLASSES.panelIdentity}>
          <Text ellipsis size="small" weight="medium">
            {displayName}
          </Text>
          {role && (
            <span className={USER_MENU_SLOT_CLASSES.panelRole}>
              <Badge color="primary" size="sm" variant="tinted">
                {role}
              </Badge>
            </span>
          )}
          {user?.email && (
            <Text ellipsis size="tiny" skin="muted">
              {user.email}
            </Text>
          )}
        </span>
      </span>
    ),
    [displayName, role, user?.email, user?.avatarUrl],
  );

  if (phone) {
    return (
      <UserMenuSheet
        avatarSrc={user?.avatarUrl}
        displayName={displayName}
        header={header}
        options={options}
        role={role}
        onSelect={handleMenuSelect}
      />
    );
  }

  return (
    <Menu
      align="end"
      contentClassName={USER_MENU_SLOT_CLASSES.panel}
      header={header}
      options={options}
      trigger={
        <UserMenuTrigger avatarSrc={user?.avatarUrl} displayName={displayName} subLabel={role} />
      }
      onSelect={handleMenuSelect}
    />
  );
});

export default UserMenu;

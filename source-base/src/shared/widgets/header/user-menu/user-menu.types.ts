import type { MenuOption, SystemIconName } from '@/shared/ui';

/**
 * user-menu.types.ts — dữ liệu vào / ra của menu người dùng ở mép phải thanh header.
 */

/** Danh tính hiển thị trên nút và đầu panel menu. */
export interface HeaderUser {
  displayName: string;
  email?: string | null;
  /** Vai trò hiển thị dưới tên (RBAC phẳng — 1 chuỗi là đủ). */
  role?: string | null;
  avatarUrl?: string;
}

/** Mục TĨNH của menu — app xử lý qua `onUserMenuSelect(key)` (điều hướng, đăng xuất). */
export type UserMenuStaticKey = 'profile' | 'settings' | 'logout';

/** Mục app GẮN THÊM vào menu (đứng trước "Kiểu header"): mang handler riêng, không qua `onUserMenuSelect`. */
export interface UserMenuExtraOption extends MenuOption {
  onSelect: () => void;
}

export interface UserMenuActionConfig {
  key: UserMenuStaticKey;
  label: string;
  icon: SystemIconName;
  danger?: boolean;
}

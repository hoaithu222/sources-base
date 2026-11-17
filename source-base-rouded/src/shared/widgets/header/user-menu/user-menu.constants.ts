import type { UserMenuActionConfig } from './user-menu.types';

/**
 * user-menu.constants.ts — mục tĩnh và nhãn của menu người dùng.
 *
 * Dùng:   USER_MENU_ACTIONS (hồ sơ · cài đặt · đăng xuất) → app xử lý qua `onUserMenuSelect(key)`.
 * Lưu ý:  mục submenu "Kiểu header" (`HEADER_APPEARANCE_MENU_KEY`, khoá lá dạng `appearance:<giá trị>`) do widget tự xử lý, KHÔNG bao
 *         giờ gửi tới app.
 */

export const USER_MENU_ACTIONS: readonly UserMenuActionConfig[] = [
  { key: 'profile', label: 'Hồ sơ cá nhân', icon: 'user-outline' },
  { key: 'settings', label: 'Cài đặt', icon: 'gear-outline' },
  { key: 'logout', label: 'Đăng xuất', icon: 'arrow-right-to-line-outline', danger: true },
] as const;

/** Khoá mục cha của submenu chọn kiểu header + nhãn hiển thị của nó. */
export const HEADER_APPEARANCE_MENU_KEY = 'header-appearance';
export const HEADER_APPEARANCE_MENU_LABEL = 'Kiểu header';

/** Tiền tố khoá mục LÁ: `appearance:brand`, `appearance:glass` — `handleSelect` tách tiền tố để nhận ra mục kiểu header. */
export const HEADER_APPEARANCE_OPTION_PREFIX = 'appearance:';

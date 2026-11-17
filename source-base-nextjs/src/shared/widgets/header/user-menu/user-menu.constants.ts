import type { UserMenuActionConfig } from './user-menu.types';

/**
 * user-menu.constants.ts — mục tĩnh và khoá của menu người dùng.
 *
 * Dùng:   USER_MENU_ACTIONS (hồ sơ · cài đặt · đăng xuất) → app xử lý qua `onUserMenuSelect(key)`.
 *         Nhãn theo ngôn ngữ: `ui.widgets` → `header.userMenu.<key>` · `header.appearance.menu` (resolve ở `useUserMenuOptions`).
 * Lưu ý:  mục submenu "Kiểu header" (`HEADER_APPEARANCE_MENU_KEY`, khoá lá dạng `appearance:<giá trị>`) do widget tự xử lý, KHÔNG bao
 *         giờ gửi tới app.
 */

export const USER_MENU_ACTIONS: readonly UserMenuActionConfig[] = [
  { key: 'profile', icon: 'user-outline' },
  { key: 'settings', icon: 'gear-outline' },
  { key: 'logout', icon: 'arrow-right-to-line-outline', danger: true },
] as const;

/** Khoá mục cha của submenu chọn kiểu header. */
export const HEADER_APPEARANCE_MENU_KEY = 'header-appearance';

/** Tiền tố khoá mục LÁ: `appearance:brand`, `appearance:glass` — `handleSelect` tách tiền tố để nhận ra mục kiểu header. */
export const HEADER_APPEARANCE_OPTION_PREFIX = 'appearance:';

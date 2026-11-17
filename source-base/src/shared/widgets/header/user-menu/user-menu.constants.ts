import type { HeaderSkin } from '../header-skin.store';
import type { UserMenuActionConfig } from './user-menu.types';

/**
 * user-menu.constants.ts — mục tĩnh và nhãn của menu người dùng.
 *
 * Dùng:   USER_MENU_ACTIONS (hồ sơ · cài đặt · đăng xuất) → app xử lý qua `onUserMenuSelect(key)`.
 * Lưu ý:  mục submenu "Kiểu header" (`HEADER_SKIN_MENU_KEY`, khoá lá dạng `skin:<giá trị>`) do widget tự xử lý, KHÔNG bao
 *         giờ gửi tới app.
 */

export const USER_MENU_ACTIONS: readonly UserMenuActionConfig[] = [
  { key: 'profile', label: 'Hồ sơ cá nhân', icon: 'user-outline' },
  { key: 'settings', label: 'Cài đặt', icon: 'gear-outline' },
  { key: 'logout', label: 'Đăng xuất', icon: 'arrow-right-to-line-outline', danger: true },
] as const;

/** Khoá mục cha của submenu chọn kiểu header + nhãn hiển thị của nó. */
export const HEADER_SKIN_MENU_KEY = 'header-skin';
export const HEADER_SKIN_MENU_LABEL = 'Kiểu header';

/** Tiền tố khoá mục LÁ: `skin:hex`, `skin:square`… — `handleSelect` tách tiền tố để biết có phải mục kiểu header không. */
export const HEADER_SKIN_OPTION_PREFIX = 'skin:';

export const HEADER_SKIN_LABEL = {
  slant: 'Vát chéo',
  chevron: 'Mũi tên',
  hex: 'Cắt góc',
  tag: 'Nhãn',
  stair: 'Bậc thang',
  tray: 'Khay',
  'tray-flip': 'Khay ngược',
  'tray-slant': 'Khay vát',
  command: 'Chỉ huy',
  facet: 'Vát sáng',
  square: 'Vuông',
  folder: 'Thẻ',
  solid: 'Khối đặc',
  gauge: 'Thang vạch',
  line: 'Gạch chân',
} satisfies Record<HeaderSkin, string>;

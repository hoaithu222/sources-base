import { cn } from '@/shared/utils/style/cn';
import {
  POPUP_ITEM_CHECKED_CLASS,
  POPUP_ITEM_CLASS,
  POPUP_ITEM_ICON_CLASS,
  popupSurface,
} from '@/shared/ui/overlays/popup-surface.theme';
import { HUD_LIT_FILL } from '@/shared/ui/primitives/hud.theme';

/**
 * menu.theme — class dùng chung của Menu và ContextMenu: MENU_CONTENT / MENU_ITEM / MENU_ICON_CLASSES
 *              (+ MENU_HEADER / MENU_SEPARATOR / MENU_RADIO_ITEM / MENU_SUB_TRIGGER_CLASSES của Menu).
 *
 * Dùng:   className={MENU_ITEM_CLASSES[option.danger ? 'danger' : 'default']} · icon bọc MENU_ICON_CLASSES[tone]
 * Trục:   tone default | danger
 * Sửa:    bề mặt / dòng gốc → popup-surface.theme.ts · màu theo tone → MENU_ITEM_CLASSES · MENU_ICON_CLASSES
 * Lưu ý:  ⛔ `danger` đổi CẢ nền highlight, chữ và vạch trái sang error — chỉ đổi màu chữ thì lúc trỏ tới
 *         dòng quay về chữ trung tính + vạch xanh. Icon đọc trạng thái highlight qua `group` của dòng.
 */

type MenuTone = 'default' | 'danger';

export const MENU_CONTENT_CLASSES = cn(
  popupSurface(),
  'min-w-[220px] max-w-[calc(100vw-1rem)]',
  'max-h-[var(--radix-popper-available-height)] overflow-y-auto',
);

export const MENU_ITEM_CLASSES = {
  default: cn(POPUP_ITEM_CLASS, 'group'),
  danger: cn(
    POPUP_ITEM_CLASS,
    'group text-error before:bg-error',
    'data-[highlighted]:bg-error/10 data-[highlighted]:text-error',
  ),
} satisfies Record<MenuTone, string>;

/** Dòng LỰA CHỌN ĐƠN của `Menu` (`checked` ở `MenuOption`): dòng menu + công thức dòng đang chọn DÙNG CHUNG với `Dropdown`. */
export const MENU_RADIO_ITEM_CLASSES = cn(MENU_ITEM_CLASSES.default, POPUP_ITEM_CHECKED_CLASS);

/** Dòng mở SUBMENU: giữ highlight khi submenu đang mở (không thì rê sang submenu là dòng cha tắt sáng). */
export const MENU_SUB_TRIGGER_CLASSES = cn(
  MENU_ITEM_CLASSES.default,
  'data-[state=open]:bg-bg-nav-hover data-[state=open]:text-fg-heading',
);

export const MENU_ICON_CLASSES = {
  default: cn(
    POPUP_ITEM_ICON_CLASS,
    'transition-[color,filter] duration-150 group-data-[highlighted]:text-action-base',
    'dark:group-data-[highlighted]:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-primary-5)_80%,transparent)]',
  ),
  danger: cn(
    POPUP_ITEM_ICON_CLASS,
    'text-error transition-[filter] duration-150',
    'dark:group-data-[highlighted]:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-error)_70%,transparent)]',
  ),
} satisfies Record<MenuTone, string>;

/** Khối `header` của Menu (tối: mặt rọi sáng như control) và vạch ngăn dưới nó (tối: vạch sáng mờ hai đầu). */
export const MENU_HEADER_CLASSES = cn('px-3 py-2.5', HUD_LIT_FILL);

export const MENU_SEPARATOR_CLASSES = cn(
  'my-1 h-px bg-divider-default',
  'dark:bg-transparent dark:bg-linear-to-r dark:from-transparent dark:via-hud-5/45 dark:to-transparent',
);

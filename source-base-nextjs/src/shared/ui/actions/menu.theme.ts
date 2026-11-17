import { cn } from '@/shared/utils/style/cn';
import {
  POPUP_ITEM_CHECK_CLASS,
  POPUP_ITEM_CHECKED_CLASS,
  POPUP_ITEM_CLASS,
  POPUP_ITEM_ICON_CLASS,
  POPUP_LIST_CLASS,
  popupSurface,
} from '@/shared/ui/overlays/popup-surface.theme';

/**
 * menu.theme — class dùng chung của Menu và ContextMenu: MENU_CONTENT / MENU_ITEM / MENU_ICON_CLASSES
 *              (+ MENU_HEADER / MENU_SEPARATOR / MENU_SHORTCUT / MENU_RADIO_ITEM / MENU_SUB_* của Menu).
 *
 * Dùng:   className={MENU_ITEM_CLASSES[option.danger ? 'danger' : 'default']} · icon bọc MENU_ICON_CLASSES[tone]
 * Trục:   tone default | danger
 * Sửa:    bề mặt / dòng gốc → popup-surface.theme.ts · màu theo tone → MENU_ITEM_CLASSES · MENU_ICON_CLASSES
 * Lưu ý:  Menu macOS ở cả hai theme: dòng cao 32px (chạm 40px), bo `md` (bán kính panel 12 − đệm 4), dòng đang trỏ
 *         (chuột / phím) = nền ĐẶC primary-6 + chữ, icon, phím tắt TRẮNG; `danger` đỏ, trỏ tới thì nền đỏ chữ trắng.
 *         Không vạch trái, không dải sáng loang. Icon đọc trạng thái dòng qua `group`.
 */

type MenuTone = 'default' | 'danger';

export const MENU_CONTENT_CLASSES = cn(
  popupSurface(),
  POPUP_LIST_CLASS,
  'min-w-[220px] max-w-[calc(100vw-1rem)]',
  'max-h-[var(--radix-popper-available-height)] overflow-y-auto',
);

/** Dòng gốc: cao 32px (chữ dài xuống dòng thì cao theo) · đệm ngang 8px · bo `md`; máy chạm 40px cho ngón tay. */
const MENU_ITEM_BASE_CLASSES = cn(
  POPUP_ITEM_CLASS,
  'group min-h-8 gap-2 rounded-md px-2 py-1.5 touch:min-h-10',
);

export const MENU_ITEM_CLASSES = {
  default: cn(
    MENU_ITEM_BASE_CLASSES,
    'data-[highlighted]:bg-primary-6 data-[highlighted]:text-neutral-0',
  ),
  danger: cn(
    MENU_ITEM_BASE_CLASSES,
    'text-error',
    'data-[highlighted]:bg-error-6 data-[highlighted]:text-neutral-0',
  ),
} satisfies Record<MenuTone, string>;

/**
 * Dòng LỰA CHỌN ĐƠN của `Menu` (`checked` ở `MenuOption`): dòng menu + công thức dòng đang chọn DÙNG CHUNG với `Dropdown`.
 * Dòng đang chọn mà được trỏ tới vẫn nền đặc chữ trắng (hai thuộc tính `data-*` — thắng nền nhạt của dòng chọn).
 */
export const MENU_RADIO_ITEM_CLASSES = cn(
  MENU_ITEM_CLASSES.default,
  POPUP_ITEM_CHECKED_CLASS,
  'data-[highlighted]:data-[state=checked]:bg-primary-6',
  'data-[highlighted]:data-[state=checked]:text-neutral-0',
);

/** Dấu ✓ của dòng lựa chọn đơn: `text-link`, chuyển trắng khi dòng được trỏ. */
export const MENU_CHECK_CLASSES = cn(
  POPUP_ITEM_CHECK_CLASS,
  'group-data-[highlighted]:text-neutral-0',
);

/**
 * Dòng mở SUBMENU: giữ highlight khi submenu đang mở (không thì rê sang submenu là dòng cha tắt sáng) — nền đặc như
 * macOS.
 */
export const MENU_SUB_TRIGGER_CLASSES = cn(
  MENU_ITEM_CLASSES.default,
  'data-[state=open]:bg-primary-6 data-[state=open]:text-neutral-0',
);

export const MENU_ICON_CLASSES = {
  default: cn(
    POPUP_ITEM_ICON_CLASS,
    'transition-[color] duration-150',
    'group-data-[highlighted]:text-neutral-0 group-data-[state=open]:text-neutral-0',
  ),
  danger: cn(
    POPUP_ITEM_ICON_CLASS,
    'text-error transition-[color] duration-150',
    'group-data-[highlighted]:text-neutral-0',
  ),
} satisfies Record<MenuTone, string>;

/** Mũi tên › cuối dòng mở submenu: nhỏ, mờ; chuyển trắng theo dòng (đang trỏ / submenu đang mở). */
export const MENU_SUB_CHEVRON_CLASSES = cn(
  POPUP_ITEM_ICON_CLASS,
  '-mr-1 size-4',
  'group-data-[highlighted]:text-neutral-0 group-data-[state=open]:text-neutral-0',
);

/** Gợi ý phím tắt cuối dòng (`MenuOption.shortcut`): chữ nhỏ mờ, căn phải; chuyển trắng 80% khi dòng được trỏ. */
export const MENU_SHORTCUT_CLASSES = cn(
  'ml-auto shrink-0 pl-4 text-caption-12 tabular-nums tracking-wide text-fg-faint',
  'group-data-[highlighted]:text-neutral-0/80',
);

/** Khối `header` của Menu. */
export const MENU_HEADER_CLASSES = 'px-3 py-2';

/** Vạch ngăn nhóm lệnh (`MenuOption.separatorBefore`, dưới `header`): 1px thụt hai đầu như macOS. */
export const MENU_SEPARATOR_CLASSES = 'mx-2.5 my-1 h-px bg-divider-default';

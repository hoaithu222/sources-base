import { cn } from '@/shared/utils/style/cn';
import { FIELD_POPUP_CLASS, FIELD_POPUP_SEARCH_CLASS } from '@/shared/ui/inputs/field.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import type { DropdownTreeSelectSize } from './dropdown-tree-select.types';

/** dropdown-tree-select.theme — bảng class của DropdownTreeSelect (khung / focus / tắt: `fieldSurface`). */

export const DROPDOWN_TREE_SELECT_TRIGGER_BASE_CLASSES = cn(
  'inline-flex w-full min-w-[200px] cursor-pointer items-center justify-between gap-2',
  'px-3 py-1 text-left text-body-14 text-fg-heading',
);

export const DROPDOWN_TREE_SELECT_SIZE_CLASSES = {
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-10',
} satisfies Record<DropdownTreeSelectSize, string>;

export const DROPDOWN_TREE_SELECT_CONTENT_CLASSES = cn(
  FIELD_POPUP_CLASS,
  'w-[var(--radix-popover-trigger-width)] min-w-[240px] max-w-[calc(100vw-1rem)]',
  'max-h-[var(--radix-popper-available-height)] overflow-y-auto',
);

/** Hàng tìm + nút mở / thu cây: cùng bề mặt hàng tìm của panel (FIELD_POPUP_SEARCH_CLASS), chỉ siết khoảng cách. */
export const DROPDOWN_TREE_SELECT_HEADER_CLASSES = cn(FIELD_POPUP_SEARCH_CLASS, 'gap-1 py-2');

export const DROPDOWN_TREE_SELECT_ICON_BUTTON_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm',
  'text-fg-on-chrome-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-primary-5/10 hover:text-link',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

export const DROPDOWN_TREE_SELECT_ICON_CLASSES = {
  idle: 'shrink-0 text-fg-on-chrome-muted',
  active: 'shrink-0 text-link',
  disabled: 'shrink-0 text-fg-faint',
} satisfies Record<'idle' | 'active' | 'disabled', string>;

export const DROPDOWN_TREE_SELECT_CHIP_CLASSES =
  'min-w-0 max-w-full animate-pop-in motion-reduce:animate-none';

export const DROPDOWN_TREE_SELECT_TRAILING_CLASSES =
  'shrink-0 ml-auto text-caption-12-medium text-fg-muted';

import { cn } from '@/shared/utils/style/cn';
import { FIELD_POPUP_CLASS, FIELD_POPUP_ITEM_CLASS } from '@/shared/ui/inputs/field.theme';
import type { MultiSelectSize } from './multi-select.types';

/** multi-select.theme — bảng class của MultiSelect (viền / focus / tắt của trigger do `fieldSurface` lo). */

export const MULTI_SELECT_TRIGGER_BASE_CLASSES = cn(
  'inline-flex w-full min-w-[180px] cursor-pointer items-center justify-between gap-2',
  'px-3 py-1 text-left text-body-14 text-fg-heading',
);

export const MULTI_SELECT_SIZE_CLASSES = {
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-10',
} satisfies Record<MultiSelectSize, string>;

export const MULTI_SELECT_CHIPS_CLASSES = {
  wrap: 'flex min-w-0 flex-1 flex-wrap items-center gap-1',
  nowrap: 'flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden',
} satisfies Record<'wrap' | 'nowrap', string>;

export const MULTI_SELECT_CONTENT_CLASSES = cn(
  FIELD_POPUP_CLASS,
  'min-w-[var(--radix-popover-trigger-width)]',
);

export const MULTI_SELECT_ITEM_CLASSES = cn(
  FIELD_POPUP_ITEM_CLASS,
  'w-full',
  'hover:bg-bg-nav-hover',
  'data-[disabled]:opacity-100 data-[disabled]:hover:bg-transparent',
);

/** Dòng "Chọn tất cả" (giữa ô tìm và danh sách): hàng đầu panel phủ hết bề ngang + vạch đáy — không thụt / bo như dòng option. */
export const MULTI_SELECT_ALL_ROW_CLASSES = cn(
  MULTI_SELECT_ITEM_CLASSES,
  'mx-0 max-w-none rounded-none border-b border-divider-nav',
);

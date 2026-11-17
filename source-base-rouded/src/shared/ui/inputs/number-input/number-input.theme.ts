import { cn } from '@/shared/utils/style/cn';
import { FIELD_CONTROL_CLASS } from '../field.theme';

/** number-input.theme — bố cục NumberInput (khung · vùng nhập · đơn vị); variant / viền: FIELD_* chung với Input. */

export const NUMBER_INPUT_WRAPPER_BASE_CLASSES = 'inline-flex w-full items-stretch';

export const NUMBER_INPUT_FIELD_CLASSES = 'flex min-w-0 flex-1 items-center gap-2 px-3';

/** Số CĂN PHẢI + `tabular-nums` (hàng đơn vị thẳng cột, như bảng nhập liệu); nơi cần căn trái truyền `className="text-left"`. */
export const NUMBER_INPUT_INPUT_CLASSES = cn(FIELD_CONTROL_CLASS, 'h-full text-right tabular-nums');

export const NUMBER_INPUT_AFFIX_CLASSES =
  'inline-flex shrink-0 items-center text-body-14 tabular-nums text-fg-muted';

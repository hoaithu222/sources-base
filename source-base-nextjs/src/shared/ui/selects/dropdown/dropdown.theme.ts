import { cn } from '@/shared/utils/style/cn';
import {
  FIELD_CHIP_CLEAR_CLASS,
  FIELD_POPUP_CLASS,
  FIELD_POPUP_ITEM_CLASS,
} from '@/shared/ui/inputs/field.theme';
import {
  POPUP_ITEM_CHECKED_CLASS,
  POPUP_ITEM_CHECK_CLASS,
} from '@/shared/ui/overlays/popup-surface.theme';
import type { DropdownOptionTone } from './dropdown.types';

/**
 * dropdown.theme — bảng class của Dropdown (trigger · panel · dòng option · tone).
 *
 * Sửa:    trigger → DROPDOWN_TRIGGER_BASE_CLASSES · panel → DROPDOWN_CONTENT_CLASSES
 *         · dòng + trạng thái đang chọn → DROPDOWN_ITEM_* · dấu radio → DROPDOWN_RADIO_*
 *         · màu theo tone → DROPDOWN_TONE_CLASSES
 * Lưu ý:  viền / nền / focus / ring / tắt của trigger do `fieldSurface` lo; ô tìm kiếm + "Không có kết quả"
 *         dùng FIELD_POPUP_SEARCH_* / FIELD_POPUP_EMPTY_CLASS (field.theme).
 */

interface DropdownToneClasses {
  /** Chữ nhãn trên trigger. */
  text: string;
  /** Dòng option: giữ màu tone cả khi highlight / đang chọn, nền nhạt khi đang chọn. */
  item: string;
  check: string;
}

export const DROPDOWN_TRIGGER_BASE_CLASSES = cn(
  'inline-flex w-full min-w-[180px] cursor-pointer items-center justify-between gap-2',
  'px-3 text-left text-body-14 text-fg-heading',
);

export const DROPDOWN_CONTENT_CLASSES = cn(
  FIELD_POPUP_CLASS,
  'min-w-[var(--radix-select-trigger-width)]',
);

/** Dòng option: dòng popup chung + công thức dòng đang chọn dùng chung (`POPUP_ITEM_CHECKED_CLASS`; tone đổi màu chữ / nền chọn). */
export const DROPDOWN_ITEM_CLASSES = cn(FIELD_POPUP_ITEM_CLASS, 'group', POPUP_ITEM_CHECKED_CLASS);

export const DROPDOWN_ITEM_ICON_CLASSES = 'shrink-0 text-fg-on-chrome-muted';

export const DROPDOWN_ITEM_META_CLASSES =
  'shrink-0 whitespace-nowrap text-caption-12 tabular-nums text-fg-on-chrome-muted';

export const DROPDOWN_ITEM_CHECK_CLASSES = POPUP_ITEM_CHECK_CLASS;

export const DROPDOWN_ITEM_CLEAR_CLASSES = cn(FIELD_CHIP_CLEAR_CLASS, 'size-5');

/** Vòng radio của `variant="radio"`: cùng công thức `Radio` (viền `border-strong`, chọn = viên đặc `primary-6`). */
export const DROPDOWN_RADIO_RING_CLASSES = cn(
  'inline-flex size-4 shrink-0 items-center justify-center rounded-full border',
  'border-border-strong bg-bg-input',
  'transition-[color,background-color,border-color,box-shadow] duration-150 ease-out',
  'group-data-[highlighted]:border-primary-5',
  'group-data-[state=checked]:border-primary-6 group-data-[state=checked]:bg-primary-6',
);

export const DROPDOWN_RADIO_DOT_CLASSES = 'block size-1.5 rounded-full bg-neutral-0';

export const DROPDOWN_TONE_CLASSES = {
  primary: {
    text: 'text-link',
    item: cn(
      'text-link data-[highlighted]:text-link',
      'data-[state=checked]:bg-primary-5/15 data-[state=checked]:text-link',
    ),
    check: 'text-link',
  },
  success: {
    text: 'text-success',
    item: cn(
      'text-success data-[highlighted]:text-success',
      'data-[state=checked]:bg-success/15 data-[state=checked]:text-success',
    ),
    check: 'text-success',
  },
  warning: {
    text: 'text-warning',
    item: cn(
      'text-warning data-[highlighted]:text-warning',
      'data-[state=checked]:bg-warning/15 data-[state=checked]:text-warning',
    ),
    check: 'text-warning',
  },
  error: {
    text: 'text-error',
    item: cn(
      'text-error data-[highlighted]:text-error',
      'data-[state=checked]:bg-error/15 data-[state=checked]:text-error',
    ),
    check: 'text-error',
  },
  info: {
    text: 'text-info',
    item: cn(
      'text-info data-[highlighted]:text-info',
      'data-[state=checked]:bg-info/15 data-[state=checked]:text-info',
    ),
    check: 'text-info',
  },
  neutral: {
    text: 'text-fg-body',
    item: cn(
      'text-fg-body data-[highlighted]:text-fg-heading',
      'data-[state=checked]:bg-neutral-5/15 data-[state=checked]:text-fg-heading',
    ),
    check: 'text-fg-body',
  },
} satisfies Record<DropdownOptionTone, DropdownToneClasses>;

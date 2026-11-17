import type { ClassValue } from 'clsx';
import {
  POPUP_ITEM_CLASS,
  POPUP_LIST_CLASS,
  popupSurface,
} from '@/shared/ui/overlays/popup-surface.theme';
import { cn } from '@/shared/utils/style/cn';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';

/**
 * field.theme — bề mặt DUY NHẤT của mọi ô nhập (Input, Textarea, NumberInput, Dropdown, MultiSelect, picker…).
 *
 * Dùng:   cn(fieldSurface({ focusMode: 'within', invalid, disabled, readOnly }), FIELD_HEIGHT[size], className)
 * Trục:   focusMode within (có <input> thật bên trong) | trigger (nút mở panel) · invalid · disabled · readOnly
 *         · variant glass | outline | filled | ghost · border default | none | bottomLine (Input + NumberInput)
 * Sửa:    khung / focus / lỗi → FIELD_SURFACE_STATE_CLASSES · chỉ đọc / tắt → FIELD_SURFACE_READONLY_CLASSES /
 *         FIELD_SURFACE_DISABLED_CLASSES · lõm → FIELD_RECESS_CLASS · cao → FIELD_HEIGHT · variant / viền →
 *         FIELD_VARIANT_CLASSES / FIELD_BORDER_CLASSES · ruột <input> → FIELD_CONTROL_CLASS · focus nút / ô tích →
 *         CONTROL_FOCUS_RING_CLASS · icon / ✕ → FIELD_ICON_CLASS / FIELD_CLEAR_*
 * Lưu ý:  ⛔ ô `invalid` GIỮ đỏ cả khi hover / focus nên mỗi ô tự mang đủ state — docs/notes/components/inputs.md.
 *         Khung `rounded-md` (màu qua token tự lật, KHÔNG `dark:`); `border` none | bottomLine trả về `rounded-none`.
 *         ⛔ KHÔNG thêm utility `autofill:` (nhất là `box-shadow` phủ màu) — `src/styles/overrides/autofill.css` lo.
 */

/** Thang cỡ của mọi ô nhập một dòng: `sm` 32px · `md` 36px (mặc định) · `lg` 40px. */
export type FieldSize = 'sm' | 'md' | 'lg';

type FieldFocusMode = 'within' | 'trigger';
type FieldValidity = 'valid' | 'invalid';
type FieldVariant = 'glass' | 'outline' | 'filled' | 'ghost';
type FieldBorder = 'default' | 'none' | 'bottomLine';

interface FieldSurfaceOptions {
  focusMode?: FieldFocusMode;
  invalid?: boolean;
  /** `true` → nền chìm `bg-subtle` + con trỏ cấm, bỏ hẳn hover / focus (ô tắt không "sáng" khi rê). */
  disabled?: boolean;
  /** `true` (chỉ `within`, ô không lỗi) → nền `bg-subtle` phẳng, không lõm, rê không đậm viền; vẫn focus / chọn chữ. */
  readOnly?: boolean;
  /** `true` → bỏ viền bắt sáng `rim-soft` + lõm: ô không khung / nền đặc (`filled`, `ghost`, `border` none | bottomLine). */
  flat?: boolean;
  className?: ClassValue;
}

export const FIELD_HEIGHT = {
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-10',
} satisfies Record<FieldSize, string>;

/** Khung chung: `group/field` để icon / mũi tên đổi màu theo state của khung (`--field-tone`: accent, ô lỗi → đỏ). */
const FIELD_SURFACE_BASE_CLASSES = cn(
  'group/field relative w-full rounded-md border bg-bg-input',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
);

/**
 * Focus bàn phím của control nhỏ (Button · Checkbox · Radio · Toggle) — CÙNG quầng với ô nhập: quầng 3px
 * `ring-focus` 35% (Checkbox / Radio tự đổi viền sang `primary-6`), ở cả hai theme. ⛔ KHÔNG `ring-offset`.
 */
export const CONTROL_FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring-focus/35';

/** Lõm: bóng trong mảnh dưới mép trên — ô "chìm" như text field macOS; `flat` / chỉ đọc / tắt bỏ. */
const FIELD_RECESS_CLASS = 'inset-shadow-[0_1px_2px_var(--color-shadow-popup)]';

/**
 * Rê = viền đậm `border-strong`; focus / mở = viền 1px `primary-6` + quầng mềm 3px `ring-focus` 35% (vòng focus
 * accent của macOS, như `CONTROL_FOCUS_RING_CLASS`); ô lỗi: viền + quầng đỏ.
 */
const FIELD_WITHIN_FOCUS_CLASSES = cn(
  'focus-within:border-primary-6 focus-within:ring-3 focus-within:ring-ring-focus/35',
  'focus-within:hover:border-primary-6',
);

const FIELD_SURFACE_STATE_CLASSES = {
  within: {
    valid: cn(
      'border-border-default [--field-tone:var(--color-primary-5)]',
      'hover:border-border-strong',
      FIELD_WITHIN_FOCUS_CLASSES,
    ),
    invalid: cn(
      'border-error [--field-tone:var(--color-error)]',
      'hover:border-error',
      'focus-within:border-error focus-within:ring-3 focus-within:ring-error/25',
      'focus-within:hover:border-error',
    ),
  },
  trigger: {
    valid: cn(
      'border-border-default outline-none [--field-tone:var(--color-primary-5)]',
      'hover:border-border-strong',
      'focus-visible:border-primary-6 focus-visible:ring-3 focus-visible:ring-ring-focus/35',
      'data-[state=open]:border-primary-6 data-[state=open]:ring-3 data-[state=open]:ring-ring-focus/35',
      'data-[state=open]:hover:border-primary-6',
    ),
    invalid: cn(
      'border-error outline-none [--field-tone:var(--color-error)]',
      'hover:border-error',
      'focus-visible:border-error focus-visible:ring-3 focus-visible:ring-error/25',
      'data-[state=open]:border-error data-[state=open]:ring-3 data-[state=open]:ring-error/25',
      'data-[state=open]:hover:border-error',
    ),
  },
} satisfies Record<FieldFocusMode, Record<FieldValidity, string>>;

/** Nền ô chỉ đọc (`bg-subtle` PHẲNG) — Input / NumberInput ghép SAU variant để `outline` / `ghost` không làm ô trong suốt. */
export const FIELD_READONLY_FILL_CLASS = 'bg-bg-subtle';

/** Ô chỉ đọc (`within`, không lỗi): nền `bg-subtle` PHẲNG — không lõm, rê không đậm viền, focus như ô thường. */
const FIELD_SURFACE_READONLY_CLASSES = cn(
  'border-border-default',
  FIELD_READONLY_FILL_CLASS,
  '[--field-tone:var(--color-primary-5)]',
  FIELD_WITHIN_FOCUS_CLASSES,
);

/**
 * Ô khoá — `within`: nền chìm `bg-subtle`, KHÔNG mờ; chữ `fg-muted` / icon `fg-faint` do `FIELD_CONTROL_CLASS` /
 * `FIELD_ICON_CLASS` tự đổi. `trigger` giữ MỘT lớp mờ 60%: ruột (chip, chấm màu, chữ tông) do component riêng tô.
 */
const FIELD_DISABLED_LOOK = {
  within: 'bg-bg-subtle',
  trigger: 'bg-bg-subtle opacity-60',
} satisfies Record<FieldFocusMode, string>;

const FIELD_SURFACE_DISABLED_CLASSES = {
  valid: 'border-border-default outline-none cursor-not-allowed',
  invalid: 'border-error outline-none cursor-not-allowed',
} satisfies Record<FieldValidity, string>;

/** Class bề mặt ô nhập, vd `fieldSurface({ focusMode: 'trigger', invalid: Boolean(error), disabled })`. */
export function fieldSurface({
  focusMode = 'within',
  invalid = false,
  disabled = false,
  readOnly = false,
  flat = false,
  className,
}: FieldSurfaceOptions = {}): string {
  const validity: FieldValidity = invalid ? 'invalid' : 'valid';
  if (disabled) {
    return cn(
      FIELD_SURFACE_BASE_CLASSES,
      FIELD_SURFACE_DISABLED_CLASSES[validity],
      FIELD_DISABLED_LOOK[focusMode],
      className,
    );
  }
  const isReadOnly = readOnly && !invalid && focusMode === 'within';
  return cn(
    FIELD_SURFACE_BASE_CLASSES,
    isReadOnly ? FIELD_SURFACE_READONLY_CLASSES : FIELD_SURFACE_STATE_CLASSES[focusMode][validity],
    !flat && !invalid && 'rim-soft',
    !flat && !isReadOnly && FIELD_RECESS_CLASS,
    className,
  );
}

/** Nét riêng của `variant` (Input / NumberInput), đặt SAU fieldSurface; ô `invalid` không xoá viền đỏ. */
export const FIELD_VARIANT_CLASSES = {
  glass: { valid: '', invalid: '' },
  outline: { valid: 'bg-transparent', invalid: 'bg-transparent' },
  filled: {
    valid: cn(
      'border-transparent bg-bg-subtle',
      'hover:border-transparent hover:bg-bg-pressed',
      'focus-within:bg-bg-input focus-within:hover:bg-bg-input',
    ),
    invalid: cn(
      'bg-bg-subtle',
      'hover:bg-bg-pressed',
      'focus-within:bg-bg-input focus-within:hover:bg-bg-input',
    ),
  },
  ghost: {
    valid: cn(
      'border-transparent bg-bg-subtle/50',
      'hover:border-transparent hover:bg-bg-subtle',
      'focus-within:bg-bg-subtle',
    ),
    invalid: 'bg-bg-subtle/50 hover:bg-bg-subtle focus-within:bg-bg-subtle',
  },
} satisfies Record<FieldVariant, Record<FieldValidity, string>>;

const FIELD_BORDERLESS_INVALID_CLASSES = cn(
  'rounded-none border-transparent border-b-error bg-transparent',
  'hover:border-transparent hover:border-b-error hover:bg-transparent',
  'focus-within:border-transparent focus-within:border-b-error focus-within:bg-transparent',
  'focus-within:hover:border-transparent focus-within:hover:border-b-error',
  'focus-within:ring-0',
);

/** `border` none | bottomLine: bỏ khung + nền + ring ở mọi state (kể cả nền chỉ đọc); lỗi còn lại một gạch chân đỏ. */
export const FIELD_BORDER_CLASSES = {
  default: { valid: '', invalid: '' },
  none: {
    valid: cn(
      'rounded-none border-transparent bg-transparent',
      'hover:border-transparent hover:bg-transparent',
      'focus-within:border-transparent focus-within:bg-transparent',
      'focus-within:hover:border-transparent',
      'focus-within:ring-0',
    ),
    invalid: FIELD_BORDERLESS_INVALID_CLASSES,
  },
  bottomLine: {
    valid: cn(
      'rounded-none border-transparent bg-transparent',
      'hover:border-transparent hover:border-b-border-strong hover:bg-transparent',
      'focus-within:border-transparent focus-within:border-b-primary-5 focus-within:bg-transparent',
      'focus-within:hover:border-transparent focus-within:hover:border-b-primary-5',
      'focus-within:ring-0',
    ),
    invalid: FIELD_BORDERLESS_INVALID_CLASSES,
  },
} satisfies Record<FieldBorder, Record<FieldValidity, string>>;

export const FIELD_CONTROL_CLASS = cn(
  'w-full min-w-0 flex-1 border-none bg-transparent outline-none',
  'text-body-14 text-fg-heading placeholder:text-fg-faint',
  'caret-primary-5 selection:bg-primary-5/30 selection:text-fg-heading',
  'disabled:cursor-not-allowed disabled:text-fg-muted',
);

/**
 * Ô icon 20px (đầu / cuối ô, mũi tên) màu `fg-muted`; con trỏ theo khung, không thành bàn tay. Ô đang nhập / trigger
 * focus bàn phím / panel mở → màu tông `--field-tone` (accent; lỗi đỏ); ô tắt → `fg-faint`.
 */
export const FIELD_ICON_CLASS = cn(
  'inline-flex size-5 shrink-0 items-center justify-center text-fg-muted',
  'cursor-[inherit] transition-colors duration-150 ease-out',
  'group-has-[:focus-visible]/field:text-(--field-tone) group-focus-visible/field:text-(--field-tone)',
  'group-data-[state=open]/field:text-(--field-tone) group-has-[input:disabled]/field:text-fg-faint',
);

/** Nút ✕ xoá cả ô (icon `FIELD_CLEAR_ICON.all`): vòng rê 24px chiếm chỗ 20px (`-mx-0.5`). */
export const FIELD_CLEAR_BUTTON_CLASS = cn(
  TOUCH_HIT_CLASSES.icon,
  'inline-flex -mx-0.5 size-6 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'text-fg-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-bg-pressed hover:text-fg-heading',
);

/** Nút ✕ gỡ MỘT chip / một lựa chọn (icon cỡ `FIELD_CLEAR_ICON.chip`); rê chuột chuyển đỏ = "gỡ". */
export const FIELD_CHIP_CLEAR_CLASS = cn(
  TOUCH_HIT_CLASSES.icon,
  'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'text-fg-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-error/15 hover:text-error',
);

/** Panel bung + dòng của select / picker: CHÍNH là bề mặt popup chung (popup-surface.theme), không bản riêng. */
export const FIELD_POPUP_CLASS = popupSurface();

export const FIELD_POPUP_ITEM_CLASS = POPUP_ITEM_CLASS;

/** Khung cuộn chứa các dòng của panel (đệm dọc cho dòng thụt) — CHÍNH là `POPUP_LIST_CLASS`. */
export const FIELD_POPUP_LIST_CLASS = POPUP_LIST_CLASS;

/** Hàng tìm kiếm đầu panel (icon + `<input>`) và chính ô nhập của nó; icon (`FIELD_POPUP_SEARCH_ICON_CLASS`) theo `group/search`. */
export const FIELD_POPUP_SEARCH_CLASS = cn(
  'group/search flex items-center gap-3 border-b border-divider-nav px-3 py-2.5',
  'transition-[border-color,box-shadow] duration-150 ease-out',
);

export const FIELD_POPUP_SEARCH_ICON_CLASS =
  'shrink-0 text-fg-on-chrome-muted transition-colors duration-150 ease-out';

export const FIELD_POPUP_SEARCH_INPUT_CLASS = cn(FIELD_CONTROL_CLASS, 'text-fg-on-chrome');

/** Dòng "Không có kết quả" của panel. */
export const FIELD_POPUP_EMPTY_CLASS = 'px-3 py-4 text-center text-body-13 text-fg-on-chrome-muted';

/** Cỡ icon ✕ (px): `chip` nằm trong `<Badge>` · `all` xoá tất cả, bằng cỡ mũi tên xổ cạnh nó. */
export const FIELD_CLEAR_ICON = {
  chip: 8,
  all: 10,
} as const;

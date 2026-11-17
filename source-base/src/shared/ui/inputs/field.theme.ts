import type { ClassValue } from 'clsx';
import { POPUP_ITEM_CLASS, popupSurface } from '@/shared/ui/overlays/popup-surface.theme';
import { cn } from '@/shared/utils/style/cn';
import { HUD_LIT_FILL } from '@/shared/ui/primitives/hud.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';

/**
 * field.theme — bề mặt DUY NHẤT của mọi ô nhập (Input, Textarea, NumberInput, Dropdown, MultiSelect, picker…).
 *
 * Dùng:   cn(fieldSurface({ focusMode: 'within', invalid, disabled }), FIELD_HEIGHT[size], className)
 * Trục:   focusMode within (có <input> thật bên trong) | trigger (nút mở panel) · invalid · disabled
 *         · variant glass | outline | filled | ghost · border default | none | bottomLine (Input + NumberInput)
 * Sửa:    khung / hover / focus / lỗi → FIELD_SURFACE_STATE_CLASSES · tắt → FIELD_SURFACE_DISABLED_CLASSES
 *         · cao → FIELD_HEIGHT · variant / viền → FIELD_VARIANT_CLASSES / FIELD_BORDER_CLASSES
 *         · ruột <input> → FIELD_CONTROL_CLASS
 *         · icon / ✕ / mũi tên → FIELD_ICON_CLASS / FIELD_CLEAR_* / FIELD_CHEVRON_CLASS · panel → FIELD_POPUP_*
 * Lưu ý:  ⛔ ô `invalid` GIỮ đỏ cả khi hover / focus nên mỗi ô tự mang đủ state — docs/notes/components/inputs.md.
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
  /** `true` → mờ 50% + con trỏ cấm, bỏ hẳn hover / focus (ô tắt thì không "sáng" lên khi rê chuột). */
  disabled?: boolean;
  className?: ClassValue;
}

export const FIELD_HEIGHT = {
  sm: 'h-8',
  md: 'h-9',
  lg: 'h-10',
} satisfies Record<FieldSize, string>;

/**
 * Quầng HUD (tối) theo tông `--field-tone` (primary | error, do ô state đặt): `--field-glow` = `HUD_FOCUS_GLOW`
 * viết thành biến để MỘT chuỗi phục vụ mọi selector (focus-within · focus-visible · mở) của cả ô hợp lệ lẫn ô lỗi.
 */
const FIELD_SURFACE_BASE_CLASSES = cn(
  'group/field relative w-full border bg-bg-input',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
  HUD_LIT_FILL,
  '[--field-glow:0_0_0_1px_color-mix(in_srgb,var(--field-tone)_55%,transparent),0_0_16px_-2px_color-mix(in_srgb,var(--field-tone)_55%,transparent),inset_0_0_12px_-4px_color-mix(in_srgb,var(--field-tone)_45%,transparent)]',
);

/** Rê = quầng trong (`HUD_HOVER_GLOW` theo tông); focus / mở = `--field-glow` thay `ring` trơn (tối bỏ ring). */
const FIELD_HOVER_GLOW_CLASSES =
  'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--field-tone)_24%,transparent)]';

const FIELD_WITHIN_GLOW_CLASSES = cn(
  FIELD_HOVER_GLOW_CLASSES,
  'dark:focus-within:ring-0 dark:focus-within:shadow-(--field-glow)',
  'dark:focus-within:hover:shadow-(--field-glow)',
);

const FIELD_TRIGGER_GLOW_CLASSES = cn(
  FIELD_HOVER_GLOW_CLASSES,
  'dark:focus-visible:ring-0 dark:focus-visible:shadow-(--field-glow)',
  'dark:data-[state=open]:ring-0 dark:data-[state=open]:shadow-(--field-glow)',
);

const FIELD_SURFACE_STATE_CLASSES = {
  within: {
    valid: cn(
      'border-border-default [--field-tone:var(--color-primary-5)]',
      'hover:border-primary-5/60',
      'focus-within:border-primary-5 focus-within:ring-1 focus-within:ring-primary-5',
      'focus-within:hover:border-primary-5',
      'dark:hover:border-primary-4/70 dark:focus-within:border-primary-4 dark:focus-within:hover:border-primary-4',
      FIELD_WITHIN_GLOW_CLASSES,
    ),
    invalid: cn(
      'border-error [--field-tone:var(--color-error)]',
      'hover:border-error',
      'focus-within:border-error focus-within:ring-1 focus-within:ring-error',
      'focus-within:hover:border-error',
      FIELD_WITHIN_GLOW_CLASSES,
    ),
  },
  trigger: {
    valid: cn(
      'border-border-default outline-none [--field-tone:var(--color-primary-5)]',
      'hover:border-primary-5/60',
      'focus-visible:border-primary-5 focus-visible:ring-1 focus-visible:ring-primary-5',
      'data-[state=open]:border-primary-5 data-[state=open]:ring-1 data-[state=open]:ring-primary-5',
      'data-[state=open]:hover:border-primary-5',
      'dark:hover:border-primary-4/70 dark:focus-visible:border-primary-4 dark:data-[state=open]:border-primary-4',
      'dark:data-[state=open]:hover:border-primary-4',
      FIELD_TRIGGER_GLOW_CLASSES,
    ),
    invalid: cn(
      'border-error outline-none [--field-tone:var(--color-error)]',
      'hover:border-error',
      'focus-visible:border-error focus-visible:ring-1 focus-visible:ring-error',
      'data-[state=open]:border-error data-[state=open]:ring-1 data-[state=open]:ring-error',
      'data-[state=open]:hover:border-error',
      FIELD_TRIGGER_GLOW_CLASSES,
    ),
  },
} satisfies Record<FieldFocusMode, Record<FieldValidity, string>>;

/** Sọc chéo mờ của ô khoá (tối) — thay mặt rọi sáng: nhìn là biết "không gõ được", không chỉ dựa vào độ mờ. */
const FIELD_DISABLED_HATCH =
  'dark:bg-[repeating-linear-gradient(135deg,transparent_0_7px,color-mix(in_srgb,var(--color-neutral-0)_5%,transparent)_7px_8px)]';

const FIELD_SURFACE_DISABLED_CLASSES = {
  valid: cn(
    'border-border-default outline-none opacity-50 cursor-not-allowed',
    FIELD_DISABLED_HATCH,
  ),
  invalid: cn('border-error outline-none opacity-50 cursor-not-allowed', FIELD_DISABLED_HATCH),
} satisfies Record<FieldValidity, string>;

/** Class bề mặt ô nhập, vd `fieldSurface({ focusMode: 'trigger', invalid: Boolean(error), disabled })`. */
export function fieldSurface({
  focusMode = 'within',
  invalid = false,
  disabled = false,
  className,
}: FieldSurfaceOptions = {}): string {
  const validity: FieldValidity = invalid ? 'invalid' : 'valid';
  return cn(
    FIELD_SURFACE_BASE_CLASSES,
    disabled
      ? FIELD_SURFACE_DISABLED_CLASSES[validity]
      : FIELD_SURFACE_STATE_CLASSES[focusMode][validity],
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
      'hover:border-transparent hover:bg-bg-pressed dark:hover:border-transparent',
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
      'border-transparent bg-bg-subtle/50 dark:bg-none',
      'hover:border-transparent hover:bg-bg-subtle dark:hover:border-transparent',
      'focus-within:bg-bg-subtle',
    ),
    invalid: cn('bg-bg-subtle/50 dark:bg-none', 'hover:bg-bg-subtle', 'focus-within:bg-bg-subtle'),
  },
} satisfies Record<FieldVariant, Record<FieldValidity, string>>;

/** Không còn khung để rọi sáng / phát quầng: tắt mặt `HUD_LIT_FILL` và mọi quầng tối của `fieldSurface`. */
const FIELD_BORDERLESS_DARK_CLASSES = cn(
  'dark:bg-none dark:hover:shadow-none',
  'dark:focus-within:shadow-none dark:focus-within:hover:shadow-none',
);

/** `border` none | bottomLine: bỏ khung + nền + ring ở mọi state; lỗi còn lại một gạch chân đỏ. */
export const FIELD_BORDER_CLASSES = {
  default: { valid: '', invalid: '' },
  none: {
    valid: cn(
      'border-transparent bg-transparent',
      'hover:border-transparent hover:bg-transparent',
      'focus-within:border-transparent focus-within:bg-transparent',
      'focus-within:hover:border-transparent',
      'focus-within:ring-0',
      'dark:hover:border-transparent dark:focus-within:border-transparent',
      'dark:focus-within:hover:border-transparent',
      FIELD_BORDERLESS_DARK_CLASSES,
    ),
    invalid: cn(
      'border-transparent border-b-error bg-transparent',
      'hover:border-transparent hover:border-b-error hover:bg-transparent',
      'focus-within:border-transparent focus-within:border-b-error focus-within:bg-transparent',
      'focus-within:hover:border-transparent focus-within:hover:border-b-error',
      'focus-within:ring-0',
      FIELD_BORDERLESS_DARK_CLASSES,
    ),
  },
  bottomLine: {
    valid: cn(
      'border-transparent bg-transparent',
      'hover:border-transparent hover:border-b-border-strong hover:bg-transparent',
      'focus-within:border-transparent focus-within:border-b-primary-5 focus-within:bg-transparent',
      'focus-within:hover:border-transparent focus-within:hover:border-b-primary-5',
      'focus-within:ring-0',
      'dark:hover:border-transparent dark:hover:border-b-border-strong',
      'dark:focus-within:border-transparent dark:focus-within:border-b-primary-4',
      'dark:focus-within:hover:border-transparent dark:focus-within:hover:border-b-primary-4',
      FIELD_BORDERLESS_DARK_CLASSES,
    ),
    invalid: cn(
      'border-transparent border-b-error bg-transparent',
      'hover:border-transparent hover:border-b-error hover:bg-transparent',
      'focus-within:border-transparent focus-within:border-b-error focus-within:bg-transparent',
      'focus-within:hover:border-transparent focus-within:hover:border-b-error',
      'focus-within:ring-0',
      FIELD_BORDERLESS_DARK_CLASSES,
    ),
  },
} satisfies Record<FieldBorder, Record<FieldValidity, string>>;

export const FIELD_CONTROL_CLASS = cn(
  'w-full min-w-0 flex-1 border-none bg-transparent outline-none',
  'text-body-14 text-fg-heading placeholder:text-fg-faint',
  'caret-primary-5 selection:bg-primary-5/30 selection:text-fg-heading',
  'disabled:cursor-not-allowed',
);

/**
 * Ô icon 20px (đầu / cuối ô, mũi tên); con trỏ theo khung chứ không thành bàn tay của SystemIcon. Tối: sáng
 * `primary-4` khi ô đang nhập (`<input>` bên trong focus) / trigger focus bàn phím / panel mở.
 */
export const FIELD_ICON_CLASS = cn(
  'inline-flex size-5 shrink-0 items-center justify-center text-fg-muted',
  'cursor-[inherit] transition-colors duration-150 ease-out',
  'dark:group-has-[:focus-visible]/field:text-primary-4 dark:group-focus-visible/field:text-primary-4',
  'dark:group-data-[state=open]/field:text-primary-4',
);

/** Mũi tên xổ của trigger: xoay 180° khi panel mở (khung `fieldSurface` là `group/field`). */
export const FIELD_CHEVRON_CLASS = cn(
  FIELD_ICON_CLASS,
  'transition-[color,rotate] duration-150 ease-out group-data-[state=open]/field:rotate-180',
  'motion-reduce:transition-none',
);

/** Nút ✕ xoá giá trị của cả ô (icon cỡ `FIELD_CLEAR_ICON.all`); tối: rê chuột phát quầng tròn. */
export const FIELD_CLEAR_BUTTON_CLASS = cn(
  TOUCH_HIT_CLASSES.icon,
  'inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'text-fg-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-bg-pressed hover:text-fg-heading',
  'dark:hover:bg-primary-5/15 dark:hover:text-primary-3',
  'dark:hover:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-5)_45%,transparent)]',
);

/** Nút ✕ gỡ MỘT chip / một lựa chọn (icon cỡ `FIELD_CLEAR_ICON.chip`); rê chuột chuyển đỏ = "gỡ". */
export const FIELD_CHIP_CLEAR_CLASS = cn(
  TOUCH_HIT_CLASSES.icon,
  'inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full',
  'text-fg-muted transition-[color,background-color,box-shadow] duration-150 ease-out',
  'hover:bg-error/15 hover:text-error',
  'dark:hover:shadow-[0_0_6px_color-mix(in_srgb,var(--color-error)_50%,transparent)]',
);

/** Chip GIÁ TRỊ trên trigger (Badge `neutral` tinted): tối ngả `sky` đặc + chữ sáng — khớp Badge tinted tối, không ngả brand. */
export const FIELD_CHIP_TINT_CLASS = 'dark:bg-sky-5/16 dark:text-sky-2 dark:ring-sky-5/45';

/** Panel bung + dòng của select / picker: CHÍNH là bề mặt popup chung (popup-surface.theme), không bản riêng. */
export const FIELD_POPUP_CLASS = popupSurface();

export const FIELD_POPUP_ITEM_CLASS = POPUP_ITEM_CLASS;

/**
 * Hàng tìm kiếm đầu panel (icon + `<input>`) và chính ô nhập của nó. Tối: mặt rọi sáng như ô nhập, đang gõ thì vạch
 * đáy sáng + quầng sát đáy; icon (`FIELD_POPUP_SEARCH_ICON_CLASS`) sáng theo `group/search`.
 */
export const FIELD_POPUP_SEARCH_CLASS = cn(
  'group/search flex items-center gap-3 border-b border-divider-nav px-3 py-2.5',
  'transition-[border-color,box-shadow] duration-150 ease-out',
  HUD_LIT_FILL,
  'dark:focus-within:border-primary-4/70',
  'dark:focus-within:shadow-[inset_0_-8px_10px_-8px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
);

export const FIELD_POPUP_SEARCH_ICON_CLASS = cn(
  'shrink-0 text-fg-on-chrome-muted transition-colors duration-150 ease-out',
  'dark:group-focus-within/search:text-primary-4',
);

export const FIELD_POPUP_SEARCH_INPUT_CLASS = cn(FIELD_CONTROL_CLASS, 'text-fg-on-chrome');

/** Dòng "Không có kết quả" của panel. */
export const FIELD_POPUP_EMPTY_CLASS = 'px-3 py-4 text-center text-body-13 text-fg-on-chrome-muted';

/** Cỡ icon ✕ (px): `chip` nằm trong `<Badge>` · `all` xoá tất cả, bằng cỡ mũi tên xổ cạnh nó. */
export const FIELD_CLEAR_ICON = {
  chip: 8,
  all: 10,
} as const;

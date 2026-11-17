import { CONTROL_FOCUS_RING_CLASS } from '@/shared/ui/inputs/field.theme';
import { cn } from '@/shared/utils/style/cn';

import type { ButtonSize, ButtonSkin, ButtonVariant } from './button.types';

/**
 * button.theme.ts — bảng class của `Button`: khung · cỡ · tông × kiểu · loading · chuyển động nhỏ.
 *
 * Dùng:   cn(BUTTON_BASE_CLASSES, BUTTON_SIZE_CLASSES[size], BUTTON_SKIN_CLASSES[skin][variant], …) trong `Button.tsx`
 * Lưu ý:  MỘT diện mạo cho cả hai theme (control macOS) — màu đi qua token (`action-*`, `error`, `bg-*`, `fg-*`) nên tự lật
 *         theo theme; chỉ thêm `dark:` khi một bậc số của ramp không đọc được trên nền tối (vd `neutral-4`).
 *         `::after` = vùng chạm `touch:`. Lý do thiết kế: docs/notes/components/actions.md (## Button)
 */

/** Khoá: mặt xám `bg-subtle` + viền `border-default` + chữ `fg-faint` (không mờ); `loading` giữ màu. */
const BUTTON_DISABLED_CLASSES = cn(
  'disabled:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none',
  'disabled:not-aria-busy:border-border-default disabled:not-aria-busy:bg-bg-subtle',
  'disabled:not-aria-busy:bg-none disabled:not-aria-busy:text-fg-faint',
);

export const BUTTON_BASE_CLASSES = cn(
  'group/button relative inline-flex items-center justify-center cursor-pointer rounded-md',
  "touch:after:absolute touch:after:-inset-x-1 touch:after:content-['']",
  'transition-[color,border-color,background-color,box-shadow,opacity,translate,scale,filter] duration-150 ease-out',
  'motion-safe:active:scale-98',
  CONTROL_FOCUS_RING_CLASS,
  BUTTON_DISABLED_CLASSES,
);

export const BUTTON_ICON_BASE_CLASSES = 'inline-flex items-center justify-center shrink-0';

/** Icon CUỐI (mũi tên "Tiếp ›") nhích 2px theo hướng đi khi rê — báo trước hành động, không cần đọc nhãn. */
export const BUTTON_END_ICON_MOTION_CLASSES =
  'transition-transform duration-150 ease-out group-hover/button:translate-x-0.5 motion-reduce:transition-none';

/** `loading`: spinner GIỮA nút, nội dung trong suốt giữ chỗ (không đổi bề ngang). */
export const BUTTON_LOADING_CLASSES = {
  root: '[-webkit-text-fill-color:transparent] [&>:not([data-button-spinner])]:opacity-0',
  spinner: 'absolute inset-0 m-auto',
} satisfies Record<'root' | 'spinner', string>;

/**
 * Cao khớp ô nhập (`FIELD_HEIGHT` sm 32 · md 36 · lg 40). Cảm ứng: hình chỉ SIẾT; `::after` nới hộp bấm lên ≥ 44px
 * (xl 40→48 · lg 36→44 · md 32→44 · sm 30→46 · xs 28→44). Góc `rounded-md` mọi cỡ.
 */
export const BUTTON_SIZE_CLASSES = {
  xl: 'h-11 px-5 text-body-14-medium gap-2 touch:h-10 touch:px-3.5 touch:gap-1.5 touch:after:-inset-y-1',
  lg: 'h-10 px-4 text-body-14-medium gap-2 touch:h-9 touch:px-3 touch:gap-1.5 touch:after:-inset-y-1',
  md: 'h-9 px-3.5 text-body-14-medium gap-1.5 touch:h-8 touch:px-2.5 touch:after:-inset-y-1.5',
  sm: 'h-8 px-3 text-body-14-medium gap-1.5 touch:h-7.5 touch:px-2 touch:after:-inset-y-2',
  xs: 'h-7 px-2 text-caption-12-medium gap-1 touch:after:-inset-y-2',
} satisfies Record<ButtonSize, string>;

/** `iconOnly`: nút VUÔNG (rộng = cao, kể cả bậc `touch:` siết) — icon đứng giữa, không méo thành chữ nhật. */
export const BUTTON_ICON_ONLY_CLASSES = {
  xl: 'w-11 px-0 touch:w-10 touch:px-0',
  lg: 'w-10 px-0 touch:w-9 touch:px-0',
  md: 'w-9 px-0 touch:w-8 touch:px-0',
  sm: 'w-8 px-0 touch:w-7.5 touch:px-0',
  xs: 'w-7 px-0',
} satisfies Record<ButtonSize, string>;

export const BUTTON_ICON_SIZE_CLASSES = {
  xl: 'size-5',
  lg: 'size-5',
  md: 'size-4',
  sm: 'size-4',
  xs: 'size-3',
} satisfies Record<ButtonSize, string>;

/** Mặt ĐẶC: rọi trắng 12% → trong → mực 6% đáy (chữ trắng ≥ 4,5:1) + `edge-hi` + viền mực; rê sáng · nhấn tối. */
const BUTTON_SOLID_FACE = cn(
  'edge-hi border border-neutral-10/15 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-neutral-0)_12%,transparent),transparent_50%,color-mix(in_srgb,var(--color-neutral-10)_6%,transparent))]',
  'hover:brightness-105 active:brightness-95',
);

/** Bóng nút đặc nhuốm tông (`--btn-tone`): rê dài ra (nhấc), nhấn thu sát (lún). */
const BUTTON_SOLID_DEPTH = cn(
  'shadow-[0_1px_2px_color-mix(in_srgb,var(--btn-tone)_28%,transparent),0_2px_6px_-2px_color-mix(in_srgb,var(--btn-tone)_45%,transparent)]',
  'hover:shadow-[0_1px_2px_color-mix(in_srgb,var(--btn-tone)_28%,transparent),0_6px_14px_-6px_color-mix(in_srgb,var(--btn-tone)_75%,transparent)]',
  'active:shadow-[0_1px_1px_color-mix(in_srgb,var(--btn-tone)_35%,transparent)]',
);

/** `secondary`: viên nhuộm KHÔNG viền + gờ sáng `edge-hi` — nút phụ macOS; rê / nhấn đậm tông dần. */
const BUTTON_SECONDARY_FACE = 'edge-hi border border-transparent';

/** `stroke`: mặt trắng `rim-soft` + bóng 1px; rê / nhấn pha `--btn-tint` 6% / 12% vào mặt trắng (đục). */
const BUTTON_STROKE_FACE = cn(
  'rim-soft border border-border-default bg-bg-surface shadow-[0_1px_2px_var(--color-shadow-popup)]',
  'hover:border-border-strong hover:shadow-[0_3px_8px_-3px_var(--color-shadow-popup)] active:shadow-none',
  'hover:bg-[color-mix(in_srgb,var(--btn-tint)_6%,var(--color-bg-surface))]',
  'active:bg-[color-mix(in_srgb,var(--btn-tint)_12%,var(--color-bg-surface))]',
);

/** `ghost`: chỉ chữ, rê mới hiện nền; khoá vẫn trong suốt — mặt xám của nút khoá dành cho nút có mặt. */
const BUTTON_GHOST_FACE = cn(
  'border border-transparent bg-transparent',
  'disabled:not-aria-busy:border-transparent disabled:not-aria-busy:bg-transparent',
);

export const BUTTON_SKIN_CLASSES = {
  base: {
    primary: cn(
      'bg-primary-6 text-neutral-0 [--btn-tone:var(--color-primary-7)]',
      BUTTON_SOLID_FACE,
      BUTTON_SOLID_DEPTH,
    ),
    secondary: cn(
      BUTTON_SECONDARY_FACE,
      'bg-primary-5/12 text-action-base hover:bg-primary-5/18 active:bg-primary-5/24 active:shadow-none',
      'dark:bg-primary-5/22 dark:hover:bg-primary-5/30 dark:active:bg-primary-5/38',
    ),
    stroke: cn(BUTTON_STROKE_FACE, 'text-action-base [--btn-tint:var(--color-primary-5)]'),
    ghost: cn(BUTTON_GHOST_FACE, 'text-action-base hover:bg-primary-5/10 active:bg-primary-5/20'),
  },
  accent: {
    primary: cn(
      'bg-accent-5 text-neutral-10 active:border-accent-7 [--btn-tone:var(--color-accent-7)]',
      BUTTON_SOLID_FACE,
      BUTTON_SOLID_DEPTH,
    ),
    secondary: cn(
      BUTTON_SECONDARY_FACE,
      'bg-accent-5/15 text-action-accent hover:bg-accent-5/20 active:bg-accent-5/30',
      'dark:bg-accent-5/24 dark:hover:bg-accent-5/32 dark:active:bg-accent-5/40',
    ),
    stroke: cn(BUTTON_STROKE_FACE, 'text-action-accent [--btn-tint:var(--color-accent-5)]'),
    ghost: cn(BUTTON_GHOST_FACE, 'text-action-accent hover:bg-accent-5/10 active:bg-accent-5/20'),
  },
  danger: {
    primary: cn(
      'bg-error-6 text-neutral-0 active:border-error-8 [--btn-tone:var(--color-error-7)]',
      BUTTON_SOLID_FACE,
      BUTTON_SOLID_DEPTH,
    ),
    secondary: cn(
      BUTTON_SECONDARY_FACE,
      'bg-error/10 text-error hover:bg-error/20 active:bg-error/30',
      'dark:bg-error/20 dark:hover:bg-error/28 dark:active:bg-error/36',
    ),
    stroke: cn(BUTTON_STROKE_FACE, 'text-error [--btn-tint:var(--color-error)]'),
    ghost: cn(BUTTON_GHOST_FACE, 'text-error hover:bg-error/10 active:bg-error/20'),
  },
  neutral: {
    primary: cn(
      'bg-neutral-6 text-neutral-0 active:border-neutral-8 [--btn-tone:var(--color-neutral-8)]',
      BUTTON_SOLID_FACE,
      BUTTON_SOLID_DEPTH,
    ),
    secondary: cn(
      BUTTON_SECONDARY_FACE,
      'bg-bg-pressed text-fg-heading hover:bg-bg-track active:bg-neutral-4 dark:active:bg-neutral-7',
    ),
    stroke: cn(
      BUTTON_STROKE_FACE,
      'text-fg-subheading hover:text-fg-heading [--btn-tint:var(--color-neutral-6)]',
    ),
    ghost: cn(
      BUTTON_GHOST_FACE,
      'text-fg-body hover:bg-bg-pressed hover:text-fg-heading active:bg-bg-track',
    ),
  },
} satisfies Record<ButtonSkin, Record<ButtonVariant, string>>;

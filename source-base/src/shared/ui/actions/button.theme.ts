import {
  HUD_HOVER_GLOW,
  HUD_LIT_FILL,
  HUD_PANEL_FILL,
  HUD_SOLID_PRIMARY,
} from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';

import type { ButtonSize, ButtonSkin, ButtonVariant } from './button.types';

/**
 * button.theme.ts — bảng class của `Button`: khung · cỡ · tông × kiểu · chuyển động nhỏ (lún khi nhấn, icon cuối nhích).
 *
 * Dùng:   cn(BUTTON_BASE_CLASSES, BUTTON_SIZE_CLASSES[size], BUTTON_SKIN_CLASSES[skin][variant], …) trong `Button.tsx`
 * Lưu ý:  ⛔ Nút là tầng CONTROL: KHÔNG ngoặc / vạch góc / vệt quét (ngân sách trang trí — visual-hierarchy.md §0c).
 *         `::after` = vùng chạm `touch:`.
 *         Lý do thiết kế: docs/notes/components/actions.md (## Button)
 */

export const BUTTON_BASE_CLASSES = cn(
  'group/button relative inline-flex items-center justify-center cursor-pointer',
  "touch:after:absolute touch:after:-inset-x-1 touch:after:content-['']",
  'transition-[color,border-color,background-color,box-shadow,opacity,translate] duration-150 ease-out',
  'active:translate-y-px motion-reduce:active:translate-y-0',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'disabled:opacity-50 disabled:saturate-[.35] disabled:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none',
  'aria-busy:opacity-80 aria-busy:saturate-100',
);

export const BUTTON_ICON_BASE_CLASSES = 'inline-flex items-center justify-center shrink-0';

/** Icon CUỐI (mũi tên "Tiếp ›") nhích 2px theo hướng đi khi rê — báo trước hành động, không cần đọc nhãn. */
export const BUTTON_END_ICON_MOTION_CLASSES =
  'transition-transform duration-150 ease-out group-hover/button:translate-x-0.5 motion-reduce:transition-none';

/** Cảm ứng: hình chỉ SIẾT; `::after` nới hộp bấm lên ≥ 44px (xl 40→48 · lg 36→44 · md 32→44 · sm 30→46 · xs 28→44). */
export const BUTTON_SIZE_CLASSES = {
  xl: 'h-11 px-5 py-3 text-body-14-medium gap-2 touch:h-10 touch:px-3.5 touch:gap-1.5 touch:after:-inset-y-1',
  lg: 'h-10 px-4 py-2.5 text-body-14-medium gap-2 touch:h-9 touch:px-3 touch:gap-1.5 touch:after:-inset-y-1',
  md: 'h-9 px-3.5 py-2 text-body-14-medium gap-1.5 touch:h-8 touch:px-2.5 touch:after:-inset-y-1.5',
  sm: 'h-8 px-3 py-1.5 text-body-14-medium gap-1.5 touch:h-7.5 touch:px-2 touch:after:-inset-y-2',
  xs: 'h-7 px-2 py-1 text-caption-12-medium gap-1 touch:after:-inset-y-2',
} satisfies Record<ButtonSize, string>;

export const BUTTON_ICON_SIZE_CLASSES = {
  xl: 'size-5',
  lg: 'size-5',
  md: 'size-4',
  sm: 'size-4',
  xs: 'size-3',
} satisfies Record<ButtonSize, string>;

/** Chữ trắng trên nền đặc (tối): bóng chữ mảnh giữ tương phản khi đỉnh dốc sáng hơn nền phẳng cũ. */
export const BUTTON_SOLID_TEXT_SHADOW =
  'dark:[text-shadow:0_1px_1px_color-mix(in_srgb,var(--color-neutral-10)_45%,transparent)]';

/**
 * Nút ĐẶC: gờ sáng 1px đỉnh + bóng đổ nhuốm tông (`--btn-tone`) → nổi khỏi nền như phím thật; rê bóng dài ra (nhấc lên),
 * nhấn bóng thu vào trong (lún). Tối: `dark:shadow-*` HUD của từng ô thay bóng tĩnh + rê; nhấn dùng chung bản tối dưới.
 * ⛔ `hover:` / `active:` sáng nặng hơn `dark:` (`:where`) → ô nào thêm ở đây phải có `dark:hover:shadow-*` riêng.
 */
const BUTTON_SOLID_DEPTH = cn(
  'shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_24%,transparent),0_1px_2px_color-mix(in_srgb,var(--btn-tone)_45%,transparent)]',
  'hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_24%,transparent),0_6px_14px_-6px_color-mix(in_srgb,var(--btn-tone)_85%,transparent)]',
  'active:shadow-[inset_0_2px_4px_color-mix(in_srgb,var(--color-neutral-10)_28%,transparent)]',
  'dark:active:shadow-[inset_0_2px_6px_color-mix(in_srgb,var(--color-neutral-10)_50%,transparent)]',
);

export const BUTTON_SKIN_CLASSES = {
  base: {
    primary: cn(
      'border border-primary-6 bg-primary-6 text-neutral-0 [--btn-tone:var(--color-primary-7)]',
      'hover:border-primary-7 hover:bg-primary-7',
      'active:border-primary-8 active:bg-primary-8',
      BUTTON_SOLID_DEPTH,
      HUD_SOLID_PRIMARY,
      BUTTON_SOLID_TEXT_SHADOW,
      'dark:border-primary-4/70 dark:hover:border-primary-3 dark:hover:from-primary-5 dark:hover:to-primary-6',
      'dark:hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_40%,transparent),0_0_18px_-2px_color-mix(in_srgb,var(--color-primary-5)_80%,transparent)]',
      'dark:active:border-primary-5 dark:active:from-primary-6 dark:active:to-primary-7',
    ),
    secondary: cn(
      'border border-border-default bg-bg-surface text-fg-body shadow-[0_1px_2px_var(--color-shadow-popup)]',
      'hover:border-primary-5/60 hover:text-action-base hover:shadow-[0_4px_10px_-4px_var(--color-shadow-popup)]',
      'active:bg-bg-pressed active:shadow-none',
      HUD_LIT_FILL,
      HUD_HOVER_GLOW,
      'dark:border-hud-5/35',
    ),
    stroke: cn(
      'border border-action-base bg-transparent text-action-base',
      'hover:bg-primary-5/10',
      'active:bg-primary-5/20',
      HUD_LIT_FILL,
      'dark:hover:border-primary-3 dark:hover:text-primary-3',
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-primary-5)_30%,transparent),0_0_12px_-3px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
    ),
    ghost: cn(
      'border border-transparent bg-transparent text-action-base',
      'hover:bg-primary-5/10',
      'active:bg-primary-5/20',
      'dark:hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-5)_16%,transparent),transparent)]',
    ),
  },
  accent: {
    primary: cn(
      'border border-accent-5 bg-accent-5 text-neutral-10 [--btn-tone:var(--color-accent-7)]',
      'hover:border-accent-6 hover:bg-accent-6',
      'active:border-accent-7 active:bg-accent-7',
      BUTTON_SOLID_DEPTH,
      'dark:border-yellow-4/80 dark:bg-linear-to-b dark:from-yellow-4 dark:to-accent-6',
      'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_45%,transparent),0_0_14px_-3px_color-mix(in_srgb,var(--color-accent-5)_70%,transparent)]',
      'dark:hover:border-yellow-3 dark:hover:from-yellow-3 dark:hover:to-accent-5',
      'dark:hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_55%,transparent),0_0_18px_-2px_color-mix(in_srgb,var(--color-accent-5)_80%,transparent)]',
      'dark:active:from-accent-5 dark:active:to-accent-7',
    ),
    secondary: cn(
      'border border-accent-5/50 bg-accent-5/10 text-action-accent',
      'hover:border-accent-5/80 hover:bg-accent-5/20',
      'active:bg-accent-5/30',
      'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent-5)_14%,transparent),color-mix(in_srgb,var(--color-accent-5)_2%,transparent)_70%)]',
      'dark:hover:border-accent-5',
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-accent-5)_26%,transparent)]',
    ),
    stroke: cn(
      'border border-action-accent bg-transparent text-action-accent',
      'hover:bg-accent-5/10',
      'active:bg-accent-5/20',
      'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent-5)_11%,transparent),color-mix(in_srgb,var(--color-accent-5)_2%,transparent)_70%)]',
      'dark:hover:border-yellow-3 dark:hover:text-yellow-3',
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-accent-5)_28%,transparent),0_0_12px_-3px_color-mix(in_srgb,var(--color-accent-5)_60%,transparent)]',
    ),
    ghost: cn(
      'border border-transparent bg-transparent text-action-accent',
      'hover:bg-accent-5/10',
      'active:bg-accent-5/20',
      'dark:hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-accent-5)_16%,transparent),transparent)]',
    ),
  },
  danger: {
    primary: cn(
      'border border-error-6 bg-error-6 text-neutral-0 [--btn-tone:var(--color-error-7)]',
      'hover:border-error-7 hover:bg-error-7',
      'active:border-error-8 active:bg-error-8',
      BUTTON_SOLID_DEPTH,
      BUTTON_SOLID_TEXT_SHADOW,
      'dark:border-red-4/80 dark:bg-linear-to-b dark:from-error-5 dark:to-error-7',
      'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_30%,transparent),0_0_14px_-3px_color-mix(in_srgb,var(--color-error-5)_70%,transparent)]',
      'dark:hover:border-red-3 dark:hover:from-error-5 dark:hover:to-error-6',
      'dark:hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_40%,transparent),0_0_18px_-2px_color-mix(in_srgb,var(--color-error-5)_80%,transparent)]',
      'dark:active:from-error-6 dark:active:to-error-7',
    ),
    secondary: cn(
      'border border-error/50 bg-error/10 text-error',
      'hover:border-error/80 hover:bg-error/20',
      'active:bg-error/30',
      'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-error)_14%,transparent),color-mix(in_srgb,var(--color-error)_2%,transparent)_70%)]',
      'dark:hover:border-error',
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-error)_26%,transparent)]',
    ),
    stroke: cn(
      'border border-error bg-transparent text-error',
      'hover:bg-error/10',
      'active:bg-error/20',
      'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-error)_11%,transparent),color-mix(in_srgb,var(--color-error)_2%,transparent)_70%)]',
      'dark:hover:border-red-3 dark:hover:text-red-3',
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-error)_28%,transparent),0_0_12px_-3px_color-mix(in_srgb,var(--color-error)_60%,transparent)]',
    ),
    ghost: cn(
      'border border-transparent bg-transparent text-error',
      'hover:bg-error/10',
      'active:bg-error/20',
      'dark:hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-error)_16%,transparent),transparent)]',
    ),
  },
  neutral: {
    primary: cn(
      'border border-neutral-6 bg-neutral-6 text-neutral-0 [--btn-tone:var(--color-neutral-8)]',
      'hover:border-neutral-7 hover:bg-neutral-7',
      'active:border-neutral-8 active:bg-neutral-8',
      BUTTON_SOLID_DEPTH,
      BUTTON_SOLID_TEXT_SHADOW,
      'dark:border-neutral-5 dark:bg-linear-to-b dark:from-neutral-6 dark:to-neutral-8',
      'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_22%,transparent),0_0_12px_-4px_color-mix(in_srgb,var(--color-sky-5)_45%,transparent)]',
      'dark:hover:border-neutral-4 dark:hover:from-neutral-5 dark:hover:to-neutral-7',
      'dark:hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_30%,transparent),0_0_16px_-3px_color-mix(in_srgb,var(--color-sky-5)_60%,transparent)]',
      'dark:active:from-neutral-7 dark:active:to-neutral-8',
    ),
    secondary: cn(
      'border border-border-default bg-bg-pressed text-fg-subheading',
      'hover:border-border-strong hover:text-fg-heading',
      'active:bg-bg-track',
      HUD_PANEL_FILL,
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-sky-5)_20%,transparent)]',
    ),
    stroke: cn(
      'border border-border-strong bg-transparent text-fg-subheading',
      'hover:bg-bg-pressed hover:text-fg-heading',
      'active:bg-bg-track',
      HUD_PANEL_FILL,
      'dark:hover:border-sky-5/70',
      'dark:hover:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-sky-5)_20%,transparent)]',
    ),
    ghost: cn(
      'border border-transparent bg-transparent text-fg-body',
      'hover:bg-bg-pressed hover:text-fg-heading',
      'active:bg-bg-track',
      'dark:hover:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-sky-5)_14%,transparent),transparent)]',
    ),
  },
} satisfies Record<ButtonSkin, Record<ButtonVariant, string>>;

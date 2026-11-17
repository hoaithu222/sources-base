import { cn } from '@/shared/utils/style/cn';
import type { ButtonSize } from '@/shared/ui/actions/button.types';
import {
  HUD_BRACKETS_BEFORE,
  HUD_FOCUS_GLOW,
  HUD_HOVER_GLOW,
  HUD_LIT_FILL,
  HUD_PANEL_FILL,
  HUD_TEXT_GLOW,
} from '@/shared/ui/primitives/hud.theme';
import type { UploadDropAreaState, UploadInlineState, UploadSize } from './upload.types';

/**
 * upload.theme — bảng class cho trigger của Upload: vùng thả (`variant="dropzone"`) · hàng inline.
 *
 * Trục:   state vùng thả idle | dragOver | error | disabled · inline idle | filled | dragOver | error | disabled
 *         · size sm | md | lg (kiểu trục khai ở upload.types.ts)
 * Sửa:    vùng thả → UPLOAD_DROP_AREA_* (ô icon: UPLOAD_DROP_AREA_HERO_*, dùng lại ở overlay Dropzone)
 *         · inline → UPLOAD_INLINE_* (khung + cao lấy từ `fieldSurface` / `FIELD_HEIGHT`)
 *         · thẻ tệp + badge → file-list/file-card.theme.ts
 * Lưu ý:  ô state tự mang cursor · màu viền · nền — *_BASE_CLASSES cố ý KHÔNG chứa chúng. Theme tối: vùng thả là khung
 *         HUD (viền đứt ánh xanh · ngoặc 4 góc `::before` đè lên viền · nền dốc), kéo-qua thì quầng mạnh.
 *         Ramp KHÔNG lật theme: ô dùng bậc `-1` / `-6` cho nền sáng phải kèm `dark:` (`-5/10`).
 */

export const UPLOAD_DROP_AREA_BASE_CLASSES = cn(
  'group/drop-area relative flex w-full flex-col items-center justify-center text-center',
  'border border-dashed',
  'transition-[border-color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

export const UPLOAD_DROP_AREA_SIZE_CLASSES = {
  sm: 'gap-2 p-3',
  md: 'gap-3 p-4',
  lg: 'min-h-52 gap-4 p-4',
} satisfies Record<UploadSize, string>;

export const UPLOAD_DROP_AREA_STATE_CLASSES = {
  idle: cn(
    'cursor-pointer border-border-strong bg-bg-subtle',
    'hover:border-primary-5/60 hover:bg-bg-nav-hover',
    HUD_PANEL_FILL,
    'dark:border-hud-5/45',
    HUD_HOVER_GLOW,
  ),
  dragOver: cn(
    'cursor-pointer border-solid border-primary-5 bg-primary-5/10',
    HUD_LIT_FILL,
    HUD_BRACKETS_BEFORE,
    'dark:border-primary-4 dark:before:-inset-px dark:before:text-primary-3',
    'dark:shadow-[inset_0_0_40px_color-mix(in_srgb,var(--color-primary-5)_28%,transparent),0_0_20px_-2px_color-mix(in_srgb,var(--color-primary-5)_55%,transparent)]',
  ),
  error: cn(
    'cursor-pointer border-error bg-error/5',
    'hover:bg-error/8',
    'dark:shadow-[inset_0_0_24px_-8px_color-mix(in_srgb,var(--color-error)_35%,transparent)]',
  ),
  disabled: 'cursor-not-allowed border-border-default bg-bg-subtle opacity-50',
} satisfies Record<UploadDropAreaState, string>;

export const UPLOAD_DROP_AREA_TITLE_SIZE_CLASSES = {
  sm: 'text-body-13-medium',
  md: 'text-body-14-medium',
  lg: 'text-body-16-medium',
} satisfies Record<UploadSize, string>;

export const UPLOAD_DROP_AREA_TITLE_STATE_CLASSES = {
  idle: 'text-fg-heading',
  dragOver: cn('text-link', HUD_TEXT_GLOW),
  error: 'text-fg-heading',
  disabled: 'text-fg-heading',
} satisfies Record<UploadDropAreaState, string>;

export const UPLOAD_DROP_AREA_DESCRIPTION_CLASSES = 'text-caption-12 text-fg-muted';

/** Cỡ nút "Chọn file" bên trong vùng thả, theo `size` của vùng. */
export const UPLOAD_DROP_AREA_BUTTON_SIZES = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
} satisfies Record<UploadSize, ButtonSize>;

/** Nút "Chọn file" chỉ là HÌNH (cả vùng mới là nút thật) nên sáng theo hover của vùng. */
export const UPLOAD_DROP_AREA_BUTTON_HOVER_CLASSES =
  'group-hover/drop-area:border-primary-5/60 group-hover/drop-area:text-action-base';

export const UPLOAD_DROP_AREA_HERO_BASE_CLASSES = cn(
  'inline-flex shrink-0 items-center justify-center border',
  'transition-[border-color,background-color,color,box-shadow] duration-150 ease-out',
);

export const UPLOAD_DROP_AREA_HERO_SIZE_CLASSES = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
} satisfies Record<UploadSize, string>;

/** Cỡ icon hero (px) theo `size`, truyền vào `<SystemIcon size>`. */
export const UPLOAD_DROP_AREA_HERO_ICON_PX = {
  sm: 16,
  md: 20,
  lg: 24,
} satisfies Record<UploadSize, number>;

export const UPLOAD_DROP_AREA_HERO_STATE_CLASSES = {
  idle: cn(
    'border-primary-5/30 bg-primary-1 text-link',
    'dark:bg-primary-5/10',
    'dark:shadow-[inset_0_0_8px_color-mix(in_srgb,var(--color-primary-5)_16%,transparent)]',
    'group-hover/drop-area:border-primary-5/60',
    'dark:group-hover/drop-area:border-primary-4/70 dark:group-hover/drop-area:shadow-[inset_0_0_12px_color-mix(in_srgb,var(--color-primary-5)_38%,transparent),0_0_10px_-2px_color-mix(in_srgb,var(--color-primary-5)_50%,transparent)]',
  ),
  dragOver: cn(
    'border-primary-6 bg-primary-6 text-neutral-0',
    'dark:border-primary-4 dark:bg-linear-to-b dark:from-primary-5 dark:to-primary-7',
    'dark:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_30%,transparent),0_0_18px_color-mix(in_srgb,var(--color-primary-5)_60%,transparent)]',
  ),
  error: 'border-error/40 bg-error/10 text-error',
  disabled: 'border-border-default bg-bg-surface text-fg-faint',
} satisfies Record<UploadDropAreaState, string>;

export const UPLOAD_INLINE_BASE_CLASSES = 'relative inline-flex items-center gap-2 px-3 text-left';

export const UPLOAD_INLINE_STATE_CLASSES = {
  idle: 'cursor-pointer',
  filled: 'cursor-pointer',
  dragOver: cn(
    'cursor-pointer border-primary-5 bg-primary-5/10 hover:border-primary-5',
    HUD_FOCUS_GLOW,
  ),
  error: 'cursor-pointer',
  disabled: 'cursor-not-allowed',
} satisfies Record<UploadInlineState, string>;

export const UPLOAD_INLINE_ICON_STATE_CLASSES = {
  idle: 'text-fg-muted group-hover/field:text-link',
  filled: 'text-link',
  dragOver: 'text-link',
  error: 'text-error',
  disabled: 'text-fg-faint',
} satisfies Record<UploadInlineState, string>;

export const UPLOAD_INLINE_LABEL_STATE_CLASSES = {
  idle: 'text-fg-muted',
  filled: 'text-fg-heading',
  dragOver: 'text-link',
  error: 'text-fg-heading',
  disabled: 'text-fg-faint',
} satisfies Record<UploadInlineState, string>;

/** Cụm `trailing` cuối hàng inline; mặc định là icon tải lên (báo đây là ô CHỌN tệp, không gõ). */
export const UPLOAD_INLINE_TRAILING_CLASSES =
  'inline-flex shrink-0 items-center gap-1 text-fg-muted';

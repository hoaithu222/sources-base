import { cn } from '@/shared/utils/style/cn';
import type { SegmentToggleSkin, SegmentToggleVariant } from './segment-toggle.types';

/**
 * segment-toggle-glide.theme.ts — "mặt trượt" của SegmentToggle (MỘT lớp dưới đoạn đang chọn, đổi đoạn thì TRƯỢT sang)
 * và bộ biến màu `--seg-wave-*` của variant `wave`.
 *
 * Dùng:   cn(SEGMENT_TOGGLE_GLIDE_BASE_CLASSES, segmentGlideClasses(variant, skin)) · `wave` vẽ thêm `SegmentToggleWave`
 *         trong mặt trượt (đường cong `SEGMENT_TOGGLE_WAVE_PATH` + hai cánh vạch nền `before:` / `after:`).
 * Lưu ý:  ⛔ variant có mặt trượt thì ô `active` của đoạn CHỈ đổi màu chữ (nền nằm ở đây). `tab*` · `subtle` không trượt.
 *         Toạ độ do `useSegmentGlide` ghi thẳng vào style; trượt 220ms `cubic-bezier(0.2,0.8,0.2,1)`, tắt khi giảm chuyển động.
 *         pill / solid / glass = CHIP nổi (`edge-hi` + bóng mềm) cùng hình ở hai theme: sáng chip trắng trên rãnh xám,
 *         tối chip xám sáng hơn rãnh.
 *         `wave`: màu đọc `--seg-wave-*` → (trong header) `--hdr-*` → token; vạch nền ⇄ `--seg-wave-track`.
 */

/** Ẩn tới khi đo xong lần đầu (`data-ready`) và CHỈ trượt sau đó — không trượt từ góc trái lúc mount. */
export const SEGMENT_TOGGLE_GLIDE_BASE_CLASSES = cn(
  'pointer-events-none absolute left-0 top-0 opacity-0 data-[ready=true]:opacity-100',
  'motion-safe:data-[ready=true]:transition-[transform,width,height] motion-safe:data-[ready=true]:duration-[220ms]',
  'motion-safe:data-[ready=true]:ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-safe:will-change-transform',
);

/**
 * Chip nổi (kiểu macOS): `edge-hi` + bóng hai lớp mềm + viền 0.5px — dùng cho mặt trượt và đoạn `subtle`. Sáng trắng; tối
 * `neutral-7` (sáng hơn rãnh `bg-pressed`, nền `bg-surface` sẽ tối hơn rãnh và đọc như lỗ lõm).
 */
export const SEGMENT_TOGGLE_RAISED_CHIP_CLASSES = cn(
  'edge-hi bg-bg-surface dark:bg-neutral-7',
  'shadow-[0_1px_2px_var(--color-shadow-popup),0_2px_6px_-3px_var(--color-shadow-popup),0_0_0_0.5px_var(--color-border-strong)]',
);

const GLIDE_RAISED_CLASSES = cn('rounded-sm', SEGMENT_TOGGLE_RAISED_CHIP_CLASSES);

/** Hai cánh vạch nền của `wave`: dài vô tận hai phía, khung `overflow-x-clip` cắt ở mép → một đường liền võng xuống. */
const GLIDE_WAVE_CLASSES = cn(
  "before:absolute before:right-full before:bottom-[8px] before:h-px before:w-screen before:bg-(--sw-track) before:content-['']",
  "after:absolute after:left-full after:bottom-[8px] after:h-px after:w-screen after:bg-(--sw-track) after:content-['']",
);

export const SEGMENT_TOGGLE_GLIDE_CLASSES: Partial<
  Record<SegmentToggleVariant, Partial<Record<SegmentToggleSkin, string>>>
> = {
  pill: {
    neutral: GLIDE_RAISED_CLASSES,
    primary: 'edge-hi rounded-sm bg-primary-5/12 ring-1 ring-inset ring-primary-5',
  },
  solid: { neutral: GLIDE_RAISED_CLASSES },
  glass: { neutral: GLIDE_RAISED_CLASSES },
  underline: {
    neutral: 'rounded-t-sm bg-primary-5/8 shadow-[inset_0_-2px_0_var(--color-primary-5)]',
  },
  wave: { neutral: GLIDE_WAVE_CLASSES },
};

/** Px mặt trượt cao thêm ở đáy: `underline` đè `border-b` của khung · `wave` chứa dải sóng 10px dưới đoạn (= `pb-2.5`). */
export const SEGMENT_TOGGLE_GLIDE_BLEED_PX: Partial<Record<SegmentToggleVariant, number>> = {
  underline: 1,
  wave: 10,
};

/** Variant + skin này có mặt trượt không (skin không có ô riêng thì rơi về `neutral` của variant). */
export function segmentGlideClasses(
  variant: SegmentToggleVariant,
  skin: SegmentToggleSkin,
): string | undefined {
  const row = SEGMENT_TOGGLE_GLIDE_CLASSES[variant];
  return row?.[skin] ?? row?.neutral;
}

/**
 * Biến màu của `wave`, khai trên khung: `--seg-wave-*` (người dùng đặt) → `--hdr-*` (nằm trong thanh header) → token.
 * Biến nội bộ `--sw-*` là giá trị đã chọn — phần con chỉ đọc `--sw-*`. Tối: sóng mặc định `primary-4` (sáng hơn `primary-6`)
 * và chữ trên chip đếm là `fg-inverse` (mực) vì `action-base` tối là xanh bạc hà sáng.
 */
export const SEGMENT_TOGGLE_WAVE_VAR_CLASSES = cn(
  '[--sw-tone:var(--color-primary-6)] dark:[--sw-tone:var(--color-primary-4)]',
  '[--sw-color:var(--seg-wave-color,var(--hdr-pill,var(--sw-tone)))]',
  '[--sw-fg:var(--seg-wave-fg,var(--hdr-fg,var(--color-fg-heading)))]',
  '[--sw-fg-muted:var(--seg-wave-fg-muted,var(--hdr-fg-muted,var(--color-fg-muted)))]',
  '[--sw-hover:var(--seg-wave-hover,var(--hdr-hover,var(--color-bg-nav-hover)))]',
  '[--sw-track:var(--seg-wave-track,var(--hdr-divider,var(--color-divider-strong)))]',
  '[--sw-ring:var(--seg-wave-ring,var(--hdr-ring,color-mix(in_srgb,var(--color-ring-focus)_35%,transparent)))]',
  '[--sw-badge:var(--seg-wave-badge,var(--hdr-pill,var(--color-action-base)))]',
  '[--sw-badge-fg:var(--seg-wave-badge-fg,var(--hdr-pill-fg,var(--color-fg-inverse)))]',
);

/** Dải sóng (viewBox 100×10, kéo giãn theo bề ngang đoạn): vạch nền y 1–2 võng xuống 6px, giữa dày 2px, hai đầu 1px. */
export const SEGMENT_TOGGLE_WAVE_PATH =
  'M0 1C17 1 25 8 50 8S83 1 100 1V2C83 2 75 10 50 10S17 2 0 2Z';

export const SEGMENT_TOGGLE_WAVE_SVG_CLASSES =
  'pointer-events-none absolute inset-x-0 bottom-0 h-[10px] w-full overflow-visible';

/** Màu dốc của dải sóng: hai đầu = màu vạch nền (nối liền cánh), giữa = màu nhấn. */
export const SEGMENT_TOGGLE_WAVE_STOP_CLASSES = {
  edge: '[stop-color:var(--sw-track)]',
  ink: '[stop-color:var(--sw-color)]',
} as const;

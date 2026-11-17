import { HUD_ACTIVE_FILL } from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';
import type { SegmentToggleSkin, SegmentToggleVariant } from './segment-toggle.types';

/**
 * segment-toggle-glide.theme.ts — "mặt trượt" của SegmentToggle: MỘT lớp nền nằm dưới đoạn đang chọn, đổi đoạn thì nó
 * TRƯỢT sang (transform + width) thay vì tắt chỗ này bật chỗ kia — mắt theo được lựa chọn vừa đổi.
 *
 * Dùng:   cn(SEGMENT_TOGGLE_GLIDE_BASE_CLASSES, SEGMENT_TOGGLE_GLIDE_CLASSES[variant][skin] ?? …[variant].neutral)
 * Lưu ý:  ⛔ variant có mặt trượt thì ô `active` của đoạn CHỈ đổi màu chữ (nền nằm ở đây) — xem
 *         `SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES` / `*_SKIN_CLASSES`. `tab` · `tab-v2` · `subtle` · `tab-hud` không trượt (đoạn
 *         cách nhau / có vạch chia / khung riêng từng đoạn). Toạ độ do `useSegmentGlide` ghi thẳng vào style.
 */

/** Ẩn tới khi đo xong lần đầu (`data-ready`) và CHỈ trượt sau đó — không trượt từ góc trái lúc mount. */
export const SEGMENT_TOGGLE_GLIDE_BASE_CLASSES = cn(
  'pointer-events-none absolute left-0 top-0 opacity-0 data-[ready=true]:opacity-100',
  'motion-safe:data-[ready=true]:transition-[transform,width,height] motion-safe:data-[ready=true]:duration-200',
  'motion-safe:data-[ready=true]:ease-[cubic-bezier(0.2,0.8,0.2,1)]',
);

/** Mặt HUD tối (xanh-ngọc dâng từ đáy + vạch sáng đáy) — nền đặc sáng phải về `transparent` ở tối. */
const GLIDE_HUD_CLASSES = cn(HUD_ACTIVE_FILL, 'dark:bg-transparent');

const GLIDE_RAISED_CLASSES = cn(
  'bg-bg-surface shadow-[0_1px_3px_var(--color-shadow-popup)]',
  GLIDE_HUD_CLASSES,
);

export const SEGMENT_TOGGLE_GLIDE_CLASSES: Partial<
  Record<SegmentToggleVariant, Partial<Record<SegmentToggleSkin, string>>>
> = {
  pill: {
    neutral: cn('bg-primary-6', GLIDE_HUD_CLASSES),
    primary: cn(
      'bg-primary-5/12 ring-1 ring-inset ring-primary-5',
      GLIDE_HUD_CLASSES,
      'dark:ring-primary-4/70',
    ),
  },
  solid: { neutral: GLIDE_RAISED_CLASSES },
  glass: { neutral: GLIDE_RAISED_CLASSES },
  underline: {
    neutral: cn(
      'bg-primary-5/8 shadow-[inset_0_-2px_0_var(--color-primary-5)]',
      'dark:bg-transparent dark:bg-[linear-gradient(0deg,color-mix(in_srgb,var(--color-primary-5)_24%,transparent),transparent_85%)]',
      'dark:shadow-[inset_0_-2px_0_var(--color-primary-4),0_6px_10px_-6px_color-mix(in_srgb,var(--color-primary-5)_70%,transparent)]',
    ),
  },
};

/** `underline`: vạch đáy đè lên `border-b` 1px của khung (như bản cũ `after:-bottom-px`) → mặt trượt cao thêm 1px. */
export const SEGMENT_TOGGLE_GLIDE_BLEED_PX: Partial<Record<SegmentToggleVariant, number>> = {
  underline: 1,
};

/** Variant + skin này có mặt trượt không (skin không có ô riêng thì rơi về `neutral` của variant). */
export function segmentGlideClasses(
  variant: SegmentToggleVariant,
  skin: SegmentToggleSkin,
): string | undefined {
  const row = SEGMENT_TOGGLE_GLIDE_CLASSES[variant];
  return row?.[skin] ?? row?.neutral;
}

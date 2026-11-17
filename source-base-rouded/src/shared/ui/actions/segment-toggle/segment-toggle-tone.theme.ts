import { cn } from '@/shared/utils/style/cn';
import { SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES } from './segment-toggle.theme';
import type { SegmentToggleSkin, SegmentToggleVariant } from './segment-toggle.types';

/**
 * segment-toggle-tone.theme.ts — màu theo `skin` của đoạn đang chọn + chip đếm (badge) của SegmentToggle.
 *
 * Tra:    *_SKIN_CLASSES[variant][skin] (THAY ô `active` của `SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES`) · badge theo trạng
 *         thái: chưa chọn → *_BADGE_INACTIVE_ · đang chọn → *_BADGE_SKIN_ ?? *_BADGE_ACTIVE_ · số 0 / khoá → *_BADGE_MUTED_.
 * Lưu ý:  Skin màu: `--segment-ink` = màu chữ + nền chip (sáng `-8` / `-7`, tối `-3` cho đọc được trên nền tối). Mực sáng
 *         phải ĐẬM: chữ `-5` / `success` / `warning` trên nền pha 15% chỉ 2.4–4.3:1.
 *         Badge = chip LUÔN có nền, cao cố định (18px · `subtle` 16px) để thẳng hàng giữa đoạn ở mọi cỡ; số trên chip màu
 *         đặc dùng `fg-inverse` (trắng ở sáng, mực ở tối) vì nền chip tối là màu sáng.
 *         `wave` đọc biến `--sw-*` (đặt ở khung) → đúng cả trên nền trắng lẫn trên thanh header.
 */

export const SEGMENT_TOGGLE_SEGMENT_SKIN_CLASSES: Partial<
  Record<SegmentToggleVariant, Partial<Record<SegmentToggleSkin, string>>>
> = {
  pill: { primary: SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES },
  /** Skin màu của `subtle` = đoạn tô màu riêng (không chip trắng): bỏ bóng chip nổi của ô `active` neutral. */
  subtle: {
    primary: 'edge-hi bg-primary-5/12 text-action-base',
    'primary-solid': 'edge-hi bg-primary-6 text-neutral-0',
    sky: cn(
      'edge-hi bg-sky-5/15 text-[color:var(--segment-ink)]',
      '[--segment-ink:var(--color-sky-8)] dark:[--segment-ink:var(--color-sky-3)]',
    ),
    success: cn(
      'edge-hi bg-success-5/15 text-[color:var(--segment-ink)]',
      '[--segment-ink:var(--color-success-8)] dark:[--segment-ink:var(--color-green-3)]',
    ),
    warning: cn(
      'edge-hi bg-warning-5/15 text-[color:var(--segment-ink)]',
      '[--segment-ink:var(--color-warning-7)] dark:[--segment-ink:var(--color-orange-3)]',
    ),
  },
};

/** Chữ khoá = mực `fg-body` pha trong → ~3:1 trên MỌI rãnh (`fg-faint` đặc lúc chìm mất, lúc sáng như đoạn thường). */
const SEGMENT_TOGGLE_LOCKED_TEXT_CLASSES = 'text-fg-body/55';

export const SEGMENT_TOGGLE_BADGE_BASE_CLASSES = cn(
  'inline-flex h-4.5 min-w-5 items-center justify-center rounded-full px-1.5',
  'text-caption-12-tight-semibold tabular-nums transition-colors duration-150 motion-reduce:transition-none',
);

/** Cỡ / góc chip riêng theo variant: `subtle` gọn (đoạn 24px) · `tab-v2` / `tab-hud` góc nhỏ theo khung. */
export const SEGMENT_TOGGLE_BADGE_VARIANT_CLASSES: Partial<Record<SegmentToggleVariant, string>> = {
  subtle: 'h-4 min-w-4 px-1',
  'tab-v2': 'rounded-xs',
  'tab-hud': 'rounded-xs',
};

/** Chưa chọn: chip = mực PHA TRONG (sáng `neutral-9` · tối `neutral-0`) — thấy như nhau trên mọi rãnh và cả lúc rê. */
export const SEGMENT_TOGGLE_BADGE_INACTIVE_CLASSES =
  'bg-neutral-9/14 text-fg-body dark:bg-neutral-0/10';

/** Số 0 hoặc đoạn khoá: chip chìm (nền nhạt hơn, số cùng mực chữ khoá) — không có gì để xem thì không hút mắt. */
export const SEGMENT_TOGGLE_BADGE_MUTED_CLASSES = cn(
  'bg-neutral-9/8 dark:bg-neutral-0/7',
  SEGMENT_TOGGLE_LOCKED_TEXT_CLASSES,
);

/** Ô THAY chip chưa chọn / chìm theo variant (`wave` pha từ màu chữ `--sw-fg-muted` → đọc được cả trên header). */
export const SEGMENT_TOGGLE_BADGE_VARIANT_TONE_CLASSES: Partial<
  Record<SegmentToggleVariant, { inactive: string; muted: string }>
> = {
  wave: {
    inactive: 'bg-[color-mix(in_srgb,var(--sw-fg-muted)_16%,transparent)] text-(--sw-fg-muted)',
    muted: cn(
      'bg-[color-mix(in_srgb,var(--sw-fg-muted)_9%,transparent)]',
      'text-[color-mix(in_srgb,var(--sw-fg-muted)_70%,transparent)]',
    ),
  },
};

/** Mặt ĐẶC → chip trắng chữ brand (`primary-6` cố định ở cả hai theme nên chip trắng vẫn nổi). */
const BADGE_ON_SOLID = 'bg-neutral-0 text-primary-7';
/** Mặt NHẠT → chip mang màu chữ đang chọn (`action-base`); `primary-6` + số trắng chỉ 3.3:1. Số `fg-inverse`: tối là mực. */
const BADGE_ON_TINT = 'bg-action-base text-fg-inverse';
/** Skin màu của `subtle`: chip = `--segment-ink`, số `fg-inverse` (nền chip tối là màu nhạt). */
const BADGE_ON_TONE = 'bg-[color:var(--segment-ink)] text-fg-inverse';

/** `subtle` tối: chip đếm `neutral-9` vì chip đoạn đang chọn đã là `neutral-7` (cùng màu thì chip biến mất). */
export const SEGMENT_TOGGLE_BADGE_ACTIVE_CLASSES = {
  pill: BADGE_ON_TINT,
  subtle: 'bg-neutral-7 text-neutral-0 dark:bg-neutral-9',
  tab: BADGE_ON_TINT,
  'tab-v2': BADGE_ON_TINT,
  'tab-hud': BADGE_ON_TINT,
  solid: BADGE_ON_TINT,
  glass: BADGE_ON_TINT,
  underline: BADGE_ON_TINT,
  wave: 'bg-(--sw-badge) text-(--sw-badge-fg)',
} satisfies Record<SegmentToggleVariant, string>;

/** Ô THAY cho `SEGMENT_TOGGLE_BADGE_ACTIVE_CLASSES[variant]` khi skin ≠ neutral. */
export const SEGMENT_TOGGLE_BADGE_SKIN_CLASSES: Partial<
  Record<SegmentToggleVariant, Partial<Record<SegmentToggleSkin, string>>>
> = {
  pill: { primary: BADGE_ON_TINT },
  subtle: {
    primary: BADGE_ON_TINT,
    'primary-solid': BADGE_ON_SOLID,
    sky: BADGE_ON_TONE,
    success: BADGE_ON_TONE,
    warning: BADGE_ON_TONE,
  },
};

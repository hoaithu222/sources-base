import { cn } from '@/shared/utils/style/cn';
import {
  SEGMENT_TOGGLE_RAISED_CHIP_CLASSES,
  SEGMENT_TOGGLE_WAVE_VAR_CLASSES,
} from './segment-toggle-glide.theme';
import type {
  SegmentToggleSize,
  SegmentToggleState,
  SegmentToggleVariant,
} from './segment-toggle.types';

/**
 * segment-toggle.theme.ts — khung + đoạn + nhãn của SegmentToggle (màu skin / badge: `segment-toggle-tone.theme.ts`).
 *
 * Tra:    [variant] hoặc [variant][state] (state = active | inactive).
 * Sửa:    khung → *_ROOT_VARIANT_ · đoạn → *_SEGMENT_VARIANT_ / *_SIZE_ · màu → *_STATE_ · nhãn → *_LABEL_*
 * Lưu ý:  MỘT hình cho cả hai theme (control macOS); màu qua token nên tự lật, `dark:` chỉ chỉnh MÀU phẳng.
 *         ⛔ pill · solid · glass · underline · wave: nền đoạn đang chọn là MẶT TRƯỢT — ô `active` CHỈ đổi màu chữ.
 *         ⛔ hover của đoạn chưa chọn viết `enabled:hover:` — đoạn khoá đứng yên.
 *         Kiểu macOS: rãnh `bg-pressed` + bóng lõm mảnh, đoạn chọn là CHIP nổi (sáng trắng · tối xám sáng hơn rãnh); chữ chọn
 *         semibold, chữ nghỉ medium `fg-muted`. Nhãn giữ chỗ cho nét đậm (`::after` đọc `data-label`) → đổi nét không xô hàng.
 *         Cao: đoạn sm 28 · md 32 · lg 36 + rãnh 2px mỗi phía = 32 · 36 · 40 (bằng Button / ô nhập cùng cỡ).
 */

export const SEGMENT_TOGGLE_ROOT_BASE_CLASSES = 'relative inline-flex items-center';

/** Rãnh lõm: nền `bg-pressed` + bóng trong mảnh ở đỉnh + viền trong 1px rất nhạt. */
const SEGMENT_TOGGLE_TRACK_CLASSES = cn(
  'gap-0.5 p-0.5 rounded-md bg-bg-pressed',
  'shadow-[inset_0_1px_1.5px_var(--color-shadow-popup),inset_0_0_0_1px_var(--color-divider-soft)]',
);

export const SEGMENT_TOGGLE_ROOT_VARIANT_CLASSES = {
  pill: SEGMENT_TOGGLE_TRACK_CLASSES,
  subtle: SEGMENT_TOGGLE_TRACK_CLASSES,
  tab: 'gap-1',
  'tab-v2': 'gap-1',
  'tab-hud': 'gap-1',
  solid: SEGMENT_TOGGLE_TRACK_CLASSES,
  glass: cn(SEGMENT_TOGGLE_TRACK_CLASSES, 'bg-bg-pressed/70 backdrop-blur-[10px]'),
  underline: 'w-full gap-0 border-b border-divider-strong bg-transparent p-0',
  wave: cn('gap-0.5 px-1 pb-2.5 overflow-x-clip', SEGMENT_TOGGLE_WAVE_VAR_CLASSES),
} satisfies Record<SegmentToggleVariant, string>;

export const SEGMENT_TOGGLE_SEGMENT_BASE_CLASSES = cn(
  'relative inline-flex items-center shrink-0 cursor-pointer',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none',
  'disabled:cursor-not-allowed',
  'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring-focus/35',
);

const SEGMENT_TOGGLE_TOUCH_HIT_CLASSES =
  "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-1.5 touch:after:content-['']";

export const SEGMENT_TOGGLE_SEGMENT_VARIANT_CLASSES = {
  pill: cn('gap-1.5 h-auto justify-center rounded-sm', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  subtle: 'gap-1 h-auto rounded-sm px-2.5 py-1 focus-visible:ring-inset',
  tab: cn('gap-1 h-8 px-3 py-1.5 rounded-md', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  'tab-v2': cn('gap-1 h-8 px-3 py-1.5 rounded-md', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  'tab-hud': cn('gap-1 h-8 px-3 py-1.5 rounded-md', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  solid: cn('gap-1.5 h-8 px-3 py-1.5 rounded-sm', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  glass: cn('gap-1.5 h-auto justify-center rounded-sm', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  underline: cn(
    'gap-1.5 h-auto justify-center rounded-t-sm px-2 py-2',
    SEGMENT_TOGGLE_TOUCH_HIT_CLASSES,
  ),
  wave: cn(
    'gap-1.5 justify-center rounded-2xl focus-visible:ring-(--sw-ring)',
    SEGMENT_TOGGLE_TOUCH_HIT_CLASSES,
  ),
} satisfies Record<SegmentToggleVariant, string>;

/** Cỡ theo `size` — chỉ pill / glass (đệm dọc) và wave (cao cố định) đọc; variant khác tự định chiều cao. */
export const SEGMENT_TOGGLE_SEGMENT_SIZE_CLASSES: Partial<
  Record<SegmentToggleVariant, Record<SegmentToggleSize, string>>
> = {
  pill: { sm: 'px-2.5 py-1', md: 'px-3 py-1.5', lg: 'px-3.5 py-2' },
  glass: { sm: 'px-2.5 py-1', md: 'px-3 py-1.5', lg: 'px-3.5 py-2' },
  wave: { sm: 'h-7 px-2.5', md: 'h-8 px-3', lg: 'h-9 px-3.5' },
};

/** Chữ đoạn đang chọn nằm trên mặt trượt nền nhạt (`primary` · `underline`). */
export const SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES = 'text-action-base';

/** Chữ đoạn đang chọn nằm trên CHIP nổi (kiểu macOS). */
const SEGMENT_TOGGLE_RAISED_TEXT_CLASSES = 'text-fg-heading';

/** Đoạn chưa chọn trên rãnh `bg-pressed`: chữ muted, rê → chữ đậm + nền trắng mờ (tối: nền sáng mờ, vì `bg-surface` tối hơn rãnh). */
const SEGMENT_TOGGLE_TRACK_INACTIVE_CLASSES = cn(
  'text-fg-muted enabled:hover:bg-bg-surface/60 enabled:hover:text-fg-heading',
  'dark:enabled:hover:bg-neutral-0/10',
);

/** Đoạn đứng riêng chưa chọn (`tab*` · `underline`): chữ muted, rê → nền `bg-subtle`. */
const SEGMENT_TOGGLE_LOOSE_INACTIVE_CLASSES =
  'text-fg-muted enabled:hover:bg-bg-subtle enabled:hover:text-fg-heading';

/** Đoạn đang chọn của `tab*`: mặt ngọc nhạt, chữ `action-base`. */
const SEGMENT_TOGGLE_TINT_ACTIVE_CLASSES = 'bg-primary-5/12 text-action-base';

export const SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES = {
  pill: {
    active: SEGMENT_TOGGLE_RAISED_TEXT_CLASSES,
    inactive: SEGMENT_TOGGLE_TRACK_INACTIVE_CLASSES,
  },
  subtle: {
    active: cn('text-fg-heading', SEGMENT_TOGGLE_RAISED_CHIP_CLASSES),
    inactive: SEGMENT_TOGGLE_TRACK_INACTIVE_CLASSES,
  },
  tab: {
    active: SEGMENT_TOGGLE_TINT_ACTIVE_CLASSES,
    inactive: SEGMENT_TOGGLE_LOOSE_INACTIVE_CLASSES,
  },
  'tab-v2': {
    active: SEGMENT_TOGGLE_TINT_ACTIVE_CLASSES,
    inactive: SEGMENT_TOGGLE_LOOSE_INACTIVE_CLASSES,
  },
  /** Y hệt `tab-v2` (mặt ngọc nhạt, không ngoặc). */
  'tab-hud': {
    active: SEGMENT_TOGGLE_TINT_ACTIVE_CLASSES,
    inactive: SEGMENT_TOGGLE_LOOSE_INACTIVE_CLASSES,
  },
  solid: {
    active: SEGMENT_TOGGLE_RAISED_TEXT_CLASSES,
    inactive: SEGMENT_TOGGLE_TRACK_INACTIVE_CLASSES,
  },
  glass: {
    active: SEGMENT_TOGGLE_RAISED_TEXT_CLASSES,
    inactive: SEGMENT_TOGGLE_TRACK_INACTIVE_CLASSES,
  },
  underline: {
    active: SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES,
    inactive: SEGMENT_TOGGLE_LOOSE_INACTIVE_CLASSES,
  },
  wave: {
    active: 'text-(--sw-fg)',
    inactive: 'text-(--sw-fg-muted) enabled:hover:bg-(--sw-hover) enabled:hover:text-(--sw-fg)',
  },
} satisfies Record<SegmentToggleVariant, Record<SegmentToggleState, string>>;

export const SEGMENT_TOGGLE_ICON_BASE_CLASSES = 'shrink-0 inline-flex items-center justify-center';

export const SEGMENT_TOGGLE_ICON_VARIANT_CLASSES = {
  pill: 'size-5 [&>svg]:size-3.5',
  subtle: 'size-4 [&>svg]:size-3.5',
  tab: 'size-5 [&>svg]:size-3.5',
  'tab-v2': 'size-5 [&>svg]:size-3.5',
  'tab-hud': 'size-5 [&>svg]:size-3.5',
  solid: 'size-5 [&>svg]:size-3.5',
  glass: 'size-5 [&>svg]:size-3.5',
  underline: 'size-4 [&>svg]:size-4',
  wave: 'size-5 [&>svg]:size-3.5',
} satisfies Record<SegmentToggleVariant, string>;

/** Nhãn + bóng ma giữ chỗ cho nét đậm (`::after` đọc `data-label`, cao 0, vô hình) — đoạn không co giãn khi chọn. */
export const SEGMENT_TOGGLE_LABEL_BASE_CLASSES = cn(
  'inline-flex flex-col items-center whitespace-nowrap',
  'after:invisible after:h-0 after:overflow-hidden after:select-none after:content-[attr(data-label)]',
);

/** Chữ thường kiểu câu (`tab*` 13px) + bóng ma semibold. */
export const SEGMENT_TOGGLE_LABEL_VARIANT_CLASSES = {
  pill: 'text-body-14-medium after:text-body-14-semibold',
  subtle: 'text-caption-12-medium after:text-caption-12-semibold',
  tab: 'text-body-13-medium after:text-body-13-semibold',
  'tab-v2': 'text-body-13-medium after:text-body-13-semibold',
  'tab-hud': 'text-body-13-medium after:text-body-13-semibold',
  solid: 'text-body-14-medium after:text-body-14-semibold',
  glass: 'text-body-14-medium after:text-body-14-semibold',
  underline: 'text-body-14-medium after:text-body-14-semibold',
  wave: 'text-body-14-medium after:text-body-14-semibold',
} satisfies Record<SegmentToggleVariant, string>;

/** Nhãn đoạn ĐANG CHỌN: semibold. */
export const SEGMENT_TOGGLE_LABEL_ACTIVE_CLASSES = {
  pill: 'text-body-14-semibold',
  subtle: 'text-caption-12-semibold',
  tab: 'text-body-13-semibold',
  'tab-v2': 'text-body-13-semibold',
  'tab-hud': 'text-body-13-semibold',
  solid: 'text-body-14-semibold',
  glass: 'text-body-14-semibold',
  underline: 'text-body-14-semibold',
  wave: 'text-body-14-semibold',
} satisfies Record<SegmentToggleVariant, string>;

/** Đoạn khoá RIÊNG (`option.disabled`, không đang chọn): mờ `opacity-50` (gọn kiểu macOS). Cả nhóm khoá (`disabled`) thì root mờ. */
export const SEGMENT_TOGGLE_SEGMENT_DISABLED_CLASSES = 'opacity-50';

export const SEGMENT_TOGGLE_ROOT_DISABLED_CLASSES = 'cursor-not-allowed opacity-50';

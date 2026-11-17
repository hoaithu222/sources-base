import { BUTTON_SOLID_TEXT_SHADOW } from '@/shared/ui/actions/button.theme';
import {
  HUD_ACTIVE_FILL,
  HUD_LIT_FILL,
  HUD_PANEL_FILL,
  HUD_SOLID_PRIMARY,
} from '@/shared/ui/primitives/hud.theme';
import { cn } from '@/shared/utils/style/cn';
import type {
  SegmentToggleSize,
  SegmentToggleSkin,
  SegmentToggleState,
  SegmentToggleVariant,
} from './segment-toggle.types';

/**
 * segment-toggle.theme.ts — bảng class của SegmentToggle, mỗi slot một nhóm bảng.
 *
 * Tra:    [variant] hoặc [variant][state] (state = active | inactive).
 * Sửa:    khung → *_VARIANT_CLASSES · màu → *_STATE_CLASSES · skin / size → *_SKIN_ / *_SIZE_CLASSES
 * Lưu ý:  skin và size chỉ vài variant đọc nên bảng `Partial`; thiếu ô = dùng ô mặc định của variant.
 *         Mỗi ô tự đủ cả hai theme: class trần cho nền sáng, `dark:` giữ dáng HUD của nền tối.
 *         ⛔ pill · solid · glass · underline: nền ô đang chọn là MẶT TRƯỢT (`segment-toggle-glide.theme.ts`) — ô `active`
 *            của 4 variant này CHỈ đổi màu chữ; thêm nền vào đây là hai lớp nền chồng nhau.
 *         ⛔ hover của segment chưa chọn viết `enabled:hover:` — segment disabled không được đổi màu.
 */

export const SEGMENT_TOGGLE_ROOT_BASE_CLASSES = 'relative inline-flex items-center';

export const SEGMENT_TOGGLE_ROOT_VARIANT_CLASSES = {
  pill: cn(
    'gap-0.5 p-0.5 bg-bg-subtle ring-1 ring-inset ring-border-default',
    'dark:bg-bg-input dark:ring-hud-5/30 dark:backdrop-blur-[10px]',
    HUD_LIT_FILL,
  ),
  subtle: cn(
    'overflow-hidden border border-border-default bg-bg-surface divide-x divide-border-default',
    'dark:border-hud-5/30 dark:divide-hud-5/20',
    HUD_LIT_FILL,
  ),
  tab: 'gap-1',
  'tab-v2': 'gap-1',
  'tab-hud': 'gap-1.5',
  solid: cn(
    'gap-0.5 p-1 bg-bg-pressed',
    'dark:bg-neutral-9 dark:ring-1 dark:ring-inset dark:ring-hud-5/25',
    HUD_LIT_FILL,
  ),
  glass: cn(
    'gap-0.5 p-0.5 bg-bg-subtle/80 ring-1 ring-inset ring-border-default backdrop-blur-[10px]',
    'dark:bg-bg-input/60 dark:ring-hud-5/30',
    HUD_LIT_FILL,
  ),
  underline: 'w-full gap-0 border-b border-divider-strong bg-transparent p-0 dark:border-hud-5/30',
} satisfies Record<SegmentToggleVariant, string>;

export const SEGMENT_TOGGLE_SEGMENT_BASE_CLASSES = cn(
  'relative inline-flex items-center shrink-0 cursor-pointer',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
  'disabled:cursor-not-allowed',
  'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const SEGMENT_TOGGLE_TOUCH_HIT_CLASSES =
  "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-1.5 touch:after:content-['']";

export const SEGMENT_TOGGLE_SEGMENT_VARIANT_CLASSES = {
  pill: cn('gap-1.5 h-auto justify-center', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  subtle: 'gap-1 h-auto px-2.5 py-1.5 focus-visible:ring-inset',
  tab: cn('gap-1 h-8 px-3 py-1.5', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  'tab-v2': cn('gap-1 h-8 px-3 py-1.5', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  'tab-hud': cn(
    'gap-1 h-8 rounded-none border px-3.5 py-1.5',
    "before:pointer-events-none before:absolute before:left-[-1px] before:top-[-1px] before:size-2 before:border-l-2 before:border-t-2 before:content-['']",
    "after:pointer-events-none after:absolute after:bottom-[-1px] after:right-[-1px] after:size-2 after:border-b-2 after:border-r-2 after:content-['']",
  ),
  solid: cn('gap-1.5 h-8 px-3 py-1.5', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  glass: cn('gap-1.5 h-auto justify-center', SEGMENT_TOGGLE_TOUCH_HIT_CLASSES),
  underline: cn(
    'gap-1.5 h-auto justify-center rounded-none px-2 py-2',
    SEGMENT_TOGGLE_TOUCH_HIT_CLASSES,
  ),
} satisfies Record<SegmentToggleVariant, string>;

/** Đệm theo `size` — chỉ pill / glass đọc size; variant khác tự định chiều cao và đệm. */
export const SEGMENT_TOGGLE_SEGMENT_SIZE_CLASSES: Partial<
  Record<SegmentToggleVariant, Record<SegmentToggleSize, string>>
> = {
  pill: { sm: 'px-2.5 py-1', md: 'px-3 py-1.5', lg: 'px-3.5 py-2' },
  glass: { sm: 'px-2.5 py-1', md: 'px-3 py-1.5', lg: 'px-3.5 py-2' },
};

/** Segment đang bật (tối): mặt HUD xanh-ngọc thay nền đặc / xám phẳng — nền màu cũ phải về `transparent`. */
const SEGMENT_TOGGLE_HUD_ACTIVE_CLASSES = cn(
  HUD_ACTIVE_FILL,
  'dark:bg-transparent dark:text-fg-heading',
);

/** Segment đang bật theo skin màu (tối, `subtle`): cùng dáng mặt HUD nhưng tông = `--segment-tone` của ô. */
const SEGMENT_TOGGLE_TONE_ACTIVE_CLASSES = cn(
  'dark:bg-transparent',
  'dark:bg-[linear-gradient(0deg,color-mix(in_srgb,var(--segment-tone)_40%,transparent),color-mix(in_srgb,var(--segment-tone)_8%,transparent))]',
  'dark:shadow-[inset_0_-2px_0_var(--segment-tone)]',
);

/** Chữ đoạn đang chọn nằm trên mặt trượt nền nhạt (sáng) / mặt HUD (tối). */
const SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES = 'text-action-base dark:text-fg-heading';

export const SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES = {
  pill: {
    active: 'text-neutral-0 dark:text-fg-heading',
    inactive: 'text-fg-body enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
  subtle: {
    active: 'bg-bg-pressed text-fg-heading dark:shadow-[inset_0_-2px_0_var(--color-fg-muted)]',
    inactive: 'text-fg-muted enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
  tab: {
    active: cn('bg-primary-5/12 text-action-base', SEGMENT_TOGGLE_HUD_ACTIVE_CLASSES),
    inactive: 'text-fg-body enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
  'tab-v2': {
    active: cn('bg-primary-5/12 text-action-base', SEGMENT_TOGGLE_HUD_ACTIVE_CLASSES),
    inactive: 'text-fg-body enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
  'tab-hud': {
    active: cn(
      'border-sky-6 bg-sky-5/10 text-sky-8 before:border-sky-6 after:border-sky-6',
      'dark:border-sky-5 dark:text-sky-3 dark:before:border-sky-4 dark:after:border-sky-4',
      'dark:bg-[linear-gradient(0deg,color-mix(in_srgb,var(--color-sky-5)_30%,transparent),color-mix(in_srgb,var(--color-sky-5)_6%,transparent))]',
      'dark:shadow-[inset_0_0_10px_-2px_color-mix(in_srgb,var(--color-sky-5)_55%,transparent),0_0_12px_-4px_var(--color-sky-5)]',
      'dark:[text-shadow:0_0_8px_color-mix(in_srgb,var(--color-sky-4)_55%,transparent)]',
    ),
    inactive: cn(
      'border-border-default text-fg-body before:border-border-strong after:border-border-strong',
      'enabled:hover:border-sky-5/50 enabled:hover:text-fg-heading',
      'enabled:hover:before:border-sky-5 enabled:hover:after:border-sky-5',
      HUD_PANEL_FILL,
      'dark:enabled:hover:shadow-[inset_0_0_10px_-2px_color-mix(in_srgb,var(--color-sky-5)_35%,transparent)]',
    ),
  },
  solid: {
    active: SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES,
    inactive: 'text-fg-body enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
  glass: {
    active: SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES,
    inactive: 'text-fg-body enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
  underline: {
    active: SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES,
    inactive: 'text-fg-body enabled:hover:bg-bg-nav-hover enabled:hover:text-fg-heading',
  },
} satisfies Record<SegmentToggleVariant, Record<SegmentToggleState, string>>;

/**
 * Ô THAY cho `SEGMENT_TOGGLE_SEGMENT_STATE_CLASSES[variant].active` khi skin ≠ neutral. Skin màu: `--segment-tone` tô
 * mặt (tối) · `--segment-ink` = màu chữ + nền chip (sáng) / số trong chip (tối). Mực sáng phải ĐẬM (`-8` / `-7`):
 * chữ `-5` / `success` / `warning` trên nền pha 15% chỉ 2.4–4.3:1.
 */
export const SEGMENT_TOGGLE_SEGMENT_SKIN_CLASSES: Partial<
  Record<SegmentToggleVariant, Partial<Record<SegmentToggleSkin, string>>>
> = {
  pill: { primary: SEGMENT_TOGGLE_GLIDE_TEXT_CLASSES },
  subtle: {
    primary: cn('bg-primary-5/12 text-action-base', SEGMENT_TOGGLE_HUD_ACTIVE_CLASSES),
    'primary-solid': cn('bg-primary-6 text-neutral-0', HUD_SOLID_PRIMARY, BUTTON_SOLID_TEXT_SHADOW),
    sky: cn(
      'bg-sky-5/15 text-[color:var(--segment-ink)]',
      '[--segment-tone:var(--color-sky-5)] [--segment-ink:var(--color-sky-8)]',
      SEGMENT_TOGGLE_TONE_ACTIVE_CLASSES,
      'dark:[--segment-ink:var(--color-sky-3)]',
    ),
    success: cn(
      'bg-success-5/15 text-[color:var(--segment-ink)]',
      '[--segment-tone:var(--color-success)] [--segment-ink:var(--color-success-8)]',
      SEGMENT_TOGGLE_TONE_ACTIVE_CLASSES,
      'dark:[--segment-ink:var(--color-green-3)]',
    ),
    warning: cn(
      'bg-warning-5/15 text-[color:var(--segment-ink)]',
      '[--segment-tone:var(--color-warning)] [--segment-ink:var(--color-warning-7)]',
      SEGMENT_TOGGLE_TONE_ACTIVE_CLASSES,
      'dark:[--segment-ink:var(--color-orange-3)]',
    ),
  },
};

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
} satisfies Record<SegmentToggleVariant, string>;

export const SEGMENT_TOGGLE_LABEL_BASE_CLASSES = 'whitespace-nowrap';

export const SEGMENT_TOGGLE_LABEL_VARIANT_CLASSES = {
  pill: 'text-body-14-medium',
  subtle: 'text-caption-12-medium',
  tab: 'text-caption-12-medium uppercase',
  'tab-v2': 'text-caption-12-medium uppercase',
  'tab-hud': 'text-caption-12-medium uppercase tracking-wide',
  solid: 'text-body-14-medium uppercase',
  glass: 'text-body-14-medium',
  underline: 'text-body-14-medium',
} satisfies Record<SegmentToggleVariant, string>;

/**
 * Đoạn khoá RIÊNG (`option.disabled`, không đang chọn): sọc chéo mảnh + chữ khoá — đọc ra "không bấm được" chứ không
 * chỉ "nhạt hơn". Chữ khoá = mực `fg-body` pha trong → ~3:1 trên MỌI rãnh cả hai theme (`fg-faint` đặc: 2.2:1 trên rãnh
 * `bg-pressed`, 6.4:1 ở tối). Cả nhóm khoá (`disabled`) thì root mờ, không sọc.
 */
const SEGMENT_TOGGLE_LOCKED_TEXT_CLASSES = 'text-fg-body/55 dark:text-fg-body/40';

export const SEGMENT_TOGGLE_SEGMENT_DISABLED_CLASSES = cn(
  SEGMENT_TOGGLE_LOCKED_TEXT_CLASSES,
  'bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_srgb,var(--color-neutral-9)_8%,transparent)_6px_7px)]',
  'dark:bg-[repeating-linear-gradient(135deg,transparent_0_6px,color-mix(in_srgb,var(--color-neutral-0)_7%,transparent)_6px_7px)]',
);

export const SEGMENT_TOGGLE_ROOT_DISABLED_CLASSES = 'cursor-not-allowed opacity-50';

/**
 * Badge = chip đếm LUÔN có nền (số trần sau nhãn đọc thành một chữ: "Tháng 12" ≈ tháng Mười Hai). Màu theo trạng thái:
 * chưa chọn → chip mềm; đang chọn → tương phản với mặt đoạn (sáng: mặt đặc → chip trắng · mặt nhạt → chip đặc; tối: giếng
 * tối số trắng).
 */
export const SEGMENT_TOGGLE_BADGE_BASE_CLASSES = cn(
  'inline-flex items-center justify-center min-w-5 px-1.5 py-0.5 rounded-full',
  'text-caption-12-tight-semibold tabular-nums transition-colors duration-150',
);

/** Cỡ / góc chip riêng theo variant: `subtle` gọn (đoạn 28px) · `tab-v2` / `tab-hud` vuông theo khung. */
export const SEGMENT_TOGGLE_BADGE_VARIANT_CLASSES: Partial<Record<SegmentToggleVariant, string>> = {
  subtle: 'min-w-4 px-1 py-px',
  'tab-v2': 'rounded-none',
  'tab-hud': 'rounded-none',
};

/**
 * Chưa chọn / chìm: chip = mực PHA TRONG (sáng `neutral-9` · tối `neutral-0`) đè lên nền bên dưới → thấy hình chip như
 * nhau trên mọi rãnh và cả lúc rê (chip `bg-pressed` đặc trùng màu rãnh `solid` + nền rê của pill / glass).
 */
export const SEGMENT_TOGGLE_BADGE_INACTIVE_CLASSES =
  'bg-neutral-9/14 text-fg-body dark:bg-neutral-0/10 dark:text-neutral-1';

/** Số 0 hoặc đoạn khoá: chip chìm (nền nhạt hơn, số cùng mực chữ khoá) — không có gì để xem thì không hút mắt. */
export const SEGMENT_TOGGLE_BADGE_MUTED_CLASSES = cn(
  'bg-neutral-9/8 dark:bg-neutral-0/7',
  SEGMENT_TOGGLE_LOCKED_TEXT_CLASSES,
);

/**
 * Tối: chip = GIẾNG tối khoét vào mặt đang bật, số trắng — không đĩa trắng đặc (sáng nhất khung, giành mắt với nhãn).
 * `underline` mặt gần như nền trang (giếng tối không hiện) → chip kính sáng hơn mặt.
 */
const BADGE_ACTIVE_DARK = 'dark:bg-neutral-10/55 dark:text-fg-heading';
/** Mặt ĐẶC (sáng) → chip trắng chữ brand. */
const BADGE_ON_SOLID = cn('bg-neutral-0 text-primary-7', BADGE_ACTIVE_DARK);
/** Mặt NHẠT (sáng) → chip mang màu chữ đang chọn (`action-base`); `primary-6` + số trắng chỉ 3.3:1. */
const BADGE_ON_TINT = cn('bg-action-base text-neutral-0', BADGE_ACTIVE_DARK);
/** Skin màu của `subtle`: sáng chip = `--segment-ink` · tối giếng tối, số theo mực sáng của skin. */
const BADGE_ON_TONE = cn(
  'bg-[color:var(--segment-ink)] text-neutral-0',
  BADGE_ACTIVE_DARK,
  'dark:text-[color:var(--segment-ink)]',
);

export const SEGMENT_TOGGLE_BADGE_ACTIVE_CLASSES = {
  pill: BADGE_ON_SOLID,
  subtle: cn('bg-neutral-7 text-neutral-0', BADGE_ACTIVE_DARK),
  tab: BADGE_ON_TINT,
  'tab-v2': BADGE_ON_TINT,
  'tab-hud': cn('bg-sky-8 text-neutral-0', BADGE_ACTIVE_DARK),
  solid: BADGE_ON_TINT,
  glass: BADGE_ON_TINT,
  underline: cn(BADGE_ON_TINT, 'dark:bg-neutral-0/15'),
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

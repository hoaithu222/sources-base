import type { CSSProperties } from 'react';

import type { GemColor, GemSize } from '@/shared/ui/icons/gem-icon/GemIcon';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { cn } from '@/shared/utils/style/cn';

import type { HudFrameTone } from '../../hud/hud-frame/hud-frame.types';

import type { HudKpiCardDensity } from './hud-kpi-card.types';

/**
 * Bảng class của `HudKpiCard`. Màu của thẻ đi qua biến `--kpi-c` (khai ở gốc theo `color`) nên nền
 * loang và quầng số chỉ cần MỘT chuỗi cho mọi màu.
 */

/** Họ màu của khung `HudFrame` theo `color` — `gray` mượn `indigo` (notes/components/surfaces-cards.md). */
export const HUD_KPI_CARD_FRAME_TONES = {
  blue: 'sky',
  green: 'green',
  yellow: 'yellow',
  red: 'red',
  gray: 'indigo',
} satisfies Record<GemColor, HudFrameTone>;

export const HUD_KPI_CARD_ACCENT_CLASSES = {
  blue: '[--kpi-c:var(--color-sky-5)]',
  green: '[--kpi-c:var(--color-green-5)]',
  yellow: '[--kpi-c:var(--color-yellow-5)]',
  red: '[--kpi-c:var(--color-red-5)]',
  gray: '[--kpi-c:var(--color-indigo-5)]',
} satisfies Record<GemColor, string>;

export const HUD_KPI_CARD_VALUE_COLOR_CLASSES = {
  blue: 'text-sky-7 dark:text-sky-4',
  green: 'text-green-7 dark:text-green-4',
  yellow: 'text-yellow-7 dark:text-yellow-4',
  red: 'text-red-6 dark:text-red-4',
  gray: 'text-fg-heading',
} satisfies Record<GemColor, string>;

/** `--kpi-tint` = độ nhuộm tông ở góc nền thẻ: sáng 8% (ngọc + số nổi lên, không chìm vào nền cùng màu), tối 15%. */
export const HUD_KPI_CARD_ROOT_CLASSES =
  'group/kpi @container [--kpi-tint:8%] dark:[--kpi-tint:15%]';

export const HUD_KPI_CARD_BODY_CLASSES = {
  default: 'px-3.5 pb-3 pt-2.5',
  compact: 'px-3 py-2',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_HEAD_CLASSES = {
  default: 'flex items-start gap-3',
  compact: 'flex items-center gap-3',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_GEM_SIZES = {
  default: 'md',
  compact: 'sm',
} satisfies Record<HudKpiCardDensity, GemSize>;

export const HUD_KPI_CARD_GEM_ICON_SIZES = {
  default: 24,
  compact: 20,
} satisfies Record<HudKpiCardDensity, number>;

export const HUD_KPI_CARD_GEM_CLASSES = {
  default: 'hidden @[220px]:block',
  compact: 'hidden @[210px]:block',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_VALUE_BASE_CLASSES =
  'min-w-0 tabular-nums dark:[text-shadow:0_0_18px_color-mix(in_srgb,var(--kpi-c)_40%,transparent)]';

export const HUD_KPI_CARD_VALUE_SIZE_CLASSES = {
  default: 'text-h3-semibold @max-[219px]:text-h4-semibold @[290px]:text-h2-semibold',
  compact: 'text-h3-semibold @max-[219px]:text-h4-semibold',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_DETAIL_CLASSES = {
  default: '-right-2 -top-1.5 size-7',
  compact: '-right-2 -top-2 size-6',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_DETAIL_ICON_SIZES = {
  default: 16,
  compact: 14,
} satisfies Record<HudKpiCardDensity, number>;

export const HUD_KPI_CARD_LABEL_CLASSES = cn(
  'max-w-full',
  TEXT_ELLIPSIS_CLASSES,
  'text-caption-12-semibold uppercase tracking-[0.07em] text-fg-body @max-[259px]:tracking-normal',
);
export const HUD_KPI_CARD_LABEL_NOTE_CLASSES =
  'shrink-0 text-caption-12-medium tabular-nums text-fg-subheading';
export const HUD_KPI_CARD_UNIT_CLASSES = 'shrink-0 text-caption-12 text-fg-muted';
export const HUD_KPI_CARD_CAPTION_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'text-caption-12 tabular-nums text-fg-body',
);
export const HUD_KPI_CARD_COMPACT_CAPTION_CLASSES = cn(
  'basis-full',
  TEXT_ELLIPSIS_CLASSES,
  'text-caption-12 tabular-nums text-fg-body @[380px]:ml-auto @[380px]:basis-auto',
);
export const HUD_KPI_CARD_BONE_CLASSES =
  'block animate-pulse rounded-xs bg-divider-default/80 motion-reduce:animate-none';

export const HUD_KPI_CARD_BODY_STYLE: CSSProperties = {
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--kpi-c) var(--kpi-tint), var(--color-bg-surface)) 0%, var(--color-bg-surface) 64%)',
};

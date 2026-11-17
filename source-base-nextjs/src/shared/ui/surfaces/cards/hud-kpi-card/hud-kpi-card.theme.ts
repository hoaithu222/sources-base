import type { CSSProperties } from 'react';

import type { GemColor, GemSize } from '@/shared/ui/icons/gem-icon/GemIcon';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { cn } from '@/shared/utils/style/cn';

import type { HudKpiCardDensity } from './hud-kpi-card.types';

/**
 * Bảng class của `HudKpiCard`. Màu của thẻ đi qua biến `--kpi-c` (khai ở gốc theo `color`) nên nền loang chỉ cần MỘT
 * chuỗi cho mọi màu.
 * Thẻ trắng trung tính (khung `HudFrame` bo `lg` + `--elev-1`) ở cả hai theme: nhãn chữ thường `fg-muted`, số `fg-heading`
 * — tông chỉ ở ô icon + vệt 4% góc trên-trái. Đệm đều 4 cạnh, nút góc cách mép 11px, dòng phụ xếp chồng.
 */

export const HUD_KPI_CARD_ACCENT_CLASSES = {
  blue: '[--kpi-c:var(--color-sky-5)]',
  green: '[--kpi-c:var(--color-green-5)]',
  yellow: '[--kpi-c:var(--color-yellow-5)]',
  red: '[--kpi-c:var(--color-red-5)]',
  gray: '[--kpi-c:var(--color-indigo-5)]',
} satisfies Record<GemColor, string>;

/** Số mực `fg-heading` (muốn tô màu → `valueClassName`). */
export const HUD_KPI_CARD_VALUE_COLOR_CLASSES = 'text-fg-heading';

/** `--kpi-tint` = độ nhuộm tông ở góc nền thẻ: 4% (gợi tông, thẻ vẫn trung tính). `shadow-(--elev-1)` thay bóng của `HudFrame`. */
export const HUD_KPI_CARD_ROOT_CLASSES = 'group/kpi @container shadow-(--elev-1) [--kpi-tint:4%]';

/** Đệm thân: đều 4 cạnh — `default` 16px · `compact` 14px. */
export const HUD_KPI_CARD_BODY_CLASSES = {
  default: 'p-4',
  compact: 'p-3.5',
} satisfies Record<HudKpiCardDensity, string>;

/** Cột chữ cạnh ô icon: nhãn → dòng số. `compact`: nhãn cách số 6px. */
export const HUD_KPI_CARD_TEXT_CLASSES = {
  default: 'flex min-w-0 flex-1 flex-col gap-1',
  compact: 'flex min-w-0 flex-1 flex-col gap-1.5',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_LABEL_ROW_CLASSES = 'flex min-h-4 flex-wrap items-baseline gap-x-2';

/** Chừa chỗ cho nút chi tiết ở dòng nhãn — chỉ ghép khi có `onDetail`. */
export const HUD_KPI_CARD_LABEL_ROW_DETAIL_CLASSES = 'pr-8';

export const HUD_KPI_CARD_VALUE_ROW_CLASSES =
  'flex flex-wrap items-baseline gap-x-1.5 gap-y-1 leading-none';

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

export const HUD_KPI_CARD_VALUE_BASE_CLASSES = 'min-w-0 tabular-nums';

export const HUD_KPI_CARD_VALUE_SIZE_CLASSES = {
  default: 'text-h3-semibold @max-[219px]:text-h4-semibold @[290px]:text-h2-semibold',
  compact: 'text-h3-semibold @max-[219px]:text-h4-semibold',
} satisfies Record<HudKpiCardDensity, string>;

/**
 * Nút chi tiết góc trên-phải (`rounded-md`); cảm ứng nới vùng chạm lên 44px bằng `::after`. Không viền, icon `fg-muted`, rê
 * vào thẻ thì nút hiện nền `bg-subtle`.
 */
export const HUD_KPI_CARD_DETAIL_BASE_CLASSES = cn(
  'absolute z-10 rounded-md px-0 py-0 touch:after:-inset-2',
  'border-transparent text-fg-muted group-hover/kpi:bg-bg-subtle',
);

/** Vị trí + cỡ nút chi tiết: 28px, cách mép thẻ 11px cả trên lẫn phải. */
export const HUD_KPI_CARD_DETAIL_CLASSES = {
  default: '-right-1.5 -top-1.5 size-7',
  compact: '-right-1 -top-1 size-7',
} satisfies Record<HudKpiCardDensity, string>;

export const HUD_KPI_CARD_DETAIL_ICON_SIZES = {
  default: 16,
  compact: 14,
} satisfies Record<HudKpiCardDensity, number>;

/** Chữ thường `fg-muted` (thẻ lớn `body-14`, dải gọn `caption-12`). */
export const HUD_KPI_CARD_LABEL_CLASSES = {
  default: cn('max-w-full', TEXT_ELLIPSIS_CLASSES, 'text-body-14-medium text-fg-muted'),
  compact: cn('max-w-full', TEXT_ELLIPSIS_CLASSES, 'text-caption-12-semibold text-fg-muted'),
} satisfies Record<HudKpiCardDensity, string>;
export const HUD_KPI_CARD_LABEL_NOTE_CLASSES =
  'shrink-0 text-caption-12-medium tabular-nums text-fg-muted';
/** Đơn vị sau số, cùng đường chân chữ với số: `body-14` (≈ 0,6 cỡ số `compact`). */
export const HUD_KPI_CARD_UNIT_CLASSES = 'shrink-0 text-body-14 text-fg-muted';
export const HUD_KPI_CARD_CAPTION_CLASSES = cn(
  TEXT_ELLIPSIS_CLASSES,
  'text-caption-12 tabular-nums text-fg-muted',
);
/** Dòng phụ của `compact`: luôn xuống dòng dưới số, cắt `…`. */
export const HUD_KPI_CARD_COMPACT_CAPTION_CLASSES = cn(
  'basis-full',
  TEXT_ELLIPSIS_CLASSES,
  'text-caption-12 tabular-nums text-fg-muted',
);
export const HUD_KPI_CARD_BONE_CLASSES =
  'block animate-pulse rounded-xs bg-divider-default/80 motion-reduce:animate-none';

export const HUD_KPI_CARD_BODY_STYLE: CSSProperties = {
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--kpi-c) var(--kpi-tint), var(--color-bg-surface)) 0%, var(--color-bg-surface) 64%)',
};

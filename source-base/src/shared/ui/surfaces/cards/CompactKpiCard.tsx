import type { ReactNode } from 'react';
import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import Text, { type TextSize } from '@/shared/ui/primitives/Text';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import GemIcon, { type GemColor, type GemSize } from '@/shared/ui/icons/gem-icon/GemIcon';
import AnimatedNumber from '@/shared/ui/data-display/AnimatedNumber';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

export type CompactKpiCardSize = 'xs' | 'sm' | 'md' | 'lg';
export type CompactKpiCardColor = 'blue' | 'yellow' | 'green' | 'red' | 'gray';
export type CompactKpiCardEmphasis = 'normal' | 'strong';

export interface CompactKpiCardProps {
  color?: GemColor;
  size?: CompactKpiCardSize;
  emphasis?: CompactKpiCardEmphasis;
  icon: BoldSystemIconName;
  label: string;
  value: string | number;
  animate?: boolean;
  valueFormat?: (value: number) => string;
  unit?: string;
  unitSize?: TextSize;
  trailing?: ReactNode;
  footer?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

type CompactKpiCardState = 'idle' | 'interactive' | 'selected';

interface SizePreset {
  gem: GemSize;
  systemIcon: number;
  labelText: TextSize;
  unitText: TextSize;
}

const COMPACT_KPI_CARD_BASE_CLASSES = 'flex items-center';

/**
 * Mặt thẻ. Sáng: nền ĐẶC `bg-surface` + vệt tông tắt dần ở 65% bề ngang (phía ngọc) — nền pha trong suốt để lưới / nền
 * trang lộ xuyên qua thẻ, số nằm trên nền loang. Tối: giữ gradient pha cả bề ngang trên panel (`dark:` trả về như cũ).
 */
const COMPACT_KPI_CARD_SURFACE_CLASSES = cn(
  'bg-bg-surface bg-linear-to-r to-transparent to-65%',
  'dark:bg-transparent dark:to-100%',
);

const COMPACT_KPI_CARD_COLOR_CLASSES = {
  blue: 'border-l-sky-6 from-sky-5/14 dark:from-sky-5/20 dark:to-sky-5/10',
  yellow: 'border-l-yellow-6 from-yellow-5/18 dark:from-yellow-5/20 dark:to-yellow-5/10',
  green: 'border-l-green-6 from-green-5/14 dark:from-green-5/20 dark:to-green-5/10',
  red: 'border-l-red-6 from-red-5/12 dark:from-red-5/20 dark:to-red-5/10',
  gray: 'border-l-neutral-6 from-neutral-5/14 dark:from-neutral-5/20 dark:to-neutral-5/10',
} satisfies Record<CompactKpiCardColor, string>;

const COMPACT_KPI_CARD_SIZE_CLASSES = {
  xs: 'gap-2 px-2 py-1',
  sm: 'gap-2 px-2.5 py-1.5',
  md: 'gap-3 px-3 py-2',
  lg: 'gap-4 px-4 py-3',
} satisfies Record<CompactKpiCardSize, string>;

const COMPACT_KPI_CARD_CONTENT_SIZE_CLASSES = {
  xs: 'gap-2',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
} satisfies Record<CompactKpiCardSize, string>;

const COMPACT_KPI_CARD_EMPHASIS_CLASSES = {
  normal: 'border-l-2',
  strong: 'border-l-4',
} satisfies Record<CompactKpiCardEmphasis, string>;

/** Bóng sáng 2 lớp (sát 1px + loang dưới) tách thẻ trắng khỏi nền trang; tối giữ bóng 1 lớp cũ. */
const COMPACT_KPI_CARD_REST_SHADOW = cn(
  'shadow-[0_1px_2px_var(--color-shadow-popup),0_4px_12px_-6px_var(--color-shadow-popup)]',
  'dark:shadow-[0_1px_3px_var(--color-shadow-popup)]',
);

const COMPACT_KPI_CARD_STATE_CLASSES = {
  idle: COMPACT_KPI_CARD_REST_SHADOW,
  interactive: cn(
    COMPACT_KPI_CARD_REST_SHADOW,
    'hover:shadow-[0_6px_16px_-8px_var(--color-shadow-popup)] active:shadow-none',
  ),
  selected: cn(
    'shadow-[0_0_0_2px_var(--color-primary-5)]',
    'dark:shadow-[0_0_0_2px_var(--color-primary-5),0_0_16px_-2px_var(--color-primary-5)]',
  ),
} satisfies Record<CompactKpiCardState, string>;

const COMPACT_KPI_CARD_CLICKABLE_CLASSES = cn(
  'cursor-pointer text-left transition-[box-shadow] duration-200 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

const COMPACT_KPI_CARD_LABEL_CLASSES = {
  normal: {
    blue: 'text-sky-8 dark:text-sky-2',
    yellow: 'text-yellow-8 dark:text-yellow-2',
    green: 'text-green-8 dark:text-green-2',
    red: 'text-red-8 dark:text-red-2',
    gray: 'text-fg-subheading',
  },
  strong: {
    blue: 'uppercase tracking-wide text-sky-9 dark:text-sky-1',
    yellow: 'uppercase tracking-wide text-yellow-9 dark:text-yellow-1',
    green: 'uppercase tracking-wide text-green-9 dark:text-green-1',
    red: 'uppercase tracking-wide text-red-9 dark:text-red-1',
    gray: 'uppercase tracking-wide text-fg-heading',
  },
} satisfies Record<CompactKpiCardEmphasis, Record<CompactKpiCardColor, string>>;

const COMPACT_KPI_CARD_VALUE_CLASSES = {
  normal: {
    xs: 'text-body-16-semibold',
    sm: 'text-body-16-semibold',
    md: 'text-h4-semibold',
    lg: 'text-h3-semibold',
  },
  strong: {
    xs: 'text-h4-semibold',
    sm: 'text-h4-semibold',
    md: 'text-h3-semibold',
    lg: 'text-h3-semibold',
  },
} satisfies Record<CompactKpiCardEmphasis, Record<CompactKpiCardSize, string>>;

const COMPACT_KPI_CARD_UNIT_CLASSES = {
  normal: 'whitespace-nowrap text-fg-muted tabular-nums',
  strong: 'whitespace-nowrap text-fg-subheading tabular-nums',
} satisfies Record<CompactKpiCardEmphasis, string>;

/** Cỡ gem · icon · chữ theo `size` (giá trị không phải class: số, prop của Text / GemIcon). */
const COMPACT_KPI_CARD_SIZE_PRESETS = {
  xs: { gem: 'sm', systemIcon: 14, labelText: 'tiny', unitText: 'extraTiny' },
  sm: { gem: 'sm', systemIcon: 16, labelText: 'small', unitText: 'extraTiny' },
  md: { gem: 'sm', systemIcon: 18, labelText: 'small', unitText: 'extraTiny' },
  lg: { gem: 'md', systemIcon: 24, labelText: 'medium', unitText: 'tiny' },
} satisfies Record<CompactKpiCardSize, SizePreset>;

/** Ghi đè chữ khi `emphasis="strong"` (unit to hơn 1 bậc); gem giữ nguyên. */
const COMPACT_KPI_CARD_STRONG_PRESETS = {
  xs: { labelText: 'tiny', unitText: 'tiny' },
  sm: { labelText: 'small', unitText: 'tiny' },
  md: { labelText: 'small', unitText: 'tiny' },
  lg: { labelText: 'medium', unitText: 'small' },
} satisfies Record<CompactKpiCardSize, Pick<SizePreset, 'labelText' | 'unitText'>>;

/**
 * CompactKpiCard — hàng KPI gọn một dòng: ngọc (GemIcon) + nhãn bên trái, giá trị (+ đơn vị) bên phải.
 *
 * Có `onClick` thì thẻ render thành `<button>` (`aria-pressed` theo `selected`) — dùng làm bộ lọc trong
 * dải KPI. Thẻ cao có mô tả → `SummaryCard`; thẻ big-screen có thanh chân → `HudKpiCard`.
 * Sửa giao diện: màu → `COMPACT_KPI_CARD_COLOR_CLASSES` + `COMPACT_KPI_CARD_LABEL_CLASSES` · cỡ →
 * `COMPACT_KPI_CARD_SIZE_CLASSES` + `COMPACT_KPI_CARD_SIZE_PRESETS` · số → `COMPACT_KPI_CARD_VALUE_CLASSES`
 * · chọn / bấm → `COMPACT_KPI_CARD_STATE_CLASSES` + `COMPACT_KPI_CARD_CLICKABLE_CLASSES`.
 * Lưu ý: truyền SỐ THẬT + `valueFormat`, đừng truyền chuỗi đã format. Nhãn dùng bậc đôi -8 (sáng) / -2 (tối)
 * — text-contrast.md §1. Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.color - Màu viền trái + gradient + nhãn + ngọc: `blue` | `yellow` | `green` | `red` | `gray`.
 *   Mặc định `blue`.
 * @param props.size - Cỡ thẻ (đệm, gap, ngọc, icon, chữ): `xs` | `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.emphasis - `normal` | `strong` (nhãn chữ hoa, tương phản hơn; giá trị / đơn vị to hơn
 *   1 bậc — cho màn big-screen). Mặc định `normal`.
 * @param props.icon - Icon trong ngọc, BẮT BUỘC nét đậm `*-bold`.
 * @param props.label - Nhãn bên trái (một dòng, cắt `…`).
 * @param props.value - Giá trị: số (đếm lên, định dạng bằng `valueFormat`) hoặc chuỗi hiện nguyên văn.
 * @param props.animate - Đếm lên tới `value` khi là SỐ; tắt khi thẻ làm bộ lọc trong dải dài / số đổi liên
 *   tục. Mặc định `true`.
 * @param props.valueFormat - Số → chuỗi hiển thị; chạy MỖI khung hình nên giữ rẻ. Mặc định `formatNumber` (vi-VN).
 * @param props.unit - Đơn vị sau giá trị ("bộ", "%"); chuỗi rỗng = không hiện.
 * @param props.unitSize - Ghi đè cỡ chữ của `unit` (`TextSize`). Mặc định theo `size` + `emphasis`.
 * @param props.trailing - Slot ngoài cùng bên phải hàng (badge xu hướng, icon).
 * @param props.footer - Hàng dưới, chỉ rộng bằng cột bên phải ngọc.
 * @param props.selected - Thẻ đang là bộ lọc active — chỉ có nghĩa khi có `onClick`. Mặc định `false`.
 * @param props.onClick - Có handler → thẻ là `<button>` bấm được.
 * @param props.className - Class thêm cho thẻ.
 *
 * @example
 * <CompactKpiCard color="green" icon="file-bold" label="Công văn" value={128} unit="bộ" />
 *
 * <CompactKpiCard color="red" icon="clock-bold" label="Quá hạn" value={7} selected={filter === 'late'}
 *   onClick={() => setFilter('late')} />
 */
const CompactKpiCard = memo(function CompactKpiCard({
  color = 'blue',
  size = 'md',
  emphasis = 'normal',
  icon,
  label,
  value,
  animate = true,
  valueFormat,
  unit,
  unitSize,
  trailing,
  footer,
  selected = false,
  onClick,
  className,
}: CompactKpiCardProps) {
  const strong = emphasis === 'strong';
  const preset = {
    ...COMPACT_KPI_CARD_SIZE_PRESETS[size],
    ...(strong ? COMPACT_KPI_CARD_STRONG_PRESETS[size] : null),
  };
  const state: CompactKpiCardState = selected ? 'selected' : onClick ? 'interactive' : 'idle';

  const cardClassName = cn(
    COMPACT_KPI_CARD_BASE_CLASSES,
    COMPACT_KPI_CARD_SURFACE_CLASSES,
    COMPACT_KPI_CARD_COLOR_CLASSES[color],
    COMPACT_KPI_CARD_SIZE_CLASSES[size],
    COMPACT_KPI_CARD_EMPHASIS_CLASSES[emphasis],
    COMPACT_KPI_CARD_STATE_CLASSES[state],
    onClick && COMPACT_KPI_CARD_CLICKABLE_CLASSES,
    className,
  );
  const contentClassName = cn('flex items-center', COMPACT_KPI_CARD_CONTENT_SIZE_CLASSES[size]);
  const labelClassName = cn(
    'flex-1',
    TEXT_ELLIPSIS_CLASSES,
    COMPACT_KPI_CARD_LABEL_CLASSES[emphasis][color],
  );
  const valueClassName = cn(
    'text-fg-heading tabular-nums',
    COMPACT_KPI_CARD_VALUE_CLASSES[emphasis][size],
  );

  const body = (
    <>
      <GemIcon color={color} size={preset.gem}>
        <SystemIcon name={icon} size={preset.systemIcon} />
      </GemIcon>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className={contentClassName}>
          <Text
            className={labelClassName}
            size={preset.labelText}
            weight={strong ? 'medium' : 'normal'}
          >
            {label}
          </Text>

          <div className="flex items-baseline gap-1">
            <span className={valueClassName}>
              {typeof value === 'number' ? (
                <AnimatedNumber disabled={!animate} format={valueFormat} value={value} />
              ) : (
                value
              )}
            </span>
            {!!unit && (
              <Text
                className={COMPACT_KPI_CARD_UNIT_CLASSES[emphasis]}
                size={unitSize ?? preset.unitText}
                weight={strong ? 'medium' : 'normal'}
              >
                {unit}
              </Text>
            )}
          </div>

          {trailing}
        </div>

        {footer}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button aria-pressed={selected} className={cardClassName} type="button" onClick={onClick}>
        {body}
      </button>
    );
  }

  return <div className={cardClassName}>{body}</div>;
});

export default CompactKpiCard;

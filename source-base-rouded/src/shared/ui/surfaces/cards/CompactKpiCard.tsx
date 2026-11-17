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
 * Mặt thẻ: thẻ trắng TRUNG TÍNH — viền `border-default` 1px đủ 4 cạnh, không vạch tông, không gradient (tông chỉ nằm ở ô
 * icon). Góc `rounded-lg` (tầng bề mặt). Cùng một hình ở cả hai theme.
 */
const COMPACT_KPI_CARD_SURFACE_CLASSES = 'rounded-lg border border-border-default bg-bg-surface';

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

const COMPACT_KPI_CARD_REST_SHADOW = 'shadow-(--elev-1)';

/**
 * Nghỉ → viền bắt sáng `rim-soft` (chỉ thẻ tĩnh — nó giữ màu cạnh trên / dưới nên không hợp trạng thái rê / chọn);
 * rê → viền `border-strong` + `--elev-2`; chọn → vòng ngọc 2px (viền 1px trong suốt để vòng ôm sát mặt thẻ —
 * visual-hierarchy.md §4.1).
 */
const COMPACT_KPI_CARD_STATE_CLASSES = {
  idle: cn('rim-soft', COMPACT_KPI_CARD_REST_SHADOW),
  interactive: cn(
    COMPACT_KPI_CARD_REST_SHADOW,
    'hover:border-border-strong hover:shadow-(--elev-2) active:shadow-(--elev-1)',
  ),
  selected: 'border-transparent shadow-[0_0_0_2px_var(--color-primary-5)]',
} satisfies Record<CompactKpiCardState, string>;

/** Focus có khoảng hở 2px (màu mặt thẻ) để không lẫn với vòng "đang chọn". */
const COMPACT_KPI_CARD_CLICKABLE_CLASSES = cn(
  'cursor-pointer text-left transition-[box-shadow,border-color] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface',
);

/**
 * `normal`: nhãn trung tính `fg-muted` (tông nằm ở ô icon); `strong` (big-screen): bậc 9 của tông — gần mực, ≥ 7:1 trên
 * nền sáng; tối đổi sang bậc 1. Cả hai chữ thường.
 */
const COMPACT_KPI_CARD_LABEL_CLASSES = {
  normal: {
    blue: 'text-fg-muted',
    yellow: 'text-fg-muted',
    green: 'text-fg-muted',
    red: 'text-fg-muted',
    gray: 'text-fg-muted',
  },
  strong: {
    blue: 'text-sky-9 dark:text-sky-1',
    yellow: 'text-yellow-9 dark:text-yellow-1',
    green: 'text-green-9 dark:text-green-1',
    red: 'text-red-9 dark:text-red-1',
    gray: 'text-fg-heading',
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
 * CompactKpiCard — hàng KPI gọn một dòng: ô icon (GemIcon) + nhãn bên trái, giá trị (+ đơn vị) bên phải.
 *
 * Có `onClick` thì thẻ render thành `<button>` (`aria-pressed` theo `selected`) — dùng làm bộ lọc trong
 * dải KPI. Thẻ cao có mô tả → `SummaryCard`; thẻ big-screen có thanh chân → `HudKpiCard`.
 * Thẻ trắng trung tính (tông chỉ ở ô icon) ở cả hai theme, chọn = vòng ngọc 2px.
 * Sửa giao diện: mặt thẻ → `COMPACT_KPI_CARD_SURFACE_CLASSES` · nhãn → `COMPACT_KPI_CARD_LABEL_CLASSES` · cỡ →
 * `COMPACT_KPI_CARD_SIZE_CLASSES` + `COMPACT_KPI_CARD_SIZE_PRESETS` · số → `COMPACT_KPI_CARD_VALUE_CLASSES` ·
 * chọn / bấm → `COMPACT_KPI_CARD_STATE_CLASSES` + `COMPACT_KPI_CARD_CLICKABLE_CLASSES`.
 * Lưu ý: truyền SỐ THẬT + `valueFormat`, đừng truyền chuỗi đã format. Nhãn `fg-muted` (`strong`: bậc 9 sáng / bậc 1 tối)
 * — text-contrast.md §1. Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.color - Tông ô icon (và nhãn của `emphasis="strong"`): `blue` | `yellow` | `green` | `red` | `gray`.
 *   Mặc định `blue`.
 * @param props.size - Cỡ thẻ (đệm, gap, ô icon, icon, chữ): `xs` | `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.emphasis - `normal` | `strong` (nhãn đậm + tương phản hơn; giá trị / đơn vị to hơn 1 bậc — cho
 *   màn big-screen). Mặc định `normal`.
 * @param props.icon - Icon trong ô, BẮT BUỘC nét đậm `*-bold`.
 * @param props.label - Nhãn bên trái (một dòng, cắt `…`).
 * @param props.value - Giá trị: số (đếm lên, định dạng bằng `valueFormat`) hoặc chuỗi hiện nguyên văn.
 * @param props.animate - Đếm lên tới `value` khi là SỐ; tắt khi thẻ làm bộ lọc trong dải dài / số đổi liên
 *   tục. Mặc định `true`.
 * @param props.valueFormat - Số → chuỗi hiển thị; chạy MỖI khung hình nên giữ rẻ. Mặc định `formatNumber` (vi-VN).
 * @param props.unit - Đơn vị sau giá trị ("bộ", "%"); chuỗi rỗng = không hiện.
 * @param props.unitSize - Ghi đè cỡ chữ của `unit` (`TextSize`). Mặc định theo `size` + `emphasis`.
 * @param props.trailing - Slot ngoài cùng bên phải hàng (badge xu hướng, icon).
 * @param props.footer - Hàng dưới, chỉ rộng bằng cột bên phải ô icon.
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
    COMPACT_KPI_CARD_SIZE_CLASSES[size],
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

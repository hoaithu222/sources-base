import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import GemIcon, { type GemColor, type GemSize } from '@/shared/ui/icons/gem-icon/GemIcon';
import AnimatedNumber from '@/shared/ui/data-display/AnimatedNumber';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import HudCorners, { type HudCornerVariant } from '../hud/HudCorners';

export type SummaryCardSize = 'sm' | 'md' | 'lg';

export interface SummaryCardProps {
  color?: GemColor;
  size?: SummaryCardSize;
  gemSize?: GemSize;
  icon: BoldSystemIconName;
  label: string;
  value: number | string;
  description?: string;
  animate?: boolean;
  valueFormat?: (value: number) => string;
  corners?: HudCornerVariant;
  className?: string;
}

const SUMMARY_CARD_BASE_CLASSES = cn(
  'relative flex w-full items-center overflow-hidden [--hud-c:var(--sc-e)]',
  '[--sc-tint:6%] [--sc-tint-2:2%] dark:[--sc-tint:12%] dark:[--sc-tint-2:4%]',
  'shadow-[0_1px_3px_var(--color-shadow-popup)]',
  'dark:shadow-[0_2px_8px_var(--color-shadow-popup),inset_0_0_24px_color-mix(in_srgb,var(--sc-a)_10%,transparent)]',
  'transition-[box-shadow] duration-200 ease-out',
  'hover:shadow-[0_6px_16px_-8px_var(--color-shadow-popup)]',
  'dark:hover:shadow-[0_0_16px_color-mix(in_srgb,var(--sc-a)_28%,transparent),inset_0_0_20px_color-mix(in_srgb,var(--sc-a)_6%,transparent)]',
);

/** Mỗi màu khai 3 biến CSS: `--sc-a` nền + quầng · `--sc-e` viền + góc (sáng bậc 6, tối bậc 4) · `--sc-glow` quầng chữ. */
const SUMMARY_CARD_COLOR_CLASSES = {
  blue: cn(
    '[--sc-a:var(--color-sky-5)]',
    '[--sc-e:var(--color-sky-6)] dark:[--sc-e:var(--color-sky-4)]',
    '[--sc-glow:color-mix(in_srgb,var(--color-sky-5)_35%,transparent)]',
  ),
  green: cn(
    '[--sc-a:var(--color-green-5)]',
    '[--sc-e:var(--color-green-6)] dark:[--sc-e:var(--color-green-4)]',
    '[--sc-glow:color-mix(in_srgb,var(--color-green-5)_35%,transparent)]',
  ),
  yellow: cn(
    '[--sc-a:var(--color-yellow-5)]',
    '[--sc-e:var(--color-yellow-6)] dark:[--sc-e:var(--color-yellow-4)]',
    '[--sc-glow:color-mix(in_srgb,var(--color-yellow-5)_35%,transparent)]',
  ),
  red: cn(
    '[--sc-a:var(--color-red-5)]',
    '[--sc-e:var(--color-red-6)] dark:[--sc-e:var(--color-red-4)]',
    '[--sc-glow:color-mix(in_srgb,var(--color-red-5)_35%,transparent)]',
  ),
  gray: cn(
    '[--sc-a:var(--color-neutral-5)]',
    '[--sc-e:var(--color-neutral-6)] dark:[--sc-e:var(--color-neutral-4)]',
    '[--sc-glow:color-mix(in_srgb,var(--color-neutral-5)_25%,transparent)]',
  ),
} satisfies Record<GemColor, string>;

const SUMMARY_CARD_SIZE_CLASSES = {
  sm: 'gap-2 px-2 py-2',
  md: 'gap-2 px-3 py-2',
  lg: 'gap-3 px-4 py-3',
} satisfies Record<SummaryCardSize, string>;

const SUMMARY_CARD_CONTENT_SIZE_CLASSES = {
  sm: 'gap-0',
  md: 'gap-0.5',
  lg: 'gap-1',
} satisfies Record<SummaryCardSize, string>;

const SUMMARY_CARD_LABEL_SIZE_CLASSES = {
  sm: 'text-caption-10',
  md: 'text-caption-12',
  lg: 'text-caption-12-medium',
} satisfies Record<SummaryCardSize, string>;

const SUMMARY_CARD_VALUE_BASE_CLASSES =
  'text-fg-heading truncate tabular-nums dark:[text-shadow:0_0_10px_var(--sc-glow)]';

const SUMMARY_CARD_VALUE_SIZE_CLASSES = {
  sm: 'text-body-14-semibold',
  md: 'text-h4-semibold',
  lg: 'text-h3-semibold',
} satisfies Record<SummaryCardSize, string>;

const SUMMARY_CARD_DESCRIPTION_SIZE_CLASSES = {
  sm: 'text-caption-10',
  md: 'text-caption-12',
  lg: 'text-caption-12',
} satisfies Record<SummaryCardSize, string>;

const SUMMARY_CARD_ICON_SIZE = { sm: 14, md: 18, lg: 24 } satisfies Record<SummaryCardSize, number>;

const SUMMARY_CARD_GEM_SIZE = {
  sm: 'sm',
  md: 'md',
  lg: 'md',
} satisfies Record<SummaryCardSize, GemSize>;

const SUMMARY_CARD_ROOT_STYLE = {
  background:
    'linear-gradient(135deg, color-mix(in srgb, var(--sc-a) var(--sc-tint), var(--color-bg-surface)), color-mix(in srgb, var(--sc-a) var(--sc-tint-2), var(--color-bg-subtle)))',
};

const SUMMARY_CARD_STRIPE_STYLE = {
  background:
    'repeating-linear-gradient(-45deg, transparent 0, transparent 50px, color-mix(in srgb, var(--sc-a) 4%, transparent) 50px, color-mix(in srgb, var(--sc-a) 4%, transparent) 82px)',
};

/**
 * SummaryCard — thẻ KPI có vỏ màu: viên ngọc (GemIcon) bên trái; nhãn · giá trị · mô tả bên phải. Figma: 1048-3763.
 *
 * Dùng cho dải KPI đầu trang. Cần hàng gọn một dòng (nhãn trái, số phải) → `CompactKpiCard`; viên KPI
 * trong page header → `SummaryPill`; thẻ big-screen có thanh chân → `HudKpiCard`.
 * Sửa giao diện: màu vỏ thẻ → `SUMMARY_CARD_COLOR_CLASSES` · cỡ + chữ → các bảng `SUMMARY_CARD_*_SIZE_CLASSES`.
 * Lưu ý: root KHÔNG khai `border-*` — viền do `<HudCorners frame>` vẽ. Truyền SỐ THẬT + `valueFormat`,
 * đừng truyền chuỗi đã format (mất hiệu ứng đếm). Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.color - Màu vỏ thẻ + ngọc: `blue` | `green` | `yellow` | `red` | `gray`. Mặc định `blue`.
 * @param props.size - Cỡ thẻ (đệm, gap, ngọc, chữ): `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.gemSize - Ghi đè cỡ ngọc suy ra từ `size`: `xs` | `sm` | `md`.
 * @param props.icon - Icon trong ngọc, BẮT BUỘC nét đậm `*-bold`.
 * @param props.label - Nhãn phía trên giá trị (một dòng, cắt `…`).
 * @param props.value - Giá trị KPI: số (đếm lên, định dạng bằng `valueFormat`) hoặc chuỗi hiện nguyên văn.
 * @param props.description - Dòng phụ dưới giá trị (một dòng, cắt `…`).
 * @param props.animate - Đếm lên tới `value` khi là SỐ; tự tắt khi `prefers-reduced-motion`. Mặc định `true`.
 * @param props.valueFormat - Số → chuỗi hiển thị; chạy MỖI khung hình nên giữ rẻ. Mặc định `formatNumber` (vi-VN).
 * @param props.corners - Kiểu nhấn 4 góc (`HudCorners`): `bracket` | `dot` | `chamfer` | `none` (giữ khung
 *   viền, bỏ nhấn góc). Mặc định `bracket`.
 * @param props.className - Class thêm cho thẻ.
 *
 * @example
 * <SummaryCard color="green" icon="circle-check-bold" label="Hoàn thành" value={28} description="+3 hôm nay" />
 */
const SummaryCard = memo(function SummaryCard({
  color = 'blue',
  size = 'md',
  gemSize,
  icon,
  label,
  value,
  description,
  animate = true,
  valueFormat,
  corners = 'bracket',
  className,
}: SummaryCardProps) {
  const resolvedGemSize = gemSize ?? SUMMARY_CARD_GEM_SIZE[size];

  const cardClassName = cn(
    SUMMARY_CARD_BASE_CLASSES,
    SUMMARY_CARD_COLOR_CLASSES[color],
    SUMMARY_CARD_SIZE_CLASSES[size],
    className,
  );
  const contentClassName = cn(
    'relative z-10 flex min-w-0 flex-1 flex-col',
    SUMMARY_CARD_CONTENT_SIZE_CLASSES[size],
  );
  const labelClassName = cn(
    'text-fg-subheading',
    TEXT_ELLIPSIS_CLASSES,
    SUMMARY_CARD_LABEL_SIZE_CLASSES[size],
  );
  const valueClassName = cn(SUMMARY_CARD_VALUE_BASE_CLASSES, SUMMARY_CARD_VALUE_SIZE_CLASSES[size]);
  const descriptionClassName = cn(
    TEXT_ELLIPSIS_CLASSES,
    'text-fg-body tabular-nums',
    SUMMARY_CARD_DESCRIPTION_SIZE_CLASSES[size],
  );

  return (
    <div className={cardClassName} style={SUMMARY_CARD_ROOT_STYLE}>
      <HudCorners frame frameWidth={1} size={10} thickness={2} variant={corners} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={SUMMARY_CARD_STRIPE_STYLE}
      />

      <div className="relative z-10 shrink-0">
        <GemIcon color={color} size={resolvedGemSize}>
          <SystemIcon name={icon} size={SUMMARY_CARD_ICON_SIZE[size]} />
        </GemIcon>
      </div>

      <div className={contentClassName}>
        <p className={labelClassName}>{label}</p>
        <p className={valueClassName}>
          {typeof value === 'number' ? (
            <AnimatedNumber
              disabled={!animate}
              format={valueFormat ?? formatNumber}
              value={value}
            />
          ) : (
            value
          )}
        </p>
        {description && <p className={descriptionClassName}>{description}</p>}
      </div>
    </div>
  );
});

export default SummaryCard;

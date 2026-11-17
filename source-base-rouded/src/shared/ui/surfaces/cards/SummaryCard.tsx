import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import GemIcon, { type GemColor, type GemSize } from '@/shared/ui/icons/gem-icon/GemIcon';
import AnimatedNumber from '@/shared/ui/data-display/AnimatedNumber';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type { HudCornerVariant } from '../hud/HudCorners';

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

/**
 * Thẻ trắng viền `border-default` 1px + bóng nghỉ `--elev-1`, vệt tông ≤ 5% ở góc trên-trái (tông chính nằm ở ô icon);
 * thẻ không bấm được nên không nổi khi rê. Cùng một hình ở cả hai theme.
 */
const SUMMARY_CARD_BASE_CLASSES = cn(
  'relative flex w-full items-center overflow-hidden rounded-lg',
  'rim-soft border border-border-default',
  '[--sc-tint:var(--tint-card)] [--sc-tint-2:0%] [--sc-end:var(--color-bg-surface)]',
  '[--sc-rim:color-mix(in_srgb,var(--sc-a)_var(--tint-card-rim),transparent)]',
  'outline outline-1 -outline-offset-1 outline-(color:--sc-rim)',
  'shadow-(--elev-1)',
  'transition-[box-shadow,border-color] duration-150 ease-out',
);

/** Mỗi màu khai biến CSS `--sc-a` (tông nền loang góc trên-trái). */
const SUMMARY_CARD_COLOR_CLASSES = {
  blue: '[--sc-a:var(--color-sky-5)]',
  green: '[--sc-a:var(--color-green-5)]',
  yellow: '[--sc-a:var(--color-yellow-5)]',
  red: '[--sc-a:var(--color-red-5)]',
  gray: '[--sc-a:var(--color-neutral-5)]',
} satisfies Record<GemColor, string>;

/** Đệm + khe ô icon ↔ chữ: đệm đều 4 cạnh (`sm` 8 · `md` 12 · `lg` 16px). */
const SUMMARY_CARD_SIZE_CLASSES = {
  sm: 'gap-2 px-2 py-2',
  md: 'gap-2 px-3 py-3',
  lg: 'gap-3 px-4 py-4',
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

/** Điện thoại (thẻ 2 cột, bề ngang ~180px): nhãn + dòng phụ xuống tối đa 2 dòng — không cắt "…" mất số liệu. */
const SUMMARY_CARD_PHONE_WRAP_CLASSES = 'phone:whitespace-normal phone:line-clamp-2';

const SUMMARY_CARD_VALUE_BASE_CLASSES = 'text-fg-heading truncate tabular-nums';

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
    'linear-gradient(135deg, color-mix(in srgb, var(--sc-a) var(--sc-tint), var(--color-bg-surface)), color-mix(in srgb, var(--sc-a) var(--sc-tint-2), var(--sc-end)))',
};

/**
 * SummaryCard — thẻ KPI: ô icon (GemIcon) bên trái; nhãn · giá trị · mô tả bên phải. Figma: 1048-3763.
 *
 * Dùng cho dải KPI đầu trang. Cần hàng gọn một dòng (nhãn trái, số phải) → `CompactKpiCard`; viên KPI
 * trong page header → `SummaryPill`; thẻ big-screen có thanh chân → `HudKpiCard`.
 * Thẻ trắng viền trung tính ở cả hai theme, tông chỉ ở ô icon + vệt rất nhạt góc trên-trái.
 * Sửa giao diện: vỏ thẻ → `SUMMARY_CARD_BASE_CLASSES` · màu → `SUMMARY_CARD_COLOR_CLASSES` · cỡ + chữ → các
 * bảng `SUMMARY_CARD_*_SIZE_CLASSES`.
 * Lưu ý: truyền SỐ THẬT + `valueFormat`, đừng truyền chuỗi đã format (mất hiệu ứng đếm). Nhấn góc kiểu HUD
 * (`corners`) đã gỡ ở source-base-rouded. Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.color - Tông ô icon + vệt nhuộm góc thẻ: `blue` | `green` | `yellow` | `red` | `gray`. Mặc định `blue`.
 * @param props.size - Cỡ thẻ (đệm, gap, ô icon, chữ): `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.gemSize - Ghi đè cỡ ô icon suy ra từ `size`: `xs` | `sm` | `md`.
 * @param props.icon - Icon trong ô, BẮT BUỘC nét đậm `*-bold`.
 * @param props.label - Nhãn phía trên giá trị (một dòng, cắt `…`).
 * @param props.value - Giá trị KPI: số (đếm lên, định dạng bằng `valueFormat`) hoặc chuỗi hiện nguyên văn.
 * @param props.description - Dòng phụ dưới giá trị (một dòng, cắt `…`).
 * @param props.animate - Đếm lên tới `value` khi là SỐ; tự tắt khi `prefers-reduced-motion`. Mặc định `true`.
 * @param props.valueFormat - Số → chuỗi hiển thị; chạy MỖI khung hình nên giữ rẻ. Mặc định `formatNumber` (vi-VN).
 * @param props.corners - @deprecated — vô hiệu ở source-base-rouded, sẽ bị gỡ ở GĐ 2. Kiểu nhấn 4 góc kiểu HUD cũ
 *   (`HudCorners`): `bracket` | `dot` | `chamfer` | `none`.
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
    'text-fg-muted',
    TEXT_ELLIPSIS_CLASSES,
    SUMMARY_CARD_PHONE_WRAP_CLASSES,
    SUMMARY_CARD_LABEL_SIZE_CLASSES[size],
  );
  const valueClassName = cn(SUMMARY_CARD_VALUE_BASE_CLASSES, SUMMARY_CARD_VALUE_SIZE_CLASSES[size]);
  const descriptionClassName = cn(
    TEXT_ELLIPSIS_CLASSES,
    SUMMARY_CARD_PHONE_WRAP_CLASSES,
    'text-fg-muted tabular-nums',
    SUMMARY_CARD_DESCRIPTION_SIZE_CLASSES[size],
  );

  return (
    <div className={cardClassName} style={SUMMARY_CARD_ROOT_STYLE}>
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

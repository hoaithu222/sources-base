import type { ReactNode } from 'react';

import Button from '@/shared/ui/actions/Button';
import AnimatedNumber from '@/shared/ui/data-display/AnimatedNumber';
import Skeleton from '@/shared/ui/feedback/Skeleton';
import type { SystemIconName } from '@/shared/ui/icons';
import GemIcon, { type GemColor } from '@/shared/ui/icons/gem-icon/GemIcon';
import { SystemIcon, type BoldSystemIconName } from '@/shared/ui/icons/Icons';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import HudFrame from '../../hud/hud-frame/HudFrame';
import {
  HUD_KPI_CARD_ACCENT_CLASSES,
  HUD_KPI_CARD_BODY_CLASSES,
  HUD_KPI_CARD_BODY_STYLE,
  HUD_KPI_CARD_CAPTION_CLASSES,
  HUD_KPI_CARD_COMPACT_CAPTION_CLASSES,
  HUD_KPI_CARD_DETAIL_BASE_CLASSES,
  HUD_KPI_CARD_DETAIL_CLASSES,
  HUD_KPI_CARD_DETAIL_ICON_SIZES,
  HUD_KPI_CARD_GEM_CLASSES,
  HUD_KPI_CARD_GEM_ICON_SIZES,
  HUD_KPI_CARD_GEM_SIZES,
  HUD_KPI_CARD_HEAD_CLASSES,
  HUD_KPI_CARD_LABEL_CLASSES,
  HUD_KPI_CARD_LABEL_NOTE_CLASSES,
  HUD_KPI_CARD_LABEL_ROW_CLASSES,
  HUD_KPI_CARD_LABEL_ROW_DETAIL_CLASSES,
  HUD_KPI_CARD_ROOT_CLASSES,
  HUD_KPI_CARD_TEXT_CLASSES,
  HUD_KPI_CARD_UNIT_CLASSES,
  HUD_KPI_CARD_VALUE_BASE_CLASSES,
  HUD_KPI_CARD_VALUE_COLOR_CLASSES,
  HUD_KPI_CARD_VALUE_ROW_CLASSES,
  HUD_KPI_CARD_VALUE_SIZE_CLASSES,
} from './hud-kpi-card.theme';
import HudKpiCardFooter from './hud-kpi-card-footer';
import type {
  HudKpiCardBarSegment,
  HudKpiCardBarVariant,
  HudKpiCardDensity,
  HudKpiCardLegendItem,
} from './hud-kpi-card.types';

export interface HudKpiCardProps {
  color?: GemColor;
  icon: BoldSystemIconName;
  label: string;
  labelNote?: string;
  value: number | null;
  loading?: boolean;
  format?: (value: number) => string;
  unit?: string;
  valueTitle?: string;
  valueClassName?: string;
  caption?: ReactNode;
  badge?: ReactNode;
  bar?: readonly HudKpiCardBarSegment[];
  barTotal?: number;
  barVariant?: HudKpiCardBarVariant;
  legend?: readonly HudKpiCardLegendItem[];
  onDetail?: () => void;
  detailLabel?: string;
  detailIcon?: SystemIconName;
  density?: HudKpiCardDensity;
  className?: string;
}

const formatInteger = (value: number): string => formatNumber(value);

/**
 * HudKpiCard — thẻ KPI big-screen: ô icon, nhãn → SỐ LỚN → dòng phụ, chân thẻ có thanh tách phần.
 *
 * Dùng cho hàng thẻ đầu trang dashboard điều hành (`density="default"`) hoặc dải KPI một dòng (`compact`).
 * Thẻ KPI thường trong trang nghiệp vụ → `SummaryCard` / `CompactKpiCard`.
 * Thẻ trắng bo `lg` trung tính ở cả hai theme, nhãn chữ thường, số `fg-heading`; tông chỉ ở ô icon.
 * Sửa giao diện: mọi class → hud-kpi-card.theme.ts · chân thẻ → hud-kpi-card-footer.tsx.
 * Lưu ý: `value={null}` hiện "—" (không có số); đang tải thì truyền `loading`, đừng truyền `null`. Thẻ tự co
 * theo BỀ RỘNG CỦA CHÍNH NÓ (container query): < 220px ẩn ô icon, hạ cỡ số. Truyền `bar` cho mọi thẻ cùng
 * hàng để các thanh nằm trên một đường. Lý do thiết kế: notes/components/surfaces-cards.md.
 *
 * @param props.color - Tông ô icon (và vệt nhuộm 4% góc trên-trái): `blue` | `green` | `yellow` | `red` | `gray`.
 *   Mặc định `blue`.
 * @param props.icon - Icon trong ô, BẮT BUỘC nét đậm `*-bold`.
 * @param props.label - Tên chỉ số (một dòng, cắt `…`, rê chuột thấy đủ).
 * @param props.labelNote - Mốc thời gian sát sau tên, vd ngày của số dư `"01/10/2026"`.
 * @param props.value - Số chính; `null` = không có số (không quyền / lỗi) → hiện "—".
 * @param props.loading - `true` → khung chờ thay cho số và chân thẻ. Mặc định `false`.
 * @param props.format - Số → chuỗi; chạy MỖI khung hình khi số đang chạy — giữ thuần và rẻ.
 *   Mặc định `formatNumber` (vi-VN, số nguyên).
 * @param props.unit - Đơn vị sau số ("máy", "tấn"); ẩn khi `value={null}`.
 * @param props.valueTitle - Tooltip của số lớn — nơi đọc số đủ khi `format` đã làm tròn: "27.682,45 tấn".
 * @param props.valueClassName - Ghi đè màu số lớn (mặc định mực `fg-heading`), vd số chênh lệch tô theo dấu.
 * @param props.caption - Dòng phụ dưới số (một dòng, cắt `…`; chuỗi thì rê chuột thấy đủ).
 * @param props.badge - Huy hiệu cuối dòng số, vd `<TrendBadge>`.
 * @param props.bar - Các đoạn của thanh chân thẻ `{ value, color, label? }[]`; chỉ có ở `density="default"`.
 * @param props.barTotal - Tổng của thanh; lớn hơn tổng các đoạn thì phần dư là rãnh trống (thanh tiến độ).
 *   Mặc định = tổng các đoạn.
 * @param props.barVariant - Kiểu thanh: `block` (khối liền) | `cells` (dãy ô sáng). Mặc định `block`.
 * @param props.legend - Chú thích kèm số, nằm trên thanh `{ label, value, color }[]` — thường 2 mục.
 * @param props.onDetail - Có handler → hiện nút ở góc trên-phải, vd mở biểu đồ theo tháng.
 * @param props.detailLabel - Tên của nút chi tiết (tooltip + tên truy cập). Mặc định `"Xem chi tiết"`.
 * @param props.detailIcon - Icon của nút chi tiết. Mặc định `chart-simple-outline`.
 * @param props.density - `default` (có chân thẻ) | `compact` (dải một dòng, không chân thẻ). Mặc định `default`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <HudKpiCard
 *   color="green"
 *   icon="arrow-down-to-line-bold"
 *   label="Tổng nhập"
 *   value={73}
 *   unit="máy"
 *   bar={[{ value: 60, color: 'var(--color-green-5)', label: 'Công ty' }]}
 * />
 */
function HudKpiCard({
  color = 'blue',
  icon,
  label,
  labelNote,
  value,
  loading = false,
  format = formatInteger,
  unit,
  valueTitle,
  valueClassName,
  caption,
  badge,
  bar,
  barTotal,
  barVariant = 'block',
  legend,
  onDetail,
  detailLabel = 'Xem chi tiết',
  detailIcon = 'chart-simple-outline',
  density = 'default',
  className,
}: HudKpiCardProps) {
  const compact = density === 'compact';
  const gemSize = HUD_KPI_CARD_GEM_SIZES[density];
  const segmentSum = bar?.reduce((sum, segment) => sum + Math.max(0, segment.value), 0) ?? 0;
  const total = Math.max(barTotal ?? 0, segmentSum);
  const captionTitle = typeof caption === 'string' ? caption : undefined;

  const rootClassName = cn(
    HUD_KPI_CARD_ROOT_CLASSES,
    HUD_KPI_CARD_ACCENT_CLASSES[color],
    className,
  );
  const valueClass = cn(
    HUD_KPI_CARD_VALUE_BASE_CLASSES,
    HUD_KPI_CARD_VALUE_SIZE_CLASSES[density],
    valueClassName ?? HUD_KPI_CARD_VALUE_COLOR_CLASSES,
  );

  return (
    <HudFrame
      bodyClassName={HUD_KPI_CARD_BODY_CLASSES[density]}
      bodyStyle={HUD_KPI_CARD_BODY_STYLE}
      className={rootClassName}
    >
      <div className="relative flex h-full flex-col gap-2">
        {onDetail && (
          <Button
            aria-label={detailLabel}
            className={cn(HUD_KPI_CARD_DETAIL_BASE_CLASSES, HUD_KPI_CARD_DETAIL_CLASSES[density])}
            size="xs"
            skin="neutral"
            title={detailLabel}
            variant="stroke"
            onClick={onDetail}
          >
            <SystemIcon name={detailIcon} size={HUD_KPI_CARD_DETAIL_ICON_SIZES[density]} />
          </Button>
        )}

        <div className={HUD_KPI_CARD_HEAD_CLASSES[density]}>
          <GemIcon className={HUD_KPI_CARD_GEM_CLASSES[density]} color={color} size={gemSize}>
            <SystemIcon name={icon} size={HUD_KPI_CARD_GEM_ICON_SIZES[density]} />
          </GemIcon>

          <div className={HUD_KPI_CARD_TEXT_CLASSES[density]}>
            <span
              className={cn(
                HUD_KPI_CARD_LABEL_ROW_CLASSES,
                onDetail && HUD_KPI_CARD_LABEL_ROW_DETAIL_CLASSES,
              )}
            >
              <span className={HUD_KPI_CARD_LABEL_CLASSES[density]} title={label}>
                {label}
              </span>
              {labelNote && <span className={HUD_KPI_CARD_LABEL_NOTE_CLASSES}>{labelNote}</span>}
            </span>

            <span className={HUD_KPI_CARD_VALUE_ROW_CLASSES}>
              <span
                className={valueClass}
                style={compact ? { lineHeight: 1 } : undefined}
                title={valueTitle}
              >
                {loading ? (
                  <Skeleton
                    className="inline-block h-[0.8em] w-[4.5em] align-middle"
                    rounded="sm"
                  />
                ) : value === null ? (
                  '—'
                ) : (
                  <AnimatedNumber format={format} value={value} />
                )}
              </span>
              {unit && (loading || value !== null) && (
                <span className={HUD_KPI_CARD_UNIT_CLASSES}>{unit}</span>
              )}
              {!!badge && <span className="ml-auto flex shrink-0 items-baseline">{badge}</span>}
              {compact && !!caption && (
                <span className={HUD_KPI_CARD_COMPACT_CAPTION_CLASSES} title={captionTitle}>
                  {caption}
                </span>
              )}
            </span>

            {!compact && !!caption && (
              <span className={HUD_KPI_CARD_CAPTION_CLASSES} title={captionTitle}>
                {caption}
              </span>
            )}
          </div>
        </div>

        {!compact && bar && (
          <HudKpiCardFooter
            bar={bar}
            legend={legend}
            loading={loading}
            total={total}
            variant={barVariant}
          />
        )}
      </div>
    </HudFrame>
  );
}

export default HudKpiCard;

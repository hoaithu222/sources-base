import { useLocale, useTranslations } from 'next-intl';
import type { Locale } from '@/core/i18n/locales';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

export type TrendDirection = 'up' | 'down';
type TrendTone = 'good' | 'bad' | 'flat';

export interface TrendBadgeProps {
  current: number;
  previous: number;
  versus?: string;
  positive?: TrendDirection;
  className?: string;
}

const TREND_FLAT_THRESHOLD_PCT = 0.5;

/** "14,2%" · "14%" — tối đa 1 chữ số lẻ, không thêm số 0 thừa; dấu thập phân theo `locale`. */
const formatTrendPercent = (pct: number, locale: Locale) => `${formatNumber(pct, 1, 0, locale)}%`;

const TREND_BADGE_BASE_CLASSES =
  'inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-caption-12-semibold tabular-nums';

const TREND_BADGE_TONE_CLASSES = {
  good: 'text-green-7 dark:text-green-4',
  bad: 'text-red-6 dark:text-red-4',
  flat: 'text-fg-muted',
} satisfies Record<TrendTone, string>;

const TREND_ARROWS = { up: '▲', down: '▼' } satisfies Record<TrendDirection, string>;

/** % thay đổi so với `previous`; `null` khi không tính được (`previous` = 0 hoặc số không hữu hạn). */
function changePercent(current: number, previous: number): number | null {
  if (!previous) return null;
  const pct = ((current - previous) / Math.abs(previous)) * 100;
  return Number.isFinite(pct) ? pct : null;
}

/**
 * TrendBadge — huy hiệu biến động so kỳ trước: mũi tên + % ("▲ 14,2%"), màu theo chiều tốt / xấu.
 *
 * Có mũi tên thì bỏ dấu +/−; đứng yên (|%| < `TREND_FLAT_THRESHOLD_PCT` = 0,5) thì màu trung tính, giữ dấu.
 * Không tính được (`previous` = 0) → "—". Trình đọc màn hình đọc "tăng" / "giảm" (`ui.dataDisplay` → `trend`) thay mũi tên.
 * Sửa giao diện: màu → `TREND_BADGE_TONE_CLASSES` · ngưỡng đứng yên → `TREND_FLAT_THRESHOLD_PCT`.
 *
 * @param props.current - Giá trị kỳ này.
 * @param props.previous - Giá trị kỳ trước (mốc chia).
 * @param props.versus - Tên mốc so sánh, vd `'tháng 9/2026'` → tooltip "So với tháng 9/2026" (chỉ ở tooltip; khung câu ở `ui.dataDisplay` → `trend.versus`).
 * @param props.positive - Chiều nào là TỐT: `up` (tăng là tốt) | `down` (giảm là tốt: chi phí, tồn kho, lỗi).
 *   Mặc định `up`.
 * @param props.className - Class thêm cho huy hiệu.
 *
 * @example
 * <TrendBadge current={73} previous={315} versus="tháng 9/2026" />
 * <TrendBadge current={cost} previous={lastCost} positive="down" />
 */
function TrendBadge({ current, previous, versus, positive = 'up', className }: TrendBadgeProps) {
  const t = useTranslations('ui.dataDisplay');
  const locale = useLocale();
  const title = versus ? t('trend.versus', { versus }) : undefined;
  const pct = changePercent(current, previous);
  const moving = pct !== null && Math.abs(pct) >= TREND_FLAT_THRESHOLD_PCT;

  if (pct === null || !moving) {
    const text = pct === null ? '—' : `${pct > 0 ? '+' : ''}${formatTrendPercent(pct, locale)}`;
    return (
      <span
        className={cn(TREND_BADGE_BASE_CLASSES, TREND_BADGE_TONE_CLASSES.flat, className)}
        title={title}
      >
        {text}
      </span>
    );
  }

  const direction: TrendDirection = pct > 0 ? 'up' : 'down';
  const tone: TrendTone = direction === positive ? 'good' : 'bad';

  return (
    <span
      className={cn(TREND_BADGE_BASE_CLASSES, TREND_BADGE_TONE_CLASSES[tone], className)}
      title={title}
    >
      <span aria-hidden>{TREND_ARROWS[direction]}</span>
      <span className="sr-only">{t(`trend.${direction}`)}</span>
      {formatTrendPercent(Math.abs(pct), locale)}
    </span>
  );
}

export default TrendBadge;

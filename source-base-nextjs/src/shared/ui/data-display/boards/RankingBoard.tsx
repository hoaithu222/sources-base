'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { usePrefersReducedMotion } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import AnimatedNumber from '../AnimatedNumber';

export interface RankingBoardItem {
  /** Khoá ổn định — KHÔNG dùng chỉ số mảng: thứ hạng đổi thì key đổi theo. */
  id: string;
  label: string;
  value: number;
}

export type RankingBoardTone = 'sky' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';

export interface RankingBoardProps {
  items: readonly RankingBoardItem[];
  tone?: RankingBoardTone;
  highlightTop?: boolean;
  valueFormat?: (value: number) => string;
  disableAnimation?: boolean;
  className?: string;
}

const RANKING_ROW_CLASSES = 'flex items-center gap-2';

const RANKING_BADGE_BASE_CLASSES = cn(
  'flex size-5 shrink-0 items-center justify-center rounded-sm border',
  'text-caption-10-semibold tabular-nums',
);

const RANKING_BADGE_NEUTRAL_CLASSES = 'border-border-default bg-bg-subtle text-fg-muted';

const RANKING_BADGE_TONE_CLASSES = {
  sky: 'border-sky-6 bg-sky-5/15 text-sky-8 dark:border-sky-5 dark:bg-sky-5/20 dark:text-sky-4',
  teal: 'border-teal-6 bg-teal-5/15 text-teal-8 dark:border-teal-5 dark:bg-teal-5/20 dark:text-teal-4',
  green:
    'border-green-6 bg-green-5/15 text-green-8 dark:border-green-5 dark:bg-green-5/20 dark:text-green-4',
  yellow:
    'border-yellow-6 bg-yellow-5/15 text-yellow-8 dark:border-yellow-5 dark:bg-yellow-5/20 dark:text-yellow-4',
  orange:
    'border-orange-6 bg-orange-5/15 text-orange-8 dark:border-orange-5 dark:bg-orange-5/20 dark:text-orange-4',
  red: 'border-red-6 bg-red-5/15 text-red-8 dark:border-red-5 dark:bg-red-5/20 dark:text-red-4',
  purple:
    'border-purple-6 bg-purple-5/15 text-purple-8 dark:border-purple-5 dark:bg-purple-5/20 dark:text-purple-4',
} satisfies Record<RankingBoardTone, string>;

/** Rãnh viên thuốc (`rounded-lg`), cắt thanh theo góc bo. */
const RANKING_TRACK_CLASSES = 'h-1.5 w-full overflow-hidden rounded-lg bg-bg-track';

/** Màu ba hạng đầu theo thứ tự hạng 1 · 2 · 3 — cố định, KHÔNG theo `tone`. */
const RANKING_TOP_TONES: readonly RankingBoardTone[] = ['yellow', 'sky', 'orange'];

/** Khoá nội dung của `items`: thanh chỉ mọc lại từ 0 khi số liệu THẬT đổi, không phải khi mảng đổi reference. */
const itemsContentKey = (items: readonly RankingBoardItem[]) =>
  items.map((item) => `${item.id}:${item.value}`).join('|');

/**
 * RankingBoard — bảng xếp hạng: huy hiệu thứ hạng, tên, con số chạy và thanh dài theo giá trị.
 *
 * Truyền `items` ĐÃ sắp theo thứ hạng (component không tự sắp). Thanh mọc từ 0 khi dựng và mỗi khi
 * số liệu đổi.
 * Sửa giao diện: màu huy hiệu → `RANKING_BADGE_TONE_CLASSES` · rãnh → `RANKING_TRACK_CLASSES` · màu 3 hạng đầu →
 * `RANKING_TOP_TONES`.
 * Lưu ý: thanh đo theo giá trị LỚN NHẤT của bộ dữ liệu (hạng nhất luôn chạm mép), không theo 100 —
 * so với CHỈ TIÊU thì dùng `<Progress>` / `<CapsuleChart max>`. Class màu phải LITERAL
 * (component-structure.md §2.5).
 * Lý do thiết kế: docs/notes/components/data-display.md (## RankingBoard).
 *
 * @param props.items - Các hạng `{ id, label, value }` theo thứ tự hạng 1 → N; `id` ổn định (làm key).
 * @param props.tone - Màu thanh từ hạng 4 (hoặc mọi hạng khi tắt `highlightTop`): `sky` | `teal` | `green` |
 *   `yellow` | `orange` | `red` | `purple`. Mặc định `sky`.
 * @param props.highlightTop - `true` ⇒ ba hạng đầu tô vàng · lam · cam (bục trao giải). Mặc định `true`.
 * @param props.valueFormat - `(value) => string` cho con số. Mặc định `formatNumber` theo ngôn ngữ hiện tại (xem `AnimatedNumber`).
 * @param props.disableAnimation - `true` ⇒ thanh và số hiện thẳng giá trị cuối. Mặc định `false`.
 * @param props.className - Class thêm cho `<ol>`.
 *
 * @example
 * <RankingBoard items={[{ id: 'hn', label: 'Hà Nội', value: 9800 }]} tone="teal" />
 */
const RankingBoard = memo(function RankingBoard({
  items,
  tone = 'sky',
  highlightTop = true,
  valueFormat,
  disableAnimation = false,
  className,
}: RankingBoardProps) {
  const locale = useLocale();
  const formatValue = useMemo(
    () => valueFormat ?? ((n: number) => formatNumber(n, 0, 0, locale)),
    [valueFormat, locale],
  );
  const reducedMotion = usePrefersReducedMotion();
  const still = disableAnimation || reducedMotion;

  const contentKey = itemsContentKey(items);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (still) return;
    setGrown(false);
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, [contentKey, still]);

  const max = useMemo(() => {
    const peak = Math.max(0, ...items.map((i) => (Number.isFinite(i.value) ? i.value : 0)));
    return peak > 0 ? peak : 1;
  }, [items]);

  const boardClassName = cn('flex flex-col gap-1.5', className);
  const barClassName = cn(
    'relative h-full rounded-lg',
    !still && 'transition-[width] duration-[900ms] ease-out',
  );

  return (
    <ol className={boardClassName}>
      {items.map((item, i) => {
        const isTop = highlightTop && i < 3;
        const barTone = isTop ? RANKING_TOP_TONES[i] : tone;
        const pct = Math.max(0, Math.min(100, (item.value / max) * 100));
        const badgeClassName = cn(
          RANKING_BADGE_BASE_CLASSES,
          isTop ? RANKING_BADGE_TONE_CLASSES[barTone] : RANKING_BADGE_NEUTRAL_CLASSES,
        );

        return (
          <li key={item.id} className={RANKING_ROW_CLASSES}>
            <span aria-hidden="true" className={badgeClassName}>
              {i + 1}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={cn('text-caption-12 text-fg-body', TEXT_ELLIPSIS_CLASSES)}>
                  {item.label}
                </span>
                <span className="shrink-0 text-caption-12-semibold text-fg-heading">
                  <AnimatedNumber disabled={still} format={formatValue} value={item.value} />
                </span>
              </div>

              <div className={RANKING_TRACK_CLASSES}>
                <div
                  className={barClassName}
                  style={{
                    width: still || grown ? `${pct}%` : '0%',
                    background: `linear-gradient(to right, color-mix(in srgb, var(--color-${barTone}-5) 45%, transparent), var(--color-${barTone}-5))`,
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
});

export default RankingBoard;

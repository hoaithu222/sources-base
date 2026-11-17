import { memo, useEffect, useMemo, useState } from 'react';
import { usePrefersReducedMotion } from '@/shared/hooks';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';

export interface CapsuleChartItem {
  id: string;
  label: string;
  value: number;
}

export type CapsuleChartTone = 'sky' | 'teal' | 'green' | 'yellow' | 'orange' | 'red' | 'purple';

export interface CapsuleChartProps {
  items: readonly CapsuleChartItem[];
  max?: number;
  ticks?: number;
  tone?: CapsuleChartTone;
  showValue?: boolean;
  unit?: string;
  valueFormat?: (value: number) => string;
  disableAnimation?: boolean;
  className?: string;
}

/** Làm tròn LÊN mốc đẹp (1 · 2 · 5 × 10ⁿ): 1.437 → 2.000 · 34 → 50 · 6.100 → 10.000. */
function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const pow = 10 ** exp;
  const frac = value / pow;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * pow;
}

/** Khoá nội dung của `items`: thanh chỉ mọc lại từ 0 khi số liệu THẬT đổi, không phải khi mảng đổi reference. */
const itemsContentKey = (items: readonly CapsuleChartItem[]) =>
  items.map((item) => `${item.id}:${item.value}`).join('|');

/**
 * CapsuleChart — dải thanh ngang KÈM TRỤC chia độ: đọc được cả tỉ lệ lẫn con số tuyệt đối ("khoảng 3.500").
 *
 * Khác `<Progress>` (1 giá trị / 100, không trục) và `<RankingBoard>` (so các giá trị với nhau, không trục).
 * Thanh mọc từ 0 khi dựng và mỗi khi số liệu đổi; `prefers-reduced-motion` / `disableAnimation` → hiện thẳng.
 * Lưu ý: mốc trục tự làm tròn LÊN 1·2·5×10ⁿ khi bỏ trống `max`. Cột nhãn `w-24` / cột giá trị `w-16`
 * ở hàng thanh phải khớp hàng trục, đổi một bên là mốc 0 và mốc cuối lệch hai đầu thanh.
 * Lý do thiết kế: docs/notes/components/data-display.md (## CapsuleChart).
 *
 * @param props.items - Các thanh `{ id, label, value }`; `id` ổn định (làm key).
 * @param props.max - Trần của trục (đo theo CHỈ TIÊU, vd `5000`); bỏ trống ⇒ giá trị lớn nhất làm tròn
 *   lên mốc đẹp.
 * @param props.ticks - Số khoảng chia trên trục (không kể mốc 0), số nguyên ≥ 1. Mặc định `4`.
 * @param props.tone - Màu thanh: `sky` | `teal` | `green` | `yellow` | `orange` | `red` | `purple`.
 *   Mặc định `sky`.
 * @param props.showValue - `true` ⇒ in giá trị ở cột phải mỗi thanh. Mặc định `true`.
 * @param props.unit - Đơn vị in ở góc phải hàng trục, vd `'tấn'`.
 * @param props.valueFormat - `(value) => string` cho giá trị và mốc trục. Mặc định `formatNumber` (vi-VN).
 * @param props.disableAnimation - `true` ⇒ thanh hiện thẳng độ dài cuối. Mặc định `false`.
 * @param props.className - Class thêm cho khung ngoài.
 *
 * @example
 * <CapsuleChart items={[{ id: 'thep', label: 'Thép', value: 3500 }]} unit="tấn" />
 * <CapsuleChart items={items} max={5000} tone="green" />
 */
const CapsuleChart = memo(function CapsuleChart({
  items,
  max,
  ticks = 4,
  tone = 'sky',
  showValue = true,
  unit,
  valueFormat = formatNumber,
  disableAnimation = false,
  className,
}: CapsuleChartProps) {
  const reducedMotion = usePrefersReducedMotion();
  const still = disableAnimation || reducedMotion;

  const axisMax = useMemo(() => {
    if (max != null && Number.isFinite(max) && max > 0) return max;
    const peak = Math.max(0, ...items.map((i) => (Number.isFinite(i.value) ? i.value : 0)));
    return niceCeil(peak);
  }, [items, max]);

  const tickValues = useMemo(
    () => Array.from({ length: ticks + 1 }, (_, i) => (axisMax / ticks) * i),
    [axisMax, ticks],
  );

  const contentKey = itemsContentKey(items);
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    if (still) return;
    setGrown(false);
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, [contentKey, still]);

  const chartClassName = cn('flex flex-col gap-2', className);
  const barClassName = cn(
    'relative h-full rounded-full',
    !still && 'transition-[width] duration-[900ms] ease-out',
  );

  return (
    <div className={chartClassName}>
      {items.map((item) => {
        const pct = Math.max(0, Math.min(100, (item.value / axisMax) * 100));
        return (
          <div key={item.id} className="flex items-center gap-2">
            <span
              className={cn(
                'w-24 shrink-0 text-right text-caption-12 text-fg-subheading',
                TEXT_ELLIPSIS_CLASSES,
              )}
            >
              {item.label}
            </span>

            <div className="h-2.5 min-w-0 flex-1 rounded-full bg-bg-track">
              <div
                className={barClassName}
                style={{
                  width: still || grown ? `${pct}%` : '0%',
                  background: `linear-gradient(to right, color-mix(in srgb, var(--color-${tone}-5) 40%, transparent), var(--color-${tone}-5))`,
                }}
              />
            </div>

            {showValue && (
              <span className="w-16 shrink-0 text-right text-caption-12-medium tabular-nums text-fg-heading">
                {valueFormat(item.value)}
              </span>
            )}
          </div>
        );
      })}

      <div className="flex items-center gap-2">
        <span className="w-24 shrink-0" />
        <div className="flex min-w-0 flex-1 justify-between text-caption-10 tabular-nums text-fg-muted">
          {tickValues.map((t) => (
            <span key={t}>{valueFormat(t)}</span>
          ))}
        </div>
        <span className="w-16 shrink-0 text-right text-caption-10 text-fg-muted">{unit}</span>
      </div>
    </div>
  );
});

export default CapsuleChart;

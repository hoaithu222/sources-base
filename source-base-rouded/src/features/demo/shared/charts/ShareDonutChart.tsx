import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { fmt3, tokenVar, useChartMetrics } from '@/shared/charts';
import { Text } from '@/shared/ui';
import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import { toShares, type ShareSlice } from './chart-data.utils';

interface ShareDonutChartProps {
  slices: readonly ShareSlice[];
  centerCaption: string;
  unit?: string;
  ariaLabel: string;
  className?: string;
}

const HOLE_RATIO = 0.62;

/**
 * ShareDonutChart — donut cơ cấu + chú giải HTML (ô màu · tên · giá trị · %): hẹp (< 28rem, điện thoại) chú giải
 * xuống DƯỚI donut, rộng thì sang PHẢI — không có nhãn nào nằm ngoài vành nên không bị cắt ở 360px. Lát cách nhau 2px
 * màu nền; số ở tâm `tabular-nums`. Tổng là con số ở tâm; mọi giá trị đọc được không cần rê chuột (bảng chú giải).
 *
 * @param props.slices - Các lát theo thứ tự cố định; `token` do nơi gọi gán theo thực thể (lát "Khác" cuối).
 * @param props.centerCaption - Dòng phụ dưới tổng ở tâm vòng (đơn vị).
 * @param props.unit - Đơn vị cuối giá trị ở tooltip / chú giải.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài.
 *
 * @example
 * <ShareDonutChart ariaLabel="Cơ cấu chi phí" centerCaption="tỷ đồng" slices={slices} />
 */
const ShareDonutChart = memo(function ShareDonutChart({
  slices,
  centerCaption,
  unit,
  ariaLabel,
  className,
}: ShareDonutChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const { total, rows } = useMemo(() => toShares(slices), [slices]);

  return (
    <div aria-label={ariaLabel} className={cn('@container/share', className)} role="img">
      <div className="flex flex-col gap-3 @md/share:flex-row @md/share:items-center">
        <div
          ref={chartRef}
          className="relative mx-auto aspect-square w-full max-w-56 shrink-0 @md/share:w-44"
        >
          <ResponsiveContainer {...m.container}>
            <PieChart {...m.chartProps} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                cx="50%"
                cy="50%"
                data={rows}
                dataKey="value"
                innerRadius={`${HOLE_RATIO * 100}%`}
                nameKey="name"
                outerRadius="96%"
                stroke={tokenVar('bg-surface')}
                strokeWidth={2}
              >
                {rows.map((row) => (
                  <Cell key={row.key} fill={tokenVar(row.token)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={m.tooltip}
                formatter={(v) => `${fmt3(Number(v))}${unit ? ` ${unit}` : ''}`}
                itemStyle={m.tooltipItem}
                labelStyle={m.tooltipLabel}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-h3-bold text-fg-heading tabular-nums">{fmt3(total)}</span>
            <Text size="extraTiny" skin="muted">
              {centerCaption}
            </Text>
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col gap-1">
          {rows.map((row) => (
            <li key={row.key} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-2.5 shrink-0 rounded-xs"
                style={{ backgroundColor: tokenVar(row.token) }}
              />
              <Text className="min-w-0 flex-1 truncate" size="tiny">
                {row.name}
              </Text>
              <Text className="tabular-nums" size="tiny" weight="medium">
                {`${fmt3(row.value)}${unit ? ` ${unit}` : ''}`}
              </Text>
              <Text className="w-12 text-right tabular-nums" size="tiny" skin="muted">
                {formatPercent(row.percent, 1)}
              </Text>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

export default ShareDonutChart;

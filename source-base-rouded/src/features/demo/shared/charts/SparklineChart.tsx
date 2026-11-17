import { memo, useId } from 'react';
import {
  Area,
  AreaChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_CHROME, fmt3, tokenVar, useChartMetrics } from '@/shared/charts';

interface SparklineChartProps {
  values: readonly number[];
  token: string;
  unit?: string;
  ariaLabel: string;
  className?: string;
}

const AREA_TOP_OPACITY = 0.4;
/** Chừa mép trên / phải cho chấm "hiện tại" (bán kính + vành) — điểm cuối thường chạm đỉnh khung. */
const PLOT_MARGIN = { top: 6, right: 6, bottom: 2, left: 4 };
const BASELINE_DASH = '2 3';

/**
 * SparklineChart — xu hướng nhỏ cho thẻ KPI: một đường 2px + vùng tô nhạt, KHÔNG trục / lưới / legend (chart-conventions
 * §3.8). Số hiện tại do thẻ cha in cạnh — sparkline chỉ cho hình dạng; tooltip vẫn có cho người chạm vào.
 * Thêm chấm đặc ở điểm CUỐI (mốc "hiện tại") và vạch đáy đứt rất mờ — đọc được hướng đi mà không cần trục.
 *
 * @param props.values - Chuỗi giá trị theo thời gian (≥ 2 điểm mới có đường).
 * @param props.token - Token màu (series hoặc trạng thái) — đi qua `tokenVar`.
 * @param props.unit - Đơn vị cuối giá trị ở tooltip.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao (`h-12`).
 *
 * @example
 * <SparklineChart ariaLabel="Tiến độ 8 tuần" className="h-12" token="success-6" values={[3, 5, 4, 7, 9]} />
 */
const SparklineChart = memo(function SparklineChart({
  values,
  token,
  unit,
  ariaLabel,
  className,
}: SparklineChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const gradientId = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-spark`;
  const data = values.map((value, index) => ({ index, value }));
  const lastIndex = values.length - 1;
  const floor = values.length > 0 ? Math.min(...values) : 0;

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <AreaChart {...m.chartProps} data={data} margin={PLOT_MARGIN}>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={tokenVar(token)} stopOpacity={AREA_TOP_OPACITY} />
              <stop offset="100%" stopColor={tokenVar(token)} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="index" hide />
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.lineCursor}
            formatter={(v) => `${fmt3(Number(v))}${unit ? ` ${unit}` : ''}`}
            itemStyle={m.tooltipItem}
            labelFormatter={() => ''}
            labelStyle={{ display: 'none' }}
          />
          <ReferenceLine
            stroke={tokenVar(CHART_CHROME.grid)}
            strokeDasharray={BASELINE_DASH}
            y={floor}
          />
          <Area
            activeDot={m.activeDot}
            dataKey="value"
            fill={`url(#${gradientId})`}
            stroke={tokenVar(token)}
            strokeWidth={m.scale.lineWidth}
            type="monotone"
          />
          {lastIndex >= 1 ? (
            <ReferenceDot
              fill={tokenVar(token)}
              ifOverflow="visible"
              r={m.scale.dotRadius + 0.5}
              stroke={tokenVar('bg-surface')}
              strokeWidth={2}
              x={lastIndex}
              y={values[lastIndex]}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SparklineChart;

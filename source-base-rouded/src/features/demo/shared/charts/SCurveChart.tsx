import { memo, useId, useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CHART_DASH,
  CHART_SEMANTIC,
  tokenDarker,
  tokenVar,
  useChartMetrics,
  yAxisWidthFor,
} from '@/shared/charts';
import { formatPercent } from '@/shared/utils/format/format.utils';

import { sCurveAxis, type SCurvePoint } from './chart-data.utils';

interface SCurveChartProps {
  points: readonly SCurvePoint[];
  nowLabel?: string;
  ariaLabel: string;
  className?: string;
}

/** Vùng thực tế: gradient dọc token → tối hơn 1 bậc cùng hue (`chart-conventions.md §1.3`). */
const ACTUAL_ACCENT = CHART_SEMANTIC.actual;
const ACTUAL_DEEP = tokenDarker(CHART_SEMANTIC.actual);

const formatPercentValue = (value: unknown) => formatPercent(Number(value));
const formatPercentTick = (value: unknown) => `${value}%`;

/**
 * SCurveChart — đường S lũy kế Kế hoạch (nét đứt) / Thực tế (nét liền + vùng gradient cùng hue),
 * bản mẫu của `chart-conventions.md`.
 *
 * Cỡ chữ đi qua `m.*` của `useChartMetrics` (không `fontSize` số), màu từ `CHART_SEMANTIC`; chấm / con trỏ lấy
 * từ `m.dot` · `m.activeDot` · `m.lineCursor`; trục Y co theo dữ liệu bằng `sCurveAxis`. Cha phải cho khung
 * chiều cao xác định (`h-56`, `min-h-0 flex-1`…).
 * Lưu ý: thực tế `null` sau mốc "hiện tại" thì đường + vùng ngắt ở đó (`connectNulls` tắt), không rơi về 0.
 *
 * @param props.points - Các mốc theo thứ tự thời gian (`label`, `plan`, `actual`), đơn vị %.
 * @param props.nowLabel - Nhãn mốc "hiện tại" → vẽ vạch dọc gắn nhãn "Hiện tại"; bỏ trống thì không vẽ.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <SCurveChart ariaLabel="Đường S lũy kế theo tháng" className="h-56" points={points} nowLabel="T9/26" />
 */
const SCurveChart = memo(function SCurveChart({
  points,
  nowLabel,
  ariaLabel,
  className,
}: SCurveChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const axis = useMemo(() => sCurveAxis(points), [points]);
  const fillId = `${useId()}-actual`;

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <ComposedChart
          {...m.chartProps}
          data={points}
          margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={tokenVar(ACTUAL_ACCENT)} stopOpacity={0.3} />
              <stop offset="100%" stopColor={tokenVar(ACTUAL_DEEP)} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid {...m.grid} vertical={false} />
          <XAxis
            axisLine={m.axisLine}
            dataKey="label"
            minTickGap={12}
            padding={{ left: 16, right: 8 }}
            tick={m.axisTick}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={axis.domain}
            tick={m.axisTick}
            tickFormatter={formatPercentTick}
            tickLine={false}
            ticks={axis.ticks}
            width={yAxisWidthFor(4, m.scale.axis, m.scale.yAxisWidth)}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.lineCursor}
            formatter={formatPercentValue}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          <Legend
            iconSize={m.scale.legend}
            iconType="plainline"
            labelStyle={m.legendLabel}
            wrapperStyle={m.legend}
          />
          {nowLabel ? (
            <ReferenceLine
              label={{
                ...m.axisTick,
                fill: tokenVar('fg-heading'),
                value: 'Hiện tại',
                position: 'insideTopLeft',
              }}
              stroke={tokenVar(CHART_SEMANTIC.forecast)}
              strokeDasharray={CHART_DASH.forecast}
              strokeWidth={m.scale.gridWidth}
              x={nowLabel}
            />
          ) : null}
          <Area
            activeDot={m.activeDot}
            connectNulls={false}
            dataKey="actual"
            dot={m.dot}
            fill={`url(#${fillId})`}
            name="Thực tế"
            stroke={tokenVar(CHART_SEMANTIC.actual)}
            strokeWidth={m.scale.lineWidth}
            type="monotone"
          />
          <Line
            activeDot={m.activeDot}
            dataKey="plan"
            dot={false}
            name="Kế hoạch"
            stroke={tokenVar(CHART_SEMANTIC.plan)}
            strokeDasharray={CHART_DASH.plan}
            strokeWidth={m.scale.lineWidth}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export default SCurveChart;

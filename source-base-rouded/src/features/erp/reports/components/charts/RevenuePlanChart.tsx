import { memo } from 'react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CHART_DASH,
  CHART_SEMANTIC,
  axisTicks,
  fmt3,
  labelInt,
  niceAxisMax,
  tokenVar,
  tokenVarAlpha,
  useChartMetrics,
  xAxisLayout,
  yAxisWidthFor,
} from '@/shared/charts';

import type { ExecMonthBar } from '../../utils/executive.utils';

interface RevenuePlanChartProps {
  points: readonly ExecMonthBar[];
  ariaLabel: string;
  className?: string;
}

const ACTUAL_TOKEN = CHART_SEMANTIC.actual;
const PLAN_TOKEN = CHART_SEMANTIC.plan;
const OUT_OF_PERIOD_ALPHA = 0.5;
const BAR_MAX_THICKNESS = 32;
const BAR_MIN_THICKNESS = 8;
const BAR_BAND_RATIO = 0.46;
const PLOT_MARGIN = { top: 20, right: 8, left: 0, bottom: 0 };

const formatBillionTooltip = (value: unknown) => `${fmt3(Number(value)) || '0'} tỷ`;
const formatBarLabel = (value: unknown) => labelInt(Number(value));

/**
 * RevenuePlanChart — doanh thu thực hiện theo tháng (cột) so với kế hoạch (đường nét đứt) cả năm: cột của các tháng
 * thuộc kỳ đang xem tô đậm, tháng ngoài kỳ nhạt đi — đổi kỳ là thấy ngay kỳ đó nằm đâu trong năm. Nhãn số nguyên trên
 * đỉnh cột (ẩn ở khung hẹp < 420px), tooltip số lẻ + đơn vị; màu theo cặp `CHART_SEMANTIC.actual` / `plan`.
 * Lưu ý: tháng chưa tới để `actual: null` → không có cột, đường kế hoạch vẫn vẽ. Cha phải cho chiều cao.
 *
 * @param props.points - 12 tháng (`label`, `actual`, `plan`, `inPeriod`) — từ `buildMonthlyRevenue(period)`.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao (`min-h-72 flex-1`).
 *
 * @example
 * <RevenuePlanChart ariaLabel="Doanh thu theo tháng 2026" className="h-72" points={buildMonthlyRevenue('month')} />
 */
const RevenuePlanChart = memo(function RevenuePlanChart({
  points,
  ariaLabel,
  className,
}: RevenuePlanChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const dataMax = Math.max(...points.map((point) => Math.max(point.plan, point.actual ?? 0)));
  const yMax = niceAxisMax(dataMax);
  const layout = xAxisLayout({
    count: points.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: 3,
  });
  const band = points.length > 0 ? m.plotWidth / points.length : 0;
  const barSize = Math.round(
    Math.min(BAR_MAX_THICKNESS, Math.max(BAR_MIN_THICKNESS, band * BAR_BAND_RATIO)),
  );

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <ComposedChart {...m.chartProps} barSize={barSize} data={[...points]} margin={PLOT_MARGIN}>
          <CartesianGrid {...m.grid} vertical={false} />
          <XAxis
            angle={layout.angle}
            axisLine={m.axisLine}
            dataKey="label"
            height={layout.height}
            interval={layout.interval}
            textAnchor={layout.textAnchor}
            tick={m.axisTick}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            domain={[0, yMax]}
            tick={m.axisTick}
            tickLine={false}
            ticks={axisTicks(yMax)}
            width={yAxisWidthFor(3, m.scale.axis, m.scale.yAxisWidth)}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.barCursor}
            formatter={formatBillionTooltip}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          <Legend
            iconSize={m.scale.legend}
            itemSorter={null}
            labelStyle={m.legendLabel}
            wrapperStyle={m.legend}
          />
          <Bar dataKey="actual" fill={tokenVar(ACTUAL_TOKEN)} name="Thực hiện">
            {points.map((point) => (
              <Cell
                key={point.label}
                fill={
                  point.inPeriod
                    ? tokenVar(ACTUAL_TOKEN)
                    : tokenVarAlpha(ACTUAL_TOKEN, OUT_OF_PERIOD_ALPHA)
                }
              />
            ))}
            {m.narrow ? null : (
              <LabelList
                {...m.barLabel}
                dataKey="actual"
                fill={tokenVar('fg-heading')}
                formatter={formatBarLabel}
                position="top"
              />
            )}
          </Bar>
          <Line
            activeDot={m.activeDot}
            dataKey="plan"
            dot={false}
            name="Kế hoạch"
            stroke={tokenVar(PLAN_TOKEN)}
            strokeDasharray={CHART_DASH.plan}
            strokeWidth={m.scale.lineWidth}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RevenuePlanChart;

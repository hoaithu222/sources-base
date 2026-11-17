import { memo, useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  CHART_AXIS_TICK_COUNT,
  fmt3,
  niceAxisMax,
  tokenDarker,
  tokenVar,
  useChartMetrics,
  xAxisLayout,
} from '@/shared/charts';

import type { ExecCashflowWeek, ExecSeries } from '../../constants/executive-charts.constants';

interface CashflowAreaChartProps {
  weeks: readonly ExecCashflowWeek[];
  inflow: ExecSeries;
  outflow: ExecSeries;
  ariaLabel: string;
  className?: string;
}

const AREA_TOP_OPACITY = 0.16;
const AREA_BOTTOM_OPACITY = 0;
const PLOT_MARGIN = { top: 8, right: 24, left: 0, bottom: 0 };

const formatBillionTooltip = (value: unknown) => `${fmt3(Number(value)) || '0'} tỷ`;

/**
 * CashflowAreaChart — dòng tiền THU và CHI theo tuần: hai vùng chồng lên nhau (không cộng dồn), mỗi vùng gradient
 * cùng hue từ token xuống bậc tối hơn (chart-conventions §1.3, §3.6); khoảng hở giữa hai đường là dòng tiền ròng của
 * tuần. Trục X thưa theo bề rộng thật (`xAxisLayout`), tooltip số lẻ + đơn vị tỷ.
 * Lưu ý: trục Y KHÔNG bắt đầu từ 0 mà từ bậc tròn ngay dưới giá trị nhỏ nhất (vùng tô đứng trên đáy trục) để khoảng
 * hở thu – chi đọc được; cha phải cho chiều cao xác định (`h-64`).
 *
 * @param props.weeks - Các tuần theo thứ tự thời gian (`label` ngày đầu tuần, `inflow`, `outflow` — tỷ đồng).
 * @param props.inflow - Tên + token của series Thu.
 * @param props.outflow - Tên + token của series Chi.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <CashflowAreaChart ariaLabel="Dòng tiền 12 tuần" className="h-64" inflow={s.inflow} outflow={s.outflow} weeks={weeks} />
 */
const CashflowAreaChart = memo(function CashflowAreaChart({
  weeks,
  inflow,
  outflow,
  ariaLabel,
  className,
}: CashflowAreaChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const baseId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const values = weeks.flatMap((week) => [week.inflow, week.outflow]);
  const yMax = niceAxisMax(Math.max(...values));
  const tickStep = yMax / CHART_AXIS_TICK_COUNT / 2;
  const yMin = Math.max(0, Math.floor(Math.min(...values) / (tickStep * 2)) * tickStep * 2);
  const ticks = Array.from(
    { length: Math.round((yMax - yMin) / tickStep) + 1 },
    (_, i) => yMin + i * tickStep,
  );
  const layout = xAxisLayout({
    count: weeks.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: 5,
  });
  const series = [
    { key: 'inflow', id: `${baseId}-inflow`, ...inflow },
    { key: 'outflow', id: `${baseId}-outflow`, ...outflow },
  ];

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <AreaChart {...m.chartProps} data={[...weeks]} margin={PLOT_MARGIN}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.id} id={s.id} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={tokenVar(s.token)} stopOpacity={AREA_TOP_OPACITY} />
                <stop
                  offset="100%"
                  stopColor={tokenVar(tokenDarker(s.token))}
                  stopOpacity={AREA_BOTTOM_OPACITY}
                />
              </linearGradient>
            ))}
          </defs>
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
            domain={[yMin, yMax]}
            tick={m.axisTick}
            tickLine={false}
            ticks={ticks}
            width={m.scale.yAxisWidth}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.lineCursor}
            formatter={formatBillionTooltip}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          <Legend
            iconSize={m.scale.legend}
            iconType="square"
            itemSorter={null}
            labelStyle={m.legendLabel}
            wrapperStyle={m.legend}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              activeDot={m.activeDot}
              dataKey={s.key}
              dot={false}
              fill={`url(#${s.id})`}
              name={s.name}
              stroke={tokenVar(s.token)}
              strokeWidth={m.scale.lineWidth}
              type="monotone"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default CashflowAreaChart;

import { memo, useId, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  axisTicks,
  fmt3,
  niceAxisMax,
  tokenVar,
  useChartMetrics,
  xAxisLayout,
} from '@/shared/charts';

import { maxOfSeries, stackTotal, type ChartRow, type ChartSeries } from './chart-data.utils';
import TrendEndLabel from './TrendEndLabel';

interface TrendChartProps {
  rows: readonly ChartRow[];
  series: readonly ChartSeries[];
  variant?: 'line' | 'area';
  unit?: string;
  ariaLabel: string;
  className?: string;
}

/** Số series tối đa còn gắn nhãn TRỰC TIẾP ở cuối đường; quá mức đó chỉ dùng legend + tooltip. */
const DIRECT_LABEL_MAX = 4;
const AREA_TOP_OPACITY = 0.5;
const AREA_BOTTOM_OPACITY = 0.05;

/**
 * TrendChart — đường / vùng chồng nhiều series (palette 8 slot): trục X thưa theo bề rộng thật (`xAxisLayout`),
 * legend luôn có, ≤ 4 series còn có NHÃN TRỰC TIẾP ở cuối đường (chữ `fg-body`, không tô màu series) — trừ khung
 * hẹp, nhường chỗ cho legend. Tooltip ăn ngay lần chạm đầu (`m.chartProps`). Cha phải cho chiều cao xác định.
 *
 * @param props.rows - Các mốc theo thứ tự thời gian (`label` + giá trị theo `key` của series).
 * @param props.series - Series theo thứ tự cố định; `token` do nơi gọi gán theo thực thể.
 * @param props.variant - `line` (mặc định) hoặc `area` (vùng chồng, đơn vị cộng được).
 * @param props.unit - Đơn vị cuối giá trị ở tooltip (vd `tỷ`).
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <TrendChart ariaLabel="Doanh thu theo quý" className="h-56" rows={rows} series={series} unit="tỷ" />
 */
const TrendChart = memo(function TrendChart({
  rows,
  series,
  variant = 'line',
  unit,
  ariaLabel,
  className,
}: TrendChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const isArea = variant === 'area';
  const direct = !isArea && !m.narrow && series.length <= DIRECT_LABEL_MAX;
  const longestName = Math.max(...series.map((s) => s.name.length));
  const labelChars = Math.max(...rows.map((r) => r.label.length));
  const layout = xAxisLayout({
    count: rows.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars,
  });

  const yMax = useMemo(
    () =>
      niceAxisMax(
        isArea ? Math.max(...rows.map((r) => stackTotal(r, series))) : maxOfSeries(rows, series),
      ),
    [isArea, rows, series],
  );

  const formatValue = (value: unknown) => `${fmt3(Number(value)) || '0'}${unit ? ` ${unit}` : ''}`;
  const margin = {
    top: 8,
    right: direct ? Math.round(longestName * m.scale.legend * 0.6) + 14 : 12,
    left: 0,
    bottom: 0,
  };

  const frame = (
    <>
      <CartesianGrid {...m.grid} vertical={false} />
      <XAxis
        angle={layout.angle}
        axisLine={m.axisLine}
        dataKey="label"
        height={layout.height}
        interval={layout.interval}
        padding={{ left: 8, right: 8 }}
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
        width={m.scale.yAxisWidth}
      />
      <Tooltip
        contentStyle={m.tooltip}
        cursor={m.lineCursor}
        formatter={formatValue}
        itemStyle={m.tooltipItem}
        labelStyle={m.tooltipLabel}
      />
      <Legend
        iconType={isArea ? 'rect' : 'plainline'}
        itemSorter={null}
        labelStyle={m.legendLabel}
        wrapperStyle={m.legend}
      />
    </>
  );

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        {isArea ? (
          <AreaChart {...m.chartProps} data={rows} margin={margin}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`${uid}-${s.key}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={tokenVar(s.token)} stopOpacity={AREA_TOP_OPACITY} />
                  <stop
                    offset="100%"
                    stopColor={tokenVar(s.token)}
                    stopOpacity={AREA_BOTTOM_OPACITY}
                  />
                </linearGradient>
              ))}
            </defs>
            {frame}
            {series.map((s) => (
              <Area
                key={s.key}
                dataKey={s.key}
                fill={`url(#${uid}-${s.key})`}
                name={s.name}
                stackId="total"
                stroke={tokenVar(s.token)}
                strokeWidth={m.scale.lineWidth}
                type="monotone"
              />
            ))}
          </AreaChart>
        ) : (
          <LineChart {...m.chartProps} data={rows} margin={margin}>
            {frame}
            {series.map((s) => (
              <Line
                key={s.key}
                activeDot={m.activeDot}
                dataKey={s.key}
                dot={false}
                label={
                  direct ? (
                    <TrendEndLabel
                      fontSize={m.scale.legend}
                      lastIndex={rows.length - 1}
                      name={s.name}
                    />
                  ) : undefined
                }
                name={s.name}
                stroke={tokenVar(s.token)}
                strokeWidth={m.scale.lineWidth}
                type="monotone"
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});

export default TrendChart;

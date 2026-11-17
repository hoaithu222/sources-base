import { memo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  axisTicks,
  barSizeByCount,
  fmt3,
  labelInt,
  niceAxisMax,
  tokenVar,
  useChartMetrics,
  xAxisLayout,
} from '@/shared/charts';

import { maxOfSeries, stackTotal, type ChartRow, type ChartSeries } from './chart-data.utils';

interface BarCompareChartProps {
  rows: readonly ChartRow[];
  series: readonly ChartSeries[];
  stacked?: boolean;
  unit?: string;
  ariaLabel: string;
  className?: string;
}

/** Quá số cột này ở khung hẹp thì ẩn nhãn số trên đỉnh (giữ tooltip + legend) — nhãn sẽ dính nhau. */
const NARROW_LABEL_MAX_BARS = 6;
const BAR_MAX_THICKNESS = 24;
const SEGMENT_GAP = 2;
/** `barGap` mặc định của Recharts (px) — khoảng giữa hai cột cạnh nhau trong một nhóm. */
const BAR_GAP = 4;
/** Bề rộng 1 chữ số nhãn ≈ 0.6 × cỡ chữ (`tabular-nums`) + 2px hở — nhãn rộng hơn chỗ của cột thì dính nhau. */
const LABEL_CHAR_EM = 0.6;
const LABEL_GAP = 2;

/**
 * BarCompareChart — cột nhóm hoặc cột chồng nhiều series (palette 8 slot): cột mảnh ≤ 24px, khoảng hở 2px màu nền
 * giữa các đoạn chồng, nhãn số nguyên trên đỉnh (ẩn khi nhãn rộng hơn chỗ của một cột — nhãn hai cột kề nhau sẽ
 * dính, hoặc khung hẹp mà quá nhiều cột), trục X thưa theo bề rộng.
 * Cha phải cho chiều cao xác định.
 *
 * @param props.rows - Các nhóm theo thứ tự trục X (`label` + giá trị theo `key` của series).
 * @param props.series - Series theo thứ tự cố định; `token` do nơi gọi gán theo thực thể.
 * @param props.stacked - `true` → chồng (nhãn trên đỉnh là TỔNG, treo trên cột neo trong suốt); mặc định cột nhóm.
 * @param props.unit - Đơn vị cuối giá trị ở tooltip.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <BarCompareChart ariaLabel="Chi phí theo quý" className="h-56" rows={rows} series={series} stacked />
 */
const BarCompareChart = memo(function BarCompareChart({
  rows,
  series,
  stacked = false,
  unit,
  ariaLabel,
  className,
}: BarCompareChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();

  const data = rows.map((row) => ({ ...row, __total: stackTotal(row, series), __anchor: 0 }));
  const dataMax = stacked ? Math.max(...data.map((row) => row.__total)) : maxOfSeries(rows, series);
  const yMax = niceAxisMax(dataMax);
  const layout = xAxisLayout({
    count: rows.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: Math.max(...rows.map((row) => row.label.length)),
  });
  const barCount = rows.length * (stacked ? 1 : series.length);
  const barSize = Math.min(BAR_MAX_THICKNESS, barSizeByCount(rows.length, 1));
  const bandWidth = rows.length > 0 ? m.plotWidth / rows.length : 0;
  const labelSlot = stacked
    ? bandWidth
    : Math.min(series.length > 1 ? barSize + BAR_GAP : bandWidth, bandWidth / series.length);
  const labelChars = labelInt(dataMax).length;
  const labelsFit = labelSlot >= labelChars * m.scale.barLabel * LABEL_CHAR_EM + LABEL_GAP;
  const showLabels = labelsFit && !(m.narrow && barCount > NARROW_LABEL_MAX_BARS);
  const formatValue = (value: unknown) => `${fmt3(Number(value)) || '0'}${unit ? ` ${unit}` : ''}`;

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <BarChart
          {...m.chartProps}
          barSize={barSize}
          data={data}
          margin={{ top: 18, right: 8, left: 0, bottom: 0 }}
        >
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
            width={m.scale.yAxisWidth}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.barCursor}
            formatter={formatValue}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          <Legend itemSorter={null} labelStyle={m.legendLabel} wrapperStyle={m.legend} />
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={tokenVar(s.token)}
              name={s.name}
              stackId={stacked ? 'total' : undefined}
              stroke={stacked ? tokenVar('bg-surface') : undefined}
              strokeWidth={stacked ? SEGMENT_GAP / 2 : 0}
            >
              {!stacked && showLabels ? (
                <LabelList
                  {...m.barLabel}
                  dataKey={s.key}
                  fill={tokenVar('fg-heading')}
                  formatter={(v: unknown) => labelInt(Number(v))}
                  position="top"
                />
              ) : null}
            </Bar>
          ))}
          {stacked ? (
            <Bar
              dataKey="__anchor"
              fill="transparent"
              isAnimationActive={false}
              legendType="none"
              minPointSize={1}
              stackId="total"
              tooltipType="none"
            >
              {showLabels ? (
                <LabelList
                  {...m.barLabel}
                  dataKey="__total"
                  fill={tokenVar('fg-heading')}
                  formatter={(v: unknown) => labelInt(Number(v))}
                  position="top"
                />
              ) : null}
            </Bar>
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default BarCompareChart;

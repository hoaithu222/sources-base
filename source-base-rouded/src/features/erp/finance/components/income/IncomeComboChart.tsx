import { memo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  axisTicks,
  fmt3,
  labelInt,
  niceAxisMax,
  tokenVar,
  tokenVarAlpha,
  useChartMetrics,
  xAxisLayout,
} from '@/shared/charts';

import { INCOME_CHART_SERIES } from '../../constants/income-statement.constants';
import { formatBillion } from '../../utils/finance-format.utils';
import type { IncomeChartRow } from '../../utils/income-statement.utils';
import ProfitPointLabel from './ProfitPointLabel';

interface IncomeComboChartProps {
  rows: readonly IncomeChartRow[];
  highlight?: readonly [string, string];
  ariaLabel: string;
  className?: string;
}

const BAR_MAX = 22;
const BAR_MIN = 6;
const BAR_SHARE_OF_BAND = 0.3;
/** Bề rộng 1 chữ số nhãn ≈ 0.6 × cỡ chữ; nhãn rộng hơn khoảng giữa hai nhóm cột thì ẩn. */
const LABEL_CHAR_EM = 0.6;
const HIGHLIGHT_ALPHA = 0.07;

const formatTooltip = (value: unknown, name: unknown) => [
  `${fmt3(Number(value)) || '0'} tỷ`,
  String(name),
];
const formatLabel = (value: unknown) => formatBillion(Number(value));
const formatTick = (value: unknown) => labelInt(Number(value)) || '0';

/**
 * IncomeComboChart — 12 tháng: cột Tổng doanh thu · Tổng chi phí cạnh nhau, đường LN trước thuế cùng MỘT trục (tỷ đồng
 * — LN thấp hơn hẳn doanh thu là đúng tỉ lệ thật, không dựng trục thứ hai). Nhãn số trên cột doanh thu và trên điểm
 * lợi nhuận (viên nền trắng), ẩn khi nhãn rộng hơn chỗ của một nhóm cột; tooltip đủ 3 số lẻ. `highlight` tô nền các
 * tháng thuộc kỳ đang xem. Cha phải cho chiều cao xác định.
 *
 * @param props.rows - 12 tháng theo thời gian (`incomeChartRows`), giá trị tỷ đồng.
 * @param props.highlight - Tháng đầu / cuối của kỳ đang xem (nhãn trục X), vd `['T7/26', 'T9/26']`.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <IncomeComboChart ariaLabel="Doanh thu, chi phí, lợi nhuận 12 tháng" className="h-full" rows={incomeChartRows()} />
 */
const IncomeComboChart = memo(function IncomeComboChart({
  rows,
  highlight,
  ariaLabel,
  className,
}: IncomeComboChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();

  const yMax = niceAxisMax(Math.max(0, ...rows.map((row) => Math.max(row.revenue, row.cost))));
  const band = rows.length > 0 ? m.plotWidth / rows.length : 0;
  const barSize = Math.max(BAR_MIN, Math.min(BAR_MAX, Math.round(band * BAR_SHARE_OF_BAND)));
  const labelChars = Math.max(0, ...rows.map((row) => formatBillion(row.revenue).length));
  const labelsFit = band >= labelChars * m.scale.barLabel * LABEL_CHAR_EM + 8;
  const layout = xAxisLayout({
    count: rows.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: 6,
  });
  const { revenue, cost, profit } = INCOME_CHART_SERIES;

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <ComposedChart
          {...m.chartProps}
          barGap={4}
          barSize={barSize}
          data={[...rows]}
          margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid {...m.grid} vertical={false} />
          {highlight ? (
            <ReferenceArea
              fill={tokenVarAlpha('primary-5', HIGHLIGHT_ALPHA)}
              ifOverflow="extendDomain"
              x1={highlight[0]}
              x2={highlight[1]}
            />
          ) : null}
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
            tickFormatter={formatTick}
            tickLine={false}
            ticks={axisTicks(yMax)}
            width={m.scale.yAxisWidth}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.barCursor}
            formatter={formatTooltip}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          <Legend itemSorter={null} labelStyle={m.legendLabel} wrapperStyle={m.legend} />
          <Bar
            dataKey="revenue"
            fill={tokenVar(revenue.token)}
            legendType="square"
            name={revenue.name}
          >
            {labelsFit ? (
              <LabelList
                {...m.barLabel}
                dataKey="revenue"
                fill={tokenVar('fg-heading')}
                formatter={formatLabel}
                position="top"
              />
            ) : null}
          </Bar>
          <Bar dataKey="cost" fill={tokenVar(cost.token)} legendType="square" name={cost.name} />
          <Line
            activeDot={m.activeDot}
            dataKey="profit"
            dot={{ ...m.dot, stroke: tokenVar(profit.token), strokeWidth: m.scale.lineWidth }}
            label={
              labelsFit ? (
                <ProfitPointLabel fontSize={m.scale.axis} token={profit.token} />
              ) : undefined
            }
            legendType="plainline"
            name={profit.name}
            stroke={tokenVar(profit.token)}
            strokeWidth={m.scale.lineWidth}
            type="monotone"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

export default IncomeComboChart;

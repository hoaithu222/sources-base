import { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { axisTicks, fmt3, niceAxisMax, tokenVar, useChartMetrics } from '@/shared/charts';

import { AGING_BUCKETS } from '../../constants/receivables.constants';
import { formatBillion } from '../../utils/finance-format.utils';
import type { AgingChartRow } from '../../utils/receivables.utils';

interface AgingPartnerChartProps {
  rows: readonly AgingChartRow[];
  ariaLabel: string;
  className?: string;
}

/** Bề rộng 1 ký tự nhãn tên đối tác ≈ 0.62 × cỡ chữ; trục tên không chiếm quá 45% khung. */
const NAME_CHAR_EM = 0.62;
const NAME_AXIS_MAX_SHARE = 0.45;
const TOTAL_LABEL_SPACE = 44;
/** Cột chiếm ~55% chiều cao một hàng, kẹp 8–18px. */
const BAR_SHARE_OF_ROW = 0.55;
const BAR_MIN = 8;
const BAR_MAX = 18;
const X_AXIS_SPACE = 28;
const TICK_GAP = 6;

const formatTooltip = (value: unknown, name: unknown) => [
  `${fmt3(Number(value)) || '0'} tỷ`,
  String(name),
];
const formatTotal = (value: unknown) => formatBillion(Number(value));

interface NameTickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value?: string | number };
}

/** Nhãn tên đối tác trên trục Y — MỘT dòng, không để Recharts tự bẻ dòng khi tên dài hơn ước lượng. */
const nameTick =
  (style: { fill: string; fontSize: number; fontWeight: number }) =>
  ({ x, y, payload }: NameTickProps) => (
    <text
      dominantBaseline="central"
      fill={style.fill}
      fontSize={style.fontSize}
      fontWeight={style.fontWeight}
      textAnchor="end"
      x={Number(x) - TICK_GAP}
      y={Number(y)}
    >
      {payload?.value}
    </text>
  );

/**
 * AgingPartnerChart — cột ngang chồng theo nhóm tuổi nợ cho các đối tác dư nợ lớn nhất: mỗi đối tác một hàng, đoạn
 * màu nóng dần theo tuổi nợ (0–30 → > 90 ngày), tổng dư nợ (tỷ) treo cuối thanh trên cột neo trong suốt; cột dày theo
 * chiều cao khung. Tooltip từng đoạn có 3 số lẻ. Cha phải cho chiều cao xác định.
 * Lưu ý: không tự vẽ chú giải — đặt cạnh `AgingBucketSummary` (cùng màu, kiêm chú giải).
 *
 * @param props.rows - Đối tác theo thứ tự hiển thị (trên → dưới), giá trị từng nhóm tính bằng tỷ đồng.
 * @param props.ariaLabel - Văn bản thay thế cho trình đọc màn hình (khung mang `role="img"`).
 * @param props.className - Class của khung ngoài, thường là chiều cao.
 *
 * @example
 * <AgingPartnerChart ariaLabel="Tuổi nợ 8 khách hàng lớn nhất" className="h-full" rows={rows} />
 */
const AgingPartnerChart = memo(function AgingPartnerChart({
  rows,
  ariaLabel,
  className,
}: AgingPartnerChartProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();

  const data = useMemo(
    () => rows.map((row) => ({ ...row, __total: row.b0 + row.b1 + row.b2 + row.b3, __anchor: 0 })),
    [rows],
  );
  const rowHeight = rows.length > 0 ? (m.height - X_AXIS_SPACE) / rows.length : 0;
  const barSize = Math.max(BAR_MIN, Math.min(BAR_MAX, Math.round(rowHeight * BAR_SHARE_OF_ROW)));
  const xMax = niceAxisMax(Math.max(0, ...data.map((row) => row.__total)));
  const longest = Math.max(0, ...rows.map((row) => row.label.length));
  const nameWidth = Math.min(
    Math.round(m.width * NAME_AXIS_MAX_SHARE),
    Math.ceil(longest * m.scale.axis * NAME_CHAR_EM) + TICK_GAP * 2,
  );

  return (
    <div ref={chartRef} aria-label={ariaLabel} className={className} role="img">
      <ResponsiveContainer {...m.container}>
        <BarChart
          {...m.chartProps}
          barSize={barSize}
          data={data}
          layout="vertical"
          margin={{ top: 4, right: TOTAL_LABEL_SPACE, left: 0, bottom: 0 }}
        >
          <CartesianGrid {...m.grid} horizontal={false} />
          <XAxis
            axisLine={false}
            domain={[0, xMax]}
            tick={m.axisTick}
            tickFormatter={formatTotal}
            tickLine={false}
            ticks={axisTicks(xMax)}
            type="number"
          />
          <YAxis
            axisLine={m.axisLine}
            dataKey="label"
            interval={0}
            tick={nameTick(m.axisTick)}
            tickLine={false}
            type="category"
            width={nameWidth}
          />
          <Tooltip
            contentStyle={m.tooltip}
            cursor={m.barCursor}
            formatter={formatTooltip}
            itemStyle={m.tooltipItem}
            labelStyle={m.tooltipLabel}
          />
          {AGING_BUCKETS.map((bucket) => (
            <Bar
              key={bucket.key}
              dataKey={bucket.key}
              fill={tokenVar(bucket.token)}
              name={bucket.label}
              stackId="aging"
              stroke={tokenVar('bg-surface')}
              strokeWidth={1}
            />
          ))}
          <Bar
            dataKey="__anchor"
            fill="transparent"
            isAnimationActive={false}
            legendType="none"
            minPointSize={1}
            stackId="aging"
            tooltipType="none"
          >
            <LabelList
              {...m.barLabel}
              dataKey="__total"
              fill={tokenVar('fg-heading')}
              formatter={formatTotal}
              position="right"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default AgingPartnerChart;

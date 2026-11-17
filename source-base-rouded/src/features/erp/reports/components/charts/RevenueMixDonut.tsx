import { memo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { fmt3, tokenVar, useChartMetrics } from '@/shared/charts';
import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import { formatBillion, type ExecMixSlice } from '../../utils/executive.utils';

interface RevenueMixDonutProps {
  slices: readonly ExecMixSlice[];
  total: number;
  ariaLabel: string;
  className?: string;
}

const PIE_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };

const REVENUE_MIX_CLASSES = {
  root: '@container/mix flex flex-col items-center justify-center gap-4 @md/mix:flex-row',
  ring: 'relative aspect-square w-full max-w-44 shrink-0 @md/mix:w-40',
  center: 'pointer-events-none absolute inset-0 flex flex-col items-center justify-center',
  total: 'text-h3-bold text-fg-heading tabular-nums',
  caption: 'text-caption-12 text-fg-muted',
  legend: 'flex w-full min-w-0 flex-1 flex-col',
  row: 'flex items-center gap-2 border-b border-border-default py-1.5 last:border-b-0',
  swatch: 'size-2.5 shrink-0 rounded-xs',
  name: 'min-w-0 flex-1 truncate text-body-14 text-fg-body',
  value: 'text-body-14-semibold text-fg-heading tabular-nums',
  percent: 'w-14 text-right text-caption-12 text-fg-muted tabular-nums',
} satisfies Record<string, string>;

const formatBillionTooltip = (value: unknown) => `${fmt3(Number(value)) || '0'} tỷ`;

/**
 * RevenueMixDonut — cơ cấu doanh thu theo mảng: donut (lát cách nhau 2px màu nền, tổng ở tâm) + chú giải HTML (ô màu
 * · tên mảng · tỷ đồng · %). Khung < 28rem chú giải xuống DƯỚI donut, rộng hơn thì sang PHẢI — không nhãn nào nằm
 * ngoài vành nên không bị cắt ở điện thoại; mọi giá trị đọc được không cần rê chuột.
 *
 * @param props.slices - Các lát theo thứ tự cố định (`buildRevenueMix(period).slices`), `token` gán theo mảng.
 * @param props.total - Tổng doanh thu của kỳ (tỷ) — in ở tâm vòng.
 * @param props.ariaLabel - Văn bản thay thế của vòng donut (khung vòng mang `role="img"`).
 * @param props.className - Class thêm cho khối ngoài.
 *
 * @example
 * <RevenueMixDonut ariaLabel="Cơ cấu doanh thu tháng 10" slices={mix.slices} total={mix.total} />
 */
const RevenueMixDonut = memo(function RevenueMixDonut({
  slices,
  total,
  ariaLabel,
  className,
}: RevenueMixDonutProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();

  return (
    <div className={cn(REVENUE_MIX_CLASSES.root, className)}>
      <div ref={chartRef} aria-label={ariaLabel} className={REVENUE_MIX_CLASSES.ring} role="img">
        <ResponsiveContainer {...m.container}>
          <PieChart {...m.chartProps} margin={PIE_MARGIN}>
            <Pie
              cx="50%"
              cy="50%"
              data={[...slices]}
              dataKey="value"
              innerRadius="66%"
              nameKey="name"
              outerRadius="96%"
              stroke={tokenVar('bg-surface')}
              strokeWidth={2}
            >
              {slices.map((slice) => (
                <Cell key={slice.key} fill={tokenVar(slice.token)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={m.tooltip}
              formatter={formatBillionTooltip}
              itemStyle={m.tooltipItem}
              labelStyle={m.tooltipLabel}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={REVENUE_MIX_CLASSES.center}>
          <span className={REVENUE_MIX_CLASSES.total}>{formatBillion(total)}</span>
          <span className={REVENUE_MIX_CLASSES.caption}>tỷ đồng</span>
        </div>
      </div>

      <ul aria-label="Chú giải cơ cấu doanh thu" className={REVENUE_MIX_CLASSES.legend}>
        {slices.map((slice) => (
          <li key={slice.key} className={REVENUE_MIX_CLASSES.row}>
            <span
              aria-hidden
              className={REVENUE_MIX_CLASSES.swatch}
              style={{ backgroundColor: tokenVar(slice.token) }}
            />
            <span className={REVENUE_MIX_CLASSES.name}>{slice.name}</span>
            <span className={REVENUE_MIX_CLASSES.value}>{formatBillion(slice.value)}</span>
            <span className={REVENUE_MIX_CLASSES.percent}>{formatPercent(slice.percent)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default RevenueMixDonut;

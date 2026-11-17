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
import { Badge, BoxPanel } from '@/shared/ui';
import { formatPercent } from '@/shared/utils/format/format.utils';

import { OUTPUT_SERIES_TOKENS } from '../../constants/production.constants';
import type { OutputRow } from '../../utils/production.utils';
import { PRODUCTION_LAYOUT_CLASSES } from './production.theme';

interface ProductionOutputPanelProps {
  rows: readonly OutputRow[];
}

const BAR_MAX = 22;
const BAR_GAP = 3;
const BAR_SHARE = 0.3;
const LABEL_CHAR_EM = 0.6;
const PLAN_OPACITY = 0.32;
const MARGIN = { top: 18, right: 8, left: 0, bottom: 0 };
const ON_PLAN_PCT = 95;

const formatTon = (value: unknown) => `${fmt3(Number(value)) || '0'} t`;

/**
 * ProductionOutputPanel — panel "Sản lượng theo ngày": mỗi ngày một cặp cột kế hoạch (lam nhạt) + thực tế (xanh) trong
 * 14 ngày gần nhất; số nguyên trên đỉnh cột thực tế (ẩn khi cột quá hẹp), tooltip số lẻ + đơn vị tấn. Header ghi % đạt
 * kế hoạch của cả kỳ. Ngày nghỉ không có cột kế hoạch.
 *
 * @param props.rows - Chuỗi 14 ngày của xưởng đang lọc (`buildOutputRows`).
 *
 * @example
 * <ProductionOutputPanel rows={rows} />
 */
const ProductionOutputPanel = memo(function ProductionOutputPanel({
  rows,
}: ProductionOutputPanelProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();

  const data = [...rows];
  const totalPlan = rows.reduce((sum, row) => sum + (row.plan ?? 0), 0);
  const totalActual = rows.reduce((sum, row) => sum + row.actual, 0);
  const reachPct = totalPlan > 0 ? (totalActual / totalPlan) * 100 : 0;
  const yMax = niceAxisMax(Math.max(...rows.map((row) => Math.max(row.plan ?? 0, row.actual))));
  const layout = xAxisLayout({
    count: rows.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: 5,
  });
  const bandWidth = rows.length > 0 ? m.plotWidth / rows.length : 0;
  const barSize = Math.max(
    barSizeByCount(rows.length, 1),
    Math.min(BAR_MAX, Math.round(bandWidth * BAR_SHARE)),
  );
  const labelSlot = Math.min(barSize + BAR_GAP, bandWidth / 2);
  const showLabels = labelSlot >= labelInt(yMax).length * m.scale.barLabel * LABEL_CHAR_EM + 2;
  const ariaLabel = `Sản lượng 14 ngày: thực tế ${fmt3(totalActual)} tấn so với kế hoạch ${fmt3(totalPlan)} tấn, đạt ${formatPercent(reachPct, 1)}.`;

  return (
    <BoxPanel
      bodyClassName="p-2"
      bodyOverflow="hidden"
      border="hairline"
      className={PRODUCTION_LAYOUT_CLASSES.chart}
      headerDivider
      headerRight={
        <Badge color={reachPct >= ON_PLAN_PCT ? 'success' : 'warning'} size="sm">
          {`Đạt ${formatPercent(reachPct, 1)} kế hoạch`}
        </Badge>
      }
      title={<h2 className={PRODUCTION_LAYOUT_CLASSES.title}>Sản lượng theo ngày (t)</h2>}
    >
      <div ref={chartRef} aria-label={ariaLabel} className="min-h-0 flex-1" role="img">
        <ResponsiveContainer {...m.container}>
          <BarChart
            {...m.chartProps}
            barGap={BAR_GAP}
            barSize={barSize}
            data={data}
            margin={MARGIN}
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
              formatter={(value, name) => [formatTon(value), String(name)]}
              itemStyle={m.tooltipItem}
              labelFormatter={(label, payload) =>
                `${(payload?.[0]?.payload as OutputRow | undefined)?.weekday ?? ''} ${String(label)}`
              }
              labelStyle={m.tooltipLabel}
            />
            <Legend
              iconSize={m.scale.legend}
              itemSorter={null}
              labelStyle={m.legendLabel}
              wrapperStyle={m.legend}
            />
            <Bar
              dataKey="plan"
              fill={tokenVar(OUTPUT_SERIES_TOKENS.plan)}
              fillOpacity={PLAN_OPACITY}
              name="Kế hoạch"
            />
            <Bar dataKey="actual" fill={tokenVar(OUTPUT_SERIES_TOKENS.actual)} name="Thực tế">
              {showLabels ? (
                <LabelList
                  {...m.barLabel}
                  dataKey="actual"
                  fill={tokenVar('fg-heading')}
                  formatter={(v: unknown) => labelInt(Number(v))}
                  position="top"
                />
              ) : null}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </BoxPanel>
  );
});

export default ProductionOutputPanel;

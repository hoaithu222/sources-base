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

import {
  axisTicks,
  barSizeByCount,
  fmt3,
  labelInt,
  niceAxisMax,
  seriesTokenAt,
  tokenVar,
  useChartMetrics,
  xAxisLayout,
  yAxisWidthFor,
} from '@/shared/charts';
import { Text } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import { PURCHASE_MONTHLY } from '../../constants/purchase-orders.constants';
import { SUPPLY_SLOT_CLASSES } from '../../supply.theme';
import SupplyPanel from '../SupplyPanel';

const BAR_TOKEN = seriesTokenAt(0);
const YEAR_TOTAL = PURCHASE_MONTHLY.reduce((acc, point) => acc + point.value, 0);
const ARIA_LABEL = `Giá trị đặt mua theo tháng năm 2026, tỷ đồng: ${PURCHASE_MONTHLY.map(
  (point) => `${point.label} ${formatNumber(point.value, 1)}`,
).join('; ')}.`;

/**
 * PurchaseMonthlyPanel — khối "Giá trị đặt mua theo tháng" (2026, tỷ đồng): cột một màu, nhãn số nguyên trên đỉnh,
 * tooltip số lẻ; header in tổng luỹ kế năm. Tháng 10 tính tới ngày dữ liệu (`PURCHASE_TODAY`).
 */
const PurchaseMonthlyPanel = memo(function PurchaseMonthlyPanel() {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const data = useMemo(() => [...PURCHASE_MONTHLY], []);
  const yMax = niceAxisMax(Math.max(...data.map((point) => point.value)));
  const layout = xAxisLayout({
    count: data.length,
    plotWidth: m.plotWidth,
    fontSize: m.scale.axis,
    labelChars: 3,
  });

  return (
    <SupplyPanel
      bodyClassName="p-2"
      className={SUPPLY_SLOT_CLASSES.side}
      headerRight={
        <Text className="tabular-nums" size="tiny" skin="muted">
          {`Luỹ kế ${formatNumber(YEAR_TOTAL, 1)} tỷ`}
        </Text>
      }
      note="tỷ đ"
      title="Đặt mua theo tháng"
    >
      <div ref={chartRef} aria-label={ARIA_LABEL} className="min-h-0 flex-1" role="img">
        <ResponsiveContainer {...m.container}>
          <BarChart
            {...m.chartProps}
            barSize={barSizeByCount(data.length, m.uiScale) + 6}
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
              width={yAxisWidthFor(2, m.scale.axis, m.scale.yAxisWidth)}
            />
            <Tooltip
              contentStyle={m.tooltip}
              cursor={m.barCursor}
              formatter={(v) => [`${fmt3(Number(v)) || '0'} tỷ đ`, 'Đặt mua']}
              itemStyle={m.tooltipItem}
              labelStyle={m.tooltipLabel}
            />
            <Bar dataKey="value" fill={tokenVar(BAR_TOKEN)} name="Đặt mua">
              <LabelList
                {...m.barLabel}
                dataKey="value"
                fill={tokenVar('fg-heading')}
                formatter={(v: unknown) => labelInt(Number(v))}
                position="top"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SupplyPanel>
  );
});

export default PurchaseMonthlyPanel;

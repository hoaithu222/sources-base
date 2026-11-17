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
  fmt3,
  labelInt,
  niceAxisMax,
  seriesTokenAt,
  tokenVar,
  useChartMetrics,
} from '@/shared/charts';
import { formatNumber } from '@/shared/utils/format/format.utils';

import { SUPPLY_SLOT_CLASSES } from '../../supply.theme';
import type { PurchaseOrderRow } from '../../types/supply.types';
import { topSuppliers } from '../../utils/purchase.utils';
import SupplyPanel from '../SupplyPanel';

interface PurchaseSupplierPanelProps {
  rows: readonly PurchaseOrderRow[];
}

const BAR_TOKEN = seriesTokenAt(0);
const BAR_SIZE = 18;
/** Bề rộng 1 ký tự nhãn trục danh mục ≈ 0.68 × cỡ chữ (dư để Recharts không ngắt dòng); cộng lề tick. */
const CATEGORY_CHAR_EM = 0.68;
const CATEGORY_PADDING = 16;
/** Chừa bên phải cho nhãn số ở đầu thanh ("5.925"). */
const LABEL_ROOM = 44;
/** Bề rộng ngắt dòng của nhãn danh mục — rộng hơn mọi tên ngắn để Recharts không bẻ "Thép Tân / Cường". */
const CATEGORY_NO_WRAP = 240;

const formatAxis = (value: number) => formatNumber(value);

/**
 * PurchaseSupplierPanel — khối "Top 5 nhà cung cấp": thanh ngang một màu (một series → slot 1) theo giá trị đơn ĐÃ CAM
 * KẾT (đã duyệt → hoàn tất), đơn vị triệu đồng, nhãn số nguyên ở đầu thanh. Mọi giá trị đọc
 * được không cần rê chuột; tooltip bổ sung số lẻ.
 *
 * @param props.rows - Toàn bộ đơn mua (đã ghép tên NCC).
 */
const PurchaseSupplierPanel = memo(function PurchaseSupplierPanel({
  rows,
}: PurchaseSupplierPanelProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const data = useMemo(() => topSuppliers(rows, 5), [rows]);
  const xMax = niceAxisMax(Math.max(0, ...data.map((d) => d.value)));
  const labelChars = Math.max(0, ...data.map((d) => d.name.length));
  const categoryWidth = Math.max(
    m.scale.yAxisWidth,
    Math.ceil(labelChars * m.scale.axis * CATEGORY_CHAR_EM) + CATEGORY_PADDING,
  );
  const ariaLabel = `Top 5 nhà cung cấp theo giá trị đơn, triệu đồng: ${data
    .map((d) => `${d.name} ${formatNumber(d.value)}`)
    .join('; ')}.`;

  return (
    <SupplyPanel
      bodyClassName="p-2"
      className={SUPPLY_SLOT_CLASSES.side}
      note="triệu đồng"
      title="Top 5 nhà cung cấp"
    >
      <div ref={chartRef} aria-label={ariaLabel} className="min-h-0 flex-1" role="img">
        <ResponsiveContainer {...m.container}>
          <BarChart
            {...m.chartProps}
            barSize={BAR_SIZE}
            data={data}
            layout="vertical"
            margin={{ top: 4, right: LABEL_ROOM, left: 0, bottom: 0 }}
          >
            <CartesianGrid {...m.grid} horizontal={false} />
            <XAxis
              axisLine={false}
              domain={[0, xMax]}
              tick={m.axisTick}
              tickFormatter={formatAxis}
              tickLine={false}
              ticks={axisTicks(xMax)}
              type="number"
            />
            <YAxis
              axisLine={m.axisLine}
              dataKey="name"
              interval={0}
              tick={{ ...m.axisTick, width: CATEGORY_NO_WRAP }}
              tickLine={false}
              type="category"
              width={categoryWidth}
            />
            <Tooltip
              contentStyle={m.tooltip}
              cursor={m.barCursor}
              formatter={(v) => [`${fmt3(Number(v)) || '0'} triệu đ`, 'Giá trị đơn']}
              itemStyle={m.tooltipItem}
              labelStyle={m.tooltipLabel}
            />
            <Bar dataKey="value" fill={tokenVar(BAR_TOKEN)} name="Giá trị đơn">
              <LabelList
                {...m.barLabel}
                dataKey="value"
                fill={tokenVar('fg-heading')}
                formatter={(v: unknown) => labelInt(Number(v))}
                position="right"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SupplyPanel>
  );
});

export default PurchaseSupplierPanel;

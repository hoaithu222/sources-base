import { memo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { tokenVar, useChartMetrics } from '@/shared/charts';
import { Text } from '@/shared/ui';
import { formatPercent } from '@/shared/utils/format/format.utils';

import { SUPPLY_SLOT_CLASSES } from '../../supply.theme';
import type { StockGroupSlice } from '../../types/supply.types';
import { formatMoneyShort } from '../../utils/supply-format.utils';
import SupplyPanel from '../SupplyPanel';

interface StockGroupPanelProps {
  slices: readonly StockGroupSlice[];
  total: number;
}

const STOCK_DONUT_CLASSES = {
  layout: 'flex min-h-0 flex-1 items-center gap-3',
  ring: 'relative size-28 shrink-0',
  center: 'pointer-events-none absolute inset-0 flex flex-col items-center justify-center',
  total: 'text-body-16-bold tabular-nums text-fg-heading',
  legend: 'flex min-w-0 flex-1 flex-col gap-0.5',
  row: 'flex min-w-0 items-start gap-2',
  swatch: 'mt-1 size-2.5 shrink-0 rounded-xs',
  text: 'flex min-w-0 flex-col',
  value: 'tabular-nums text-fg-heading',
} satisfies Record<string, string>;

/**
 * StockGroupPanel — khối "Cơ cấu tồn theo nhóm": donut giá trị tồn theo nhóm vật tư (màu gán theo NHÓM, đổi kho không
 * tô lại) với tổng ở tâm, chú giải HTML bên cạnh (ô màu · tên / giá trị · %, hai dòng) — mọi số đọc được không cần rê
 * chuột. Donut và chú giải đứng NGANG để khối thấp (1366×768) vẫn đủ chỗ, không cắt dòng nào.
 *
 * @param props.slices - Lát theo thứ tự cố định của `STOCK_GROUPS` (`stockByGroup`).
 * @param props.total - Tổng giá trị tồn (đồng) — số ở tâm donut.
 */
const StockGroupPanel = memo(function StockGroupPanel({ slices, total }: StockGroupPanelProps) {
  const [chartRef, m] = useChartMetrics<HTMLDivElement>();
  const ariaLabel = `Cơ cấu giá trị tồn theo nhóm vật tư: ${slices
    .map(
      (slice) =>
        `${slice.name} ${formatMoneyShort(slice.value)} (${formatPercent(slice.percent, 1)})`,
    )
    .join('; ')}.`;

  return (
    <SupplyPanel
      bodyClassName="p-2"
      className={SUPPLY_SLOT_CLASSES.sideAuto}
      title="Cơ cấu tồn theo nhóm"
    >
      <div aria-label={ariaLabel} className={STOCK_DONUT_CLASSES.layout} role="img">
        <div ref={chartRef} className={STOCK_DONUT_CLASSES.ring}>
          <ResponsiveContainer {...m.container}>
            <PieChart {...m.chartProps} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                cx="50%"
                cy="50%"
                data={[...slices]}
                dataKey="value"
                innerRadius="64%"
                isAnimationActive={false}
                nameKey="name"
                outerRadius="96%"
                paddingAngle={1}
                stroke={tokenVar('bg-surface')}
                strokeWidth={1}
              >
                {slices.map((slice) => (
                  <Cell key={slice.key} fill={tokenVar(slice.token)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={m.tooltip}
                formatter={(v) => formatMoneyShort(Number(v))}
                itemStyle={m.tooltipItem}
                labelStyle={m.tooltipLabel}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className={STOCK_DONUT_CLASSES.center}>
            <span className={STOCK_DONUT_CLASSES.total}>{formatMoneyShort(total)}</span>
            <Text size="extraTiny" skin="muted">
              Tổng tồn
            </Text>
          </div>
        </div>

        <ul className={STOCK_DONUT_CLASSES.legend}>
          {slices.map((slice) => (
            <li key={slice.key} className={STOCK_DONUT_CLASSES.row}>
              <span
                aria-hidden="true"
                className={STOCK_DONUT_CLASSES.swatch}
                style={{ backgroundColor: tokenVar(slice.token) }}
              />
              <div className={STOCK_DONUT_CLASSES.text}>
                <Text className="truncate" size="tiny">
                  {slice.name}
                </Text>
                <Text className="tabular-nums" size="tiny" skin="muted">
                  <span className={STOCK_DONUT_CLASSES.value}>{formatMoneyShort(slice.value)}</span>
                  {` · ${formatPercent(slice.percent, 1)}`}
                </Text>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SupplyPanel>
  );
});

export default StockGroupPanel;

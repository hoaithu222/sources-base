import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import type { ProductionSummary } from '../../utils/production.utils';
import { PRODUCTION_LAYOUT_CLASSES } from './production.theme';

interface ProductionKpiStripProps {
  summary: ProductionSummary;
}

const formatOrders = (n: number) => `${formatNumber(n)} lệnh`;
const formatPct = (n: number) => formatPercent(n, 1);

/**
 * ProductionKpiStrip — bốn thẻ KPI đầu màn "Tiến độ sản xuất": lệnh đang chạy · hoàn thành đúng hạn · OEE · lệnh trễ,
 * tính cho xưởng đang lọc. Dòng phụ ngắn, số đứng đầu để thẻ hẹp bị cắt `…` vẫn còn con số.
 *
 * @param props.summary - Số KPI đã tính (`summarizeProduction`).
 *
 * @example
 * <ProductionKpiStrip summary={summary} />
 */
const ProductionKpiStrip = memo(function ProductionKpiStrip({ summary }: ProductionKpiStripProps) {
  const { availability, performance, quality } = summary.oeeParts;

  return (
    <section aria-label="Chỉ số sản xuất" className={PRODUCTION_LAYOUT_CLASSES.kpis}>
      <SummaryCard
        color="blue"
        description={`${formatNumber(summary.remainingTons, 1)} t khối lượng còn lại`}
        gemSize="xs"
        icon="gear-bold"
        label="Lệnh đang chạy"
        value={summary.running}
        valueFormat={formatOrders}
      />
      <SummaryCard
        color="green"
        description={`${summary.doneOnTime}/${summary.doneTotal} lệnh xong trong 30 ngày`}
        gemSize="xs"
        icon="circle-check-bold"
        label="Hoàn thành đúng hạn"
        value={summary.onTimePct}
        valueFormat={formatPct}
      />
      <SummaryCard
        color={summary.oeeOnTarget ? 'green' : 'yellow'}
        description={`A ${formatPercent(availability, 0)} · P ${formatPercent(performance, 0)} · Q ${formatPercent(quality, 0)}`}
        gemSize="xs"
        icon="bolt-bold"
        label="OEE"
        value={summary.oee}
        valueFormat={formatPct}
      />
      <SummaryCard
        color={summary.late > 0 ? 'red' : 'gray'}
        description={summary.late > 0 ? 'Thấp hơn kế hoạch quá 5 điểm %' : 'Không có lệnh chậm'}
        gemSize="xs"
        icon="triangle-exclamation-bold"
        label="Lệnh trễ"
        value={summary.late}
        valueFormat={formatOrders}
      />
    </section>
  );
});

export default ProductionKpiStrip;

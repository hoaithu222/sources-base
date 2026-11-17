import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import { SUPPLY_KPI_STRIP_CLASSES } from '../../supply.theme';
import type { StockSummary } from '../../types/supply.types';
import { formatMoneyShort } from '../../utils/supply-format.utils';

interface StockKpiStripProps {
  summary: StockSummary;
}

const formatItems = (n: number) => `${formatNumber(n)} mã`;
const formatLots = (n: number) => `${formatNumber(n)} lô`;

/**
 * StockKpiStrip — dải bốn thẻ KPI của màn "Tồn kho": giá trị tồn · số mã hàng · dưới tồn tối thiểu · sắp hết hạn
 * (≤ 30 ngày). Tính trên các lô của KHO ĐANG CHỌN (đổi kho → đổi thẻ; từ khoá / công tắc cảnh báo không đổi thẻ).
 *
 * @param props.summary - Chỉ số đã tính (`summarizeStock`).
 */
const StockKpiStrip = memo(function StockKpiStrip({ summary }: StockKpiStripProps) {
  const expiringNote =
    summary.expiredLots > 0 ? `${summary.expiredLots} lô đã quá hạn` : 'Không có lô quá hạn';

  return (
    <section aria-label="Chỉ số tồn kho" className={SUPPLY_KPI_STRIP_CLASSES}>
      <SummaryCard
        color="green"
        description={`${summary.lotCount} lô · ${summary.warehouseCount} kho`}
        gemSize="xs"
        icon="wallet-bold"
        label="Giá trị tồn"
        value={summary.value}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="blue"
        description={`Thuộc ${summary.groupCount} nhóm vật tư`}
        gemSize="xs"
        icon="boxes-stacked-bold"
        label="Số mã hàng"
        value={summary.itemCount}
        valueFormat={formatItems}
      />
      <SummaryCard
        color="red"
        description={`${formatMoneyShort(summary.shortageValue)} cần đặt bổ sung`}
        gemSize="xs"
        icon="triangle-exclamation-bold"
        label="Dưới tồn tối thiểu"
        value={summary.belowMinItems}
        valueFormat={formatItems}
      />
      <SummaryCard
        color="yellow"
        description={expiringNote}
        gemSize="xs"
        icon="calendar-clock-bold"
        label="Sắp hết hạn ≤ 30 ngày"
        value={summary.expiringLots}
        valueFormat={formatLots}
      />
    </section>
  );
});

export default StockKpiStrip;

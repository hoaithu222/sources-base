import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { SUPPLY_KPI_STRIP_CLASSES } from '../../supply.theme';
import type { PurchaseSummary } from '../../types/supply.types';
import { formatMoneyShort } from '../../utils/supply-format.utils';

interface PurchaseKpiStripProps {
  summary: PurchaseSummary;
}

const formatOrders = (n: number) => `${formatNumber(n)} đơn`;
const formatRate = (n: number) => formatPercent(n, 1);

/**
 * PurchaseKpiStrip — dải bốn thẻ KPI của màn "Đơn mua": đơn đang mở · giá trị đơn mở · trễ hạn giao · tỉ lệ giao đúng
 * hạn. Tính trên TOÀN BỘ đơn (bộ lọc của bảng không đổi thẻ). Dòng phụ viết ngắn, SỐ ĐỨNG ĐẦU để bị cắt `…` vẫn còn số.
 *
 * @param props.summary - Chỉ số đã tính (`summarizePurchases`).
 */
const PurchaseKpiStrip = memo(function PurchaseKpiStrip({ summary }: PurchaseKpiStripProps) {
  return (
    <section aria-label="Chỉ số đơn mua" className={SUPPLY_KPI_STRIP_CLASSES}>
      <SummaryCard
        color="blue"
        description={`${summary.pendingCount} chờ duyệt · ${summary.deliveringCount} đang giao`}
        gemSize="xs"
        icon="file-lines-bold"
        label="Đơn đang mở"
        value={summary.openCount}
        valueFormat={formatOrders}
      />
      <SummaryCard
        color="yellow"
        description={`${formatMoneyShort(summary.remainingValue)} còn phải nhận`}
        gemSize="xs"
        icon="wallet-bold"
        label="Giá trị đơn mở"
        value={summary.openValue}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="red"
        description={`${formatMoneyShort(summary.lateValue)} hàng chưa về`}
        gemSize="xs"
        icon="clock-bold"
        label="Trễ hạn giao"
        value={summary.lateCount}
        valueFormat={formatOrders}
      />
      <SummaryCard
        color="green"
        description={`${summary.onTimeCount}/${summary.doneCount} đơn hoàn tất đúng hạn`}
        gemSize="xs"
        icon="truck-bold"
        label="Tỉ lệ giao đúng hạn"
        value={summary.onTimeRate}
        valueFormat={formatRate}
      />
    </section>
  );
});

export default PurchaseKpiStrip;

import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { DEBT_MODE_COPY, type DebtMode } from '../../constants/receivables.constants';
import { FINANCE_KPI_STRIP_CLASSES } from '../../finance.theme';
import { formatMoneyShort } from '../../utils/finance-format.utils';
import type { DebtSummary } from '../../utils/receivables.utils';

interface DebtKpiStripProps {
  mode: DebtMode;
  summary: DebtSummary;
}

const formatDays = (value: number) => `${formatNumber(value)} ngày`;
const formatCount = (value: number) => `${formatNumber(value)} đối tác`;

/**
 * DebtKpiStrip — bốn thẻ đầu màn Công nợ theo chế độ đang chọn: tổng dư nợ · quá hạn (kèm tỉ trọng) · DSO / DPO (so
 * mục tiêu) · số đối tác vượt hạn mức (kèm phần vượt). Tính trên TOÀN BỘ đối tác, không theo ô tìm của bảng.
 *
 * @param props.mode - `receivable` (phải thu) | `payable` (phải trả) — đổi nhãn thẻ.
 * @param props.summary - KPI đã cộng (`summarizeDebt`).
 *
 * @example
 * <DebtKpiStrip mode="receivable" summary={summarizeDebt(rows, 'receivable')} />
 */
const DebtKpiStrip = memo(function DebtKpiStrip({ mode, summary }: DebtKpiStripProps) {
  const copy = DEBT_MODE_COPY[mode];
  const daysGap = summary.days - copy.daysTarget;

  return (
    <section
      aria-label={`Chỉ số ${copy.total.toLowerCase()}`}
      className={FINANCE_KPI_STRIP_CLASSES}
    >
      <SummaryCard
        color="blue"
        description={`${summary.partnerCount} ${copy.partnerPlural} còn dư nợ`}
        gemSize="xs"
        icon="wallet-bold"
        label={copy.total}
        value={summary.total}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="red"
        description={`${formatPercent(summary.overduePct)} tổng dư nợ`}
        gemSize="xs"
        icon="clock-bold"
        label={copy.overdue}
        value={summary.overdue}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="yellow"
        description={`Mục tiêu ≤ ${copy.daysTarget} ngày (${daysGap > 0 ? '+' : '−'}${Math.abs(daysGap)})`}
        gemSize="xs"
        icon="calendar-clock-bold"
        label={`${copy.days} · ${copy.daysHint.toLowerCase()}`}
        value={summary.days}
        valueFormat={formatDays}
      />
      <SummaryCard
        color="gray"
        description={`Vượt tổng ${formatMoneyShort(summary.overLimitAmount)}`}
        gemSize="xs"
        icon="triangle-exclamation-bold"
        label={copy.overLimit}
        value={summary.overLimitCount}
        valueFormat={formatCount}
      />
    </section>
  );
});

export default DebtKpiStrip;

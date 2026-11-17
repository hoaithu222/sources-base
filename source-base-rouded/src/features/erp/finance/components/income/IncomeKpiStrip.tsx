import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { FINANCE_KPI_STRIP_CLASSES } from '../../finance.theme';
import { formatChange, formatMoneyShort } from '../../utils/finance-format.utils';
import { changePercent, type StatementValues } from '../../utils/income-statement.utils';

interface IncomeKpiStripProps {
  current: StatementValues;
  previous: StatementValues;
  versus: string;
}

const marginOf = (values: StatementValues, code: '20' | '60') =>
  values['10'] ? (values[code] / values['10']) * 100 : 0;

/**
 * IncomeKpiStrip — bốn thẻ đầu màn Kết quả kinh doanh cho kỳ đang xem: doanh thu thuần · lợi nhuận gộp · biên lợi
 * nhuận gộp · lợi nhuận sau thuế; dòng phụ so với kỳ so sánh (▲ / ▼ %, chênh điểm % của biên, biên ròng).
 *
 * @param props.current - Giá trị B02-DN của kỳ này (`statementValues`).
 * @param props.previous - Giá trị B02-DN của kỳ so sánh.
 * @param props.versus - Nhãn kỳ so sánh, vd "T8/2026".
 *
 * @example
 * <IncomeKpiStrip current={current} previous={previous} versus="T8/2026" />
 */
const IncomeKpiStrip = memo(function IncomeKpiStrip({
  current,
  previous,
  versus,
}: IncomeKpiStripProps) {
  const grossMargin = marginOf(current, '20');
  const marginGap = grossMargin - marginOf(previous, '20');
  const vs = (code: '10' | '20' | '60') =>
    `${formatChange(changePercent(current[code], previous[code]))} so với ${versus}`;

  return (
    <section aria-label="Chỉ số kết quả kinh doanh" className={FINANCE_KPI_STRIP_CLASSES}>
      <SummaryCard
        color="blue"
        description={vs('10')}
        gemSize="xs"
        icon="chart-line-bold"
        label="Doanh thu thuần"
        value={current['10']}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="green"
        description={vs('20')}
        gemSize="xs"
        icon="chart-simple-bold"
        label="Lợi nhuận gộp"
        value={current['20']}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="yellow"
        description={`${marginGap >= 0 ? '+' : '−'}${formatNumber(Math.abs(marginGap), 1)} điểm so với ${versus}`}
        gemSize="xs"
        icon="chart-mixed-bold"
        label="Biên lợi nhuận gộp"
        value={grossMargin}
        valueFormat={formatPercent}
      />
      <SummaryCard
        color="gray"
        description={`Biên ròng ${formatPercent(marginOf(current, '60'))} · ${formatChange(changePercent(current['60'], previous['60']))}`}
        gemSize="xs"
        icon="wallet-bold"
        label="Lợi nhuận sau thuế"
        value={current['60']}
        valueFormat={formatMoneyShort}
      />
    </section>
  );
});

export default IncomeKpiStrip;

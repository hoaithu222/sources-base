import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';

import { LEDGER_OPEN_PERIOD } from '../../constants/ledger.constants';
import { FINANCE_KPI_STRIP_CLASSES } from '../../finance.theme';
import { formatChange, formatMoneyShort } from '../../utils/finance-format.utils';
import type { LedgerBook } from '../../utils/ledger.utils';

interface LedgerKpiStripProps {
  book: LedgerBook;
}

function closingNoteOf(book: LedgerBook): string {
  if (book.isOpen) return `Tạm tính đến ${LEDGER_OPEN_PERIOD.lastDay}/${book.period}`;
  if (book.account.kind === 'pnl') return 'Đã kết chuyển sang TK 911';
  const change = book.opening ? ((book.closing - book.opening) / book.opening) * 100 : null;
  return `${formatChange(change)} so với đầu kỳ`;
}

/**
 * LedgerKpiStrip — bốn thẻ đầu màn Sổ cái cho CẢ kỳ (không theo ô tìm): dư đầu kỳ · phát sinh Nợ · phát sinh Có ·
 * dư cuối kỳ. Dòng phụ mang số không có ở bảng: ngày mốc, số bút toán mỗi bên, biến động so với đầu kỳ.
 *
 * @param props.book - Sổ cái của tài khoản × kỳ đang xem (`buildLedgerBook`).
 *
 * @example
 * <LedgerKpiStrip book={buildLedgerBook('112', 10)} />
 */
const LedgerKpiStrip = memo(function LedgerKpiStrip({ book }: LedgerKpiStripProps) {
  const debitCount = book.entries.filter((entry) => entry.debit > 0).length;
  const creditCount = book.entries.length - debitCount;
  const side = book.account.nature === 'debit' ? 'Nợ' : 'Có';

  return (
    <section
      aria-label="Tổng hợp số dư và phát sinh trong kỳ"
      className={FINANCE_KPI_STRIP_CLASSES}
    >
      <SummaryCard
        color="gray"
        description={`Dư ${side} ngày ${book.openingDate}`}
        gemSize="xs"
        icon="wallet-bold"
        label="Số dư đầu kỳ"
        value={book.opening}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="green"
        description={`${debitCount} bút toán ghi Nợ`}
        gemSize="xs"
        icon="arrow-down-to-line-bold"
        label="Phát sinh Nợ"
        value={book.totalDebit}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="yellow"
        description={`${creditCount} bút toán ghi Có`}
        gemSize="xs"
        icon="arrow-up-to-line-bold"
        label="Phát sinh Có"
        value={book.totalCredit}
        valueFormat={formatMoneyShort}
      />
      <SummaryCard
        color="blue"
        description={closingNoteOf(book)}
        gemSize="xs"
        icon="sigma-bold"
        label="Số dư cuối kỳ"
        value={book.closing}
        valueFormat={formatMoneyShort}
      />
    </section>
  );
});

export default LedgerKpiStrip;

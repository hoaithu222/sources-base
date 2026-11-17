import { memo, useCallback, useMemo } from 'react';

import { Table, Text } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';

import { FINANCE_NUM_CLASSES, FINANCE_ROW_CLASSES } from '../../finance.theme';
import { formatAmount } from '../../utils/finance-format.utils';
import type { LedgerBook, LedgerEntry } from '../../utils/ledger.utils';

interface LedgerRow extends LedgerEntry {
  opening?: boolean;
}

interface LedgerTableProps {
  book: LedgerBook;
  entries: LedgerEntry[];
}

const TABLE_MIN_WIDTH = 1080;

const rowKey = (row: LedgerRow) => row.id;
const rowClassName = (row: LedgerRow) => (row.opening ? FINANCE_ROW_CLASSES.opening : undefined);

const amountCell = (value: number) => (
  <span className={FINANCE_NUM_CLASSES.base}>{formatAmount(value)}</span>
);

const COLUMNS: TableColumn<LedgerRow>[] = [
  {
    key: 'date',
    header: 'Ngày',
    width: 104,
    frozen: true,
    cell: (row) => <span className="tabular-nums">{row.date}</span>,
  },
  {
    key: 'voucher',
    header: 'Số CT',
    width: 108,
    frozen: true,
    cell: (row) => <span className="tabular-nums text-fg-subheading">{row.voucher}</span>,
  },
  {
    key: 'description',
    header: 'Diễn giải',
    cell: (row) => (
      <span className="block truncate" title={row.description}>
        {row.description}
      </span>
    ),
  },
  {
    key: 'contra',
    header: 'TK đối ứng',
    width: 104,
    align: 'center',
    cell: (row) => <span className="tabular-nums text-fg-subheading">{row.contra}</span>,
  },
  { key: 'debit', header: 'Nợ', width: 152, align: 'right', cell: (row) => amountCell(row.debit) },
  {
    key: 'credit',
    header: 'Có',
    width: 152,
    align: 'right',
    cell: (row) => amountCell(row.credit),
  },
  {
    key: 'balance',
    header: 'Số dư lũy kế',
    width: 164,
    align: 'right',
    cell: (row) => (
      <span className={FINANCE_NUM_CLASSES.strong}>{formatAmount(row.balance, '0')}</span>
    ),
  },
];

/**
 * LedgerTable — bảng bút toán của Sổ cái: dòng "Số dư đầu kỳ" nền chìm ở đầu, mỗi bút toán có số dư lũy kế (tính trên
 * CẢ kỳ, không đổi khi lọc), dòng tổng dính đáy: số bút toán đang hiện · cộng Nợ / Có của chúng · dư cuối kỳ. Ngày +
 * số CT ghim khi cuộn ngang (điện thoại); giữa dòng tổng để trống cho Dock nổi.
 * Lưu ý: cha phải là flex column có chiều cao (`BoxPanel bodyOverflow="hidden"`) — bảng `fill` phần còn lại.
 *
 * @param props.book - Sổ cái của tài khoản × kỳ (số dư đầu / cuối kỳ).
 * @param props.entries - Bút toán cần hiện (đã lọc theo từ khoá), giữ thứ tự ngày.
 *
 * @example
 * <LedgerTable book={book} entries={filterLedgerEntries(book.entries, keyword)} />
 */
const LedgerTable = memo(function LedgerTable({ book, entries }: LedgerTableProps) {
  const rows = useMemo<LedgerRow[]>(
    () => [
      {
        id: `${book.account.code}-${book.period}-opening`,
        opening: true,
        date: book.openingDate,
        voucher: '',
        description: 'Số dư đầu kỳ',
        contra: '',
        debit: 0,
        credit: 0,
        balance: book.opening,
      },
      ...entries,
    ],
    [book, entries],
  );

  const footerCell = useCallback(
    (column: TableColumn<LedgerRow>) => {
      switch (column.key) {
        case 'date':
          return (
            <Text size="small" weight="medium">
              Cộng
            </Text>
          );
        case 'voucher':
          return <span className={FINANCE_NUM_CLASSES.muted}>{`${entries.length} CT`}</span>;
        case 'debit':
          return amountCell(entries.reduce((sum, entry) => sum + entry.debit, 0));
        case 'credit':
          return amountCell(entries.reduce((sum, entry) => sum + entry.credit, 0));
        case 'balance':
          return (
            <span className="flex flex-col items-end leading-tight">
              <span className="text-caption-12 text-fg-muted">Dư cuối kỳ</span>
              <span className={FINANCE_NUM_CLASSES.strong}>{formatAmount(book.closing, '0')}</span>
            </span>
          );
        default:
          return null;
      }
    },
    [book.closing, entries],
  );

  return (
    <Table
      columns={COLUMNS}
      data={rows}
      fill
      footerCell={footerCell}
      minWidth={TABLE_MIN_WIDTH}
      pagination={false}
      rowClassName={rowClassName}
      rowKey={rowKey}
    />
  );
});

export default LedgerTable;

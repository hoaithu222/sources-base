import { memo, useMemo } from 'react';

import { Table, TrendBadge } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';

import {
  STATEMENT_LINES,
  type StatementLine,
  type StatementTone,
} from '../../constants/income-statement.constants';
import { FINANCE_NUM_CLASSES, FINANCE_ROW_CLASSES } from '../../finance.theme';
import { formatAmount } from '../../utils/finance-format.utils';
import type { StatementPeriod, StatementValues } from '../../utils/income-statement.utils';

interface IncomeStatementTableProps {
  current: StatementValues;
  previous: StatementValues;
  currentPeriod: StatementPeriod;
  previousPeriod: StatementPeriod;
}

const TABLE_MIN_WIDTH = 680;
const ROW_HEIGHT = 36;
const STATEMENT_ROWS = [...STATEMENT_LINES];

const ROW_TONE_CLASSES = {
  key: FINANCE_ROW_CLASSES.key,
  total: FINANCE_ROW_CLASSES.total,
  normal: '',
  sub: FINANCE_ROW_CLASSES.sub,
} satisfies Record<StatementTone, string>;

const rowKey = (row: StatementLine) => row.code;
const rowClassName = (row: StatementLine) => ROW_TONE_CLASSES[row.tone] || undefined;

const periodHeader = (title: string, period: StatementPeriod) => (
  <span className="flex flex-col items-end leading-tight">
    <span>{title}</span>
    <span className="text-caption-12 text-fg-muted">{period.label}</span>
  </span>
);

/**
 * IncomeStatementTable — Báo cáo kết quả hoạt động kinh doanh theo Mẫu B02-DN: chỉ tiêu (dòng "Trong đó" thụt vào, rê
 * chuột thấy công thức của dòng tổng) · mã số · kỳ này · kỳ so sánh · % thay đổi (▲ / ▼, màu theo chiều TỐT: chi phí
 * tăng là đỏ). Dòng tổng nền chìm, dòng lợi nhuận sau thuế nền nhấn; số đủ đồng, âm trong ngoặc.
 * Lưu ý: cha là flex column có chiều cao thì bảng `fill` và cuộn bên trong, không thì cao theo nội dung.
 *
 * @param props.current - Giá trị kỳ này theo mã số (`statementValues`).
 * @param props.previous - Giá trị kỳ so sánh theo mã số.
 * @param props.currentPeriod - Kỳ này (nhãn hiện dưới tiêu đề cột).
 * @param props.previousPeriod - Kỳ so sánh (nhãn hiện dưới tiêu đề cột).
 *
 * @example
 * <IncomeStatementTable current={cur} currentPeriod={periods.current} previous={prev} previousPeriod={periods.previous} />
 */
const IncomeStatementTable = memo(function IncomeStatementTable({
  current,
  previous,
  currentPeriod,
  previousPeriod,
}: IncomeStatementTableProps) {
  const columns = useMemo<TableColumn<StatementLine>[]>(
    () => [
      {
        key: 'label',
        header: 'Chỉ tiêu',
        cell: (row) => (
          <span
            className={row.tone === 'sub' ? 'block truncate pl-4' : 'block truncate'}
            title={row.formula ? `${row.label} (${row.formula})` : row.label}
          >
            {row.label}
          </span>
        ),
      },
      {
        key: 'code',
        header: 'Mã số',
        width: 64,
        align: 'center',
        cell: (row) => <span className="tabular-nums">{row.code}</span>,
      },
      {
        key: 'current',
        header: periodHeader('Kỳ này', currentPeriod),
        width: 136,
        align: 'right',
        cell: (row) => (
          <span className={FINANCE_NUM_CLASSES.base}>{formatAmount(current[row.code], '0')}</span>
        ),
      },
      {
        key: 'previous',
        header: periodHeader('Kỳ so sánh', previousPeriod),
        width: 136,
        align: 'right',
        cell: (row) => (
          <span className={FINANCE_NUM_CLASSES.muted}>{formatAmount(previous[row.code], '0')}</span>
        ),
      },
      {
        key: 'change',
        header: '% thay đổi',
        width: 96,
        align: 'right',
        cell: (row) => (
          <TrendBadge
            current={current[row.code]}
            positive={row.cost ? 'down' : 'up'}
            previous={previous[row.code]}
            versus={previousPeriod.label}
          />
        ),
      },
    ],
    [current, currentPeriod, previous, previousPeriod],
  );

  return (
    <Table
      columns={columns}
      data={STATEMENT_ROWS}
      fill
      headerSize="sm"
      minWidth={TABLE_MIN_WIDTH}
      pagination={false}
      rowClassName={rowClassName}
      rowHeight={ROW_HEIGHT}
      rowKey={rowKey}
    />
  );
});

export default IncomeStatementTable;

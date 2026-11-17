import { memo, useCallback, useMemo } from 'react';

import { Badge, Progress, Table, Text, useTableSort } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { DEBT_STATUS_META } from '../../constants/receivables.constants';
import { FINANCE_CELL_STACK_CLASSES, FINANCE_NUM_CLASSES } from '../../finance.theme';
import { formatAmount, partnerShortName } from '../../utils/finance-format.utils';
import { debtSortValue, type DebtPartnerRow } from '../../utils/receivables.utils';

interface DebtPartnerTableProps {
  rows: DebtPartnerRow[];
  partnerHeader: string;
}

const TABLE_MIN_WIDTH = 860;
const AGE_CRITICAL_DAYS = 90;

const rowKey = (row: DebtPartnerRow) => row.id;

const AGE_HEADER = (
  <span className="flex flex-col items-end leading-tight">
    <span>Tuổi nợ</span>
    <span className="text-caption-12 text-fg-muted">lớn nhất</span>
  </span>
);

const usageVariant = (usage: number) => {
  if (usage > 100) return 'error';
  if (usage >= 85) return 'warning';
  return 'primary';
};

const sumOf = (rows: readonly DebtPartnerRow[], pick: (row: DebtPartnerRow) => number) =>
  rows.reduce((sum, row) => sum + pick(row), 0);

/**
 * DebtPartnerTable — bảng công nợ theo đối tác: tên + mã + số ngày được nợ · dư nợ · hạn mức (thanh % sử dụng) · quá
 * hạn · tuổi nợ lớn nhất (đỏ khi > 90 ngày) · trạng thái. Bấm tiêu đề cột để sắp (tăng → giảm → bỏ); dòng tổng dính
 * đáy cộng các dòng đang hiện. Tên đối tác ghim khi cuộn ngang.
 *
 * @param props.rows - Đối tác cần hiện (đã lọc).
 * @param props.partnerHeader - Tiêu đề cột đối tác ("Khách hàng" / "Nhà cung cấp").
 *
 * @example
 * <DebtPartnerTable partnerHeader="Khách hàng" rows={rows} />
 */
const DebtPartnerTable = memo(function DebtPartnerTable({
  rows,
  partnerHeader,
}: DebtPartnerTableProps) {
  const { sortKey, sortDir, onSortChange, sorted } = useTableSort(rows, debtSortValue);

  const columns = useMemo<TableColumn<DebtPartnerRow>[]>(
    () => [
      {
        key: 'partner',
        header: partnerHeader,
        frozen: true,
        sortable: true,
        cell: (row) => (
          <div className={FINANCE_CELL_STACK_CLASSES.root}>
            <span className={FINANCE_CELL_STACK_CLASSES.main} title={row.name}>
              {partnerShortName(row.name)}
            </span>
            <span className={FINANCE_CELL_STACK_CLASSES.sub}>
              {`${row.code} · hạn TT ${row.termDays} ngày`}
            </span>
          </div>
        ),
      },
      {
        key: 'balance',
        header: 'Dư nợ',
        width: 144,
        align: 'right',
        sortable: true,
        cell: (row) => (
          <span className={FINANCE_NUM_CLASSES.strong}>{formatAmount(row.balance, '0')}</span>
        ),
      },
      {
        key: 'limit',
        header: 'Hạn mức',
        width: 160,
        align: 'right',
        sortable: true,
        cell: (row) => (
          <div className="flex flex-col items-end gap-1">
            <span className={FINANCE_NUM_CLASSES.base}>{formatAmount(row.limit)}</span>
            <div className="flex w-full items-center gap-2">
              <Progress
                className="flex-1"
                label={`Đã dùng ${formatPercent(row.usage, 0)} hạn mức`}
                size="xs"
                value={Math.min(row.usage, 100)}
                variant={usageVariant(row.usage)}
              />
              <span className="w-10 text-right tabular-nums text-caption-12 text-fg-muted">
                {formatPercent(row.usage, 0)}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: 'overdue',
        header: 'Quá hạn',
        width: 144,
        align: 'right',
        sortable: true,
        cell: (row) => (
          <span className={row.overdue > 0 ? FINANCE_NUM_CLASSES.base : FINANCE_NUM_CLASSES.muted}>
            {formatAmount(row.overdue, '—')}
          </span>
        ),
      },
      {
        key: 'maxAge',
        header: AGE_HEADER,
        width: 104,
        align: 'right',
        sortable: true,
        cell: (row) => (
          <span
            className={
              row.maxAge > AGE_CRITICAL_DAYS
                ? FINANCE_NUM_CLASSES.negative
                : FINANCE_NUM_CLASSES.base
            }
          >
            {`${formatNumber(row.maxAge)} ngày`}
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: 120,
        sortable: true,
        cell: (row) => (
          <Badge color={DEBT_STATUS_META[row.status].color} shape="tag" variant="tinted">
            {DEBT_STATUS_META[row.status].label}
          </Badge>
        ),
      },
    ],
    [partnerHeader],
  );

  const footerCell = useCallback(
    (column: TableColumn<DebtPartnerRow>) => {
      switch (column.key) {
        case 'partner':
          return (
            <Text size="small" weight="medium">
              {`Cộng ${rows.length} đối tác`}
            </Text>
          );
        case 'balance':
          return formatAmount(
            sumOf(rows, (row) => row.balance),
            '0',
          );
        case 'limit':
          return formatAmount(
            sumOf(rows, (row) => row.limit),
            '0',
          );
        case 'overdue':
          return formatAmount(
            sumOf(rows, (row) => row.overdue),
            '0',
          );
        default:
          return null;
      }
    },
    [rows],
  );

  return (
    <Table
      columns={columns}
      data={sorted}
      fill
      footerCell={footerCell}
      minWidth={TABLE_MIN_WIDTH}
      pagination={false}
      rowKey={rowKey}
      sortDir={sortDir}
      sortKey={sortKey}
      onSortChange={onSortChange}
    />
  );
});

export default DebtPartnerTable;

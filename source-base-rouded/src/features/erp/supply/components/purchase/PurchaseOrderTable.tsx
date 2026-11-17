import { memo, useCallback, useMemo } from 'react';

import { Avatar, Badge, Progress, Table, Text } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { PURCHASE_STATUS_META } from '../../constants/purchase-orders.constants';
import type { PurchaseOrderRow } from '../../types/supply.types';
import { receivedShare } from '../../utils/purchase.utils';
import { formatDay } from '../../utils/supply-format.utils';

interface PurchaseOrderTableProps {
  rows: readonly PurchaseOrderRow[];
  pageRows: readonly PurchaseOrderRow[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48];
const MIN_TABLE_WIDTH = 908;

const PURCHASE_CELL_CLASSES = {
  stack: 'flex min-w-0 flex-col',
  title: 'truncate text-fg-heading',
  caption: 'truncate text-caption-12 text-fg-muted',
  date: 'tabular-nums text-caption-12 text-fg-muted',
  number: 'tabular-nums text-fg-heading',
  late: 'tabular-nums font-semibold text-error',
  progress: 'flex items-center gap-2',
  progressValue: 'w-10 shrink-0 text-right tabular-nums text-caption-12 text-fg-subheading',
  owner: 'flex min-w-0 items-center gap-2',
} satisfies Record<string, string>;

/**
 * PurchaseOrderTable — bảng đơn mua: số PO + ngày đặt ghim trái · nhà cung cấp + hàng đặt · hạn giao (ĐỎ kèm "trễ n
 * ngày" khi quá hạn) · giá trị · đã nhận (thanh + %) · trạng thái · người phụ trách; dòng tổng dính đáy (số đơn, tổng
 * giá trị, % đã nhận theo giá trị) và phân trang (giữa dải đáy để trống cho Dock).
 * Lưu ý: cha PHẢI là flex column có chiều cao; bảng hẹp hơn `MIN_TABLE_WIDTH` thì cuộn ngang, không bóp cột.
 *
 * @param props.rows - Mọi dòng sau khi lọc — dùng cho dòng tổng và số "Kết quả".
 * @param props.pageRows - Các dòng của trang đang xem.
 * @param props.page - Trang hiện tại, đếm từ 1.
 * @param props.pageSize - Số dòng mỗi trang.
 * @param props.onPageChange - Gọi khi đổi trang.
 * @param props.onPageSizeChange - Gọi khi đổi cỡ trang.
 */
const PurchaseOrderTable = memo(function PurchaseOrderTable({
  rows,
  pageRows,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PurchaseOrderTableProps) {
  const columns = useMemo<TableColumn<PurchaseOrderRow>[]>(
    () => [
      {
        key: 'code',
        header: 'Số PO · Ngày đặt',
        width: 128,
        frozen: true,
        cell: (row) => (
          <div className={PURCHASE_CELL_CLASSES.stack}>
            <span className={PURCHASE_CELL_CLASSES.title}>{row.code}</span>
            <span className={PURCHASE_CELL_CLASSES.date}>{formatDay(row.orderDate)}</span>
          </div>
        ),
      },
      {
        key: 'supplier',
        header: 'Nhà cung cấp',
        cell: (row) => (
          <div className={PURCHASE_CELL_CLASSES.stack}>
            <span className={PURCHASE_CELL_CLASSES.title}>{row.supplier}</span>
            <span className={PURCHASE_CELL_CLASSES.caption}>{row.items}</span>
          </div>
        ),
      },
      {
        key: 'dueDate',
        header: 'Hạn giao',
        align: 'right',
        width: 104,
        cell: (row) =>
          row.lateDays > 0 ? (
            <div className={PURCHASE_CELL_CLASSES.stack}>
              <span className={PURCHASE_CELL_CLASSES.late}>{formatDay(row.dueDate)}</span>
              <span className="text-caption-12 text-error">{`Trễ ${row.lateDays} ngày`}</span>
            </div>
          ) : (
            <span className="tabular-nums">{formatDay(row.dueDate)}</span>
          ),
      },
      {
        key: 'value',
        header: 'Giá trị (đ)',
        align: 'right',
        width: 124,
        cell: (row) => (
          <span className={PURCHASE_CELL_CLASSES.number}>{formatNumber(row.value)}</span>
        ),
      },
      {
        key: 'received',
        header: 'Đã nhận',
        width: 120,
        cell: (row) => (
          <div className={PURCHASE_CELL_CLASSES.progress}>
            <Progress
              className="flex-1"
              label={`Đã nhận ${row.receivedPct}%`}
              size="sm"
              value={row.receivedPct}
              variant={row.lateDays > 0 ? 'warning' : 'primary'}
            />
            <span className={PURCHASE_CELL_CLASSES.progressValue}>{`${row.receivedPct}%`}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: 100,
        cell: (row) => {
          const meta = PURCHASE_STATUS_META[row.status];
          return (
            <Badge color={meta.color} shape="tag" size="sm">
              {meta.label}
            </Badge>
          );
        },
      },
      {
        key: 'owner',
        header: 'Người phụ trách',
        width: 136,
        cell: (row) => (
          <div className={PURCHASE_CELL_CLASSES.owner}>
            <Avatar name={row.owner} size="2xs" />
            <span className="truncate">{row.owner}</span>
          </div>
        ),
      },
    ],
    [],
  );

  const rowKey = useCallback((row: PurchaseOrderRow) => row.id, []);

  const footerCell = useCallback(
    (column: TableColumn<PurchaseOrderRow>) => {
      if (column.key === 'code') {
        return <Text size="tiny" weight="medium">{`${rows.length} đơn`}</Text>;
      }
      if (column.key === 'value') {
        const sum = rows.reduce((acc, row) => acc + row.value, 0);
        return <span className={PURCHASE_CELL_CLASSES.number}>{formatNumber(sum)}</span>;
      }
      if (column.key === 'received') {
        return (
          <span className="tabular-nums text-caption-12 text-fg-subheading">
            {`${formatPercent(receivedShare(rows), 1)} giá trị`}
          </span>
        );
      }
      return null;
    },
    [rows],
  );

  return (
    <Table
      columns={columns}
      countLabel="Số đơn:"
      currentPage={page}
      data={[...pageRows]}
      fill
      footerCell={footerCell}
      minWidth={MIN_TABLE_WIDTH}
      pageSize={pageSize}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      rowKey={rowKey}
      total={rows.length}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
});

export default PurchaseOrderTable;

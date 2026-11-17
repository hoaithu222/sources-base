import { memo, useCallback, useMemo } from 'react';

import { Table, Text } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import { STOCK_GROUPS, STOCK_WAREHOUSES } from '../../constants/stock.constants';
import type { StockLotRow } from '../../types/supply.types';
import { formatDay } from '../../utils/supply-format.utils';
import StockWarningBadges from './StockWarningBadges';

interface StockLotTableProps {
  rows: readonly StockLotRow[];
  pageRows: readonly StockLotRow[];
  page: number;
  pageSize: number;
  showWarehouse: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const PAGE_SIZE_OPTIONS = [12, 24, 48];
const MIN_TABLE_WIDTH = 916;

const STOCK_CELL_CLASSES = {
  stack: 'flex min-w-0 flex-col',
  title: 'truncate text-fg-heading',
  caption: 'truncate text-caption-12 text-fg-muted',
  number: 'tabular-nums text-fg-heading',
  short: 'tabular-nums font-semibold text-error',
  muted: 'tabular-nums text-fg-muted',
  sub: 'whitespace-nowrap tabular-nums text-caption-12 text-fg-muted',
} satisfies Record<string, string>;

const EXPIRY_TONE_CLASSES = {
  none: 'text-fg-faint',
  ok: 'tabular-nums text-fg-body',
  soon: 'tabular-nums font-semibold text-warning',
  over: 'tabular-nums font-semibold text-error',
} satisfies Record<'none' | 'ok' | 'soon' | 'over', string>;

const expiryTone = (row: StockLotRow): keyof typeof EXPIRY_TONE_CLASSES => {
  if (row.daysLeft === null) return 'none';
  if (row.warnings.includes('expired')) return 'over';
  return row.warnings.includes('expiring') ? 'soon' : 'ok';
};

const isShort = (row: StockLotRow) => row.warnings.includes('below-min');

/**
 * StockLotTable — bảng tồn kho theo lô: mã + lô ghim trái · tên vật tư (+ nhóm, kho) · ĐVT · HSD (cam khi còn ≤ 30
 * ngày, đỏ khi quá hạn) / ngày nhập · tồn (đỏ khi mã dưới tối thiểu) · tối thiểu · giá trị · huy hiệu cảnh báo; dòng tổng
 * dính đáy (số lô, tổng giá trị) và phân trang (giữa dải đáy để trống cho Dock).
 * Lưu ý: cha PHẢI là flex column có chiều cao; bảng hẹp hơn `MIN_TABLE_WIDTH` thì cuộn ngang, không bóp cột.
 *
 * @param props.rows - Mọi dòng sau khi lọc — dùng cho dòng tổng và số "Kết quả".
 * @param props.pageRows - Các dòng của trang đang xem.
 * @param props.page - Trang hiện tại, đếm từ 1.
 * @param props.pageSize - Số dòng mỗi trang.
 * @param props.showWarehouse - `true` (đang xem mọi kho) → dòng phụ của tên vật tư in thêm tên kho.
 * @param props.onPageChange - Gọi khi đổi trang.
 * @param props.onPageSizeChange - Gọi khi đổi cỡ trang.
 */
const StockLotTable = memo(function StockLotTable({
  rows,
  pageRows,
  page,
  pageSize,
  showWarehouse,
  onPageChange,
  onPageSizeChange,
}: StockLotTableProps) {
  const columns = useMemo<TableColumn<StockLotRow>[]>(
    () => [
      {
        key: 'code',
        header: 'Mã · Lô',
        width: 130,
        frozen: true,
        cell: (row) => (
          <div className={STOCK_CELL_CLASSES.stack}>
            <span className={STOCK_CELL_CLASSES.title}>{row.code}</span>
            <span className={STOCK_CELL_CLASSES.sub}>{row.lot}</span>
          </div>
        ),
      },
      {
        key: 'name',
        header: 'Tên vật tư',
        cell: (row) => (
          <div className={STOCK_CELL_CLASSES.stack}>
            <span className={STOCK_CELL_CLASSES.title}>{row.name}</span>
            <span className={STOCK_CELL_CLASSES.caption}>
              {showWarehouse
                ? `${STOCK_GROUPS[row.group].name} · ${STOCK_WAREHOUSES[row.warehouse].short}`
                : STOCK_GROUPS[row.group].name}
            </span>
          </div>
        ),
      },
      { key: 'unit', header: 'ĐVT', width: 52 },
      {
        key: 'expiry',
        header: 'HSD · Ngày nhập',
        align: 'right',
        width: 128,
        cell: (row) => (
          <div className={STOCK_CELL_CLASSES.stack}>
            <span className={EXPIRY_TONE_CLASSES[expiryTone(row)]}>
              {row.expiry ? formatDay(row.expiry) : 'Không HSD'}
            </span>
            <span className={STOCK_CELL_CLASSES.sub}>{`Nhập ${formatDay(row.importDate)}`}</span>
          </div>
        ),
      },
      {
        key: 'qty',
        header: 'Tồn',
        align: 'right',
        width: 84,
        cell: (row) => (
          <span className={isShort(row) ? STOCK_CELL_CLASSES.short : STOCK_CELL_CLASSES.number}>
            {formatNumber(row.qty, row.decimals)}
          </span>
        ),
      },
      {
        key: 'min',
        header: 'Tối thiểu',
        align: 'right',
        width: 76,
        cell: (row) => (
          <span className={STOCK_CELL_CLASSES.muted}>{formatNumber(row.min, row.decimals, 0)}</span>
        ),
      },
      {
        key: 'value',
        header: 'Giá trị (đ)',
        align: 'right',
        width: 124,
        cell: (row) => <span className={STOCK_CELL_CLASSES.number}>{formatNumber(row.value)}</span>,
      },
      {
        key: 'warnings',
        header: 'Cảnh báo',
        width: 136,
        cell: (row) => <StockWarningBadges warnings={row.warnings} />,
      },
    ],
    [showWarehouse],
  );

  const rowKey = useCallback((row: StockLotRow) => row.id, []);

  const footerCell = useCallback(
    (column: TableColumn<StockLotRow>) => {
      if (column.key === 'code') {
        return <Text size="tiny" weight="medium">{`${rows.length} lô`}</Text>;
      }
      if (column.key === 'value') {
        const sum = rows.reduce((acc, row) => acc + row.value, 0);
        return <span className={STOCK_CELL_CLASSES.number}>{formatNumber(sum)}</span>;
      }
      return null;
    },
    [rows],
  );

  return (
    <Table
      columns={columns}
      countLabel="Số lô:"
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

export default StockLotTable;

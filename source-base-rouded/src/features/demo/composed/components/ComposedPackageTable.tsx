import { memo, useCallback, useMemo } from 'react';

import { Badge, Button, Progress, Table, Text } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { formatNumber } from '@/shared/utils/format/format.utils';

import {
  PACKAGE_STATUS_META,
  type DemoPackageRow,
} from '../../shared/constants/packages.constants';

interface ComposedPackageTableProps {
  rows: readonly DemoPackageRow[];
  onOpenRow: (row: DemoPackageRow) => void;
}

/**
 * ComposedPackageTable — bảng gói thầu của màn `/demo/ghep` (cột mã ghim, dòng tổng, mở chi tiết).
 * Lưu ý: cha PHẢI là flex column có chiều cao (vd `BoxPanel bodyOverflow="hidden"`): vỏ `<Table>` cao
 * theo nội dung, `fill` mới lấp hết phần dôi.
 *
 * @param props.rows - Các gói cần hiện.
 * @param props.onOpenRow - Gọi khi bấm một dòng hoặc nút mũi tên cuối dòng.
 */
const ComposedPackageTable = memo(function ComposedPackageTable({
  rows,
  onOpenRow,
}: ComposedPackageTableProps) {
  const columns = useMemo<TableColumn<DemoPackageRow>[]>(
    () => [
      { key: 'code', header: 'Mã', width: 84, frozen: true },
      {
        key: 'name',
        header: 'Tên gói thầu',
        width: 280,
        cell: (row) => (
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-fg-heading">{row.name}</span>
            <span className="truncate text-caption-12 text-fg-muted">{row.contractor}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: 132,
        cell: (row) => {
          const meta = PACKAGE_STATUS_META[row.status];
          return (
            <Badge color={meta.color} variant="tinted">
              {meta.label}
            </Badge>
          );
        },
      },
      {
        key: 'progress',
        header: 'Tiến độ',
        width: 148,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Progress className="flex-1" value={row.progress} />
            <span className="w-9 shrink-0 text-right tabular-nums text-caption-12 text-fg-subheading">
              {row.progress}%
            </span>
          </div>
        ),
      },
      {
        key: 'value',
        header: 'Giá trị (đ)',
        align: 'right',
        width: 148,
        cell: (row) => (
          <span className="tabular-nums text-fg-heading">{formatNumber(row.value)}</span>
        ),
      },
      {
        key: 'dueDate',
        header: 'Hạn hoàn thành',
        align: 'right',
        width: 132,
        cell: (row) => <span className="tabular-nums">{row.dueDate}</span>,
      },
      {
        key: 'actions',
        header: '',
        width: 44,
        cell: (row) => (
          <Button
            aria-label={`Xem gói ${row.code}`}
            size="sm"
            variant="ghost"
            onClick={() => onOpenRow(row)}
          >
            <SystemIcon name="angle-right-outline" size={14} />
          </Button>
        ),
      },
    ],
    [onOpenRow],
  );

  const rowKey = useCallback((row: DemoPackageRow) => row.id, []);

  const footerCell = useCallback(
    (column: TableColumn<DemoPackageRow>) => {
      if (column.key === 'code')
        return <Text size="tiny" weight="medium">{`${rows.length} gói`}</Text>;
      if (column.key === 'value') {
        const sum = rows.reduce((acc, r) => acc + r.value, 0);
        return <span className="tabular-nums text-fg-heading">{formatNumber(sum)}</span>;
      }
      return null;
    },
    [rows],
  );

  return (
    <Table
      columns={columns}
      data={[...rows]}
      fill
      footerCell={footerCell}
      rowKey={rowKey}
      onRowClick={onOpenRow}
    />
  );
});

export default ComposedPackageTable;

'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { renderHeaderCell } from './render-header-cell';
import { useTableHeaderLabels } from '../../hooks/useTableHeaderLabels';
import {
  TABLE_HEADER_GROUP_CELL_CLASSES,
  TABLE_HEADER_ROW_CLASSES,
  TABLE_HEADER_SIZE_CLASSES,
} from '../../table.theme';
import { hasColumnDivider, headerCellShadow, widthOf } from '../../utils/table.utils';
import type { HeaderGroupSpan } from '../../utils/table-header-groups.utils';
import type { TableHeaderRowProps } from '../../table.types';

interface TableHeaderGroupRowProps<TData> extends Omit<
  TableHeaderRowProps<TData>,
  'groupedOnly' | 'topOffset'
> {
  groups: HeaderGroupSpan[];
  rowRef: React.Ref<HTMLTableRowElement>;
}

function TableHeaderGroupRowBase<TData>({
  columns,
  groups,
  columnDividers,
  headerClassName,
  headerSize,
  resizable,
  widths,
  resizingKey,
  onResizeStart,
  sortKey,
  sortDir,
  onSortChange,
  frozenLeft,
  rowRef,
}: TableHeaderGroupRowProps<TData>) {
  const labels = useTableHeaderLabels();
  const cells = useMemo(
    () =>
      groups.map((group) => {
        const first = columns[group.start];
        const lastIndex = group.start + group.span - 1;
        const left = frozenLeft?.[first.key];
        const lastFrozen = left != null && frozenLeft?.[columns[lastIndex + 1]?.key] == null;
        const divider = columnDividers && hasColumnDivider(columns, lastIndex);

        if (!group.grouped)
          return renderHeaderCell({
            col: first,
            width: widthOf(first, widths),
            left,
            top: 0,
            lastFrozen,
            divider,
            rowSpan: 2,
            headerClassName,
            headerSize,
            labels,
            canResize: resizable && (first.resizable ?? true),
            resizing: resizingKey === first.key,
            onResizeStart,
            sortDir,
            isSorted: !!first.sortable && !!onSortChange && sortKey === first.key && !!sortDir,
            onSortChange,
          });

        const groupShadow = headerCellShadow({
          tier: true,
          right: lastFrozen || divider,
          edge: lastFrozen,
        });
        const groupCellClassName = cn(
          TABLE_HEADER_GROUP_CELL_CLASSES,
          left != null ? 'z-20' : 'z-10',
          TABLE_HEADER_SIZE_CLASSES[headerSize],
          headerClassName,
        );
        return (
          <th
            key={group.key}
            className={groupCellClassName}
            colSpan={group.span}
            scope="colgroup"
            style={{ ...(left != null ? { left } : {}), boxShadow: groupShadow }}
          >
            {group.label}
          </th>
        );
      }),
    [
      groups,
      columns,
      columnDividers,
      headerClassName,
      headerSize,
      resizable,
      widths,
      resizingKey,
      onResizeStart,
      sortKey,
      sortDir,
      onSortChange,
      frozenLeft,
      labels,
    ],
  );

  const rowClassName = cn(TABLE_HEADER_ROW_CLASSES, headerClassName);

  return (
    <tr ref={rowRef} className={rowClassName}>
      {cells}
    </tr>
  );
}

/**
 * TableHeaderGroupRow — TẦNG TRÊN của header 2 tầng: ô nhóm `colSpan`, cột lẻ là ô header `rowSpan={2}`.
 *
 * Phần con nội bộ do `TableHead` dựng khi có cột khai `group`. Ô nhóm luôn có vạch đáy tách hai tầng.
 * Sửa giao diện: `TABLE_HEADER_GROUP_CELL_CLASSES` (`table.theme.ts`).
 *
 * @param props.groups - Kết quả `buildHeaderGroups` (nhóm cột liên tiếp + cột lẻ).
 * @param props.rowRef - Ref của `<tr>` để đo chiều cao thật của tầng trên, cho tầng dưới dính đúng chỗ.
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô (trừ cột cuối).
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim.
 * @param props.widths - Bề rộng đã kéo giãn theo key cột (thắng `column.width`).
 * @param props.resizable - `true` ⇒ có tay cầm kéo giãn (từng cột tắt bằng `resizable: false`).
 * @param props.resizingKey - Key cột đang kéo giãn (tô vạch), `null` khi không kéo.
 * @param props.onResizeStart - `(key, startWidth, event) => void` khi nhấn tay cầm kéo giãn.
 * @param props.headerClassName - Như `Table.headerClassName`.
 * @param props.headerSize - Như `Table.headerSize`.
 * @param props.sortKey - Như `Table.sortKey`.
 * @param props.sortDir - Như `Table.sortDir`.
 * @param props.onSortChange - Như `Table.onSortChange`.
 *
 * @example
 * <TableHeaderGroupRow columns={columns} groups={groups} rowRef={groupRowRef} columnDividers={false}
 *   headerSize="md" resizable resizingKey={null} widths={resize.widths} onResizeStart={resize.onResizeStart} />
 */
export const TableHeaderGroupRow = memo(TableHeaderGroupRowBase) as typeof TableHeaderGroupRowBase;

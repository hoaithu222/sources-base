import { memo, useMemo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { renderHeaderCell } from './render-header-cell';
import { TABLE_HEADER_ROW_CLASSES } from '../../table.theme';
import { hasColumnDivider, widthOf } from '../../utils/table.utils';
import type { TableHeaderRowProps } from '../../table.types';

function TableHeaderRowBase<TData>({
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
  groupedOnly = false,
  topOffset = 0,
}: TableHeaderRowProps<TData>) {
  const cells = useMemo(
    () =>
      columns.map((col, colIndex) => {
        if (groupedOnly && !col.group) return null;
        const left = frozenLeft?.[col.key];
        return renderHeaderCell({
          col,
          width: widthOf(col, widths),
          left,
          top: topOffset,
          lastFrozen: left != null && frozenLeft?.[columns[colIndex + 1]?.key] == null,
          divider: columnDividers && hasColumnDivider(columns, colIndex),
          headerClassName,
          headerSize,
          canResize: resizable && (col.resizable ?? true),
          resizing: resizingKey === col.key,
          onResizeStart,
          sortDir,
          isSorted: !!col.sortable && !!onSortChange && sortKey === col.key && !!sortDir,
          onSortChange,
        });
      }),
    [
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
      groupedOnly,
      topOffset,
    ],
  );

  const rowClassName = cn(TABLE_HEADER_ROW_CLASSES, headerClassName);

  return <tr className={rowClassName}>{cells}</tr>;
}

/**
 * TableHeaderRow — dòng `<th>` của từng cột (tầng DƯỚI khi header 2 tầng); memo, không dựng lại khi `data` đổi.
 *
 * Phần con nội bộ do `TableHead` dựng; ô dựng bằng `renderHeaderCell`.
 * Sửa giao diện: `TABLE_HEADER_ROW_CLASSES` · `TABLE_HEADER_CELL_CLASSES` (`table.theme.ts`).
 *
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
 * @param props.groupedOnly - `true` (header 2 tầng) ⇒ chỉ vẽ cột có `group`; cột lẻ đã trải `rowSpan`
 *   ở tầng trên.
 *   Mặc định `false`.
 * @param props.topOffset - `top` (px) khi dính đỉnh — bằng chiều cao tầng trên. Mặc định `0`.
 *
 * @example
 * <TableHeaderRow columns={columns} columnDividers={false} headerSize="md" resizable resizingKey={null}
 *   widths={resize.widths} onResizeStart={resize.onResizeStart} />
 */
export const TableHeaderRow = memo(TableHeaderRowBase) as typeof TableHeaderRowBase;

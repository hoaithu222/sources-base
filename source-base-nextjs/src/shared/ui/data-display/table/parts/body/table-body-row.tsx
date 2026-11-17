'use client';

import { memo, useCallback } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { TableFullRowCell } from './table-full-row-cell';
import { TableRowCells } from './table-row-cells';
import {
  TABLE_DIVIDER_CLASSES,
  TABLE_ROW_CLASSES,
  TABLE_ROW_STRIPED_CLASSES,
} from '../../table.theme';
import type { TableBodyRowProps } from '../../table.types';

function TableBodyRowBase<TData>({
  row,
  index,
  columns,
  columnDividers,
  rowHeight,
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  rowStyle,
  renderRowWrapper,
  frozenLeft,
  fullRowCell,
  gridBorder,
  striped,
}: TableBodyRowProps<TData>) {
  const handleClick = useCallback(() => onRowClick?.(row, index), [onRowClick, row, index]);
  const handleDoubleClick = useCallback(
    () => onRowDoubleClick?.(row, index),
    [onRowDoubleClick, row, index],
  );
  const full = fullRowCell?.(row, index) ?? null;

  const trClassName = cn(
    TABLE_ROW_CLASSES,
    TABLE_DIVIDER_CLASSES[gridBorder ? 'grid' : 'soft'],
    onRowClick && 'cursor-pointer',
    striped && index % 2 === 1 && TABLE_ROW_STRIPED_CLASSES,
    rowClassName?.(row, index),
  );

  const tr = (
    <tr
      className={trClassName}
      style={{ ...(rowHeight != null && { height: rowHeight }), ...rowStyle?.(row, index) }}
      onClick={onRowClick ? handleClick : undefined}
      onDoubleClick={onRowDoubleClick ? handleDoubleClick : undefined}
    >
      {full == null ? (
        <TableRowCells
          columnDividers={columnDividers}
          columns={columns}
          frozenLeft={frozenLeft}
          gridBorder={gridBorder}
          index={index}
          row={row}
          rowHeight={rowHeight}
        />
      ) : (
        <TableFullRowCell colSpan={columns.length}>{full}</TableFullRowCell>
      )}
    </tr>
  );

  return renderRowWrapper ? <>{renderRowWrapper(tr, row, index)}</> : tr;
}

/**
 * TableBodyRow — một `<tr>` dữ liệu của `Table` (dòng thường, không kéo-thả); memo theo props.
 *
 * Phần con nội bộ do `TableBody` dựng; dòng kéo-thả dùng `TableSortableRow`. Ô `<td>` dựng bằng
 * `TableRowCells`; `fullRowCell` trả node thì cả dòng là một `TableFullRowCell`.
 * Sửa giao diện: `TABLE_ROW_CLASSES` · `TABLE_DIVIDER_CLASSES` (`table.theme.ts`).
 * Lưu ý: `columns` và mọi callback dòng phải ổn định reference, không thì memo vô tác dụng.
 *
 * @param props.row - Dữ liệu của dòng.
 * @param props.index - Chỉ số dòng trong `data`.
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô.
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim; bỏ trống ⇒ không cột nào ghim.
 * @param props.fullRowCell - Như `Table.fullRowCell`.
 * @param props.gridBorder - `true` ⇒ vạch đậm (`divider-default`).
 * @param props.onRowClick - Như `Table.onRowClick`.
 * @param props.onRowDoubleClick - Như `Table.onRowDoubleClick`.
 * @param props.renderRowWrapper - Như `Table.renderRowWrapper`.
 * @param props.rowClassName - Như `Table.rowClassName`.
 * @param props.rowHeight - Như `Table.rowHeight`.
 * @param props.rowStyle - Như `Table.rowStyle`.
 *
 * @example
 * <TableBodyRow columnDividers={false} columns={columns} index={i} row={row} onRowClick={onRowClick} />
 */
export const TableBodyRow = memo(TableBodyRowBase) as typeof TableBodyRowBase;

'use client';

import { memo, useCallback, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { cn } from '@/shared/utils/style/cn';
import { TableFullRowCell } from './table-full-row-cell';
import { TableRowCells } from './table-row-cells';
import { RowDragContext } from '../../table-row-drag.context';
import {
  TABLE_DIVIDER_CLASSES,
  TABLE_DRAGGING_ROW_CLASSES,
  TABLE_ROW_CLASSES,
  TABLE_ROW_STRIPED_CLASSES,
} from '../../table.theme';
import { useTableRowDragAttributes } from '../../hooks/useTableDnd';
import type { RowDragCtx } from '../../table-row-drag.context';
import type { TableBodyRowProps } from '../../table.types';

interface TableSortableRowProps<TData> extends TableBodyRowProps<TData> {
  rowId: UniqueIdentifier;
  draggable: boolean;
}

function TableSortableRowBase<TData>({
  rowId,
  draggable,
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
}: TableSortableRowProps<TData>) {
  const dragAttributes = useTableRowDragAttributes();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rowId,
    disabled: !draggable,
    attributes: dragAttributes,
  });
  const handleClick = useCallback(() => onRowClick?.(row, index), [onRowClick, row, index]);
  const handleDoubleClick = useCallback(
    () => onRowDoubleClick?.(row, index),
    [onRowDoubleClick, row, index],
  );
  const dragCtx = useMemo<RowDragCtx>(() => ({ attributes, listeners }), [attributes, listeners]);
  const full = fullRowCell?.(row, index) ?? null;

  const trClassName = cn(
    TABLE_ROW_CLASSES,
    TABLE_DIVIDER_CLASSES[gridBorder ? 'grid' : 'soft'],
    onRowClick && 'cursor-pointer',
    striped && index % 2 === 1 && TABLE_ROW_STRIPED_CLASSES,
    isDragging && TABLE_DRAGGING_ROW_CLASSES,
    rowClassName?.(row, index),
  );

  const tr = (
    <tr
      ref={setNodeRef}
      className={trClassName}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...(rowHeight != null ? { height: rowHeight } : {}),
        ...rowStyle?.(row, index),
      }}
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

  return (
    <RowDragContext.Provider value={dragCtx}>
      {renderRowWrapper ? renderRowWrapper(tr, row, index) : tr}
    </RowDragContext.Provider>
  );
}

/**
 * TableSortableRow — `<tr>` kéo-thả được của `<Table sortable>` (dnd-kit `useSortable`); memo theo props.
 *
 * Phần con nội bộ do `TableBody` dựng khi `sortable`. Cấp `attributes` + `listeners` qua `RowDragContext` cho
 * `<TableDragHandle>` nằm trong `cell` — chỉ tay cầm bắt đầu kéo, không phải cả dòng.
 * Sửa giao diện: `TABLE_ROW_CLASSES` · dòng đang kéo → `TABLE_DRAGGING_ROW_CLASSES` (`table.theme.ts`).
 *
 * @param props.rowId - Key của dòng trong `SortableContext` (= `rowKey(row, index)`).
 * @param props.draggable - `false` ⇒ dòng không kéo được (từ `Table.isRowDraggable`).
 * @param props.row - Dữ liệu của dòng.
 * @param props.index - Chỉ số dòng trong `data`.
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô.
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim.
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
 * <TableSortableRow draggable columnDividers={false} columns={columns} index={i} row={row} rowId={key} />
 */
export const TableSortableRow = memo(TableSortableRowBase) as typeof TableSortableRowBase;

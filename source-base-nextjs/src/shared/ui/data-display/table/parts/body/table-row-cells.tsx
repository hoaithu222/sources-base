import { memo } from 'react';
import { cn } from '@/shared/utils/style/cn';
import {
  TABLE_ALIGN_CLASSES,
  TABLE_CELL_CLASSES,
  TABLE_CELL_DIVIDER_CLASSES,
  TABLE_FROZEN_CELL_CLASSES,
  TABLE_FROZEN_EDGE_CLASSES,
  TABLE_VALIGN_CLASSES,
} from '../../table.theme';
import { hasColumnDivider, isFillerColumn } from '../../utils/table.utils';
import type { TableColumn } from '../../table.types';

interface TableRowCellsProps<TData> {
  columns: TableColumn<TData>[];
  row: TData;
  index: number;
  columnDividers: boolean;
  rowHeight?: number;
  frozenLeft?: Record<string, number>;
  gridBorder?: boolean;
}

function TableRowCellsBase<TData>({
  columns,
  row,
  index,
  columnDividers,
  rowHeight,
  frozenLeft,
  gridBorder = false,
}: TableRowCellsProps<TData>) {
  const divider = gridBorder ? 'grid' : 'soft';
  return (
    <>
      {columns.map((col, colIndex) => {
        const left = frozenLeft?.[col.key];
        const isLastFrozen = left != null && frozenLeft?.[columns[colIndex + 1]?.key] == null;
        const cellClassName = cn(
          TABLE_CELL_CLASSES,
          rowHeight != null ? 'py-0' : 'py-2',
          TABLE_ALIGN_CLASSES[col.align ?? 'left'],
          TABLE_VALIGN_CLASSES[col.verticalAlign ?? 'middle'],
          columnDividers &&
            !isLastFrozen &&
            hasColumnDivider(columns, colIndex) &&
            TABLE_CELL_DIVIDER_CLASSES[divider],
          left != null && TABLE_FROZEN_CELL_CLASSES[divider],
          isLastFrozen && TABLE_FROZEN_EDGE_CLASSES[divider],
          col.cellClassName,
        );
        return (
          <td
            key={col.key}
            aria-hidden={isFillerColumn(col) || undefined}
            className={cellClassName}
            data-col-key={col.key}
            style={left != null ? { left } : undefined}
          >
            {col.cell
              ? col.cell(row, index)
              : ((row as Record<string, unknown>)[col.key] as React.ReactNode)}
          </td>
        );
      })}
    </>
  );
}

/**
 * TableRowCells — các ô `<td>` của MỘT dòng dữ liệu theo `columns`; memo theo props (ô chỉ dựng lại khi cột /
 * dòng / chỉ số / cờ vạch đổi).
 *
 * Phần con nội bộ, dùng chung cho dòng thường (`TableBodyRow`) và dòng kéo-thả (`TableSortableRow`).
 * Sửa giao diện: `TABLE_CELL_CLASSES` · `TABLE_ALIGN_CLASSES` · `TABLE_CELL_DIVIDER_CLASSES` · bóng mép cột
 * ghim cuối (vạch + bóng, theo ô khi cuộn ngang) → `TABLE_FROZEN_EDGE_CLASSES` (`table.theme.ts`).
 *
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.row - Dữ liệu của dòng.
 * @param props.index - Chỉ số dòng trong `data`.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô.
 * @param props.rowHeight - Như `Table.rowHeight`; có thì ô bỏ padding dọc.
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim.
 * @param props.gridBorder - `true` ⇒ vạch đậm (`divider-default`). Mặc định `false`.
 *
 * @example
 * <tr><TableRowCells columnDividers={false} columns={columns} index={i} row={row} /></tr>
 */
export const TableRowCells = memo(TableRowCellsBase) as typeof TableRowCellsBase;

import { cn } from '@/shared/utils/style/cn';
import {
  TABLE_ALIGN_CLASSES,
  TABLE_FOOTER_BORDER_CLASSES,
  TABLE_FOOTER_CELL_CLASSES,
  TABLE_FOOTER_CELL_DIVIDER_CLASSES,
  TABLE_FOOTER_ROW_CLASSES,
  TABLE_FROZEN_EDGE_CLASSES,
} from '../table.theme';
import { hasColumnDivider, isFillerColumn } from '../utils/table.utils';
import type { TableColumn, TableProps } from '../table.types';

interface TableFooterProps<TData> extends Pick<TableProps<TData>, 'footerClassName' | 'rowHeight'> {
  columns: TableColumn<TData>[];
  columnDividers: boolean;
  gridBorder: boolean;
  footerCell: (column: TableColumn<TData>) => React.ReactNode;
  frozenLeft?: Record<string, number>;
}

/**
 * TableFooter — dòng TỔNG `<tfoot>` dính đáy vùng cuộn; ô của cột ghim dính cả hai chiều (đáy + trái).
 *
 * Phần con nội bộ; `Table` chỉ dựng khi có `footerCell` và `data` không rỗng. Ô của cột đệm vẽ rỗng (không gọi
 * `footerCell` — hàm của nơi gọi không phải biết cột nội bộ này).
 * Sửa giao diện: `TABLE_FOOTER_*_CLASSES` · bóng mép cột ghim cuối → `TABLE_FROZEN_EDGE_CLASSES` (`table.theme.ts`).
 * Lưu ý: vạch dọc của ô tổng dùng `TABLE_FOOTER_CELL_DIVIDER_CLASSES` (chỉ tô màu cạnh phải) — lớp màu viền
 * cả 4 cạnh sẽ đè mất `border-t-(--table-rule)` của vạch trên.
 *
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.footerCell - `(column) => node` cho từng ô.
 * @param props.footerClassName - Class thêm cho `<tr>` dòng tổng.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô.
 * @param props.gridBorder - `true` ⇒ vạch đậm (`divider-default`).
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim.
 * @param props.rowHeight - Như `Table.rowHeight`.
 *
 * @example
 * <TableFooter columns={columns} columnDividers={false} footerCell={renderTotal} gridBorder={false} />
 */
export function TableFooter<TData>({
  columnDividers,
  columns,
  footerCell,
  footerClassName,
  frozenLeft,
  gridBorder,
  rowHeight,
}: TableFooterProps<TData>) {
  const divider = gridBorder ? 'grid' : 'soft';
  const rowClassName = cn(TABLE_FOOTER_ROW_CLASSES, footerClassName);

  const cells = columns.map((col, colIndex) => {
    const left = frozenLeft?.[col.key];
    const isLastFrozen = left != null && frozenLeft?.[columns[colIndex + 1]?.key] == null;
    const cellClassName = cn(
      TABLE_FOOTER_CELL_CLASSES,
      rowHeight != null ? 'py-0' : 'py-2',
      TABLE_ALIGN_CLASSES[col.align ?? 'left'],
      columnDividers &&
        !isLastFrozen &&
        hasColumnDivider(columns, colIndex) &&
        TABLE_FOOTER_CELL_DIVIDER_CLASSES[divider],
      left != null ? 'z-[3]' : 'z-[2]',
      isLastFrozen && TABLE_FROZEN_EDGE_CLASSES[divider],
      TABLE_FOOTER_BORDER_CLASSES,
      col.cellClassName,
    );
    const filler = isFillerColumn(col);
    return (
      <td
        key={col.key}
        aria-hidden={filler || undefined}
        className={cellClassName}
        style={{ ...(left != null ? { left } : undefined), height: rowHeight }}
      >
        {filler ? null : footerCell(col)}
      </td>
    );
  });

  return (
    <tfoot>
      <tr className={rowClassName}>{cells}</tr>
    </tfoot>
  );
}

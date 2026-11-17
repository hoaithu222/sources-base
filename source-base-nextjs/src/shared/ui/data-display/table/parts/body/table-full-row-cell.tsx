import { memo } from 'react';
import { TABLE_FULL_ROW_CELL_CLASSES } from '../../table.theme';

interface TableFullRowCellProps {
  colSpan: number;
  children: React.ReactNode;
}

/**
 * TableFullRowCell — ô `<td colSpan>` trải hết chiều ngang của dòng `fullRowCell` (dòng nhóm, dòng tổng phụ…).
 *
 * Phần con nội bộ, dùng chung cho dòng thường (`TableBodyRow`) và dòng kéo-thả (`TableSortableRow`).
 * Sửa giao diện: `TABLE_FULL_ROW_CELL_CLASSES` (`table.theme.ts`).
 *
 * @param props.colSpan - Số cột ô trải qua — luôn bằng `columns.length`.
 * @param props.children - Nội dung do `fullRowCell(row, index)` trả về.
 *
 * @example
 * <TableFullRowCell colSpan={columns.length}>{full}</TableFullRowCell>
 */
export const TableFullRowCell = memo(function TableFullRowCell({
  colSpan,
  children,
}: TableFullRowCellProps) {
  return (
    <td className={TABLE_FULL_ROW_CELL_CLASSES} colSpan={colSpan}>
      {children}
    </td>
  );
});

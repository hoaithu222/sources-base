import { memo, useContext } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { RowDragContext } from './table-row-drag.context';
import { TABLE_DRAG_HANDLE_CLASSES } from './table.theme';

export interface TableDragHandleProps {
  className?: string;
}

const stopRowEvent = (event: React.MouseEvent) => event.stopPropagation();

/**
 * TableDragHandle — tay cầm kéo dòng của `<Table sortable>`; đặt trong `cell` của một cột (thường cột đầu).
 *
 * Chỉ render khi nằm trong dòng của `<Table sortable>` (đọc `RowDragContext`); ngoài bảng thì trả `null`.
 * Kéo bằng chuột (đi ≥ 4px mới bắt đầu) hoặc bàn phím (Space để nhấc, mũi tên để dời, Space để thả).
 * Bấm / bấm đúp tay cầm KHÔNG kích hoạt `onRowClick` / `onRowDoubleClick` của dòng.
 * Sửa giao diện: `TABLE_DRAG_HANDLE_CLASSES` (`table.theme.ts`).
 *
 * @param props.className - Class thêm cho nút tay cầm (merge sau class mặc định).
 *
 * @example
 * const columns = [{ key: 'drag', width: 32, cell: () => <TableDragHandle /> }, ...rest];
 * <Table sortable columns={columns} data={rows} rowKey={(r) => r.id} onReorder={move} />
 */
const TableDragHandle = memo(function TableDragHandle({ className }: TableDragHandleProps) {
  const ctx = useContext(RowDragContext);
  if (!ctx) return null;

  const handleClassName = cn(TABLE_DRAG_HANDLE_CLASSES, className);

  return (
    <button
      type="button"
      {...(ctx.attributes as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      {...(ctx.listeners as unknown as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      aria-label="Kéo để sắp xếp"
      className={handleClassName}
      onClick={stopRowEvent}
      onDoubleClick={stopRowEvent}
    >
      <SystemIcon name="grip-dots-vertical-outline" size={10} />
    </button>
  );
});

export default TableDragHandle;

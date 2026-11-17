import { TableHeaderRow } from './table-header-row';
import { TableHeaderGroupRow } from './table-header-group-row';
import type { HeaderGroupSpan } from '../../utils/table-header-groups.utils';
import type { TableHeaderRowProps } from '../../table.types';
import type { ColumnResizeApi } from '../../hooks/useColumnResize';

interface TableHeadProps<TData> extends Pick<
  TableHeaderRowProps<TData>,
  | 'columnDividers'
  | 'columns'
  | 'frozenLeft'
  | 'headerClassName'
  | 'headerSize'
  | 'onSortChange'
  | 'resizable'
  | 'sortDir'
  | 'sortKey'
> {
  groups: HeaderGroupSpan[] | null;
  groupRowHeight: number;
  groupRowRef: React.Ref<HTMLTableRowElement>;
  resize: ColumnResizeApi;
}

/**
 * TableHead — `<colgroup>` (chỉ khi header 2 tầng) + `<thead>`: tầng nhóm (nếu có) và dòng header của cột.
 *
 * Phần con nội bộ của `Table`; ô `<th>` dựng bằng `renderHeaderCell`. Lý do vạch header vẽ bằng `box-shadow`
 * và cách đo tầng trên: docs/notes/components/data-display-table.md (## TableHead).
 *
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.groups - Kết quả `buildHeaderGroups`; `null` ⇒ header 1 tầng.
 * @param props.groupRowHeight - Chiều cao đo được của tầng trên; tầng dưới đẩy `top` xuống đúng số này.
 * @param props.groupRowRef - Ref gắn vào `<tr>` tầng trên để đo chiều cao (`useTableGroupRowHeight`).
 * @param props.resize - API kéo giãn cột từ `useColumnResize` (bề rộng đã kéo, cột đang kéo, handler).
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô header.
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim.
 * @param props.headerClassName - Như `Table.headerClassName`.
 * @param props.headerSize - Như `Table.headerSize`.
 * @param props.resizable - `Table.resizable` đã áp mặc định.
 * @param props.sortKey - Như `Table.sortKey`.
 * @param props.sortDir - Như `Table.sortDir`.
 * @param props.onSortChange - Như `Table.onSortChange`.
 *
 * @example
 * <TableHead columns={columns} groups={null} groupRowHeight={0} groupRowRef={groupRowRef} resize={resize}
 *   columnDividers={false} headerSize="md" resizable />
 */
export function TableHead<TData>({
  columnDividers,
  columns,
  frozenLeft,
  groupRowHeight,
  groupRowRef,
  groups,
  headerClassName,
  headerSize,
  onSortChange,
  resizable,
  resize,
  sortDir,
  sortKey,
}: TableHeadProps<TData>) {
  return (
    <>
      {groups && (
        <colgroup>
          {columns.map((col) => (
            <col key={col.key} style={{ width: resize.widths[col.key] ?? col.width }} />
          ))}
        </colgroup>
      )}
      <thead>
        {groups && (
          <TableHeaderGroupRow
            columnDividers={columnDividers}
            columns={columns}
            frozenLeft={frozenLeft}
            groups={groups}
            headerClassName={headerClassName}
            headerSize={headerSize}
            resizable={resizable}
            resizingKey={resize.resizingKey}
            rowRef={groupRowRef}
            sortDir={sortDir}
            sortKey={sortKey}
            widths={resize.widths}
            onResizeStart={resize.onResizeStart}
            onSortChange={onSortChange}
          />
        )}
        <TableHeaderRow
          columnDividers={columnDividers}
          columns={columns}
          frozenLeft={frozenLeft}
          groupedOnly={!!groups}
          headerClassName={headerClassName}
          headerSize={headerSize}
          resizable={resizable}
          resizingKey={resize.resizingKey}
          sortDir={sortDir}
          sortKey={sortKey}
          topOffset={groups ? groupRowHeight : 0}
          widths={resize.widths}
          onResizeStart={resize.onResizeStart}
          onSortChange={onSortChange}
        />
      </thead>
    </>
  );
}

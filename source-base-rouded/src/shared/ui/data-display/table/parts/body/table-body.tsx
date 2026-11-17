import { useMemo } from 'react';
import EmptyState from '@/shared/ui/feedback/EmptyState';
import Spinner from '@/shared/ui/feedback/Spinner';
import TableEmptyIllustration from '@/shared/ui/feedback/TableEmptyIllustration';
import { TableBodyRow } from './table-body-row';
import { TableSortableRow } from './table-sortable-row';
import { TABLE_EMPTY_CELL_CLASSES, TABLE_LOADING_CLASSES } from '../../table.theme';
import type { TableColumn, TableProps } from '../../table.types';

interface TableBodyProps<TData> extends Pick<
  TableProps<TData>,
  | 'fullRowCell'
  | 'isRowDraggable'
  | 'onRowClick'
  | 'onRowDoubleClick'
  | 'renderRowWrapper'
  | 'rowClassName'
  | 'rowHeight'
  | 'rowStyle'
  | 'striped'
> {
  data: TData[];
  columns: TableColumn<TData>[];
  columnDividers: boolean;
  gridBorder: boolean;
  frozenLeft?: Record<string, number>;
  getRowKey: (row: TData, index: number) => string | number;
  sortable: boolean;
  loading: boolean;
  emptyMessage: React.ReactNode;
  padTop: number;
  padBottom: number;
}

/** Nội dung ô rỗng: đang tải → spinner + chữ; chuỗi → `EmptyState` có minh hoạ; node → render nguyên. */
function renderEmptyContent(loading: boolean, emptyMessage: React.ReactNode) {
  if (loading) {
    return (
      <span className={TABLE_LOADING_CLASSES}>
        <Spinner label="Đang tải" size="sm" />
        <span aria-hidden>Đang tải...</span>
      </span>
    );
  }
  if (typeof emptyMessage !== 'string' || !emptyMessage) return emptyMessage;
  return (
    <EmptyState
      className="p-0"
      illustration={<TableEmptyIllustration height={54} width={72} />}
      title={emptyMessage}
      titleClassName="text-body-14-medium text-fg-muted"
    />
  );
}

/**
 * TableBody — `<tbody>` của `Table`: ô báo rỗng / đang tải, hoặc các dòng (memo) kẹp giữa hai dòng đệm ảo hoá.
 *
 * Phần con nội bộ. `sortable` chọn `TableSortableRow` thay `TableBodyRow` cho mọi dòng.
 * Sửa giao diện: ô rỗng → `TABLE_EMPTY_CELL_CLASSES` · dòng đang tải → `TABLE_LOADING_CLASSES` (`table.theme.ts`).
 *
 * @param props.data - Các dòng của trang hiện tại.
 * @param props.columns - Định nghĩa cột của bảng.
 * @param props.columnDividers - `true` ⇒ vạch dọc giữa các ô.
 * @param props.gridBorder - `true` ⇒ vạch đậm (`divider-default`).
 * @param props.frozenLeft - Vị trí `left` (px) theo key của các cột ghim.
 * @param props.getRowKey - `(row, index) => key` — key React và id kéo-thả của dòng.
 * @param props.sortable - `true` ⇒ dòng kéo-thả được.
 * @param props.loading - `true` + `data` rỗng ⇒ spinner + "Đang tải..." thay `emptyMessage`.
 * @param props.emptyMessage - Nội dung ô báo rỗng: chuỗi ⇒ `EmptyState` có minh hoạ bảng trống; node ⇒ render
 *   nguyên.
 * @param props.padTop - Chiều cao dòng đệm đầu (px); `0` ⇒ không dựng.
 * @param props.padBottom - Chiều cao dòng đệm cuối (px); `0` ⇒ không dựng.
 * @param props.fullRowCell - Như `Table.fullRowCell`.
 * @param props.isRowDraggable - Như `Table.isRowDraggable`.
 * @param props.onRowClick - Như `Table.onRowClick`.
 * @param props.onRowDoubleClick - Như `Table.onRowDoubleClick`.
 * @param props.renderRowWrapper - Như `Table.renderRowWrapper`.
 * @param props.rowClassName - Như `Table.rowClassName`.
 * @param props.rowHeight - Như `Table.rowHeight`.
 * @param props.rowStyle - Như `Table.rowStyle`.
 *
 * @example
 * <TableBody columns={columns} data={data} emptyMessage="Không có dữ liệu" getRowKey={getRowKey}
 *   columnDividers={false} gridBorder={false} loading={false} padTop={0} padBottom={0} sortable={false} />
 */
export function TableBody<TData>({
  columnDividers,
  columns,
  data,
  emptyMessage,
  frozenLeft,
  fullRowCell,
  getRowKey,
  gridBorder,
  isRowDraggable,
  loading,
  onRowClick,
  onRowDoubleClick,
  padBottom,
  padTop,
  renderRowWrapper,
  rowClassName,
  rowHeight,
  rowStyle,
  sortable,
  striped,
}: TableBodyProps<TData>) {
  const bodyRows = useMemo(
    () =>
      data.map((row, index) => {
        const key = getRowKey(row, index);
        return sortable ? (
          <TableSortableRow
            key={key}
            columnDividers={columnDividers}
            columns={columns}
            draggable={isRowDraggable ? isRowDraggable(row, index) : true}
            frozenLeft={frozenLeft}
            fullRowCell={fullRowCell}
            gridBorder={gridBorder}
            index={index}
            renderRowWrapper={renderRowWrapper}
            row={row}
            rowClassName={rowClassName}
            rowHeight={rowHeight}
            rowId={key}
            rowStyle={rowStyle}
            striped={striped}
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
          />
        ) : (
          <TableBodyRow
            key={key}
            columnDividers={columnDividers}
            columns={columns}
            frozenLeft={frozenLeft}
            fullRowCell={fullRowCell}
            gridBorder={gridBorder}
            index={index}
            renderRowWrapper={renderRowWrapper}
            row={row}
            rowClassName={rowClassName}
            rowHeight={rowHeight}
            rowStyle={rowStyle}
            striped={striped}
            onRowClick={onRowClick}
            onRowDoubleClick={onRowDoubleClick}
          />
        );
      }),
    [
      data,
      columns,
      columnDividers,
      gridBorder,
      rowHeight,
      frozenLeft,
      fullRowCell,
      onRowClick,
      onRowDoubleClick,
      rowClassName,
      rowStyle,
      renderRowWrapper,
      getRowKey,
      sortable,
      isRowDraggable,
      striped,
    ],
  );

  return (
    <tbody>
      {data.length === 0 ? (
        <tr>
          <td className={TABLE_EMPTY_CELL_CLASSES} colSpan={columns.length}>
            {renderEmptyContent(loading, emptyMessage)}
          </td>
        </tr>
      ) : (
        <>
          {padTop > 0 && (
            <tr aria-hidden>
              <td colSpan={columns.length} style={{ height: padTop, padding: 0 }} />
            </tr>
          )}
          {bodyRows}
          {padBottom > 0 && (
            <tr aria-hidden>
              <td colSpan={columns.length} style={{ height: padBottom, padding: 0 }} />
            </tr>
          )}
        </>
      )}
    </tbody>
  );
}

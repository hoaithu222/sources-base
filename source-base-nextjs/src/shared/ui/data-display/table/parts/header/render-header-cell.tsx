'use client';

import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import {
  TABLE_ALIGN_CLASSES,
  TABLE_HEADER_CELL_CLASSES,
  TABLE_HEADER_CELL_SORTABLE_CLASSES,
  TABLE_HEADER_SIZE_CLASSES,
  TABLE_RESIZE_HANDLE_CLASSES,
  TABLE_RESIZE_INDICATOR_CLASSES,
  TABLE_RESIZE_INDICATOR_STATE_CLASSES,
  TABLE_SORT_BUTTON_ALIGN_CLASSES,
  TABLE_SORT_BUTTON_CLASSES,
  TABLE_SORT_ICON_BOX_CLASSES,
  TABLE_SORT_ICON_CLASSES,
} from '../../table.theme';
import type { TableHeaderLabels } from '../../hooks/useTableHeaderLabels';
import { headerCellShadow, isFillerColumn } from '../../utils/table.utils';
import type { TableColumn, TableHeaderSize, TableSortDir } from '../../table.types';

interface HeaderCellParams<TData> {
  col: TableColumn<TData>;
  /** Bề rộng đang áp (kéo giãn > khai báo). */
  width?: number | string;
  /** Vị trí `left` khi ghim; bỏ trống = cột cuộn tự do. */
  left?: number;
  /** Khoảng cách tới đỉnh vùng cuộn — tầng dưới phải trừ chiều cao tầng trên. */
  top: number;
  /** Cột ghim CUỐI — kẻ vạch tách vùng ghim với vùng cuộn. */
  lastFrozen: boolean;
  /** Vạch dọc giữa các cột (`columnDividers`, trừ cột cuối bảng). */
  divider: boolean;
  /** Trải dọc 2 tầng khi cột không thuộc nhóm nào. */
  rowSpan?: number;
  headerClassName?: string;
  headerSize: TableHeaderSize;
  /** Chữ trợ năng đã dịch (`useTableHeaderLabels`). */
  labels: TableHeaderLabels;
  canResize: boolean;
  resizing: boolean;
  onResizeStart: (key: string, startWidth: number, e: React.PointerEvent) => void;
  sortDir?: TableSortDir | null;
  isSorted: boolean;
  onSortChange?: (key: string | null, dir: TableSortDir | null) => void;
}

const TABLE_ARIA_SORT = {
  asc: 'ascending',
  desc: 'descending',
} satisfies Record<TableSortDir, React.AriaAttributes['aria-sort']>;

/**
 * Ô `<th>` của MỘT cột (nút sort + tay cầm kéo giãn, `aria-sort` khi đang sắp), cho cả header 1 và 2 tầng.
 * Là hàm render chứ không phải component: gọi trong `.map` của `useMemo` ở dòng header (đã memo).
 * Cột đệm (`TABLE_FILLER_COLUMN`): `aria-hidden`, KHÔNG `data-col-key` — `useColumnResize` không chốt bề rộng nó.
 */
export function renderHeaderCell<TData>(p: HeaderCellParams<TData>) {
  const { col } = p;
  const filler = isFillerColumn(col);
  const canSort = !!col.sortable && !!p.onSortChange;
  const nextSort = (): [string | null, TableSortDir | null] =>
    !p.isSorted ? [col.key, 'asc'] : p.sortDir === 'asc' ? [col.key, 'desc'] : [null, null];

  const shadow = headerCellShadow({
    base: true,
    right: p.lastFrozen || p.divider,
    edge: p.lastFrozen,
  });
  const ariaSort = p.isSorted && p.sortDir ? TABLE_ARIA_SORT[p.sortDir] : undefined;

  const cellClassName = cn(
    TABLE_HEADER_CELL_CLASSES,
    p.left != null ? 'z-20' : 'z-10',
    TABLE_HEADER_SIZE_CLASSES[p.headerSize],
    TABLE_ALIGN_CLASSES[col.align ?? 'left'],
    canSort && TABLE_HEADER_CELL_SORTABLE_CLASSES,
    p.headerClassName,
    col.headerCellClassName,
  );
  const sortButtonClassName = cn(
    TABLE_SORT_BUTTON_CLASSES,
    TABLE_SORT_BUTTON_ALIGN_CLASSES[col.align ?? 'left'],
  );
  const upIconClassName =
    TABLE_SORT_ICON_CLASSES[p.isSorted && p.sortDir === 'asc' ? 'active' : 'idle'];
  const downIconClassName = cn(
    '-mt-0.5',
    TABLE_SORT_ICON_CLASSES[p.isSorted && p.sortDir === 'desc' ? 'active' : 'idle'],
  );
  const indicatorClassName = cn(
    TABLE_RESIZE_INDICATOR_CLASSES,
    TABLE_RESIZE_INDICATOR_STATE_CLASSES[p.resizing ? 'active' : 'idle'],
  );

  return (
    <th
      key={col.key}
      aria-hidden={filler || undefined}
      aria-sort={ariaSort}
      className={cellClassName}
      data-col-key={filler ? undefined : col.key}
      rowSpan={p.rowSpan}
      scope="col"
      style={{
        top: p.top,
        boxShadow: shadow,
        ...(p.width != null ? { width: p.width } : {}),
        ...(p.left != null ? { left: p.left } : {}),
      }}
    >
      {canSort ? (
        <button
          aria-label={p.labels.sortBy(typeof col.header === 'string' ? col.header : col.key)}
          className={sortButtonClassName}
          type="button"
          onClick={() => p.onSortChange?.(...nextSort())}
        >
          {col.header}
          <span className={TABLE_SORT_ICON_BOX_CLASSES}>
            <SystemIcon className={upIconClassName} name="caret-large-up-bold" size={8} />
            <SystemIcon className={downIconClassName} name="caret-large-down-bold" size={8} />
          </span>
        </button>
      ) : (
        col.header
      )}
      {p.canResize && (
        <span
          aria-label={p.labels.resize}
          aria-orientation="vertical"
          className={TABLE_RESIZE_HANDLE_CLASSES}
          role="separator"
          onPointerDown={(e) => {
            const th = e.currentTarget.parentElement as HTMLElement;
            p.onResizeStart(col.key, th.offsetWidth, e);
          }}
        >
          <span aria-hidden className={indicatorClassName} />
        </span>
      )}
    </th>
  );
}

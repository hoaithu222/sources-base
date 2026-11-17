import type { UniqueIdentifier } from '@dnd-kit/core';

export type TableAlign = 'left' | 'center' | 'right';
export type TableVerticalAlign = 'top' | 'middle' | 'bottom';
export type TableHeaderSize = 'sm' | 'md' | 'lg' | 'xl';
export type TableDivider = 'soft' | 'grid';
export type TableActiveState = 'active' | 'idle';
export type TableSortDir = 'asc' | 'desc';

/** Ô header TẦNG TRÊN: các cột LIÊN TIẾP cùng `key` gộp một ô, `label` là chữ hiển thị. */
export interface TableColumnGroup {
  key: string;
  label?: React.ReactNode;
}

export interface TableColumn<TData> {
  /** Khoá duy nhất của cột; không có `cell` thì ô in `row[key]`. */
  key: string;
  header?: React.ReactNode;
  /** `(row, rowIndex) => node` vẽ ô; bỏ trống ⇒ `row[key]`. */
  cell?: (row: TData, rowIndex: number) => React.ReactNode;
  /** Số (px) hoặc CSS width; bảng `table-fixed` (mặc định) chia đều cho cột bỏ trống. */
  width?: number | string;
  align?: TableAlign;
  verticalAlign?: TableVerticalAlign;
  /** `false` ⇒ cột này không kéo giãn được dù bảng `resizable`. Mặc định `true`. */
  resizable?: boolean;
  /** Header thành nút sắp xếp (cần `Table.onSortChange`); nơi gọi tự sắp dữ liệu. */
  sortable?: boolean;
  /** Ghim khi cuộn ngang: các cột LIÊN TIẾP tính từ trái, và `width` phải là số. */
  frozen?: boolean;
  /** Merge SAU class mặc định nên thắng (vd `px-0`); cho `<th>` dùng `headerCellClassName`. */
  cellClassName?: string;
  /** Nhóm header tầng trên; cột LIÊN TIẾP cùng `group.key` gộp một ô. */
  group?: TableColumnGroup;
  headerCellClassName?: string;
}

export interface TableProps<TData> {
  data: TData[];
  columns: TableColumn<TData>[];
  rowKey?: (row: TData, index: number) => string | number;
  rowClassName?: (row: TData, index: number) => string | undefined;
  rowStyle?: (row: TData, index: number) => React.CSSProperties | undefined;
  onRowClick?: (row: TData, index: number) => void;
  onRowDoubleClick?: (row: TData, index: number) => void;
  renderRowWrapper?: (rowElement: React.ReactElement, row: TData, index: number) => React.ReactNode;
  fullRowCell?: (row: TData, index: number) => React.ReactNode | null;
  footerCell?: (column: TableColumn<TData>) => React.ReactNode;
  footerClassName?: string;
  loading?: boolean;

  pagination?: boolean;
  currentPage?: number;
  pageSize?: number;
  total?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  emptyMessage?: React.ReactNode;
  className?: string;
  fill?: boolean;
  headerClassName?: string;
  tableClassName?: string;
  paginationClassName?: string;
  countLabel?: string;
  pageSizeSuffix?: string;
  maxPageButtons?: number;
  headerSize?: TableHeaderSize;
  columnDividers?: boolean;
  gridBorder?: boolean;
  striped?: boolean;
  layout?: 'auto' | 'fixed';
  resizable?: boolean;
  minColumnWidth?: number;
  minWidth?: number | string;
  rowHeight?: number;
  scrollNav?: boolean;
  scrollNavClassName?: string;

  sortable?: boolean;
  onReorder?: (activeKey: UniqueIdentifier, overKey: UniqueIdentifier) => void;
  isRowDraggable?: (row: TData, index: number) => boolean;
  sortKey?: string | null;
  sortDir?: TableSortDir | null;
  onSortChange?: (key: string | null, dir: TableSortDir | null) => void;

  onScroll?: React.UIEventHandler<HTMLDivElement>;
  scrollContainerRef?: React.RefCallback<HTMLDivElement>;
  padTop?: number;
  padBottom?: number;
}

export interface TableBodyRowProps<TData> extends Pick<
  TableProps<TData>,
  | 'fullRowCell'
  | 'gridBorder'
  | 'onRowClick'
  | 'onRowDoubleClick'
  | 'renderRowWrapper'
  | 'rowClassName'
  | 'rowHeight'
  | 'rowStyle'
  | 'striped'
> {
  row: TData;
  index: number;
  columns: TableColumn<TData>[];
  columnDividers: boolean;
  frozenLeft?: Record<string, number>;
}

export interface TableHeaderRowProps<TData> extends Pick<
  TableProps<TData>,
  'headerClassName' | 'onSortChange' | 'sortDir' | 'sortKey'
> {
  columns: TableColumn<TData>[];
  columnDividers: boolean;
  headerSize: TableHeaderSize;
  resizable: boolean;
  widths: Record<string, number>;
  resizingKey: string | null;
  onResizeStart: (key: string, startWidth: number, e: React.PointerEvent) => void;
  frozenLeft?: Record<string, number>;
  groupedOnly?: boolean;
  topOffset?: number;
}

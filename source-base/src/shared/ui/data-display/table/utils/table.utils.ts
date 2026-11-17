import { TABLE_FILLER_CELL_CLASSES } from '../table.theme';
import type { TableColumn } from '../table.types';

/** Ray đáy header: `TABLE_CLASSES` khai `--table-head-rule` ở theme tối (vạch sáng + quầng); thiếu → vạch 2px `--table-rule`. */
const HEADER_SHADOW_BASE = 'var(--table-head-rule, inset 0 -2px 0 0 var(--table-rule))';
const HEADER_SHADOW_TIER = 'inset 0 -1px 0 0 var(--color-border-default)';
const HEADER_SHADOW_RIGHT = 'inset -1px 0 0 0 var(--color-border-default)';
const HEADER_SHADOW_EDGE = '6px 0 6px -4px var(--color-shadow-popup)';

/** Key của cột ĐỆM cuối bảng — chỉ có sau khi kéo giãn (mọi cột đã chốt px), hút phần dư để cột khác không giãn theo. */
const TABLE_FILLER_KEY = '__table-filler__';

/** Cột đệm: không `width` (= "auto" trong `table-layout: fixed`), không đệm, không kéo / sắp; ô vẽ rỗng. */
export const TABLE_FILLER_COLUMN: TableColumn<unknown> = {
  key: TABLE_FILLER_KEY,
  cell: () => null,
  resizable: false,
  cellClassName: TABLE_FILLER_CELL_CLASSES,
  headerCellClassName: TABLE_FILLER_CELL_CLASSES,
};

/** `true` khi `col` là cột đệm (`TABLE_FILLER_COLUMN`) — ô của nó `aria-hidden`, không `data-col-key` ở header. */
export function isFillerColumn<TData>(col: TableColumn<TData>): boolean {
  return col.key === TABLE_FILLER_KEY;
}

/** Cột `index` có vạch dọc bên phải (`columnDividers`)? Không với cột cuối và cột giáp cột đệm (bảng lố 0,5px → cuộn ngang). */
export function hasColumnDivider<TData>(columns: TableColumn<TData>[], index: number): boolean {
  const next = columns[index + 1];
  return next != null && !isFillerColumn(next);
}

interface HeaderCellShadowOptions {
  /** Ray đáy (sáng: 2px `--table-rule` · tối: `--table-head-rule`) — ô giáp dòng dữ liệu đầu. */
  base?: boolean;
  /** Vạch 1px giữa hai tầng header (ô nhóm tầng trên). */
  tier?: boolean;
  /** Vạch dọc bên phải (`columnDividers` / mép cột ghim cuối). */
  right?: boolean;
  /** Bóng mép cột ghim cuối, đè lên vùng cuộn. */
  edge?: boolean;
}

/** Gộp vạch của ô header thành MỘT chuỗi `box-shadow` inline (vạch đáy vẽ TRÊN vạch dọc); không vạch nào → `undefined`. */
export function headerCellShadow(opts: HeaderCellShadowOptions): string | undefined {
  const layers = [
    opts.base && HEADER_SHADOW_BASE,
    opts.tier && HEADER_SHADOW_TIER,
    opts.right && HEADER_SHADOW_RIGHT,
    opts.edge && HEADER_SHADOW_EDGE,
  ].filter(Boolean);
  return layers.length > 0 ? layers.join(', ') : undefined;
}

/** Bề rộng đang áp của một cột: số đã kéo giãn thắng, sau đó mới tới `column.width`. */
export function widthOf<TData>(col: TableColumn<TData>, widths: Record<string, number>) {
  return widths[col.key] ?? col.width;
}

/** Vị trí `left` (px) của các cột ghim LIÊN TIẾP từ trái, theo key cột; không có cột ghim → `undefined`. */
export function getFrozenLeft<TData>(
  columns: TableColumn<TData>[],
  widths: Record<string, number>,
): Record<string, number> | undefined {
  const map: Record<string, number> = {};
  let offset = 0;
  for (const col of columns) {
    if (!col.frozen) break;
    map[col.key] = offset;
    const width = widths[col.key] ?? (typeof col.width === 'number' ? col.width : null);
    if (width == null) break;
    offset += width;
  }
  return Object.keys(map).length === 0 ? undefined : map;
}

/** DEV: cảnh báo cột khai `frozen` mà không được ghim (sau cột thường / sau cột ghim thiếu `width` số). */
export function warnUnpinnedFrozenColumns<TData>(columns: TableColumn<TData>[]): void {
  const pinned = getFrozenLeft(columns, {}) ?? {};
  const lost = columns.filter((col) => col.frozen && pinned[col.key] == null).map((col) => col.key);
  if (lost.length === 0) return;
  console.warn(
    `[Table] Cột ${lost.join(', ')} khai \`frozen\` nhưng KHÔNG được ghim: cột ghim phải liên tiếp từ cột đầu, ` +
      'và mọi cột ghim đứng trước nó phải có `width` là số (px).',
  );
}

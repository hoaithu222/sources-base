import type { TableSortDir } from '../table.types';

/** Giá trị một ô dùng để sắp xếp — `getValue(row, key)` của `useTableSort` trả kiểu này. */
export type TableSortValue = string | number | null | undefined;

/** So sánh 2 ô theo `dir`: chuỗi theo locale vi (có dấu), số theo trị số, ô rỗng luôn xuống cuối. */
export function compareTableSortValues(
  a: TableSortValue,
  b: TableSortValue,
  dir: TableSortDir,
): number {
  const aEmpty = a == null || a === '';
  const bEmpty = b == null || b === '';
  if (aEmpty || bEmpty) return aEmpty && bEmpty ? 0 : aEmpty ? 1 : -1;

  const result =
    typeof a === 'number' && typeof b === 'number'
      ? a - b
      : String(a).localeCompare(String(b), 'vi', { numeric: true, sensitivity: 'base' });

  return dir === 'asc' ? result : -result;
}

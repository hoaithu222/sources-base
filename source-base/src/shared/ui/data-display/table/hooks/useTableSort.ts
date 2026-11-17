import { useCallback, useMemo, useState } from 'react';
import type { TableSortDir } from '../table.types';
import { compareTableSortValues, type TableSortValue } from '../utils/table-sort.utils';

interface UseTableSortResult<TData> {
  sortKey: string | null;
  sortDir: TableSortDir | null;
  onSortChange: (key: string | null, dir: TableSortDir | null) => void;
  sorted: TData[];
  comparator: ((a: TData, b: TData) => number) | null;
}

/**
 * useTableSort — sắp xếp phía client cho `<Table>`: giữ cột / chiều đang sắp và trả mảng đã sắp.
 *
 * Nối `sortKey` / `sortDir` / `onSortChange` vào `<Table>` (cột có `sortable`). Chuỗi so theo locale vi (có
 * dấu), số theo trị số, ô rỗng luôn xuống cuối (`compareTableSortValues`).
 *
 * @param rows - Dữ liệu gốc; chưa chọn cột thì `sorted` là đúng mảng này.
 * @param getValue - `(row, key) => giá trị ô` dùng để so; nên ổn định reference (`useCallback`).
 * @returns `{ sortKey, sortDir, onSortChange, sorted, comparator }` — `comparator` cho bảng cây tự sắp trong
 *   từng cấp; `null` khi chưa chọn cột.
 *
 * @example
 * const { sortKey, sortDir, onSortChange, sorted } = useTableSort(rows, (row, key) => row[key]);
 * <Table columns={columns} data={sorted} sortKey={sortKey} sortDir={sortDir} onSortChange={onSortChange} />
 */
export function useTableSort<TData>(
  rows: TData[],
  getValue: (row: TData, key: string) => TableSortValue,
): UseTableSortResult<TData> {
  const [sort, setSort] = useState<{ key: string; dir: TableSortDir } | null>(null);

  const onSortChange = useCallback((key: string | null, dir: TableSortDir | null) => {
    setSort(key && dir ? { key, dir } : null);
  }, []);

  const comparator = useMemo(() => {
    if (!sort) return null;
    return (a: TData, b: TData) =>
      compareTableSortValues(getValue(a, sort.key), getValue(b, sort.key), sort.dir);
  }, [sort, getValue]);

  const sorted = useMemo(
    () => (comparator ? [...rows].sort(comparator) : rows),
    [rows, comparator],
  );

  return {
    sortKey: sort?.key ?? null,
    sortDir: sort?.dir ?? null,
    onSortChange,
    sorted,
    comparator,
  };
}

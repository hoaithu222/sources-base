import type { TableColumn } from '../table.types';

export interface HeaderGroupSpan {
  key: string;
  label?: React.ReactNode;
  /** Vị trí cột đầu của nhóm trong mảng `columns`. */
  start: number;
  span: number;
  /** `false` = cột lẻ không thuộc nhóm nào → trải dọc 2 tầng. */
  grouped: boolean;
}

/** Gom cột thành ô của TẦNG HEADER TRÊN; `null` khi KHÔNG cột nào khai `group` (giữ header 1 dòng). */
export function buildHeaderGroups<TData>(columns: TableColumn<TData>[]): HeaderGroupSpan[] | null {
  if (!columns.some((col) => col.group)) return null;

  const spans: HeaderGroupSpan[] = [];
  columns.forEach((col, index) => {
    const last = spans[spans.length - 1];
    if (col.group && last?.grouped && last.key === col.group.key) {
      last.span += 1;
      return;
    }
    spans.push(
      col.group
        ? { key: col.group.key, label: col.group.label, start: index, span: 1, grouped: true }
        : { key: `solo:${col.key}`, start: index, span: 1, grouped: false },
    );
  });

  return spans;
}

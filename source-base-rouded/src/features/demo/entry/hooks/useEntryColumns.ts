import { createElement, useMemo } from 'react';

import {
  TABLE_ENTRY_CELL_CLASSES,
  TABLE_ENTRY_CONTROL_SIZE,
  type TableColumn,
  type TableEntryDensity,
} from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import EntryCell from '../components/EntryCell';
import type { EntryField, EntryRow } from '../constants/entry.constants';
import type { EntrySheet } from './useEntrySheet';

const amountOf = (row: EntryRow) => (row.qty ?? 0) * (row.price ?? 0);

/** Cột nhập theo loại dữ liệu (data-entry-table.md §4): mã 128 · tên ≥ 240 · ĐVT 112 · số 120–140 · ghi chú 200. */
const INPUT_COLUMNS: readonly {
  field: EntryField;
  header: string;
  width: number;
  numeric?: boolean;
}[] = [
  { field: 'code', header: 'Mã vật tư', width: 128 },
  { field: 'name', header: 'Tên vật tư', width: 260 },
  { field: 'unit', header: 'ĐVT', width: 112 },
  { field: 'qty', header: 'Số lượng', width: 120, numeric: true },
  { field: 'price', header: 'Đơn giá (₫)', width: 140, numeric: true },
];

/**
 * useEntryColumns — cột của bảng nhập mẫu: STT · Mã · Tên · ĐVT · Số lượng · Đơn giá · Thành tiền (TÍNH TOÁN) · Ghi chú.
 * Ô nhập: `px-1` (control lấp ô), header `px-2`; số căn phải; cột tính toán `TABLE_ENTRY_CELL_CLASSES.derived`.
 *
 * Dùng:   const columns = useEntryColumns(sheet, density);  → `<Table columns={columns} … />`
 */
export function useEntryColumns(sheet: EntrySheet, density: TableEntryDensity) {
  const { errors, isDirty, update } = sheet;
  const size = TABLE_ENTRY_CONTROL_SIZE[density];

  return useMemo<TableColumn<EntryRow>[]>(() => {
    const inputColumn = (field: EntryField, header: string, width: number, numeric = false) => ({
      key: field,
      header,
      width,
      align: numeric ? ('right' as const) : ('left' as const),
      cellClassName: TABLE_ENTRY_CELL_CLASSES.input,
      headerCellClassName: TABLE_ENTRY_CELL_CLASSES.header,
      cell: (row: EntryRow) =>
        createElement(EntryCell, {
          row,
          field,
          size,
          dirty: isDirty(row, field),
          error: errors.get(row.id)?.[field],
          onChange: update,
        }),
    });

    return [
      {
        key: 'stt',
        header: '#',
        width: 48,
        align: 'right',
        cell: (_row, index) => index + 1,
        cellClassName: 'tabular-nums text-fg-muted',
      },
      ...INPUT_COLUMNS.map((col) => inputColumn(col.field, col.header, col.width, col.numeric)),
      {
        key: 'amount',
        header: 'Thành tiền (₫)',
        width: 152,
        align: 'right',
        cellClassName: TABLE_ENTRY_CELL_CLASSES.derived,
        cell: (row) => formatNumber(amountOf(row)),
      },
      inputColumn('note', 'Ghi chú', 200),
    ];
  }, [errors, isDirty, size, update]);
}

/** Dòng tổng: cộng số lượng khác ĐVT là vô nghĩa — chỉ cộng THÀNH TIỀN; nhãn ở cột mã. */
export function entryFooterCell(rows: readonly EntryRow[]) {
  const total = rows.reduce((sum, row) => sum + amountOf(row), 0);
  return (column: TableColumn<EntryRow>) => {
    if (column.key === 'code') return `Tổng ${rows.length} dòng`;
    if (column.key === 'amount') return formatNumber(total);
    return null;
  };
}

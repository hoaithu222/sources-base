import { memo } from 'react';

import {
  Dropdown,
  Input,
  NumberInput,
  TABLE_ENTRY_CELL_STATE_CLASSES,
  type FieldSize,
} from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { ENTRY_UNIT_OPTIONS, type EntryField, type EntryRow } from '../constants/entry.constants';

interface EntryCellProps {
  row: EntryRow;
  field: EntryField;
  size: FieldSize;
  dirty: boolean;
  error?: string;
  onChange: <K extends EntryField>(id: string, field: K, value: EntryRow[K]) => void;
}

const LABELS = {
  code: 'Mã vật tư',
  name: 'Tên vật tư',
  unit: 'Đơn vị tính',
  qty: 'Số lượng',
  price: 'Đơn giá',
  note: 'Ghi chú',
} satisfies Record<EntryField, string>;

/**
 * EntryCell — một ô NHẬP của bảng nhập mẫu: control lấp ô theo trường (`Input` chữ · `NumberInput` số, căn phải, tách
 * nghìn · `Dropdown` ĐVT) bọc dấu "đã sửa chưa lưu" (`TABLE_ENTRY_CELL_STATE_CLASSES.dirty`); lỗi qua `invalid` + `title`.
 *
 * Lưu ý: lỗi KHÔNG xoá chữ đã gõ; `aria-label` của control = tên cột (ô bảng không có `<label>` riêng).
 *
 * @param props.row - Dòng đang vẽ.
 * @param props.field - Trường của ô (`EntryField`).
 * @param props.size - Cỡ control theo mật độ (`TABLE_ENTRY_CONTROL_SIZE`).
 * @param props.dirty - Ô đã sửa so với bản đã lưu.
 * @param props.error - Câu báo lỗi của ô; có → viền đỏ + `title`.
 * @param props.onChange - Ghi giá trị mới: `(id, field, value)`.
 *
 * @example
 * <EntryCell dirty field="qty" row={row} size="sm" onChange={sheet.update} />
 */
const EntryCell = memo(function EntryCell({
  row,
  field,
  size,
  dirty,
  error,
  onChange,
}: EntryCellProps) {
  const shared = { 'aria-label': LABELS[field], invalid: Boolean(error), size, title: error };

  let control: React.ReactNode;
  if (field === 'qty' || field === 'price') {
    control = (
      <NumberInput
        {...shared}
        allowDecimal={field === 'qty'}
        className="text-right tabular-nums"
        decimalScale={field === 'qty' ? 3 : 0}
        hideStepper
        thousandSeparator
        value={row[field]}
        onChange={(value) => onChange(row.id, field, value)}
      />
    );
  } else if (field === 'unit') {
    control = (
      <Dropdown
        aria-label={LABELS.unit}
        className="min-w-0"
        options={ENTRY_UNIT_OPTIONS}
        size={size}
        value={row.unit}
        onValueChange={(value) => onChange(row.id, 'unit', value)}
      />
    );
  } else {
    control = (
      <Input
        {...shared}
        value={row[field]}
        onChange={(e) => onChange(row.id, field, e.target.value)}
      />
    );
  }

  return (
    <span className={cn('block', dirty && TABLE_ENTRY_CELL_STATE_CLASSES.dirty)}>{control}</span>
  );
});

export default EntryCell;

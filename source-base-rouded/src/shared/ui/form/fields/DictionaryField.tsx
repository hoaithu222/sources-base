import { useState } from 'react';
import Button from '@/shared/ui/actions/Button';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Input from '@/shared/ui/inputs/Input';
import { cn } from '@/shared/utils/style/cn';
import { useFormField } from './hooks/useFormField';
import FieldReadOnly from '../field-read-only';
import FormItem from '../FormItem';

interface DictionaryEntry {
  key: string;
  value: string;
}

interface DictionaryRow extends DictionaryEntry {
  /** Id cục bộ của dòng — làm `key` ổn định khi xoá / thêm dòng giữa chừng. */
  id: number;
}

export interface DictionaryFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

interface DictionaryFieldRowProps {
  row: DictionaryRow;
  index: number;
  autoFocus: boolean;
  disabled?: boolean;
  keyPlaceholder: string;
  valuePlaceholder: string;
  onChange: (id: number, patch: Partial<DictionaryEntry>) => void;
  onRemove: (id: number) => void;
}

const DICTIONARY_FIELD_ROW_CLASSES = 'flex items-center gap-2';

const DICTIONARY_FIELD_REMOVE_CLASSES = cn(
  'w-9 shrink-0 px-0 text-fg-muted',
  'hover:bg-error/10 hover:text-error',
  'active:bg-error/20',
);

const DICTIONARY_FIELD_ADD_CLASSES =
  'border-dashed hover:border-action-base hover:text-action-base';

let nextRowId = 0;

function toEntries(value: unknown): DictionaryEntry[] {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value).map(([key, v]) => ({ key, value: v == null ? '' : String(v) }));
}

const toRows = (value: unknown): DictionaryRow[] =>
  toEntries(value).map((entry) => ({ ...entry, id: nextRowId++ }));

function toRecord(entries: DictionaryEntry[]): Record<string, string> {
  const record: Record<string, string> = {};
  for (const { key, value } of entries) {
    if (key) record[key] = value;
  }
  return record;
}

function sameRecord(a: Record<string, string>, b: Record<string, string>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => b[key] === a[key]);
}

/**
 * DictionaryFieldRow — một dòng khoá + giá trị + nút xoá của `DictionaryField` (phần con nội bộ).
 *
 * @param props.row - Dòng đang vẽ `{ id, key, value }`.
 * @param props.index - Thứ tự dòng (tính từ 0) — dùng cho tên trợ năng "Khoá dòng N".
 * @param props.autoFocus - `true` → focus ô khoá khi dòng vừa được thêm.
 * @param props.disabled - `true` → khoá hai ô và nút xoá.
 * @param props.keyPlaceholder - Chữ mờ của ô khoá.
 * @param props.valuePlaceholder - Chữ mờ của ô giá trị.
 * @param props.onChange - `(id, { key?, value? })` khi gõ vào một trong hai ô.
 * @param props.onRemove - `(id)` khi bấm nút xoá.
 *
 * @example
 * <DictionaryFieldRow row={row} index={0} autoFocus={false} keyPlaceholder="key" valuePlaceholder="value"
 *   onChange={updateRow} onRemove={removeRow} />
 */
function DictionaryFieldRow({
  row,
  index,
  autoFocus,
  disabled,
  keyPlaceholder,
  valuePlaceholder,
  onChange,
  onRemove,
}: DictionaryFieldRowProps) {
  return (
    <div className={DICTIONARY_FIELD_ROW_CLASSES}>
      <Input
        aria-label={`Khoá dòng ${index + 1}`}
        autoFocus={autoFocus}
        disabled={disabled}
        placeholder={keyPlaceholder}
        value={row.key}
        wrapperClassName="flex-1"
        onChange={(e) => onChange(row.id, { key: e.target.value })}
      />
      <Input
        aria-label={`Giá trị dòng ${index + 1}`}
        disabled={disabled}
        placeholder={valuePlaceholder}
        value={row.value}
        wrapperClassName="flex-1"
        onChange={(e) => onChange(row.id, { value: e.target.value })}
      />
      <Button
        aria-label={`Xoá dòng ${row.key || index + 1}`}
        className={DICTIONARY_FIELD_REMOVE_CLASSES}
        disabled={disabled}
        size="md"
        skin="neutral"
        title="Xoá dòng"
        type="button"
        variant="ghost"
        onClick={() => onRemove(row.id)}
      >
        <SystemIcon name="trash-can-outline" size={16} />
      </Button>
    </div>
  );
}

/**
 * DictionaryField — field khoá–giá trị động: mỗi dòng một cặp khoá + giá trị, giá trị form là
 * `Record<string, string>` (thuộc tính bổ sung, metadata, header…).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện danh sách `khoá: giá trị`. Dòng mới ("Thêm thuộc tính") hiện
 * ngay (ô khoá được focus) nhưng chỉ vào giá trị form khi đã có khoá — dòng còn trống khoá là dòng NHÁP chỉ
 * sống trong field; khoá trùng thì dòng sau thắng. Danh sách object có cấu trúc cố định → `FieldArray`.
 * Sửa giao diện: dòng → `DICTIONARY_FIELD_ROW_CLASSES` · nút xoá → `DICTIONARY_FIELD_REMOVE_CLASSES` · nút
 * thêm (viền đứt, rộng hết khung) → `DICTIONARY_FIELD_ADD_CLASSES`.
 * Lưu ý: `form.reset()` / `setValue` từ ngoài với nội dung khác sẽ dựng lại các dòng (dòng chưa có khoá bị bỏ).
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `Record<string, string>`.
 * @param props.label - Nhãn phía trên các dòng; thành tên của nhóm cho trình đọc màn hình.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới nhóm; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.disabled - `true` → khoá mọi ô và nút.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.keyPlaceholder - Chữ mờ của ô khoá. Mặc định `key`.
 * @param props.valuePlaceholder - Chữ mờ của ô giá trị. Mặc định `value`.
 *
 * @example
 * <DictionaryField name="attrs" label="Thuộc tính" keyPlaceholder="Khoá" valuePlaceholder="Giá trị" />
 */
function DictionaryField({
  name,
  label,
  required,
  description,
  disabled,
  className,
  keyPlaceholder = 'key',
  valuePlaceholder = 'value',
}: DictionaryFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const [rows, setRows] = useState<DictionaryRow[]>(() => toRows(field.value));
  const [focusRowId, setFocusRowId] = useState<number | null>(null);
  const { onChange } = field;

  const formRecord = toRecord(toEntries(field.value));
  if (!sameRecord(toRecord(rows), formRecord)) setRows(toRows(field.value));

  const commit = (next: DictionaryRow[]) => {
    setRows(next);
    onChange(toRecord(next));
  };

  const addRow = () => {
    const row: DictionaryRow = { id: nextRowId++, key: '', value: '' };
    setFocusRowId(row.id);
    setRows([...rows, row]);
  };

  const updateRow = (id: number, patch: Partial<DictionaryEntry>) =>
    commit(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const removeRow = (id: number) => commit(rows.filter((row) => row.id !== id));

  if (readOnly) {
    const entries = Object.entries(formRecord);
    return (
      <FieldReadOnly className={className} label={label}>
        {entries.length > 0 && (
          <span className="flex flex-col gap-1">
            {entries.map(([key, value]) => (
              <span key={key}>
                <span className="text-fg-muted">{key}:</span> {value}
              </span>
            ))}
          </span>
        )}
      </FieldReadOnly>
    );
  }

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      label={label}
      required={required}
    >
      <div
        aria-describedby={a11y.trigger['aria-describedby']}
        aria-labelledby={a11y.trigger['aria-labelledby']}
        className="flex flex-col gap-2"
        role="group"
      >
        {rows.length === 0 && (
          <p className="text-caption-12 text-fg-muted">Chưa có thuộc tính nào.</p>
        )}
        {rows.map((row, i) => (
          <DictionaryFieldRow
            key={row.id}
            autoFocus={row.id === focusRowId}
            disabled={disabled}
            index={i}
            keyPlaceholder={keyPlaceholder}
            row={row}
            valuePlaceholder={valuePlaceholder}
            onChange={updateRow}
            onRemove={removeRow}
          />
        ))}
        <Button
          className={DICTIONARY_FIELD_ADD_CLASSES}
          disabled={disabled}
          fullWidth
          size="sm"
          skin="neutral"
          startIcon={<SystemIcon name="plus-outline" size={14} />}
          type="button"
          variant="stroke"
          onClick={addRow}
        >
          Thêm thuộc tính
        </Button>
      </div>
    </FormItem>
  );
}

export default DictionaryField;

import { useCallback, useMemo, useState } from 'react';

import { ENTRY_SEED_ROWS, type EntryField, type EntryRow } from '../constants/entry.constants';

const FIELDS: readonly EntryField[] = ['code', 'name', 'unit', 'qty', 'price', 'note'];

/** Lỗi của một dòng theo trường — chuỗi là câu báo hiện dưới ô / trong `title`. */
type RowErrors = Partial<Record<EntryField, string>>;

function validateRow(row: EntryRow, rows: readonly EntryRow[]): RowErrors {
  const errors: RowErrors = {};
  const code = row.code.trim();
  if (!code) errors.code = 'Nhập mã vật tư';
  else if (rows.some((other) => other.id !== row.id && other.code.trim() === code)) {
    errors.code = 'Mã đã có ở dòng khác';
  }
  if (!row.name.trim()) errors.name = 'Nhập tên vật tư';
  if (row.qty === null || row.qty <= 0) errors.qty = 'Số lượng phải > 0';
  if (row.price === null || row.price < 0) errors.price = 'Nhập đơn giá';
  return errors;
}

/** Dòng nháp chưa gõ gì — không tính là thay đổi, không chặn lưu (bỏ qua khi lưu). */
const isBlankDraft = (row: EntryRow) =>
  Boolean(row.draft) && !row.code && !row.name && row.qty === null && row.price === null;

let draftSeq = 0;

const newDraft = (): EntryRow => ({
  id: `draft-${(draftSeq += 1)}`,
  code: '',
  name: '',
  unit: 'cai',
  qty: null,
  price: null,
  note: '',
  draft: true,
});

/**
 * useEntrySheet — state của bảng nhập mẫu: dòng đang sửa, bản đã lưu (để biết ô nào "đã sửa chưa lưu"), lỗi theo ô, dòng
 * nháp, lưu cả phiếu.
 *
 * Dùng:   const sheet = useEntrySheet();  sheet.update(id, 'qty', 12) · sheet.addDraft() · sheet.save() → số dòng đã lưu
 * Lưu ý:  lỗi KHÔNG xoá chữ người dùng đã gõ; dòng nháp bỏ trống hoàn toàn thì không chặn lưu (bỏ qua khi lưu).
 */
export function useEntrySheet() {
  const [rows, setRows] = useState<EntryRow[]>(() => ENTRY_SEED_ROWS.map((row) => ({ ...row })));
  const [saved, setSaved] = useState<readonly EntryRow[]>(ENTRY_SEED_ROWS);

  const savedById = useMemo(() => new Map(saved.map((row) => [row.id, row])), [saved]);

  const isDirty = useCallback(
    (row: EntryRow, field: EntryField) => {
      const base = savedById.get(row.id);
      return base === undefined
        ? row[field] !== null && row[field] !== ''
        : base[field] !== row[field];
    },
    [savedById],
  );

  const errors = useMemo(() => {
    const map = new Map<string, RowErrors>();
    for (const row of rows) if (!isBlankDraft(row)) map.set(row.id, validateRow(row, rows));
    return map;
  }, [rows]);

  const dirtyCount = useMemo(
    () => rows.filter((row) => !isBlankDraft(row) && FIELDS.some((f) => isDirty(row, f))).length,
    [rows, isDirty],
  );
  const errorCount = useMemo(
    () => [...errors.values()].filter((e) => Object.keys(e).length > 0).length,
    [errors],
  );

  const update = useCallback(<K extends EntryField>(id: string, field: K, value: EntryRow[K]) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }, []);

  const addDraft = useCallback(() => setRows((prev) => [...prev, newDraft()]), []);

  const save = useCallback((): number => {
    const kept = rows.filter((row) => !isBlankDraft(row)).map((row) => ({ ...row, draft: false }));
    setRows(kept);
    setSaved(kept);
    return dirtyCount;
  }, [rows, dirtyCount]);

  return { rows, errors, isDirty, dirtyCount, errorCount, update, addDraft, save };
}

export type EntrySheet = ReturnType<typeof useEntrySheet>;

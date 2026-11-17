'use client';

import { useContext } from 'react';
import { FormMetaContext } from '../../form.context';

/**
 * useFormMeta — đọc cờ `<Form>` cấp xuống: `readOnly` (form chỉ đọc) và `autoSave` (đang tự lưu nháp).
 *
 * Gọi trong cây `<Form>` / `FormModal`; ngoài cây trả mặc định `{ readOnly: false, autoSave: false }`. Field tự
 * dựng thường lấy `readOnly` qua `useFormField` — chỉ gọi hook này khi không dùng `useFormField`.
 *
 * @returns `{ readOnly, autoSave }`.
 *
 * @example
 * const { readOnly } = useFormMeta();
 */
export function useFormMeta() {
  return useContext(FormMetaContext);
}

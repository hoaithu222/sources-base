'use client';

import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

interface UseModalDateDefaultsOptions<T extends FieldValues> {
  form: UseFormReturn<T>;
  open: boolean;
  fields: Path<T>[];
  value?: 'today' | Date | string;
  format?: string;
}

/**
 * useModalDateDefaults — điền ngày mặc định vào các field ngày còn RỖNG mỗi lần modal chuyển đóng → mở.
 *
 * Gọi trong component modal, SAU `form.reset(...)` của modal. Không đè giá trị đã có (`defaultValues` của chế
 * độ sửa, ngày người dùng đã chọn); không làm form "đã sửa" (`shouldDirty: false`).
 * Lưu ý: chỉ phản ứng theo `open` — đổi `fields` / `value` / `format` khi modal đang mở không có tác dụng tới
 * lần mở sau.
 *
 * @param options.form - Kết quả `useZodForm()` / `useForm()`.
 * @param options.open - Modal đang mở?
 * @param options.fields - Tên các field ngày cần điền.
 * @param options.value - `'today'` | `Date` | chuỗi đã định dạng sẵn. Mặc định `'today'`.
 * @param options.format - Định dạng dayjs khi `value` là `'today'` / `Date`. Mặc định `YYYY-MM-DD`.
 *
 * @example
 * useModalDateDefaults({ form, open, fields: ['startDate', 'endDate'] });
 */
export function useModalDateDefaults<T extends FieldValues>({
  form,
  open,
  fields,
  value = 'today',
  format = 'YYYY-MM-DD',
}: UseModalDateDefaultsOptions<T>) {
  const prevOpen = useRef(false);

  useEffect(() => {
    if (!open) {
      prevOpen.current = false;
      return;
    }
    if (prevOpen.current) return;
    prevOpen.current = true;

    const resolved =
      value === 'today'
        ? dayjs().format(format)
        : value instanceof Date
          ? dayjs(value).format(format)
          : value;

    fields.forEach((field) => {
      const current = form.getValues(field);
      if (current == null || current === '') {
        form.setValue(field, resolved as never, {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ phụ thuộc `open`: fields/value/format hiếm đổi
  }, [open]);
}

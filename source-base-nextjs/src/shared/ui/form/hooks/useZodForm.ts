'use client';

import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type FieldValues,
  type Resolver,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type ZodSchemaInput = Parameters<typeof zodResolver>[0];

/**
 * useZodForm — `useForm` của react-hook-form gắn sẵn `zodResolver(schema)`; cách tạo form chuẩn của UI kit.
 *
 * Kết quả truyền cho `<Form form={form}>`. Mặc định `mode: 'onTouched'` (báo lỗi sau khi rời ô lần đầu, rồi
 * kiểm lại theo từng lần gõ) và `shouldFocusError: true`; truyền trong `options` để đổi.
 * Lưu ý: đừng đổi `mode` sang `onBlur` — lỗi đã sửa vẫn treo tới lần blur kế (notes/components/form.md).
 * Schema text bắt buộc theo docs/rules/data/form-validation.md (`.trim().min(1)`).
 *
 * @param schema - Schema Zod của form.
 * @param options - Tuỳ chọn `useForm` (trừ `resolver`), vd `{ defaultValues }`.
 * @returns `UseFormReturn<T>` của react-hook-form.
 *
 * @example
 * const form = useZodForm<Values>(schema, { defaultValues: { name: '' } });
 */
export function useZodForm<T extends FieldValues>(
  schema: ZodSchemaInput,
  options?: Omit<UseFormProps<T>, 'resolver'>,
): UseFormReturn<T, unknown, T> {
  return useForm<T, unknown, T>({
    ...options,
    resolver: zodResolver(schema) as Resolver<T, unknown, T>,
    mode: options?.mode ?? 'onTouched',
    shouldFocusError: options?.shouldFocusError ?? true,
  });
}

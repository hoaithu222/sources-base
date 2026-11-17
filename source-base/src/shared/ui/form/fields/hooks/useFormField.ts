import { useController, type FieldPath, type FieldValues } from 'react-hook-form';
import type { FieldA11yOptions } from '../field-a11y.utils';
import { useFieldA11y } from './useFieldA11y';
import { useFormMeta } from './useFormMeta';

/**
 * useFormField — hook lõi của mọi field UI kit: nối react-hook-form (bọc `useController`), lấy câu lỗi, cấp bộ id
 * trợ năng và cờ `readOnly` của `<Form>`.
 *
 * Gọi trong cây `<Form>`. Nối `field.ref` vào control focus được để `form.setFocus(name)` và focus ô lỗi khi
 * gửi tới được. Spread `a11y.item` vào `<FormItem>`, `a11y.input` vào `<input>` thật (kèm `htmlFor={a11y.id}`),
 * `a11y.trigger` vào control không phải ô nhập — chi tiết ở `useFieldA11y`.
 *
 * @param name - Tên field (đường dẫn react-hook-form, vd `address.city`).
 * @param options.label - Nhãn của field; có thì `a11y.trigger` mang `aria-labelledby`.
 * @param options.description - Dòng mô tả; có thì được nối vào `aria-describedby`.
 * @returns `{ field, fieldState, formState, error, a11y, readOnly }` — ba giá trị đầu của `useController`,
 *   `error` = câu lỗi hiện tại, `a11y` của `useFieldA11y`, `readOnly` từ `<Form readOnly>`.
 *
 * @example
 * const { field, error, a11y, readOnly } = useFormField(name, { label, description });
 * <FormItem {...a11y.item} error={error} htmlFor={a11y.id} label={label}>
 *   <Input {...field} {...a11y.input} invalid={Boolean(error)} />
 * </FormItem>
 */
export function useFormField(
  name: string,
  { label, description }: Omit<FieldA11yOptions, 'error'> = {},
) {
  const { field, fieldState, formState } = useController({
    name: name as FieldPath<FieldValues>,
  });
  const { readOnly } = useFormMeta();
  const error = fieldState.error?.message;
  const a11y = useFieldA11y({ label, description, error });
  return { field, fieldState, formState, error, a11y, readOnly };
}

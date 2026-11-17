import { useId } from 'react';
import { buildFieldA11y, type FieldA11y, type FieldA11yOptions } from '../field-a11y.utils';

/**
 * useFieldA11y — cấp bộ id nối NHÃN ↔ Ô NHẬP ↔ MÔ TẢ / LỖI cho một field tự dựng trên `FormItem`.
 *
 * Spread `item` vào `<FormItem>`; `input` vào `<input>` / `<textarea>` thật (kèm `htmlFor={id}` trên
 * FormItem); `trigger` vào control không phải ô nhập (combobox Radix, switch, nút mở popover).
 * Lưu ý: không có `label` thì `trigger` không mang `aria-labelledby` (trỏ vào phần tử không có sẽ xoá trắng
 * tên trợ năng); `aria-describedby` liệt kê lỗi TRƯỚC mô tả (notes/components/form.md).
 *
 * @param options.label - Nhãn hiển thị của field.
 * @param options.description - Dòng mô tả (có thì được nối vào `aria-describedby`).
 * @param options.error - Câu lỗi hiện tại (có thì nối vào `aria-describedby` + `aria-invalid`).
 * @returns `{ id, item, input, trigger }` — id ổn định giữa các lần render (`useId`).
 *
 * @example
 * const a11y = useFieldA11y({ label, description, error });
 * <FormItem {...a11y.item} htmlFor={a11y.id} label={label} description={description} error={error}>
 *   <Input {...a11y.input} />
 * </FormItem>
 */
export function useFieldA11y(options: FieldA11yOptions = {}): FieldA11y {
  return buildFieldA11y(useId(), options);
}

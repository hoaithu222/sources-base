/**
 * field-a11y.utils — dựng bộ id nối NHÃN ↔ Ô NHẬP ↔ MÔ TẢ / LỖI của một field từ một tiền tố id.
 *
 * Dùng:   buildFieldA11y(useId(), { label, description, error }) — `useFieldA11y` bọc sẵn đúng lời gọi này;
 *         field nhiều ô (CascadeSelectField) gọi trực tiếp, mỗi ô một tiền tố riêng.
 * Lưu ý:  `aria-describedby` liệt kê lỗi TRƯỚC mô tả; không có `label` thì `trigger` không mang `aria-labelledby`.
 */

export interface FieldA11yOptions {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export interface FieldItemA11y {
  labelId: string;
  descriptionId: string;
  errorId: string;
}

export interface FieldInputA11y {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
}

export interface FieldTriggerA11y extends FieldInputA11y {
  'aria-labelledby'?: string;
}

export interface FieldA11y {
  id: string;
  item: FieldItemA11y;
  input: FieldInputA11y;
  trigger: FieldTriggerA11y;
}

/** `{ id, item, input, trigger }` từ tiền tố `uid` — id: `${uid}field` · `${uid}label` · `${uid}desc` · `${uid}error`. */
export function buildFieldA11y(
  uid: string,
  { label, description, error }: FieldA11yOptions = {},
): FieldA11y {
  const id = `${uid}field`;
  const labelId = `${uid}label`;
  const descriptionId = `${uid}desc`;
  const errorId = `${uid}error`;

  const describedBy =
    [error ? errorId : null, description ? descriptionId : null].filter(Boolean).join(' ') ||
    undefined;

  const input: FieldInputA11y = {
    id,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  };

  return {
    id,
    item: { labelId, descriptionId, errorId },
    input,
    trigger: { ...input, 'aria-labelledby': label ? labelId : undefined },
  };
}

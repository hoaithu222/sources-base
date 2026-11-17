import Textarea, { type TextareaSize } from '@/shared/ui/inputs/Textarea';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface TextareaFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
  minHeight?: number | string;
  size?: TextareaSize;
}

/**
 * TextareaField — ô nhập nhiều dòng nối sẵn react-hook-form (ghi chú, mô tả); bọc `Textarea` của UI kit.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện chữ (giữ xuống dòng) thay cho ô.
 * Lưu ý: `maxLength` phải bằng `.max()` của Zod cùng field (Zod chỉ báo lỗi SAU khi đã gõ thừa).
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.rows - Số dòng hiển thị ban đầu (thuộc tính `rows` của `<textarea>`).
 * @param props.maxLength - Chặn gõ quá số ký tự này ngay tại trình duyệt.
 * @param props.showCount - Ép hiện (`true`) / ẩn (`false`) bộ đếm ký tự. Mặc định: tự hiện khi có `maxLength`.
 * @param props.minHeight - Chiều cao tối thiểu riêng: số = px, hoặc chuỗi CSS (`'8rem'`); thắng `size`.
 * @param props.size - Chiều cao tối thiểu: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 *
 * @example
 * <TextareaField name="note" label="Ghi chú" rows={4} maxLength={500} />
 */
function TextareaField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  rows,
  maxLength,
  showCount,
  minHeight,
  size,
}: TextareaFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {String(field.value ?? '')}
      </FieldReadOnly>
    );
  }

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      htmlFor={a11y.id}
      label={label}
      required={required}
    >
      <Textarea
        {...field}
        {...a11y.input}
        disabled={disabled}
        invalid={Boolean(error)}
        maxLength={maxLength}
        minHeight={minHeight}
        placeholder={placeholder}
        rows={rows}
        showCount={showCount}
        size={size}
      />
    </FormItem>
  );
}

export default TextareaField;

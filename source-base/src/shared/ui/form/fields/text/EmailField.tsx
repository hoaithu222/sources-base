import Input from '@/shared/ui/inputs/Input';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface EmailFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  size?: FieldSize;
  showIcon?: boolean;
}

/**
 * EmailField — ô email nối sẵn react-hook-form: `type="email"` · `autoComplete="email"` ·
 * `inputMode="email"` · tắt kiểm chính tả · tối đa 254 ký tự.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện chữ thay cho ô.
 * Lưu ý: kiểm hợp lệ bằng Zod `emailField()` — docs/rules/data/form-validation.md §3.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form, vd `contact.email`).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống. Mặc định `email@domain.com`.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.autoFocus - `true` → focus ngay khi hiện.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.showIcon - Hiện icon phong thư ở đầu ô. Mặc định `true`.
 *
 * @example
 * <EmailField name="email" label="Email" required />
 */
function EmailField({
  name,
  label,
  required,
  description,
  placeholder = 'email@domain.com',
  disabled,
  className,
  autoFocus,
  size,
  showIcon = true,
}: EmailFieldProps) {
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
      <Input
        {...field}
        {...a11y.input}
        autoComplete="email"
        autoFocus={autoFocus}
        disabled={disabled}
        inputMode="email"
        invalid={Boolean(error)}
        maxLength={254}
        placeholder={placeholder}
        size={size}
        spellCheck={false}
        startIcon={showIcon ? <SystemIcon name="envelope-outline" size={16} /> : undefined}
        type="email"
      />
    </FormItem>
  );
}

export default EmailField;

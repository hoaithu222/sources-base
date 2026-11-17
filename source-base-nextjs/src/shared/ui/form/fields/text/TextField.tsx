'use client';

import Input from '@/shared/ui/inputs/Input';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface TextFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type?: 'text' | 'email' | 'tel' | 'url' | 'search';
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  autoFocus?: boolean;
  size?: FieldSize;
  maxLength?: number;
}

/**
 * TextField — ô nhập một dòng nối sẵn react-hook-form; dùng cho chữ tự do (tên, mã, tiêu đề…).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện chữ thay cho ô. Email → `EmailField`, số điện thoại →
 * `PhoneField`, số → `NumberField`, nhiều dòng → `TextareaField`.
 * Lưu ý: `maxLength` phải bằng `.max()` của Zod cùng field (Zod chỉ báo lỗi SAU khi đã gõ thừa).
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form, vd `address.city`).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.type - Kiểu ô: `text` | `email` | `tel` | `url` | `search`. Mặc định `text`.
 * @param props.startIcon - Icon đầu ô (thường là `<SystemIcon />`).
 * @param props.endIcon - Icon / nút cuối ô.
 * @param props.autoFocus - `true` → focus ngay khi hiện.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.maxLength - Chặn gõ quá số ký tự này ngay tại trình duyệt.
 *
 * @example
 * <TextField name="title" label="Tiêu đề" required maxLength={200} />
 *
 * <TextField name="keyword" label="Từ khoá" startIcon={<SystemIcon name="magnifying-glass-outline" />} />
 */
function TextField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  type = 'text',
  startIcon,
  endIcon,
  autoFocus,
  size,
  maxLength,
}: TextFieldProps) {
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
        autoFocus={autoFocus}
        disabled={disabled}
        endIcon={endIcon}
        invalid={Boolean(error)}
        maxLength={maxLength}
        placeholder={placeholder}
        size={size}
        startIcon={startIcon}
        type={type}
      />
    </FormItem>
  );
}

export default TextField;

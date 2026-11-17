'use client';

import { useTranslations } from 'next-intl';
import Checkbox from '@/shared/ui/inputs/Checkbox';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface CheckboxFieldProps {
  name: string;
  label?: string;
  checkboxLabel?: React.ReactNode;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * CheckboxField — một ô tick nối react-hook-form, giá trị `boolean` (đồng ý điều khoản, ghi nhớ…).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện "Có" / "Không". Bật / tắt một thiết lập có hiệu lực ngay →
 * `ToggleField`.
 * Lưu ý: truyền CẢ HAI nhãn thì tên trợ năng là chuỗi NỐI của hai nhãn — muốn gọn thì chọn một.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `boolean`.
 * @param props.label - Nhãn phía TRÊN ô tick (của `FormItem`).
 * @param props.checkboxLabel - Chữ ngay CẠNH ô tick; bấm vào chữ cũng tick được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 *
 * @example
 * <CheckboxField name="agree" checkboxLabel="Tôi đồng ý điều khoản" />
 */
function CheckboxField({
  name,
  label,
  checkboxLabel,
  required,
  description,
  disabled,
  className,
}: CheckboxFieldProps) {
  const t = useTranslations('ui.common');
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const checked = Boolean(field.value);

  const { onBlur, onChange, ref } = field;

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {checked ? t('yes') : t('no')}
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
      <Checkbox
        ref={ref}
        {...a11y.input}
        checked={checked}
        disabled={disabled}
        label={checkboxLabel}
        onBlur={onBlur}
        onCheckedChange={(val) => onChange(Boolean(val))}
      />
    </FormItem>
  );
}

export default CheckboxField;

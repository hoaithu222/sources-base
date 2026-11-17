'use client';

import { useTranslations } from 'next-intl';
import Toggle, { type ToggleSize } from '@/shared/ui/inputs/Toggle';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface ToggleFieldProps {
  name: string;
  label?: string;
  toggleLabel?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  size?: ToggleSize;
  className?: string;
}

/**
 * ToggleField — công tắc bật / tắt (Switch) nối react-hook-form, giá trị `boolean`.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện "Bật" / "Tắt". Xác nhận một điều (đồng ý điều khoản) →
 * `CheckboxField`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `boolean`.
 * @param props.label - Nhãn phía TRÊN công tắc (của `FormItem`); thành tên trợ năng của công tắc.
 * @param props.toggleLabel - Chữ ngay CẠNH công tắc.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới công tắc; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.disabled - `true` → khoá công tắc.
 * @param props.size - Cỡ công tắc: `sm` | `md` | `lg`. Mặc định `md`.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 *
 * @example
 * <ToggleField name="notify" label="Thông báo" toggleLabel="Nhận qua email" />
 */
function ToggleField({
  name,
  label,
  toggleLabel,
  required,
  description,
  disabled,
  size,
  className,
}: ToggleFieldProps) {
  const t = useTranslations('ui.form');
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const checked = Boolean(field.value);
  const { onChange, ref } = field;

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {checked ? t('toggle.on') : t('toggle.off')}
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
      <Toggle
        ref={ref}
        aria-describedby={a11y.trigger['aria-describedby']}
        aria-invalid={a11y.trigger['aria-invalid']}
        aria-labelledby={a11y.trigger['aria-labelledby']}
        checked={checked}
        disabled={disabled}
        id={a11y.id}
        label={toggleLabel}
        size={size}
        onCheckedChange={(val) => onChange(val)}
      />
    </FormItem>
  );
}

export default ToggleField;

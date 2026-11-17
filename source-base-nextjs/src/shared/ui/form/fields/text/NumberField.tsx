'use client';

import { useTranslations } from 'next-intl';
import NumberInput from '@/shared/ui/inputs/number-input/NumberInput';
import {
  FIELD_CLEAR_BUTTON_CLASS,
  FIELD_CLEAR_ICON,
  type FieldSize,
} from '@/shared/ui/inputs/field.theme';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface NumberFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  size?: FieldSize;
  clearable?: boolean;
}

const NUMBER_FIELD_CLEAR_CLASSES = cn(
  FIELD_CLEAR_BUTTON_CLASS,
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
);

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

/**
 * NumberField — ô nhập số nối sẵn react-hook-form, bọc `NumberInput`; giá trị lưu dạng `number`
 * (ô trống → `null`).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện số thay cho ô. Cần hiển thị có định dạng (tiền, phần trăm)
 * → dùng `MaskedField`.
 * Sửa giao diện: nút xoá giá trị (dáng ✕ chung `FIELD_CLEAR_BUTTON_CLASS` + vòng focus vì nhận Tab) →
 * `NUMBER_FIELD_CLEAR_CLASSES`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.min - Giá trị nhỏ nhất `NumberInput` cho phép.
 * @param props.max - Giá trị lớn nhất `NumberInput` cho phép.
 * @param props.step - Bước tăng / giảm của nút và phím mũi tên.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.clearable - `true` → nút ✕ đưa giá trị về `0`, chỉ hiện khi giá trị đang khác `0`.
 *   Mặc định `false`.
 *
 * @example
 * <NumberField name="qty" label="Số lượng" min={0} max={100} clearable />
 */
function NumberField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  min,
  max,
  step,
  size,
  clearable,
}: NumberFieldProps) {
  const t = useTranslations('ui.form');
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {String(field.value ?? '')}
      </FieldReadOnly>
    );
  }

  const inputValue = toNumber(field.value);
  const canClear = clearable && !disabled && inputValue !== null && inputValue !== 0;

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
      <NumberInput
        {...field}
        {...a11y.input}
        disabled={disabled}
        invalid={Boolean(error)}
        max={max}
        min={min}
        placeholder={placeholder}
        size={size}
        step={step}
        suffix={
          canClear ? (
            <button
              aria-label={t('number.clear')}
              className={NUMBER_FIELD_CLEAR_CLASSES}
              type="button"
              onClick={() => field.onChange(0)}
              onMouseDown={(e) => e.preventDefault()}
            >
              <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.all} />
            </button>
          ) : undefined
        }
        value={inputValue}
        onChange={(v) => field.onChange(v)}
      />
    </FormItem>
  );
}

export default NumberField;

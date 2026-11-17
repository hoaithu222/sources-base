'use client';

import { NumericFormat, PatternFormat } from 'react-number-format';
import {
  FIELD_CONTROL_CLASS,
  FIELD_HEIGHT,
  fieldSurface,
  type FieldSize,
} from '@/shared/ui/inputs/field.theme';
import { cn } from '@/shared/utils/style/cn';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export type MaskType = 'currency' | 'phone' | 'tax' | 'percent';

export interface MaskedFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  mask?: MaskType;
  format?: string;
  size?: FieldSize;
}

type MaskConfig =
  | { type: 'numeric'; props: Record<string, unknown> }
  | { type: 'pattern'; props: { format: string; mask?: string } };

const MASKED_FIELD_LAYOUT_CLASSES = 'inline-flex items-center gap-2 px-3';

const MASKED_FIELD_INPUT_CLASSES = cn(FIELD_CONTROL_CLASS, 'h-full tabular-nums');

const MASK_CONFIGS = {
  currency: {
    type: 'numeric',
    props: { thousandSeparator: '.', decimalSeparator: ',', suffix: ' ₫', decimalScale: 0 },
  },
  phone: { type: 'pattern', props: { format: '#### ### ###', mask: '_' } },
  tax: { type: 'pattern', props: { format: '##########-###', mask: '_' } },
  percent: { type: 'numeric', props: { suffix: '%', decimalScale: 2, max: 100 } },
} satisfies Record<MaskType, MaskConfig>;

/**
 * MaskedField — ô nhập có mặt nạ (react-number-format): tiền, số điện thoại, mã số thuế, phần trăm
 * hoặc mẫu tuỳ chỉnh.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện giá trị thô thay cho ô. Giá trị lưu là chuỗi KHÔNG kèm
 * ký tự trang trí của mặt nạ (`1500000`, `0912345678`), không phải chuỗi đang hiển thị.
 * Số thuần không cần định dạng → `NumberField`; số điện thoại → `PhoneField`.
 * Sửa giao diện: mặt nạ từng loại → `MASK_CONFIGS` · bố cục ô → `MASKED_FIELD_LAYOUT_CLASSES` (khung /
 * nền / focus lấy từ `fieldSurface`) · ruột ô (số đều nét) → `MASKED_FIELD_INPUT_CLASSES`. `PhoneField` dựng
 * trên file này.
 * Lưu ý: ký tự hằng trong `format` (vd `+` của `+## …`) cũng bị bỏ khỏi giá trị lưu.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.mask - Mặt nạ dựng sẵn: `currency` (`1.500.000 ₫`) | `phone` (`#### ### ###`) | `tax`
 *   (`##########-###`) | `percent` (tối đa 100, 2 số lẻ). Mặc định `currency`.
 * @param props.format - Mẫu riêng của `PatternFormat` (`#` = một chữ số), vd `####-####`; thắng `mask`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 *
 * @example
 * <MaskedField name="amount" label="Số tiền" mask="currency" />
 *
 * <MaskedField name="code" label="Mã hồ sơ" format="####-####" />
 */
function MaskedField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  mask = 'currency',
  format: customFormat,
  size = 'md',
}: MaskedFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {String(field.value ?? '')}
      </FieldReadOnly>
    );
  }

  const wrapperClassName = cn(
    fieldSurface({ focusMode: 'within', invalid: Boolean(error), disabled }),
    MASKED_FIELD_LAYOUT_CLASSES,
    FIELD_HEIGHT[size],
  );

  const sharedInputProps = {
    ...a11y.input,
    value: field.value as string | number | undefined,
    onValueChange: ({ value }: { value: string }) => field.onChange(value),
    onBlur: field.onBlur,
    disabled,
    placeholder,
    className: MASKED_FIELD_INPUT_CLASSES,
    getInputRef: field.ref,
  };

  const renderInput = () => {
    if (customFormat) {
      return <PatternFormat {...sharedInputProps} format={customFormat} mask="_" />;
    }
    const cfg = MASK_CONFIGS[mask];
    if (cfg.type === 'pattern') {
      return <PatternFormat {...sharedInputProps} {...cfg.props} />;
    }
    return <NumericFormat {...sharedInputProps} {...cfg.props} />;
  };

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
      <div className={wrapperClassName}>{renderInput()}</div>
    </FormItem>
  );
}

export default MaskedField;

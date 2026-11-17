import { useCallback, useState } from 'react';
import TimePicker from '@/shared/ui/pickers/time/TimePicker';
import type { TimePickerSize } from '@/shared/ui/pickers/time/TimePicker';
import { useFieldA11y } from '../hooks/useFieldA11y';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface TimeFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: TimePickerSize;
  minuteStep?: number;
  allowManualInput?: boolean;
  commitDelay?: number;
}

/**
 * TimeField — chọn giờ, bọc `TimePicker`; giá trị form là chuỗi `HH:mm` (xoá → `''`).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện giờ thay cho ô. Ngày → `DateField`.
 * Lưu ý: lỗi cú pháp khi gõ tay (vd "2400") do `TimePicker` báo và giữ ở field, không đi qua schema Zod.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi chưa chọn. Mặc định `HH:mm`.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.minuteStep - Bước phút trong danh sách chọn. Mặc định `1`.
 * @param props.allowManualInput - `true` → gõ giờ thẳng vào ô. Mặc định `true`.
 * @param props.commitDelay - Ngừng gõ bao lâu (ms) thì tự kiểm + lưu; `0` = chỉ chốt bằng Enter / rời ô.
 *   Mặc định `500`.
 *
 * @example
 * <TimeField name="startTime" label="Giờ bắt đầu" minuteStep={15} />
 */
function TimeField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  size,
  minuteStep,
  allowManualInput,
  commitDelay,
}: TimeFieldProps) {
  const { field, fieldState, readOnly } = useFormField(name);
  const [parseError, setParseError] = useState<string | null>(null);
  const error = fieldState.error?.message ?? parseError ?? undefined;
  const a11y = useFieldA11y({ label, description, error });
  const value = (field.value as string | null | undefined) ?? '';

  const handleChange = useCallback((next: string | null) => field.onChange(next ?? ''), [field]);

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {value}
      </FieldReadOnly>
    );
  }

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      label={label}
      required={required}
    >
      <TimePicker
        {...a11y.trigger}
        allowManualInput={allowManualInput}
        commitDelay={commitDelay}
        disabled={disabled}
        invalid={Boolean(error)}
        minuteStep={minuteStep}
        placeholder={placeholder}
        size={size}
        value={value}
        onChange={handleChange}
        onParseError={setParseError}
      />
    </FormItem>
  );
}

export default TimeField;

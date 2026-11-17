'use client';

import dayjs from 'dayjs';
import SingleDatePicker, {
  type SingleDatePickerSize,
} from '@/shared/ui/pickers/date/SingleDatePicker';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';
import { toIsoDate, toLocalDate } from './date-value.utils';

export interface DateFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  size?: SingleDatePickerSize;
}

/**
 * DateField — chọn MỘT ngày, bọc `SingleDatePicker`; giá trị form là chuỗi `YYYY-MM-DD` (xoá → `null`).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện `DD/MM/YYYY`. Nhận cả giá trị điền sẵn dạng `Date` hay
 * chuỗi ISO, luôn hiểu theo giờ địa phương. Khoảng ngày → `DateRangeField`; giờ → `TimeField`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi chưa chọn. Mặc định `DD/MM/YYYY`.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.minDate - Ngày sớm nhất được chọn.
 * @param props.maxDate - Ngày muộn nhất được chọn.
 * @param props.format - Định dạng HIỂN THỊ trong ô (dayjs); không đổi định dạng lưu. Mặc định `DD/MM/YYYY`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 *
 * @example
 * <DateField name="startDate" label="Ngày bắt đầu" required minDate={new Date()} />
 */
function DateField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  minDate,
  maxDate,
  format,
  size,
}: DateFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });

  const dateValue = toLocalDate(field.value);

  if (readOnly) {
    const display = dateValue ? dayjs(dateValue).format('DD/MM/YYYY') : undefined;
    return (
      <FieldReadOnly className={className} label={label}>
        {display}
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
      <SingleDatePicker
        {...a11y.trigger}
        disabled={disabled}
        format={format}
        invalid={Boolean(error)}
        maxDate={maxDate}
        minDate={minDate}
        placeholder={placeholder}
        size={size}
        value={dateValue}
        onChange={(date) => field.onChange(toIsoDate(date))}
      />
    </FormItem>
  );
}

export default DateField;

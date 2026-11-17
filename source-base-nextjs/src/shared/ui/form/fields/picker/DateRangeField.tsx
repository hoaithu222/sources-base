'use client';

import dayjs from 'dayjs';
import RangeDatePicker from '@/shared/ui/pickers/date/range-date-picker/RangeDatePicker';
import type { RangeDatePickerSize } from '@/shared/ui/pickers/date/range-date-picker/range-date-picker.types';
import type { DateRange } from '@/shared/ui/pickers/date/shared/date-picker.types';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';
import { toIsoDate, toLocalDate } from './date-value.utils';

export interface IsoDateRange {
  /** Ngày đầu `YYYY-MM-DD`, `null` khi chưa chọn. */
  from: string | null;
  /** Ngày cuối `YYYY-MM-DD`, `null` khi chưa chọn. */
  to: string | null;
}

export interface DateRangeFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showQuickSelect?: boolean;
  size?: RangeDatePickerSize;
}

/**
 * DateRangeField — chọn KHOẢNG ngày, bọc `RangeDatePicker`; giá trị form là `{ from, to }` (chuỗi
 * `YYYY-MM-DD` hoặc `null` — xem `IsoDateRange`).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện `DD/MM/YYYY – DD/MM/YYYY`. Một ngày → `DateField`.
 * Lưu ý: cả object là MỘT field — lỗi "từ ≤ đến" của Zod đặt ở `path: [name]`, không ở `[name, 'from']`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `IsoDateRange`.
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi chưa chọn. Mặc định `DD/MM/YYYY - DD/MM/YYYY`.
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.minDate - Ngày sớm nhất được chọn.
 * @param props.maxDate - Ngày muộn nhất được chọn.
 * @param props.showQuickSelect - `true` → cột nút chọn nhanh bên trái lịch. Mặc định `false`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 *
 * @example
 * <DateRangeField name="period" label="Kỳ báo cáo" showQuickSelect />
 */
function DateRangeField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  minDate,
  maxDate,
  showQuickSelect,
  size,
}: DateRangeFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const val = (field.value ?? {}) as Partial<IsoDateRange>;

  const range: DateRange = {
    from: toLocalDate(val.from),
    to: toLocalDate(val.to),
  };

  if (readOnly) {
    const fromStr = range.from ? dayjs(range.from).format('DD/MM/YYYY') : '';
    const toStr = range.to ? dayjs(range.to).format('DD/MM/YYYY') : '';
    const display = fromStr && (toStr ? `${fromStr} – ${toStr}` : fromStr);
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
      <RangeDatePicker
        {...a11y.trigger}
        disabled={disabled}
        invalid={Boolean(error)}
        maxDate={maxDate}
        minDate={minDate}
        placeholder={placeholder}
        range={range}
        showQuickSelect={showQuickSelect}
        size={size}
        onRangeChange={(r) => field.onChange({ from: toIsoDate(r.from), to: toIsoDate(r.to) })}
      />
    </FormItem>
  );
}

export default DateRangeField;

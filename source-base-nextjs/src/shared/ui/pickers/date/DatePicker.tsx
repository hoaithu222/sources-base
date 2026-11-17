'use client';

import type { DateRange, QuickSelectOption } from './shared/date-picker.types';
import RangeDatePicker from './range-date-picker/RangeDatePicker';
import SingleDatePicker, { type SingleDatePickerSize } from './SingleDatePicker';

export type DatePickerSize = SingleDatePickerSize;

export interface DatePickerProps {
  mode?: 'single' | 'range';
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  range?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  showQuickSelect?: boolean;
  quickSelectOptions?: QuickSelectOption[];
  placeholder?: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
  size?: DatePickerSize;
  className?: string;
}

/**
 * DatePicker — một cửa cho cả hai kiểu chọn ngày: `mode="single"` dựng `SingleDatePicker`, `mode="range"`
 * dựng `RangeDatePicker`.
 *
 * Giữ để tương thích ngược; code mới dùng thẳng `SingleDatePicker` / `RangeDatePicker` để có đủ prop riêng
 * (`isDateDisabled`, `allowManualInput`, `hideFooter`, `align`, `aria-*`…) — DatePicker không chuyển chúng.
 *
 * @param props.mode - `single` (một ngày, dùng `value` / `onChange`) | `range` (khoảng, dùng `range` /
 *   `onRangeChange`). Mặc định `single`.
 * @param props.value - Chỉ `single`: ngày đang chọn; `null` = chưa chọn.
 * @param props.onChange - Chỉ `single`: gọi với ngày mới, `null` khi xoá.
 * @param props.range - Chỉ `range`: khoảng đang chọn `{ from, to }`.
 * @param props.onRangeChange - Chỉ `range`: gọi với khoảng mới (mốc đầu trước, `to: null`, rồi đủ 2 mốc).
 * @param props.showQuickSelect - Chỉ `range`: cột chọn nhanh bên trái lịch. Mặc định `false`.
 * @param props.quickSelectOptions - Chỉ `range`: các nút chọn nhanh. Mặc định `useDefaultQuickOptions()`.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'DD/MM/YYYY'` (`range`: `'DD/MM/YYYY - DD/MM/YYYY'`).
 * @param props.format - Định dạng dayjs để hiển thị. Mặc định `'DD/MM/YYYY'`.
 * @param props.minDate - Ngày sớm nhất chọn được.
 * @param props.maxDate - Ngày muộn nhất chọn được.
 * @param props.disabled - Khoá ô. Mặc định `false`.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid`. Mặc định `false`.
 * @param props.size - Cao ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.className - Class thêm cho ô kích hoạt.
 *
 * @example
 * <DatePicker value={day} onChange={setDay} />
 *
 * <DatePicker mode="range" range={range} onRangeChange={setRange} showQuickSelect />
 */
function DatePicker({
  mode = 'single',
  value,
  onChange,
  range,
  onRangeChange,
  showQuickSelect,
  quickSelectOptions,
  ...shared
}: DatePickerProps) {
  if (mode === 'range') {
    return (
      <RangeDatePicker
        quickSelectOptions={quickSelectOptions}
        range={range}
        showQuickSelect={showQuickSelect}
        onRangeChange={onRangeChange}
        {...shared}
      />
    );
  }
  return <SingleDatePicker value={value} onChange={onChange} {...shared} />;
}

export default DatePicker;

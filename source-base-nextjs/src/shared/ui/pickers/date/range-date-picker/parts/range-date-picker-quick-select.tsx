'use client';

import type { QuickSelectOption } from '../../shared/date-picker.types';
import { RANGE_DATE_PICKER_CLASSES } from '../range-date-picker.theme';

interface RangeDatePickerQuickSelectProps {
  options: QuickSelectOption[];
  onPick: (option: QuickSelectOption) => void;
}

/**
 * RangeDatePickerQuickSelect — cột nút chọn nhanh ("Tháng này", "Quý này"…) bên trái lịch `RangeDatePicker`.
 *
 * Phần con NỘI BỘ của RangeDatePicker (hiện khi `showQuickSelect`).
 * Sửa giao diện: `RANGE_DATE_PICKER_CLASSES.quickList` / `.quickButton`.
 *
 * @param props.options - Các nút `{ label, getRange }`; `label` phải duy nhất (dùng làm key).
 * @param props.onPick - Gọi với option được bấm.
 *
 * @example
 * <RangeDatePickerQuickSelect options={quickOptions} onPick={handleQuickSelect} />
 */
export function RangeDatePickerQuickSelect({ options, onPick }: RangeDatePickerQuickSelectProps) {
  return (
    <div className={RANGE_DATE_PICKER_CLASSES.quickList}>
      {options.map((opt) => (
        <button
          key={opt.label}
          className={RANGE_DATE_PICKER_CLASSES.quickButton}
          type="button"
          onClick={() => onPick(opt)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

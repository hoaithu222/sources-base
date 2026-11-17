'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import dayjs, { type Dayjs } from 'dayjs';
import Button from '@/shared/ui/actions/Button';
import Popover from '@/shared/ui/overlays/Popover';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { CalendarPanel } from './shared/calendar-panel';
import { dayCellClassName, DATE_PICKER_FOOTER_CLASSES } from './shared/date-picker.theme';
import { buildCalendarDays, resolveOpenMonth } from './shared/date-picker.utils';
import { COMMON_DATE_FORMATS, tryParseDate } from './shared/parse-date.utils';
import { PickerTrigger } from '../picker-trigger';

export type SingleDatePickerSize = FieldSize;

export interface SingleDatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
  size?: SingleDatePickerSize;
  className?: string;
  allowManualInput?: boolean;
  parseFormats?: string[];
  autoFocus?: boolean;
  isDateDisabled?: (date: Date) => boolean;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const SINGLE_DATE_PICKER_CLASSES = {
  panel: 'w-72',
  todayWrap: 'inline-flex',
};

/**
 * SingleDatePicker — chọn MỘT ngày: lịch popup (chọn nhanh tháng / năm, nút Xóa · Hôm nay) hoặc gõ thẳng
 * vào ô.
 *
 * Khoảng ngày → `RangeDatePicker`; ngày + giờ → `DateTimePicker`; chỉ giờ → `TimePicker`. Trong form dùng
 * `DateField` (lưu chuỗi ISO `YYYY-MM-DD`, đã nối nhãn / lỗi).
 * Sửa giao diện: ô ngày, chân panel → `shared/date-picker.theme.ts` · bề rộng panel →
 * `SINGLE_DATE_PICKER_CLASSES` · ô kích hoạt → `picker-trigger.tsx`; nút Xóa / Hôm nay là `<Button size="sm">`
 * của UI kit (ghost neutral / primary).
 * Lưu ý: mở panel luôn nhảy lịch về tháng của `value` (chưa chọn → hôm nay KẸP trong [`minDate`, `maxDate`]).
 * Gõ tay chỉ đồng bộ tháng đang xem và cờ lỗi; giá trị chốt ở Enter / rời ô. "Hôm nay" khoá khi hôm nay
 * ngoài khoảng cho phép. Lý do thiết kế: docs/notes/components/pickers.md (## SingleDatePicker).
 *
 * @param props.value - Ngày đang chọn (`Date`); `null` / `undefined` = chưa chọn.
 * @param props.onChange - Gọi với `Date` mới (00:00 của ngày đó — chọn lịch, "Hôm nay" hay gõ tay),
 *   `null` khi xoá.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'DD/MM/YYYY'`.
 * @param props.format - Định dạng dayjs để hiển thị (và là định dạng gõ tay chuẩn). Mặc định `'DD/MM/YYYY'`.
 * @param props.minDate - Ngày sớm nhất chọn được (so theo ngày, tính cả ngày đó).
 * @param props.maxDate - Ngày muộn nhất chọn được (so theo ngày, tính cả ngày đó).
 * @param props.isDateDisabled - Trả `true` = KHOÁ ngày đó (vd chỉ cho chọn thứ Bảy); áp cả khi gõ tay.
 * @param props.disabled - Khoá ô: không mở panel, không gõ, ẩn ✕. Mặc định `false`.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid` (lỗi từ form). Mặc định `false`.
 * @param props.size - Cao ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.allowManualInput - `true` → gõ ngày thẳng vào ô; `false` → ô chỉ bấm để mở lịch.
 *   Mặc định `true`.
 * @param props.parseFormats - Các định dạng gõ tay chấp nhận thêm ngoài `format`. Mặc định
 *   `COMMON_DATE_FORMATS` (`DD/MM/YYYY`, `D/M/YY`, `YYYY-MM-DD`…).
 * @param props.autoFocus - Focus ô nhập ngay khi mount → tự mở lịch (vd vừa vào chế độ sửa trên lưới).
 *   Mặc định `false`.
 * @param props.className - Class thêm cho ô kích hoạt.
 * @param props.id - Gắn lên phần tử nhận focus để nhãn NGOÀI trỏ tới.
 * @param props.aria-labelledby - Trỏ tới nhãn NGOÀI (các `*Field` của form truyền vào).
 * @param props.aria-describedby - Trỏ tới dòng mô tả / lỗi.
 * @param props.aria-invalid - Ghi đè `aria-invalid`. Mặc định theo `invalid` / lỗi gõ tay.
 *
 * @example
 * <SingleDatePicker value={date} onChange={setDate} minDate={new Date()} />
 *
 * <SingleDatePicker isDateDisabled={(d) => d.getDay() !== 6} placeholder="Chỉ thứ Bảy" size="sm" />
 */
function SingleDatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  format = 'DD/MM/YYYY',
  minDate,
  maxDate,
  disabled = false,
  invalid = false,
  size,
  className,
  allowManualInput = true,
  parseFormats,
  autoFocus = false,
  isDateDisabled,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: SingleDatePickerProps) {
  const t = useTranslations('ui.pickers');
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    resolveOpenMonth(value, minDate, maxDate),
  );
  const [triggerError, setTriggerError] = useState(false);

  const today = useMemo(() => dayjs(), []);
  const fmt = useCallback((d: Dayjs) => d.format(format), [format]);
  const minDay = useMemo(() => (minDate ? dayjs(minDate) : null), [minDate]);
  const maxDay = useMemo(() => (maxDate ? dayjs(maxDate) : null), [maxDate]);

  const allParseFormats = useMemo(
    () => Array.from(new Set([format, ...(parseFormats ?? COMMON_DATE_FORMATS)])),
    [format, parseFormats],
  );

  const isOff = useCallback(
    (d: Dayjs) =>
      (!!minDay && d.isBefore(minDay, 'day')) ||
      (!!maxDay && d.isAfter(maxDay, 'day')) ||
      (!!isDateDisabled && isDateDisabled(d.toDate())),
    [minDay, maxDay, isDateDisabled],
  );

  const displayText = useMemo(() => (value ? fmt(dayjs(value)) : ''), [value, fmt]);
  const calDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  const getDayClasses = useCallback(
    (date: Dayjs, isCurrentMonth: boolean) =>
      dayCellClassName({
        isCurrentMonth,
        selected: value ? dayjs(value).isSame(date, 'day') : false,
        off: isOff(date),
        isToday: today.isSame(date, 'day'),
      }),
    [value, today, isOff],
  );

  const handleDayClick = useCallback(
    (date: Dayjs) => {
      if (isOff(date)) return;
      onChange?.(date.toDate());
      setTriggerError(false);
      setOpen(false);
    },
    [isOff, onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
      setTriggerError(false);
    },
    [onChange],
  );

  const handleToday = useCallback(() => {
    if (!isOff(today)) onChange?.(today.startOf('day').toDate());
    setTriggerError(false);
    setOpen(false);
  }, [isOff, today, onChange]);

  const prevMonth = useCallback(() => setViewMonth((m) => m.subtract(1, 'month')), []);
  const nextMonth = useCallback(() => setViewMonth((m) => m.add(1, 'month')), []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) setViewMonth(resolveOpenMonth(value, minDate, maxDate));
      setOpen(next);
    },
    [value, minDate, maxDate],
  );

  const handleTriggerInputChange = useCallback(
    (raw: string) => {
      if (!raw.trim()) {
        setTriggerError(false);
        return;
      }
      const parsed = tryParseDate(raw, allParseFormats);
      if (parsed && !isOff(parsed)) {
        setViewMonth(parsed.startOf('month'));
        setTriggerError(false);
      } else {
        setTriggerError(true);
      }
    },
    [allParseFormats, isOff],
  );

  const handleTriggerInputCommit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) {
        onChange?.(null);
        setTriggerError(false);
        return;
      }
      const parsed = tryParseDate(trimmed, allParseFormats);
      if (!parsed || isOff(parsed)) {
        setTriggerError(true);
        return;
      }
      onChange?.(parsed.toDate());
      setViewMonth(parsed.startOf('month'));
      setTriggerError(false);
    },
    [allParseFormats, isOff, onChange],
  );

  const handleFooterClear = () => {
    onChange?.(null);
    setTriggerError(false);
    setOpen(false);
  };

  const isTodayOff = isOff(today);

  return (
    <Popover
      align="start"
      className={SINGLE_DATE_PICKER_CLASSES.panel}
      content={
        <>
          <CalendarPanel
            calDays={calDays}
            getDayClasses={getDayClasses}
            isOff={isOff}
            viewMonth={viewMonth}
            onDayClick={handleDayClick}
            onJump={setViewMonth}
            onNextMonth={nextMonth}
            onPrevMonth={prevMonth}
          />
          <div className={DATE_PICKER_FOOTER_CLASSES}>
            <Button size="sm" skin="neutral" variant="ghost" onClick={handleFooterClear}>
              {t('date.clear')}
            </Button>
            <span
              className={SINGLE_DATE_PICKER_CLASSES.todayWrap}
              title={isTodayOff ? t('date.todayOff') : undefined}
            >
              <Button disabled={isTodayOff} size="sm" onClick={handleToday}>
                {t('date.today')}
              </Button>
            </span>
          </div>
        </>
      }
      disabled={disabled}
      open={open}
      sideOffset={6}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onOpenChange={disabled ? undefined : handleOpenChange}
    >
      <PickerTrigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-labelledby={ariaLabelledBy}
        autoFocus={autoFocus}
        canClear={!!value && !disabled}
        className={className}
        disabled={disabled}
        displayText={displayText}
        editable={allowManualInput}
        id={id}
        inputError={triggerError}
        invalid={invalid}
        open={open}
        placeholder={placeholder}
        size={size}
        onClear={handleClear}
        onInputChange={handleTriggerInputChange}
        onInputCommit={handleTriggerInputCommit}
        onRequestOpen={() => !disabled && handleOpenChange(true)}
      />
    </Popover>
  );
}

export default SingleDatePicker;

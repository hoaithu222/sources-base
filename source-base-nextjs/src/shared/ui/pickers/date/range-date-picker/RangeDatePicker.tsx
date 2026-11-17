'use client';

import { useCallback, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import Popover from '@/shared/ui/overlays/Popover';
import { CalendarPanel } from '../shared/calendar-panel';
import type { QuickSelectOption } from '../shared/date-picker.types';
import { dayCellClassName } from '../shared/date-picker.theme';
import { buildCalendarDays, resolveOpenMonth } from '../shared/date-picker.utils';
import { COMMON_DATE_FORMATS } from '../shared/parse-date.utils';
import { useDefaultQuickOptions } from '../shared/useDefaultQuickOptions';
import { PickerTrigger } from '../../picker-trigger';
import { RangeDatePickerFooter } from './parts/range-date-picker-footer';
import { RangeDatePickerQuickSelect } from './parts/range-date-picker-quick-select';
import {
  RANGE_DATE_PICKER_CLASSES,
  RANGE_DATE_PICKER_PANEL_CLASSES,
} from './range-date-picker.theme';
import type { RangeDatePickerProps } from './range-date-picker.types';
import { useRangeDateInput } from './useRangeDateInput';

/**
 * RangeDatePicker — chọn KHOẢNG ngày: lịch popup (+ cột chọn nhanh) hoặc gõ "20/06/2026 - 30/06/2026".
 *
 * Một ngày → `SingleDatePicker`; khoảng tháng → `MonthYearRangePicker` / `MonthRangeFilter`. Trong form dùng
 * `DateRangeField` (đã nối nhãn / lỗi).
 * Sửa giao diện: ô ngày → `shared/date-picker.theme.ts` · panel / chọn nhanh → `range-date-picker.theme.ts`
 * · chân panel → `parts/range-date-picker-footer.tsx` · gõ tay → `useRangeDateInput.ts`.
 * Lưu ý: chọn 2 nhịp — bấm mốc đầu gọi ngay `onRangeChange({ from, to: null })` rồi chờ mốc cuối; bấm ngày
 * NHỎ HƠN mốc đang chờ = bắt đầu lại; đủ 2 mốc tự đóng. Mở panel nhảy lịch về tháng của `range.from`.
 * Lý do thiết kế: docs/notes/components/pickers.md (## RangeDatePicker).
 *
 * @param props.range - Khoảng đang chọn `{ from, to }` (`Date | null` mỗi đầu).
 * @param props.onRangeChange - Gọi với khoảng mới: mốc đầu (`to: null`), đủ 2 mốc, chọn nhanh, gõ tay;
 *   `{ from: null, to: null }` khi xoá / "Cài lại".
 * @param props.showQuickSelect - `true` → cột nút chọn nhanh bên trái lịch (panel rộng 540px).
 *   Mặc định `false`.
 * @param props.quickSelectOptions - Các nút chọn nhanh `{ label, getRange }`. Mặc định `useDefaultQuickOptions()` (nhãn theo ngôn ngữ).
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'DD/MM/YYYY - DD/MM/YYYY'`.
 * @param props.format - Định dạng dayjs mỗi đầu khoảng. Mặc định `'DD/MM/YYYY'`.
 * @param props.minDate - Ngày sớm nhất chọn được (tính cả ngày đó).
 * @param props.maxDate - Ngày muộn nhất chọn được (tính cả ngày đó).
 * @param props.disabled - Khoá ô: không mở panel, không gõ, ẩn ✕. Mặc định `false`.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid` (lỗi từ form). Mặc định `false`.
 * @param props.size - Cao ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.className - Class thêm cho ô kích hoạt.
 * @param props.allowManualInput - `true` → gõ khoảng thẳng vào ô (ngăn cách `-` `–` `~` `→`). Mặc định `true`.
 * @param props.parseFormats - Các định dạng gõ tay chấp nhận thêm ngoài `format`. Mặc định `COMMON_DATE_FORMATS`.
 * @param props.popoverVariant - Bề mặt panel: `glass` | `solid`. Mặc định `glass` (theo `Popover`).
 * @param props.align - Cạnh neo lịch: `start` | `center` | `end`; `end` khi ô sát mép PHẢI màn hình.
 *   Mặc định `start`.
 * @param props.collisionPadding - Khoảng cách tối thiểu (px) panel giữ với mép khung nhìn khi tự né.
 * @param props.hideFooter - `true` → ẩn chân panel (tóm tắt + Cài lại / Áp dụng). Mặc định `false`.
 * @param props.id - Gắn lên phần tử nhận focus để nhãn NGOÀI trỏ tới.
 * @param props.aria-labelledby - Trỏ tới nhãn NGOÀI (các `*Field` của form truyền vào).
 * @param props.aria-describedby - Trỏ tới dòng mô tả / lỗi.
 * @param props.aria-invalid - Ghi đè `aria-invalid`. Mặc định theo `invalid` / lỗi gõ tay.
 *
 * @example
 * <RangeDatePicker range={range} onRangeChange={setRange} showQuickSelect minDate={startOfYear} />
 *
 * <RangeDatePicker align="end" hideFooter range={range} size="sm" onRangeChange={setRange} />
 */
function RangeDatePicker({
  range,
  onRangeChange,
  showQuickSelect = false,
  quickSelectOptions,
  placeholder = 'DD/MM/YYYY - DD/MM/YYYY',
  format = 'DD/MM/YYYY',
  minDate,
  maxDate,
  disabled = false,
  invalid = false,
  size,
  className,
  allowManualInput = true,
  parseFormats,
  popoverVariant,
  align = 'start',
  collisionPadding,
  hideFooter = false,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: RangeDatePickerProps) {
  const defaultQuickOptions = useDefaultQuickOptions();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    resolveOpenMonth(range?.from, minDate, maxDate),
  );
  const [pendingFrom, setPendingFrom] = useState<Dayjs | null>(null);
  const [hoverDate, setHoverDate] = useState<Dayjs | null>(null);
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
    (d: Dayjs) => (!!minDay && d.isBefore(minDay, 'day')) || (!!maxDay && d.isAfter(maxDay, 'day')),
    [minDay, maxDay],
  );

  const rangeFrom = range?.from ?? null;
  const rangeTo = range?.to ?? null;

  const rFrom = useMemo(() => (rangeFrom ? dayjs(rangeFrom) : null), [rangeFrom]);
  const rTo = useMemo(() => (rangeTo ? dayjs(rangeTo) : null), [rangeTo]);

  const displayText = useMemo(() => {
    if (rFrom && rTo) return `${fmt(rFrom)} - ${fmt(rTo)}`;
    if (rFrom) return fmt(rFrom);
    return '';
  }, [rFrom, rTo, fmt]);

  const calDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  const [prevDisplayText, setPrevDisplayText] = useState(displayText);
  if (displayText !== prevDisplayText) {
    setPrevDisplayText(displayText);
    if (triggerError) setTriggerError(false);
  }

  const getDayClasses = useCallback(
    (date: Dayjs, isCurrentMonth: boolean) => {
      const selected =
        (rFrom?.isSame(date, 'day') ?? false) ||
        (rTo?.isSame(date, 'day') ?? false) ||
        (pendingFrom?.isSame(date, 'day') ?? false);
      const effective =
        rTo ?? (pendingFrom && hoverDate?.isAfter(pendingFrom, 'day') ? hoverDate : null);
      const inRange =
        !!rFrom && !!effective && date.isAfter(rFrom, 'day') && date.isBefore(effective, 'day');
      return dayCellClassName({
        isCurrentMonth,
        selected,
        off: isOff(date),
        isToday: today.isSame(date, 'day'),
        inRange,
      });
    },
    [rFrom, rTo, pendingFrom, hoverDate, today, isOff],
  );

  const handleDayClick = useCallback(
    (date: Dayjs) => {
      if (isOff(date)) return;
      if (!pendingFrom || date.isBefore(pendingFrom, 'day')) {
        setPendingFrom(date);
        onRangeChange?.({ from: date.toDate(), to: null });
      } else {
        onRangeChange?.({ from: pendingFrom.toDate(), to: date.toDate() });
        setPendingFrom(null);
        setOpen(false);
      }
    },
    [isOff, onRangeChange, pendingFrom],
  );

  const handleReset = useCallback(() => {
    onRangeChange?.({ from: null, to: null });
    setPendingFrom(null);
    setOpen(false);
  }, [onRangeChange]);

  const handleApply = useCallback(() => {
    if (pendingFrom) {
      onRangeChange?.({ from: pendingFrom.toDate(), to: null });
      setPendingFrom(null);
    }
    setOpen(false);
  }, [onRangeChange, pendingFrom]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRangeChange?.({ from: null, to: null });
      setPendingFrom(null);
      setTriggerError(false);
    },
    [onRangeChange],
  );

  const prevMonth = useCallback(() => setViewMonth((m) => m.subtract(1, 'month')), []);
  const nextMonth = useCallback(() => setViewMonth((m) => m.add(1, 'month')), []);
  const handleEnter = useCallback((date: Dayjs) => setHoverDate(date), []);
  const handleLeave = useCallback(() => setHoverDate(null), []);

  const { handleTriggerInputChange, handleTriggerInputCommit } = useRangeDateInput({
    allParseFormats,
    isOff,
    onRangeChange,
    setPendingFrom,
    setTriggerError,
    setViewMonth,
  });

  const handleOpenChange = (next: boolean) => {
    if (next && !open) {
      setViewMonth(resolveOpenMonth(rangeFrom, minDate, maxDate));
      setPendingFrom(rangeFrom && !rangeTo ? dayjs(rangeFrom) : null);
    }
    if (!next) setHoverDate(null);
    setOpen(next);
  };

  const handleQuickSelect = (option: QuickSelectOption) => {
    onRangeChange?.(option.getRange());
    setPendingFrom(null);
    setOpen(false);
  };

  return (
    <Popover
      align={align}
      className={RANGE_DATE_PICKER_PANEL_CLASSES[showQuickSelect ? 'quickSelect' : 'default']}
      collisionPadding={collisionPadding}
      content={
        <div className="flex">
          {showQuickSelect && (
            <RangeDatePickerQuickSelect
              options={quickSelectOptions ?? defaultQuickOptions}
              onPick={handleQuickSelect}
            />
          )}

          <div className={RANGE_DATE_PICKER_CLASSES.calendar}>
            <CalendarPanel
              calDays={calDays}
              getDayClasses={getDayClasses}
              isOff={isOff}
              viewMonth={viewMonth}
              onDayClick={handleDayClick}
              onDayEnter={handleEnter}
              onDayLeave={handleLeave}
              onJump={setViewMonth}
              onNextMonth={nextMonth}
              onPrevMonth={prevMonth}
            />

            {!hideFooter && (
              <RangeDatePickerFooter
                fromText={rFrom ? fmt(rFrom) : 'dd/mm/yy'}
                toText={rTo ? fmt(rTo) : 'dd/mm/yy'}
                onApply={handleApply}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      }
      disabled={disabled}
      open={open}
      sideOffset={6}
      variant={popoverVariant}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onOpenChange={disabled ? undefined : handleOpenChange}
    >
      <PickerTrigger
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        aria-labelledby={ariaLabelledBy}
        canClear={!!range?.from && !disabled}
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

export default RangeDatePicker;

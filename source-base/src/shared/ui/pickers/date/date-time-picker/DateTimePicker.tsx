import { useCallback, useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { OPEN_DIALOG_SELECTOR } from '@/shared/constants/dom.constants';
import Button from '@/shared/ui/actions/Button';
import Popover from '@/shared/ui/overlays/Popover';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { CalendarPanel } from '../shared/calendar-panel';
import { DateTimePickerColumn } from './date-time-picker-column';
import { dayCellClassName, DATE_PICKER_FOOTER_CLASSES } from '../shared/date-picker.theme';
import { buildCalendarDays, resolveOpenMonth } from '../shared/date-picker.utils';
import { PickerTrigger } from '../../picker-trigger';

export type DateTimePickerSize = FieldSize;

export interface DateTimePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
  size?: DateTimePickerSize;
  className?: string;
  minuteStep?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DATE_TIME_PICKER_CLASSES = {
  panel: 'w-80 max-w-[calc(100vw-1.5rem)]',
  content: 'flex flex-col',
  columns: 'relative grid h-[128px] grid-cols-2 gap-px border-t border-divider-nav bg-divider-nav',
  actionWrap: 'inline-flex',
};

/**
 * DateTimePicker — chọn NGÀY + GIỜ: lịch ở trên, hai cột Giờ · Phút ở dưới, bấm "Xác nhận" mới chốt.
 *
 * Chỉ ngày → `SingleDatePicker`; chỉ giờ → `TimePicker`. Ô KHÔNG gõ tay được: Tab tới ô rồi Enter / Space
 * (hoặc bấm) để mở panel.
 * Sửa giao diện: ô ngày, chân panel → `shared/date-picker.theme.ts` · panel / cặp cột →
 * `DATE_TIME_PICKER_CLASSES` · cột giờ / phút → `date-time-picker-column.tsx`; nút Bây giờ / Xác nhận là
 * `<Button size="sm">` của UI kit.
 * Lưu ý: chỉnh trong bản nháp, chỉ gọi `onChange` khi bấm "Xác nhận" (giây, mili giây = 0); mở panel luôn
 * đặt lại nháp theo `value`. "Xác nhận" / "Bây giờ" khoá khi ngày nằm ngoài [`minDate`, `maxDate`].
 * Trong Modal panel portal vào `DialogContent` để cột cuộn được.
 * Lý do thiết kế: docs/notes/components/pickers.md (## DateTimePicker).
 *
 * @param props.value - Thời điểm đang chọn (`Date`); `null` / `undefined` = chưa chọn (nháp mở từ bây giờ).
 * @param props.onChange - Gọi với `Date` khi bấm "Xác nhận"; `null` khi bấm ✕ trên ô.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'DD/MM/YYYY HH:mm'`.
 * @param props.format - Định dạng dayjs để hiển thị. Mặc định `'DD/MM/YYYY HH:mm'`.
 * @param props.minDate - Ngày sớm nhất chọn được (so theo NGÀY, không so giờ).
 * @param props.maxDate - Ngày muộn nhất chọn được (so theo NGÀY, không so giờ).
 * @param props.disabled - Khoá ô: không mở panel, ẩn ✕. Mặc định `false`.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid`. Mặc định `false`.
 * @param props.size - Cao ô: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.className - Class thêm cho ô kích hoạt.
 * @param props.minuteStep - Bước của cột Phút (phút); `1` → 60 giá trị, `5` / `15` / `30` rút gọn cột.
 *   Mặc định `1`.
 *
 * @example
 * <DateTimePicker value={startAt} onChange={setStartAt} minuteStep={15} minDate={new Date()} />
 */
function DateTimePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY HH:mm',
  format = 'DD/MM/YYYY HH:mm',
  minDate,
  maxDate,
  disabled = false,
  invalid = false,
  size,
  className,
  minuteStep = 1,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Dayjs>(() => dayjs(value ?? undefined));
  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    resolveOpenMonth(value, minDate, maxDate),
  );
  const [container, setContainer] = useState<HTMLElement | null>(null);

  const today = useMemo(() => dayjs(), []);
  const minDay = useMemo(() => (minDate ? dayjs(minDate) : null), [minDate]);
  const maxDay = useMemo(() => (maxDate ? dayjs(maxDate) : null), [maxDate]);
  const minutes = useMemo(
    () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
    [minuteStep],
  );

  const displayText = useMemo(() => (value ? dayjs(value).format(format) : ''), [value, format]);
  const calDays = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  const isOff = useCallback(
    (d: Dayjs) => (!!minDay && d.isBefore(minDay, 'day')) || (!!maxDay && d.isAfter(maxDay, 'day')),
    [minDay, maxDay],
  );
  const isNowOff = isOff(today);
  const isDraftOff = isOff(draft);

  const getDayClasses = useCallback(
    (date: Dayjs, isCurrentMonth: boolean) =>
      dayCellClassName({
        isCurrentMonth,
        selected: draft.isSame(date, 'day'),
        off: isOff(date),
        isToday: today.isSame(date, 'day'),
      }),
    [draft, today, isOff],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        const nextDraft = dayjs(value ?? undefined);
        setDraft(nextDraft);
        setViewMonth(resolveOpenMonth(value, minDate, maxDate));
        setContainer((document.querySelector(OPEN_DIALOG_SELECTOR) as HTMLElement) ?? null);
      }
      setOpen(next);
    },
    [value, minDate, maxDate],
  );

  const handleDayClick = useCallback(
    (d: Dayjs) => {
      if (isOff(d)) return;
      setDraft((prev) => d.hour(prev.hour()).minute(prev.minute()));
    },
    [isOff],
  );

  const handleHour = useCallback((h: number) => setDraft((prev) => prev.hour(h)), []);
  const handleMinute = useCallback((m: number) => setDraft((prev) => prev.minute(m)), []);

  const handleNow = useCallback(() => {
    const now = dayjs();
    if (isOff(now)) return;
    setDraft(now);
    setViewMonth(now.startOf('month'));
  }, [isOff]);

  const handleConfirm = useCallback(() => {
    if (isOff(draft)) return;
    onChange?.(draft.second(0).millisecond(0).toDate());
    setOpen(false);
  }, [draft, isOff, onChange]);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    },
    [onChange],
  );

  const prevMonth = useCallback(() => setViewMonth((m) => m.subtract(1, 'month')), []);
  const nextMonth = useCallback(() => setViewMonth((m) => m.add(1, 'month')), []);

  return (
    <Popover
      align="start"
      className={DATE_TIME_PICKER_CLASSES.panel}
      container={container}
      content={
        <div className={DATE_TIME_PICKER_CLASSES.content}>
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
          <div className={DATE_TIME_PICKER_CLASSES.columns}>
            <DateTimePickerColumn
              items={HOURS}
              label="Giờ"
              value={draft.hour()}
              onPick={handleHour}
            />
            <DateTimePickerColumn
              items={minutes}
              label="Phút"
              value={draft.minute()}
              onPick={handleMinute}
            />
          </div>
          <div className={DATE_PICKER_FOOTER_CLASSES}>
            <span
              className={DATE_TIME_PICKER_CLASSES.actionWrap}
              title={isNowOff ? 'Hôm nay nằm ngoài khoảng ngày cho phép' : undefined}
            >
              <Button disabled={isNowOff} size="sm" variant="ghost" onClick={handleNow}>
                Bây giờ
              </Button>
            </span>
            <span
              className={DATE_TIME_PICKER_CLASSES.actionWrap}
              title={isDraftOff ? 'Chọn một ngày trong khoảng cho phép' : undefined}
            >
              <Button disabled={isDraftOff} size="sm" onClick={handleConfirm}>
                Xác nhận
              </Button>
            </span>
          </div>
        </div>
      }
      disabled={disabled}
      open={open}
      sideOffset={6}
      onOpenAutoFocus={(e) => e.preventDefault()}
      onOpenChange={disabled ? undefined : handleOpenChange}
    >
      <PickerTrigger
        canClear={!!value && !disabled}
        className={className}
        disabled={disabled}
        displayText={displayText}
        icon="clock-outline"
        invalid={invalid}
        open={open}
        placeholder={placeholder}
        size={size}
        onClear={handleClear}
        onRequestOpen={() => !disabled && setOpen(true)}
      />
    </Popover>
  );
}

export default DateTimePicker;

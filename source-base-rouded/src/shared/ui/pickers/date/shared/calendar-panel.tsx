import { useMemo, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { MONTH_LABELS } from '../../month-labels.constants';
import { DAY_HEADERS } from './date-picker.utils';

interface CalendarPanelProps {
  viewMonth: Dayjs;
  calDays: { date: Dayjs; isCurrentMonth: boolean }[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  getDayClasses: (date: Dayjs, isCurrentMonth: boolean) => string;
  onDayClick: (date: Dayjs) => void;
  onDayEnter?: (date: Dayjs) => void;
  onDayLeave?: () => void;
  isOff: (date: Dayjs) => boolean;
  onJump?: (date: Dayjs) => void;
}

type MonthCellState = 'selected' | 'current' | 'idle';

const CALENDAR_PANEL_CLASSES = {
  root: 'flex flex-col flex-1 min-w-0',
  header: 'flex items-center justify-between px-4 pt-4 pb-2',
  title: 'flex items-center gap-1 text-body-16-medium text-fg-on-chrome',
  titleButton: cn(
    'flex cursor-pointer items-center gap-1 rounded-sm text-body-16-medium text-fg-on-chrome',
    'transition-colors duration-150 ease-out hover:text-link',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  caret: 'transition-transform duration-150 ease-out motion-reduce:transition-none',
  caretStatic: 'text-fg-on-chrome-muted',
  nav: 'flex gap-1',
  navButton: cn(
    "relative touch:after:absolute touch:after:-inset-x-0.5 touch:after:-inset-y-3 touch:after:content-['']",
    'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm',
    'border-0 bg-transparent text-fg-on-chrome-muted',
    'transition-[color,background-color,box-shadow] duration-150 ease-out',
    'hover:bg-primary-5/10 hover:text-link active:bg-primary-5/20',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  body: 'h-[248px]',
  monthView: 'flex h-full flex-col px-2 pb-2',
  yearBar: 'flex items-center justify-between px-2 py-2',
  yearLabel: 'text-body-16-medium text-fg-on-chrome tabular-nums',
  monthGrid: 'grid flex-1 grid-cols-3 grid-rows-4 gap-1',
  weekdays: 'grid grid-cols-7 px-2',
  weekday: 'py-1 text-center text-caption-12-semibold text-fg-on-chrome-muted',
  days: 'grid grid-cols-7 px-2 pb-2',
};

const CALENDAR_PANEL_MONTH_BASE_CLASSES = cn(
  'flex cursor-pointer items-center justify-center rounded-sm',
  'transition-[color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const CALENDAR_PANEL_MONTH_STATE_CLASSES = {
  selected: 'bg-primary-6 text-body-14-semibold text-neutral-0 hover:bg-primary-7',
  current: cn(
    'text-body-14-semibold text-link hover:bg-primary-5/10',
    'shadow-[inset_0_0_0_1px_var(--color-primary-5)]',
  ),
  idle: 'text-body-14 text-fg-on-chrome hover:bg-primary-5/10',
} satisfies Record<MonthCellState, string>;

const monthCellStateOf = (selected: boolean, current: boolean): MonthCellState => {
  if (selected) return 'selected';
  return current ? 'current' : 'idle';
};

/**
 * CalendarPanel — lịch tháng dùng chung của các date picker: tiêu đề, nút tháng trước / sau, lưới 42 ô
 * ngày; bấm tiêu đề (khi có `onJump`) chuyển sang lưới chọn nhanh tháng / năm.
 *
 * Helper NỘI BỘ của `pickers/date`; picker tự giữ `viewMonth` và tự quyết class từng ô ngày.
 * Sửa giao diện: khung / tiêu đề / nút → `CALENDAR_PANEL_CLASSES` · ô tháng → `CALENDAR_PANEL_MONTH_*`
 * (tháng đang chọn đặc primary, tháng hiện tại viền trong 1px như ô "hôm nay")
 * · ô ngày do picker truyền qua `getDayClasses` (`date-picker.theme.ts`).
 * Lưu ý: `calDays` phải đủ 42 ô (`buildCalendarDays`) — thân lịch cao CỐ ĐỊNH 248px để popup không nhảy.
 *
 * @param props.viewMonth - Tháng đang xem (`Dayjs`, ngày nào trong tháng cũng được).
 * @param props.calDays - 42 ô `{ date, isCurrentMonth }` của `viewMonth` (`buildCalendarDays`).
 * @param props.onPrevMonth - Bấm nút "Tháng trước".
 * @param props.onNextMonth - Bấm nút "Tháng sau".
 * @param props.getDayClasses - Trả class cho từng ô ngày (`dayCellClassName`).
 * @param props.onDayClick - Bấm một ô ngày (ô bị `isOff` đã khoá sẵn).
 * @param props.onDayEnter - Rê chuột vào ô ngày (xem trước khoảng).
 * @param props.onDayLeave - Rê chuột ra khỏi ô ngày.
 * @param props.isOff - `true` → ô ngày bị khoá (ngoài `minDate` / `maxDate` / `isDateDisabled`).
 * @param props.onJump - Bật chọn nhanh tháng / năm, nhận ngày 1 của tháng được chọn; bỏ trống → caret tĩnh.
 *
 * @example
 * <CalendarPanel calDays={buildCalendarDays(month)} getDayClasses={dayClass} isOff={isOff}
 *   viewMonth={month} onDayClick={pick} onJump={setMonth} onNextMonth={next} onPrevMonth={prev} />
 */
export function CalendarPanel({
  viewMonth,
  calDays,
  onPrevMonth,
  onNextMonth,
  getDayClasses,
  onDayClick,
  onDayEnter,
  onDayLeave,
  isOff,
  onJump,
}: CalendarPanelProps) {
  const [monthView, setMonthView] = useState(false);
  const [pickYear, setPickYear] = useState(() => viewMonth.year());
  const today = useMemo(() => dayjs(), []);

  const openMonthView = () => {
    setPickYear(viewMonth.year());
    setMonthView(true);
  };
  const pickMonth = (m: number) => {
    onJump?.(viewMonth.year(pickYear).month(m).date(1));
    setMonthView(false);
  };

  const monthTitle = (
    <span>
      {MONTH_LABELS[viewMonth.month()].long}, {viewMonth.year()}
    </span>
  );

  return (
    <div className={CALENDAR_PANEL_CLASSES.root}>
      <div className={CALENDAR_PANEL_CLASSES.header}>
        {onJump ? (
          <button
            className={CALENDAR_PANEL_CLASSES.titleButton}
            type="button"
            onClick={monthView ? () => setMonthView(false) : openMonthView}
          >
            {monthTitle}
            <SystemIcon
              className={cn(CALENDAR_PANEL_CLASSES.caret, monthView && 'rotate-180')}
              name="caret-large-down-outline"
              size={14}
            />
          </button>
        ) : (
          <div className={CALENDAR_PANEL_CLASSES.title}>
            {monthTitle}
            <SystemIcon
              className={CALENDAR_PANEL_CLASSES.caretStatic}
              name="caret-large-down-outline"
              size={14}
            />
          </div>
        )}
        {!monthView && (
          <div className={CALENDAR_PANEL_CLASSES.nav}>
            <button
              aria-label="Tháng trước"
              className={CALENDAR_PANEL_CLASSES.navButton}
              type="button"
              onClick={onPrevMonth}
            >
              <SystemIcon name="angle-left-outline" size={14} />
            </button>
            <button
              aria-label="Tháng sau"
              className={CALENDAR_PANEL_CLASSES.navButton}
              type="button"
              onClick={onNextMonth}
            >
              <SystemIcon name="angle-right-outline" size={14} />
            </button>
          </div>
        )}
      </div>

      <div className={CALENDAR_PANEL_CLASSES.body}>
        {monthView ? (
          <div className={CALENDAR_PANEL_CLASSES.monthView}>
            <div className={CALENDAR_PANEL_CLASSES.yearBar}>
              <button
                aria-label="Năm trước"
                className={CALENDAR_PANEL_CLASSES.navButton}
                type="button"
                onClick={() => setPickYear((y) => y - 1)}
              >
                <SystemIcon name="angle-left-outline" size={14} />
              </button>
              <span className={CALENDAR_PANEL_CLASSES.yearLabel}>{pickYear}</span>
              <button
                aria-label="Năm sau"
                className={CALENDAR_PANEL_CLASSES.navButton}
                type="button"
                onClick={() => setPickYear((y) => y + 1)}
              >
                <SystemIcon name="angle-right-outline" size={14} />
              </button>
            </div>
            <div className={CALENDAR_PANEL_CLASSES.monthGrid}>
              {MONTH_LABELS.map(({ long: label }, m) => {
                const sel = pickYear === viewMonth.year() && m === viewMonth.month();
                const current = pickYear === today.year() && m === today.month();
                return (
                  <button
                    key={label}
                    aria-pressed={sel}
                    className={cn(
                      CALENDAR_PANEL_MONTH_BASE_CLASSES,
                      CALENDAR_PANEL_MONTH_STATE_CLASSES[monthCellStateOf(sel, current)],
                    )}
                    type="button"
                    onClick={() => pickMonth(m)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div className={CALENDAR_PANEL_CLASSES.weekdays}>
              {DAY_HEADERS.map((d) => (
                <div key={d} className={CALENDAR_PANEL_CLASSES.weekday}>
                  {d}
                </div>
              ))}
            </div>

            <div className={CALENDAR_PANEL_CLASSES.days}>
              {calDays.map(({ date, isCurrentMonth }, idx) => (
                <button
                  key={idx}
                  aria-label={date.format('DD/MM/YYYY')}
                  className={getDayClasses(date, isCurrentMonth)}
                  disabled={isOff(date)}
                  type="button"
                  onClick={() => onDayClick(date)}
                  onMouseEnter={() => onDayEnter?.(date)}
                  onMouseLeave={onDayLeave}
                >
                  {date.date()}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

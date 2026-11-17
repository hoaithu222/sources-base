import dayjs, { type Dayjs } from 'dayjs';
import type { QuickSelectOption } from './date-picker.types';

/**
 * date-picker.utils — dữ liệu và hàm thuần dùng chung của các date picker.
 *
 * Dùng:   buildCalendarDays(dayjs('2024-01-01')) · resolveOpenMonth(value, minDate, maxDate)
 * Lưu ý:  `buildCalendarDays` LUÔN trả đủ 42 ô — CalendarPanel cố định chiều cao lưới theo con số đó.
 */

export const DAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/** 42 ô (6 hàng × 7 cột, thứ Hai đứng đầu) bao quanh `month`; ô tháng kề có `isCurrentMonth: false`. */
export function buildCalendarDays(month: Dayjs): { date: Dayjs; isCurrentMonth: boolean }[] {
  const first = month.startOf('month');
  const last = month.endOf('month');
  const days: { date: Dayjs; isCurrentMonth: boolean }[] = [];
  for (let i = (first.day() + 6) % 7; i > 0; i--)
    days.push({ date: first.subtract(i, 'day'), isCurrentMonth: false });
  for (let d = 0; d < month.daysInMonth(); d++)
    days.push({ date: first.add(d, 'day'), isCurrentMonth: true });
  for (let i = 1; days.length < 42; i++)
    days.push({ date: last.add(i, 'day'), isCurrentMonth: false });
  return days;
}

/** Tháng lịch mở ra: của `value`; chưa chọn thì tháng hiện tại KẸP trong [minDate, maxDate]. */
export function resolveOpenMonth(
  value?: Date | null,
  minDate?: Date | null,
  maxDate?: Date | null,
): Dayjs {
  if (value) return dayjs(value).startOf('month');
  const now = dayjs();
  if (minDate && now.isBefore(dayjs(minDate), 'day')) return dayjs(minDate).startOf('month');
  if (maxDate && now.isAfter(dayjs(maxDate), 'day')) return dayjs(maxDate).startOf('month');
  return now.startOf('month');
}

/** Chọn nhanh mặc định của RangeDatePicker: 2 tuần tới · tháng / quý / năm nay · 3 / 6 tháng gần nhất. */
export const DEFAULT_QUICK_OPTIONS: QuickSelectOption[] = [
  {
    label: '2 tuần tới',
    getRange: () => ({ from: dayjs().toDate(), to: dayjs().add(13, 'day').toDate() }),
  },
  {
    label: 'Tháng này',
    getRange: () => ({
      from: dayjs().startOf('month').toDate(),
      to: dayjs().endOf('month').toDate(),
    }),
  },
  {
    label: 'Quý này',
    getRange: () => {
      const q = Math.floor(dayjs().month() / 3);
      return {
        from: dayjs()
          .month(q * 3)
          .startOf('month')
          .toDate(),
        to: dayjs()
          .month(q * 3 + 2)
          .endOf('month')
          .toDate(),
      };
    },
  },
  {
    label: 'Năm nay',
    getRange: () => ({
      from: dayjs().startOf('year').toDate(),
      to: dayjs().endOf('year').toDate(),
    }),
  },
  {
    label: '3 tháng',
    getRange: () => ({ from: dayjs().subtract(3, 'month').toDate(), to: dayjs().toDate() }),
  },
  {
    label: '6 tháng',
    getRange: () => ({ from: dayjs().subtract(6, 'month').toDate(), to: dayjs().toDate() }),
  },
];

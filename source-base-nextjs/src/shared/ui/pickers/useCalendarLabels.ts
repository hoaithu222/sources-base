'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

interface CalendarLabels {
  /** Tên 12 tháng theo chỉ số 0..11: `long` (lịch ngày) · `short` (lưới chọn tháng). */
  months: { long: string; short: string }[];
  /** Tiêu đề 7 cột thứ, thứ Hai đứng đầu. */
  weekdays: string[];
  /** Tiêu đề lịch: tháng (chỉ số 0..11) + năm. */
  monthTitle: (monthIdx: number, year: number) => string;
  /** Nhãn ngắn của một tháng-năm (tháng 1..12) ở nút kích hoạt picker THÁNG. */
  monthYear: (month: number, year: number) => string;
}

/**
 * useCalendarLabels — chữ của lịch (tên tháng, tên thứ, nhãn tháng-năm) theo ngôn ngữ hiện tại.
 *
 * Dùng chung cho các date picker và picker THÁNG (`CalendarPanel`, `MonthGrid`, các `MonthYear*Picker`);
 * chữ nằm ở `ui.pickers` → `calendar.*` (tiếng Việt: "Tháng 7", "Th.7", "T7/2026", "T2".."CN").
 *
 * @returns `{ months, weekdays, monthTitle, monthYear }`, giữ nguyên tham chiếu khi ngôn ngữ không đổi.
 *
 * @example
 * const { months, weekdays } = useCalendarLabels();
 * months[6].long; // vi: "Tháng 7" · en: "July"
 */
export function useCalendarLabels(): CalendarLabels {
  const t = useTranslations('ui.pickers');

  return useMemo(() => {
    const months = MONTH_NUMBERS.map((month) => ({
      long: t('calendar.monthLong', { month }),
      short: t('calendar.monthShort', { month }),
    }));
    return {
      months,
      weekdays: WEEKDAY_KEYS.map((key) => t(`calendar.weekdays.${key}`)),
      monthTitle: (monthIdx, year) => t('calendar.title', { month: months[monthIdx].long, year }),
      monthYear: (month, year) => t('calendar.monthYear', { month, year }),
    };
  }, [t]);
}

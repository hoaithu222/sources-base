/**
 * Ngày của hai màn vận hành: mọi phép tính theo SỐ NGÀY (UTC) từ chuỗi ISO `YYYY-MM-DD` nên không lệch múi giờ.
 * Dùng: `dayIndex('2026-10-19') - dayIndex('2026-10-12')` → 7 · `weekdayOf(index)` → 0 = Chủ nhật.
 */

const DAY_MS = 86_400_000;

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const;

const WEEKDAY_LONG = [
  'Chủ nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
] as const;

const pad2 = (value: number) => String(value).padStart(2, '0');

/** Số ngày kể từ 01/01/1970 (UTC) của một ngày ISO. */
export function dayIndex(iso: string): number {
  const [year, month, day] = iso.split('-').map(Number);
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

/** Thứ trong tuần: 0 = Chủ nhật … 6 = Thứ Bảy. */
export function weekdayOf(index: number): number {
  return new Date(index * DAY_MS).getUTCDay();
}

/** "T2" … "T7", "CN". */
export function weekdayShort(index: number): string {
  return WEEKDAY_SHORT[weekdayOf(index)];
}

/** "Thứ Hai" … "Chủ nhật". */
export function weekdayLong(index: number): string {
  return WEEKDAY_LONG[weekdayOf(index)];
}

/** "19/10" — ngày/tháng hai chữ số. */
export function formatDayMonth(index: number): string {
  const date = new Date(index * DAY_MS);
  return `${pad2(date.getUTCDate())}/${pad2(date.getUTCMonth() + 1)}`;
}

/** Số ngày của tháng (`month` 1..12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Chỉ số ngày của ngày `day` trong tháng (`month` 1..12). */
export function monthDayIndex(year: number, month: number, day: number): number {
  return Math.round(Date.UTC(year, month - 1, day) / DAY_MS);
}

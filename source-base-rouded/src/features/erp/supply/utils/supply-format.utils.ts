import dayjs from 'dayjs';

import { formatDate } from '@/shared/utils/format/format.utils';
import { formatMoneyCompactRaw } from '@/shared/utils/format/money.utils';

/**
 * Định dạng dùng chung của hai màn chuỗi cung ứng: tiền gọn ("9,8 tỷ" · "312,4 tr"), ngày vi-VN, số ngày giữa hai mốc.
 * Mọi ngày vào là chuỗi ISO `YYYY-MM-DD`; tiền vào là số ĐỒNG.
 */

/** Tiền gọn, luôn một chữ số lẻ: `9_870_000_000` → `"9,8 tỷ"` · `1_000_000_000` → `"1,0 tỷ"` · `0` → `"0 đ"`. */
export function formatMoneyShort(valueDong: number): string {
  if (!valueDong) return '0 đ';
  const money = formatMoneyCompactRaw(valueDong, 1, true);
  return `${money.text} ${money.suffix}`;
}

/** Ngày ISO → `DD/MM/YYYY`. */
export function formatDay(iso: string): string {
  return formatDate(iso, 'DD/MM/YYYY');
}

/** Số ngày từ `fromIso` tới `toIso` (dương khi `toIso` sau `fromIso`). */
export function daysBetween(fromIso: string, toIso: string): number {
  return dayjs(toIso).diff(dayjs(fromIso), 'day');
}

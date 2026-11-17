import dayjs from 'dayjs';

import { finiteOr } from './number.utils';

/**
 * format.utils — định dạng số / tiền / % / ngày để hiển thị (locale vi-VN).
 *
 * Lưu ý:  ⛔ số luôn lọc qua `finiteOr` trước (`NaN` / `Infinity` → 0): `Intl.NumberFormat` in thẳng chữ "NaN"
 *         ra màn hình. Dùng `Intl.NumberFormat` gốc, KHÔNG thêm thư viện định dạng số.
 */

const VND = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const USD = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Tiền tệ: `formatCurrency(500000)` → `"500.000 ₫"`. VND không có phần lẻ; USD luôn 2 chữ số lẻ. */
export function formatCurrency(value: number, currency: 'VND' | 'USD' = 'VND'): string {
  const safe = finiteOr(value);
  return currency === 'VND' ? `${VND.format(safe)} ₫` : `$${USD.format(safe)}`;
}

const NUMBER_CACHE = new Map<string, Intl.NumberFormat>();

/**
 * Số vi-VN ngăn hàng nghìn, tối đa `decimals` chữ số lẻ (mặc định 0), tối thiểu `minDecimals` (mặc định = `decimals`):
 * `formatNumber(1234.5, 1)` → `"1.234,5"` · `formatNumber(1.5, 3, 0)` → `"1,5"` (bỏ số 0 thừa).
 */
export function formatNumber(value: number, decimals = 0, minDecimals = decimals): string {
  const key = `${minDecimals}:${decimals}`;
  let fmt = NUMBER_CACHE.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: decimals,
    });
    NUMBER_CACHE.set(key, fmt);
  }
  return fmt.format(finiteOr(value));
}

/**
 * Phần trăm, số theo THANG 100, đúng `decimals` chữ số lẻ (mặc định 1):
 * `formatPercent(12.5)` → `"12,5%"` · `formatPercent(72, 0)` → `"72%"`.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${formatNumber(value, decimals)}%`;
}

/** Ngày (mặc định DD/MM/YYYY). */
export function formatDate(date: Date | string, format = 'DD/MM/YYYY'): string {
  return dayjs(date).format(format);
}

/**
 * Thời điểm dạng "HH:mm · DD/MM/YYYY" (vd `"16:52 · 02/07/2026"`) — dùng cho
 * dòng phụ của dashboard. Bỏ trống tham số → lấy thời điểm gọi.
 */
export function formatNow(date: Date | string = new Date()): string {
  return dayjs(date).format('HH:mm · DD/MM/YYYY');
}

/** "Vừa xong" · "N phút / giờ / ngày trước"; mốc tương lai hoặc từ 30 ngày trước trở đi → `formatDate`. */
export function formatRelativeTime(date: Date | string): string {
  const diff = dayjs().diff(dayjs(date), 'minute');
  if (diff < 0) return formatDate(date);
  if (diff < 1) return 'Vừa xong';
  if (diff < 60) return `${diff} phút trước`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(date);
}

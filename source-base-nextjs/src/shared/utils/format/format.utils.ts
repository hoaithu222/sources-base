import dayjs from 'dayjs';

import { DEFAULT_LOCALE, type Locale } from '@/core/i18n/locales';

import { finiteOr } from './number.utils';

/**
 * format.utils — định dạng số / tiền / % / ngày để hiển thị; mặc định locale vi-VN.
 *
 * Dùng:   formatNumber(1234.5, 1) → "1.234,5"   ·   formatNumber(1234.5, 1, undefined, 'en') → "1,234.5"
 *         Component truyền `useLocale()` (next-intl) vào tham số cuối `locale` để chữ / số theo ngôn ngữ đang hiển thị.
 * Lưu ý:  ⛔ số luôn lọc qua `finiteOr` trước (`NaN` / `Infinity` → 0): `Intl.NumberFormat` in thẳng chữ "NaN"
 *         ra màn hình. Dùng `Intl.NumberFormat` gốc, KHÔNG thêm thư viện định dạng số. Hàm THUẦN (không hook):
 *         `locale` bỏ trống = tiếng Việt, đầu ra giữ nguyên như trước khi có đa ngôn ngữ.
 */

/** Mã BCP-47 cho `Intl` của từng ngôn ngữ app. */
const INTL_LOCALE: Record<Locale, string> = { vi: 'vi-VN', en: 'en-US' };

/** Mẫu ngày mặc định theo ngôn ngữ (dayjs): Việt `DD/MM/YYYY`, Anh `MM/DD/YYYY`. */
const DATE_FORMAT: Record<Locale, string> = { vi: 'DD/MM/YYYY', en: 'MM/DD/YYYY' };

const VND = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 });
const USD = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const CURRENCY_CACHE = new Map<string, Intl.NumberFormat>();

function currencyFormat(locale: Locale, currency: 'VND' | 'USD'): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  let fmt = CURRENCY_CACHE.get(key);
  if (!fmt) {
    const fractionDigits = currency === 'VND' ? 0 : 2;
    fmt = new Intl.NumberFormat(INTL_LOCALE[locale], {
      style: 'currency',
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    CURRENCY_CACHE.set(key, fmt);
  }
  return fmt;
}

/**
 * Tiền tệ: `formatCurrency(500000)` → `"500.000 ₫"`. VND không có phần lẻ; USD luôn 2 chữ số lẻ.
 * `locale` khác `vi` → kiểu `Intl` của ngôn ngữ đó (`'en'`: `"₫500,000"` · `"$500.00"`).
 */
export function formatCurrency(
  value: number,
  currency: 'VND' | 'USD' = 'VND',
  locale: Locale = DEFAULT_LOCALE,
): string {
  const safe = finiteOr(value);
  if (locale !== 'vi') return currencyFormat(locale, currency).format(safe);
  return currency === 'VND' ? `${VND.format(safe)} ₫` : `$${USD.format(safe)}`;
}

const NUMBER_CACHE = new Map<string, Intl.NumberFormat>();

/**
 * Số theo locale (mặc định vi-VN) ngăn hàng nghìn, tối đa `decimals` chữ số lẻ (mặc định 0), tối thiểu `minDecimals`
 * (mặc định = `decimals`): `formatNumber(1234.5, 1)` → `"1.234,5"` · `formatNumber(1.5, 3, 0)` → `"1,5"` (bỏ số 0 thừa).
 */
export function formatNumber(
  value: number,
  decimals = 0,
  minDecimals = decimals,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const key = `${locale}:${minDecimals}:${decimals}`;
  let fmt = NUMBER_CACHE.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(INTL_LOCALE[locale], {
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
export function formatPercent(
  value: number,
  decimals = 1,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return `${formatNumber(value, decimals, decimals, locale)}%`;
}

/** Ngày (mặc định theo ngôn ngữ: vi `DD/MM/YYYY` · en `MM/DD/YYYY`); `format` tường minh (dayjs) thì dùng đúng mẫu đó. */
export function formatDate(
  date: Date | string,
  format?: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  return dayjs(date).format(format ?? DATE_FORMAT[locale]);
}

/**
 * Thời điểm dạng "HH:mm · DD/MM/YYYY" (vd `"16:52 · 02/07/2026"`; en: `"16:52 · 07/02/2026"`) — dùng cho
 * dòng phụ của dashboard. Bỏ trống tham số → lấy thời điểm gọi.
 */
export function formatNow(
  date: Date | string = new Date(),
  locale: Locale = DEFAULT_LOCALE,
): string {
  return dayjs(date).format(`HH:mm · ${DATE_FORMAT[locale]}`);
}

const JUST_NOW: Record<Locale, string> = { vi: 'Vừa xong', en: 'Just now' };

const RELATIVE_VI = { minute: 'phút', hour: 'giờ', day: 'ngày' } as const;

const RELATIVE_CACHE = new Map<Locale, Intl.RelativeTimeFormat>();

/** "N phút / giờ / ngày trước" — tiếng Việt ghép chuỗi cố định; ngôn ngữ khác dùng `Intl.RelativeTimeFormat`. */
function agoLabel(amount: number, unit: keyof typeof RELATIVE_VI, locale: Locale): string {
  if (locale === 'vi') return `${amount} ${RELATIVE_VI[unit]} trước`;
  let fmt = RELATIVE_CACHE.get(locale);
  if (!fmt) {
    fmt = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: 'auto' });
    RELATIVE_CACHE.set(locale, fmt);
  }
  return fmt.format(-amount, unit);
}

/**
 * "Vừa xong" · "N phút / giờ / ngày trước" (en: "Just now" · "5 minutes ago"); mốc tương lai hoặc từ 30 ngày trước trở
 * đi → `formatDate`.
 */
export function formatRelativeTime(date: Date | string, locale: Locale = DEFAULT_LOCALE): string {
  const diff = dayjs().diff(dayjs(date), 'minute');
  if (diff < 0) return formatDate(date, undefined, locale);
  if (diff < 1) return JUST_NOW[locale];
  if (diff < 60) return agoLabel(diff, 'minute', locale);
  const hours = Math.floor(diff / 60);
  if (hours < 24) return agoLabel(hours, 'hour', locale);
  const days = Math.floor(hours / 24);
  if (days < 30) return agoLabel(days, 'day', locale);
  return formatDate(date, undefined, locale);
}

import { DEFAULT_LOCALE, type Locale } from '@/core/i18n/locales';

import { formatNumber } from './format.utils';
import { isFiniteNumber } from './number.utils';

/**
 * money.utils — định dạng tiền VND tự chọn đơn vị: tỷ / triệu ("tr") / đồng ("đ").
 *
 * Dùng:   formatMoneyCompact(12.345) → { text: '12', suffix: 'tỷ' }   (ô bảng, KPI)
 *         formatMoneyDetail(12.345) → '12,345 tỷ'   (tooltip)
 *         Tham số cuối `locale` (truyền `useLocale()`): `'en'` → số kiểu en-US + đơn vị B / M / ₫ ("billion" / "million" ở dạng đầy đủ).
 * Lưu ý:  ⛔ đơn vị gốc của mọi hàm là TỶ (VND × 10^9), trừ `...Raw` nhận số ĐỒNG. `null` / `NaN` / `±Infinity`
 *         → "0" chứ không in "NaN" (guard bằng `isFiniteNumber`). `locale` bỏ trống = tiếng Việt, đầu ra như cũ.
 */

/** Tự chọn theo độ lớn: ≥ 1 tỷ → `'ty'` · ≥ 0.001 tỷ (= 1 triệu) → `'tr'` · nhỏ hơn → `'dong'`. */
export type MoneyScale = 'ty' | 'tr' | 'dong';

interface MoneyUnits {
  compact: Record<MoneyScale, string>;
  detail: Record<MoneyScale, string>;
}

/** Đơn vị tiền theo ngôn ngữ: `compact` = hậu tố gọn (ô bảng, KPI) · `detail` = tên đơn vị đầy đủ (tooltip). */
const MONEY_UNITS: Record<Locale, MoneyUnits> = {
  vi: {
    compact: { ty: 'tỷ', tr: 'tr', dong: 'đ' },
    detail: { ty: 'tỷ', tr: 'triệu', dong: 'đ' },
  },
  en: {
    compact: { ty: 'B', tr: 'M', dong: '₫' },
    detail: { ty: 'billion', tr: 'million', dong: '₫' },
  },
};

export interface MoneyCompactResult {
  /** Số đã định dạng theo locale (vi-VN: chấm ngăn hàng nghìn, phẩy thập phân): "12.345" · "789" · "500.000". */
  text: string;
  /** Hậu tố tách riêng để UI style (mờ hơn, nhỏ hơn): `'tỷ'` · `'tr'` · `'đ'` (en: `'B'` · `'M'` · `'₫'`); rỗng khi 0 / không hợp lệ. */
  suffix: string;
  scale: MoneyScale;
}

function pickScale(valueTy: number): MoneyScale {
  const v = Math.abs(valueTy);
  if (v >= 1) return 'ty';
  if (v >= 0.001) return 'tr';
  return 'dong';
}

/**
 * Dạng gọn (ô bảng, KPI): FLOOR + hậu tố "tỷ" / "tr" / "đ"; 0 / null / NaN → `{ text: '0', suffix: '' }`.
 * `forceScale` ép một đơn vị (2.446 tỷ + `'tr'` → "2.446.000 tr"); `fractionDigits` giữ N số lẻ (floor, không
 * làm tròn lên) cho cả tỷ lẫn tr; `padFraction` in đủ số lẻ ("15" → "15,0"): bật cho cột bảng, tắt cho chart / KPI.
 */
export function formatMoneyCompact(
  valueTy: number | null | undefined,
  forceScale?: MoneyScale,
  fractionDigits = 0,
  padFraction = false,
  locale: Locale = DEFAULT_LOCALE,
): MoneyCompactResult {
  if (!isFiniteNumber(valueTy) || valueTy === 0) {
    const zero =
      padFraction && fractionDigits > 0
        ? formatNumber(0, fractionDigits, fractionDigits, locale)
        : '0';
    return { text: zero, suffix: '', scale: forceScale ?? 'ty' };
  }
  const sign = valueTy < 0 ? '-' : '';
  const abs = Math.abs(valueTy);
  const scale = forceScale ?? pickScale(valueTy);

  const factor = 10 ** fractionDigits;
  const minDigits = padFraction ? fractionDigits : 0;
  const suffix = MONEY_UNITS[locale].compact[scale];
  const toText = (scaled: number) =>
    `${sign}${formatNumber(Math.floor(scaled * factor) / factor, fractionDigits, minDigits, locale)}`;

  if (scale === 'ty') {
    return { text: toText(abs), suffix, scale };
  }
  if (scale === 'tr') {
    return { text: toText(abs * 1_000), suffix, scale };
  }
  return {
    text: `${sign}${formatNumber(Math.floor(abs * 1_000_000_000), 0, 0, locale)}`,
    suffix,
    scale,
  };
}

/**
 * Dạng đầy đủ cho tooltip / title: tối đa 3 số lẻ + đơn vị chữ "tỷ" / "triệu" / "đ" (en: "billion" / "million" / "₫"); 0 / null → "0 đ".
 * Truyền CÙNG `forceScale` với `formatMoneyCompact` để tooltip khớp số hiển thị ("12.345 tr" → "12.345 triệu").
 */
export function formatMoneyDetail(
  valueTy: number | null | undefined,
  forceScale?: MoneyScale,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const units = MONEY_UNITS[locale].detail;
  if (!isFiniteNumber(valueTy) || valueTy === 0) {
    return `0 ${units[forceScale ?? 'dong']}`;
  }
  const scale = forceScale ?? pickScale(valueTy);
  if (scale === 'ty') {
    return `${formatNumber(valueTy, 3, 0, locale)} ${units.ty}`;
  }
  if (scale === 'tr') {
    return `${formatNumber(valueTy * 1_000, 3, 0, locale)} ${units.tr}`;
  }
  return `${formatNumber(Math.round(valueTy * 1_000_000_000), 0, 0, locale)} ${units.dong}`;
}

/** `formatMoneyCompact` gộp text + suffix thành một chuỗi ("12 tỷ") — cho tooltip text, CSV export. */
export function formatMoneyCompactInline(
  valueTy: number | null | undefined,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const r = formatMoneyCompact(valueTy, undefined, 0, false, locale);
  return r.suffix ? `${r.text} ${r.suffix}` : r.text;
}

/**
 * Như `formatMoneyCompact` nhưng nhận số ĐỒNG thô (tự chia 1e9) — đừng tự chia ở từng nơi gọi.
 * `formatMoneyCompactRaw(119_710_000_000, 1)` → `{ text: '119,7', suffix: 'tỷ' }`.
 */
export function formatMoneyCompactRaw(
  valueDong: number | null | undefined,
  fractionDigits = 0,
  padFraction = false,
  locale: Locale = DEFAULT_LOCALE,
): MoneyCompactResult {
  if (!isFiniteNumber(valueDong)) return formatMoneyCompact(valueDong, undefined, 0, false, locale);
  return formatMoneyCompact(
    valueDong / 1_000_000_000,
    undefined,
    fractionDigits,
    padFraction,
    locale,
  );
}

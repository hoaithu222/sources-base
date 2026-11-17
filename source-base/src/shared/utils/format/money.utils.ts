import { formatNumber } from './format.utils';
import { isFiniteNumber } from './number.utils';

/**
 * money.utils — định dạng tiền VND tự chọn đơn vị: tỷ / triệu ("tr") / đồng ("đ").
 *
 * Dùng:   formatMoneyCompact(12.345) → { text: '12', suffix: 'tỷ' }   (ô bảng, KPI)
 *         formatMoneyDetail(12.345) → '12,345 tỷ'   (tooltip)
 * Lưu ý:  ⛔ đơn vị gốc của mọi hàm là TỶ (VND × 10^9), trừ `...Raw` nhận số ĐỒNG. `null` / `NaN` / `±Infinity`
 *         → "0" chứ không in "NaN" (guard bằng `isFiniteNumber`).
 */

/** Tự chọn theo độ lớn: ≥ 1 tỷ → `'ty'` · ≥ 0.001 tỷ (= 1 triệu) → `'tr'` · nhỏ hơn → `'dong'`. */
export type MoneyScale = 'ty' | 'tr' | 'dong';

export interface MoneyCompactResult {
  /** Số đã định dạng vi-VN (chấm ngăn hàng nghìn, phẩy thập phân): "12.345" · "789" · "500.000". */
  text: string;
  /** Hậu tố tách riêng để UI style (mờ hơn, nhỏ hơn): `'tỷ'` · `'tr'` · `'đ'`; rỗng khi 0 / không hợp lệ. */
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
): MoneyCompactResult {
  if (!isFiniteNumber(valueTy) || valueTy === 0) {
    const zero = padFraction && fractionDigits > 0 ? formatNumber(0, fractionDigits) : '0';
    return { text: zero, suffix: '', scale: forceScale ?? 'ty' };
  }
  const sign = valueTy < 0 ? '-' : '';
  const abs = Math.abs(valueTy);
  const scale = forceScale ?? pickScale(valueTy);

  const factor = 10 ** fractionDigits;
  const minDigits = padFraction ? fractionDigits : 0;
  const toText = (scaled: number) =>
    `${sign}${formatNumber(Math.floor(scaled * factor) / factor, fractionDigits, minDigits)}`;

  if (scale === 'ty') {
    return { text: toText(abs), suffix: 'tỷ', scale };
  }
  if (scale === 'tr') {
    return { text: toText(abs * 1_000), suffix: 'tr', scale };
  }
  return {
    text: `${sign}${formatNumber(Math.floor(abs * 1_000_000_000))}`,
    suffix: 'đ',
    scale,
  };
}

/**
 * Dạng đầy đủ cho tooltip / title: tối đa 3 số lẻ + đơn vị chữ "tỷ" / "triệu" / "đ"; 0 / null → "0 đ".
 * Truyền CÙNG `forceScale` với `formatMoneyCompact` để tooltip khớp số hiển thị ("12.345 tr" → "12.345 triệu").
 */
export function formatMoneyDetail(
  valueTy: number | null | undefined,
  forceScale?: MoneyScale,
): string {
  if (!isFiniteNumber(valueTy) || valueTy === 0) {
    if (forceScale === 'ty') return '0 tỷ';
    if (forceScale === 'tr') return '0 triệu';
    return '0 đ';
  }
  const scale = forceScale ?? pickScale(valueTy);
  if (scale === 'ty') {
    return `${formatNumber(valueTy, 3, 0)} tỷ`;
  }
  if (scale === 'tr') {
    return `${formatNumber(valueTy * 1_000, 3, 0)} triệu`;
  }
  return `${formatNumber(Math.round(valueTy * 1_000_000_000))} đ`;
}

/** `formatMoneyCompact` gộp text + suffix thành một chuỗi ("12 tỷ") — cho tooltip text, CSV export. */
export function formatMoneyCompactInline(valueTy: number | null | undefined): string {
  const r = formatMoneyCompact(valueTy);
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
): MoneyCompactResult {
  if (!isFiniteNumber(valueDong)) return formatMoneyCompact(valueDong);
  return formatMoneyCompact(valueDong / 1_000_000_000, undefined, fractionDigits, padFraction);
}

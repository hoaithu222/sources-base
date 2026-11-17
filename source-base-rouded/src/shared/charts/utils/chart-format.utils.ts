import { formatNumber } from '@/shared/utils/format/format.utils';
import { isFiniteNumber } from '@/shared/utils/format/number.utils';

/**
 * chart-format.utils — số trên chart: nhãn đỉnh cột SỐ NGUYÊN (`labelInt`), tooltip thập phân đầy đủ (`fmt3`).
 * Cả hai đi qua `formatNumber` (vi-VN, `Intl` dựng một lần) và ẩn 0 / `null` / `NaN` (trả `''`).
 */

/** Số nguyên + dấu phân tách hàng nghìn: `labelInt(1234.4)` → `'1.234'`. Dùng cho nhãn đỉnh cột. */
export function labelInt(v: number | null | undefined): string {
  if (!isFiniteNumber(v) || v === 0) return '';
  return formatNumber(Math.round(v));
}

/** Tối đa 3 chữ số lẻ, bỏ số 0 thừa: `fmt3(1.5)` → `'1,5'`. Dùng cho tooltip (thêm đơn vị ở nơi gọi). */
export function fmt3(v: number | null | undefined): string {
  if (!isFiniteNumber(v) || v === 0) return '';
  return formatNumber(Math.round(v * 1000) / 1000, 3, 0);
}

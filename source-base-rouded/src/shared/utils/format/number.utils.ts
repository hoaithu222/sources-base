/**
 * number.utils — chốt chặn số trước khi ĐEM HIỂN THỊ: không để `NaN`, `Infinity`, `undefined` lọt ra màn hình.
 *
 * Lưu ý:  ⛔ lớp CUỐI (hiển thị), KHÔNG phải chỗ chữa dữ liệu sai: số hỏng lọt tới đây chỉ ra "—" / "0"
 *         thay vì "NaN" — nguồn vẫn phải sửa.
 */

/** `true` khi là số thực dùng được (loại `NaN`, `±Infinity`, `null`, chuỗi…). */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Số dùng được, hoặc `fallback` (mặc định `0`): `finiteOr(Number(v))`. */
export function finiteOr(value: number | null | undefined, fallback = 0): number {
  return isFiniteNumber(value) ? value : fallback;
}

/**
 * Phần trăm `part / whole × 100` làm tròn tới `fractionDigits` chữ số lẻ; `null` khi KHÔNG tính được
 * (mẫu số 0 / rỗng / hỏng, hoặc tử số hỏng). Hiển thị `null` thành "—" (`percentOf(a, b, 1) ?? '—'`): ép về
 * `0%` là nói dối — "chưa có kế hoạch" khác "có kế hoạch nhưng chưa làm được gì".
 */
export function percentOf(
  part: number | null | undefined,
  whole: number | null | undefined,
  fractionDigits = 0,
): number | null {
  if (!isFiniteNumber(part) || !isFiniteNumber(whole) || whole === 0) return null;
  const factor = 10 ** fractionDigits;
  return Math.round((part / whole) * 100 * factor) / factor;
}

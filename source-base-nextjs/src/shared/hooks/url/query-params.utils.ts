/** Số nguyên không dấu trong `[min, max]` (không đuôi chữ, không dạng khoa học); thiếu / sai / ngoài khoảng → `fallback`. */
export const readIntInRange = (
  raw: string | null,
  min: number,
  max: number,
  fallback: number,
): number => {
  if (raw === null || !/^\d+$/.test(raw)) return fallback;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback;
};

/** Giá trị một query param: rỗng (`''`) / `null` / `undefined` = XOÁ key đó khỏi URL. */
export type QueryParamValue = string | number | null | undefined;

/**
 * Bản sao `params` đã áp `updates`: giá trị rỗng / `null` / `undefined` xoá key, còn lại `set(String(v))`;
 * key không nhắc tới giữ nguyên. Luật DUY NHẤT cho `useQueryParams.updateParams` và `useNavHref`.
 */
export function applyParamUpdates(
  params: URLSearchParams,
  updates: Record<string, QueryParamValue>,
): URLSearchParams {
  const next = new URLSearchParams(params);
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
  });
  return next;
}

import dayjs from 'dayjs';

/**
 * Giá trị ngày trong form (`'YYYY-MM-DD'` / ISO / `Date`) → `Date` theo giờ ĐỊA PHƯƠNG; rỗng / hỏng → `null`.
 * Không dùng `new Date('YYYY-MM-DD')`: chuỗi chỉ có ngày bị hiểu là nửa đêm UTC, lùi một ngày ở múi giờ âm.
 */
export function toLocalDate(value: unknown): Date | null {
  if (!value || (typeof value !== 'string' && !(value instanceof Date))) return null;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : null;
}

/** `Date` → chuỗi `'YYYY-MM-DD'` lưu vào form; `null` giữ `null`. */
export function toIsoDate(date: Date | null | undefined): string | null {
  return date ? dayjs(date).format('YYYY-MM-DD') : null;
}

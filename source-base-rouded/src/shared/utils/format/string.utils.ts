/** Bỏ dấu tiếng Việt (cả `đ` → `d`): `"Nguyễn"` → `"Nguyen"`. So khớp tìm kiếm thì dùng `normalizeSearch`. */
export function stripDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Dạng chuẩn DUY NHẤT để SO KHỚP tìm kiếm: bỏ dấu → chữ thường → gộp khoảng trắng
 * (`"  Hà  Nội "` → `"ha noi"`). Chỉ `toLowerCase()` là KHÔNG đủ — `docs/rules/interaction/search-matching.md`.
 */
export function normalizeSearch(value: string | null | undefined): string {
  if (!value) return '';
  return stripDiacritics(String(value)).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * `haystack` có chứa `needle` không (bỏ dấu, không phân biệt hoa/thường); `needle` rỗng → luôn khớp.
 * `needle` là chuỗi THÔ người dùng gõ; lọc trong vòng lặp lớn thì `normalizeSearch` một lần rồi gọi
 * `includesNormalized`.
 */
export function includesSearch(
  haystack: string | null | undefined,
  needle: string | null | undefined,
): boolean {
  return includesNormalized(haystack, normalizeSearch(needle));
}

/** Như `includesSearch` nhưng `needle` ĐÃ được `normalizeSearch()` từ trước. */
export function includesNormalized(
  haystack: string | null | undefined,
  normalizedNeedle: string,
): boolean {
  if (!normalizedNeedle) return true;
  return normalizeSearch(haystack).includes(normalizedNeedle);
}

/**
 * Khớp từ khoá trên NHIỀU trường của cùng một bản ghi (mã, tên, ký hiệu…).
 * Trường `null`/`undefined` được bỏ qua.
 */
export function matchesSearch(
  fields: readonly (string | null | undefined)[],
  needle: string | null | undefined,
): boolean {
  const normalized = normalizeSearch(needle);
  if (!normalized) return true;
  return fields.some((field) => includesNormalized(field, normalized));
}

/** Bỏ ký tự đặc biệt, giữ chữ (mọi ngôn ngữ), số và khoảng trắng. */
export function stripSpecialCharacters(str: string): string {
  return str.replace(/[^\p{L}\p{N}\s]/gu, '');
}

/** Cắt còn `maxLength` ký tự rồi nối `...` (đủ ngắn thì giữ nguyên): `truncate('abcdef', 3)` → `'abc...'`. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/** Viết hoa chữ cái đầu: `'hà nội'` → `'Hà nội'`. */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

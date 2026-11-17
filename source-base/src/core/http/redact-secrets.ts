/**
 * Che dữ liệu nhạy cảm trước khi ghi log.
 *
 *   console.log(redactSecrets(response.data));
 *
 * Lưu ý: mọi đường log của tầng HTTP phải đi qua hàm này, kể cả nhánh lỗi.
 */

/** Khoá bị che — so khớp kiểu "có chứa", không phân biệt hoa thường. */
const SECRET_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'apikey',
  'api_key',
  'otp',
  'pin',
];

const REDACTED = '[đã ẩn]';
const TOO_DEEP = '[quá sâu — không in]';
const MAX_DEPTH = 4;

const isSecretKey = (key: string): boolean => {
  const lower = key.toLowerCase();
  return SECRET_KEYS.some((secret) => lower.includes(secret));
};

export function redactSecrets(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object') return value;
  if (typeof FormData !== 'undefined' && value instanceof FormData) return '[FormData]';
  if (depth >= MAX_DEPTH) return TOO_DEEP;
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item, depth + 1));

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      isSecretKey(key) ? REDACTED : redactSecrets(item, depth + 1),
    ]),
  );
}

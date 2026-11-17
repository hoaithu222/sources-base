/**
 * describe-error — phân loại giá trị bị ném (kể cả `null`) để chọn màn lỗi, và ghi bản kỹ thuật ra console với một
 * tiền tố chung. Câu chữ hiển thị nằm ở `messages/<locale>/errors.json` (`screens.chunk` · `screens.error`).
 *
 * Dùng:   const { kind, detail } = describeError(error) · logAppError('Trang không hiển thị được:', error)
 * Lưu ý:  `detail` (thông điệp kỹ thuật gốc) chỉ có ở dev — production không lộ chi tiết lỗi cho người dùng; mã
 *         `error.digest` của Next đủ để đội kỹ thuật tra log server.
 */

export interface ErrorDescription {
  /** `chunk`: không tải được mã của trang (thường do vừa triển khai bản mới). `unexpected`: lỗi khác. */
  kind: 'chunk' | 'unexpected';
  /** Thông điệp kỹ thuật gốc — chỉ ở dev. */
  detail?: string;
}

/** Tiền tố của mọi log lỗi giao diện — lọc console bằng chuỗi này. */
export const APP_ERROR_LOG_PREFIX = '[giao diện]';

/** Thông điệp khi nạp một chunk thất bại (Chrome · Firefox · Safari · webpack / Turbopack). */
const CHUNK_ERROR_PATTERNS = [
  'ChunkLoadError',
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Importing a module script failed',
  'Failed to load module script',
  'Unable to preload CSS',
  'Loading chunk',
  'Loading CSS chunk',
  'MIME type',
];

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return CHUNK_ERROR_PATTERNS.some(
    (pattern) => error.name.includes(pattern) || error.message.includes(pattern),
  );
}

/**
 * @param showDetail Kèm thông điệp kỹ thuật gốc; mặc định chỉ ở dev.
 */
export function describeError(
  error: unknown,
  showDetail: boolean = process.env.NODE_ENV !== 'production',
): ErrorDescription {
  if (isChunkLoadError(error)) return { kind: 'chunk' };

  const detail = error instanceof Error ? error.message : '';
  return { kind: 'unexpected', detail: showDetail && detail ? detail : undefined };
}

/** Ghi lỗi ra console: `[giao diện] <message>` rồi tới chi tiết (lỗi gốc, component stack…). */
export function logAppError(message: string, ...details: unknown[]): void {
  console.error(`${APP_ERROR_LOG_PREFIX} ${message}`, ...details);
}

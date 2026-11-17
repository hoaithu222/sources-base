import { errorMessages } from './error-messages';

/**
 * `AppError` — dạng lỗi duy nhất đi ra khỏi tầng HTTP, và là lỗi DUY NHẤT có câu lên giao diện.
 *
 *   error.kind        → quyết định xử lý (thử lại? báo người dùng? im lặng?)
 *   error.message     → câu tiếng Việt, hiển thị được ngay
 *   error.code        → mã lỗi của BE (vd `AUTH_001`) để rẽ nhánh nghiệp vụ
 *   error.fieldErrors → lỗi theo từng ô nhập, gắn vào form bằng `useServerErrors`
 *
 * Màn hình muốn báo một câu riêng thì ném `new AppError('business', 'Mã đã được sử dụng')`.
 * Dựng `AppError` từ dữ liệu thô: `to-app-error.ts`.
 */

export type AppErrorKind =
  /** Chỗ gọi tự huỷ (AbortSignal) — không báo cho người dùng. */
  | 'canceled'
  /** Không có phản hồi: mất mạng, DNS, CORS. */
  | 'network'
  /** Quá thời gian chờ, kể cả HTTP 408. */
  | 'timeout'
  /** 401. */
  | 'unauthorized'
  /** 403. */
  | 'forbidden'
  /** 404. */
  | 'not_found'
  /** 400/422 kèm lỗi theo từng trường. */
  | 'validation'
  /** BE từ chối vì lý do nghiệp vụ, kể cả `status: false` kèm HTTP 2xx. */
  | 'business'
  /** 5xx. */
  | 'server'
  /** Phản hồi không đúng hình dạng đã thống nhất. */
  | 'contract'
  | 'unknown';

interface AppErrorOptions {
  status?: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  readonly kind: AppErrorKind;
  /** HTTP status, nếu máy chủ có trả lời. */
  readonly status?: number;
  readonly code?: string;
  /** Vd `{ email: ['Email đã được sử dụng'] }`. */
  readonly fieldErrors?: Record<string, string[]>;
  readonly details?: unknown;
  /** `true` = đã báo cho người dùng. Chỉ `claimErrorMessage` đọc / ghi cờ này. */
  notified = false;

  constructor(kind: AppErrorKind, message: string, options: AppErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'AppError';
    this.kind = kind;
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
    this.details = options.details;
  }
}

export const isAppError = (error: unknown): error is AppError => error instanceof AppError;

/** `true` khi lỗi do hạ tầng (mạng, timeout, 5xx, 429) — đáng thử lại. */
export function isRetryableError(error: unknown): boolean {
  if (!isAppError(error)) return false;
  return (
    error.kind === 'network' ||
    error.kind === 'timeout' ||
    error.kind === 'server' ||
    error.status === 429
  );
}

/** Câu hiển thị cho một lỗi bất kỳ: `message` của `AppError`, còn lại dùng `fallback`. */
export function errorMessageOf(error: unknown, fallback = errorMessages().fallback): string {
  return isAppError(error) ? error.message : fallback;
}

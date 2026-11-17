import { toAppError } from './to-app-error';

/**
 * Nơi DUY NHẤT quyết "lỗi này có báo cho người dùng không" — bộ báo lỗi tập trung (`@/core/query`)
 * và `showErrorToast` (`@/shared/ui`) cùng đi qua đây, nên một lỗi không bao giờ hiện hai lần.
 *
 *   const message = claimErrorMessage(error, { message: 'Không xoá được kế hoạch' });
 *   if (message !== null) hiện(message);   // lần gọi sau với cùng lỗi trả null
 *
 * Trả `null` (không báo): request bị huỷ · 401 (phiên hết hạn đã có thông báo riêng) · lỗi đã báo.
 * Lỗi không phải `AppError` hiện `fallback`, không bao giờ hiện câu thô của nó.
 */

export interface ClaimErrorMessageOptions {
  /** Câu riêng thay cho câu của lỗi. */
  message?: string;
  /** Câu cho lỗi không phải `AppError`; mặc định câu `errors.http.fallback`. */
  fallback?: string;
}

export function claimErrorMessage(
  error: unknown,
  { message, fallback }: ClaimErrorMessageOptions = {},
): string | null {
  const appError = toAppError(error, fallback);
  if (appError.notified || appError.kind === 'canceled' || appError.kind === 'unauthorized') {
    return null;
  }
  appError.notified = true;
  return message ?? appError.message;
}

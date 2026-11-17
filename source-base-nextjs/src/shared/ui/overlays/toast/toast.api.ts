import { claimErrorMessage } from '@/core/http';
import type { ClaimErrorMessageOptions } from '@/core/http';
import type { ToastActionSpec, ToastType } from './Toast';
import { useToastStore } from './toast.store';

/**
 * API mệnh lệnh của Toast — gọi ở bất cứ đâu; `ToastContainer` (đã gắn ở `AppOverlays`) sẽ hiện.
 *
 *   showToast('success', 'Đã lưu');
 *   const id = showToast('info', 'Đang nhập…', { duration: Infinity });   // rồi dismissToast(id)
 *   catch (error) { showErrorToast(error, { message: 'Không xoá được kế hoạch' }); }
 *
 * Lưu ý: lỗi query / mutation đã được báo tập trung — muốn câu riêng thì khai
 * `meta: { silentError: true }` rồi gọi `showErrorToast` trong `onError` (`api-patterns.md §3`).
 */

interface ToastOptions {
  /** ms; mặc định 3000. `Infinity` = không tự tắt. */
  duration?: number;
  description?: string;
  /** Nút hành động trong toast, vd "Hoàn tác". */
  action?: ToastActionSpec;
}

/** Trả `id` để `dismissToast(id)` / `updateToast(id, …)` sau. */
export function showToast(type: ToastType, message: string, options?: ToastOptions): string {
  return useToastStore.getState().add({
    type,
    title: message,
    description: options?.description,
    duration: options?.duration ?? 3000,
    action: options?.action,
  });
}

/**
 * Toast lỗi cho `onError` / `catch`; bỏ qua lỗi đã báo, request huỷ và 401 (`claimErrorMessage`).
 * `message` = câu riêng; `fallback` = câu cho lỗi không phải `AppError`. Bỏ qua thì trả `undefined`.
 */
export function showErrorToast(
  error: unknown,
  { message, fallback, ...options }: ClaimErrorMessageOptions & ToastOptions = {},
): string | undefined {
  const claimed = claimErrorMessage(error, { message, fallback });
  return claimed === null ? undefined : showToast('error', claimed, options);
}

export function dismissToast(id: string): void {
  useToastStore.getState().remove(id);
}

interface UpdateToastPatch {
  type?: ToastType;
  title?: string;
  description?: string;
  duration?: number;
}

/** Sửa nội dung / loại của toast đang hiện — không tạo toast mới. */
export function updateToast(id: string, patch: UpdateToastPatch): void {
  useToastStore.getState().update(id, patch);
}

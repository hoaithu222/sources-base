import { useServerTaskStore } from './server-tasks';
import { useUploadQueueStore } from './upload-queue';

/**
 * resetProgressCenter — bỏ toàn bộ state tiến trình phía trình duyệt khi đổi / mất tài khoản.
 *
 * Dùng:   resetProgressCenter();   // gọi cùng `queryClient.clear()` ở `app/bootstrap.ts`
 * Lưu ý:  huỷ upload đang chạy và xoá cả hàng đợi; thẻ tác vụ máy chủ (nhập Excel…) chỉ bị gỡ khỏi màn
 *         hình — việc phía máy chủ vẫn chạy tiếp, lời gọi cập nhật muộn không dựng lại thẻ.
 */

export function resetProgressCenter(): void {
  useUploadQueueStore.getState().cancel();
  useServerTaskStore.getState().clear();
}

import type { QueryClient } from '@tanstack/react-query';

import { configureHttp } from '@/core/http';
import {
  getAccessToken,
  onSessionEnd,
  refreshAccessToken,
  startSessionSync,
} from '@/domains/session';
import { resetProgressCenter } from '@/shared/widgets/progress-center';

/**
 * bootstrapApp — khởi tạo phía TRÌNH DUYỆT trước khi cây con gọi API, trả disposer.
 *
 * Dùng:   const dispose = bootstrapApp({ queryClient, onSessionExpired });  — `SessionBootstrap` gọi trong `useLayoutEffect`
 *         (layout effect chạy trước MỌI `useEffect` của cây con nên API đầu tiên đã có token adapter); gọi trùng trả cùng disposer.
 * Lưu ý:  dispose dừng listener và gỡ cấu hình HTTP; TEST phải gọi sau mỗi lượt. Phiên kết thúc / đổi tài khoản
 *         (`onSessionEnd`, kể cả `switched`) xoá cache + hàng đợi tải lên + thẻ tác vụ — docs/notes/code/app.md (## bootstrap).
 *         Cấu hình theo ngôn ngữ (thông báo lỗi, Zod) KHÔNG ở đây — `LocaleSync`.
 */

interface BootstrapOptions {
  queryClient: QueryClient;
  /** Hiện thông báo phiên hết hạn (đã dịch theo ngôn ngữ đang hiển thị). */
  onSessionExpired: () => void;
}

let disposeApp: (() => void) | undefined;

export function bootstrapApp({ queryClient, onSessionExpired }: BootstrapOptions): () => void {
  if (disposeApp) return disposeApp;
  const cleanups: (() => void)[] = [];

  try {
    configureHttp({ auth: { getAccessToken, refreshAccessToken } });
    cleanups.push(
      onSessionEnd((reason) => {
        queryClient.clear();
        resetProgressCenter();
        if (reason === 'expired') onSessionExpired();
      }),
    );
    cleanups.push(startSessionSync());
  } catch (error) {
    cleanups.reverse().forEach((cleanup) => cleanup());
    configureHttp({});
    throw error;
  }

  const dispose = () => {
    if (disposeApp !== dispose) return;
    disposeApp = undefined;
    cleanups.reverse().forEach((cleanup) => cleanup());
    configureHttp({});
  };
  disposeApp = dispose;
  return dispose;
}

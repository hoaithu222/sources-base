import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/shell/store/slices/auth';
import { authService } from '@/core/api/auth';
import { refreshSession } from '@/core/api/session';
import { appConfig } from '@/core/config/env.config';

/**
 * Khôi phục phiên lúc khởi động app.
 *
 * ── Vì sao phải có bước này ──────────────────────────────────────────────────
 * Access token cố ý KHÔNG được lưu xuống ổ đĩa (xem `auth.config.ts`), nên sau
 * khi đóng và mở lại app thì trong bộ nhớ không còn token nào. Thứ còn lại là
 * refresh token trong kho khoá hệ điều hành. Hook này đổi nó lấy một access
 * token mới, rồi lấy hồ sơ người dùng.
 *
 * ── Ba trạng thái phải phân biệt, không được gộp ─────────────────────────────
 *
 *   `restoring`     — đang hỏi. Guard PHẢI chờ, chưa được kết luận gì.
 *   `authenticated` — có token mới.
 *   `anonymous`     — đã hỏi và chắc chắn không có phiên.
 *
 * Gộp `restoring` vào `anonymous` là bug mà người dùng gặp mỗi lần mở app: màn
 * đăng nhập chớp lên rồi biến mất. Với người dùng, đó đọc ra là "app hay tự
 * đăng xuất" — và họ sẽ không tin app nữa.
 */
export function useSessionBootstrap(): { isSessionReady: boolean } {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const status = useAuthStore((state) => state.status);

  /**
   * Chạy ĐÚNG MỘT LẦN mỗi vòng đời app.
   *
   * Dùng ref chứ không dựa vào mảng dependency: ở chế độ nghiêm ngặt của React,
   * effect chạy hai lần lúc phát triển, và hai lượt refresh song song lúc khởi
   * động là đúng thứ khiến backend xoay-vòng-token thu hồi cả phiên. Bug này chỉ
   * xuất hiện ở bản dev nên rất dễ bị bỏ qua rồi bật lại ở nơi khác.
   */
  const started = useRef(false);

  useEffect(() => {
    // Phải đợi `AsyncStorage` nạp xong: chưa xong thì chưa biết có `user` đã lưu
    // hay không, và ta sẽ ghi đè lên nó.
    if (!hasHydrated || started.current) return;
    started.current = true;

    /**
     * Tắt xác thực ⇒ không gọi gì cả.
     *
     * Base xuất xưởng chưa có backend nào; gọi refresh lúc này chỉ tạo một
     * request đỏ ở MỖI lần mở app, làm người mới tưởng base hỏng.
     */
    if (!appConfig.authEnabled) {
      useAuthStore.getState().setStatus('anonymous');
      return;
    }

    const restore = async (): Promise<void> => {
      useAuthStore.getState().setStatus('restoring');

      const outcome = await refreshSession();

      if (outcome.status !== 'ok') {
        /**
         * ⛔ CẢ HAI nhánh hỏng đều về `anonymous`, nhưng vì lý do khác nhau, và
         * điều đó ảnh hưởng tới việc refresh token có bị xoá hay không:
         *
         *   `unauthenticated` — `refreshSession` đã dọn refresh token rồi. Đúng.
         *   `unavailable`     — mất sóng. Refresh token vẫn còn nguyên trong kho
         *                       khoá, nên lần mở app sau (có sóng) người dùng
         *                       vào thẳng, không phải đăng nhập lại.
         *
         * Ở đây chỉ cần đưa về `anonymous` để guard thôi chặn chờ.
         */
        useAuthStore.getState().setStatus('anonymous');
        return;
      }

      /**
       * Có token rồi thì lấy hồ sơ.
       *
       * Hồ sơ đã lưu trong `AsyncStorage` cũng được dùng để vẽ khung màn hình
       * đầu (tên, ảnh đại diện) — nhưng nó có thể CŨ: người dùng đã đổi tên,
       * hoặc quản trị viên đã đổi quyền của họ. Quyền cũ mà không làm mới thì
       * app hiện những phân hệ mà backend sẽ từ chối.
       *
       * Hồ sơ lấy hỏng KHÔNG làm hỏng phiên: token vẫn tốt, và bản đã lưu vẫn
       * dùng tạm được. Đá người dùng ra vì một lượt `/me` chập chờn là quá tay.
       */
      try {
        const user = await authService.me();
        useAuthStore.getState().setAuth({ user });
      } catch {
        useAuthStore.getState().setStatus('authenticated');
      }
    };

    void restore();
  }, [hasHydrated]);

  /**
   * Đã đủ cơ sở để quyết định điều hướng chưa.
   *
   * `app/_layout.tsx` giữ màn hình chờ tới khi cờ này bật. Hai điều kiện, thiếu
   * cái nào cũng ra màn đăng nhập nhấp nháy:
   *   · `hasHydrated` — đã đọc xong `AsyncStorage`;
   *   · `status` đã rời khỏi `idle`/`restoring` — đã hỏi xong máy chủ.
   */
  return {
    isSessionReady: hasHydrated && status !== 'idle' && status !== 'restoring',
  };
}

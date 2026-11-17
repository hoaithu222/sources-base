import { useEffect } from 'react';

/**
 * `useBeforeUnload(enabled)` — `true` thì rời / tải lại trang hiện hộp thoại xác nhận (vd đang upload dở).
 * Không đổi được nội dung thông báo: trình duyệt bỏ qua message tuỳ biến.
 */
export function useBeforeUnload(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [enabled]);
}

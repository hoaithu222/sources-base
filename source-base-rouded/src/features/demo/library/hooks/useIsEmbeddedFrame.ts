import { useState } from 'react';

/**
 * useIsEmbeddedFrame — trang đang chạy TRONG một `<iframe>` (khung xem thử của Responsive lab).
 *
 * Đọc một lần lúc mount (khung không tự thoát ra ngoài). Cần để khu vực lab không lồng khung trong khung:
 * trong khung nó chỉ còn số đo + chip của CHÍNH khung đó.
 *
 * @returns `true` khi `window.self !== window.top`.
 */
export function useIsEmbeddedFrame(): boolean {
  const [embedded] = useState(() => typeof window !== 'undefined' && window.self !== window.top);
  return embedded;
}

import { useMediaQuery } from './useMediaQuery';

/**
 * Người dùng đã yêu cầu hệ điều hành giảm chuyển động — bản JS của `motion-reduce:`, cùng điều kiện.
 * ⛔ Mọi hiệu ứng TỰ CHẠY (số đếm lên, bảng tự cuộn, sóng nước) PHẢI hỏi hook này và nhảy thẳng tới trạng thái
 * cuối, không phải chạy nhanh hơn.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

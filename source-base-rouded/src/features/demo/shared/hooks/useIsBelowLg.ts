import { useMediaQuery } from '@/shared/hooks';

/** Bản JS của `max-lg:` (rộng < 1024px) — cùng mốc `lg` của `breakpoints.css`. */
const BELOW_LG_QUERY = '(max-width: 1023.98px)';

/**
 * useIsBelowLg — màn HẸP hơn mốc `lg` (1024px): điện thoại và tablet dọc.
 *
 * Chỉ để rẽ nhánh CẤU TRÚC của khung demo (cột mục lục ↔ dải chip, header ngoài ↔ trong vùng cuộn — hai
 * cây DOM, mỗi lần một bản). Chỉnh cỡ / số cột vẫn là việc của `max-lg:`.
 *
 * @returns `true` khi viewport rộng dưới 1024px.
 */
export function useIsBelowLg(): boolean {
  return useMediaQuery(BELOW_LG_QUERY);
}

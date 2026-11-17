/**
 * Media query dùng chung — bản JS của biến thể CSS cùng tên (`styles/theme/variants.css`, `breakpoints.css`).
 * Hai bên PHẢI cùng điều kiện: đổi ở đây thì đổi cả CSS (bài kiểm `policy/display/responsive-foundation` giữ).
 * Dùng qua hook `useIsPhone` · `useIsBelowWide` · `useIsCoarsePointer` (`@/shared/hooks`) — không tự gõ lại chuỗi.
 */

/** Bản JS của biến thể `phone:` — điện thoại dọc (rộng < 768px) HOẶC xoay ngang (cao ≤ 540px và rộng < 1024px). */
export const PHONE_MEDIA_QUERY =
  '(max-width: 767.98px), (max-height: 540px) and (max-width: 1023.98px)';

/** Bản JS của `max-wide:` — mọi màn hẹp hơn mốc `wide` (1800px): laptop 14" / 16", máy tính bảng, điện thoại. */
export const BELOW_WIDE_QUERY = '(max-width: 1799.98px)';

/** Bản JS của biến thể `touch:` — đang chạm bằng ngón tay (không có con trỏ để rê). */
export const TOUCH_MEDIA_QUERY = '(hover: none) and (pointer: coarse)';

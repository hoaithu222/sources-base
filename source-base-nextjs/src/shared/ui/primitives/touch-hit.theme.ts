/**
 * touch-hit.theme — nới HỘP BẤM của điều khiển nhỏ trên máy chạm bằng `::after` trong suốt (hình KHÔNG đổi).
 *
 * Dùng:   cn(TOUCH_HIT_CLASSES.icon, className) trên phần tử bấm được. `icon` nút / ô ~16–24px đứng riêng (→ ~40px
 *         mọi phía) · `inline` nút nhỏ xếp ngang sát nhau (chỉ nới 4px ngang, 12px dọc) · `row` điều khiển rộng mà
 *         thấp (chỉ nới dọc 8px) — ipad-responsive.md §3.3.
 * Lưu ý:  phần tử không được `overflow-hidden`; hai điều khiển kề nhau chỉ nới theo chiều có khe ≥ 2× mức nới.
 */

export const TOUCH_HIT_CLASSES = {
  icon: "relative touch:after:absolute touch:after:-inset-2.5 touch:after:content-['']",
  inline:
    "relative touch:after:absolute touch:after:-inset-x-1 touch:after:-inset-y-3 touch:after:content-['']",
  row: "relative touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-2 touch:after:content-['']",
} as const;

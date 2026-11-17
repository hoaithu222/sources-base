import type { ResponsiveValue } from '@/shared/theme';

/**
 * Phép chia cột của `DemoGrid`, tách ra thành hàm thuần để TEST ĐƯỢC.
 *
 * ⛔ Lý do tách: bậc `minItemWidth` và trần bề rộng của `Screen` là hai thứ ở
 * hai file khác nhau, và khi chúng lệch nhau thì lưới đảo bậc — máy RỘNG hơn
 * cho ÍT cột hơn — mà không có lỗi nào báo. Ca đã xảy ra thật: sàn nới theo bậc
 * (170 ở 600dp, 190 ở 840dp) trong khi khung chứa bị `Screen` kẹp cứng ở 568dp,
 * nên máy 840dp rơi từ 3 cột xuống 2 cột. `tests/features/demo-grid.test.ts`
 * chốt lại điều kiện "số cột KHÔNG BAO GIỜ giảm khi màn rộng ra".
 */

/**
 * Số cột xếp vừa một khung chứa rộng `containerWidth`.
 *
 * Cộng thêm một khe ở CẢ HAI vế vì hàng có N ô thì chỉ có N−1 khe — không cộng
 * bù là thiếu đúng một ô ở các bề rộng vừa khít.
 *
 * `0` nghĩa là chưa đo được khung (nhịp vẽ đầu tiên, trước `onLayout`).
 */
export function gridColumns(containerWidth: number, minItemWidth: number, gap: number): number {
  if (containerWidth <= 0) return 0;
  return Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
}

/**
 * Bề rộng TỐI THIỂU của một ô card loại 2 — `DemoGrid` suy ra SỐ CỘT từ đây.
 *
 * ⛔ Bản vẽ ghi "W: 165.5px" nhưng KHÔNG được viết cứng 165.5 — đó là kết quả
 * của phép tính trên khung 375: (375 − 16×2 − 12) / 2. Trên máy 360dp thì hai
 * cột 165.5 + khe 12 = 343 > 328 và lưới TRÀN ra ngoài mép phải.
 *
 * ⚠️ Sàn phải ĐỔI THEO BẬC, một con số không đủ:
 *   · 138 ở bậc điện thoại — sàn để máy hẹp nhất vẫn giữ đúng 2 cột của bản vẽ
 *     (320 − 16×2 − 12 = 276, chia đôi là 138). Để sàn cao hơn là máy 320dp
 *     tụt xuống MỘT cột, tức là mất luôn hình dáng mà bản vẽ đang minh hoạ.
 *   · 170 từ 600dp và 190 từ 840dp — giữ một con số 138 thì máy tính bảng
 *     1000dp cho ra 6 cột card bé xíu.
 *
 * ⛔ Ba con số này CHỈ đúng khi khung chứa lớn lên theo màn hình. Màn nào dùng
 * chúng phải đặt `<Screen constrained={false}>`: để mặc định thì `Screen` kẹp
 * nội dung ở 600dp, khung đứng yên ở 568dp trong khi sàn vẫn nới — và lưới ĐẢO
 * BẬC (3 cột ở 600dp nhưng chỉ 2 cột ở 840dp). Đó chính là lỗi đã có trong base.
 *
 * ✅ Đây là ca ĐÚNG để dùng `useResponsiveValue`: `minItemWidth` là một con số
 * đi vào prop, không phải `className` — chỗ có class thì vẫn phải viết `tablet:`.
 */
export const CARD_TYPE_2_MIN_WIDTH: ResponsiveValue<number> = {
  base: 138,
  tablet: 170,
  'tablet-lg': 190,
};

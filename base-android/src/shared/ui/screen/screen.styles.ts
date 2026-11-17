import { tv } from 'tailwind-variants';

import { twMergeConfig } from '@/shared/utils/style/cn';

/**
 * Công thức style của `Screen`.
 *
 * Tách khỏi `Screen.tsx` vì file component phải ≤ 200 dòng (xem
 * `docs/rules/code-style.md`), cùng cách chia như `chip/chip.styles.ts`.
 *
 * ── Số đo lấy từ Figma "Background Screen" (`259:94379`) ─────────────────────
 * Bản vẽ chỉ có hai lớp, và ghi chú thiết kế nói rõ "Áp dụng chung cho tất cả
 * màn hình trên app SMB" — nên `gradient` mặc định BẬT:
 *
 *   · nền phẳng  `Background/Gradient/BgScreen2` = `#F0F5F5` → token `bg-base`
 *     (trùng khít, không phải xấp xỉ);
 *   · dải chuyển màu phủ từ đỉnh: `BgHeaderScreen1` (`#A6CDCC` @ 90%) chuyển
 *     xuống đúng màu nền ở mốc **20% chiều cao màn hình** (`to-[20%]` trong bản
 *     vẽ ⇒ ~162dp trên máy mẫu 812dp).
 */
export const screen = tv(
  {
    slots: {
      root: 'flex-1 bg-bg-base',
      /**
       * `h-1/5` = 20% chiều cao màn — ĐÚNG mốc `to-[20%]` của Figma, và tự co
       * giãn theo máy. ⛔ Đừng thay bằng `h-[162px]`: 162 là số đo trên máy mẫu
       * 812dp, trên máy cao 1000dp thì dải này ngắn hẳn so với bản vẽ.
       */
      gradient: 'absolute inset-x-0 top-0 h-1/5',
      body: 'flex-1',
      /**
       * ⛔ KHÔNG có `pt-*` dù màn có `header`: khe 8dp "nội dung cách thanh tiêu đề" (y=126 sau app bar
       * cao 118 trong bản vẽ) thuộc về KHỐI ĐẦU của từng màn (`<View className="gap-xl py-xs">`, như
       * Home/Settings/Profile/demo). Trước đây `Screen` cũng tự đệm `pt-xs` ⇒ 8 + 8 = **16dp** giữa
       * thanh tiêu đề và nội dung, gấp đôi bản vẽ. Màn mới PHẢI để khối đầu có `py-xs`.
       */
      content: 'flex-grow',
      footer: '',
    },
    variants: {
      padded: {
        // 16dp — lề trái/phải của mọi khung nội dung trong Figma (x=16 trong
        // khung 375). Áp cho cả footer để nút không lệch so với nội dung.
        true: { content: 'px-md', footer: 'px-md' },
      },
      /**
       * Trần bề rộng nội dung trên máy tính bảng — xem prop `constrained`.
       *
       * ⚠️ Ba class đi THÀNH BỘ, thiếu một là hỏng:
       *   · `tablet:w-full`  — không có nó thì `self-center` làm khối co lại ôm
       *     sát chữ (alignSelf đổi bề rộng từ "kéo giãn" sang "vừa nội dung"),
       *     và trên điện thoại thì… vẫn đúng, nên lỗi chỉ lộ ra ở tablet;
       *   · `tablet:max-w-screen-tablet` — chính cái trần, 600dp;
       *   · `tablet:self-center` — không có nó thì khối 600dp dính mép TRÁI.
       *
       * ⛔ Trần lấy đúng bằng chính mốc breakpoint `tablet` (600dp), không phải
       * một con số tự chọn: ở đúng 600dp thì trần bằng bề rộng màn ⇒ bố cục
       * KHÔNG nhảy một nấc tại ngưỡng. Chọn 560 hay 640 là ở đúng 600dp nội dung
       * đột ngột hụt vào hoặc vẫn tràn, và người dùng chia đôi màn hình trên
       * Android sẽ thấy khối chữ giật khi kéo thanh chia.
       *
       * ⛔ Không có bậc nào cho `tablet-lg`: trần là để ĐỌC ĐƯỢC, mà 600dp đã là
       * mức tối đa của một cột chữ. Máy 840dp cần nhiều cột chứ không cần cột
       * rộng hơn — và nhiều cột là việc của từng màn, không phải của `Screen`.
       */
      constrained: {
        true: { content: 'tablet:w-full tablet:max-w-screen-tablet tablet:self-center' },
      },
    },
    defaultVariants: { constrained: true, padded: true },
  },
  { twMergeConfig },
);

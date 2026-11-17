import { tv, type VariantProps } from 'tailwind-variants';

import { twMergeConfig } from '@/shared/utils/style/cn';

/**
 * Công thức style của `Card` (Figma "Frame 1000005018" 259:97534 và thẻ nhóm
 * 259:97603 / 259:97608). Tách khỏi `Card.tsx` để file component giữ dưới 200
 * dòng — cùng cách bố trí với `chip/`, `input/`, `list/`, và `media-card.styles.ts`
 * ngay cạnh đây.
 *
 * ── ⚠️ Vì sao KHÔNG có đổ bóng ──────────────────────────────────────────────
 * Thẻ trong Figma có `border` nhưng màu viền là `rgba(255,255,255,0)` — tức là
 * trong suốt hoàn toàn, chỉ để giữ chỗ khi dựng layout — và KHÔNG có bóng nào.
 * Nên ở đây không đổ bóng, và đó cũng là lựa chọn an toàn hơn:
 *
 *  · `shadow-*` của NativeWind ra hai kết quả KHÁC NHAU. iOS nhận
 *    `shadowColor/Offset/Opacity/Radius` nên bóng mềm, đúng như thiết kế;
 *    Android chỉ có `elevation` (một số nguyên) nên bóng đậm hơn, tối hơn, và
 *    còn tự vẽ thêm nền — thẻ trong suốt trên Android hoá ra có nền xám.
 *  · Thẻ ở đây là nền `bg-1` (trắng) trên nền màn `bg-base` (xám nhạt). Độ
 *    tương phản đó đã đủ tách khối; thêm bóng chỉ mua thêm khác biệt hai nền.
 *
 * Cần đường bao rõ hơn (thẻ đặt trên nền trắng) → truyền `className="border
 * border-border-1"`. Viền cho kết quả GIỐNG NHAU trên cả hai nền tảng.
 */
export const cardStyles = tv(
  {
    slots: {
      // `rounded-md` = 24px, đúng `border/bo24` của Figma.
      // `gap-sm` = 12px, đúng khoảng cách giữa các `List item` trong thẻ.
      root: 'w-full gap-sm rounded-md bg-bg-1',
      title: 'text-body-lg font-semibold text-fg-1',
      /**
       * Lớp NHẤN của thẻ bấm được — chỉ vẽ khi `Pressable` báo `pressed` (xem `Card.tsx`).
       * `bg-bg-primary` = màu CHỦ ĐẠO 10%, ⛔ không phải xám trung tính; `rounded-md` khớp bo 24dp của
       * thẻ nên không cần `overflow-hidden` cho riêng nó. Vẽ SAU nội dung (đè lên) để vẫn thấy được
       * trên ảnh bìa đặc của `MediaCard` — vì mờ 10% nên chữ bên dưới gần như không đổi.
       * ⚠️ Nơi gọi đè `rounded-*` của thẻ qua `className` thì lớp nhấn vẫn bo 24dp.
       */
      pressTint: 'absolute inset-0 rounded-md bg-bg-primary',
    },
    variants: {
      padded: {
        true: { root: 'p-md' },
        /**
         * Tắt padding khi con tự lo lề — ví dụ danh sách có kẻ phân cách chạy
         * hết bề rộng thẻ, hoặc ảnh bìa dán sát mép.
         *
         * ⚠️ Kèm `overflow-hidden`: con chạy sát mép (hàng bấm được, ảnh bìa) phải theo bo 24dp của
         * thẻ — nhất là lớp NHẤN của `ListItem` ở hàng đầu/cuối, nếu không nó tràn ra góc vuông.
         * ⛔ Cần huy hiệu tràn ra ngoài mép thẻ thì tự đè `className="overflow-visible"`.
         */
        false: { root: 'overflow-hidden p-0' },
      },
      /**
       * Thẻ bấm được nhưng đang khoá (chưa đủ điều kiện chọn, tài khoản tạm
       * dừng…). Hạ bằng NỀN chứ không bằng `opacity-*`: thẻ bọc nội dung tuỳ ý —
       * ảnh, huy hiệu, `<ListItem>` — mà lớp mờ ăn hết cả cụm, còn nền
       * `disabled-1` thì giữ nguyên độ đọc được của mọi thứ nằm trên.
       */
      disabled: {
        true: { root: 'bg-disabled-1', title: 'text-action-disabled-fg' },
      },
      /**
       * Có khe `media` thì thẻ tự cắt phần thừa theo bo góc.
       *
       * ⚠️ Vì `media` là chỗ đặt ẢNH BÌA dán sát mép (`padded={false}`): ảnh
       * vuông của ô sản phẩm lưới 2 cột đè lên bốn góc bo 24 và thẻ hiện ra
       * vuông ở mép trên — sai bản vẽ, mà không có lỗi nào báo. Ở đây bật sẵn
       * để mọi nơi gọi khỏi phải nhớ.
       * ⛔ Cần một huy hiệu tràn ra ngoài mép thẻ thì tự đè
       * `className="overflow-visible"` — `tailwind-merge` cho class truyền vào
       * thắng, và lúc đó ảnh bìa phải tự bo góc lấy.
       */
      media: {
        true: { root: 'overflow-hidden' },
      },
    },
    defaultVariants: { disabled: false, media: false, padded: true },
  },
  { twMergeConfig }, // ⛔ BẮT BUỘC — xem docs/rules/styling-nativewind.md.
);

export type CardVariants = VariantProps<typeof cardStyles>;

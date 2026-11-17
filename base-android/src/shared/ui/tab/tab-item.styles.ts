import { tv } from 'tailwind-variants';

import { twMergeConfig } from '@/shared/utils/style/cn';

/**
 * Công thức style của `TabItem` (tách khỏi `TabItem.tsx` để file component giữ dưới 200 dòng).
 *
 * Số đo lấy từ Figma (`259:93807`): cao 40dp ở kiểu viên nén (đệm dọc 8 + icon
 * 24), đệm ngang 16, cách icon 8, nhãn 14/20 semibold. Kiểu gạch chân cao 48dp
 * với vạch 2dp chạy hết bề rộng tab.
 */
export const tabItemStyles = tv(
  {
    slots: {
      /** Lớp nhận chạm. Dáng vẻ nằm ở `root` vì nó phụ thuộc `pressed`. */
      pressable: '',
      /**
       * ⚠️ `px-2 phone:px-4` — mobile-first, đệm 16dp của Figma chỉ áp từ 390dp.
       *
       * Ở chế độ chia đều (`grow`), 4 tab trên máy 320dp cho mỗi tab 80dp; đệm
       * 16+16 ăn mất 32 ⇒ nhãn chỉ còn 48dp và "Chuyển tiền" cụt thành "Chuy…".
       * Thu ĐỆM chứ ⛔ KHÔNG thu chiều cao hay cỡ chữ: vùng chạm vẫn là cả cột
       * (`pressable` mang `flex-1`), nên co đệm không lấy đi một dp chạm nào.
       */
      root: 'flex-row items-center justify-center gap-2 px-2 phone:px-4',
      /**
       * ⛔ `shrink` — thiếu nó thì `numberOfLines={1}` ở dưới VÔ TÁC DỤNG.
       * `<Text>` của React Native mặc định `flexShrink: 0`, nên bề rộng nhãn
       * không bao giờ bị chặn và không có gì để cắt bớt. Ca đo được: 3 tab CÓ
       * ICON chia đều trên máy 360dp ⇒ mỗi tab 106.7dp, trừ `px-2` còn 90.7;
       * icon 24 + khe 8 + "Chuyển tiền" ~78 = 110 ⇒ nhãn trào ra ~10dp mỗi bên
       * và ĐÈ LÊN tab bên cạnh, không có lỗi nào báo.
       *
       * ⚠️ Đây mới là chỗ phải sửa, không phải cái đệm: `px-4 → px-2` ở trên
       * đã thu hết mức thu được mà vẫn thiếu ~19dp.
       *
       * ⚠️ `shrink` chứ KHÔNG phải `flex-1`: `root` canh giữa
       * (`justify-center`), cho nhãn `flex-1` là nó chiếm hết chỗ trống ⇒ icon
       * dạt sát mép trái, huy hiệu dạt sát mép phải, cụm tab không còn ở giữa.
       *
       * ⚠️ KHÔNG cần `min-w-0` (thói quen mang từ web sang): Yoga không có
       * `min-width: auto`, nên riêng `flexShrink: 1` đã đủ cho nhãn co xuống
       * dưới bề rộng nội dung.
       */
      label: 'shrink text-label-md font-semibold',
      /**
       * Figma KHÔNG vẽ badge cho tab. Hình ở đây dựng theo badge đếm của phần
       * còn lại trong hệ: chấm tròn 16dp, nền đỏ, số 10/16 màu chữ trên nền.
       * ⚠️ Phải là CẶP `action-error`/`action-error-fg`: `action-fg` là màu chữ
       * ghép với nền XANH thương hiệu, đặt lên nền đỏ là ăn may — chỉ cặp
       * `action-*`/`action-*-fg` mới đảo cùng chiều khi sang chế độ tối
       * (đo được 6.32:1 sáng · 7.02:1 tối).
       */
      /**
       * ⚠️ `min-h-4` chứ KHÔNG phải `h-4`: hộp 16dp vừa khít lineHeight 16 của
       * `text-label-xs`, nên chỉ cần người dùng phóng cỡ chữ hệ thống một nấc
       * là con số trào ra ngoài vòng tròn. Cho hộp nở theo chữ; nó vẫn nằm gọn
       * trong tab cao 40/48dp nhờ trần `BADGE_MAX_FONT_SCALE` bên dưới.
       */
      badge: 'min-h-4 min-w-4 items-center justify-center rounded-full bg-action-error px-1',
      badgeLabel: 'text-label-xs font-semibold text-action-error-fg',
      indicator: 'absolute inset-x-0 bottom-0 h-0.5',
    },
    variants: {
      variant: {
        pill: { root: 'h-10 rounded-full' },
        underline: { root: 'h-12' },
      },
      selected: {
        true: {},
        // Tab không được chọn: chữ và icon cùng một mực phụ ở CẢ HAI kiểu.
        false: { label: 'text-fg-2' },
      },
      /** Chia đều bề rộng hàng. Tắt khi hàng cuộn ngang — lúc đó tab ôm nội dung. */
      grow: { true: { pressable: 'flex-1' } },
      /**
       * Thân rỗng: hiệu ứng nhấn phụ thuộc `variant` × `selected` nên nằm ở `compoundVariants`.
       * ⛔ Không còn `opacity-60` như bản cũ: nó làm MỜ cả tab — kể cả viên `bg-action-base` đang
       * chọn thành một khối nhạt nhoà — và với tab chưa chọn thì chỉ mờ chữ, gần như không thấy.
       */
      pressed: { true: {}, false: {} },
    },
    compoundVariants: [
      {
        variant: 'pill',
        selected: true,
        class: { root: 'bg-action-base', label: 'text-action-fg' },
      },
      // ── NHẤN ─────────────────────────────────────────────────────────────────────────────────
      // Viên đang chọn: nền đặc `action-press` (đúng token "Background/Primary/Press", cùng cặp với
      // chữ `action-fg` như `Button` primary). Khai SAU khối `selected` bên trên để thắng `bg-action-base`.
      { variant: 'pill', selected: true, pressed: true, class: { root: 'bg-action-press' } },
      // Tab chưa chọn: nền `action-tint` — màu chủ đạo NHẠT (✅ ăn theo tông của app, đảo đúng ở chế
      // độ tối), ⛔ không phải xám trung tính. `rounded-full` của `pill` ở `root` giữ nguyên hình viên.
      { variant: 'pill', selected: false, pressed: true, class: { root: 'bg-action-tint' } },
      // Gạch chân: không có nền khi đứng yên; nhấn thì nền nhạt phủ cả tab (kể cả tab đang chọn).
      { variant: 'underline', pressed: true, class: { root: 'bg-action-tint' } },
      {
        variant: 'underline',
        selected: true,
        // Vạch chỉ báo lấy màu NHẤN (nâu vàng), không phải màu thương hiệu —
        // đúng bản vẽ, và nhờ khác màu chữ nên vạch vẫn thấy rõ trên nền tối.
        class: { label: 'text-fg-brand', indicator: 'bg-action-accent' },
      },
    ],
    defaultVariants: { selected: false, variant: 'pill' },
  },
  { twMergeConfig }, // ⛔ BẮT BUỘC — xem docs/rules/styling-nativewind.md.
);

# Ghi chú component — feedback (`src/shared/ui/feedback/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## Callout

- **Chữ là token chữ, màu intent chỉ ở icon / viền / vạch nhấn trái 3px**: chữ `-5` trên nền sáng
  chỉ ~1.5–2:1 (`text-yellow-5`), nên tiêu đề `fg-heading` semibold, nội dung `fg-body`.
- **Màu qua token trạng thái** (`info` · `success` · `warning` · `error`, tự đổi theo theme) cho nền
  `/8`, viền `/25`, vạch nhấn; `warning` là cam như Badge / Toast.
- **`ghost` không nền, không viền, không vạch** — chỉ icon mang màu intent; dùng khi khối cha đã có
  khung riêng.
- **Nút đóng `size-6` kéo `-my-0.5`**: tâm nút trùng tâm dòng đầu (20px) như ô icon `h-5`, khối một
  dòng vẫn cao đúng `py-2.5` hai mép.
- **HUD `tinted` (chỉ `dark:`) theo `--callout-tone`**: dốc ngang từ vạch trái + quầng trong/ngoài sát vạch; icon intent phát
  sáng (`neutral` không). KHÔNG ngoặc góc — callout là nội dung trong luồng, không phải khung (§0c).

## EmptyState

- **Ô icon vuông tô nhạt + 2 góc HUD** (`before` / `after`, màu `currentColor` của ô) cùng ngôn ngữ với
  `HudCorners`; icon ở theme sáng xuống bậc đậm (`-6` / `-7`, ≥ 3:1), theme tối dùng `-5` + quầng trong ô và
  `drop-shadow` icon (đều theo `currentColor`).
- **Tiêu đề + mô tả chung một cha `gap-1`**; cha ngoài tạo khe giữa hình / chữ / hành động nên hành
  động không cần `mt-*`.
- **Mô tả nhỏ hơn tiêu đề hai nấc ở mọi cỡ** (sm 16/12 · md 18/14 · lg 20/16), mô tả không xuống
  dưới 12px. Đệm theo `spacing-system.md §4.2` (`p-3`–`p-4`).

## LiquidGauge

- **Sóng bằng CSS thay vì `<canvas>` + rAF**: một phần tử SVG dịch ngang nên trình duyệt tự dừng khi tab ẩn /
  ngoài màn, `prefers-reduced-motion` tắt được.
- **Đọc THÔ, không đọc CHÍNH XÁC**: mặt nước gợn sóng nên mắt không chốt được "đúng 63%"; hợp cho "bể
  còn khoảng 2/3" trên màn treo tường. Cần số đúng thì `ProgressCircle` / `Progress`.
- **Hai lớp sóng** (3s, và 4.5s ngược chiều) cho cảm giác mặt nước thật; path = 4 chu kỳ trải 0 → 2×size, keyframe
  `liquid-wave` (`styles/theme/animations.css`) dịch -50% nên không lộ điểm nối; `WAVE_AMPLITUDE` 4px để không che số.
- **`useId` cho `clipPath`**: trùng id giữa nhiều gauge thì clipPath của cái sau đè cái trước, các khối
  nước còn lại biến mất.
- **Tone qua biến `--liquid-gauge-tone`** (đặt ở `style`): nước, nền, quầng `dark:` đọc chung một biến;
  viền = pha 20% `fg-heading` nên tự đậm hơn ở theme sáng, sáng hơn ở theme tối, không cần `dark:`.
- **Bóng chữ chỉ ở theme tối**: chữ trắng trên nước tone `-5` chỉ ~3:1 nên cần bóng `shadow-popup`;
  theme sáng chữ `fg-heading` trên nước đã ~7:1 trở lên, không thêm bóng (không glow ở theme sáng).

## Progress

- **Slot `%` rộng CỐ ĐỊNH (`w-9`) + căn phải + `tabular-nums`**: nhiều thanh xếp chồng (bảng, danh
  sách) thì mép thanh và cột số luôn thẳng hàng, không nhảy theo độ dài "5%" ↔ "100%".
- **Chữ % trung tính** (`fg-body`; `neutral` → `fg-muted`): chữ `-5` trên nền sáng chỉ
  ~1.5–2.3:1; màu trạng thái đã nằm ở thanh (cách Arco / TDesign làm).
- **Tone qua `--progress-tone`**: thanh dốc 45% → đặc, quầng + điểm sáng đầu thanh (`::after`, CHỈ gắn khi > 0% — rãnh
  không `overflow-hidden` để quầng toả nên điểm của thanh 0% sẽ lòi ra trái). Rãnh tối lõm trơn (vạch chia đã gỡ — nhiễu trong bảng, §0c).
- **`neutral` dùng `fg-muted`**, không `neutral-5`: ở theme tối `neutral-5` gần trùng màu rãnh `bg-track`.
- **`max` ≤ 0 / `value` không hữu hạn → 0%** (`toPercent`): `0 / 0` ra `NaN` lọt vào `width` và
  `aria-valuenow`. Hàm chép ở cả `ProgressCircle` vì `feedback/` đã đủ 8 mục, không thêm được file utils.
- **Tên đọc màn hình nằm ở `role="progressbar"`** (mặc định "Hoàn thành N%"), cột `%` thì `aria-hidden`
  để số không bị đọc hai lần — cùng cách `ProgressCircle`.

## ProgressCircle

- **Nắp tròn có BÙ**: nắp tròn cộng nửa bề dày nét vào MỖI đầu cung (vòng 36px, nét 12 → ~4% chu vi
  mỗi nắp), nên nét ngắn đi một bề dày và `rotate` điểm đầu tới nửa bề dày → mép nắp đúng 0% và N%.
- **Độ dài cung = `stroke-dashoffset`** (dasharray = chu vi, đặt qua `style`): transition chỉ một thuộc
  tính, chắc chạy ở mọi trình duyệt; `motion-reduce` thì nhảy thẳng tới số mới.
- **Cung < một bề dày, hoặc thiếu < một bề dày là đầy → nắp vuông** (nắp tròn tự vượt số / hai nắp
  chạm nhau để lại khía ở 12 giờ); **0% không vẽ cung**: một chấm sẽ đọc thành "đã bắt đầu".
- **Bề dày nét theo toạ độ viewBox 100×100** (co giãn cùng vòng): vòng nhỏ cần nét DÀY hơn theo tỉ lệ,
  không thì quy ra pixel chỉ còn hơn 1px và biến mất.
- **Hai `<svg>` chồng nhau (rãnh · cung)**: quầng `drop-shadow` tối ở cả hai — rãnh nhận `text-*` của variant để quầng
  nhạt (30%) theo tone, cung đậm (65%); gradient `currentColor` → pha 30% `fg-heading` (đậm ở sáng, sáng ở tối).
- **`-rotate-90` trên `<svg>` cung** để mốc 0% nằm ở 12 giờ; nhãn % là anh em HTML nên không xoay theo.

## Skeleton

- **Nền `divider-default` + vệt sáng** (sáng: `neutral-0` 60%; tối: vệt ánh `sky` có lõi sáng hơn + viền trong 1px
  `sky-5` 10%): nền `neutral-7/40` nặng ở theme sáng; vệt quét ngang đọc ra "đang nạp" rõ hơn `animate-pulse`.
- **Gradient rộng 200% + `animate-shimmer`** (`background-position` 150% → -50%): vệt vào từ mép trái,
  ra hẳn mép phải nên không thấy điểm nối.

## Spinner

- **Gốc `role="status"` quay, hai con `absolute inset-0` cùng bề dày**: rãnh `border-divider-default`,
  cung `border-current` + `mask-image: conic-gradient(transparent 25%, currentColor)`.
- **Bề dày là `border` px, không co giãn**: nơi gọi đè cỡ (`Button`: `className="size-full"`) thì rãnh
  và cung vẫn trùng mép, vòng vẫn mảnh như cỡ gốc.
- **Màu ở `text-*` của gốc** (cung đọc `currentColor`; màn chờ tải ghim `text-primary-6`); `inherit`
  (nút đặc) đổi rãnh sang `border-current/25` vì rãnh xám lộ thành vòng lạ trên nền xanh / đỏ.
- **Đầu cung đặc ở 12 giờ dẫn trước**: conic đi trong suốt → đặc theo chiều kim đồng hồ, cùng chiều
  `animate-spin`, nên đầu đặc chạy trước, đuôi nhạt dần hoà vào rãnh.
- **Quầng theme tối = `drop-shadow` trên CUNG** (filter chạy trước mask): quầng mờ theo đuôi, bị cắt ở
  mép ngoài nên chỉ còn quầng phía trong; rãnh có quầng nhạt (`shadow` theo `currentColor`). `inherit` tắt cả hai.
- **Giảm chuyển động**: `motion-reduce:animate-none` → vòng đứng yên nhưng cung + rãnh vẫn hiện.

## TableEmptyIllustration

- **Khung / lưới là token theo vai trò** (`bg-subtle` thân · `bg-track` thanh tiêu đề + cột ·
  `border-strong` lưới · `fg-faint` thanh chữ) nên tự lật theo theme; `neutral-*` thì không.
- **Viền khung `border-default` 1px** (rect cuối, lệch 0.5 vào trong): thân `bg-subtle` trên thân bảng
  trắng gần như trùng màu, thiếu viền thì cửa sổ mất mép ở theme sáng.
- **Không `clipPath`**: viewport của `<svg>` đã cắt đúng khung viewBox, nên bỏ luôn `useId`.

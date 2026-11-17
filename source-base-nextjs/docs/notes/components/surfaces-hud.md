# Ghi chú component — surfaces / hud (`src/shared/ui/surfaces/hud/`)

> Lý do thiết kế KHÔNG hiển nhiên của khung HUD, tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có. Panel / Splitter:
> `surfaces.md`; thẻ KPI: `surfaces-cards.md`.

## HudFrame

- **Hình khối (tối)** theo BigDataView: viền sáng dần ở TL, vát TL + BR (`--hud-frame-clip` + `dark:[clip-path:…]`), ngoặc
  TR + BL, quầng. **Sáng = card bo `rounded-lg`** viền `border-default`; ngoặc / chấm / sọc `hidden dark:block` (ngoặc vuông trên góc bo là sai).
- **Không tự thêm padding** — body do caller quản lý (`visual-hierarchy.md`); root `h-full min-h-0` + `isolate`: thân
  KHÔNG đặt z-index nên trang trí `z-0` < nội dung `z-10` < ngoặc / chấm `z-20`, không lớp nào lọt khỏi card.
- **`prime`** = cyber + quầng 3 lớp (vỏ trang trí `HudFrameDecor` đã gỡ); chân đế dùng `shadow-popup`, KHÔNG pha tone (bóng có
  màu ở nền sáng như vệt bẩn). Tốn nhiều lớp vẽ — lưới 20+ card dùng `weight="hairline"`.
- **Chấm khoá góc nằm TRONG khung** (`notch=false` thì về sát góc vuông; chỉ tối): thò ra ngoài là đốm sáng lơ lửng
  và lưới `overflow-y-auto` mọc thanh cuộn ngang.

## HudFrame — nét · quầng

- **Quầng (khung · ngoặc · chấm · vạch cyber) CHỈ ở theme tối**: chuỗi theo tone nằm trong biến `--hud-frame-*` (style,
  `none` khi ô không có quầng để khung lồng không kế thừa), class `dark:[…:var(…)]` mới bật; sáng là bóng `shadow-popup`.
- **`hairline`** (trục `weight`, độc lập `intensity`): bracket 1px + quầng ôm sát viền; ở lưới dày nét 2px
  cộng dồn thành mảng sáng, mắt không còn đọc được ranh giới từng card.
- **Nét 1px cần quầng `drop-shadow`** (theme tối) để không "biến mất" trên nền navy. Bracket của prime dài hơn vì
  khung đi với card cỡ panel; cánh ngắn ở cỡ đó đọc như dấu nháy.

## HudCorners

- **Vẽ LUÔN cả khung viền**: viền do cha và ngoặc góc không bao giờ chồng khít (`overflow: hidden` cắt theo
  padding box → hai nét lệch 2px). `frame` và nhấn góc đều `inset: 0` nên mép NGOÀI luôn trùng.
- **Quầng bằng `filter: drop-shadow()`**, không `box-shadow` (tô cả 2 cạnh trong suốt của chữ L → quầng VUÔNG). Chỉ ở
  theme tối: chuỗi tính theo `thickness` nằm ở biến `--hud-corners-glow` (style), class `dark:[filter:var(…)]` mới bật.
- **`borderWidth: 0` PHẢI đứng TRƯỚC `c.edges()`**: đặt sau là xoá bề dày 2 cạnh vừa khai, ngoặc
  biến mất và mọi thẻ trông y như `variant="none"`.
- **Cánh ngoặc ≥ 3 × bề dày** (`arm = max(size, thickness × 3)`): cánh ngắn hơn ra cục vuông.
  `thickness` mặc định 1.5px = cỡ nét chuẩn của `HudFrame` / `HudInfoBox`.
- **`chamfer`**: `chamferClip` cắt 4 góc của lớp viền để nét chéo đắp lại (không thì thành tam giác đặc); đầu
  nét lùi `thickness / 2 / √2` cho khỏi thò ra. `radius` vô nghĩa với `chamfer`.
- **Tone đọc biến của cha** (`--hud-c`, `--hud-frame-c`) thay vì sinh class từng màu: đổi tone chỉ
  cần set 1–2 biến, vd `[--hud-c:var(--color-sky-5)]`.
- **`lightRounded`** (thẻ bo ở sáng: `BoxInfo`, `SummaryCard`): khung mượn `rounded-[inherit]` của cha, nhấn góc chỉ tối —
  tối thang radius về 0 nên khung vẫn vuông, không cần nhánh riêng.

## HudInfoBox

- **Viền vẽ 2 LỚP** (lớp ngoài tô gradient, ruột thụt 1px `p-px`) vì `border` CSS không chạy theo
  `clip-path`. Ruột dùng nền ĐỤC (`color-mix` với `bg-surface`) để lớp viền không lộ qua.
- **`bodyStyle` là `style`, không phải class**: dốc màu tính bằng `color-mix` trên nền THẬT của panel. Nó đè
  `background` mặc định nên người truyền tự lo luôn nền của trạng thái `selected`.
- **Vát + ngoặc [ ] CHỈ ở tối** (`dark:[clip-path:…]`, ngoặc `hidden dark:block`); sáng là khung bo `rounded-lg`, ruột bo
  `lg − 1px` cho khít (tối calc âm → 0). Vát 12px khớp `HudFrame` cho khung cỡ card.
- **Bấm được (`onClick`)** = `role="button"` + Tab + Enter / Space. Rê chuột: viền sáng lên (`--hud-info-edge-on`) + lớp
  tint `-z-10` (trên nền ruột, dưới header / thân); focus là vòng `ring-focus` vẽ `inset` vì `clip-path` (tối) / `overflow-hidden` (sáng) cắt mọi thứ thò ra.
- **Không quầng ngoài**: `clip-path` / `overflow-hidden` của khung luôn cắt `box-shadow` ra ngoài. `title` chuỗi tự lấy `body-14-semibold`;
  cần chữ khác thì truyền ReactNode.

## HudCallout

- **`x` · `y` đặt ĐIỂM NEO** (chấm dưới cùng) đúng toạ độ % của khung cha (`translate(-50%, -100%)`): người gọi nghĩ theo
  vị trí thực địa, không phải theo góc thẻ.
- **Chỉ thẻ nhận chuột** (`pointer-events-auto`), gốc + đường dẫn `pointer-events-none`: kéo / zoom ảnh, bản đồ bên dưới
  vẫn được dù nhiều nhãn đè lên.
- **Nằm NGOÀI lớp nghiêng `perspective`** khi dùng trên sơ đồ 2.5D (`/demo/xuong`): chữ đặt trong lớp nghiêng bị méo.
  Vòng "thở" ở điểm neo tắt khi giảm chuyển động (`motion-safe:`); quầng chỉ `dark:`.

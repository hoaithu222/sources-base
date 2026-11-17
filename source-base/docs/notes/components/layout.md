# Ghi chú component — layout (`src/shared/ui/layout/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng component, tách khỏi code theo
> `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có.

## BoxGrid

- **Ba lưới của base, đừng lẫn**: `BoxGrid` cho THẺ / PANEL (khai `min`, số cột do bề ngang màn quyết);
  `FormGrid` cho FIELD của form (khai `cols`, mỗi cột có trần); `DemoGrid` chỉ ở trang trưng bày.
- **Vì sao không `grid-cols-N` cố định**: chia đều bề ngang thì trên màn rộng thẻ KPI có nhãn tận mép trái, số
  tận mép phải. `auto-fill` + `minmax` lật quan hệ: khai bề ngang ĐỌC ĐƯỢC, số cột tự ra.
- **`min` đặt theo THỨ nằm trong ô**: `sm` 14rem chip / ô màu / thẻ đếm nhỏ · `md` 20rem thẻ KPI /
  thẻ trạng thái (mặc định) · `lg` 28rem panel có tiêu đề · `xl` 36rem panel chứa bảng con / biểu đồ.
- **`min(100%, …)` bắt buộc**: thiếu nó, ở khung hẹp hơn `minmax` thì ô tràn khỏi lưới và trang sinh
  thanh cuộn ngang.
- **Class phải LITERAL, không ghép chuỗi**: Tailwind v4 quét mã như văn bản thuần, class chỉ tồn tại
  lúc chạy thì không sinh ra gì và lưới im lặng mất hết cột (cùng bẫy ở `FormGrid`).
- **KHÔNG dùng khi số cột là ý đồ** (dải 4 thẻ KPI hẹp thì gãy 2×2, không rớt 3+1): viết thẳng `grid-cols-*`.
  `align="start"` đừng bật cho hàng THẺ — cao bằng nhau chính là thứ làm chúng đọc ra một hàng.

## DetailPanelHeader

- **Hairline ghim bằng `absolute`, không phải flex row** nên header không vỡ khi caller đổi padding. Sọc chéo
  có mask tắt sớm ở mép trái — trải full-width thì trang 3–4 panel thành "rừng sọc".
- **Dải nền + sọc, quầng vạch, dốc màu chữ CHỈ ở theme tối** (sáng: nét mảnh + vạch, chữ đặc `fg-heading` như
  `BoxPanel`). `sm` / `titleVariant="solid"` luôn đặc: `background-clip: text` rasterize glyph qua mask, tắt subpixel-AA.
- **`min-w-0` của hàng trong và `overflow-x-clip` của tiêu đề ReactNode CHỈ ở `max-lg:` + `touch:`**: ở đó
  thiếu chúng thì root XÉN CỤT nút cuối; ở bậc nền chúng chỉ cắt cụt tiêu đề ReactNode trên laptop. Cắt chiều NGANG
  thôi (`overflow-y-visible`) — `overflow-hidden` gọt dấu mũ / thanh của chữ hoa tiếng Việt.
- **Chữ tiêu đề `md` hạ một bậc ở `max-lg:`**: tiêu đề module dài cạnh cụm nút `shrink-0` bị truncate còn 2–3
  chữ; hạ cỡ trả lại bề ngang mà không đụng chiều cao hàng.
- **Action `shrink-0` ở bậc nền** (trigger `w-full` sẽ bóp title về 0); ở `max-lg:` + `touch:` lật thành co +
  `overflow-x-auto` — dư thì CUỘN (`ipad-responsive §4`). Cần cả hai gate: iPad ngang > 1024px (`§8.1`).
  Điện thoại (`phone:`) hàng trong `flex-wrap`, tiêu đề có sàn `basis-40`: slot không đủ chỗ (vd `SegmentToggle` 200px ở 320px)
  xuống hàng riêng canh phải thay vì ép tiêu đề còn ~22px.
- **`scrollbar-hidden` để TRẦN, không tiền tố**: là class CSS thường, KHÔNG phải `@utility` Tailwind nên biến
  thể breakpoint không sinh rule. Vô hại trên desktop vì hộp đó không bao giờ cuộn.

## PageShell

- **Một nguồn cho công thức `flex h-full min-h-0 flex-col`**: gõ tay dễ thiếu `min-h-0` — khi đó `flex-1` bên
  trong không co, vùng cuộn cao vô hạn, trang dài ra thay vì cuộn.
- **KHÔNG ĐỆM, đừng thêm**: `AppShellLayout` đã cấp lề ngoài qua `SHELL_GUTTER_X` / `SHELL_GUTTER_Y` (cùng hằng
  với thanh header); trang tự thêm đệm là cộng dồn, đi giữa hai trang nội dung NHẢY vài px.
- **Ba dạng**: `scroll` (mặc định) trang có vùng cuộn RIÊNG, vỏ `overflow-hidden` để cuộn ở `<PageBody>`;
  `flow` trang ngắn trôi theo nội dung; `center` một khối canh giữa (403, 404, "đang dựng").
- **`min-h-0` + `overflow-hidden` của `scroll` là MỘT BỘ**: `min-h-0` để `flex-1` của `<PageBody>` co được;
  `overflow-hidden` chốt phần dôi để chính `<PageBody>` là thứ cuộn, không phải `<main>` bên ngoài.

## PageBody

- **`flex-1` + `min-h-0` + `min-w-0` đi cùng nhau**: flex item mặc định `min-height: auto` không co dưới nội
  dung — thiếu `min-h-0` thì `overflow-y-auto` không có gì để cuộn, "bảng đẩy trang dài"; `min-w-0` tương tự.
- **`scroll` vs `hidden`**: `hidden` khi con đã tự quản cuộn (`<Table>`, `<Tree>`, `<Splitter>`): hai lớp cuộn
  lồng nhau cho hai thanh cuộn và bánh xe chuột nhảy giữa hai vùng.
- **`overscroll-contain`** chặn cử chỉ vuốt hết vùng bị Safari iOS hiểu thành "lùi lại trang trước"
  (`ipad-responsive §4.1`). `stack={false}` khi con tự lo bố cục (vd `<Splitter>`).
- **`relative` luôn bật**: span `sr-only` (`position: absolute`) của `AnimatedNumber` / `RankingBoard` không
  có khung neo thì neo vào `<main>`, kéo `scrollHeight` dài ra → hai thanh cuộn lồng nhau khi trang xếp cột.

## Toolbar

- **Cụm trái NỞ, cụm phải GHIM**: trái là bộ lọc chịu co và xuống dòng; phải là hành động nhãn ngắn cố định —
  co là bị cắt thành "Xuất Ex…". Phần thiếu chỗ luôn trừ vào cụm trái.
- **`min-w-0` ở cụm trái bắt buộc**: ô tìm bên trong thường `w-full` / `truncate`; thiếu sàn-0 thì cụm
  trái không hẹp xuống dưới bề rộng nội dung, phần dôi tràn ra và ĐÈ lên cụm hành động.
- **Ô trái LUÔN render, kể cả rỗng**: thiếu nó `justify-between` không có gì để đẩy, cụm hành động trôi
  về mép TRÁI. Ô phải `:empty` thì không dựng, khỏi để lại khe `gap` vô nghĩa.
- **`border` / `padding` là variant**: gõ tay mỗi chỗ một kiểu thì các hàng trên / dưới nhau lệch nhịp; variant
  giữ một thang. Theme tối: viền thành trong suốt, `::after` vẽ nét dốc sáng giữa (hai đầu về `border-default`) ĐÈ đúng
  chỗ viền (`-bottom-px` / `-top-px`, không đổi cao) + nền dốc nhạt neo phía vạch; `none` không có gì (hàng lọc trần).
- **Không tự cuộn ngang**: cụm hành động dài hơn màn (iPad dọc) thì bọc chính cụm đó trong
  `overflow-x-auto overscroll-x-contain` như `BoxPanel` xử lý `headerRight` (`ipad-responsive §4`).
- **Điện thoại (`phone:`)**: cụm trái giữ sàn `basis-64` (16rem) nên cụm phải không đủ chỗ cạnh đó thì RỚT xuống hàng
  riêng canh phải (`flex-wrap` + `ml-auto`) — trước đây ô lọc bị bóp về 0 và nút hành động đè lên ô chọn.

## TitleScreen

- **Tiêu đề là `<h1>` THẬT**, không `<span>`: không có heading thì trình đọc màn hình mất cách nhảy theo tiêu
  đề, cây heading bắt đầu từ `<h2>` của khối con. Cỡ chữ vẫn do `size` của `Text` quyết định.
- **Nền + sọc chéo chỉ là accent của theme tối**: rất mờ (5%), mask tắt sớm (320px); theme sáng bỏ hẳn cùng dốc màu
  chữ và quầng (chữ `h4-semibold` đặc). Trải rộng thì trang có thêm 2–3 panel header cũng có sọc, rối mắt.
- **`TitleIconColor` là bộ tone dùng chung** của `TitleScreen` / `HudFrame` / `PanelCard` / `DetailPanelHeader`;
  tone ghép thẳng vào `var(--color-{tone}-N)` nên thêm tone mới thì palette phải có đủ bậc `-3` … `-6`.
- **Hàng chính `flex-wrap` + tiêu đề cắt `…`**: hai nút `right` dài (~560px) cộng cụm tiêu đề vượt 768px thì `right` xuống
  hàng riêng canh phải thay vì bị khung xén; ≥ 1800px vừa một hàng nên không đổi. Nút Quay lại `::after` nới hộp bấm.
- **`summary` đứng giữa title và `right`**: `flex-auto` (giữ bề ngang nội dung, KHÔNG `flex-1` = basis 0 bị bóp về 0 ở 768–1023) nên không
  đủ chỗ cạnh tiêu đề thì xuống hàng riêng; điện thoại `flex-wrap` (chip không bị cuộn / cắt); có `summary` thì tự chèn vạch dọc trước
  `right` (ẩn dưới `lg`, vì `right` thường đã xuống hàng); dải KPI
  `scrollbar-hidden` + `overflow-x-auto` để cuộn ngang thay vì bị bóp.

## SectionHeader

- **Tiêu đề KHÔNG có quầng `text-shadow`**; `style` chỉ mang biến `--section-tone` (+ `color` của icon). Giá trị
  trong `style` là CSS thật: `color-mix(in_srgb,…)` (cú pháp class Tailwind) viết vào inline style là khai báo hỏng.
- **Tone đi qua biến `--section-tone`** (style) để class `dark:` tô quầng theo tone, không sinh class từng màu.
- **Nền thanh đổi theo theme**: tối dùng `sky-8` 50% đậm dần về trái (hợp nền navy); sáng dùng `sky-5` 18%. Dùng `sky-8` ở
  theme sáng ra mảng xám đục và chữ mờ (`fg-muted`) chìm — thang `ramps` không lật theo theme nên phải tách bằng `dark:`.
- **Nền nhạt GIỮ ở theme sáng** (khác `BoxPanel` / `DetailPanelHeader`): thanh không có viền hay khung nào khác, bỏ
  nền là mất hình "thanh". Quầng (dấu `//`, chấm, vạch đáy) chỉ ở theme tối; tiêu đề `body-14-semibold` như BoxPanel.
- **`accent` = dấu `//` theo tone** (thay vạch 3px sát mép, 2026-10): cùng hình `HUD_TITLE_MARK` nhưng màu `--section-tone`
  nên không dùng thẳng hằng chung (hằng đó cứng `primary`). Nằm TRONG hàng trước icon; không icon thì thay luôn chấm sáng.

## FilterDisclosure

- **Chỉ vẽ thanh thu gọn ở ĐIỆN THOẠI** (`useIsPhone`); màn rộng trả `children` qua `display: contents` nên không thêm hộp nào —
  laptop / tablet không đổi một pixel. Vì cùng một cây con, state của điều khiển bên trong không bị nhân đôi.
- **Bung TẠI CHỖ bằng `grid-template-rows` 0fr ↔ 1fr**, không popover: nhiều popup lồng (lịch, chọn kỳ) trong modal bị khoá chuột / cắt.
  Không gỡ khỏi cây khi đóng (điều khiển giữ state, ô lịch giữ vị trí) nên vùng đóng phải `inert` — Tab và trình đọc màn hình bỏ qua.
- **Thanh cao 44px (`min-h-11`)** = vùng chạm tối thiểu; tóm tắt cắt `…` bằng `overflow-x-clip overflow-y-visible` (không `truncate`:
  gọt dấu tiếng Việt). Huy hiệu số bộ lọc lệch mặc định là khối vuông.
- **Dùng khi ≥ 3 điều khiển lọc** trong modal / box (kỳ · khoảng tháng · chiều xem…): xếp chồng ở màn 360px ăn ~20% chiều cao và nút ✕
  sát điều khiển. `sticky` khi thân modal cuộn dài để thanh luôn thấy.
- **Theme tối**: khung cùng mặt `Surface` (`HUD_PANEL_FILL` + viền `sky-5/30`), thanh đang mở (`aria-expanded`) rọi dốc xanh lá,
  vạch ngăn phần bung `primary-5/30`, huy hiệu số `HUD_SOLID_PRIMARY`.

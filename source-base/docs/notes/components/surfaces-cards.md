# Ghi chú component — surfaces / cards (`src/shared/ui/surfaces/cards/`)

> Lý do thiết kế KHÔNG hiển nhiên của từng thẻ, tách khỏi code theo `comment-policy.md §3`.
> Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule chung chưa có. Panel / Splitter:
> `surfaces.md`; khung HUD (`HudFrame`, `HudCorners`…): `surfaces-hud.md`.

## SummaryCard

- **`color` lái TOÀN BỘ vỏ thẻ** (nền pha, viền, góc HUD, vệt chéo, quầng) qua 3 biến CSS: `--sc-a`
  (nền + quầng), `--sc-e` (viền + góc), `--sc-glow` (quầng chữ). `blue` dùng họ `sky` cho khớp `GemIcon`.
- **Viền tô ĐẶC `--sc-e`**, không pha loãng: pha loãng thì vài màu rơi dưới ngưỡng tương phản 3.0. Viền 1px
  vì dải 4–6 thẻ nét 2px cộng dồn thành mảng kẻ nặng.
- **Root không khai `border-*`**: viền do `<HudCorners frame>` vẽ (`surfaces-hud.md`).
- **Nền pha từ `--sc-a` vào `bg-surface`/`bg-subtle`** (độ pha `--sc-tint`: sáng 6% · tối 12%; sáng nhạt để ngọc + icon không
  chìm vào nền CÙNG màu), không dùng gradient xanh lá của thanh điều hướng — thẻ nào cũng ra nền lục.
- **Vệt sọc chéo 4% — đừng nâng, và CHỈ ở theme tối**: sọc là NỀN; dải 4–6 thẻ xếp ngang nhân mỗi bậc alpha
  lên 4–6 lần.
- **Theme sáng không quầng** (`text-shadow` số, quầng hover chỉ qua `dark:`; halo quanh chữ gần đen chỉ làm nhoè
  nét). Hover chỉ đổi bóng — KHÔNG phóng / nhấc thẻ: thẻ không bấm được, chuyển động là lời hứa sai.

## CompactKpiCard

- **Sáng: mặt ĐẶC `bg-surface` + vệt tông tắt ở 65%** (`COMPACT_KPI_CARD_SURFACE_CLASSES`), bóng 2 lớp — nền pha trong
  suốt cũ để lưới nền trang lộ xuyên qua thẻ (người dùng báo 2026-10-06). Tối giữ gradient pha cả bề ngang. Nhãn bậc
  đôi `-8` (sáng) / `-2` (tối): `-2` gần trắng ở CẢ hai theme → biến mất ở sáng (`text-contrast.md §1`).
- **Mỗi màu dùng ĐÚNG MỘT họ token** cho viền + nền + nhãn (trộn họ chỉ trùng nhau nhờ tình cờ cùng mã màu). `blue`
  = họ `sky`, KHÔNG `primary` (xanh LÁ); `gray` neutral thuần, không pha tím (ngả tím đọc ra một trạng thái riêng).
- **Bấm được (`onClick` → `<button aria-pressed>`)**: hover chỉ nâng bóng, KHÔNG nhấc / phóng thẻ; `selected` là viền
  2px `primary-5` vẽ bằng `box-shadow` (không xô layout), quầng thêm chỉ ở theme tối.
- **Preset `xs` giữ `gem: 'sm'` (40px)**: các bậc này KHÔNG gate theo cảm ứng nên hạ gem là thẻ thấp đi và
  lệch hàng trên MỌI máy. Muốn gọn trên màn hẹp thì gate ở nơi dùng (`max-lg:` / `touch:`).
- **Số qua `COMPACT_KPI_CARD_VALUE_CLASSES[emphasis][size]`** (semibold + `tabular-nums`), không `<Text>` (Text quy
  `bold` về 500). `strong` nâng số / đơn vị 1 bậc để đọc từ xa; gem giữ nguyên, không đổi cao hàng KPI.
- **`footer`** nằm trong cột bên phải `GemIcon` nên không cộng thêm chiều cao card khi còn nằm trong
  khoảng cao của gem.

## SummaryPill

- **Nhãn bậc đôi `-8` (sáng) / `-2` (tối)**, cùng lý do `CompactKpiCard`: nền pill là màu PHA nên lật theo
  theme, còn `-2` gần trắng ở cả hai theme.
- **Quầng số chỉ ở theme tối** (`dark:[text-shadow]` đọc `--summary-pill-tone` khai ở `style`). Không quầng ngoài:
  `clip-path` vát góc cắt mất mọi `box-shadow` ra ngoài; viền là `inset` 1px tone 20%.
- **Màu theo Figma với tên legacy**: `sky` dùng họ `primary` nên ra XANH LÁ (muốn xanh dương dùng `blue`);
  `pink` cố ý trộn nền fuchsia + chữ pink.
- **Value to hơn nhãn ≥ 2 bậc** ("nhìn phát biết luôn"): nhãn lùi về caption, số là thứ đập vào
  mắt; số luôn `tabular-nums` (`visual-hierarchy.md §3.3`).
- **Ornament**: vát góc TL + BR + 2 ngoặc chữ L ở TR + BL theo tone — cùng ngôn ngữ hình khối
  với `HudFrame` / `TitleScreen`, không dùng left-border 2px.

## CardScreenshot

- **`rounded` đặt ở ROOT** (root đã `overflow-hidden` nên ảnh tự bị cắt theo): đừng bo lại từng lớp
  con — hai bán kính lệch nhau 1px làm mép ảnh lởm chởm.
- **Nền `variant="default"` pha `teal-5` vào `bg-surface`/`bg-subtle`** (họ `BoxInfo`), không dùng gradient
  xanh lá của thanh điều hướng. Viền 1px ở theme sáng; 2px + quầng trong CHỈ ở theme tối.
- **Chữ đè ảnh chốt màu cố định, không lật theo theme**: caption `overlay` dùng chữ sáng; nút `actionIcons`
  nền tối + chữ trắng — ảnh sáng hay tối tuỳ tấm nên chữ / nút tự cõng tương phản.
- **Vùng `actions` chặn nổi bọt** (`stopPropagation`): bấm nút hành động không được mở lightbox hay
  kích hoạt `onClick` của cả thẻ. `actionIcons[].name` bắt buộc `-bold` (nét mảnh chìm trên ảnh).
- **Lớp bấm trên ảnh là `<button>` thật** phủ kín vùng ảnh (Tab + Enter / Space, tên = `alt` / `title`), dưới badge /
  nút góc / caption. KHÔNG `role="button"` lên vùng ảnh: con của nó thành trình bày, nút `actionIcons` mất khỏi trợ năng.

## HudKpiCard

- **Khung dùng thẳng `HudFrame intensity="cyber" weight="hairline"`**: 4–6 khung nét 2px xếp liền nhau
  cộng dồn thành mảng sáng.
- **Xếp CHỒNG nhãn → số → dòng phụ**, không dàn một hàng ngang: khối chữ cao đúng bằng viên `GemIcon`,
  giữa thẻ không còn khoảng trống to bằng cả con số.
- **`gray` mượn khung `indigo`**: `HudFrame` không có tông trung tính; pha loãng `neutral` ra viền thì chìm
  vào nền navy. Số của thẻ `gray` vẫn `text-fg-heading`.
- **Co theo bề rộng của CHÍNH thẻ** (`@container`), không theo màn hình; dòng số `flex-wrap` nên huy hiệu
  rớt dòng thay vì tràn khỏi thẻ.
- **Thẻ có `bar` luôn giữ chân thẻ**, kể cả khi tổng bằng 0 hoặc đang tải: bỏ chân là thẻ thấp hơn, thanh
  của các thẻ cùng hàng không còn nằm trên một đường.
- **Không đo mép vùng nội dung, không có bậc `phone:`** — việc của trang dashboard. Màu qua `--kpi-c` nên nền loang +
  quầng số là MỘT chuỗi class cho mọi màu; quầng số (semibold) và quầng chấm chú thích chỉ ở theme tối.

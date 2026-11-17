# Light Theme — ngôn ngữ giao diện sáng (VCI)

> Base này là bản **SÁNG làm mặc định** của `source-base` (bản tối HUD). Theme tối vẫn còn (nút đổi theme, chế độ TV ép
> tối) và giữ nguyên ngôn ngữ HUD — file này nói theme SÁNG trông thế nào, vì sao, và luật nào máy giữ.
> Token: `color-system.md` · chọn token theo tình huống: `color-usage-guide.md` · chart: `chart-conventions.md` ·
> icon nhận diện: `vci-icon-system.md` · bảng nhập liệu: `../display/data-entry-table.md`.

---

## 0. Một câu

**Nền ánh xanh lá nhạt, thẻ trắng, chữ mực ánh lục, MỘT điểm nhấn gradient thương hiệu VCI ở thanh header nổi, bo mềm
kiểu macOS, bóng mảnh nhiều lớp — không quầng, không lưới, không ngoặc góc.** Mọi thứ còn lại phẳng và yên để số liệu là
thứ nổi nhất.

| Mặt | Sáng (base) | Tối (xanh đêm kiểu macOS dark) |
|---|---|---|
| Nền trang | `bg-page` `#F1F5F4` + wash `primary-2` nhạt 320px ở đỉnh | `#070B10` + "cực quang" bốn góc (xanh lá · ngọc · lam · chàm 26–40%) + wash xanh lá 460px; KHÔNG lưới |
| Bề mặt | trắng, viền `border-default` 1px, bóng mảnh | BA TẦNG tách rõ: nền `#070B10` → thẻ `#141D27` (+ ánh sáng phủ mặt `--surface-sheen`) → vùng chìm `#1F2C3A`; viền `#35495D` + viền bắt sáng mép trên (`rim-soft` 28% trắng) |
| Góc | bo theo thang `rounded-*` (4 → 20px) | CÙNG thang — bo mềm ở cả hai theme (`radius.css`, không khai lại dưới `.dark`) |
| Điểm nhấn | gradient VCI ở thanh header nổi · viên trắng / đặc cho mục đang mở | cùng điểm nhấn; màu bão hoà kiểu Apple (`success` `#30D158`, `warning` `#FF9F0A`, `info` `#4DA8FF`, `link` mint `#46E3A5`) + thẻ KPI nhuộm tông 20% (`--tint-card`) |
| Tiêu đề khối | vạch dọc `primary-6` 3px bo tròn | cùng vạch dọc |

---

## 1. Bộ màu — vì sao là những mã này

### 1.1. Thương hiệu: dải logo VCI (`primary` 1–9)

Nguồn: logo VCI — vòng tròn ghép từ ba cung dốc **xanh lá → ngọc → lam**, chữ đỏ, chấm đỏ trên đỉnh. Thang `primary` đi
đúng chiều dải đó: bậc sáng ngả xanh lá, bậc giữa là ngọc, bậc sâu ngả lam.

| Bậc | Hex | Tương phản trên trắng | Dùng cho |
|---|---|---|---|
| 1 | `#EEF8F2` | 1,09 | nền nhạt nhất (tint) |
| 2 | `#D5EFDF` | 1,22 | wash nền trang, nền bôi đen chữ, ô chọn nhạt |
| 3 | `#A9DEC0` | 1,51 | viền nhấn nhẹ |
| 4 | `#6DC596` | 2,08 | chữ / viền nhấn ở theme TỐI (`link` tối) |
| 5 | `#2FA562` | 3,14 | **vòng focus** (`ring-focus`), vạch / chấm chỉ báo, đầu dốc ô `AppTile primary` |
| 6 | `#19825A` | 4,79 | **nút chính** (chữ trắng), mục được chọn đặc, series chart #1 |
| 7 | `#14726E` | 5,73 | **link · action-base** (chữ ngọc), đáy dốc nút chính |
| 8 | `#0B5E74` | 7,32 | chữ viên đang mở trên header `brand`, cuối dốc ô `AppTile primary` |
| 9 | `#08465C` | 10,29 | chữ bôi đen trên nền `primary-2` |

⛔ Bậc 5 KHÔNG làm màu chữ (3,14:1 < 4,5:1). Chữ màu thương hiệu dùng `text-link` (= bậc 7). ⛔ `primary` KHÔNG phải
`green` / `success` — xanh lá trạng thái là họ `green`.

### 1.2. Vàng kim (`yellow` = `accent`)

`#FFC62F` (bậc 5) làm NỀN nút accent với chữ mực; `#B18535` (bậc 7) là series chart "vàng kim"; chữ vàng dùng
`action-accent` `#8A6420` (5,35:1). Vàng kim còn là: vòng focus trên header `brand` (vòng xanh chìm trên gradient xanh),
chấm nhấn icon VCI trên ô `AppTile` (`yellow-4`), quầng rất nhạt góc header. Vàng KHÔNG dùng cho cảnh báo (cảnh báo là
CAM — `warning`).

### 1.2.1. Đỏ logo (`icon-accent`)

`#E33D40` sáng · `#F26A73` tối — CHỈ là chấm nhấn của icon VCI bản `duo` (chấm đỏ trên chữ V của logo,
`vci-icon-system.md` §3). ⛔ Không dùng làm màu lỗi (lỗi = `error`), không tô chữ, không đặt `duo` trong cột trạng thái.

### 1.3. Neutral ánh "sage" — xám ngả lục

Radix Colors ghép **teal ↔ sage**: xám hơi ngả lục làm nền thương hiệu xanh trông sạch thay vì "bẩn". Mọi `fg-*`,
`border-*`, `bg-*` sáng đều trong họ này.

| Vai | Token | Hex | Tương phản trên trắng |
|---|---|---|---|
| Tiêu đề · số KPI | `fg-heading` | `#101816` | 18,0 |
| Tiêu đề phụ · nhãn form | `fg-subheading` | `#1D2724` | 15,4 |
| Nội dung | `fg-body` | `#2E3936` | 12,0 |
| Gợi ý · metadata · trục chart | `fg-muted` | `#5E6A66` | 5,63 |
| Placeholder · disabled | `fg-faint` | `#8A9591` | 3,09 (KHÔNG cho chữ cần đọc) |
| Viền mặc định | `border-default` | `#E2E7E5` | — |
| Viền đậm / hover | `border-strong` | `#CDD5D2` | — |
| Nền trang | `bg-page` | `#F1F5F4` | — |
| Nền chìm (header bảng, callout) | `bg-subtle` | `#F3F6F5` | — |

⛔ Chữ KHÔNG bao giờ đen tuyền `#000` — mực `#101816` cho nét đậm mà không chói.

### 1.4. Gradient thương hiệu — CHỈ một chỗ

| Token | Sáng | Dùng |
|---|---|---|
| `bg-brand-from` → `bg-brand-via` → `bg-brand-to` | `#1F8A63` → `#14726E` → `#08587B` | thanh header kiểu `brand` (xanh lá trái → lam sâu phải, đúng chiều dải logo) |

- Thanh `brand` phủ thêm các đường cong đồng tâm rất mảnh ở góc phải + hai quầng rất nhạt (`primary-4` góc trên · vàng
  kim góc dưới phải) — nhìn kỹ mới thấy, không phải trang trí.
- ⛔ KHÔNG rải gradient thương hiệu lên nút, thẻ, tab. Nút chính là mặt ĐẶC xanh thương hiệu (`primary-6`, rọi nhẹ trên →
  dưới trong cùng họ như nút macOS); thẻ KPI hero (nếu cần) dùng tint. Ô `AppTile` dốc màu theo tông (icon app) không tính
  là gradient thương hiệu. Một màn = một dải gradient (header).
- Chữ trên gradient: trắng (`neutral-0`), chữ phụ trắng 80%. Mục đang mở: viên TRẮNG nổi, chữ `primary-8`.

### 1.5. Kính mờ (glass)

`bg-glass` (trắng 66%) + `backdrop-blur-xl/2xl backdrop-saturate-150` + viền bắt sáng `rim-glass` (§7.1) + bóng
`shadow-glass`. Dùng cho: **Dock**, header kiểu `glass`, `InsetGroup surface="glass"` và widget kính — luôn trên nền CÓ
MÀU / ảnh. ⛔ Không dùng kính cho thẻ / panel nội dung trên nền trơn (chữ trên kính đọc kém, kính trên nền trơn thành
hộp xám bẩn). Người dùng bật "Giảm trong suốt" → Dock thành mặt đặc (`dock-magnify.css` §4).

---

## 2. Nền trang

`.app-background` (sáng): `bg-page` + một lớp wash `primary-2` 70% → trong suốt trong 320px đầu + quầng thương hiệu
rất nhạt góc phải trên. **KHÔNG lưới** — lưới là ngôn ngữ HUD, ở theme sáng nó thành nhiễu sau bảng số liệu. Thẻ trắng
nổi trên nền ánh xanh bằng tương phản nền, bóng chỉ phụ.

---

## 3. Bo góc — `src/styles/theme/radius.css`

| Token | px | Dùng cho |
|---|---|---|
| `rounded-xs` | 4 | checkbox, kbd, chấm đếm, vạch tiêu đề khối |
| `rounded-sm` | 6 | dòng popup của select, ô lịch, chip, tag, con trượt segment, ô `AppTile xs` |
| `rounded-md` | 8 | **control**: nút, ô nhập, segment; dòng menu (trong panel `lg` đệm 4) |
| `rounded-lg` | 12 | **bề mặt**: card, panel, popover, menu, dropdown, callout |
| `rounded-xl` | 16 | toast, tooltip `hint` (một dòng thành viên con nhộng), hộp nhóm `InsetGroup`, `AppTile xl` |
| `rounded-2xl` | 20 | vỏ Dock, **thanh header nổi**, thẻ hero / widget, hộp thoại · drawer (cạnh trong), nút viên ở footer hộp thoại |
| `rounded-full` | ∞ | avatar, chấm trạng thái, pill, mọi control trên thanh header (KHÔNG đổi theo theme) |

- **Một class, hai hình**: `rounded-md` = 8px ở sáng, 0 ở tối (`.dark` đặt mọi `--radius-*` = 0 trong
  `base/root-vars.css`). ⛔ KHÔNG viết `dark:rounded-none`.
- **Lồng nhau**: bán kính trong = bán kính ngoài − đệm (panel `lg` 12 + đệm 4 → dòng `sm`/`md`). Con vẽ nền sát mép
  (header bảng, ảnh) → cha `overflow-hidden`.
- Cần tròn ở CẢ hai theme (avatar, chấm) → `rounded-full`. Pill muốn VUÔNG ở tối → `rounded-2xl` (đủ tròn ở cỡ nhỏ).
- **Góc squircle** (`src/styles/utilities/squircle.css`): thêm class `squircle` cho khối bo LỚN đứng riêng — ô `AppTile`,
  vỏ Dock, thanh header nổi, `InsetGroup`, hộp thoại / Spotlight, thẻ trang chủ, ô `ChoiceTiles`. Vẽ đường cong liên tục
  như icon macOS bằng `corner-shape: squircle` trong `@supports` — trình duyệt chưa hỗ trợ giữ góc tròn thường. Vòng
  `rim-*` kế thừa góc. ⛔ Không đặt cho control nhỏ (≤ 8px), không đáng.

---

## 4. Độ nổi (elevation)

Bóng là **nhiều lớp mỏng, nhuộm mực sage** (`shadow-popup` = `rgba(16,24,22,.10)`), không bao giờ một lớp đen dày.

| Tầng | Công thức (token) | Ví dụ |
|---|---|---|
| Nghỉ (card, panel) | `0 1px 2px shadow-popup` + `0 1px 1px` 60% | `BoxPanel`, `Surface`, `InsetGroup raised` |
| Nổi nhẹ (hover nút viền) | `0 4px 10px -4px shadow-popup` | `Button stroke` |
| Lớp nổi (popover, menu, dropdown, toast) | nền TRẮNG ĐỤC + viền `border-strong` 1px + 3 lớp bóng (chạm 1px · gần · tản mềm), KHÔNG kính / blur | `FLOATING_SURFACE_LIGHT_CLASS` qua `popupSurface` |
| Kính (Dock, header `glass`) | gờ sáng đỉnh + viền bắt sáng `rim-glass` + bóng mềm `shadow-glass` | `Dock` |

⛔ Không quầng màu (`0 0 24px primary`) ở theme sáng — quầng là ngôn ngữ HUD, chỉ qua `dark:`.

---

## 5. Chữ — nét và nhịp

- Font: **Inter** (trục `opsz` — chữ ≥ 20px tự sang bản Display), dự phòng `-apple-system` (đủ dấu tiếng Việt khi Google
  Fonts bị chặn). Thang `text-{scale}-{weight}`: `font-system.md`.
- Weight sáng: thân 450 · nhãn 500 · tiêu đề khối 600 · số KPI 700. ⛔ Dưới 400 ở cỡ ≤ 14px.
- Số: `tabular-nums`, KHÔNG font mono (`visual-hierarchy.md` §3.3.1). Định dạng **vi-VN** `1.234.567,89` ở MỌI nơi —
  `formatNumber` khi hiển thị, `NumberInput thousandSeparator` khi nhập (chấm tách nghìn, phẩy thập phân).
- Bôi đen chữ: nền `primary-2` + chữ `primary-9` (`base/document.css`).

---

## 6. Shell — header, Dock, tab trang

### 6.1. Header (`shared/widgets/header`) — tiêu đề GIỮA, tab HAI BÊN, đường cong mềm

Học từ header màn điều hành Trung Quốc (可视化大屏: tiêu đề giữa, menu đối xứng hai bên), app sản xuất `vci-sbc-confluent/fe`
(một hàng mỏng) và macOS (bo cong liền mạch):

```
              ┌─────────────────────────────╮                ╭──────────────────────────┐
[⊞][VCI][‹]   ╭Dashboard╮ Kế hoạch  Báo cáo    ╰─  Gia công  ─╯   Thực hiện  Loại thép  Bó cáp    [⌕ Tìm kiếm…] [● An ▾]
              ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▁▁▁▀▀▀▁▁▁▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔   ← khay cong chữ S · tab cong đứng trên mép đáy · vạch vàng dưới tên
◆  ← thanh DỌC lịch sử thẻ sát mép trái (§6.6) · cột icon bộ lọc sát mép phải — đều NỔI ĐÈ, không chiếm bề ngang
```

- **Lưới 3 cột** `1fr · auto · 1fr` (`HEADER_SLOT_CLASSES.bar`): khối tiêu đề luôn ĐÚNG GIỮA bất kể hai bên dài ngắn.
  Trái: ⊞ · logo · chip ngữ cảnh (cấp 0–1) · ‹ quay lại (cấp ≥ 2) · nửa tab trái (dồn về phía giữa). Phải: nửa tab phải ·
  ô `end` · tìm kiếm · tài khoản.
- **Khối tiêu đề** (`ModulePlate`): CHỈ tên trang `<h1>` 18px đậm — không icon, không vệt phân hệ, không nút. Tên do
  `PageHeader` báo lên qua `HeaderSlotsProvider` (dòng phụ thành tooltip `Tên — dòng phụ`); trang không báo → tên màn hình,
  rồi tên phân hệ. Tiêu đề nằm trong **THUNG LŨNG** giữa hai khay cong, điểm nhấn = quầng sáng mờ từ đáy + vạch `--hdr-bar`
  (vàng kim) mờ dần hai đầu ở mép đáy. Bóng chữ là `text-shadow` (không `drop-shadow` — rasterize cả khối). Tối: khay HUD vuông.
- **Tab hai bên** (`HEADER_SIDE_TAB_CLASSES`): trang có tab riêng (`PageHeader nav`) → tab của TRANG chia đôi (nửa đầu trái,
  nửa sau phải); không có → dải MÀN HÌNH của phân hệ chia đôi (`ModuleNav half`). Học bố cục `vci-sbc-confluent/fe` (khay
  trên nhóm tab, tab đứng trên ray đáy, bảng tên giữa) nhưng nét UỐN LƯỢN thay vát thẳng (`header-curves.css`):
  - **Khay** (`HEADER_SIDE_TRAY_CLASSES`): nền mờ `--hdr-tray` + viền trên `--hdr-tray-line` chạy ngang trên nhóm tab, mờ
    dần ra mép ngoài, tới đầu sát tiêu đề CONG CHỮ S (bezier tiếp tuyến ngang hai đầu) đổ xuống mép đáy thanh.
  - **Tab cong**: đứng trên mép đáy, góc trên bo 10px, hai CHÂN LOE lõm 8px chảy vào mép đáy như tab trình duyệt; rê =
    thân mờ `--hdr-hover`; đang mở = thân ĐẶC `--hdr-pill` (trắng chữ ngọc sâu trên `brand`, ngọc đặc chữ trắng trên `glass`).
  Mỗi nửa tự co: mục không vừa dồn vào "Thêm ▾" (`useFitCount` đo ô `[data-header-side]`), mục ĐANG MỞ luôn ở lại. Dưới `xl` hai bên
  ẩn — tab của trang rơi về dải gạch chân trong trang (§6.2), màn hình phân hệ mở qua ⊞.
- **Thanh nổi (island)**: vùng `<header>` 56px (≥ 1800px: 64px) — `HEADER_HEIGHT_CLASS`; thanh 48 / 56px bo `2xl` + `squircle`,
  cách mép trên 8px. Mọi control cao `HEADER_CONTROL_HEIGHT` (32 → 36px); tab hai bên 32 / 36px đứng trên mép đáy.
- **Kiểu thanh** (menu tài khoản → "Kiểu header"): `brand` gradient VCI (chữ trắng, tab mở trắng, vạch vàng kim) · `glass`
  kính trắng (chữ mực, tab mở ngọc đặc). Mỗi kiểu chỉ khai biến `--hdr-*`; màu khay theo `[data-appearance]` ở `header-curves.css`.
- **Nút ⊞ "Tất cả phân hệ"** (`ModuleSwitcher`): bảng 全部菜单 — tìm (bỏ dấu) cả tên phân hệ lẫn tên màn hình, "Gần đây",
  lưới thẻ phân hệ có danh sách màn. Mọi màn của mọi phân hệ cách HAI chạm.
- **‹ quay lại** (cấp ≥ 2): nút trơn bên TRÁI ngay sau logo, `<Link>` thật; **Ctrl/⌘ + ↑** lên một cấp (bỏ qua khi đang gõ).
- **Hành động của trang** (`PageHeader actions`: xuất, tạo mới, làm mới): widget tự dựng theo biến `--hdr-*` — nút phụ = icon
  tròn trong suốt + tooltip, `primary` = VIÊN ĐẶC `--hdr-pill` có chữ (trắng chữ ngọc sâu trên `brand`). ⛔ Không đặt `<Button>`
  thường vào `end` — nút xám / trắng của UI kit lạc tông trên thanh màu. Thanh không có khối tiêu đề → ô phải vẫn ghim cột 3.
- **Bộ lọc của trang** (`PageHeader filters`): KHÔNG nằm trên thanh — cột icon dọc nổi sát mép phải (§7). `end` chỉ cho 1–2
  hành động luôn hiện (chọn kỳ chính, làm mới, xuất).
- **Logo VCI** trên viên trắng (`BRAND_MARK` ở `src/app/shell/AppHeader.tsx`); avatar vòng trắng 2px; bỏ qua tới nội dung
  bằng liên kết ẩn trước header.

**Cấp của header** — `useActiveModule` (`src/app/router/menu/useActiveModule.ts`) trả `level` · `backHref` · `rootHref`;
`AppHeader` truyền vào `Header` (widget không đọc registry):

| Cấp | URL | Khác biệt trên thanh |
|---|---|---|
| 0 | ngoài phân hệ (bàn làm việc, hồ sơ, cài đặt) | không tab hai bên (trừ tab của trang) |
| 1 | màn đích của phân hệ (`landingPath`) | tab hai bên = màn hình phân hệ |
| 2 | một màn hình khác của phân hệ | thêm ‹ (về màn đích), logo thu gọn, chip ngữ cảnh ẩn |
| 3 | sâu hơn (chi tiết bản ghi, `hideInNav`) | như cấp 2, ‹ về màn hình chứa nó |

### 6.2. Tab của trang — trên header từ `xl`, trong trang dưới `xl`

`PageHeader nav` dựng tab ở HAI chỗ từ cùng một dữ liệu, chia nhau đúng một mốc `xl` (1280px):

| Bề rộng | Chỗ | Hình |
|---|---|---|
| ≥ `xl` | Ô `tabs` của header, ngay sau crumb (`PAGE_HEADER_TAB_CLASSES.bar`, `max-xl:hidden`) | chữ trơn như dải màn hình, tab đang mở = viên `--hdr-pill` nổi (hai dải không đứng cùng lúc: từ cấp 2 dải màn hình thành vệt ‹); hết chỗ → "Thêm ▾"; nội dung trang lên sát header, không tốn một hàng |
| < `xl` | Trong luồng trang, ngay chỗ đặt `<PageHeader>` (`PAGE_HEADER_TAB_CLASSES.page`, `xl:hidden`) | dải gạch chân (kiểu GitHub): chữ `fg-muted` → mục mở chữ `link` semibold + vạch `primary-6` 2px |
| Điện thoại | Ô `nav` dưới top bar | dải chip cuộn ngang |

Action icon đứng sau tab cuối. Tràn chỗ → cuộn ngang, không ẩn tab; ← / → chuyển tiêu điểm giữa các tab. ⛔ Đổi mốc thì
đổi CẢ HAI bản (`bar` lẫn `page`). Trang KHÔNG tự dựng tab trên header — chỉ truyền `nav`.

### 6.3. Dock (`shared/widgets/dock`) — macOS

- Kính mờ bo 20px, ô `AppTile` 44px theo **tông phân hệ** (`meta.tone`), chấm "đang mở" 4px màu mực dưới ô (như
  macOS), tooltip bung vào trong màn.
- **Phóng lân cận LIÊN TỤC** như Dock macOS: hệ số theo khoảng cách tới con trỏ (đỉnh 1,5×, lan ~2,5 ô), trôi mượt theo
  khung hình; ô kề nhường chỗ VỪA KHÍT (khe giữ nguyên — ô không bao giờ chồng), vỏ kính nở đều hai đầu theo, ô nở to hơn
  nằm trên. Focus bàn phím nở nhẹ 1,12×. Máy chạm / "giảm chuyển động" không phóng.
- **Cạnh neo**: đáy (mặc định) · trái · phải — panel bánh răng có ba "màn hình thu nhỏ" để chọn. Phóng, bay vào, vùng
  gọi ra khi tự ẩn, chấm đang mở đều xoay theo cạnh.
- **Ghim → chừa chỗ** (`useDockReserveClass`): `<main>` có đệm 80px ở cạnh neo để bảng / form không chui dưới Dock
  (cửa sổ macOS cũng vậy). Tự ẩn / thu gọn / ẩn → Dock nổi đè, nội dung dùng trọn màn.
- Máy chạm luôn ghim. Điện thoại thay Dock bằng thanh tab đáy.

### 6.4. Tông phân hệ (`AppTile`)

Một phân hệ = MỘT tông ở Dock, launcher, bộ chọn, vệt đổi cấp, thẻ màn hình: `primary · blue · indigo · purple · pink ·
orange · yellow · green · teal · sky · red · neutral`. Tông là DANH TÍNH, không phải trạng thái (đừng dùng `red` cho phân
hệ "quan trọng"). Khai ở `meta.tone` của `ModuleDef` (`routing-conventions.md`). Tông `primary` dốc 3 bậc xanh lá → ngọc
→ lam như vòng cung logo; icon VCI trên ô vẽ bản `duo` với chấm vàng kim (`vci-icon-system.md`).

### 6.5. Trang chủ phân hệ (`ModuleHomePage`)

**Mặc định: bấm phân hệ vào THẲNG màn hình đầu tiên** (Dock, ⊞, vệt header, bàn làm việc) — phân hệ khai `meta.landingPath`
= màn đầu và KHÔNG có route index (mẫu: `erp-sample.routes.ts`, hàm `landingOf`). Màn đích đứng ở cấp 1: dải màn hình
hiện viên sáng của nó (tên trang trùng viên sáng thì không lặp crumb); phân hệ chỉ một màn → dải ẩn, crumb tên trang ở lại.

Cần trang tổng quan phân hệ thì thêm `{ index: true, page: LazyModuleHomePage }` (`src/app/pages/ModuleHomePage.tsx`):
thẻ giới thiệu (ô `AppTile` lớn + tên + mô tả + số màn hình) và lưới **thẻ màn hình** — mỗi thẻ là `<Link>` thật với icon
`meta.navIcon` (bỏ trống → icon phân hệ) và một dòng `meta.navDescription`; nhóm (layout có con) thành hàng riêng có tiêu
đề. Header ở cấp 1 trên trang này; bấm một thẻ → header đổi sang cấp 2.

---

### 6.6. Thẻ làm việc (`shared/widgets/work-tabs`) — 多页签 dạng THANH DỌC lịch sử

Mỗi màn hình đã mở thành một THẺ, bấm là quay lại đúng chỗ — giữ cả query (bộ lọc, tab trong trang). Không chiếm một hàng
của trang: THANH DỌC 32px nổi sát mép trái cửa sổ (cách 6px, ngay dưới header — máy tính / tablet; ẩn ở TV, điện thoại
dùng top bar), `<main>` chừa 6 + 32 + 8px khi thanh hiện (`useWorkTabsRailVisible`, `WORK_TABS_RAIL_WIDTH`).

```
┃▣┃ ← 3 màn mở gần nhất (ô phân hệ 24px, mới nhất trên cùng), màn đang mở = vạch 2px mép trái; rê → tooltip bên phải
┃▣┃
┃▣┃
┃─┃
┃+5┃ → bảng sang phải: [lọc (> 6 thẻ)] Gần đây · Đã ghim · Trước đó (ghim / × từng dòng) · Trang chủ · Đóng các thẻ khác
```

- **Mở bảng**: bấm / Enter nút "+N" (tiêu điểm vào bảng, ↑↓ Enter Home End, Esc đóng) hoặc rê chuột ~150ms kiểu menu macOS
  (rời chuột là đóng). Ctrl/⌘ + Shift + `[` / `]` sang thẻ trước / sau theo thứ tự mở (Apple: ⌃⇧ — ⇧⌘[ ] là phím của trình
  duyệt). ⛔ Không dùng Alt + ← / → (lùi / tiến của trình duyệt).
- **Vị trí không đổi theo Dock**: Dock trái xếp DƯỚI thanh trong cùng cột (thanh công bố mép dưới ở `--work-tabs-rail-bottom`
  trên `:root`); bảng né Dock đáy / phải (`edgeInset` do `AppWorkTabs` tính) và không tràn màn.
- **Hình**: thanh = viên KÍNH như Dock (`rim-glass` + `squircle`), tối = khay HUD; bảng = `Popover solid` (mặt nổi đục `FLOATING_SURFACE_LIGHT_CLASS`) + `squircle`,
  dòng bay vào lần lượt; dòng đang trỏ = nền đặc `primary-6` chữ trắng (§7), màn đang mở = chữ đậm + "Đang mở". Máy chạm luôn
  hiện nút ghim / ×. Mọi chuyển động tắt khi giảm chuyển động.
- Tối đa `WORK_TABS_LIMIT` (12) thẻ; đủ thì bỏ thẻ chưa ghim mở lâu nhất. Đóng thẻ đang mở → sang thẻ mở gần nhất còn lại
  (hết thì Trang chủ). Lưu localStorage (`work-tabs-storage`).
- Tầng app (`src/app/shell/AppWorkTabs.tsx`) đẩy màn đang mở vào store (`visit`): tên = tiêu đề route sâu nhất, dòng phụ =
  `Phân hệ · Màn con`, ô màu = phân hệ. Tắt / bật: menu tài khoản → "Ẩn / Hiện thẻ làm việc".

### 6.7. Bàn làm việc (`src/app/pages/HomePage.tsx`) — 工作台

Trang chủ = mọi phân hệ thành THẺ (ô phân hệ + tên + mô tả, 3 lối tắt tới màn chính + "+N") · "Mở gần đây" (từ lịch sử thẻ làm
việc, hộp nhóm có ›) · "Bắt đầu với base" (hộp nhóm `sunken`). Một chạm từ trang chủ tới chức năng; dữ liệu từ menu đã
lọc quyền (`useAppMenu`) nên thêm phân hệ là bàn làm việc tự có thẻ.

## 7. Mẫu macOS — khi nào dùng

| Mẫu | Dùng cho | Luật |
|---|---|---|
| **Hộp nhóm thụt lề** (grouped inset) | Cài đặt, danh sách đi sâu có số đếm, cặp nhãn – giá trị của bản ghi | `InsetGroup` + `InsetGroupRow`: tiêu đề NGOÀI hộp, vạch ngăn thụt vào, mỗi nhóm một chủ đề, không lồng hộp. Mẫu thật: `SettingsPage` (Giao diện · Màn hình lớn · Phím tắt). Chọn giữa hộp nhóm / `Table` / `BoxPanel`: `reuse-first.md` §3.3 |
| **Kính chỉ trên nền có màu** | Dock, header `glass`, `InsetGroup surface="glass"`, widget kính trên dải gradient / hero | ⛔ Kính trên nền trơn = hộp xám bẩn → dùng `raised` (trắng) hoặc `sunken` (xám nhạt trong bề mặt trắng) |
| **Chọn = nền đặc màu nhấn** | Mục rê / chọn trong menu, ngày chọn trong lịch, mục đang mở của menu màn hình, viên đang mở trên header `glass` | nền `primary-6` đặc + chữ trắng — như highlight của menu macOS; không "nền nhạt + viền" cho mục đang chọn của danh sách nổi |
| **Ô số liệu kiểu widget** | Thẻ KPI đứng riêng | nhãn nhỏ IN HOA giãn chữ · MỘT con số lớn đậm (`tabular-nums`) · hình phụ tối giản (sparkline / vòng) có CHẤM ở điểm hiện tại · dòng phụ mờ; không lưới, không chú thích thừa |
| **Trạng thái rỗng** | Bảng / danh sách / panel trống | ô icon + MỘT câu `fg-muted` nói chuyện gì và làm gì tiếp (`EmptyState`); không minh hoạ to, không chữ HOA |
| **Chọn một trong vài** | `SegmentToggle` | rãnh lõm xám + đoạn đang chọn nổi lên như chip trắng; skin màu giữ mặt màu |
| **Chọn bằng hình** | Giao diện Sáng / Tối, màu nhấn, kiểu bố cục | `ChoiceTiles` (`tile` ô ảnh thu nhỏ + nhãn · `swatch` chấm màu); đang chọn = viền ngoài cách 2px; đặt trong `InsetGroupRow wideControl` (điện thoại xuống dòng dưới tên) |
| **Spotlight** | Tìm nhanh ⌘K (`CommandPalette`) | sáng: lớp phủ gần như trong, bảng kính `rim-glass` neo ~16dvh rộng 672px, ô tìm chữ 18px, icon trong ô trắng bo, hàng đang trỏ TÔ ĐẶC màu nhấn chữ trắng; tối giữ HUD |
| **Thông báo góc trên phải** | `Toast` | laptop / tablet: góc TRÊN phải ngay dưới header (như banner macOS), mới nhất trên cùng, rộng ≤ 380px; góc dưới phải để rail tiến trình; điện thoại giữ đáy trên thanh tab |
| **Sidebar chọn đặc** | Mục lục `/demo`, sidebar kiểu System Settings | mục đang xem = viên `primary-6` đặc chữ trắng + `edge-hi` |
| **Cột bộ lọc bên phải** | `PageHeader filters` (kỳ, kho, phòng ban…) | cột icon 24px dọc nổi sát mép PHẢI dưới header (kính, đè lên nội dung, không chiếm bề ngang); chấm = đang khác mặc định; rê đọc "tên · giá trị", bấm mở bảng sang trái — `options` cho danh sách chọn dọc dựng sẵn (dòng đang chọn nền đặc `primary-6`, dòng phụ / số canh phải, chọn là đóng: một chạm, không dropdown lồng); MỌI bộ lọc phạm vi trang (kỳ, kho, xưởng, trạng thái) đưa vào đây, ô tìm của bảng ở lại hàng tiêu đề khối; Dock neo phải canh giữa phần dưới cột (`--page-filter-rail-bottom`); điện thoại: nút phễu trên top bar |
| **Phím tắt theo máy** | Mọi nhãn phím (tooltip, `kbd`, Cài đặt) | `formatShortcut('K')` (`shared/utils/browser/shortcut-label.utils`) → `⌘K` trên Apple, `Ctrl K` nơi khác; ⛔ không viết cứng `'Ctrl …'` |

### 7.0. Giao diện Tự động + Màu nhấn (System Settings › Appearance)

- **Tự động** (`theme: 'system'`): theo `prefers-color-scheme` của HĐH, đổi ngay khi HĐH đổi (`useEffectiveTheme` nghe
  media query). TV vẫn ép tối. `toggleTheme()` lật theme ĐANG HIỂN THỊ và lưu thành lựa chọn cố định.
- **Màu nhấn** (`accent`: `vci` · `blue` · `purple` · `pink` · `red` · `orange` · `yellow` · `graphite`): `<html data-accent>`
  (không có = `vci`) → `src/styles/overrides/accent.css` ánh xạ lại thang `--color-primary-1..9` sang họ màu đó, kèm
  `link` · `action-base` · `ring-focus` · nền rê / chọn của nav · gradient header `brand`. Mọi chỗ đọc `primary-*` đổi theo:
  nút chính, mục chọn, viên header, ô `AppTile` tông `primary`, ảnh thu nhỏ của Cài đặt.
- ⛔ Màu TRẠNG THÁI (`success` · `warning` · `error` · `info`) và tông phân hệ khác `primary` KHÔNG đổi theo màu nhấn.
  ⛔ Component không đọc `data-accent` — chỉ dùng `primary-*` / `link` / `action-base`, phần còn lại CSS lo.
- Chọn ở trang Cài đặt (`src/app/pages/settings/AppearanceGroup.tsx`), lưu cùng store theme (`light-base-theme`).

### 7.1. Viền bắt sáng (`src/styles/utilities/rim-light.css`) — CHỈ theme sáng

Ánh sáng chiếu từ TRÊN – TRÁI: mép trên-trái sáng nhất, hai hông nhạt dần, mép dưới-phải hắt vệt sáng phụ — viền KHÔNG
đều, đọc ra khối nổi có độ dày thay vì khung kẻ phẳng.

| Class | Đặt lên | Cách vẽ |
|---|---|---|
| `rim-glass` | Kính mờ trên nền màu / ảnh: header kiểu `glass`, Dock, `InsetGroup surface="glass"`, widget kính | `::after` vòng 1px dốc trắng — THAY cho `border` sáng |
| `glass-island` (+ `-sm`) | Bóng chung của ĐẢO KÍNH đi kèm `rim-glass`: Dock, header `glass` · `-sm` thanh dọc (lịch sử thẻ, bộ lọc) | gờ sáng trong + vòng 1px `border-strong` + bóng đổ 2 lớp — một chỗ khai thay 4 bản chép |
| `rim-tile` | Mặt màu đặc bão hoà: ô `AppTile`, thanh header `brand` | `::after` vòng 1px trắng mạnh ở trên-trái, gần tắt ở giữa, hắt nhẹ dưới-phải |
| `rim-soft` | Bề mặt TRẮNG có viền: thẻ, panel, `InsetGroup raised`, ô nhập / ô chọn, nút viền (`Button stroke`), thẻ bàn làm việc (popover / menu / toast KHÔNG dùng — xem mặt nổi đục §4) | đổi màu từng cạnh của viền sẵn có (trên nhạt, dưới đậm), không pseudo; LÙI khi rê (máy có chuột) / focus / mở / lỗi / chọn / khoá — màu viền của trạng thái thắng |
| `edge-hi` | Mặt có màu / nhuộm: ô icon tông (`GemIcon` sáng), chip nhuộm | vạch sáng 1px đỉnh BÊN TRONG (`--tw-inset-shadow`) — ghép với `shadow-*` / `ring-*` sẵn có, không đè |

- ⛔ `rim-glass` / `rim-tile` vẽ bằng `::after` định vị tuyệt đối → phần tử PHẢI định vị (`relative` / `absolute` /
  `fixed`), KHÔNG kèm `border` sáng, và KHÔNG dùng `after:` riêng ở theme sáng (`dark:after:` vẫn được).
- ⛔ Theme tối KHÔNG có viền bắt sáng: HUD là viền phẳng góc vuông (rule chỉ chạy khi `<html>` không có `.dark`).

---

## 8. Checklist theme sáng

- [ ] Không hex trong class / style (token — `color-system.md`); màu chữ chỉ `fg-*` / `link` / `text-neutral-0` trên nền đặc
- [ ] Bề mặt: viền `border-default` 1px + bóng nghỉ mảnh, bo đúng tầng của bảng §3 (control · bề mặt · hộp thoại)
- [ ] Không quầng / lưới / ngoặc góc / `//` ở theme sáng — trang trí HUD chỉ qua `dark:`
- [ ] Gradient thương hiệu chỉ ở header `brand`; nút chính mặt đặc xanh thương hiệu; vàng kim chỉ cho accent, vòng focus
      trên header `brand` và chấm nhấn trên ô `AppTile`
- [ ] Số `tabular-nums` + định dạng vi-VN; chữ màu thương hiệu dùng `text-link` (không `text-primary-5`)
- [ ] Trang có tab → `PageHeader nav` (≥ `xl` lên header, < `xl` dải trong trang), KHÔNG tự dựng tab
- [ ] Phân hệ mới có `meta.tone` + `meta.group` + icon VCI; route con có `meta.title` (+ `navIcon` / `navDescription` cho
      thẻ ở trang chủ phân hệ)
- [ ] Icon nhận diện nghiệp vụ = bộ VCI (`VciIcon` / `AppIcon`), icon chrome = `SystemIcon` (`vci-icon-system.md`)
- [ ] Cài đặt / danh sách đi sâu → `InsetGroup`; kính chỉ trên nền có màu; viền bắt sáng đúng class (§7.1)
- [ ] Màu thương hiệu qua `primary-*` (đổi theo màu nhấn §7.0); nhãn phím qua `formatShortcut`; khối bo lớn có `squircle`

---

## 9. Nguồn tham khảo

Logo VCI (dải xanh lá → ngọc → lam, chấm đỏ), Radix Colors (teal ↔ sage, APCA), Linear · Stripe · Vercel Geist · Attio
(nền 2 tầng, viền 1,15–1,3:1, chữ không đen tuyền, bóng nhiều lớp), SAP Fiori Horizon · Odoo 17 (thanh shell + app
switcher cho ERP), macOS System Settings · widget · Finder (hộp nhóm thụt lề, ô số liệu, ⌘↑ lên cấp), macOS Dock (cạnh
neo, chấm tiến trình, phóng), IBM Carbon · Datawrapper (chart ≥ 3:1, ≤ 7–8 series, kiểm mù màu).

### 9.1. Cơ sở thiết kế theme TỐI (nghiên cứu 2026-10-20)

Vì sao dark là "xanh đêm" nhiều tầng + màu bão hoà + nền gradient liền mạch — và những thứ cố ý KHÔNG làm:

| Nguồn | Bài học áp dụng |
|---|---|
| Apple HIG — [Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) | nền DỊU hơn, chữ / màu nhấn SÁNG hơn bản sáng và KHÔNG phải đảo ngược; hai tầng nền `base` (lùi) và `elevated` (tiến) → `bg-page` → `bg-surface` → `bg-dialog`; tương phản tối thiểu 4,5:1, chữ nhỏ nên 7:1; transparency chỉ ở thành phần ở trạng thái trung tính |
| Apple HIG — [Color](https://developer.apple.com/design/human-interface-guidelines/color) | bảng màu hệ thống tối bão hoà (green `#30D158`, orange `#FF9230`, yellow `#FFD600`, blue `#0091FF`, mint `#00DAC3`…); màu SÁNG chỉ cho nút chính — "màu ở nền của nút, không ở chữ", không tô màu nhiều control cùng lúc; ở môi trường tối màu trông sáng và bão hoà hơn nên không đẩy diện tích lớn |
| Apple HIG — [Materials](https://developer.apple.com/design/human-interface-guidelines/materials) | kính chỉ cho lớp điều khiển / điều hướng nổi (Dock, header `glass`), ⛔ không cho lớp nội dung (thẻ, panel) |
| Material 3 — dark theme | bề mặt càng cao càng SÁNG (lớp phủ), bóng yếu trên nền tối nên thứ bậc đến từ độ sáng; hạn chế mảng accent để phần lớn diện tích là bề mặt tối; nền xám đậm chứ không đen tuyền |
| Linear — [theme LCH](https://linear.app/now/how-we-redesigned-the-linear-ui) | độ sáng cảm nhận đều (LCH / OKLCH) thay HSL; hạn chế sắc xanh của khung để trông trung tính, lâu bền; chữ + icon trung tính sáng hơn ở tối |
| Radix Colors — 12 bậc | bậc 1–2 nền, 3–5 trạng thái thành phần, 6–8 viền, 9–10 màu đặc (chữ trắng), 11–12 chữ — thang tối của ta theo cùng vai |
| Kỹ thuật "tối sang" (CSS) | viền mảnh trắng 5–12% (không viền xám đặc dày), vệt sáng mép trên bằng `inset 0 1px`, dốc bề mặt `rgba(255,255,255,.02)` → trong suốt, thứ bậc chữ bằng độ đặc 100 / 60 / 30% — đã vào `rim-light.css`, `--surface-sheen`, thang `fg-*` |

Quyết định rút ra:

- **Nền trang là MỘT dải chéo liền mạch** (ngọc → xanh đêm → lam, `app-shell-layout.css`) — không quầng rời, không xanh lá `primary` pha nền tối (ra olive bẩn).
- **Màu bão hoà không đi qua alpha lên nền tối** (vàng 20% → nâu, đỏ → đỏ rượu): thẻ nhuộm dùng nền trung tính + ô icon rực + viền mảnh cùng tông (`--tint-card`, `--tint-card-rim`).
- **Lớp nổi (popup / menu / tooltip) dùng `bg-dialog`** — cao hơn thẻ một tầng ở tối, trắng ở sáng.
- **Biểu đồ**: hex series đã ghim (validator mù màu) dùng chung hai theme nên ở tối được nâng độ sáng lúc vẽ bằng `filter` (`overrides/recharts.css`), không đổi hex.
- **Hover dòng bảng** pha màu thương hiệu 13% vào thẻ (sáng 6%) thay vì xám — chip trung tính không chìm khi rê.

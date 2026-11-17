# iPad / Máy tính bảng — Quy chuẩn Responsive & PWA

> Áp dụng cho **mọi thay đổi giao diện nhắm tới máy tính bảng** trong `src/`.
> Mục tiêu: iPad thao tác mượt, không vỡ bố cục, không có phần tử đè lên nhau —
> **mà bố cục PC/laptop KHÔNG đổi một pixel nào**.
>
> Vi phạm các mục đánh dấu **⛔** → **block merge**.

Đọc kèm: `tailwind-conventions.md` (đơn vị + breakpoint) · `visual-hierarchy.md`
(padding/density) · `tv-display-mode.md` (bài học "phóng to là vỡ") ·
`widget-composition.md` (token tập trung).

> File này giữ luật NỀN của máy chạm (ngón tay, vùng chạm, `dvh`, safe-area, sticky hover, PWA) và chỉnh cho laptop
> (§2.3). Rule TỔNG cho mọi cỡ màn — bảng thiết bị → viewport, gate `phone:`, công thức điện thoại, mẫu thành phần
> (bottom-sheet, nút đóng, `FilterDisclosure`), bẫy và cách kiểm bằng máy — là **`responsive-screens.md`** (§2.4 dưới đây
> trỏ sang).

---

## 0. Nguyên tắc tối cao

```
1. CHẠM ≠ HẸP        → Tách iPad khỏi laptop bằng `touch:`, KHÔNG bằng bề rộng.
2. CỘNG THÊM, KHÔNG SỬA → Chỉ THÊM bậc mới. Không đụng giá trị base/xl/2xl/wide.
3. CUỘN, KHÔNG ẨN    → Chật thì cho cuộn. Ẩn chức năng = người dùng mất đường đi.
4. KHÔNG PHÓNG TO    → `touch:` chỉ được SIẾT. Vùng chạm nới bằng ::after.
5. KHÔNG PHÓNG BỐ CỤC → Bài học TV mode: phóng root = vỡ. Chỉ nới VÙNG CHẠM.
6. `dvh` KHÔNG PHẢI `vh` → Safari iOS tính `100vh` lớn hơn vùng nhìn thấy.
7. VÙNG AN TOÀN      → Neo đáy phải cộng `--safe-b`, nếu không đè vạch Home.
```

---

## 1. ⛔ Vì sao KHÔNG tách iPad bằng bề rộng màn

Bảng viewport thật (CSS px, không phải pixel vật lý):

| Thiết bị | Dọc | Ngang |
|---|---|---|
| iPad mini | 744 | 1133 |
| iPad 10.2" / 10.9" | 768 · 820 | 1024 · 1180 |
| iPad Air 11" | 820 | 1180 |
| **iPad Pro 12.9"** | **1024** | **1366** |
| Laptop 14" | — | 1280 · 1366 · 1440 · 1512 · 1536 |
| Laptop 16" | — | 1536 · 1600 · 1680 · 1728 · 1792 |

Bảng đủ mọi nhóm máy (điện thoại, tablet, laptop, màn ngoài, TV, kèm DPR / đầu vào): `responsive-screens.md §1`.

Dòng in đậm là vấn đề: **iPad Pro nằm ngang = 1366px = trùng ĐÚNG laptop 14"**.
Không tồn tại mốc bề rộng nào tách được hai thứ đó. Mọi rule viết theo bề rộng
sẽ rơi vào một trong hai kết cục, cả hai đều sai:

- Đặt mốc ở 1279px → **bỏ sót** iPad Pro ngang và iPad Air ngang cỡ lớn.
- Đặt mốc ở 1366px → **đụng vào laptop 14"**, tức phá đúng thứ đang chạy tốt.

⇒ Bề rộng trả lời câu "màn rộng bao nhiêu", KHÔNG trả lời câu "người dùng đang
chạm bằng gì". Mà thứ quyết định cỡ nút bấm là ngón tay, không phải bề rộng.

---

## 2. ⛔ `touch:` — biến thể ĐÚNG (khai ở `theme/variants.css`)

```css
@custom-variant touch (@media (hover: none) and (pointer: coarse));
@custom-variant standalone (@media (display-mode: standalone));
```

Cạnh hai biến thể này `variants.css` còn khai `phone:` (điện thoại, cả dọc lẫn ngang — chuyện KÍCH THƯỚC chứ không phải
ngón tay) ở dạng khối + `@slot`; điều kiện và cách chọn gate: `responsive-screens.md §2.2`. Bảng dưới chỉ nói về `touch:`.

| Thiết bị / tình huống | `hover` | `pointer` | `touch:` khớp? |
|---|---|---|---|
| iPad chạm ngón | none | coarse | ✅ |
| iPad + bàn phím Magic (có trackpad) | hover | fine | ❌ — ĐÚNG: lúc đó có con trỏ thật |
| iPhone | none | coarse | ✅ |
| Laptop có màn cảm ứng (Windows) | hover | fine | ❌ — con trỏ vẫn là đầu vào chính |
| **Mọi PC / laptop** | hover | fine | ❌ **KHÔNG BAO GIỜ** |

**Đây là hàng rào an toàn của cả đợt làm iPad.** Rule gắn `touch:` về mặt vật lý
không thể chạm tới bố cục PC/laptop. Vì thế:

> ⛔ **Mọi thay đổi dành riêng cho máy tính bảng PHẢI đi qua `touch:`.**
> Nếu buộc phải dùng bề rộng, xem §2.2 và phải justify trong PR.

### 2.1. `standalone:` — chỉ khi chạy từ biểu tượng Màn hình chính

`@media (display-mode: standalone)` chỉ khớp khi app mở từ icon đã "Thêm vào Màn
hình chính", KHÔNG khớp trong tab Safari. Dùng cho thứ chỉ đúng ở chế độ toàn
màn (bỏ chỗ vốn dành cho thanh URL). Đa số trường hợp **không cần** — `--safe-*`
đã tự bằng 0 khi ở trong tab.

### 2.2. Khi nào ĐƯỢC dùng bề rộng thay vì `touch:`

Chỉ khi vấn đề **thật sự là chỗ hẹp**, không phải ngón tay:

- Bảng 8 cột không đủ chỗ ở 768px → đây là chuyện bề rộng → dùng `md:`/`lg:`.
- Chip tab cao 22px khó bấm → đây là chuyện ngón tay → dùng `touch:`.

Và khi dùng bề rộng, **BẮT BUỘC theo thang 6 bậc đã có** (`header.theme.ts`),
KHÔNG đẻ breakpoint mới (bảng đầy đủ kèm `3xl` và nhóm máy: `responsive-screens.md §2.1`):

```
base  320–639   điện thoại dọc
sm:   640–767   điện thoại ngang nhỏ (667)
md:   768–1023  TABLET DỌC        ← iPad 744 · 768 · 820 · 834   (+ điện thoại ngang lớn 844–932 — xem dưới)
lg:  1024–1279  TABLET NGANG      ← iPad 1024 · 1133 · 1180 · 1194
xl:  1280–1535  LAPTOP 14"        ⛔ CHẠM VÀO ĐÂY LÀ ĐỤNG LAPTOP
2xl: 1536–1799  LAPTOP 16"        ⛔ ĐỪNG ĐỤNG
wide: ≥1800     MÀN NGOÀI 24"     ⛔ ĐỪNG ĐỤNG
```

⚠️ Điện thoại ngang 844 · 915 · 932 nằm trong `md:` — trùng iPad dọc 768–834, bề rộng không tách được. Việc nhắm
điện thoại (cả dọc lẫn ngang) dùng biến thể **`phone:`** (`responsive-screens.md §2.2`), không dùng bậc.

⛔ **KHÔNG được sửa giá trị ở bậc `xl` / `2xl` / `wide`** với lý do "cho iPad".
iPad Pro ngang nằm ở `xl` — sửa `xl` là sửa laptop 14".

### 2.3. Chỉnh cho LAPTOP 14" / 16" — gate `max-wide:`, màn ≥ 1800px KHÔNG đổi một pixel

Bố cục màn ngoài 1920 (`wide:`, ≥ 1800px) là bản đã chốt. Chỗ hẹp của laptop là chuyện BỀ RỘNG nên được dùng bề rộng
— khi thay đổi NHẮM laptop (không phải "cho iPad"), và mọi class mới phải dừng trước 1800px:

| Nhắm | Gate |
|---|---|
| Laptop 14" (1280–1535) — gồm cả iPad Pro ngang 1366 | `xl:max-2xl:` · cả 14" lẫn 16": `xl:max-wide:` |
| Laptop 16" (1536–1799) | `2xl:max-wide:` |
| Mọi màn < 1800px | `max-wide:` · bản JS: `'(max-width: 1799.98px)'` |

- Container query (`@max-[…]` / `@[…]`) chỉ an toàn khi mốc nằm DƯỚI bề ngang của hộp ở 1800px; không chắc thì bọc
  `max-wide:` (`max-wide:@max-[269px]:flex-col`, `xl:max-wide:@[600px]:grid-cols-2`).
- Thứ chỉ NGÓN TAY cần vẫn đi `touch:` (§3) — laptop không bao giờ khớp.
- Kiểm chứng bằng ảnh: chụp 1920×1080 trước / sau (đóng băng animation: `reducedMotion: 'reduce'` + CSS ép animation dừng)
  rồi so từng pixel = 0 (`responsive-screens.md §6.2`). Nhiễu cho phép: khử răng cưa chữ trên canvas
  chart (vài px).

### 2.4. ĐIỆN THOẠI — rule riêng, trỏ sang `responsive-screens.md`

Điện thoại là chuyện KÍCH THƯỚC (không đủ chỗ cho bố cục laptop) chứ không phải ngón tay thuần, nên có biến thể
`phone:` + công thức riêng (top bar, thanh tab đáy, bottom-sheet số đo chuẩn, `FilterDisclosure`, bảng → cuộn / cards,
form một cột). Toàn bộ ở **`responsive-screens.md §3.1` · `§4`**; file này không lặp lại. Những luật NỀN ở đây
(§3 vùng chạm · §4 cuộn không ẩn · §5 `dvh` · §6 safe-area · §7 hover) áp cho điện thoại y như cho tablet.

---

## 3. ⛔ Vùng chạm — nới HỘP NHẬN CHẠM, KHÔNG BAO GIỜ phóng to hình

Đầu ngón tay có vùng tiếp xúc ~44×44px (Apple HIG). Chuột nhắm trúng ô 22px dễ
dàng; ngón tay thì bấm 3 lần trượt 1 lần — và vì các control nằm sát nhau, **bấm
trượt không phải là "không ăn gì" mà là KÍCH HOẠT NHẦM control bên cạnh**.

### 3.0. ⛔ LUẬT TỐI CAO — `touch:` CHỈ ĐƯỢC SIẾT, KHÔNG ĐƯỢC NỚI

```
Mọi con số HÌNH HỌC ở bậc `touch:` phải ≤ con số nền.
Máy tính bảng dùng CHUNG cỡ với laptop. Ngoại lệ DUY NHẤT: nút đóng ✕ của lớp nổi (§3.2).
```

**Đây là quyết định của người dùng, không phải sở thích kỹ thuật.** Bản đầu của
đợt này làm đúng ngược lại — nâng chiều cao thanh header 44→48px, control
30→36px, chip 22→28px, nút icon 24→40px, dòng bảng 36→40px. Kết quả bị bác với
đúng một câu: *"các button các phần khác đang bị phóng to"*. Ba lý do nó hỏng:

1. **Trông như lỗi hiển thị.** Nút to giữa một thanh công cụ toàn chip nhỏ đọc
   ra như trang bị zoom nhầm, chứ không đọc ra "dễ bấm hơn".
2. **Ăn mất chỗ ở đúng máy thiếu chỗ nhất.** iPad có ÍT chiều cao nhất trong
   các thiết bị đang hỗ trợ; mỗi 4px/dòng là mất ~10% số dòng nhìn thấy.
3. **Lan ra như vết dầu.** Nâng một thứ thì thứ cạnh nó phải nâng theo cho khỏi
   so le — chỉ một control 30→36px kéo theo cả thanh, cả dãy icon, cả bảng tên.

**Cách đúng để nút vẫn bấm được:** nới hộp nhận chạm bằng lớp `::after` TRONG
SUỐT (§3.3). Hộp bấm rộng ra, hình vẽ không đổi một pixel nào.

### 3.1. Khi thật sự cần đổi cỡ — CHỈ ĐƯỢC HẠ

```ts
// ✅ ĐÚNG — máy tính bảng dùng chung cỡ với laptop
export const HEADER_CONTROL_HEIGHT = 'h-8 xl:h-9 wide:h-11';
export const PAGE_CHIP_HEIGHT      = 'h-5.5 xl:h-6.5 wide:h-7.5';

// ✅ ĐÚNG — SIẾT để chống tràn hàng (đệm ngang không giúp bấm trúng)
xl: 'h-11 px-5 touch:h-10 touch:px-3.5'

// ❌ SAI — nới ở bậc `touch:`. Đây chính là lỗi đã bị bác.
export const HEADER_CONTROL_HEIGHT = 'h-8 touch:h-10 xl:h-9 wide:h-11';
export const PAGE_CHIP_HEIGHT      = 'h-5.5 touch:h-7 xl:h-6.5 wide:h-7.5';
```

### 3.2. Bảng cỡ — máy tính bảng KHÔNG có cột riêng

| Loại control | Desktop | Máy tính bảng | Bấm trúng nhờ đâu |
|---|---|---|---|
| Nút UI kit `<Button>` | theo `size` | **hạ 1 bậc + siết đệm** | vốn đã ≥ 30px |
| Nút icon thanh header | 30px | **30px — y hệt** | `::after` nới dọc → 42px |
| Chip tab của trang | 22px | **22px — y hệt** | `::after` nới lên → 32px |
| Icon trong Dock | 44px | **40px** (chống tràn) | vốn đã rất to |
| Ô bảng / hàng chọn | tuỳ mật độ | **y hệt desktop** | hàng kéo hết bề ngang |
| Checkbox / radio trong bảng | 16px | **16px — y hệt** | `::after` nới → 32px |
| Tay nắm Splitter | 4px | **4px — y hệt** | `::after` nới → 16px |
| Nút đóng ✕ của lớp nổi (`ModalCloseButton`) | 32px | **40px** — NGOẠI LỆ DUY NHẤT của §3.0 | `::after` → ≥ 44px; lớp nổi gần toàn màn mà không thấy lối ra là lỗi nặng hơn nút to hơn (`responsive-screens.md §4.2`) |

### 3.3. ⛔ Nới vùng chạm = lớp `::after` trong suốt

Ô 16px phải giữ nguyên 16px; chỉ **hộp nhận chạm** rộng ra. Trình duyệt tính
vùng bấm theo cả hộp con, nên một `::after` trong suốt phủ rộng ra ngoài là đủ.

```tsx
// ✅ ĐÚNG — hình giữ nguyên, chỉ hộp nhận chạm rộng ra
<Checkbox className="relative touch:after:absolute touch:after:-inset-2 touch:after:content-['']" />

// ❌ SAI — `p-*` nới cả vùng tô nền: phần tử có `bg-*` sẽ TO RA THẬT
<Checkbox className="touch:p-2 touch:-m-2" />

// ❌ SAI — phóng cả ô, vỡ nhịp cột bảng
<Checkbox className="touch:size-8" />
```

Đừng tự gõ lại chuỗi `after:*`: dùng `TOUCH_HIT_CLASSES` (`src/shared/ui/primitives/touch-hit.theme.ts`) — `icon` cho nút /
ô ~16–24px (nới mọi phía), `row` cho điều khiển rộng mà thấp (chỉ nới dọc).

**Ba cái bẫy của `::after`:**

- `content-['']` **BẮT BUỘC** — thiếu là pseudo-element không sinh ra và cả
  token im lặng thành vô tác dụng.
- Phần tử phải có `relative`, nếu không lớp phủ neo nhầm tổ tiên.
- **Đừng nới về phía có phần tử khác.** Hai vùng chạm chồng nhau thì cú bấm rơi
  vào phần tử nằm trên trong thứ tự vẽ — lỗi im lặng, rất khó lần ra. Control
  xếp hàng ngang cách nhau 4px thì chỉ nới DỌC; chip dính đáy thanh header thì
  chỉ nới LÊN TRÊN.

---

## 4. ⛔ Chật chỗ thì CUỘN, KHÔNG ẨN BỚT

Ẩn một mục điều hướng trên iPad = người dùng iPad **mất hẳn đường vào** chức năng
đó, không có gì thay thế. Trên màn hẹp, thứ tự ưu tiên:

```
1. Cho CUỘN NGANG (dải chip, dãy icon, thanh công cụ)
2. Rút gọn NHÃN (bỏ chữ, giữ icon + tooltip/aria-label)
3. Gom vào MENU "…" — chỉ khi 1 và 2 đều không đủ
4. ⛔ ẨN HẲN — CẤM, trừ khi là chi tiết TRANG TRÍ (sọc chéo, ngoặc góc)
```

### 4.0. Bậc 1 + 2 cho DẢI TAB của trang — đã có sẵn, ĐỪNG DỰNG LẠI

Dải tab trên thanh header (`<PageHeader nav={…}>`) đã cài sẵn **bậc 1 (cuộn)** và
**bậc 2 (rút gọn nhãn)**. Call-site không phải làm gì thêm.

| Thứ | Ở đâu |
|---|---|
| Chip tab | `PageHeaderNav` → `PageHeaderChip` (`src/shared/widgets/header/page-header/`) |
| Sàn chống-sập của ô nav | `PAGE_HEADER_SLOT_CLASSES.navCell` — `max-lg:min-w-fit touch:min-w-fit` |
| Rút gọn nhãn | `PageHeaderNavItem.shortLabel` — render CẢ HAI nhãn, CSS chọn bằng `labelFull` / `labelShort` |
| Chia đôi dải quanh bảng tên | `PageHeader` prop `nav.splitAt` (mặc định cắt giữa) |
| Nới vùng chạm cho chip | `touch:after:*` trong `PAGE_NAV_SLOT_CLASSES.item` (§3.3) |

⛔ **Cả hai nhãn (`label` và `shortLabel`) cùng render, CSS chọn bản nào hiện.**
`hidden` = `display:none` nên bản bị ẩn rời khỏi cả thứ tự Tab lẫn cây trợ năng —
không có control trùng. Đừng đổi sang `useMediaQuery` trong JS: header sẽ nháy
một khung hình lúc mount và nháy lại mỗi lần xoay máy.

⛔ **Chip LUÔN in chữ**, kể cả bản rút gọn — KHÔNG được rút tab xuống icon-only.

> **Bậc 3 (gom dải tab vào một menu xổ) CHƯA có trong base.** Nếu một trang thật
> sự cần nó, dựng trong `page-header/` rồi cập nhật bảng này — đừng dựng bản cục
> bộ trong feature.

### 4.1. ⛔ Vuốt hết vùng cuộn KHÔNG được đẩy về trang trước — `overscroll-*-contain`

Đây là lỗi im lặng khó chịu nhất trên iPad: người dùng vuốt xem hết dãy tab thì
bị đẩy ngược về màn trước (Safari hiểu là "lùi lại trang trước"), tưởng app tự thoát.
Chặn bằng `overscroll-behavior: contain` — nhưng ĐẶT ĐÚNG CHỖ:

| Vùng cuộn | Làm gì | Vì sao |
|---|---|---|
| Mọi vùng cuộn, trên máy chạm | Không làm gì — `base/touch.css` tự đặt `overscroll-behavior-{x,y}: contain` (§4.2) | Khớp mọi class chứa `overflow-*-auto/scroll`, kể cả biến thể `max-lg:` / `touch:` |
| Dải cuộn NGANG (chip, thanh công cụ) | Thêm `overscroll-x-contain` cạnh `overflow-x-auto` (trần, hoặc cùng gate với `overflow-x-auto`) | Trang không cuộn ngang ⇒ trên desktop nó chỉ chặn cử chỉ vuốt-lùi-trang của bàn di — đúng thứ cần chặn. Mẫu: `header.theme.ts`, `BoxPanel` (`max-lg:` + `touch:`) |
| Vùng cuộn DỌC / hai trục nằm trong vùng cuộn khác (bảng, panel) | Nếu tự thêm thì PHẢI có tiền tố `touch:` (`touch:overscroll-contain`) | Để trần là chặn cả chuỗi cuộn của CHUỘT trên desktop: lăn tới cuối bảng thì vùng cha không cuộn tiếp. Mẫu: `TABLE_SCROLLER_CLASSES` (`table.theme.ts`) |

```tsx
// ❌ SAI — dải ngang không chặn: vuốt hết dải bằng bàn di là lùi trang
<div className="overflow-x-auto scrollbar-hidden">

// ✅ ĐÚNG — dải ngang
<div className="overflow-x-auto overscroll-x-contain scrollbar-hidden">

// ❌ SAI — vùng cuộn dọc chặn trần: đổi hành vi lăn chuột trên PC/laptop
<div className="min-h-0 flex-1 overflow-auto overscroll-contain">

// ✅ ĐÚNG — chỉ máy chạm
<div className="min-h-0 flex-1 overflow-auto touch:overscroll-contain">
```

### 4.2. Vùng cuộn lồng nhau

Vùng cuộn bên trong phải "nuốt" đà vuốt của chính nó, nếu không đà chuyển tiếp ra
vùng cha và cả trang trôi. `base/touch.css` đã đặt `overscroll-behavior-{x,y}: contain` (từng trục, không dùng shorthand — `scrollbar.md`)
cho mọi `.overflow-*-auto/scroll` **dưới `@media (hover:none) and (pointer:coarse)`**
— không cần lặp lại ở từng component. **Điện thoại** (`phone:`) nhả riêng trục DỌC về `auto`: ở đó trang cuộn dọc là
chính, ngón tay hầu như luôn đặt trúng một danh sách / bảng con, và `contain` dọc làm trang đứng im khi vuốt hết danh
sách; trục NGANG vẫn `contain`. iPad giữ `contain` cả hai trục.

### 4.3. Dải KPI đầu màn — dùng component có sẵn, đừng tự khai lưới

> ⚠️ Không có hằng dùng chung cho pattern này — dùng `<BoxGrid min={...}>` (xem
> `reuse-first.md` §3.4) để khai lưới KPI responsive thay vì tự viết
> `grid-cols-2 md:grid-cols-3` từng màn. Nếu pattern lặp lại ≥3 lần với cùng
> breakpoint, mới cân nhắc trích thành constants dùng chung.

Lý do: mỗi màn tự khai lưới riêng (`grid-cols-2 md:grid-cols-3`…) thì
ở dải 768–1023px số cột LUÔN nhỏ hơn số thẻ, dải tách thành 2-3 hàng và ăn thêm
56–112px chiều cao — đúng thứ máy tính bảng có ít nhất. `BoxGrid` tự suy số
cột theo `min` width thay vì hardcode breakpoint theo cột, nên hành vi nhất
quán hơn qua các dải màn hình — kiểm tra thực tế trên thiết bị đích trước khi
coi đây là giải pháp cuối cùng cho case cụ thể của bạn.

---

## 5. ⛔ Đơn vị chiều cao — `dvh`, không phải `vh`

Safari iOS tính `100vh` theo lúc thanh URL + thanh công cụ **đã thu lại**, tức
lớn hơn vùng thực sự nhìn thấy ~60–90px. Khung app cao `100vh` vì thế thò xuống
dưới thanh công cụ, kéo theo mọi thứ neo đáy (Dock, thanh hành động) **ra ngoài
màn — người dùng không thấy đâu**.

| Dùng cho | Class |
|---|---|
| Khung app toàn màn | `h-dvh` (KHÔNG `h-screen`) |
| Trang canh giữa (đăng nhập) | `min-h-dvh` (KHÔNG `min-h-screen`) |
| Vùng cuộn "viewport − header" | `HEADER_HEIGHT_CLASS.contentMaxHeight` |

Trên mọi trình duyệt máy tính `dvh === vh` (không có thanh công cụ co giãn) →
đổi sang `dvh` **không lệch một pixel nào trên PC/laptop**.

⚠️ `dvh` chỉ ổn định khi tài liệu KHÔNG cuộn (`body { overflow: hidden }` — app
này đã vậy). Nếu tài liệu cuộn được, `dvh` đổi theo thanh công cụ và gây giật;
khi đó dùng `svh`.

---

## 6. ⛔ Vùng an toàn (safe area)

`base/root-vars.css` gom về 4 biến, **luôn = 0px trên PC/laptop và trong tab trình
duyệt**, chỉ khác 0 khi chạy toàn màn trên máy có vạch Home (~20px):

```css
--safe-t · --safe-r · --safe-b · --safe-l
```

⛔ **Mọi phần tử neo đáy màn PHẢI cộng `--safe-b`.** Không cộng thì nó nằm chồng
lên vạch Home: vuốt lên để bấm hoá ra là cử chỉ thoát app.

```tsx
// ❌ SAI
<nav className="fixed bottom-4" />
style={{ bottom: '16px' }}

// ✅ ĐÚNG — `calc(16px + 0px)` = đúng 16px như cũ trên desktop
<nav className="fixed bottom-[calc(1rem+var(--safe-b,0px))]" />
style={{ bottom: 'calc(16px + var(--safe-b, 0px))' }}
```

⛔ **KHÔNG viết thẳng `env(safe-area-inset-*)` rải rác trong component** — gom về
`base/root-vars.css` để khi Apple đổi hành vi (đã đổi 3 lần từ iOS 11) chỉ sửa một chỗ.

⚠️ `--safe-*` chỉ khác 0 khi `index.html` có `viewport-fit=cover`. Gỡ thuộc tính
đó là toàn bộ mục này im lặng trở thành no-op.

### 6.1. ⛔ Phần tử neo đáy viewport — đọc `--bottom-chrome`, không cộng số cứng

`TabBar` đo chiều cao THẬT của chính nó (cả viền + vạch Home) bằng ResizeObserver và ghi `--bottom-chrome` lên `<html>`
(`useBottomChromeInset`); gỡ biến khi thanh không dựng (laptop dùng Dock, danh sách mục rỗng).

| Việc | Cách làm |
|---|---|
| Phần tử `fixed` ở đáy (toast, rail tiến trình, nút nổi tự dựng) | `bottom-[calc(max(var(--bottom-chrome,0px),var(--safe-b,0px))+0.75rem)]` — nằm trên thanh tab với khe cố định; không thanh tab thì chỉ còn `--safe-b`. KHÔNG tự cộng `--tab-bar-reach` / số cứng |
| Ai cộng vạch Home | Chrome đáy nằm cuối cùng sở hữu `--safe-b`. Nội dung nằm TRÊN thanh tab trong luồng (vd `FormActions sticky`) chỉ cộng phần chưa được che: `max(0px, --safe-b − --bottom-chrome)` |
| Bàn phím ảo mở | Phần tử `fixed` ở đáy có thể trôi lơ lửng trên bàn phím (iOS) và che ô đang gõ — tự dựng thì nhớ ẩn / nhấc khi `visualViewport` co |
| Trùng hành động | ⛔ Một hành động = MỘT nút: nút nổi "Thêm…" cùng việc với CTA của trạng thái rỗng thì ẩn một trong hai |

---

## 7. ⛔ Hover trên cảm ứng — "sticky hover"

`:hover` trên iPadOS **không phải trạng thái thoáng qua**: chạm một phần tử là
WebKit gán `:hover` và **GIỮ NGUYÊN cho tới lần chạm kế tiếp ở chỗ khác**.

| Nguồn hover | Có tự an toàn không? |
|---|---|
| `hover:` của Tailwind | ✅ **CÓ** — Tailwind v4 tự bọc trong `@media (hover: hover)` |
| CSS viết tay (`.foo:hover {}`) | ❌ **KHÔNG** — phải tự bọc media query |
| Hiệu ứng dùng `:has()` / anh-em (`+`) | ❌ **KHÔNG** — và hỏng nặng nhất |

```css
/* ✅ ĐÚNG — hiệu ứng rê chỉ được ĐỊNH NGHĨA nơi có con trỏ thật
   (mẫu: `src/shared/widgets/dock/dock-magnify.css`) */
@media (hover: hover) and (pointer: fine) {
  .dock-magnify .dock-magnify-item:hover {
    transform: translateY(var(--dock-mag-lift-peak)) scale(var(--dock-mag-peak));
  }
}
```

Gate THUẬN (định nghĩa hiệu ứng trong `(hover: hover) and (pointer: fine)`), đừng gate
ngược (khai toàn cục rồi gỡ `transform: none` trong `(hover: none)`). `hover: hover` một
mình chưa đủ: iPad cắm bàn phím Magic có trackpad báo `hover: hover` dù đầu vào chính
vẫn có thể là ngón tay.

Máy giữ: `tests/policy/display/responsive-foundation.test.ts` — mọi rule CSS có `:hover` phải nằm trong
`@media (hover: hover)` (kể cả thumb thanh cuộn ở `base/scrollbar.css`).

⛔ **KHÔNG đặt thông tin CHỈ hiện khi hover** (tooltip là nguồn duy nhất của một
nhãn, nút hành động chỉ hiện khi rê chuột vào hàng). Trên iPad người dùng không
bao giờ thấy được. Nhãn phải có `aria-label` + hiện thường trực ở `touch:`.

---

## 8. ⛔ Bẫy đã gặp — kiểm trước khi commit

| Bẫy | Triệu chứng trên iPad | Cách chữa |
|---|---|---|
| Thanh cố định rộng hơn màn + `left-1/2 -translate-x-1/2` | Cụt cả hai đầu, mất mục đầu/cuối, không với tới được | `max-xl:max-w-[calc(100vw-1rem)]` + cuộn ngang — gate theo **bề rộng**, xem §8.1 |
| `w-px` trong flex có cuộn | Vạch ngăn biến mất | thêm `shrink-0` |
| Thiếu `-webkit-text-size-adjust: 100%` | Xoay ngang → chữ tự phình → tràn ô cao cố định, các dòng đè nhau | đã đặt ở `html` trong `base/document.css` |
| Thiếu `overscroll-behavior: none` ở `body` | Vuốt quá đáy → cả khung app trượt, lộ nền dưới → nhìn như vỡ layout | đã đặt ở `html` + `body` trong `base/touch.css` (chỉ máy chạm) |
| `100vh` | Dock/thanh đáy nằm ngoài màn | `dvh` (§5) |
| Neo đáy không cộng `--safe-b` | Đè vạch Home, bấm ra thoát app | §6 |
| `:hover` CSS viết tay | Icon kẹt ở trạng thái phóng to sau khi bấm | §7 |
| Control bấm được không có `touch-action: manipulation` | Chờ ~300ms + chạm-đúp-để-phóng trước khi nhận cú bấm | đã đặt trong `base/touch.css` (chỉ máy chạm; pinch-zoom vẫn chạy — KHÔNG thay bằng `user-scalable=no`); control tự xử lý cử chỉ (tay kéo, canvas) đặt `touch-none` / `touch-pan-*` — utility thắng vì `base/touch.css` nằm ở `@layer base` |
| Thiếu `overscroll-behavior: none` ở `html` | Android Chrome: vuốt xuống ở đầu trang kích hoạt "kéo để tải lại", mất trạng thái màn đang làm | đã đặt ở `html` + `body` trong `base/touch.css` (chỉ máy chạm) |
| Cuộn ngang thiếu `overscroll-x-contain` | Vuốt hết dải → bị đẩy về màn trước | §4.1 |
| Số điện thoại / mã dạng số | iOS tự biến thành link xanh, sai màu chữ | `<meta name="format-detection" content="telephone=no">` |
| `maximum-scale=1` / `user-scalable=no` | Không phóng được bảng số liệu dày | ⛔ CẤM khai |

Bẫy chung của mọi cỡ màn (`not-touch:`, `@custom-variant` gộp dấu phẩy, `100cqh`, `justify-end` + vùng cuộn,
`truncate` gọt dấu tiếng Việt, Recharts + chạm…): `responsive-screens.md §5`.

### 8.1. ⛔ Chọn gate cho ĐÚNG loại vấn đề — đừng gộp làm một

Câu hỏi phải tự trả lời trước khi viết class: **"Nếu người dùng cắm chuột vào
iPad này thì vấn đề còn không?"**

| Vấn đề | Cắm chuột thì? | Gate ĐÚNG |
|---|---|---|
| Thanh 961px trên màn 768px | **Vẫn tràn y hệt** | `max-lg:` — chuyện BỀ RỘNG |
| Bảng 8 cột không đủ chỗ | **Vẫn chật y hệt** | `md:` / `lg:` — chuyện BỀ RỘNG |
| Chip 22px khó bấm | **Hết khó** (chuột nhắm tốt) | `touch:` — chuyện NGÓN TAY |
| Icon kẹt ở trạng thái hover | **Hết kẹt** | `touch:` — chuyện NGÓN TAY |

⛔ **Gate chuyện bề rộng bằng `touch:` là để lọt cảnh iPad dọc cắm chuột / bàn
phím Magic** — lúc đó `pointer: fine` nên `touch:` KHÔNG khớp, và bố cục vỡ y
như cũ. Đây là lỗi dễ mắc nhất khi mới dùng `touch:`.

Một thành phần có thể cần **cả hai gate cho hai việc khác nhau** — đó là bình
thường, không phải thừa. Xem `dock.theme.ts → DOCK_NARROW_FIT_CLASS` làm mẫu:
`max-xl:` lo giới hạn bề ngang + cuộn, `touch:` lo siết khe giữa icon.

⛔ **Và có ca cần cả hai gate cho CÙNG MỘT việc.** Sàn chống-sập của cụm tâm
header (`PAGE_HEADER_SLOT_CLASSES.navCell` · `plate` · `cluster`) từng chỉ gate `touch:`,
nên **iPad dọc cắm chuột / bàn phím Magic** — `pointer: fine` ⇒ `touch:` không
khớp — mất sàn và chip đầu dải bị cắt 86px, không cuộn tới được. Đã bổ sung
`max-lg:` bên cạnh `touch:`. Khi viết sàn/`justify` cho vùng cuộn, hỏi lại câu
của bảng trên: *"cắm chuột vào thì vấn đề còn không?"* — còn thì phải có gate bề
rộng, kể cả khi đã có `touch:`.

---

## 9. Hạ tầng PWA — đã có gì, còn thiếu gì

| Thứ | Ở đâu | Trạng thái |
|---|---|---|
| Manifest | `public/manifest.webmanifest` | ✅ có (mảng `icons` còn RỖNG) |
| Meta `viewport-fit=cover` + cụm `apple-*` | `index.html` | ✅ có |
| Biến thể `touch:` / `standalone:` | `src/styles/theme/variants.css` | ✅ có |
| Biến `--safe-*` | `src/styles/base/root-vars.css` (`:root`) | ✅ có |
| Chiều cao header 3 bậc (`h-12` → `xl:h-14` → `wide:h-16`) + `contentMaxHeight` dùng `dvh` (= `vh` ở máy tính) | `src/shared/constants/layout.constants.ts` | ✅ có |
| Cỡ control / chip header 3 bậc (`HEADER_CONTROL_HEIGHT`, `PAGE_CHIP_HEIGHT`) | `src/shared/widgets/header/header.theme.ts` · `…/page-header/page-nav.theme.ts` | ✅ có |
| Dock vừa màn + an toàn đáy | `src/shared/widgets/dock/dock.theme.ts` | ✅ có |
| Điện thoại: top bar phẳng (`PhoneTopBar`) thay `Header`, thanh tab đáy (`TabBar`) thay `Dock`, chọn bằng `useIsPhone()` | `src/shared/widgets/header/phone/` · `src/shared/widgets/tab-bar/` · `src/app/layouts/AppShellLayout.tsx` (`responsive-screens.md §4.4`) | ✅ có |
| Màu thanh trình duyệt `<meta name="theme-color">` ghi lại theo token `--color-bg-page` mỗi khi đổi theme (HĐH sáng mà app tối thì thanh trạng thái không lệch) | `src/app/providers/appearance/appearance.utils.ts` | ✅ có |
| Bottom-sheet số đo chuẩn · nút ✕ chung · `FilterDisclosure` · `Popover sheetOnPhone` | `src/shared/ui/overlays/drawer/drawer.theme.ts` · `src/shared/ui/overlays/dialog/ModalCloseButton.tsx` · `src/shared/ui/layout/FilterDisclosure.tsx` · `src/shared/ui/overlays/Popover.tsx` (`responsive-screens.md §4`) | ✅ có |
| Biến thể `phone:` + preset JS `useIsPhone` · `useIsBelowWide` (cùng điều kiện với CSS) | `src/styles/theme/variants.css` · `src/shared/constants/media-query.constants.ts` · `@/shared/hooks` | ✅ có |
| Nền máy chạm: `touch-action: manipulation`, thanh cuộn nổi, chặn rubber-band / pull-to-refresh | `src/styles/base/touch.css` · `src/styles/base/scrollbar.css` | ✅ có |
| Icon PWA (192 · 512 · 512-maskable · apple-touch 180) | — | ⛔ **CHƯA CÓ** (`public/manifest.webmanifest` có `icons: []`) |

⛔ **Trước khi phát hành**: tạo thư mục `public/icons/` và đặt icon vào đó, khai vào
mảng `icons` của manifest, và thêm `<link rel="apple-touch-icon" sizes="180x180">` vào
`index.html`. Thiếu icon thì "Thêm vào Màn hình chính" trên iOS lấy ảnh chụp
màn hình làm biểu tượng — trông như app hỏng.

**Chưa có (cố ý):** service worker. iOS **không cần** SW để chạy toàn màn —
manifest + cụm `apple-*` là đủ.

⛔ **Chỉ được đăng ký MỘT service worker ở scope `/`.** SW đăng ký sau chiếm
quyền của SW trước. Dự án nào thêm cả thông báo đẩy lẫn chạy offline thì phải
GỘP vào một file, đừng đăng ký hai.

---

## 10. ✅ Checklist trước khi commit thay đổi cho máy tính bảng

### Hàng rào an toàn
- [ ] Mọi thay đổi cho iPad đi qua `touch:` (hoặc `md:`/`lg:` nếu thật sự là chuyện bề rộng)?
- [ ] KHÔNG sửa bất kỳ giá trị nào ở bậc `xl` / `2xl` / `wide`?
- [ ] KHÔNG sửa giá trị `base` đang dùng chung với desktop?
- [ ] Chỉ THÊM class, không đổi/xoá class cũ?

### Vùng chạm
- [ ] KHÔNG có con số hình học nào ở `touch:` LỚN HƠN con số nền (§3.0; trừ nút ✕ lớp nổi, §3.2)?
- [ ] Control nhỏ đã được nới vùng chạm bằng `::after` trong suốt (§3.3)?
- [ ] KHÔNG dùng `touch:p-2 touch:-m-2` cho phần tử có nền (§3.3)?
- [ ] Mọi `::after` đều có `content-['']` và phần tử cha có `relative` (§3.3)?

### Bố cục
- [ ] Không phần tử nào đè lên nhau ở 768 · 820 · 1024 · 1180 · 1366?
- [ ] Chật chỗ → cho cuộn, KHÔNG ẩn chức năng (§4)?
- [ ] Dải cuộn ngang có `overscroll-x-contain`; vùng cuộn dọc / hai trục KHÔNG để `overscroll-contain` trần (§4.1)?
- [ ] Không còn `h-screen` / `min-h-screen` / `100vh` ở khung toàn màn (§5)?
- [ ] Phần tử neo đáy đã cộng `--safe-b` (§6)?

### Cảm ứng
- [ ] CSS `:hover` viết tay nằm trong `@media (hover: hover) and (pointer: fine)` (§7)?
- [ ] Không có thông tin/hành động CHỈ hiện khi hover (§7)?

### Kiểm chứng
- [ ] `npm run check` xanh (`quality-gates.md`)
- [ ] Xem lại ở **1280 · 1440 · 1536 · 1920** → **giống hệt trước khi sửa** (thay đổi NHẮM laptop theo §2.3: 1280–1799
      được đổi, nhưng **1920 so pixel = 0**)
- [ ] Thử ở 768 (dọc) và 1024 (ngang) với chế độ giả lập cảm ứng của DevTools
      (⚠️ phải bật giả lập cảm ứng, nếu không `touch:` KHÔNG khớp và bạn đang
      xem nhầm bản desktop)
- [ ] Ma trận đầy đủ theo loại thay đổi + script đo tràn ngang / vùng chạm: `responsive-screens.md §6`

---

## 11. Khi vi phạm

- Sửa giá trị ở bậc `xl` / `2xl` / `wide` để "cho iPad" → **revert** (đụng laptop)
- Tách iPad bằng bề rộng thay vì `touch:` mà không justify → **revert**
- Ẩn chức năng/điều hướng ở màn hẹp thay vì cho cuộn → **block merge**
- Dải cuộn ngang thiếu `overscroll-x-contain` → **block merge**
- `overscroll-contain` trần trên vùng cuộn dọc / hai trục (đổi hành vi lăn chuột trên desktop) → **revert** (§4.1)
- Neo đáy màn thiếu `--safe-b` → **block merge**
- `100vh` cho khung toàn màn → **block merge**
- Khai `maximum-scale` / `user-scalable=no` → **revert** (chặn trợ năng)
- Viết thẳng `env(safe-area-inset-*)` trong component thay vì `--safe-*` → fail review
- Bất kỳ con số hình học nào ở `touch:` LỚN HƠN con số nền → **revert** (§3.0; trừ nút ✕ lớp nổi, §3.2)
- Đăng ký service worker mới ở scope `/` (đè SW thông báo đẩy) → **block merge**

---

## 12. Cross-references

- Rule TỔNG mọi cỡ màn (thiết bị → viewport, `phone:`, công thức, mẫu thành phần, kiểm bằng máy) → `responsive-screens.md`
- Đơn vị + breakpoint → `tailwind-conventions.md`
- Thang 6 bậc bề rộng (nguồn chuẩn) → `src/shared/widgets/header/header.theme.ts`
- Bài học "phóng to là vỡ bố cục" → `tv-display-mode.md`
- Padding / mật độ → `visual-hierarchy.md`
- Token tập trung ở widget → `widget-composition.md`
- UI kit catalog → `reuse-first.md`

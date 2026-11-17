# Responsive Screens — công thức cho MỌI cỡ màn (điện thoại · tablet · laptop · màn ngoài · TV)

> Áp dụng cho **mọi thay đổi giao diện** trong `src/`: một giao diện chạy đúng từ 320px tới TV 4K mà **bố cục màn
> ngoài (≥ 1800px) và các giá trị đang chạy KHÔNG đổi một pixel nào**.
> Cảm ứng / PWA / vùng chạm / `dvh` / safe-area đã có luật riêng: `ipad-responsive.md` — file này là rule TỔNG: nói
> *dùng gate nào cho việc gì*, *mỗi nhóm màn làm thế nào*, *mẫu thành phần dùng lại*, và *kiểm bằng máy ra sao*.
>
> Vi phạm các mục đánh dấu **⛔** → **block merge**.

Đọc kèm: `ipad-responsive.md` (ngón tay, vùng chạm, `dvh`, safe-area) · `tailwind-conventions.md` (đơn vị) ·
`spacing-system.md` (đệm KHÔNG đổi theo bề rộng ở code trang) · `tv-display-mode.md` · `chart-conventions.md`
(chart theo cỡ vùng vẽ) · `reuse-first.md` (catalog) · `css-architecture.md` (nơi khai biến thể).

---

## 0. Nguyên tắc tối cao

```
1. ĐO, KHÔNG ĐOÁN       → Mọi cỡ màn kiểm được bằng máy (§6). Chưa chụp ma trận = chưa xong.
2. ĐÚNG GATE ĐÚNG VIỆC  → Hẹp chỗ = bề rộng · ngón tay = `touch:` · điện thoại = `phone:` · laptop = `xl:max-wide:`.
3. CHỈ THÊM, KHÔNG SỬA  → Thêm bậc cho màn nhỏ. KHÔNG đổi giá trị đang chạy ở `wide:` (≥ 1800) và desktop.
4. CHẬT THÌ CUỘN        → Không ẩn chức năng theo cỡ màn (`ipad-responsive.md §4`).
5. `touch:` CHỈ SIẾT     → Nới VÙNG CHẠM bằng `::after` trong suốt, không phóng hình (`ipad-responsive.md §3`).
6. MỘT COMPONENT        → Không `XxxMobile.tsx` / `XxxV2.tsx`. CSS chọn dạng; chỉ khi hai dạng là HAI CÂY DOM khác nhau
                          mới rẽ nhánh bằng `useIsPhone()` (§2.4).
7. KHÔNG CHỈ-HOVER      → Thông tin / hành động nào cũng với tới được bằng ngón tay và bàn phím.
8. KHÔNG PHÓNG BỐ CỤC   → TV chỉ nhân chữ (`tv-display-mode.md`); không có bậc "phóng" cho màn lớn.
9. CHỮ VIỆT KHÔNG MẤT DẤU → Không `truncate` + `leading-none` (§5).
10. LỚP NỔI LUÔN CÓ NÚT ĐÓNG → X hiện thường trực ở tablet / điện thoại (§4.2).
```

---

## 1. Bảng thiết bị → viewport CSS thật

Viewport là `window.innerWidth × innerHeight` tính bằng **CSS px** — KHÔNG phải độ phân giải panel. Ba điều làm con
số khác với thông số hãng:

- **Tỉ lệ hiển thị của hệ điều hành**: màn 1920×1080 ở 125% = 1536×864 CSS px; 1920×1200 ở 125% = 1536×960.
- **Chrome của trình duyệt** bớt chiều cao: desktop mất ~85–130px (tab + thanh địa chỉ); Safari iOS đổi `innerHeight`
  theo thanh công cụ co giãn (§5 `dvh`).
- **Thanh cuộn dọc** nằm TRONG `innerWidth` (Windows ~15px): media query tính cả nó, nên nội dung ở "1280" thật ra
  rộng ~1265px.

DPR (pixel vật lý / CSS px) KHÔNG đổi bố cục — chỉ đổi độ sắc nét của ảnh, đường mảnh và canvas chart. Kiểm DPR 1
(laptop FHD), 2 (Mac, iPad), 3 (điện thoại).

| Nhóm | Viewport (rộng×cao) | Máy tiêu biểu | DPR | Đầu vào | Khớp biến thể |
|---|---|---|---|---|---|
| **Điện thoại dọc** | 320×568 | iPhone SE đời đầu, Android nhỏ — **sàn thấp nhất** phải chạy được | 2 | ngón tay | `phone:` `touch:` |
| | 360×800 | Android phổ thông (Galaxy A, Redmi) | 2–3 | ngón tay | `phone:` `touch:` |
| | 375×667 | iPhone SE 2/3, 8 | 2 | ngón tay | `phone:` `touch:` |
| | 390×844 | iPhone 12 · 13 · 14 | 3 | ngón tay | `phone:` `touch:` |
| | 393×852 | iPhone 15 · 16 | 3 | ngón tay | `phone:` `touch:` |
| | 412×915 | Pixel 7, Galaxy S | 2.6–3.5 | ngón tay | `phone:` `touch:` |
| | 430×932 | iPhone Plus / Pro Max | 3 | ngón tay | `phone:` `touch:` |
| **Điện thoại ngang** | 568×320 · 667×375 · 844×390 · 915×412 · 932×430 | cùng các máy trên xoay ngang | 2–3 | ngón tay | `phone:` `touch:` — 568 · 667 khớp cả hai vế; 844 trở lên chỉ nhờ vế **thấp ≤ 540px** |
| **Tablet dọc** | 744×1133 | iPad mini — **< 768 nên khớp `phone:`** | 2 | ngón tay | `touch:` · `phone:` · `sm:` |
| | 768×1024 | iPad 9.7", Android 8–10" | 2 | ngón tay | `touch:` · `md:` |
| | 810×1080 | iPad 10.2" | 2 | ngón tay | `touch:` · `md:` |
| | 820×1180 | iPad 10.9" · Air 11" | 2 | ngón tay | `touch:` · `md:` |
| | 834×1194 | iPad Pro 11" | 2 | ngón tay | `touch:` · `md:` |
| | 1024×1366 | iPad Pro 12.9" | 2 | ngón tay | `touch:` · `lg:` |
| **Tablet ngang** | 1024×768 · 1133×744 · 1180×820 · 1194×834 | iPad các đời | 2 | ngón tay | `touch:` · `lg:` |
| | **1366×1024** | iPad Pro 12.9" — **TRÙNG bề rộng laptop 14"** | 2 | ngón tay | `touch:` · `xl:` |
| **Laptop 14"** | 1280×720 | HD, hoặc FHD ở 150% | 1–1.5 | chuột | `xl:` |
| | 1366×768 | HD cũ | 1 | chuột | `xl:` |
| | 1440×900 | MacBook Air 13" | 2 | trackpad | `xl:` |
| | 1512×982 | MacBook Pro 14" | 2 | trackpad | `xl:` |
| | 1536×864 | FHD ở 125% (laptop Windows 14–15") | 1.25 | chuột | `2xl:` |
| **Laptop 16"** | 1536×960 | 1920×1200 ở 125% | 1.25 | chuột | `2xl:` |
| | 1600×900 · 1680×1050 | WXGA++ / WSXGA+ | 1 | chuột | `2xl:` |
| | 1728×1117 | MacBook Pro 16" | 2 | trackpad | `2xl:` |
| | 1792×1120 | MacBook Pro 16" (chế độ "nhiều chỗ hơn") | 2 | trackpad | `2xl:` — **còn dưới 1800** |
| **Màn ngoài / TV** | 1920×1080 | 24" FHD (viewport thực ~1903–1910) | 1 | chuột | `wide:` (cỡ gốc) |
| | 2560×1440 | 27" QHD | 1 | chuột | `wide:` |
| | 3840×2160 | TV 4K / chế độ TV `?display=tv` | 1 | điều khiển từ xa | `wide:` · `tv:` |

Ghi chú đọc bảng:

- **iPad mini dọc (744) nhận bố cục điện thoại**: mốc `phone:` là 768px (cùng mốc `md:`), nên iPad mini dọc và mọi cửa sổ
  iPad ghép hẹp hơn 768 đều khớp `phone:` (top bar + thanh tab đáy, sheet, cards) — đồng thời `touch:` vẫn khớp. Đó là hệ
  quả của việc chọn mốc, không phải lỗi; kiểm bằng ma trận (§6.1) chứ đừng gỡ khỏi `phone:` bằng mốc riêng.
- iPad ghép cửa sổ (Split View / Slide Over) cho viewport BẤT KỲ từ ~320px tới nguyên màn, vẫn là ngón tay
  (`touch:` khớp) — bố cục phải đúng ở mọi bề rộng, không chỉ ở các hàng trong bảng.
- `touch:` KHÔNG khớp khi iPad cắm bàn phím Magic / chuột, và KHÔNG BAO GIỜ khớp trên laptop (kể cả laptop màn cảm
  ứng Windows — `hover: hover` + `pointer: fine`). Trình duyệt TV khai `hover` / `pointer` không thống nhất: đừng
  dựa vào `touch:` để nhận ra TV — dùng `tv:`.
- Vùng an toàn (`--safe-*`, `ipad-responsive.md §6`) chỉ khác 0 ở máy có tai thỏ / vạch Home khi trang phủ tới mép:
  iPhone xoay ngang có `--safe-l` / `--safe-r` ~47–59px, đáy ~21px; dọc có `--safe-t` ~47–59px, `--safe-b` ~34px;
  iPad PWA đáy ~20px. Con số tham khảo — luôn đi qua biến, không gõ cứng.

---

## 2. Thang bậc & biến thể

### 2.1. Bậc bề rộng — `src/styles/theme/breakpoints.css`

Tailwind mặc định + hai mốc riêng. **KHÔNG đẻ breakpoint mới** — mọi bậc đã đủ để chia 7 nhóm máy ở §1.

| Bậc | Từ (px) | Dải | Nhóm máy rơi vào |
|---|---|---|---|
| (không tiền tố) | 0 | 320–639 | điện thoại dọc |
| `sm:` | 640 | 640–767 | điện thoại ngang nhỏ (667) · iPad mini dọc (744) |
| `md:` | 768 | 768–1023 | tablet dọc 768–834 · **điện thoại ngang lớn (844–932)** |
| `lg:` | 1024 | 1024–1279 | tablet ngang |
| `xl:` | 1280 | 1280–1535 | laptop 14" · **iPad Pro ngang (1366)** |
| `2xl:` | 1536 | 1536–1799 | laptop 16" |
| `wide:` | 1800 | ≥ 1800 | màn ngoài 24"+ — **cỡ gốc, không đổi** |
| `3xl:` | 1920 | ≥ 1920 | ⛔ KHÔNG dùng để tách laptop / màn ngoài (viewport 24" FHD chỉ ~1910) |

Tiền tố `max-*` = nhỏ hơn mốc: `max-md:` < 768 · `max-lg:` < 1024 · `max-xl:` < 1280 · `max-wide:` < 1800. Ghép hai
đầu = một dải: `xl:max-wide:` = 1280–1799 · `2xl:max-wide:` = 1536–1799 · `md:max-lg:` = 768–1023.

⛔ **Bề rộng KHÔNG tách được điện thoại ngang khỏi tablet dọc** (844–932 nằm trong `md:`, trùng 768–834), và KHÔNG
tách được iPad Pro ngang khỏi laptop 14" (cùng 1366). Hai ca đó có gate riêng: `phone:` và `touch:` (§2.2).

### 2.2. Biến thể — khai ở `src/styles/theme/variants.css`

| Biến thể | Điều kiện | Câu nó trả lời | Dùng cho |
|---|---|---|---|
| `sm:` … `3xl:` · `max-*:` | `min-width` / `max-width` | "Màn này **rộng** bao nhiêu?" | Hẹp chỗ: số cột, thanh tràn, bảng chật |
| `touch:` | `(hover: none) and (pointer: coarse)` | "Người dùng đang **chạm bằng ngón tay**?" | Vùng chạm, siết khe, bỏ hiệu ứng rê, `dvh` |
| `phone:` | `(max-width: 767.98px)` **hoặc** `(max-height: 540px) and (max-width: 1023.98px)` | "Đây là **điện thoại** (cả dọc lẫn ngang)?" | Bố cục dành riêng điện thoại: top bar, thanh tab, sheet, bảng → cards, bỏ khoá "cao đúng một màn" |
| `standalone:` | `(display-mode: standalone)` | "Đang chạy từ biểu tượng Màn hình chính?" | Chỗ vốn chừa cho thanh URL (hiếm khi cần) |
| `tv:` | class `.tv` trên `<html>` | "Đang ở chế độ TV?" | Thu đệm vỏ, đổi bậc weight (`tv-display-mode.md`) |
| `dark:` | class `.dark` trên `<html>` | "Đang ở theme tối?" | Trang trí chỉ có ở tối (`visual-hierarchy.md §0b`) — màu token tự lật, không cần `dark:` |
| `motion-reduce:` | `prefers-reduced-motion` | "Người dùng xin giảm chuyển động?" | Tắt hiệu ứng tự chạy |

Vì sao `phone:` KHÔNG dùng `touch:` và KHÔNG dùng bề rộng đơn thuần: điện thoại là chuyện **KÍCH THƯỚC** (không đủ
chỗ cho bố cục laptop), nên không phải `touch:` — nhưng điện thoại ngang (844×390) rộng hơn tablet dọc, nên cũng không
phải bề rộng. Vế "thấp ≤ 540px và hẹp < 1024px" bắt điện thoại ngang (vùng nội dung chỉ còn ~270px); laptop nhỏ
nhất (1280×~600) không bao giờ khớp: hoặc rộng ≥ 1024, hoặc cao > 540.

⛔ `@custom-variant phone` viết ở dạng KHỐI + `@slot`. KHÔNG viết gọn `(@media A, B)`: dạng gọn bị Tailwind tách theo dấu
phẩy như danh sách selector — vế sau thành selector rác và biến thể chỉ còn khớp điện thoại dọc (§5).

### 2.3. Cây quyết định — "cắm chuột vào thì vấn đề còn không?"

```
Vấn đề là gì?
│
├─ Thứ gì đó TRÀN / chật / phải chia cột
│     hỏi: "cắm chuột + bàn phím vào máy này, nó còn tràn không?"
│       ├─ CÒN  → chuyện BỀ RỘNG → `max-lg:` · `md:` · `lg:` · container query.   ⛔ KHÔNG `touch:`
│       └─ HẾT  → chuyện NGÓN TAY → `touch:`
│
├─ Điều khiển bé khó bấm · icon kẹt trạng thái hover ........ → `touch:` (siết + `::after`)
├─ Bố cục "cao đúng một màn" hết chỗ ở điện thoại xoay ngang  → `phone:` (hoặc `[@media(max-height:540px)]:`)
├─ Một dạng RIÊNG của điện thoại (top bar, thanh tab, sheet)  → `phone:` (CSS) / `useIsPhone()` (khi hai cây DOM)
├─ Chỉ chỉnh cho laptop 14" / 16" ........................... → `xl:max-wide:` · `2xl:max-wide:` · `xl:max-2xl:`
├─ Hộp con hẹp nhưng màn rộng (ô lưới, cột chia đôi) ......... → container query, mốc DƯỚI bề ngang hộp ở 1800 (§3.3)
├─ Chế độ TV ................................................. → `tv:`
└─ Chỉ khi cài PWA ........................................... → `standalone:`
```

| Vấn đề | Cắm chuột thì? | Gate |
|---|---|---|
| Thanh 961px trên màn 768px | vẫn tràn | `max-lg:` |
| Bảng 8 cột chật ở 768px | vẫn chật | `md:` / `lg:`; điện thoại → cuộn ngang hoặc cards (§4.5) |
| Checkbox 16px khó bấm | hết khó | `touch:` |
| Hiệu ứng `:hover` kẹt sau khi chạm | hết kẹt | bọc `(hover: hover) and (pointer: fine)` hoặc `touch:` (`ipad-responsive.md §7`) |
| Header (logo · dải phân hệ · tên trang · ô tìm) chật ở < 1024 | vẫn chật | bề rộng (`max-lg:` ẩn nhãn bộ chọn phân hệ, dải phân hệ cuộn ngang); điện thoại thì thay hẳn bằng top bar (§3.1) |
| Tab của trang không đủ chỗ trên header ở < 1280 | vẫn thiếu | `max-xl:hidden` / `xl:hidden` — tab rơi về dải trong luồng trang (`PageHeader`, `ipad-responsive.md §4.0`) |
| Số KPI 32px chiếm nửa thẻ ở 390px | vẫn chiếm | `phone:` (hạ bậc token `h1–h4`) |
| Modal 3+ ô lọc xếp chồng ở điện thoại | vẫn dài | `FilterDisclosure` (§4.3) |
| Sheet đáy cao cố định 480px ở điện thoại | vẫn thừa trống | `max-lg:h-auto` — cao theo nội dung (§4.1) |
| Box hai cột chật ở laptop 14" | vẫn chật | `xl:max-wide:@[600px]:…` (§3.3) |

### 2.4. CSS hay JS?

- **Mặc định CSS** (biến thể ở §2.2): không nháy một khung hình lúc mount, không nháy lại khi xoay máy.
- **JS chỉ khi hai dạng là HAI CÂY DOM khác nhau** — top bar thay header, `FilterDisclosure`, sheet thay popover — hoặc
  khi logic cần biết ("có thanh tab nên chừa đáy"). Ba hook preset ở `@/shared/hooks`, mỗi hook là BẢN JS của một gate CSS
  và dùng đúng hằng ở `src/shared/constants/media-query.constants.ts`:

  | Hook | Bản JS của | Hằng |
  |---|---|---|
  | `useIsPhone()` | `phone:` | `PHONE_MEDIA_QUERY` |
  | `useIsBelowWide()` | `max-wide:` (< 1800) | `BELOW_WIDE_QUERY` |
  | `useIsCoarsePointer()` | `touch:` | `TOUCH_MEDIA_QUERY` |

  Cả ba đọc `matchMedia` ngay ở lần render đầu nên không nháy bố cục sai một khung hình. `useMediaQuery(query)` trần
  chỉ cho query KHÔNG phải bề rộng (`prefers-reduced-motion`…); đừng tự gõ lại chuỗi bề rộng — thêm preset cạnh hằng.
- ⛔ KHÔNG dùng JS để chỉnh cỡ / đệm / số cột — việc đó là CSS (`max-lg:` · `BoxGrid`).
- ⛔ Viết media query TAY (CSS riêng) thì chép ĐÚNG điều kiện của biến thể (bảng §2.2) — không tự đoán mốc mới. CSS tay
  `:hover` PHẢI bọc `@media (hover: hover) and (pointer: fine)` (`ipad-responsive.md §7`).

---

## 3. Công thức theo từng nhóm màn

### 3.1. Điện thoại — `phone:` (dọc 320–767 · ngang thấp ≤ 540)

Mục tiêu: dùng được bằng MỘT ngón cái, cuộn dọc là chính, không phần tử nào tràn ngang.

| Vùng | Công thức |
|---|---|
| **Khung** | Top bar phẳng thay header (một dải logo · phân hệ · tên trang · ô tìm không đủ chỗ dưới 768px); thanh tab ĐÁY thay Dock nổi (≤ 5 ô, quá thì ô "Thêm" mở sheet) — cả hai nằm TRONG luồng nên `<main>` tự co, không phải chừa đáy; lề trái / phải không hẹp hơn `--safe-l` / `--safe-r` (§4.4). Trang CUỘN DỌC bình thường — bỏ khoá "cao đúng một màn hình" (dashboard một viewport) |
| **Lớp nổi** | Bottom-sheet số đo CHUẨN (§4.1); `Modal` gần toàn màn; `Popover` thành sheet ở điện thoại (§4.6); MỌI lớp có nút X (§4.2) |
| **Bộ lọc** | ≥ 3 điều khiển lọc trong modal / box → MỘT thanh thu gọn `FilterDisclosure` (§4.3); ô tìm kiếm luôn hiện |
| **Thẻ · lưới** | KPI 2 cột (`BoxGrid min="sm"`, hoặc `grid-cols-2`); panel 1 cột; không cố ghim 4–6 cột như laptop |
| **Bảng** | Cuộn ngang trong khung (`Table`: header dính, cột đầu ghim `frozen`). Cards theo dòng chưa có trong UI kit (§4.5). KHÔNG ẩn cột mà không có đường xem |
| **Form** | MỘT cột (`FormGrid` tự rút), nhãn trên ô; nút gửi ở hàng đáy. Ô nhập cỡ chữ ≥ 16px là chuẩn đích (iOS tự phóng trang khi focus ô nhỏ hơn, mà `user-scalable=no` bị cấm — `ipad-responsive.md §8`) — chưa có trong code (§4.8) |
| **Chạm** | Vùng chạm ≥ 44×44px (hình ≥ 32px; nút đóng 40px), khe giữa hai vùng chạm ≥ 8px; không thông tin chỉ-hover |
| **Chữ** | Chữ thân / chú thích (`body-*`, `caption-*`) KHÔNG đổi; chỉ bốn bậc hiển thị `h1–h4` (số KPI, số giữa vành donut) tự hạ ở điện thoại qua móc `--fs-*` / `--lh-*` ở `src/styles/base/phone.css` — nơi dùng không phải làm gì; TV vẫn nhân `--ui-scale` lên sau |
| **Xoay ngang** | Cao ≤ 540px: top bar + thanh tab thu còn ≤ 44px, sheet vẫn trần = màn − `--safe-t` − 24px, nội dung cuộn; kiểm 568×320 (sàn thấp nhất) |
| **Đệm trang** | KHÔNG đổi đệm theo bề rộng ở code trang (`phone:p-*` bị luật `spacing-system.md §7` chặn như `md:p-*`): đệm là hằng số, thứ đổi là SỐ CỘT |

### 3.2. Máy tính bảng — `touch:` (ngón tay) + `md:` / `lg:` (chỗ hẹp)

Luật nền nằm ở `ipad-responsive.md` (đừng chép lại ở đây). Công thức tóm gọn:

- **Tách bằng ngón tay, không bằng bề rộng**: iPad Pro ngang = 1366 = laptop 14" → việc nhắm tablet đi `touch:`; chỉ
  chuyện CHẬT mới dùng `md:` / `lg:` (`§2.3`).
- **Siết, không nới**: số hình học ở `touch:` ≤ số nền; vùng bấm nới bằng `::after` (`ipad-responsive.md §3`).
- **Dọc (768–834, bậc `md:`)**: 1–2 cột; dải phân hệ trên header + dải tab của trang (trong luồng trang — dưới `xl` tab chưa lên header) cuộn ngang, tab rút nhãn (`shortLabel`), Dock vừa màn; Drawer đáy
  cao theo nội dung (`max-lg:h-auto`); nút X luôn hiện. iPad mini dọc (744) rơi xuống `phone:` (§1).
- **Ngang (1024–1194 `lg:` · 1366 `xl:`)**: bố cục laptop + `touch:` siết khe. Đừng sửa giá trị `xl` "cho iPad".
- **Cuộn, không ẩn**; dải cuộn ngang có `overscroll-x-contain`; vùng cuộn dọc / hai trục chỉ `touch:overscroll-contain`.
- **Có bàn phím / chuột (Magic Keyboard)**: `touch:` tắt — bố cục dựa vào gate bề rộng (`max-lg:`) vẫn phải đúng (§2.3).
- **Ghép cửa sổ**: cửa sổ iPad hẹp hơn 768px (Slide Over ~320–375, Split View 1/3 và 1/2) khớp `phone:` — đó là ĐÚNG;
  kiểm một lần ở 375×1024.

### 3.3. Laptop 14" (1280–1535) và 16" (1536–1799) — gate `max-wide:`

Bố cục màn ngoài ≥ 1800 là bản đã chốt. Chỉnh cho laptop dùng gate bề rộng và **mọi class mới phải dừng trước 1800px**:
`xl:max-wide:` (cả 14" lẫn 16") · `xl:max-2xl:` (chỉ 14") · `2xl:max-wide:` (chỉ 16") · `max-wide:` (mọi màn < 1800).
Bảng gate, luật container query và cách kiểm 1920 so pixel: `ipad-responsive.md §2.3` (nguồn duy nhất).

- **Container query** cho hộp con hẹp (ô lưới, cột chia đôi): mốc phải nằm DƯỚI bề ngang của hộp ở 1800px, không chắc thì
  bọc `max-wide:`. Mẫu thật trong code: `hud-kpi-card.theme.ts` (`@container`, `@max-[259px]:`) · `ProgressDonutChart.tsx`.
- **Mật độ không đổi theo bề rộng**: đệm là hằng số (`spacing-system.md`); thứ đổi theo bề ngang là SỐ CỘT (`BoxGrid`)
  và việc chia đôi cột bằng container query.
- **Chiều cao thấp** (1280×720 → viewport ~1280×600): trang một-viewport cho mỗi khối một SÀN chiều cao (`min-h-*`)
  rồi để `<main>` cuộn, đừng ép co dưới sàn. Laptop không bao giờ khớp `phone:` (cao > 540).
- **Thứ chỉ ngón tay cần** vẫn đi `touch:` — laptop không bao giờ khớp.
- **Kiểm chứng**: 1920×1080 trước / sau so từng pixel = 0 (§6.2); thay đổi nhắm laptop chỉ được thấy ở 1280–1799.

### 3.4. Màn ngoài ≥ 1800 · 2560 · TV

- `wide:` = **cỡ gốc** (thanh header nổi 56px trong vùng 64px, control 36px, tab trên header nhãn đủ…). Mọi bậc dưới nó chỉ THÊM.
- 2560×1440 và 3840×2160 KHÔNG có bậc riêng: lưới `auto-fill` / `flex-1` tự giãn, chart đo bằng ResizeObserver
  (`useChartMetrics`). Kiểm: không dải trống phi lý, chart không kẹt bậc chữ nhỏ.
- **TV**: `?display=tv&scale=1.1|1.2|1.3` — chỉ nhân chữ, khung giữ nguyên (`tv-display-mode.md`). Việc "chữ to lên
  không tràn" kiểm ở 1920×1080 + 3840×2160, theme tối; không thêm bậc phóng bố cục.

---

## 4. Mẫu thành phần — dùng lại, đừng dựng lại

Mọi mẫu dưới đây là component CÓ SẴN trong code. Khai biến thể bằng bảng `*_CLASSES` + `cn()` (không `tv()`); cần mẫu
khác thì mở rộng bảng của component đó, không dựng bản thứ hai (`reuse-first.md`).

### 4.1. Bottom-sheet điện thoại — SỐ ĐO CHUẨN

`Drawer side="bottom"` (`src/shared/ui/overlays/drawer/drawer.theme.ts`). Một nhịp cho MỌI sheet (`Popover sheetOnPhone`,
sheet "Thêm" của `TabBar`, sheet tài khoản của top bar dùng cùng số đo); nơi dùng KHÔNG tự cộng đệm.

| Phần | Số đo | Ở đâu |
|---|---|---|
| Vị trí | sát hai mép + đáy màn | `DRAWER_SIDE_CLASSES.bottom` (`left-0 bottom-0 w-full`) |
| Cao | THEO NỘI DUNG (`max-lg:h-auto`); trần = màn − `--safe-t` − 24px | `DRAWER_SIZE_CLASSES.bottom` · `max-lg:max-h-[calc(100dvh-var(--safe-t,0px)-1.5rem)]` |
| Tay nắm kéo-để-đóng | 20px (`py-2` + thanh 40×4px); kéo XUỐNG quá 80px thì đóng, chưa tới thì bật về (kéo lên bị chặn nên không tranh với cuộn thân) | `DRAWER_CLASSES.grip` · `gripBar` · `useDrawerDragClose` |
| Header | 52px: đệm trên 4 · nút ✕ 40 · đệm dưới 8, tiêu đề canh GIỮA nút ✕ | `DRAWER_CLASSES.headerBottom` · `headerCentered` |
| Thân | `p-4` ⇒ lề trái nội dung = lề tiêu đề = **16px**; đáy 16px + `--safe-b` | `DRAWER_CLASSES.body` · `bodyBottom` |
| Khoảng cách | 8px giữa điều khiển · 16px giữa nhóm · lưới chip cột đều, không chip lẻ một mình | nơi dùng |

```ts
// Chiều cao khai ở `size` chỉ có nghĩa từ `lg:`; tablet / điện thoại luôn cao theo nội dung.
bottom: { sm: 'h-64 max-lg:h-auto', md: 'h-[360px] max-lg:h-auto' /* … */ },
```

⛔ Nơi dùng bọc thêm `p-4` quanh nội dung = đệm đôi (16 + 16): thân đã có `p-4`. Khối con cần tràn mép thì bỏ đệm của
chính nó (`p-0`), không cộng thêm. Footer của sheet đã cộng `--safe-b` — đừng cộng lần nữa.

`Modal` ở điện thoại KHÔNG phải sheet mà là hộp gần toàn màn, lề 8px mỗi phía: rộng `100vw − 16px`, cao
`100dvh − 16px − safe-t − safe-b`, thân tự cuộn, tiêu đề dài xuống dòng, footer cộng `--safe-b` (`MODAL_PANEL_BASE_CLASSES` /
`MODAL_LAYOUT_CLASSES` ở `modal.theme.ts`). Tablet (`max-lg:`) panel rộng ≤ 92vw, cao ≤ 92dvh.

### 4.2. Nút đóng (✕) — `ModalCloseButton`

Một nút CHUNG cho `Modal` · `FormModal` · `ConfirmDialog` · `Drawer` · `CustomModalLayout`
(`src/shared/ui/overlays/dialog/ModalCloseButton.tsx`; toàn bộ class ở `MODAL_CLOSE_CLASSES` trong `modal.theme.ts`):

| | Laptop (≥ 1024, chuột) | Tablet · điện thoại (`max-lg:` hoặc `touch:`) |
|---|---|---|
| Hình | 32px, trong suốt, đỏ khi rê | **40px**, viền + nền nhấn sẵn, icon 20px |
| Vùng chạm | 44px (`::after` `-inset-1.5` quanh 32px) | ~52px (cùng `::after` quanh 40px) |
| Hiện | theo `showClose` | **luôn hiện** — `showClose={false}` chỉ ẨN ở laptop (`forced`); `Modal.forceCloseOnTouch` (mặc định `true`) giữ nó |
| Không có header | — | nút NỔI góc phải-trên, nền đặc + bóng (`floating`); panel chừa `pt-12` |
| Truy cập | `aria-label="Đóng"` | Esc + bấm nền vẫn đóng |

- Đây là ngoại lệ DUY NHẤT của luật "`touch:` chỉ siết" (`ipad-responsive.md §3.0`): nút ✕ 32→40px — lớp nổi gần toàn
  màn mà không thấy lối ra là lỗi nặng hơn nút to hơn một chút.
- Ngoại lệ có chủ ý khác: `ConfirmDialog` đặt `forceCloseOnTouch={false}` (đã có hai nút Huỷ / Xác nhận; Esc và bấm nền
  vẫn đóng). Lớp nổi mới mặc định PHẢI có ✕.
- `forceCloseOnTouch={false}` tắt hẳn ✕ ở tablet / điện thoại — chỉ cho modal khoá cứng.
- ⛔ Không dựng nút ✕ riêng trong từng lớp nổi.

### 4.3. Nhiều bộ lọc — `FilterDisclosure` (`@/shared/ui`)

`src/shared/ui/layout/FilterDisclosure.tsx`. ≥ 3 điều khiển lọc trong modal / box → ở điện thoại chỉ vẽ MỘT thanh thu gọn
cao 44px `[⚙ Bộ lọc ▫n  tóm tắt ▾]` (`summary`, `activeCount`); bấm bung TẠI CHỖ (không popover lồng — lịch / chọn kỳ trong
modal bị khoá chuột / cắt) kèm "Đặt lại" (`onReset`); `sticky` khi thân cuộn dài. Không phải điện thoại: `display: contents`
— không đổi một pixel. Phần bung chỉ ẩn bằng `grid-rows` + `inert`, KHÔNG gỡ khỏi cây nên điều khiển giữ state. Cùng
component, cùng state — KHÔNG dựng bản "mobile" riêng. Một bộ lọc đơn lẻ thì để thẳng, không bọc.

```tsx
<FilterDisclosure activeCount={2} summary="T11/2025 → T10/2026" onReset={resetFilters}>
  <MonthRangeFilter value={range} onChange={setRange} />
  <SegmentToggle options={viewOptions} value={view} onValueChange={setView} />
</FilterDisclosure>
```

### 4.4. Khung điện thoại — top bar + thanh tab đáy

`AppShellLayout` chọn bằng `useIsPhone()`: top bar phẳng thay `Header`, thanh tab đáy thay `Dock` — cả hai nằm TRONG luồng
khung `h-dvh flex-col` nên `<main>` tự co lại, không bị che (không `fixed`, không phải tự chừa đáy).

| Phần | Component | Số đo / hành vi |
|---|---|---|
| Top bar | `PhoneTopBar` (`src/shared/widgets/header/phone/`), nối bởi `AppPhoneTopBar` (`src/app/shell/`) | cao 52px (xoay ngang ≤ 44px); nút theo `HEADER_PHONE_BUTTON_CLASS`; avatar mở sheet tài khoản `UserMenuSheet` (`src/shared/widgets/header/user-menu/UserMenuSheet.tsx`, số đo §4.1); tên không `truncate` (§5) |
| Ô slot của trang | `<PageHeader>` (dùng CHUNG ô `start` · `title` · `end` · `nav` với `Header`) | trang vẫn chỉ gọi `<PageHeader>` (dạng điện thoại: `page-header/parts/page-header-phone.tsx`); dải tab của trang cuộn ngang ngay dưới top bar (ô `nav`; ô `tabs` trên thanh chỉ máy tính ≥ `xl` có) |
| Thanh tab đáy | `TabBar` (`src/shared/widgets/tab-bar/`), nối bởi `AppTabBar` | ≤ 5 ô đều nhau (icon + nhãn một dòng), mục đang mở có vạch sáng; quá 5 mục → 4 ô + ô "Thêm" mở sheet §4.1; ô là `<Link>` thật + `aria-current="page"` |
| Chiều cao thanh tab | `--tab-bar-h` 56px (xoay ngang cao ≤ 540px: 44px), `--tab-bar-reach` = +1px | khai MỘT chỗ `tab-bar.css`; phần tử neo đáy khác (nút nổi) chừa `bottom-[calc(var(--tab-bar-reach)+var(--safe-b,0px)+0.5rem)]` |
| Lề vỏ | `SHELL_GUTTER_X/Y` + `SHELL_SAFE_INSET_X` (`layout.constants.ts`) | điện thoại 8px (= khe giữa thẻ); lề trái / phải của `<main>` không hẹp hơn `--safe-l` / `--safe-r` (tai thỏ xoay ngang) |
| Dock `pinned` (tablet · laptop) | `useDockReserveClass()` → `DOCK_RESERVE_CLASSES` (`src/shared/widgets/dock/dock.theme.ts`) | `AppShellLayout` thêm đệm 80px (`5rem + --safe-*`) cho `<main>` ở CẠNH NEO (đáy · trái · phải) nên bảng / form không chui dưới thanh; tự ẩn / thu gọn / ẩn thì không chừa (Dock nổi đè); máy chạm luôn ghim nên luôn chừa; điện thoại KHÔNG dùng (thanh tab trong luồng) |

Hai thanh KHÔNG mount cùng `Header` / `Dock` (hai bên cùng đăng ký một ô slot sẽ tranh nhau). Tablet ≥ 768px giữ
`Header` + `Dock` y như laptop.

### 4.5. Bảng

`Table` (`@/shared/ui`) ở mọi cỡ màn cuộn trong khung của nó (`TABLE_SCROLLER_CLASSES`: `overflow-auto` +
`touch:overscroll-contain`), header dính, cột ghim `frozen`; tay sắp xếp / kéo hàng nới vùng chạm bằng `::after` ở `touch:`.
Điện thoại: giữ cuộn ngang, KHÔNG ẩn cột mà không có đường xem. Dạng cards theo dòng (hai cây DOM → ca hợp lệ của
`useIsPhone()`, §2.4) CHƯA có trong UI kit — dựng ở feature khi một bảng cần, và tách vào UI kit ở lần lặp thứ 3
(`development-rules.md`).

### 4.6. Popover → sheet ở điện thoại

`Popover` có prop `sheetOnPhone`: ở điện thoại nội dung mở thành sheet đáy §4.1 (có ✕ + tay nắm kéo) thay vì panel lơ
lửng; `true` = không tiêu đề, truyền node = tiêu đề sheet. Laptop / tablet không đổi. Chỉ bật cho nội dung KHÔNG mở lớp
nổi lồng (sheet là Dialog modal: lớp nổi lồng portal ra `body` bị khoá chuột). Không bật `sheetOnPhone` thì panel vẫn
không tràn màn: cao tối đa phần màn còn lại rồi cuộn, rộng ≤ `100vw − 16px`, chừa 8px tới mép.

### 4.7. Chart

Cỡ chữ / nét theo **chiều cao vùng vẽ** (`useChartMetrics`), bề rộng chỉ quyết định MẬT ĐỘ NHÃN — bảng "cỡ màn → trục /
legend / nhãn / tooltip", `{...m.chartProps}` cho cảm ứng, màu và mù màu: `chart-conventions.md §2.6` (nguồn duy nhất,
không chép ở đây).

### 4.8. Form · Tabs · Toolbar · Pagination

- `FormGrid` tự rút về MỘT cột dưới `md` (3–4 cột chỉ từ `lg`); `FormActions sticky` cộng `--safe-b`; nút gửi xuống dòng
  được (`flex-wrap`).
- `Tabs` cuộn ngang (`overflow-x-auto overscroll-x-contain scrollbar-hidden`), KHÔNG ẩn tab; `::after` nới vùng chạm tab ở
  `touch:`. Tab của trang (`PageHeader nav`: nhóm trên header ≥ `xl`, dải trong trang < `xl`) đã có cuộn + `shortLabel` — đừng dựng lại
  (`ipad-responsive.md §4.0`).
- `Toolbar`: ở `phone:` cụm trái giữ sàn 16rem, cụm phải không đủ chỗ thì rớt xuống hàng riêng canh phải; `Pagination`: hai
  hàng `[Kết quả · cỡ trang]` rồi `[‹ trang ›]`, không bớt trang nào.
- Điều khiển nhỏ trong kit (nút xem mật khẩu, tay kéo hàng, nút quay lại của `TitleScreen`) nới vùng chạm bằng
  `TOUCH_HIT_CLASSES` (`ipad-responsive.md §3.3`).
- `Toast`: `ToastViewport` ở điện thoại rộng ≤ `100vw − 16px`, neo `right-2` và đáy
  `calc(var(--tab-bar-reach,0px) + var(--safe-b,0px) + 0.75rem)` — nằm TRÊN thanh tab đáy; laptop / tablet neo góc TRÊN phải dưới header như thông báo macOS
  (`top-[calc(4.5rem+var(--safe-t,0px))] right-4`, rộng ≤ `min(380px, 100vw − 32px)`).
- ⚠️ Ô nhập (`text-body-14`) nhỏ hơn 16px nên iOS Safari tự phóng trang khi focus — chuẩn đích là ≥ 16px ở điện thoại,
  CHƯA có trong code (`known-issues.md`).

---

## 5. ⛔ Bẫy đã gặp

| Bẫy | Triệu chứng | Cách chữa |
|---|---|---|
| `not-touch:` (biến thể `not-*` của Tailwind v4 trên `touch`) | Sinh `@media not (hover: none) and (pointer: coarse)` — `not` không bọc ngoặc ⇒ đọc thành `not all`, class KHÔNG BAO GIỜ khớp (cả laptop) | `[@media_not_((hover:none)_and_(pointer:coarse))]:` |
| `@custom-variant phone (@media A, B)` viết gọn | Tách theo dấu phẩy như danh sách selector → `.phone\:x (max-height…)` rác; chỉ còn khớp điện thoại dọc | Dạng KHỐI: `@custom-variant phone { @media A { @slot; } @media B { @slot; } }` |
| `100cqh` trong ô `container-type:size` cao `auto` | Chrome tính `cqh` = 0 → vành donut 0px, box chỉ còn chữ (tablet dọc, điện thoại ngang) | Cho `cqh` một sàn: `h-[min(max(100cqh,var(--floor,0px)),100cqw)]` + đặt `--floor` ở ô |
| `justify-end` / `justify-center` + `overflow-x-auto` | Phần tràn bị đẩy sang x ÂM — mất, không cuộn tới được | `[justify-content:safe_flex-end]` (hoặc `justify-end-safe`), hoặc `flex-wrap` |
| `truncate` + `leading-none` | Gọt dấu tiếng Việt (Ố, Ế, Ữ): `truncate` đặt `overflow: hidden` cắt luôn dấu nằm ngoài hộp dòng | `TEXT_ELLIPSIS_CLASSES` (`src/shared/ui/primitives/text-ellipsis.theme.ts`) = `min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap` |
| `100vh` / `h-screen` ở khung toàn màn | Safari iOS: thanh dưới nằm ngoài màn | `dvh` (`ipad-responsive.md §5`) |
| Neo đáy thiếu `--safe-b` | Đè vạch Home, vuốt lên thoát app | `bottom-[calc(1rem+var(--safe-b,0px))]` |
| `:hover` CSS tay không bọc | Sticky hover: chạm một lần, hiệu ứng kẹt | `@media (hover: hover) and (pointer: fine)` (`ipad-responsive.md §7`) |
| Recharts 3 gom `mousemove` / `touchmove` vào `requestAnimationFrame` | Lần chạm đầu mất tooltip / `onClick` | `{...m.chartProps}` (`throttledEvents: []`) trên mọi chart có tooltip hoặc `onClick` — `chart-conventions.md §2.6`; tooltip chỉ BỔ SUNG, không phải nguồn số liệu duy nhất |
| `scrollbar-gutter: stable` trong thân modal / sheet | Lề trái 16px, phải 26px — lệch header | Không khai ở thân lớp nổi (máy chạm: thanh rộng 0 nên gutter không chừa gì) — `scrollbar.md` |
| `overscroll-contain` trần ở vùng cuộn dọc | Con lăn chuột desktop không cuộn tiếp ra cha | `touch:overscroll-contain` (`ipad-responsive.md §4.1`) |
| Ô nhập chữ < 16px trên iOS | Safari tự phóng trang khi focus, không thu lại | Ô nhập ≥ 16px ở `phone:` (chuẩn đích, chưa có trong code — `known-issues.md`); không cấm zoom bằng `maximum-scale` |
| `touch:` gate cho chuyện bề rộng | iPad dọc cắm chuột / Magic Keyboard vẫn vỡ | `max-lg:` — hỏi "cắm chuột còn không?" (§2.3) |
| `touch:` nới hình (size / padding lớn hơn nền) | Giao diện "bị phóng to" — lỗi đã bị bác | Siết + `::after` (`ipad-responsive.md §3.0`) |
| `::after` nới vùng chạm đè sang control kế bên | Bấm nhầm control bên cạnh | Chỉ nới về phía không có phần tử khác; dùng `TOUCH_HIT_CLASSES` (`src/shared/ui/primitives/touch-hit.theme.ts`): `icon` (→ ~40px mọi phía), `row` (chỉ nới dọc) |
| Class ghép chuỗi (`` `md:p-${n}` ``) | Tailwind không quét ra → không sinh rule, lỗi IM LẶNG | Class LITERAL trong bảng `*_CLASSES` |
| `w-px` trong flex có cuộn | Vạch ngăn biến mất | thêm `shrink-0` |
| Thanh cố định rộng hơn màn + `left-1/2 -translate-x-1/2` | Cụt hai đầu, không với tới | `max-lg:max-w-[calc(100vw-1rem)]` + cuộn ngang |
| Xoá hay thêm `touch:` / `phone:` mà không soi ≥ 1800 | Bố cục màn ngoài đổi âm thầm | So pixel 1920×1080 trước / sau (§6.2) |

---

## 6. Kiểm chứng bằng máy

Vitest + jsdom KHÔNG có bố cục thật (không đo được tràn ngang, vùng chạm, chồng lấn). Kiểm bố cục bằng **trình duyệt
thật** (Playwright) trên bản dev đang chạy (chế độ demo, không cần đăng nhập: `/demo/ghep` danh sách + Drawer, `/demo/tong-quan`
dashboard một viewport, `/demo` thư viện). Playwright KHÔNG phải dependency của repo (`known-issues.md`): chạy bằng
`npx playwright` / bản cài ngoài, script nằm ngoài repo (không commit file nháp).

**Xem nhanh bằng tay (không cần Playwright):** mục "Responsive lab" ở `/demo#responsive-lab` — số đo trực tiếp của khung
nhìn, chip biến thể đang khớp (`touch:` · `phone:` · `max-wide:` · bậc bề rộng), bảng thiết bị → viewport và khung xem
thử (`<iframe>` đúng cỡ đã chọn, thu bằng `transform: scale`). Khung CHỈ mô phỏng kích thước: `touch:` / `hover` vẫn là
của máy thật đang mở trang — soi chạm phải dùng thiết bị thật hoặc `isMobile` + `hasTouch` ở §6.2.

### 6.1. Ma trận viewport BẮT BUỘC

| Việc đã làm | Chụp ma trận nào |
|---|---|
| Bất kỳ thay đổi UI hiển thị | **Tối thiểu**: 360×800 · 390×844 · 844×390 (điện thoại) · 768×1024 · 1024×768 (tablet, `isMobile`+`hasTouch`) · 1280×720 · 1440×900 (laptop) · 1920×1080 |
| Vỏ ứng dụng · lớp nổi (Modal / Drawer / Popover) · bảng · form · chart · khoảng cách | TOÀN BỘ bảng §1 (36 cỡ), cả sáng và tối |
| Sửa giá trị ở `xl` / `2xl` / `wide` · token toàn cục (màu, chữ, `--spacing`) | 1280 · 1366 · 1440 · 1536 · 1728 · 1920 **trước / sau**; 1920×1080 so pixel = 0 (§6.2) |
| Chữ · chart · đệm vỏ ở chế độ TV | 1920×1080 + 3840×2160, `?display=tv&scale=1.2`, tối |

Mỗi ảnh soi: không tràn ngang · không chồng lấn · chữ không gọt dấu / không bị cắt · vùng chạm đủ · sheet đúng số
đo (§4.1) · nút X thấy rõ · chart đọc được · không thông tin chỉ-hover · focus nhìn thấy.

⚠️ **Phải giả lập chạm** cho nhóm điện thoại / tablet (`isMobile: true, hasTouch: true`), nếu không `touch:` KHÔNG khớp
và bạn đang xem nhầm bản desktop. Chromium cho `phone:` + `touch:` đúng; WebKit để soi riêng chuyện Safari (`dvh`,
`backdrop-filter`, `-webkit-text-size-adjust`).

### 6.2. Script mẫu (Playwright)

```js
// ngoài repo — vd scratch/responsive-check.mjs. Cổng Vite: kiểm process đang nghe, không đoán.
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const ROUTES = ['/demo/ghep', '/demo/tong-quan'];
// [tên, rộng, cao, DPR, ngón tay?]
const SCREENS = [
  ['phone-360x800', 360, 800, 3, true],
  ['phone-390x844', 390, 844, 3, true],
  ['phone-844x390', 844, 390, 3, true], // xoay ngang: khớp `phone:` nhờ vế cao ≤ 540
  ['tablet-768x1024', 768, 1024, 2, true],
  ['tablet-1024x768', 1024, 768, 2, true],
  ['laptop-1280x720', 1280, 720, 1, false],
  ['laptop-1440x900', 1440, 900, 2, false],
  ['wide-1920x1080', 1920, 1080, 1, false],
];

const browser = await chromium.launch();
for (const [name, width, height, deviceScaleFactor, touch] of SCREENS) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor,
    isMobile: touch, // meta viewport + `touch:` khớp
    hasTouch: touch,
    reducedMotion: 'reduce', // đóng băng hiệu ứng để ảnh ổn định
  });
  // Theme: store zustand `theme-storage` (domains/preferences/theme). Đổi 'light' ↔ 'dark' rồi chạy lại để chụp đủ hai theme.
  await ctx.addInitScript(() =>
    localStorage.setItem('theme-storage', JSON.stringify({ state: { theme: 'light' }, version: 1 })),
  );
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '*{animation-play-state:paused!important;caret-color:transparent!important}' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500); // AnimatedNumber đếm xong

    // Ảnh chụp TRƯỚC khi đo (đo vùng chạm cuộn trang). Ảnh cao > 2000px phải cắt khúc trước khi soi.
    await page.screenshot({ path: `out/${name}${route.replaceAll('/', '_')}.png`, animations: 'disabled' });

    const report = await page.evaluate((touch) => {
      const de = document.documentElement;
      // 1) Tràn ngang: cả trang lẫn từng phần tử vượt mép phải (bỏ qua phần tử nằm trong vùng cuộn ngang).
      const overflowX = de.scrollWidth - innerWidth;
      const inScroller = (el) => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowX;
          if ((o === 'auto' || o === 'scroll' || o === 'hidden') && p.scrollWidth > p.clientWidth) return true;
        }
        return false;
      };
      const wide = [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && !inScroller(el))
        .slice(0, 8)
        .map((el) => el.tagName + '.' + String(el.className).slice(0, 60));

      // 2) Vùng chạm THẬT (chỉ máy chạm): `::after` không nằm trong getBoundingClientRect → dò bằng
      //    elementFromPoint, đi ra từ tâm từng phía tới khi chạm phần tử khác. 0×0 = tâm bị phần tử khác che.
      const reachOf = (el) => {
        el.scrollIntoView({ block: 'center', inline: 'center' }); // ngoài khung nhìn thì elementFromPoint = null
        const r = el.getBoundingClientRect();
        const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
        const owns = (x, y) => { const t = document.elementFromPoint(x, y); return !!t && (t === el || el.contains(t)); };
        const steps = (dx, dy) => { let n = 0; while (n < 40 && owns(cx + dx * (n + 1), cy + dy * (n + 1))) n++; return n; };
        return { w: steps(1, 0) + steps(-1, 0), h: steps(0, 1) + steps(0, -1) };
      };
      const small = !touch ? [] : [...document.querySelectorAll('button,a[href],[role=button],[role=tab],input,select')]
        .filter((el) => el.getBoundingClientRect().width > 0)
        .map((el) => ({ el, ...reachOf(el) }))
        .filter(({ w, h }) => Math.min(w, h) < 44)
        .slice(0, 10)
        .map(({ el, w, h }) => `${el.tagName}[${el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 20)}] ${w}×${h}`);

      return { overflowX, wide, small };
    }, touch);
    console.log(name, route, JSON.stringify(report));
  }
  await ctx.close();
}
await browser.close();
```

- **Tràn ngang**: `overflowX ≤ 0` và danh sách `wide` rỗng (ngoại lệ chỉ là vùng cuộn ngang có chủ đích).
- **Vùng chạm**: danh sách `small` (ứng viên để soi, sai số ±2px, tối đa 80 mỗi chiều) ở nhóm chạm phải rỗng, hoặc mỗi mục
  có lý do (vd icon trang trí). Hit-test bằng `elementFromPoint` cho thấy `::after` nới thật hay không; `0×0` = tâm
  phần tử bị phần tử khác che (thanh cố định, lớp phủ) — là lỗi cần xem, không phải nhiễu. Chỉ chạy ở nhóm chạm.
- **Phủ bằng thanh cố định**: `document.elementFromPoint` tại tâm nội dung cuối trang phải trả về nội dung, không phải
  thanh tab / Dock (kiểm cuộn tới đáy).
- **≥ 1800 không đổi**: chụp 1920×1080 TRƯỚC khi sửa (`git stash` hoặc worktree sạch) và SAU khi sửa với cùng route, cùng
  theme, `reducedMotion: 'reduce'`, `animations: 'disabled'`, chờ như trên; so từng pixel:

```js
import pixelmatch from 'pixelmatch'; // + pngjs — cài tạm ngoài repo
import { PNG } from 'pngjs';
const [a, b] = [before, after].map((f) => PNG.sync.read(fs.readFileSync(f)));
const diff = pixelmatch(a.data, b.data, null, a.width, a.height, { threshold: 0.1 });
// diff phải = 0. Nhiễu cho phép: khử răng cưa chữ trên canvas (vài px) — soi ảnh trước khi bỏ qua.
```

### 6.3. Máy giữ luật (Vitest)

| Cổng | Giữ gì |
|---|---|
| `tests/policy/display/responsive-foundation.test.ts` | Nền responsive: `phone:` dạng khối + `@slot`, mốc `wide` 1800 / `3xl` 1920, bản JS (`media-query.constants.ts`) khớp CSS, bảng thiết bị rơi đúng bậc + đúng `phone:`, viewport không khoá phóng to, `:hover` tay bọc `(hover: hover)`, không `h-screen` |
| `tests/policy/display/responsive-docs.test.ts` | Rule này tồn tại, `docs/README.md` trỏ tới; mốc `wide` = 1800 trong docs khớp `breakpoints.css`; mọi biến thể khai ở `variants.css` đều có mặt trong §2.2 |
| `tests/policy/styling/css-structure.test.ts` | `globals.css` chỉ là entry, mọi file CSS được import (`css-architecture.md`) |
| `tests/policy/foundations/docs-links.test.ts` | Đường dẫn nhắc trong docs có thật |

Test máy KHÔNG thay được ma trận §6.1 — chúng khoá cấu hình và tài liệu, không khoá bố cục.

### 6.4. ✅ Checklist trước commit (⛔ chặn merge)

**Gate**
- [ ] Mọi thay đổi cho máy chạm đi qua `touch:`; chuyện chật chỗ đi bề rộng; điện thoại đi `phone:` (§2.3)?
- [ ] KHÔNG sửa giá trị ở `xl` / `2xl` / `wide`; mọi class mới cho laptop dừng trước 1800 (`max-wide:`) (§3.3)?
- [ ] Chỉ THÊM class cho màn nhỏ, không đổi / xoá class đang chạy?
- [ ] Không `XxxMobile` / `XxxV2`; hai dạng cùng một component (§0.6)?

**Bố cục**
- [ ] Không tràn ngang ở 320 · 360 · 568×320 · 768 · 1024 · 1280 (`scrollWidth ≤ innerWidth`)?
- [ ] Chật chỗ → cuộn (`overflow-x-auto overscroll-x-contain`), không ẩn chức năng?
- [ ] Không `justify-end` / `justify-center` trần trên vùng cuộn ngang; không `truncate` trên chữ Việt có `leading-none`?
- [ ] `dvh` thay `vh`; neo đáy cộng `--safe-b`; không thông tin chỉ-hover?

**Lớp nổi · chạm**
- [ ] Mọi lớp nổi có nút X ≥ 44px vùng chạm, `aria-label="Đóng"`, luôn hiện ở tablet / điện thoại?
- [ ] Sheet đáy đúng số đo §4.1, nơi dùng không cộng đệm đôi?
- [ ] Modal / box ≥ 3 điều khiển lọc dùng `FilterDisclosure`?
- [ ] Số hình học ở `touch:` ≤ số nền; vùng chạm nới bằng `::after` có `content-['']` + `relative`?

**Kiểm chứng**
- [ ] Đã chụp đúng ma trận ở §6.1 cho loại thay đổi này (sáng + tối khi đụng màu / chart)?
- [ ] 1920×1080 so pixel trước / sau = 0 khi đã đụng `xl` / `2xl` / token toàn cục?
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 7. Khi vi phạm

- Sửa giá trị ở `xl` / `2xl` / `wide` để "cho điện thoại / iPad" → **revert** (đụng laptop / màn ngoài)
- Gate chuyện bề rộng bằng `touch:` (lọt iPad cắm chuột) → **revert**
- Ẩn chức năng / điều hướng ở màn hẹp thay vì cuộn / gom → **block merge**
- Lớp nổi không có nút X ở tablet / điện thoại → **block merge**
- Sheet đáy cao cố định, không `max-lg:h-auto`, hoặc nơi dùng cộng đệm đôi → **fail review**
- `not-touch:` · `@custom-variant` gộp dấu phẩy · `100vh` khung toàn màn · neo đáy thiếu `--safe-b` → **block merge**
- `useIsPhone()` để chỉnh cỡ / đệm / số cột (việc của CSS) → **revert**
- Component fork cho điện thoại (`XxxMobile`) → **revert**
- Thay đổi giao diện chưa chụp ma trận §6.1 → **chưa xong**, không merge

---

## 8. Cross-references

- Cảm ứng · vùng chạm · `dvh` · safe-area · sticky hover · PWA → `ipad-responsive.md`
- Đơn vị · bậc bề rộng · `cn()` → `tailwind-conventions.md`
- Nơi khai biến thể · breakpoint · nền chạm → `css-architecture.md` (`theme/variants.css` · `theme/breakpoints.css` · `base/touch.css`)
- Đệm KHÔNG đổi theo bề rộng ở code trang → `spacing-system.md §7`
- Mật độ · bố cục → `visual-hierarchy.md`
- Chart theo cỡ vùng vẽ · màu · mù màu → `chart-conventions.md`
- TV · phóng chữ → `tv-display-mode.md`
- Catalog component (Drawer · Modal · Popover · FilterDisclosure · Table) → `reuse-first.md`
- Kiểm bằng viewport · test luật → `testing.md §7` · `quality-gates.md §4`

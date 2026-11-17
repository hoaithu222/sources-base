# Scrollbar Rules

> Thanh cuộn là chỗ trình duyệt khác nhau nhất. File này có **ba cái bẫy đã làm vỡ thanh cuộn
> thật** — đọc trước khi chạm vào `base/scrollbar.css` hoặc `utilities/scrollbar.css`.

## Mặc định: KHÔNG cần làm gì

Mọi vùng cuộn (`overflow-auto` / `overflow-y-auto`…) tự có thanh cuộn của app: mảnh lúc nghỉ,
nở ra khi rê chuột, tông lạnh trầm, track trong suốt. **Một bề rộng cho cả app.**

| Muốn | Dùng | Không dùng |
|---|---|---|
| Thanh cuộn bình thường | *(không class)* | `scrollbar-thin` ⛔ |
| Nhạt hơn (bảng dày, nơi thanh cuộn nổi hơn dữ liệu) | `scrollbar-muted` | tự đặt `scrollbar-color` |
| Ẩn nhưng vẫn cuộn được (carousel, tab) | `scrollbar-hidden` | `scrollbar-none` ⛔ (utility của Tailwind ≥ 4.3; app dùng `scrollbar-hidden` — phủ cả WebKit lẫn Firefox) |
| Đổi bề rộng toàn app | `--scrollbar-size` trong `base/scrollbar.css` | số px riêng ở từng nơi |
| Tránh layout nhảy khi thanh cuộn xuất hiện | `[scrollbar-gutter:stable]` ✅ (property khác, không dính bẫy) | — |

`scrollbar-hidden` là CSS thường, không phải `@utility` → **để trần, không tiền tố**
(`md:scrollbar-hidden` không sinh rule). Xem `notes/components/layout.md`.

## ⛔ Bẫy 1 — `scrollbar-width` / `scrollbar-color` tắt `::-webkit-scrollbar`

Từ Chrome 121, chỉ cần MỘT trong hai property chuẩn này khác `auto` là Blink chuyển hẳn sang đường vẽ
chuẩn và **bỏ qua toàn bộ `::-webkit-scrollbar*`**. Thanh cuộn custom biến mất, rơi về native
(~15px, màu sáng) — "thanh cuộn trắng to đùng" trên nền navy.

**Luật:** hai property đó chỉ được khai trong khối `@supports` dành riêng cho Firefox ở
`base/scrollbar.css`, cộng `.scrollbar-hidden` (`none`) và reset `.scrollbar-thin` (`auto`) ở
`utilities/scrollbar.css`. **Không nơi nào khác** — kể cả CSS đặt cạnh component, kể cả class
Tailwind dạng `[scrollbar-width:thin]`. Test chặn.

## ⛔ Bẫy 2 — Tailwind ≥ 4.3 có utility `scrollbar-thin` / `-auto` / `-none`

`package.json` ghi `^4.2.1` nên `npm install` kéo bản mới. Từ 4.3 Tailwind tự sinh
`.scrollbar-thin { scrollbar-width: thin }` — **trùng tên** với class cũ của app và kích hoạt đúng Bẫy 1.

Đo thật (Chrome, `--scrollbar-size: 23px` để phân biệt custom với native): phần tử mang class
`scrollbar-thin` ra **10px (native)** thay vì 23px (custom) — trước khi có reset.

**Luật:** `utilities/scrollbar.css` giữ khối reset `.scrollbar-thin { scrollbar-width: auto }` làm lưới
an toàn; code mới **không dùng** class này (test chặn). Reset CHỈ trung hoà `scrollbar-thin` —
đừng thêm `scrollbar-none` vào đó (nó mang nghĩa "ẩn", reset là phá ý người viết).

## ⛔ Bẫy 3 — Safari cũng nhận `-moz-appearance`

`@supports (-moz-appearance: none)` **không** có nghĩa "chỉ Firefox": theo ghi nhận của dự án gốc
`vci-sun-pms-fe`, WebKit (Safari 15.4+) coi nó như alias của `appearance`. Khối Firefox vì thế đổ luôn
vào Safari 18.2+ (đã hiểu `scrollbar-width`) → lại rơi vào Bẫy 1.
⚠️ Bẫy này kế thừa từ dự án gốc, **chưa được tái hiện trên Safari thật ở repo này** — nhưng điều kiện
thêm vào vô hại với Chromium/Firefox nên giữ.

**Luật:** điều kiện Firefox luôn viết đủ
`@supports (-moz-appearance: none) and (not (-webkit-hyphens: none))`
(`-webkit-hyphens` chỉ Safari có). Mọi nơi dùng điều kiện này phải đổi **cùng lúc** — test chặn thiếu vế `not`.

## `color-scheme` — lưới an toàn

`base/document.css` khai `color-scheme: light` trên `html` và `dark` trên `html.dark`. Nó quyết định màu của
mọi widget trình duyệt tự vẽ mà CSS app không với tới (thanh cuộn native, `<select>`, date picker, spinner
số). Thiếu nó, lúc thanh cuộn custom bị vô hiệu thì thứ rơi về native là thanh cuộn **trắng** trên nền tối.
Chi tiết: `font-system.md` §"Độ nét chữ".

## Bề rộng phải CỐ ĐỊNH, không đổi theo `:hover`

`--scrollbar-size` (10px) là **vùng chạm** — chiếm chỗ thật trong content box. Bề dày *nhìn thấy* của thumb
do `--scrollbar-thumb-inset` (viền trong suốt) quyết định: nghỉ → mảnh, rê vào → dày. Nhờ vậy đổi được hình
dạng mà không đổi bề rộng rãnh ⇒ không reflow. Đổi bề rộng theo hover là mọi vùng cuộn co giãn khi rê chuột,
và chỗ nào đo container để vẽ (biểu đồ dùng `ResizeObserver`) sẽ nhảy vòng lặp.

## Cuộn trên máy chạm

`base/touch.css` (chỉ trong `@media (hover: none) and (pointer: coarse)`) đặt `overscroll-behavior: contain`
để vùng cuộn nuốt đà vuốt của chính nó. **CHỈ contain TRỤC CÓ CUỘN** (`-y` cho `overflow-y-*`, `-x` cho
`overflow-x-*`), KHÔNG dùng shorthand: dải chip vuốt ngang cũng là scroll container theo trục dọc, shorthand
sẽ nuốt luôn cú vuốt dọc đặt trên dải đó → "không cuộn xuống được". Chi tiết: `ipad-responsive.md`.

**Thanh cuộn máy chạm rộng 0.** Cũng trong `@media (hover: none) and (pointer: coarse)`, `base/scrollbar.css` đặt
`*::-webkit-scrollbar { width: 0; height: 0 }`: iOS / Android vẽ thanh cuộn NỔI (không chiếm chỗ, chỉ hiện lúc vuốt),
còn thanh cổ điển 10px mà DevTools chế độ thiết bị và vài WebView vẽ làm `<main>` mất 10px bên phải → mép thẻ lệch khỏi mép
header. Cuộn vẫn chạy bằng vuốt. ⛔ Dùng `width` / `height` của `::-webkit-scrollbar`, KHÔNG `scrollbar-width: none` (Bẫy 1:
thuộc tính chuẩn làm Blink bỏ qua toàn bộ `::-webkit-scrollbar*`). Laptop màn cảm ứng (`pointer: fine`) giữ thanh 10px.
Hệ quả: `[scrollbar-gutter:stable]` ở máy chạm không chừa gì — đừng dựa vào nó để căn lề.

**`:hover` của thumb bọc `@media (hover: hover)`**: trên máy chạm `:hover` dính lại sau cú chạm
(`ipad-responsive.md §7`) nên thumb kẹt ở trạng thái "đang rê" nếu để trần.

## Tự kiểm khi sửa

Test chỉ đọc CSS, **không thay được trình duyệt**. Sau khi sửa thanh cuộn:

1. Chrome/Edge — trong DevTools đặt `--scrollbar-size: 23px` lên một vùng cuộn, rồi đo
   `el.offsetWidth - el.clientWidth`. Ra `23` = thanh cuộn custom đang chạy; ra số khác = đã rơi về native.
2. Firefox và Safari — nhìn bằng mắt: thanh mảnh, tông lạnh, không trắng. (Chưa có kiểm tự động cho hai trình duyệt này.)

## Rào chắn tự động

`tests/policy/styling/css-structure.test.ts` → nhóm "thanh cuộn": `scrollbar-width`/`scrollbar-color` chỉ trong hai file ·
`@supports (-moz-appearance)` luôn kèm `not (-webkit-hyphens)` · còn reset `.scrollbar-thin` ·
code không dùng `scrollbar-thin` hay `[scrollbar-width:…]`/`[scrollbar-color:…]`.
`tests/policy/display/responsive-foundation.test.ts` → thanh cuộn rộng 0 ở máy chạm, `:hover` tay bọc `(hover: hover)`.

## Liên quan

`css-architecture.md` · `ipad-responsive.md` · `font-system.md` · `notes/components/layout.md`.

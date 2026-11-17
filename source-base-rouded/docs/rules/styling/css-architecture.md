# CSS Architecture Rules

> Tailwind-first (`tailwind-conventions.md`): CSS thuần là **ngoại lệ**. File này
> quy định NGOẠI LỆ ĐÓ nằm ở đâu, để CSS không dồn lại thành một file nghìn dòng.

## Nguyên tắc

1. **Mỗi file CSS có MỘT mối quan tâm, và tên file nói đúng nó làm gì**
   (`scrollbar.css`, `touch.css`, `autofill.css` — không `misc.css`/`common.css`/`fixes.css`).
2. **`src/styles/globals.css` là entry CSS toàn cục DUY NHẤT — `src/main.tsx` import nó trước mọi
   module khác; chỉ có `@import` và `@source`, KHÔNG viết rule.** Không có entry thứ hai
   (không tạo `src/index.css`). CSS riêng của một component / layout do chính nó import (mục dưới).
3. **Thư mục quyết định TẦNG cascade.** Biết file nằm ở đâu là biết nó thắng/thua ai.
4. **Chỉ viết CSS thuần khi Tailwind không diễn đạt được**: `@keyframes`, `@property`,
   pseudo-element của trình duyệt (`::-webkit-scrollbar`), `@supports`, biến `:root`,
   thân `html`/`body`, CSS của thư viện bên thứ ba. Còn lại → class Tailwind trong `*_CLASSES`.

## Bản đồ `src/styles/`

| Thư mục / file | Tầng cascade | Chứa gì |
|---|---|---|
| `globals.css` | — | Entry: `@import` theo thứ tự + `@source` |
| `theme/colors-theme.json` → `generated-colors.css` | `@theme` + `:root`/`.dark` | Token màu — **sinh tự động** |
| `font/font.json` → `generated-font.css` | `@utility` | Token chữ — **sinh tự động** |
| `theme/breakpoints.css` | `@theme` | Mốc bề rộng riêng (`3xl`, `wide` = 1800px) — thang bậc: `responsive-screens.md §2.1` |
| `theme/animations.css` | `@theme` + `@keyframes` + `@property` | Token `--animate-*` và keyframe dùng chung |
| `theme/radius.css` | `@theme` | Thang bo góc `--radius-xs … 2xl` (4 → 20px) của theme sáng; `base/root-vars.css` đưa về 0 dưới `.dark` (`tailwind-conventions.md` §"Bo góc") |
| `theme/variants.css` | `@custom-variant` | `dark:` · `tv:` · `touch:` · `phone:` · `standalone:` — mỗi biến thể trả lời MỘT câu hỏi (`responsive-screens.md §2.2`) |
| `base/reset.css` | `@layer base` | `box-sizing`, `#root` |
| `base/root-vars.css` | `@layer base` | Biến `:root`: `--ui-scale`, `--safe-*`, `--fw-*`, font stack; `.dark` đặt mọi `--radius-*` = 0 (HUD vuông) |
| `base/document.css` | `@layer base` | `html`/`body`: `color-scheme`, pipeline vẽ chữ, nền gốc, màu bôi đen chữ `::selection` (nền `primary-2` + chữ `primary-9`) |
| `base/touch.css` | `@layer base` | Nền máy chạm, TOÀN BỘ trong `@media (hover: none) and (pointer: coarse)`: `overscroll-behavior` cho mọi vùng cuộn (điện thoại nhả trục dọc), chặn rubber-band của `html` / `body`, `touch-action: manipulation` cho control bấm được (`ipad-responsive.md §4`) |
| `base/phone.css` | `@layer base` | Biến `:root` đổi theo màn ĐIỆN THOẠI (cùng điều kiện `phone:`): thu bốn bậc chữ hiển thị `h1–h4` qua `--fs-*` / `--lh-*` (`responsive-screens.md §3.1`) |
| `base/scrollbar.css` | `@layer base` | Thanh cuộn mặc định toàn app → `scrollbar.md` |
| `utilities/scrollbar.css` | `@layer utilities` | `.scrollbar-muted`, `.scrollbar-hidden` + reset `.scrollbar-thin` |
| `utilities/rim-light.css` | `@layer utilities` | Viền bắt sáng kiểu macOS, CHỈ theme sáng: `.rim-glass` (kính trên nền màu) · `.rim-tile` (mặt màu đặc) · `.rim-soft` (thẻ trắng có viền) — khi nào dùng: `light-theme.md` §7 |
| `overrides/*.css` | **KHÔNG layer** | Đè CSS thư viện / UA stylesheet / trạng thái toàn trang (`recharts.css`, `splitter-drag.css`, `autofill.css`, `table-inline-edit.css` — control phẳng trong bảng nhập liệu) |
| `modes/tv.css` | `@layer base` **và** không layer | Chế độ TV → `tv-display-mode.md` |

## Thêm CSS mới — đặt vào đâu?

```
Là token màu / cỡ chữ?                  → sửa JSON, chạy `npm run generate:styles` (KHÔNG sửa file generated)
Là mốc breakpoint?                      → theme/breakpoints.css
Là animation dùng chung (token+keyframe)→ theme/animations.css
Là variant mới (`xxx:`)                 → theme/variants.css
Là reset / biến :root / html / body?    → base/<tên-mối-quan-tâm>.css  (trong @layer base)
Là class chọn theo tên mà Tailwind
  không có?                             → utilities/<tên>.css  (trong @layer utilities)
Phải THẮNG utility, hoặc đè class do
  thư viện sinh ra?                     → overrides/<tên-thư-viện>.css  (KHÔNG layer, ghi lý do)
Là chế độ hiển thị gắn class lên <html>?→ modes/<tên>.css
Chỉ của MỘT component / layout, Tailwind
  không biểu đạt được?                  → file .css ĐẶT CẠNH component, import trong chính nó
                                          (mẫu: widgets/dock/dock-magnify.css,
                                          app/layouts/app-shell-layout.css)
```

Tạo file mới trong `styles/` → thêm `@import` vào `globals.css` **đúng vị trí** (xem dưới). File
không được import thì CSS KHÔNG BAO GIỜ chạy mà không có lỗi nào báo — test chặn việc này.

**CSS cạnh component** KHÔNG `@import` vào `globals.css`: component `import './xxx.css'` ngay trong file
của nó, nên CSS chỉ vào bundle cùng component. Rule phải THUA utility gắn cùng phần tử thì bọc trong
`@layer components { … }` — thứ tự layer do `tailwindcss` khai ở đầu `globals.css`, mà `main.tsx`
nạp `globals.css` trước mọi component, nên file nạp sau vẫn vào đúng tầng. Có docblock đầu file như mọi
file CSS khác; màu chỉ qua `var(--color-*)`.

File cạnh component có `color-mix(…)` thì mở đầu bằng `@reference '<đường tương đối>/styles/globals.css';`
(mẫu: `app/layouts/app-shell-layout.css`). File CSS không có cú pháp Tailwind thì `@tailwindcss/vite`
bỏ qua, nên KHÔNG sinh fallback `@supports (color: color-mix…)` như CSS đi qua `globals.css`;
`@reference` bật lại pipeline đó mà không xuất thêm rule nào (đã so CSS build: tầng `components`
giống từng byte với khi file còn `@import` qua entry).

## Responsive — khai ở đâu

Chọn gate nào cho việc gì: `responsive-screens.md` (nguồn duy nhất). Chỗ ĐẶT CSS:

| Cần | Đặt ở | Ghi chú |
|---|---|---|
| Biến thể mới (`xxx:`) | `theme/variants.css` | Docblock trả lời MỘT câu hỏi. Từ hai `@media` trở lên viết dạng KHỐI + `@slot` — dạng gọn `(@media A, B)` bị tách theo dấu phẩy thành selector rác |
| Mốc bề rộng mới | `theme/breakpoints.css` | Gần như không bao giờ cần: thang `sm … wide` đủ chia 7 nhóm máy; thêm mốc là sửa cả `responsive-screens.md §2.1` |
| Hành vi cuộn / chạm TOÀN CỤC cho máy chạm | `base/touch.css` | Trong `@layer base` VÀ `@media (hover: none) and (pointer: coarse)` — thứ đặt ngoài media query này đụng cả laptop (rubber-band, vuốt-lùi-trang của macOS) |
| CSS tay riêng của một component ở máy chạm / điện thoại | file `.css` cạnh component | Bọc đúng media query của biến thể (chép điều kiện từ `variants.css`); `:hover` tay bọc `@media (hover: hover) and (pointer: fine)` (`ipad-responsive.md §7`) |

⛔ KHÔNG viết `@media (max-width: …)` mốc tuỳ ý trong CSS tay — dùng điều kiện của biến thể đã khai, để CSS và
`useMediaQuery` / `PHONE_MEDIA_QUERY` không nói hai chuyện khác nhau.

## ⛔ Thứ tự import = thứ tự cascade — đừng sắp xếp lại cho "gọn"

```
tailwindcss → generated-colors → generated-font → theme/ → base/ → utilities/ → overrides/ → modes/
```

- `tailwindcss` đứng ĐẦU: nó khai thứ tự layer `theme, base, components, utilities`.
- Token sinh tự động đứng trước `theme/` để `@theme` của app thấy được biến màu.
- `@source` đặt SAU các `@import` (cú pháp CSS yêu cầu `@import` đi trước). `source(none)`
  tắt tự quét của Tailwind — nếu không nó duyệt cả `.claude/`, `docs/` và nhặt chuỗi như
  `[file:line]` thành class.

## ⛔ Layer: vì sao `base/` và `overrides/` khác nhau

Cascade layer thắng theo **thứ tự layer TRƯỚC, specificity SAU**:

```
KHÔNG layer  >  @layer utilities  >  @layer base
```

- Rule trong `@layer base` **thua** mọi utility Tailwind (`.p-4`…) dù selector cụ thể hơn.
  Đúng ý với reset/biến gốc — sai ý với thứ cần ghi đè utility.
- Rule KHÔNG layer **thắng** mọi layer. Dùng khi cố ý: thu padding ở TV
  (`.tv .p-4`), con trỏ đang kéo splitter, gỡ viền focus của Recharts.
- Vì thế: `base/` toàn bộ trong `@layer base`; `utilities/` toàn bộ trong `@layer utilities`;
  `overrides/` **không** có `@layer`. Đặt nhầm là đổi ai thắng ai một cách im lặng.

## Docblock đầu file

Mỗi file bắt đầu bằng một khối chú thích ngắn: **file làm gì · đừng đặt gì ở đây · đọc rule nào
trước khi sửa**. Bẫy trình duyệt, lý do chọn con số, bài học từ lỗi đã gặp → ghi ngay cạnh dòng
liên quan (CSS không có test đọc hiểu như TS — comment là thứ duy nhất ngăn người sau "dọn" mất).
Lý do dài hơn một đoạn → đưa vào `docs/rules/` và trỏ tới.

## Autofill — màu nền mặc định của trình duyệt (`overrides/autofill.css`)

Khi ô nhập được tự điền, Chrome/Edge tô nền xanh xám `rgba(70 90 126 / .4)` (Safari: vàng) bằng
`background-color` + `!important` trong UA stylesheet. `!important` của UA thắng mọi khai báo của app,
nên **không có `background-color: …` nào đè được** — chỉ còn cách trì hoãn chuyển màu 5000s.

Đo bằng autofill THẬT trên Chrome 154 (CDP `Autofill.trigger`), ô trong suốt trên khung `#0F2438`,
ô có nền riêng `#0b2a47`, ô có utility `transition-colors`:

| Cách làm | Ô trong suốt | Ô có nền riêng | Ô có `transition-colors` |
|---|---|---|---|
| Không làm gì (UA mặc định) | ✗ xanh xám | ✗ xanh xám | ✗ xanh xám |
| `box-shadow` phủ `--color-bg-input` *(bản cũ)* | ✓ nếu khung cũng là `bg-input` | ✗ **bị đổi sang `#0F2438`** | ✓ (do phủ) |
| Chỉ trì hoãn, đặt trong `@layer base` | ✓ | ✓ | ✗ **utility thắng → màu UA rò ra** |
| **Chỉ trì hoãn, KHÔNG layer** *(hiện tại)* | ✓ | ✓ giữ nguyên nền gốc | ✓ |

- ⛔ **Không dùng `box-shadow` phủ màu cứng** — nó thay nền riêng của ô bằng một màu đoán.
- ⛔ **Phải KHÔNG layer** — vì thế file ở `overrides/`, không phải `base/`. Rule chỉ khớp lúc ô đang autofill nên không
  đụng transition bình thường.
- ⚠️ Chưa kiểm trên Safari và Firefox (`:autofill`). Không thêm code riêng cho hai trình duyệt đó khi chưa nhìn thấy lỗi thật.
- ⛔ `FIELD_CONTROL_CLASS` (`inputs/field.theme.ts`) KHÔNG mang utility `autofill:[…]` nào — rule global ở đây đã lo
  transition + chữ; utility `box-shadow` phủ `bg-input` cũ làm ô đặt trên khung KHÁC `bg-input` hiện khối `bg-input`
  (`tests/shared/ui/actions-inputs.test.tsx` chặn quay lại).

## Đã gỡ — đừng khai lại

| Thứ | Vì sao | Thay bằng |
|---|---|---|
| `.num-mono` / `.num-mono-light` | Ép JetBrains Mono cho mọi số → số và chữ cùng dòng chạy hai hệ chữ, nhoè ở 10–12px; khoá cứng `font-weight` | `tabular-nums` — `visual-hierarchy.md §3.3` |
| `[data-thatopen-logo]`, `.mapboxgl-ctrl-bottom-left` | Ghi đè CSS thư viện mà dự án này không dùng | Khi thêm thư viện, tạo `overrides/<thư-viện>.css` |

## Rào chắn tự động

`tests/policy/styling/css-structure.test.ts` chặn:

- `globals.css` có rule (chỉ được `@import`/`@source`) · `tailwindcss` không đứng đầu
- file `.css` trong `styles/` mồ côi (không được import) hoặc `@import` trỏ vào hư không
- `base/` / `utilities/` có khối ngoài layer của nó · `overrides/` có `@layer` · `theme/` có rule thường
- vi phạm `scrollbar.md` · thiếu `color-scheme` · `index.html` thiếu trục `opsz` của Inter
- `overrides/autofill.css` quay lại dùng `box-shadow` phủ màu, hoặc mất trì hoãn chuyển màu

`tests/policy/display/responsive-foundation.test.ts` chặn (nền responsive):

- `@custom-variant phone` viết dạng gọn `(@media A, B)` thay vì khối + `@slot`; bản JS (`media-query.constants.ts`) lệch
  điều kiện CSS; mốc `wide` / `3xl` bị đổi hoặc thêm mốc mới
- `touch-action` / `overscroll-behavior: none` nằm NGOÀI `@media (hover: none) and (pointer: coarse)` của `base/touch.css`
- CSS tay có `:hover` mà thiếu `@media (hover: hover)` bao ngoài · `h-screen` / `100vh` cho khung toàn màn

`tests/policy/display/responsive-docs.test.ts` giữ tài liệu khớp CSS (mốc, điều kiện `phone:`, mọi biến thể có trong bảng).

⚠️ Test đọc CSS qua `import.meta.glob(..., { query: '?raw' })`. Vitest coi mọi id `*.css` là CSS và
thay bằng chuỗi rỗng khi `test.css: false` → `vite.config.ts` khai `css: { include: [/\.css\?raw$/] }`
để lấy lại nội dung thật. Đừng đổi lại thành `css: false`: test vẫn xanh nhưng đọc về `""`, mọi
phép kiểm pass giả (test đầu tiên trong file đó chốt chuyện này).

## Checklist trước khi commit CSS

- [ ] File mới có docblock + được `@import` đúng vị trí
- [ ] Đúng thư mục ↔ đúng tầng layer
- [ ] Không hex màu — dùng `var(--color-*)` (`color-system.md`)
- [ ] Không `scrollbar-width` / `scrollbar-color` ngoài hai file thanh cuộn (`scrollbar.md`)
- [ ] `npm run check` xanh (`quality-gates.md`)

## Liên quan

`tailwind-conventions.md` (Tailwind-first) · `scrollbar.md` · `font-system.md` §"Độ nét chữ" ·
`tv-display-mode.md` · `ipad-responsive.md` · `responsive-screens.md` · `documentation-management.md`.

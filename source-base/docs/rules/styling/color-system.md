# Color System Rules

## Nguyên tắc tối cao

**KHÔNG BAO GIỜ sử dụng màu hardcode** (hex, rgb, rgba, hsl) trong code.
**CHỈ sử dụng** Tailwind CSS classes từ color tokens đã được generate.

Nguồn duy nhất: `src/styles/theme/colors-theme.json` → `npm run generate:colors` sinh
`generated-colors.css` + `src/shared/theme/colors.generated.ts` (⛔ không sửa tay hai file này).

> Tailwind **im lặng bỏ qua** class màu không tồn tại: gõ `text-fg-1` (tên cũ) thì chữ mất màu mà
> không có lỗi build/lint nào. `tests/policy/styling/color-tokens.test.ts` chặn việc đó — class / `var(--color-…)`
> trỏ tới token không có, hoặc dùng tên đã xoá, là test đỏ.

## Cấu trúc file `colors-theme.json`

File viết tay theo dạng GỌN (Prettier bỏ qua file này — `.prettierignore`). Bốn nhóm:

| Nhóm | Chứa | Ví dụ |
|---|---|---|
| `ramps` | Thang màu theo họ, **giống hệt ở cả hai theme**. Mỗi họ một mảng, **VỊ TRÍ = BẬC** (phần tử đầu là bậc 1), `null` = họ không có bậc đó | `"primary": ["#EBFDF0", …]` |
| `alias` | Tên khác của một họ trong `ramps`: một nguồn giá trị, hai tên | `"success": { "of": "green", "steps": [2, 5, 6, 7, 8] }` |
| `shared` | Một màu dùng chung cả hai theme (không thuộc thang) | `"ring-focus": "#22C55E"` |
| `theme` | Token **khác nhau theo theme**, mỗi key một cặp `[light, dark]` | `"bg-surface": ["#FFFFFF", "#021A36"]` |

Quy tắc giữ file gọn (máy kiểm trong `tests/policy/styling/color-tokens.test.ts`):

- Token có giá trị **giống hệt** ở light và dark → đặt ở `shared`, KHÔNG đặt ở `theme`
  (riêng thang `neutral-*` nằm ở `theme` để thang đọc liền một khối).
- Một màu chỉ có **một** nguồn giá trị. Cần thêm một tên khác cho cùng màu → `alias`, đừng chép hex.
- Mỗi key phải có nơi dùng (class, `var(--color-…)`, chuỗi token) hoặc nằm trong `dynamicReach()` của
  test — token mồ côi là test đỏ. Bản trước có 327 key thì 99 key không ai dùng.
- Sửa mảng `ramps`: **đếm vị trí**. Chèn một phần tử vào giữa là dịch bậc của cả phần sau (`primary-5`
  thành màu của bậc 4). Thêm/xoá bậc ở giữa thì dùng `null` thay vì xoá phần tử.

## Quy ước đặt tên token

```
<thuộc tính>-<vai trò>[-<trạng thái>]     thuộc tính: bg · fg · border · divider · shadow
```

- Tên nói **vai trò**, không nói số thứ tự: `border-strong`, không phải `border-2`.
- Tên mang thuộc tính (`bg-…`, `border-…`) vì Tailwind chỉ có MỘT namespace màu — nền và viền của
  cùng một vai trò có thể khác màu (`bg-input` ≠ viền input) nên key phải tự phân biệt. Hệ quả là class
  bị lặp tiền tố: `bg-bg-surface`, `border-border-default`, `text-fg-body`. Đó là chủ ý, không phải lỗi.
- Vai trò chạy xuyên nhiều thuộc tính (nền + chữ + viền cùng một màu) thì để tên trần:
  `success` `error` `warning` `info` `link` `action-base` `action-accent` `ring-focus`.
- **Dùng key chung khi vai trò chung** (`border-default` cho mọi viền mặc định). **Chỉ thêm key riêng
  cho component** khi nó cần màu khác và phải đổi được độc lập (`bg-input`, `bg-dialog`, `bg-popup`
  đã có vì lý do đó). Ô nhập hiện dùng chung `border-default` (hover `primary-5/60`, focus `primary-5`); muốn
  tách viền ô nhập thì thêm `border-input` vào `theme` rồi đổi `field.theme.ts`.

## Available Color Tokens

### Thang màu (`ramps` + `alias`) — class: `bg-primary-5`, `text-teal-6`, `border-red-5`

**Bậc nào không có trong bảng thì KHÔNG tồn tại** (vd `bg-primary-10`, `text-gray-5`, `bg-lime-5` đều
không ra màu). Số 1 nhạt nhất → 9 đậm nhất.

| Họ | Bậc có | Ghi chú |
|---|---|---|
| `primary` | 1–8 | ⚠️ là **XANH LÁ** (`-5` = `#22C55E`, màu thương hiệu), không phải cyan |
| `secondary` | 4–8 | cyan |
| `sky` `red` `green` `yellow` | 1–9 | |
| `blue` | 1–8 | |
| `purple` | 1–8 | |
| `indigo` `teal` `pink` | 2–8 | |
| `orange` | 2–9 | |
| `azure` | 3–8 | |
| `fuchsia` | 2–6, 8 | không có `-7` |
| `neutral` | 0, 1, 3–10 | tách theo theme, KHÔNG dùng cho chữ trên nền trang (xem dưới) |
| `black` | 5, 6 | đen trong suốt 50% / 60% (`shared`) |

**Alias** — cùng màu, tên theo ý nghĩa. Dùng tên nào cũng ra cùng một mã hex:

| Alias | = họ | Bậc có |
|---|---|---|
| `success-N` | `green-N` | 2, 5–8 |
| `error-N` | `red-N` | 2, 5–8 |
| `info-N` | `blue-N` | 5–8 |
| `warning-N` | `orange-N` | 5, 6, 7, 9 |
| `accent-N` | `yellow-N` | 2, 5–9 |
| `hud-N` | `sky-N` | 4–6 |

**`hud-N` = màu KHUNG của giao diện điều hành** (viền nghỉ, ngoặc góc, ray sáng, vạch ngăn, dấu `//` tiêu đề, mặt rọi).
**Phân vai bắt buộc:** khung / trang trí → `hud-*`; tương tác + trạng thái đang bật (rê, focus, chọn, nút chính, tab đang mở)
→ `primary-*` (xanh lá chủ đạo). Trộn hai vai (khung xanh lá) làm mắt không phân biệt được trang trí với thứ đang chọn.
Đổi sắc khung toàn app: sửa MỘT dòng `alias.hud` trong `colors-theme.json`.

Dùng tên **trạng thái** (`success`, `error`…) khi màu mang ý nghĩa trạng thái; dùng tên **sắc**
(`green`, `red`…) khi chọn màu trang trí (prop `tone` / `color` của `GemIcon`, `SummaryPill`…).

⛔ **KHÔNG dùng `neutral-*` cho MÀU CHỮ trên nền của trang.** Chữ dùng `text-fg-*` — chúng tự lật khi
đổi theme, còn `text-neutral-6` thì đứng yên nên sáng lên là mất hút. Xem `text-contrast.md §2.1` cho
ngoại lệ duy nhất (chữ trên nền màu ĐẶC: `text-neutral-0`).

```tsx
className = 'text-fg-muted'; // ✅ chữ mờ (muted)
className = 'text-neutral-6'; // ❌ không lật theo theme
```

### Trạng thái & hành động (`theme`) — class: `text-error`, `bg-success`, `border-warning`

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `success` | `#00B85E` | `#00E676` | Thành công · đạt · đã duyệt |
| `warning` | `#D66900` | `#FC820A` | Cảnh báo · chờ xử lý · sắp hạn |
| `error` | `#DC2A38` | `#FF424E` | Lỗi · quá hạn · thất bại |
| `info` | `#0D74CC` | `#1A94FF` | Thông tin trung tính |
| `link` | `#15803D` | `#4EDE82` | Hyperlink · mục đang chọn trong thanh điều hướng |
| `action-base` | `#15803D` | `#4EDE82` | Màu hành động của `Button` (viền / chữ) — cố ý tách khỏi `link` dù hiện cùng giá trị |
| `action-accent` | `#B37F00` | `#FFCB33` | Màu hành động nhấn của `Button` |

Nền nhạt cho badge / alert: dùng modifier opacity của Tailwind trên thang, **không** có token riêng —
theo công thức của `Badge` / `Callout`: `bg-success-5/12 text-success-8 dark:text-success-5` (Callout: `bg-success/8 border-success/25`) (xem `color-usage-guide.md` §6). (Các key `bg-success`, `bg-primary`… dạng "nền nhạt" của bản cũ
đã xoá; riêng `bg-primary-soft` còn lại cho vầng sáng `shadow-[inset_…_var(--color-bg-primary-soft)]`.)

### Bề mặt (nền)

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `bg-page` | `#EEF3F7` | `#00112A` | Nền trang (`RootLayout`) |
| `bg-surface` | `#FFFFFF` | `#021A36` | Nền card / panel / thân bảng |
| `bg-subtle` | `#F5F9FC` | `#062649` | Nền chìm: header bảng, callout, track. Hover dòng → `bg-nav-hover`, nút trung tính → `bg-pressed` (tối: `bg-subtle` gần trùng `bg-dialog`, hover trong hộp thoại vô hình) |
| `bg-pressed` | `#E8EFF5` | `#0B3563` | Đang nhấn / đang chọn (`active:`, ô segment được chọn), nền avatar mặc định |
| `bg-track` | `#D6E1EC` | `#14477D` | Rãnh thanh tiến độ |
| `bg-popup` | trắng 98% | `rgba(4,31,64,.97)` | Dropdown · tooltip · popover |
| `bg-input` / `bg-input-hover` | `#FFF` / `#F5F9FC` | `#011632` / `#000F26` | Nền ô nhập / khi rê chuột |
| `bg-dialog` / `bg-dialog-raised` | `#FFF` / `#F5F9FC` | `#05223F` / `#0B3159` | Nền hộp thoại / vùng nổi (đầu, chân) |

### Viền · vạch ngăn · bóng

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `border-default` | `#DDE6EF` | `#1B4C83` | Viền mặc định (card, input, toolbar) |
| `border-strong` | `#B8C9DB` | `#2C70B8` | Viền đậm / khi hover (nút viền, panel ngoài cùng) |
| `divider-default` | `#E2E8F0` | `#0E3263` | Vạch ngăn mặc định (`<Divider>`, bảng, form) |
| `divider-strong` | `#CBD5E1` | `#174684` | Vạch ngăn đậm |
| `divider-soft` | navy 8% | xanh dương nhạt 10% | Vạch rất nhạt (viền ô bảng kiểu `soft`) |
| `border-popup` | `#DDE6EF` | xanh khung (`sky`) 36% | Viền popup |
| `shadow-popup` | navy 8% | đen navy 65% | Màu bóng đổ của popup |
| `divider-nav` | `#E2E8F0` | xanh khung (`sky`) 28% | Vạch ngăn trong thanh điều hướng |

### Chữ (`fg-*`) — class: `text-fg-heading`…

| Token | Light | Dark | Dùng cho |
|---|---|---|---|
| `fg-heading` | `#04162A` | `#FFFFFF` | Tiêu đề chính · số KPI · nhãn quan trọng |
| `fg-subheading` | `#1F2E45` | `#EAF4FF` | Tiêu đề phụ · nhãn form |
| `fg-body` | `#334155` | `#D9E8F8` | Nội dung · mô tả |
| `fg-muted` | `#64748B` | `#A9C2DE` | Gợi ý · metadata · nhãn trục chart |
| `fg-faint` | `#94A3B8` | `#8AA3C4` | Rất mờ · placeholder · disabled |
| `fg-inverse` | `#FFFFFF` | `#04162A` | Chữ trên nền đảo |
| `fg-on-chrome` / `fg-on-chrome-muted` | `#04162A` / `#475569` | `#F2F9FF` / `#A9C2DE` | Chữ trong nav / popup / dialog (và bản mờ) |
| `fg-on-nav-muted` / `fg-on-nav-subtle` | `#334155` / `#64748B` | `#A9C2DE` / `#8AA3C4` | Chữ phụ riêng cho header/nav |

Chi tiết cấp bậc chữ → `text-contrast.md`.

### Thanh điều hướng / header / chung

```tsx
// Nav:    bg-nav-hover · bg-nav-active · divider-nav          (xanh lá trong suốt, tự đổi theo theme)
// Header: bg-header-from · bg-header-to                       (gradient header — CHỈ theme tối; sáng dùng bg-surface)
// Chung:  ring-focus (vòng focus) · black-5 · black-6 (đen trong suốt cho tooltip / text-shadow)
```

> **Toast, button, table cell KHÔNG có token riêng.** Chúng lấy màu qua bảng
> `*_CLASSES` của `<Toast>` / `<Button>` / `<Table>` từ chính các token ở trên.
> Cần đổi màu chúng → sửa đúng ô trong bảng (`BUTTON_SKIN_CLASSES[skin][variant]`),
> KHÔNG thêm token mới. Quy ước bảng: `component-structure.md §2`.

### Đổi tên (2026-10) — bảng tra cho nhánh / ghi chú cũ

| Cũ | Mới | | Cũ | Mới |
|---|---|---|---|---|
| `bg-base` | `bg-page` | | `fg-1` … `fg-5` | `fg-heading` · `fg-subheading` · `fg-body` · `fg-muted` · `fg-faint` |
| `bg-1` | `bg-surface` | | `fg-on-nav` · `fg-on-popup` · `fg-on-dialog` | `fg-on-chrome` |
| `bg-2` | `bg-subtle` | | `fg-on-popup-muted` · `fg-on-dialog-muted` | `fg-on-chrome-muted` |
| `bg-3` | `bg-pressed` | | `fg-on-nav-accent` | `link` |
| `bg-4` | `bg-track` | | `popup-border` · `popup-shadow` | `border-popup` · `shadow-popup` |
| `bg-input-2` | `bg-input-hover` | | `nav-divider` | `divider-nav` |
| `bg-dialog-2` | `bg-dialog-raised` | | `nav-hover-bg` · `nav-active-bg` | `bg-nav-hover` · `bg-nav-active` |
| `border-1` · `border-2` | `border-default` · `border-strong` | | `header-from` · `header-to` | `bg-header-from` · `bg-header-to` |
| `divider-1` · `divider-2` | `divider-default` · `divider-strong` | | `brand` | `primary-5` |
| `divider-white-10` | `divider-soft` | | `white-10` | `neutral-0` |
| `bg-primary` | `bg-primary-soft` | | | |

Đã **xoá** (không ai dùng): họ `gray` `lime` `emerald`, `white-1…9`, mọi `-10` trừ `neutral-10`, nền nhạt
`bg-secondary/accent/indigo/purple/teal/fuchsia/pink/azure/info/neutral/orange/success/warning/error`,
`bg-nav` `bg-chart`, `nav-from` `nav-to` `nav-border` `nav-shadow-inset` `header-border`,
`divider-primary` `divider-blue-*` `divider-white-20`, `disabled-1` `disabled-2`, `overlay`.

## Ngoại lệ — khi mã hex KHÔNG phải là vi phạm

Luật "cấm hex" nói về **màu của giao diện**: thứ phải lật khi đổi theme và phải
đổi theo khi bảng màu đổi. Có ba loại hex nằm ngoài phạm vi đó — chặn chúng chỉ
tạo cảnh báo giả và làm người review mất niềm tin vào luật.

| Loại | Ví dụ trong base | Vì sao không phải màu giao diện |
|---|---|---|
| **Hex là DỮ LIỆU người dùng chọn** | `ColorPalettePanel`, `ColorPickerField`, bảng màu chú thích ảnh | Ô màu trong bộ chọn màu CHÍNH LÀ giá trị người dùng sẽ lưu. Đổi nó sang token là đổi dữ liệu, không phải đổi giao diện |
| **Canvas 2D** | `image-annotator` | `ctx.fillStyle` không nhận `className`. Cần token thì đọc qua `getThemeColor()` rồi truyền chuỗi vào |
| **Màn che (scrim) cố ý độc lập theo theme** | `bg-black/45` ở `modal.theme.ts` | Lớp phủ tối sau hộp thoại phải TỐI ở cả hai theme. Token `bg-*` lật màu nên sẽ thành màn che trắng ở theme sáng |

⛔ Ba ngoại lệ này KHÔNG mở đường cho hex trong `className` hay `style` của
component thường. Dấu hiệu phân biệt: hex có bị GHI XUỐNG hoặc GỬI ĐI như dữ
liệu không? Có thì là dữ liệu. Không, nó chỉ dùng để tô — thì phải là token.

```tsx
// ✅ ĐÚNG — hex là giá trị người dùng chọn rồi lưu vào CSDL
const PRESET_COLORS = ['#06B6D4', '#22C55E'];

// ❌ SAI — hex chỉ để tô một cái viền
<div className="border-[#22C55E]" />
<div style={{ borderColor: '#22C55E' }} />

// ✅ ĐÚNG
<div className="border-primary-5" />
```

---

## Khi cần CSS variable trong JS/inline style

```tsx
// ✅ ĐÚNG — Dùng CSS variable
style={{ color: 'var(--color-primary-5)' }}
style={{ backgroundColor: 'var(--color-bg-page)' }}

// ✅ ĐÚNG — Dùng getThemeColor khi cần hex programmatically (charts, canvas)
import { getThemeColor } from '@/shared/utils/style/color.utils';
const chartColor = getThemeColor('primary-5');

// ❌ SAI — KHÔNG BAO GIỜ dùng hex trực tiếp
style={{ color: '#0F172A' }}
style={{ backgroundColor: '#fff' }}
```

### Ghép tên lúc chạy — `var(--color-${tone}-5)`

Vài component dựng tên token từ prop (`tone`, `family`, `step`). Grep không thấy các token này, nên
khi **thêm tone mới** hoặc **đổi bậc** phải làm đủ hai việc:

1. Bảo đảm họ đó có đủ các bậc component với tới trong `ramps` (`TitleScreen` dùng `-3…6`, `BoxInfo`
   dùng `-4…6` quanh bậc giữa, gradient chart dùng bậc token series + 1…2 bậc tối hơn (`tokenDarker`, series ở `-5…-7`), `SummaryPill` dùng `-5`).
2. Cập nhật `dynamicReach()` trong `tests/policy/styling/color-tokens.test.ts` — không thì test báo token mồ côi (khi
   xoá) hoặc báo thiếu bậc (khi thêm tone nhưng quên thêm bậc vào JSON).

## KHÔNG ĐƯỢC

```tsx
// ❌ SAI — Hardcoded colors
className="bg-white"
className="text-gray-500"
className="bg-[#F8FAFC]"
className="text-[#333]"
style={{ color: '#333' }}
style={{ backgroundColor: 'white' }}
style={{ borderColor: '#e2e8f0' }}

// ✅ ĐÚNG — Dùng color tokens
className="bg-bg-page"
className="text-fg-muted"
className="bg-bg-surface"
className="border-border-default"
```

---

## TV Display Mode — Chrome tương phán, series giữ nguyên

Ở TV (dark theme bắt buộc), chữ/nét chart (axis, legend, grid) cần tương phán cao hơn 
để đọc được từ 3m. **Chart series KHÔNG thay đổi màu sắc** (bảng màu đã chọn trong dải L an toàn — `chart-conventions.md` §1.2.1).

| Element | Desktop | TV | Lý do |
|---------|---------|-----|-------|
| Axis/legend/grid | `fg-muted` / `border-default` (mặc định) | `fg-subheading` / `border-strong` (vọc sáng hơn) | Nét mỏng bị "chìm" |
| Series (`seriesTokenAt`) | Giữ nguyên | Giữ nguyên (KHÔNG tăng saturation) | Đã qua validator ở cả hai theme; tăng bão hoà ở TV chỉ thêm bloom |

**Cơ chế tự động:** `buildChartStyles` (`@/shared/charts`) nhân cỡ chữ chart theo `uiScale`
(1.1–1.3) và đổi sang bộ chrome TV (`CHART_CHROME_TV`) → axis/legend/grid chữ to + đậm màu hơn = đủ
nổi. Bề dày lưới giữ 1px — KHÔNG thêm hằng bề dày riêng cho TV (`chart-conventions.md §10`).

**Token TV (ngoài scope color mà dùng qua `buildChartStyles`):**
- Axis label: `fg-muted` → `fg-subheading` (nâng tương phán chữ)
- Grid / đường trục: `border-default` → `border-strong` (đổi MÀU cho đậm hơn; bề dày nét do
  `scale.gridWidth` lo, nhân theo `uiScale` trong `buildChartStyles`)
- Legend: `fg-body` → `fg-heading` (emphasis trên TV)

---

## Màu CHART — nhóm token riêng

Bảng màu chart có hai phần, đều trong `colors-theme.json` và đều qua validator (`chart-conventions.md` §1.2.1):
- **Bậc có sẵn của ramp** — 8 slot series (`secondary-6` `orange-6` `purple-5` `pink-6` `primary-7` `indigo-6` `teal-6` `yellow-7`), trạng thái / kế hoạch–thực tế
  (`success-6` `info-5` `warning-5` `error-6`): chọn bằng TÊN token ở `chart-palette.constants.ts`, cùng hex ở hai theme vì cả hai dải L đều pass.
- **Token riêng `chart-*`** — chỉ khi một bậc không vừa cả hai theme hoặc không có sẵn: `chart-other` (xám "Khác", `shared`),
  `chart-seq-1…6` (sequential 1 hue `sky`, thấp → cao) và `chart-div-1…7` (diverging `blue` ↔ `red`, giữa xám), là cặp `[light, dark]` —
  bản dark CHỌN RIÊNG (đảo neo), không tự lật. Mọi hex `chart-*` phải trùng một hex có sẵn của ramps / token `neutral-*`
  (test `chart-palette-validator` kiểm "chỉ dùng bảng màu đã khai").
Thêm / đổi màu chart: quy trình 5 bước ở `chart-conventions.md` §1.2.1 (chọn bậc → validator → sửa constants → sửa số ghim test → chụp ảnh).

---

## Khi cần thêm / sửa / xoá màu

1. Sửa `src/styles/theme/colors-theme.json`:
   - màu theo họ (cả hai theme như nhau) → mảng trong `ramps`; thêm tên khác cho màu có sẵn → `alias`;
   - màu đổi theo theme → `theme` với cặp `[light, dark]`; giống hệt hai theme → `shared`.
2. Chạy `npm run generate:colors` (lỗi cấu trúc sẽ dừng lại và nói rõ key nào sai).
3. Chạy `npm test` — `tests/policy/styling/color-tokens.test.ts` báo: key khai trùng, key mồ côi, class trỏ tới token
   không có, file sinh ra lệch nguồn.
4. **KHÔNG BAO GIỜ** thêm màu trực tiếp vào CSS/TSX; **KHÔNG** đổi tên một token mà không chạy test
   (class cũ sẽ mất màu trong im lặng).

# Font System Rules

## Nguyên tắc tối cao

**KHÔNG BAO GIỜ dùng raw Tailwind font utilities** (`text-sm`, `text-xl`, `font-medium`, `leading-5`…) trực tiếp trong component.
**CHỈ dùng** font token classes từ `src/styles/font/generated-font.css`.

Source of truth: `src/styles/font/font.json` → sinh ra `generated-font.css` → sinh ra utility classes.
Chạy `npm run generate:font` khi cần tái sinh.

---

## Available Font Token Classes

Pattern: `text-{scale}` hoặc `text-{scale}-{weight}`

### Heading Scales
```tsx
className="text-h1"           // 40px / 56px  regular
className="text-h1-medium"    // 40px / 56px  500
className="text-h1-semibold"  // 40px / 56px  600
className="text-h1-bold"      // 40px / 56px  700

className="text-h2"           // 32px / 40px
className="text-h2-medium"
className="text-h2-semibold"
className="text-h2-bold"

className="text-h3"           // 24px / 36px
className="text-h3-medium"
// … h3-semibold, h3-bold

className="text-h4"           // 20px / 32px
className="text-h4-medium"
// … h4-semibold, h4-bold
```

### Body Scales
```tsx
className="text-body-18"          // 18px / 28px  regular
className="text-body-18-medium"   // 18px / 28px  500
className="text-body-18-semibold" // 18px / 28px  600
className="text-body-18-bold"     // 18px / 28px  700

className="text-body-16"          // 16px / 24px
className="text-body-16-medium"
// … body-16-semibold, body-16-bold

className="text-body-14"          // 14px / 20px  ← default body text
className="text-body-14-medium"   // 14px / 20px  500  ← most common label
className="text-body-14-semibold"
className="text-body-14-bold"
```

### Caption Scales
```tsx
className="text-caption-12"          // 12px / 16px
className="text-caption-12-medium"
className="text-caption-12-semibold"
className="text-caption-12-bold"

className="text-caption-10"          // 10px / 16px
className="text-caption-10-medium"
// … caption-10-semibold, caption-10-bold

className="text-caption-9"           // 9px / 12px
```

### Scale chật (giãn dòng bó sát) — cho ô bảng / chip cao cố định
```tsx
className="text-body"                // 13px / 20px
className="text-body-13"             // 13px / 16px
className="text-caption-12-tight"    // 12px / 14px
className="text-caption-10-tight"    // 10px / 12px
```

> **14 scale, mỗi scale 4 weight = 56 utility.** Danh sách đầy đủ luôn là
> `src/styles/font/font.json` — bảng trên chỉ để tra nhanh.

---

## Figma Type Scale (nguồn gốc)

Figma chỉ định **2 weights**: Medium (500) và Regular (400). Không dùng Bold (700) hay Semibold (600) cho typography chính.

| Figma Token | Size | Weight | Line-height | Class hệ thống |
|-------------|------|--------|-------------|----------------|
| Heading 1 | 40px | Medium | 56px | `text-h1-medium` |
| Heading 2 | 32px | Medium | 40px | `text-h2-medium` |
| Heading 3 | 24px | Medium | 36px | `text-h3-medium` |
| Heading 4 | 20px | Medium | 32px | `text-h4-medium` |
| Body 1 Subhead | 18px | Medium | 28px | `text-body-18-medium` |
| Body 1 | 18px | Regular | 28px | `text-body-18` |
| Body 2 Subhead | 16px | Medium | 24px | `text-body-16-medium` |
| Body 2 | 16px | Regular | 24px | `text-body-16` |
| Body 3 Subhead | 14px | Medium | 20px | `text-body-14-medium` |
| Body 3 | 14px | Regular | 20px | `text-body-14` |
| Caption 1 Label | 12px | Medium | 16px | `text-caption-12-medium` |
| Caption 1 | 12px | Regular | 16px | `text-caption-12` |
| Caption 2 Label | 10px | Medium | 16px | `text-caption-10-medium` |
| Caption 2 | 10px | Regular | 16px | `text-caption-10` |

## Mapping quy tắc

| Nhu cầu | Class BẮT BUỘC dùng | KHÔNG dùng |
|---------|---------------------|-----------|
| Body text / description | `text-body-14` | `text-sm font-normal leading-5` |
| Label / panel title | `text-body-14-medium` | `text-sm font-medium` |
| Body text 16px | `text-body-16` | `text-base font-normal` |
| Sub-heading 16px | `text-body-16-medium` | `text-base font-medium` |
| Heading 4 (20px) | `text-h4-medium` | `text-xl font-medium leading-8` |
| Heading 3 (24px) | `text-h3-medium` | `text-2xl font-bold` |
| Caption / hint | `text-caption-12` | `text-xs` |
| Small label | `text-caption-12-medium` | `text-xs font-medium` |
| Tiny label | `text-caption-10` | `text-[10px] leading-[14px]` |

---

## Tại sao

- `font.json` là source of truth — thay đổi ở đây regenerate toàn bộ hệ thống
- Khi PO/Design thay đổi typography scale, **chỉ cần sửa `font.json`** rồi `npm run generate:font`
- Toàn bộ component tự động cập nhật — không cần tìm/sửa từng file

---

## Đơn vị: px trong `font.json`, **rem** trong CSS (rem × --ui-scale)

**Tại sao rem?** Font token emit **rem** (chia cho 16) từ `font.json`. Khi TV mode bật,
CSS var `--ui-scale` từ 1 → 1.1/1.2/1.3 (user chọn) → mọi rem **tự động nhân** qua formula 
`calc(var(--fs-{token}, <rem>) * var(--ui-scale, 1))` ở `generated-font.css`.

- **Input**: `font.json` dùng **px** (dễ đọc, dễ đối chiếu Figma)
- **Output**: `generated-font.css` emit **rem** + **nhân `--ui-scale`**
  ```css
  @utility text-body-14 {
    font-size: calc(var(--fs-body-14, 0.875rem) * var(--ui-scale, 1));
    /* Normal: 0.875rem × 1 = 14px */
    /* TV ×1.1: 0.875rem × 1.1 = 15.4px (default, +10%) */
    /* TV ×1.2: 0.875rem × 1.2 = 16.8px (user chọn, +20%) */
    /* TV ×1.3: 0.875rem × 1.3 = 18.2px (user chọn, +30%, max) */
    line-height: calc(var(--lh-body-14, 1.25rem) * var(--lh-scale, 1));
    font-weight: var(--fw-regular, 450);
  }
  ```

⛔ **Giãn dòng dùng biến RIÊNG `--lh-scale`, KHÔNG dùng `--ui-scale`.**
`applyAppearance` đặt `--lh-scale = 1 + (uiScale − 1) × 0.5` — nửa nhịp. Lý do:
hàng chục ô trong app cao cố định vừa khít một dòng (`h-6` = 24px…); giãn dòng
tăng cùng nhịp cỡ chữ sẽ đẩy dòng `body-14` từ 20px lên 26px và TRÀN khỏi ô.
Gộp hai biến làm một = dựng lại đúng bug đã sửa.
- **Effect kiểm trên Chrome:**
  - Normal: 14px
  - TV mặc định (×1.1): 15.4px
  - TV ×1.2: 16.8px
  - TV ×1.3: 18.2px (trần)

**⛔ KHÔNG phóng root font-size** (design cũ 1.8× làm tất cả spacing tăng → vỡ layout).
Chỉ nhân vào riêng token chữ via CSS var.

**⛔ KHÔNG hardcode cỡ chữ ở chart hoặc JSX dưới dạng px**. Dùng `m.scale.*` (chart —
`buildChartStyles` tự nhân `uiScale`) hoặc UI kit component / `text-{scale}` (UI — đã là rem → tự
scale theo `--ui-scale`).

---

## Độ nét chữ (text rendering)

Chữ "nét" không đến từ bảng màu (bảng màu của base GIỐNG HỆT dự án gốc `vci-sun-pms-fe`) mà từ một
chuỗi 6 mắt xích. Mỗi mắt xích nằm đúng MỘT chỗ — mất một cái là chữ mềm/nhoè đi mà không lỗi nào báo:

| # | Mắt xích | Nằm ở | Làm gì |
|---|---|---|---|
| 1 | Inter **variable** với trục `wght` **và `opsz`** | `next/font` ở `app/[locale]/layout.tsx` (`Inter({ axes: ['opsz'] })`) | Heading 20–40px lấy bản *Display* (khe chữ chặt, nét đanh); chữ ≤ 14px không đổi (opsz mặc định = 14) |
| 2 | `font-weight: 450` làm nền | `base/document.css` (`body`) | Nhích 0.5 bậc so với Regular 400 — rõ nét trên nền tối mà không "bự" như Medium 500 |
| 3 | `-webkit-font-smoothing: antialiased` · `-moz-osx-font-smoothing: grayscale` | `base/document.css` (`html`) | Cạnh chữ mượt, không viền màu trên nền tối — **chỉ có tác dụng trên macOS/iOS**; trên Windows trình duyệt tự quyết (no-op) |
| 4 | `text-rendering: optimizeLegibility` | `base/document.css` (`html`) | Bật kerning + ligature |
| 5 | `font-optical-sizing: auto` | `base/document.css` (`html`) | Tự chọn `opsz` theo cỡ chữ — **chỉ có tác dụng khi file font CÓ trục opsz** (mắt xích 1) |
| 6 | `font-feature-settings: 'tnum', 'cv11', 'ss03'` | `base/document.css` (`body`) | Số thẳng cột (`tnum`) + biến thể chữ số đọc rõ hơn trên dashboard |
| + | `color-scheme: light` / `html.dark → dark` | `base/document.css` | Widget do trình duyệt vẽ (thanh cuộn native, `<select>`, date picker) theo theme thay vì mặc định sáng |

### ⛔ Mắt xích 1 và 5 phải đi cùng nhau

`font-optical-sizing: auto` mà font chỉ có trục `wght` thì file nhận về **không có trục `opsz`** → dòng CSS đó là **no-op im lặng**:
Inter bị ghim ở bản Text kể cả khi vẽ chữ 40px. Với `next/font` phải xin trục này TƯỜNG MINH: `Inter({ axes: ['opsz'], … })`
(`wght` là mặc định của font biến thiên nên không cần khai). Đổi lại ~+24 kB mỗi subset. Test chặn việc bỏ `axes: ['opsz']`.

### `next/font` — font tự host, biến CSS, không còn `<link>` Google Fonts

Bản Vite nạp font bằng `<link>` Google Fonts trong `index.html`; bản Next **không có `index.html`** và không gọi Google lúc chạy:
`next/font/google` tải file font LÚC BUILD, tự host cùng origin, tự sinh font dự phòng canh số đo (CLS gần 0).

| Font | Biến CSS | Subset | Ghi chú |
|---|---|---|---|
| Inter | `--font-inter` | `latin` · `latin-ext` · `vietnamese` | Font chính; `axes: [opsz]`, `display: swap`, preload mặc định |
| JetBrains Mono | `--font-jetbrains-mono` | như trên | Mã / `<kbd>`; `preload: false` (font phụ) |
| Noto Sans | `--font-noto-sans` | như trên | Lưới glyph cuối; `preload: false` |

- Khai ở `src/app/[locale]/layout.tsx`; class biến gắn lên `<html className={cn(inter.variable, …)}>`. `styles/base/root-vars.css` nối vào
  `--font-sans` / `--font-mono` với fallback `var(--font-inter, Inter)` — test / trang ngoài layout (biến chưa có) vẫn hợp lệ.
- ⛔ **`subsets` PHẢI là mảng literal ngay tại chỗ gọi** — `next/font` đọc option TĨNH lúc build; đưa ra hằng dùng chung là build đỏ.
- ⛔ **Thiếu `vietnamese`** là mất dấu tiếng Việt (rơi về font hệ thống, lệch bề rộng) — luôn giữ `vietnamese` + `latin-ext`.
- Thêm font / đổi font chính: sửa MỘT chỗ (layout) + `root-vars.css`; `font-weight` nền 450 và token `generated-font.css` không đổi. Font phụ nên `preload: false`.
- Ảnh Open Graph KHÔNG dùng `next/font` mà nạp tay file Noto Sans (Satori không đọc font web) — `rules/seo/seo.md` §OG.

### Đừng

- Đừng bỏ `antialiased` vì "trên Windows không thấy khác" — macOS/iOS khác rõ (chữ sáng trên nền tối bị đậm quá).
- Đừng đặt `font-weight` thô (`font-medium`…) cạnh token chữ — xem "KHÔNG ĐƯỢC" bên dưới.
- Đừng ép JetBrains Mono cho mọi số — `visual-hierarchy.md §3.3`; căn cột số dùng `tabular-nums`.
- Đừng phóng `font-size` gốc của `html` theo `--ui-scale` — vỡ layout ở TV mode (`tv-display-mode.md`).

---

## Font weight ở TV (nâng nửa bậc cho nét đẹp từ xa)

Ở desktop, baseline `font-weight: 450` cân bằng nét. Ở TV (3m+), chữ nhỏ tương đối,
nét mảnh lụt → **nâng nửa bậc** (áp dụng cho TẤT CẢ 3 mức TV):

| Scale | Desktop | TV (×1.1/1.2/1.3 — bất kỳ mức nào) |
|-------|---------|-----------|
| Regular (no suffix) | 450 | **500** (nâng 50) |
| `-medium` | 500 | **600** (nâng 100) |
| `-semibold` | 600 | 600 (giữ) |
| `-bold` | 700 | 700 (giữ) |

**Lý do font-weight không thay đổi theo mức:** Weight là nét, không phải kích thước.
Nét mảnh từ xa là vấn đề vật lý (viewing distance), **KHÔNG phụ thuộc vào --ui-scale**.
Nâng từ 450→500 (regular) là cắt ngang, bù cho chữ nhỏ từ 3m.

**Cơ chế:** `.tv` class set CSS var `--fw-regular: 500` + `--fw-medium: 600` 
(`modes/tv.css`; mặc định 450/500 ở `base/root-vars.css`) → `generated-font.css` dùng `font-weight: var(--fw-*, fallback)`
→ tự động áp dụng khi TV mode bật (mức nào cũng như nhau)
ở generator. **KHÔNG sinh utility mới** — dùng CSS var để tránh phát triển 
font-weight thêm (chỉ 2 bậc dưới được nâng).

---

## Điện thoại — bốn bậc chữ HIỂN THỊ tự thu

Ở màn 390px một con số `text-h2` 32px + đơn vị đã chiếm nửa thẻ KPI và số giữa vành donut tràn ra ngoài vành. Dưới điều kiện
của biến thể `phone:` (dọc < 768px hoặc xoay ngang thấp — `responsive-screens.md §2.2`), `src/styles/base/phone.css` đặt lại
các móc `--fs-*` / `--lh-*` mà `generated-font.css` đã chừa sẵn cho từng token:

| Token | Laptop / tablet / TV | Điện thoại |
|---|---|---|
| `text-h1` | 40px / 56px | 28px / 36px |
| `text-h2` | 32px / 40px | 24px / 30px |
| `text-h3` | 24px / 36px | 20px / 26px |
| `text-h4` | 20px / 32px | 18px / 24px |

- Chữ thân và chú thích (`body-*`, `caption-*`) KHÔNG đổi — 12–14px đã là sàn đọc được trên điện thoại.
- Nơi dùng KHÔNG làm gì: mọi chỗ gọi `text-h2-bold`… co theo; đừng viết `phone:text-*` đè token (đè từng chỗ là lệch nhịp với
  phần còn lại).
- TV vẫn nhân `--ui-scale` lên sau (thu ở `:root`, nhân ở `font-size: calc(var(--fs-h2) * var(--ui-scale))`); laptop /
  tablet / TV không khớp media query nên giữ NGUYÊN số của `font.json`. Số trong bảng là giá trị của `phone.css` — đổi một
  bên phải đổi cả hai.

---

## ⛔ KHÔNG ĐƯỢC — và đây là lỗi CHỨC NĂNG, không phải thẩm mỹ

```tsx
// ❌ Raw Tailwind utilities
<p className="text-sm font-medium leading-5">Label</p>
<h4 className="text-xl font-semibold leading-8">Title</h4>
<span className="text-xs leading-4">Caption</span>

// ✅ System font tokens
<p className="text-body-14-medium">Label</p>
<h4 className="text-h4-semibold">Title</h4>
<span className="text-caption-12">Caption</span>
```

### Vì sao `text-sm` là BUG, không phải "viết khác kiểu"

Đối chiếu CSS đã build:

```css
.text-body-14 { font-size: calc(var(--fs-body-14) * var(--ui-scale,1)); }
.text-sm      { font-size: var(--text-sm); }        /* KHÔNG có --ui-scale */
```

Chế độ TV nhân `--ui-scale` vào RIÊNG token do `generate-font.mjs` sinh ra. Một
`text-sm` lọt vào giữa đám token sẽ **đứng yên ở 14px** trong khi mọi thứ quanh
nó nở ra 15.4–18.2px.

Ba utility hay dùng nhất trùng KHÍT với token có sẵn nên thay là xong, không
phải cân lại thiết kế:

| Tailwind thô | Token tương đương | Số đo |
| --- | --- | --- |
| `text-sm` | `text-body-14` | 14/20 |
| `text-xs` | `text-caption-12` | 12/16 |
| `text-base` | `text-body-16` | 16/24 |

### `font-medium` / `font-normal` cạnh token cũng hỏng

`:root.tv` nâng `--fw-regular` 450→500 và `--fw-medium` 500→600. Nhưng utility
weight của Tailwind đứng SAU token trong stylesheet nên nó **thắng**, khoá cứng
nét ở bậc thường — token có hậu tố `-medium` cũng thành vô nghĩa.

`font-semibold` / `font-bold` thì cho ra ĐÚNG giá trị của token ở cả hai chế độ
(TV không đụng hai bậc này), nên vẫn dùng được khi cần chồng nét lên một cỡ chữ
**kế thừa từ cha** — chỗ không có token cỡ nào để gắn hậu tố vào.

### Rào chắn tự động

`tests/policy/styling/font-tokens.test.ts` chặn cả hai lỗi trên toàn `src/`. Nó bỏ chú thích
trước khi soi, nên một dòng văn bản dạy "KHÔNG dùng `text-2xl`" không bị tính là
vi phạm.

---

## Khi cần thêm scale mới

1. Thêm vào `src/styles/font/font.json`
2. Chạy `npm run generate:font`
3. **KHÔNG** thêm class tay vào `generated-font.css`

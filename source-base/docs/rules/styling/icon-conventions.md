# Icon Conventions

## Quy tắc tối cao

**KHÔNG BAO GIỜ** đặt inline SVG path trực tiếp trong source code component.
**KHÔNG BAO GIỜ** import individual icon components trực tiếp từ `@/assets/icons` trong application code.
**LUÔN** dùng `<SystemIcon name="..." />` để render system icons.
**KHÔNG BAO GIỜ** chỉnh sửa thủ công các file AUTO-GENERATED.

**MẶC ĐỊNH dùng biến thể `-outline`** cho icon chức năng / chrome UI.
Chỉ dùng `-bold` cho ngữ cảnh nhấn mạnh (gem/gradient container, overlay ảnh,
component ép kiểu bold, hoặc icon chưa có biến thể outline). Xem bảng
**"Chọn biến thể"** bên dưới.

---

## Cấu trúc hệ thống icon

```
src/assets/icons/
├── angle-down-bold.svg             # ← SOURCE OF TRUTH (Figma export)
├── angle-down-outline.svg
├── …                               # 377 file .svg, phẳng — KHÔNG có thư mục con
└── index.tsx                       # ← AUTO-GENERATED — TẤT CẢ component icon
                                    #    nằm chung MỘT file (~7.5k dòng)

src/shared/ui/icons/
├── Icons.tsx                       # Component <SystemIcon /> — ĐÂY LÀ API DÙNG
├── gem-icon/                       # Khung gem bọc icon (KPI, ConfirmDialog): GemIcon + defs/shapes
└── index.ts                        # ← AUTO-GENERATED (name → component registry)
```

> `src/assets/icons/index.tsx` nằm trong `globalIgnores` của `eslint.config.js`
> — cố ý, vì đó là file sinh tự động.

---

## API sử dụng — CHỈ dùng SystemIcon

```tsx
import { SystemIcon } from '@/shared/ui/icons/Icons';

// Cơ bản — mặc định outline cho icon chức năng
<SystemIcon name="angle-down-outline" />

// Với size (px, default 16)
<SystemIcon name="circle-check-outline" size={20} />

// Màu sắc qua Tailwind text-* class (CHỈ cách này — KHÔNG inline color)
<SystemIcon name="eye-outline" size={16} className="text-primary-5" />
<SystemIcon name="xmark-outline" size={24} className="text-error" />

// Kết hợp className và size
<SystemIcon name="magnifying-glass-outline" size={18} className="text-neutral-6" />

// Bold — chỉ cho ngữ cảnh nhấn mạnh (gem container, overlay, KPI card)
<SummaryCard icon="house-bold" ... />
```

- **Con trỏ kế thừa từ phần tử chứa**: `SystemIcon` KHÔNG tự thêm `cursor-pointer` (nút → bàn tay, nút tắt → cấm,
  chữ → mũi tên); icon trang trí không hiện bàn tay. Đừng gắn `cursor-pointer` lên chính icon.
- **Cỡ đặt inline** (`style` width / height từ prop `size`): đổi cỡ bằng `size`; ép từ ngoài bằng
  `[&>svg]:size-*` thì phải kèm `!` (vd `[&>svg]:size-4!`), không có `!` thì style inline thắng.

---

## Tên icon — Convention

Pattern: `{icon-name}-{variant}` (kebab-case)

| Variant | Mô tả |
|---------|-------|
| `-outline` | Stroked / outline icon — **MẶC ĐỊNH** |
| `-bold` | Filled / solid icon — chỉ cho ngữ cảnh nhấn mạnh |

Ví dụ đầy đủ: `angle-down-outline`, `circle-check-outline`, `house-bold`

---

## Chọn biến thể — Outline (mặc định) vs Bold

**Nguyên tắc:** icon chức năng nền UI (chrome) dùng `-outline`. `-bold` chỉ dành
cho các ngữ cảnh cần "đặc" để nổi bật hoặc do ràng buộc kỹ thuật.

| Ngữ cảnh | Biến thể | Ví dụ |
|----------|----------|-------|
| Nav / chevron / mũi tên phân trang | `-outline` | `angle-left-outline`, `caret-large-down-outline` |
| Nút đóng / xóa / clear | `-outline` | `xmark-outline`, `circle-xmark-outline` |
| Search / filter / calendar trigger | `-outline` | `magnifying-glass-outline`, `calendar-outline` |
| Field icon (input, form) | `-outline` | `eye-outline`, `envelope-outline` |
| Action trong list / table / menu / drag handle | `-outline` | `pen-outline`, `trash-outline`, `grip-dots-vertical-outline` |
| Status trong dialog / toast / stepper | `-outline` | `circle-check-outline`, `triangle-exclamation-outline` |
| **Icon trong gem / gradient container** | `-bold` | `SummaryCard`, `CompactKpiCard`, `GemIcon` |
| **Icon trên overlay ảnh** (outline bị mờ) | `-bold` | Nút hành động đè lên ảnh (`ImagePreview`, `FileCard`) |
| **Component ép kiểu `BoldSystemIconName`** | `-bold` | `SummaryCard`, `CompactKpiCard`, `EmptyState` |
| **Icon chưa có biến thể outline** (fallback) | `-bold` | `minus`, `zoom-in`, `zoom-out`, `sun`, `moon`, `paperclip`, `inbox`* |

> *Danh sách "bold-only" thay đổi khi export thêm outline từ Figma. Kiểm tra
> `src/shared/ui/icons/index.ts` (nguồn chuẩn) trước khi giả định biến thể tồn tại.
> Nếu icon chức năng đang phải fallback `-bold` vì thiếu outline → ưu tiên export
> biến thể outline từ Figma rồi sinh registry (§Thêm icon mới — ⛔ hiện KHÔNG chạy
> `generate:icons`).

**Prop-type enforced bold:** `SummaryCard`, `CompactKpiCard`, `EmptyState` khai
`type BoldSystemIconName = Extract<SystemIconName, \`${string}-bold\`>` → truyền
outline sẽ lỗi TypeScript. Đây là chủ đích (icon đặt trong gem màu). KHÔNG nới
lỏng type trừ khi design đổi.

---

## Thêm icon mới — Workflow

> ⛔ **KHÔNG chạy `npm run generate:icons`** — generator lệch registry đã commit, xem
> `docs/known-issues.md`. Chạy là ghi đè `src/assets/icons/index.tsx` và
> `src/shared/ui/icons/index.ts` bằng bản khác hẳn bản đang dùng. Hiện thêm icon phải
> DỪNG ở bước 2 (sinh registry) — báo chủ repo sinh lại + commit registry trước.

```
1. Xuất SVG từ Figma → đặt vào src/assets/icons/{tên}.svg
2. Sinh registry: npm run generate:icons   ⛔ HIỆN KHÔNG CHẠY — dừng ở đây (xem trên)
3. Script ghi lại HAI file:
   - src/assets/icons/index.tsx     (mọi component icon + currentColor)
   - src/shared/ui/icons/index.ts   (registry name → component + SystemIconName)
4. Dùng: <SystemIcon name="{tên}" /> — chỉ sau khi registry đã sinh lại
```

Khi generator đã khớp lại registry (mục tương ứng trong `docs/known-issues.md` đã đóng):
sau khi thêm SVG, chạy `npm run generate:icons` trước khi commit (⛔ hiện tại KHÔNG chạy — generator còn lệch registry đã commit).

---

## Quy tắc SVG gốc (Figma export)

Khi xuất SVG từ Figma:
- File name: `{icon-name}-{bold|outline}.svg` — kebab-case, thêm suffix variant
- **KHÔNG sửa nội dung SVG** — script `generate:icons` (⛔ hiện KHÔNG chạy — xem §Thêm icon mới) xử lý tự động:
  - `fill="var(--fill-0, #94A3B8)"` → `fill="currentColor"` (tách màu)
  - Xóa `id`, `width`, `height`, `style` dư thừa
  - Giữ `viewBox`, `overflow`, `fill="none"` trên root svg

---

## AUTO-GENERATED files — KHÔNG CHỈNH THỦ CÔNG

| File | Ghi chú |
|------|---------|
| `src/assets/icons/index.tsx` | Mọi component icon — overwrite mỗi lần generate |
| `src/shared/ui/icons/index.ts` | Registry map + `SystemIconName` — overwrite |

Nếu cần fix icon: sửa file `.svg` gốc → sinh lại registry bằng `npm run generate:icons`
(⛔ hiện KHÔNG chạy — generator lệch registry đã commit, xem `docs/known-issues.md`).

---

## KHÔNG ĐƯỢC

```tsx
// ❌ SAI — Inline SVG trong component
<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 16..." /></svg>

// ❌ SAI — Import SVG file trực tiếp (Vite không có @svgr/plugin-vite)
import CheckIcon from "@/assets/icons/circle-check-bold.svg";

// ❌ SAI — Import individual TSX component trong application code
import { CircleCheckBoldIcon } from "@/assets/icons";
<CircleCheckBoldIcon className="size-5 text-primary-5" />

// ❌ SAI — Hardcode màu trên icon (vi phạm color-system.md)
<SystemIcon name="check-bold" style={{ color: '#22c55e' }} />
<SystemIcon name="check-bold" className="text-[#22c55e]" />

// ❌ SAI — Sửa thủ công file auto-generated
// src/shared/ui/icons/index.ts  ← KHÔNG CHỈNH

// ✅ ĐÚNG — Luôn dùng SystemIcon với color token (mặc định outline)
<SystemIcon name="circle-check-outline" size={16} className="text-success" />
<SystemIcon name="angle-down-outline" size={12} className="text-neutral-6" />
<SystemIcon name="magnifying-glass-outline" size={18} className="text-primary-5" />

// ✅ ĐÚNG — bold cho gem/KPI container
<SystemIcon name="house-bold" size={16} className="text-primary-5" />
```

---

## Danh sách icon (tham khảo)

> **Nguồn chuẩn:** `src/shared/ui/icons/index.ts` (registry auto-gen). Bảng dưới
> chỉ liệt kê một phần base name phổ biến — KHÔNG đầy đủ. Đa số base name có cả
> `{base}-bold` và `{base}-outline`; một số ít hiện chỉ có `-bold` (xem mục
> "Chọn biến thể" → fallback).

Naming pattern: `{base}-outline` (mặc định) · `{base}-bold` (nhấn mạnh)

| Base name | Bold | Outline |
|-----------|------|---------|
| `angle-down` | ✅ | ✅ |
| `angle-left` | ✅ | ✅ |
| `angle-right` | ✅ | ✅ |
| `angle-up` | ✅ | ✅ |
| `arrow-rotate-left` | ✅ | ✅ |
| `arrow-rotate-right` | ✅ | ✅ |
| `arrows-rotate` | ✅ | ✅ |
| `bell` | ✅ | ✅ |
| `bolt-lightning` | ✅ | ✅ |
| `building` | ✅ | ✅ |
| `buildings` | ✅ | ✅ |
| `calendar` | ✅ | ✅ |
| `camera` | ✅ | ✅ |
| `caret-large-down` | ✅ | ✅ |
| `caret-large-left` | ✅ | ✅ |
| `caret-large-right` | ✅ | ✅ |
| `caret-large-up` | ✅ | ✅ |
| `check` | ✅ | ✅ |
| `circle-check` | ✅ | ✅ |
| `circle-exclamation` | ✅ | ✅ |
| `circle-question` | ✅ | ✅ |
| `circle-xmark` | ✅ | ✅ |
| `clock` | ✅ | ✅ |
| `clone` | ✅ | ✅ |
| `copy` | ✅ | ✅ |
| `cube` | ✅ | ✅ |
| `diamond-exclamation` | ✅ | ✅ |
| `do-not-enter` | ✅ | ✅ |
| `ellipsis` | ✅ | ✅ |
| `ellipsis-vertical` | ✅ | ✅ |
| `envelope` | ✅ | ✅ |
| `eye` | ✅ | ✅ |
| `eye-slash` | ✅ | ✅ |
| `file` | ✅ | ✅ |
| `folder` | ✅ | ✅ |
| `folders` | ✅ | ✅ |
| `gear` | ✅ | ✅ |
| `grid-2` | ✅ | ✅ |
| `grip-dots-vertical` | ✅ | ✅ |
| `house` | ✅ | ✅ |
| `image` | ✅ | ✅ |
| `location-dot` | ✅ | ✅ |
| `location-pin` | ✅ | ✅ |
| `lock` | ✅ | ✅ |
| `magnifying-glass` | ✅ | ✅ |
| `pen` | ✅ | ✅ |
| `plus` | ✅ | ✅ |
| `plus-large` | ✅ | ✅ |
| `sliders-simple` | ✅ | ✅ |
| `star` | ✅ | ✅ |
| `trash` | ✅ | ✅ |
| `trash-can` | ✅ | ✅ |
| `triangle-exclamation` | ✅ | ✅ |
| `user` | ✅ | ✅ |
| `user-2` | ✅ | ✅ |
| `xmark` | ✅ | ✅ |

---
name: ui-styling
description: Style UI trong base-project bằng UI kit (Radix UI + bảng class `*_CLASSES` + Tailwind v4 token). Dùng khi cần style một component mới, đổi theme, hoặc quyết định dùng token / biến thể nào — KHÔNG áp dụng pattern shadcn/ui hay MUI.
---

# UI Styling — UI kit (KHÔNG phải shadcn/ui)

base-project **không dùng shadcn/ui**. UI kit (`src/shared/ui/`) tự có hệ token + component, cũng đứng trên Radix UI
nhưng là **thư viện dùng chung**: sửa một chỗ, mọi nơi dùng đều đổi theo. Skill này chỉ chỉ đường — luật và ví dụ
nằm trong rule, đừng đoán.

## Đọc gì

| Cần gì                                                                                                                                                            | Đọc                                                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Ngôn ngữ theme SÁNG (mặc định)**: màu thương hiệu VCI, nền, bo góc, độ nổi, header nổi + tab trang, Dock, mẫu macOS (hộp nhóm, kính, viền bắt sáng) — đọc TRƯỚC | `docs/rules/styling/light-theme.md`                                                                                                                                |
| Icon nhận diện nghiệp vụ (`VciIcon` / `AppIcon`), thêm icon VCI                                                                                                   | `docs/rules/styling/vci-icon-system.md`                                                                                                                            |
| Token màu, ngoại lệ hex                                                                                                                                           | `docs/rules/styling/color-system.md`                                                                                                                               |
| Chọn token cho tình huống (nền lớp, chữ, viền, trạng thái)                                                                                                        | `docs/rules/styling/color-usage-guide.md`                                                                                                                          |
| Cấp bậc màu chữ (`fg-heading` · `fg-subheading` · `fg-body` · `fg-muted` · `fg-faint`)                                                                            | `docs/rules/styling/text-contrast.md`                                                                                                                              |
| Ngôn ngữ sáng / tối (HUD chỉ `dark:`, tiêu đề khối, focus, chuyển động)                                                                                           | `docs/rules/styling/visual-hierarchy.md` §0b                                                                                                                       |
| Thang chữ `text-{scale}-{weight}`                                                                                                                                 | `docs/rules/styling/font-system.md`                                                                                                                                |
| `cn()`, thứ tự class, thang bo góc `rounded-*` (sáng bo, tối vuông)                                                                                               | `docs/rules/styling/tailwind-conventions.md`                                                                                                                       |
| Bảng có ô sửa được (phiếu, danh mục)                                                                                                                              | `docs/rules/display/data-entry-table.md`                                                                                                                           |
| Padding / gap                                                                                                                                                     | `docs/rules/styling/spacing-system.md`                                                                                                                             |
| Biến thể = bảng `*_CLASSES` `satisfies Record<…>` (không `tv()` / `cva`)                                                                                          | `docs/rules/structure/component-structure.md` §2 (mẫu: `src/shared/ui/actions/Button.tsx`)                                                                         |
| Bề mặt dùng chung: khung ô nhập · menu / popover · lớp phủ modal                                                                                                  | `docs/rules/structure/ui-kit-architecture.md` §5b (`inputs/field.theme.ts` · `overlays/popup-surface.theme.ts` · `overlays/modal.theme.ts` trong `src/shared/ui/`) |
| Style một widget                                                                                                                                                  | `docs/rules/structure/widget-composition.md`                                                                                                                       |
| CSS thuần (hiếm), thanh cuộn                                                                                                                                      | `docs/rules/styling/css-architecture.md` · `scrollbar.md`                                                                                                          |
| Component nào cho tình huống nào                                                                                                                                  | skill `ui-kit-component-picker`                                                                                                                                    |

## Nhớ nhanh

- Màu: sửa `src/styles/theme/colors-theme.json` → `npm run generate:colors`; chữ: `src/styles/font/font.json` →
  `npm run generate:font`. KHÔNG sửa tay `generated-*.css` / `colors.generated.ts`.
- Dark mode lật qua CSS var (class `.dark`): token `bg-*` / `fg-*` / `border-*` tự lật; token số (`primary-5`,
  `blue-3`) KHÔNG lật. Không viết `dark:` song song. `dark:` chỉ dành cho trang trí HUD (quầng, ray, ngoặc góc) —
  theme sáng giữ sạch (`visual-hierarchy.md` §0b).
- `touch:` chỉ được THU NHỎ, không phóng to (`docs/rules/display/ipad-responsive.md`).
- Tailwind v4 chạy qua `@tailwindcss/postcss` (`postcss.config.mjs`); entry `src/styles/globals.css` (chỉ `@import`) nạp ở root layout
  `src/app/[locale]/layout.tsx`. Font tự host `next/font` khai biến `--font-inter` … ở layout đó, nối vào `--font-sans` ở
  `styles/base/root-vars.css` — không thêm `<link>` font ngoài.
- Bảng `*_CLASSES` / biến thể đặt ở file `*.theme.ts` (KHÔNG `'use client'`) để Server Component gọi được; file component có hook mới có
  `'use client'` (`docs/rules/structure/server-client-boundary.md`).
- Style theo trạng thái do HTML server dựng (theme, cỡ màn) → CSS thuần / biến thể Tailwind, không `useIsPhone()` / `useMediaQuery` (chỉ
  đúng sau hydrate → nháy bố cục). Chữ trong component (nhãn, `aria-label`) đi qua `useTranslations` — không hard-code khi style.

## Sai lầm khi quen shadcn / MUI

| ❌ Quen tay                               | ✅ UI kit                                                                                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx shadcn add button`                   | Không có CLI — component đã có trong `@/shared/ui`                                                                                                          |
| Copy component vào feature để "sửa riêng" | Thêm khoá vào bảng `*_CLASSES` của component gốc                                                                                                            |
| Token trong `tailwind.config.ts`          | Không có file đó — token ở `@theme inline` của `src/styles/theme/generated-colors.css`                                                                      |
| `sx={{ color: 'primary.main' }}`          | `className="text-link"` (chữ nhấn tự lật theme; `text-primary-5` trên nền sáng chỉ ~3,3:1 < 4,5:1)                                                          |
| `next-themes`                             | `src/app/_providers/appearance/AppearanceSync.tsx` + script `appearanceInitScript` (áp class `.dark` lên `<html>` trước lần vẽ đầu — không nháy sáng → tối) |

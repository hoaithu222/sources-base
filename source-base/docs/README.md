# Tài liệu — mục lục

Trang này là **mục lục DUY NHẤT** của repo. `README.md` gốc và `.claude/CLAUDE.md` trỏ về đây,
không chép lại bảng. Thêm / đổi tên / xoá một file tài liệu → sửa đúng một dòng ở trang này.

## Ba loại tài liệu — viết gì ở đâu

| Loại | Ở đâu | Chứa | KHÔNG chứa |
|---|---|---|---|
| **Rule** | `docs/rules/<nhóm>/*.md` | Luật chung áp cho nhiều file, kiểm được đúng / sai (máy giữ thì ghi cổng nào giữ) | Lý do riêng của một file; lịch sử |
| **Note** | `docs/notes/components/*.md` (UI kit) · `docs/notes/code/*.md` (phần còn lại) | "Vì sao" của MỘT component / file mà đọc code không thấy: ≤ 6 gạch / mục, mỗi gạch ≤ 2 dòng | Luật chung (→ rule); cách dùng (→ khối tài liệu) |
| **Khối tài liệu trong code** | JSDoc SÁT trên component / hook / hằng công khai | Cách dùng: `Tên — mô tả`, `@param props.*`, `@example`, `Lưu ý:` (bẫy khi dùng) | Lý do dài, lịch sử — `comment-policy.md` |

Hai file đứng riêng: [`architecture.md`](architecture.md) (quyết định kiến trúc · vì sao · luật ở đâu) và
[`known-issues.md`](known-issues.md) (việc còn treo, có trạng thái `mở` / `cần chủ repo quyết`).

Ngoài ba loại trên còn **Hướng dẫn** (`docs/guides/<vùng>.md`): làm những việc thường gặp của một vùng code từng
bước, mẫu code khớp code thật. Hướng dẫn KHÔNG đặt luật — gặp luật thì trỏ về rule. Danh sách: mục "Hướng dẫn" bên dưới.

**Tìm note của một file:** component ở `src/shared/ui/<nhóm>/<nhóm-con>/…` → `notes/components/<nhóm>-<nhóm-con>.md`
nếu file đó có, không thì `notes/components/<nhóm>.md`. File ngoài UI kit → `notes/code/<tên folder>.md`
(`app` · `core` · `domains` · `auth` · `demo` · `charts` · `constants` · `hooks` · `utils` · `widgets` ·
`widgets-header`). Mục trong note đặt tên `## <Tên component hoặc file>`.

## Người mới — đọc theo thứ tự

1. **Chung:** `README.md` gốc → [`architecture.md`](architecture.md) → [development-rules](rules/foundations/development-rules.md) →
   [folder-structure](rules/foundations/folder-structure.md) → [code-style](rules/foundations/code-style.md) →
   [comment-policy](rules/foundations/comment-policy.md) → [quality-gates](rules/foundations/quality-gates.md)
2. **Viết feature:** [feature-structure](rules/structure/feature-structure.md) → [page-structure](rules/structure/page-structure.md) →
   [routing-conventions](rules/structure/routing-conventions.md) → [api-patterns](rules/data/api-patterns.md) →
   [async-safety](rules/data/async-safety.md) → [form-validation](rules/data/form-validation.md); làm từng bước có mẫu:
   [hướng dẫn tầng app](guides/app-layer.md)
3. **Viết / sửa UI kit:** [reuse-first](rules/structure/reuse-first.md) → [ui-kit-architecture](rules/structure/ui-kit-architecture.md) →
   [component-structure](rules/structure/component-structure.md) → [widget-composition](rules/structure/widget-composition.md)
4. **CSS:** [color-system](rules/styling/color-system.md) → [font-system](rules/styling/font-system.md) →
   [spacing-system](rules/styling/spacing-system.md) → [tailwind-conventions](rules/styling/tailwind-conventions.md) →
   [css-architecture](rules/styling/css-architecture.md) → [responsive-screens](rules/display/responsive-screens.md)
5. **Test:** [testing](rules/foundations/testing.md) → [quality-gates](rules/foundations/quality-gates.md)

## Sắp làm gì → đọc gì (theo thứ tự)

| Sắp làm | Đọc |
|---|---|
| Viết JSX bất kỳ | `reuse-first` → `ui-kit-architecture` |
| Thêm feature / phân hệ mới | `guides/app-layer` §5.4 → `feature-structure` → `routing-conventions` → `page-structure` (skill `new-feature`) |
| Thêm trang tĩnh / route con / quyền; sửa guard, layout, shell, khởi động (`src/app`) | [`guides/app-layer.md`](guides/app-layer.md) → `routing-conventions` → `page-structure` |
| Viết / sửa trang, layout, shell | `page-structure` → `spacing-system` → `visual-hierarchy` → `responsive-screens` |
| Viết / sửa component UI kit | `component-structure` → `ui-kit-architecture` → `comment-policy` → note của nhóm |
| Viết / sửa widget (`shared/widgets`) | `widget-composition` → `component-structure` → `notes/code/widgets*.md` |
| Gọi API, lọc / phân trang trên URL | `api-patterns` → `async-safety` |
| Store Zustand, `persist` | `state-management` → `async-safety` |
| Form, kiểm dữ liệu | `form-validation` → `notes/components/form.md` |
| Ô tìm kiếm, so khớp chữ | `ime-safe-input` → `search-matching` |
| Bàn phím, link, modal hay sửa tại chỗ | `navigable-controls` → `keyboard-navigation` → `interaction-ux` |
| Hover · nhấn · focus; chuyển tiếp `translate` / `rotate` / `scale` | `interactive-state` |
| Chọn màu | `color-system` → `color-usage-guide` → `text-contrast` |
| Chữ · icon · khoảng cách · mật độ | `font-system` · `icon-conventions` · `spacing-system` · `visual-hierarchy` |
| CSS thuần, thanh cuộn | `css-architecture` → `scrollbar` |
| Biểu đồ | `chart-conventions` → `notes/code/charts.md` |
| Responsive · màn nhỏ · điện thoại · tablet · laptop 14" / 16" (bố cục, sheet, bộ lọc, chụp ma trận viewport) | `responsive-screens` → `ipad-responsive` |
| Máy tính bảng / PWA · màn TV | `ipad-responsive` · `tv-display-mode` |
| Tạo / chuyển folder, đặt tên file | `folder-structure` → `code-style` |
| Viết / sửa test | `testing` → `quality-gates` |
| Trước khi commit / mở PR | `quality-gates` → `security-checklist` |
| Sửa tài liệu | `documentation-management` (trang này là mục lục) |
| Gặp hành vi lạ | [`known-issues.md`](known-issues.md) trước khi sửa |

## Toàn bộ rule

Chỉ 6 rule mang nhãn **(BẮT BUỘC)** ở tiêu đề — vi phạm là lỗi thật cho người dùng (dữ liệu sai,
mất dấu tiếng Việt, lộ phiên…), không chỉ lệch quy ước: `async-safety`, `security-checklist`,
`ime-safe-input`, `search-matching`, `form-validation`, `navigable-controls`.

**`rules/foundations/` — nền chung**

| File | Khi nào đọc |
|---|---|
| [development-rules](rules/foundations/development-rules.md) | YAGNI / KISS / DRY (ngưỡng tách dùng chung), không tạo file `-v2` |
| [folder-structure](rules/foundations/folder-structure.md) | ≤ 8 mục / folder, folder vai trò, đặt tên file, **giới hạn số dòng** (nguồn duy nhất), cách chuyển file |
| [code-style](rules/foundations/code-style.md) | Đặt tên, mẫu export component, thứ tự import, TypeScript |
| [clean-code-standards](rules/foundations/clean-code-standards.md) | Một file một component, hằng / hàm ở module-scope, phần con nội bộ, `.ts` hay `.tsx` |
| [code-optimization](rules/foundations/code-optimization.md) | Khi nào `memo` / `useMemo` / `useCallback` |
| [comment-policy](rules/foundations/comment-policy.md) | Bốn loại comment được phép; lý do dài đi đâu |
| [documentation-management](rules/foundations/documentation-management.md) | Khi nào viết rule / note mới, giữ docs khớp code |
| [testing](rules/foundations/testing.md) | Cây `tests/`, đặt tên, helper, test luật |
| [quality-gates](rules/foundations/quality-gates.md) | Cổng nào bắt luật nào, chạy khi nào, đỏ thì làm gì |

**`rules/structure/` — chia code**

| File | Khi nào đọc |
|---|---|
| [reuse-first](rules/structure/reuse-first.md) | Trước khi viết JSX: "cần X → dùng component / hook / util nào" (catalog) |
| [ui-kit-architecture](rules/structure/ui-kit-architecture.md) | Nhóm của UI kit, cây quyết định đặt file, public API, 3R |
| [component-structure](rules/structure/component-structure.md) | Thứ tự trong file, bảng `*_CLASSES`, khối tài liệu, folder component |
| [widget-composition](rules/structure/widget-composition.md) | Khuôn widget `shared/widgets`, `*.theme.ts`, store cục bộ |
| [page-structure](rules/structure/page-structure.md) | Trang chỉ ghép; layout, shell, provider |
| [feature-structure](rules/structure/feature-structure.md) | **Cây folder feature** (nguồn duy nhất), tính năng con |
| [routing-conventions](rules/structure/routing-conventions.md) | Khai route một chỗ: module registry, quyền, `lazyPage` |

**`rules/data/` — dữ liệu**

| File | Khi nào đọc |
|---|---|
| [api-patterns](rules/data/api-patterns.md) | `api/` · `service/` · React Query, lỗi báo một lần, lọc trên URL |
| [async-safety](rules/data/async-safety.md) | Mọi `await`: lượt mới nhất thắng, huỷ / reset, phiên, dữ liệu lưu trữ |
| [state-management](rules/data/state-management.md) | Zustand vs React Query vs URL; store `persist` |
| [form-validation](rules/data/form-validation.md) | Schema Zod: `.trim().min(1)`, validator dùng chung |
| [security-checklist](rules/data/security-checklist.md) | Bảo mật & non-functional trước khi ship |

**`rules/interaction/` — tương tác**

| File | Khi nào đọc |
|---|---|
| [navigable-controls](rules/interaction/navigable-controls.md) | Đi tới trang = liên kết thật (`<Link>`), không `onClick={navigate}` |
| [ime-safe-input](rules/interaction/ime-safe-input.md) | Ô tìm kiếm / nhập tự do: `useImeSafeSearchInput` |
| [search-matching](rules/interaction/search-matching.md) | So khớp bỏ dấu: `matchesSearch` / `normalizeSearch` |
| [keyboard-navigation](rules/interaction/keyboard-navigation.md) | Đi giữa các ô nhập bằng mũi tên |
| [interaction-ux](rules/interaction/interaction-ux.md) | Sửa tại chỗ hay modal, tự focus, phím tắt chuẩn |

**`rules/styling/` — giao diện**

| File | Khi nào đọc |
|---|---|
| [color-system](rules/styling/color-system.md) | Token màu, `colors-theme.json`, ngoại lệ hex |
| [color-usage-guide](rules/styling/color-usage-guide.md) | Chọn token cho từng tình huống (nền lớp, chữ, viền, trạng thái, chart) |
| [text-contrast](rules/styling/text-contrast.md) | Cấp bậc màu chữ `fg-*` |
| [font-system](rules/styling/font-system.md) | `text-{scale}-{weight}`, độ nét chữ |
| [icon-conventions](rules/styling/icon-conventions.md) | `SystemIcon`, outline vs bold, thêm icon |
| [spacing-system](rules/styling/spacing-system.md) | Thang padding / gap, ai đệm ai tạo khe |
| [visual-hierarchy](rules/styling/visual-hierarchy.md) | Ngôn ngữ sáng / tối (§0b — HUD chỉ qua `dark:`), bố cục, mật độ, viền, số liệu |
| [tailwind-conventions](rules/styling/tailwind-conventions.md) | `cn()`, thứ tự class |
| [interactive-state](rules/styling/interactive-state.md) | Rê / nhấn tô tint màu chủ đạo, vòng focus `focus-visible`, bẫy `transition-[transform]` của Tailwind 4 |
| [css-architecture](rules/styling/css-architecture.md) | Bản đồ `src/styles/`, tầng layer, đặt CSS thuần ở đâu |
| [scrollbar](rules/styling/scrollbar.md) | Class thanh cuộn, ba bẫy trình duyệt |

**`rules/display/` — thiết bị hiển thị**

| File | Khi nào đọc |
|---|---|
| [chart-conventions](rules/display/chart-conventions.md) | Recharts qua `@/shared/charts`: mật độ, màu, trục, nhãn |
| [responsive-screens](rules/display/responsive-screens.md) | **Rule tổng mọi cỡ màn**: bảng thiết bị → viewport, gate `phone:` / `touch:` / `max-wide:`, công thức điện thoại · tablet · laptop · màn ngoài, mẫu thành phần, bẫy, ma trận kiểm bằng máy |
| [ipad-responsive](rules/display/ipad-responsive.md) | `touch:` / `standalone:`, vùng chạm, `dvh`, safe-area, laptop 14" / 16" (`max-wide:`), PWA |
| [tv-display-mode](rules/display/tv-display-mode.md) | Chế độ TV / kiosk |

## Hướng dẫn

| File | Khi nào đọc |
|---|---|
| [app-layer](guides/app-layer.md) | Tầng `src/app`: luồng khởi động, cây route, thêm trang / phân hệ / route con / quyền, guard và phiên, lỗi và màn chờ, layout, shell, test — từng bước, có mẫu code |

## Note

- `notes/components/`: `actions` · `data-display` · `data-display-table` · `feedback` · `form` · `icons` ·
  `inputs` · `layout` · `media` · `media-upload` · `navigation` · `overlays` · `pickers` · `primitives` ·
  `selects` · `surfaces` · `surfaces-cards` · `surfaces-hud`.
- `notes/code/`: `app` · `auth` · `charts` · `constants` · `core` · `demo` · `domains` · `hooks` · `utils` ·
  `widgets` (dock · tab-bar · command-palette · progress-center) · `widgets-header`.

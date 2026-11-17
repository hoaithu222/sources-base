# Tài liệu — mục lục

Trang này là **mục lục DUY NHẤT** của repo. `README.md` gốc và `.claude/CLAUDE.md` trỏ về đây,
không chép lại bảng. Thêm / đổi tên / xoá một file tài liệu → sửa đúng một dòng ở trang này.

## Ba loại tài liệu — viết gì ở đâu

| Loại                         | Ở đâu                                                                         | Chứa                                                                                        | KHÔNG chứa                                       |
| ---------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Rule**                     | `docs/rules/<nhóm>/*.md`                                                      | Luật chung áp cho nhiều file, kiểm được đúng / sai (máy giữ thì ghi cổng nào giữ)           | Lý do riêng của một file; lịch sử                |
| **Note**                     | `docs/notes/components/*.md` (UI kit) · `docs/notes/code/*.md` (phần còn lại) | "Vì sao" của MỘT component / file mà đọc code không thấy: ≤ 6 gạch / mục, mỗi gạch ≤ 2 dòng | Luật chung (→ rule); cách dùng (→ khối tài liệu) |
| **Khối tài liệu trong code** | JSDoc SÁT trên component / hook / hằng công khai                              | Cách dùng: `Tên — mô tả`, `@param props.*`, `@example`, `Lưu ý:` (bẫy khi dùng)             | Lý do dài, lịch sử — `comment-policy.md`         |

Hai file đứng riêng: [`architecture.md`](architecture.md) (quyết định kiến trúc · vì sao · luật ở đâu) và
[`known-issues.md`](known-issues.md) (việc còn treo, có trạng thái `mở` / `cần chủ repo quyết`).

Ngoài ba loại trên còn **Hướng dẫn** (`docs/guides/<vùng>.md`): làm những việc thường gặp của một vùng code từng
bước, mẫu code khớp code thật. Hướng dẫn KHÔNG đặt luật — gặp luật thì trỏ về rule. Danh sách: mục "Hướng dẫn" bên dưới.

**Tìm note của một file:** component ở `src/shared/ui/<nhóm>/<nhóm-con>/…` → `notes/components/<nhóm>-<nhóm-con>.md`
nếu file đó có, không thì `notes/components/<nhóm>.md`. File ngoài UI kit → `notes/code/<tên folder>.md`
(`app` · `auth` · `charts` · `constants` · `core` · `customers` · `domains` · `hooks` · `utils` · `widgets` ·
`widgets-header`). Mục trong note đặt tên `## <Tên component hoặc file>`.

## Người mới — đọc theo thứ tự

1. **Chung:** `README.md` gốc → [`architecture.md`](architecture.md) → [development-rules](rules/foundations/development-rules.md) →
   [folder-structure](rules/foundations/folder-structure.md) → [code-style](rules/foundations/code-style.md) →
   [comment-policy](rules/foundations/comment-policy.md) → [quality-gates](rules/foundations/quality-gates.md)
2. **Ranh giới server / client (đọc trước khi viết file đầu tiên):**
   [server-client-boundary](rules/structure/server-client-boundary.md) → [page-structure](rules/structure/page-structure.md)
3. **Viết feature:** [feature-structure](rules/structure/feature-structure.md) → [page-structure](rules/structure/page-structure.md) →
   [routing-conventions](rules/structure/routing-conventions.md) → [api-patterns](rules/data/api-patterns.md) →
   [async-safety](rules/data/async-safety.md) → [form-validation](rules/data/form-validation.md) → [i18n](rules/i18n/i18n.md);
   làm từng bước có mẫu: [hướng dẫn tầng app](guides/app-layer.md) · màn CRUD đầu tiên: [hướng dẫn CRUD](guides/crud-feature.md)
4. **Trang công khai (SEO, đa ngôn ngữ):** [seo](rules/seo/seo.md) → [i18n](rules/i18n/i18n.md) →
   [hướng dẫn SEO](guides/seo.md) · [hướng dẫn i18n](guides/i18n.md)
5. **Viết / sửa UI kit:** [reuse-first](rules/structure/reuse-first.md) → [ui-kit-architecture](rules/structure/ui-kit-architecture.md) →
   [component-structure](rules/structure/component-structure.md) → [widget-composition](rules/structure/widget-composition.md)
6. **CSS:** [light-theme](rules/styling/light-theme.md) → [color-system](rules/styling/color-system.md) → [font-system](rules/styling/font-system.md) →
   [spacing-system](rules/styling/spacing-system.md) → [tailwind-conventions](rules/styling/tailwind-conventions.md) →
   [css-architecture](rules/styling/css-architecture.md) → [responsive-screens](rules/display/responsive-screens.md)
7. **Test:** [testing](rules/foundations/testing.md) → [quality-gates](rules/foundations/quality-gates.md)

## Sắp làm gì → đọc gì (theo thứ tự)

| Sắp làm                                                                                                                                                      | Đọc                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Viết JSX bất kỳ                                                                                                                                              | `reuse-first` → `ui-kit-architecture`                                                                                                         |
| Tìm component để dùng, xem nó chạy thật và các trạng thái (loading · lỗi · rỗng · vô hiệu) thay vì đọc tên API; thêm một nhóm vào catalog                    | mở `/demo` (chế độ demo, `npm run dev`: mục lục + ô tìm) → `reuse-first` (bảng tra theo nhu cầu); thêm nhóm: `notes/code/app.md` (`DemoLibraryView`) |
| Viết file dùng hook / store / context / thư viện chỉ chạy ở trình duyệt; sửa `page.tsx` / `layout.tsx`; gặp lỗi biên dịch "needs `useState`… `'use client'`" | `server-client-boundary` → `page-structure` → `architecture.md` §2                                                                            |
| Thêm / sửa chuỗi hiển thị, thêm ngôn ngữ, đổi `Link` / `useRouter`, định dạng số – ngày theo ngôn ngữ                                                        | `i18n` → [`guides/i18n.md`](guides/i18n.md)                                                                                                   |
| Thêm trang công khai vào sitemap, đặt metadata / canonical / hreflang, JSON-LD, ảnh Open Graph, `noindex`                                                    | `seo` → [`guides/seo.md`](guides/seo.md) → `routing-conventions`                                                                              |
| Thêm feature / phân hệ mới                                                                                                                                   | `guides/app-layer` (thêm phân hệ) → `feature-structure` → `routing-conventions` → `page-structure` (skill `new-feature`)                      |
| Thêm một màn CRUD (danh sách lọc trên URL · tạo · sửa · xoá) từ mẫu `customers`                                                                              | [`guides/crud-feature.md`](guides/crud-feature.md) → `api-patterns` → `form-validation` → `async-safety` (mẫu sống: `src/features/customers`) |
| Thêm trang tĩnh / route con / quyền; sửa guard, layout, shell, khởi động (`src/app`)                                                                         | [`guides/app-layer.md`](guides/app-layer.md) → `routing-conventions` → `page-structure`                                                       |
| Viết / sửa trang, layout, shell                                                                                                                              | `page-structure` → `spacing-system` → `visual-hierarchy` → `responsive-screens`                                                               |
| Giao diện sáng, header, Dock, bo góc                                                                                                                         | `light-theme` → `color-usage-guide` → `visual-hierarchy` §0b → `notes/code/widgets*.md`                                                       |
| Trang cài đặt, danh sách đi sâu, cặp nhãn – giá trị (hộp nhóm macOS)                                                                                         | `reuse-first` §3.3 (`InsetGroup`) → `light-theme` §7                                                                                          |
| Icon cho phân hệ / màn hình / chứng từ (`icon` của `navigation.config.ts`)                                                                                   | `vci-icon-system` → `icon-conventions`                                                                                                        |
| Viết / sửa component UI kit                                                                                                                                  | `component-structure` → `ui-kit-architecture` → `comment-policy` → note của nhóm                                                              |
| Viết / sửa widget (`shared/widgets`)                                                                                                                         | `widget-composition` → `component-structure` → `notes/code/widgets*.md`                                                                       |
| Gọi API, lọc / phân trang trên URL                                                                                                                           | `api-patterns` → `async-safety`                                                                                                               |
| Store Zustand, `persist` (kể cả `skipHydration`)                                                                                                             | `state-management` → `async-safety` → `architecture.md` §4                                                                                    |
| Form, kiểm dữ liệu                                                                                                                                           | `form-validation` → `notes/components/form.md`                                                                                                |
| Bảng nhập liệu (ô sửa được: phiếu, danh mục, kế hoạch)                                                                                                       | `data-entry-table` → `keyboard-navigation` → `notes/components/data-display-table.md`                                                         |
| Ô tìm kiếm, so khớp chữ                                                                                                                                      | `ime-safe-input` → `search-matching`                                                                                                          |
| Bàn phím, link, modal hay sửa tại chỗ                                                                                                                        | `navigable-controls` → `keyboard-navigation` → `interaction-ux`                                                                               |
| Chọn màu                                                                                                                                                     | `light-theme` → `color-system` → `color-usage-guide` → `text-contrast`                                                                        |
| Chữ · icon · khoảng cách · mật độ                                                                                                                            | `font-system` · `icon-conventions` · `vci-icon-system` · `spacing-system` · `visual-hierarchy`                                                |
| CSS thuần, thanh cuộn                                                                                                                                        | `css-architecture` → `scrollbar`                                                                                                              |
| Biểu đồ                                                                                                                                                      | `chart-conventions` → `notes/code/charts.md`                                                                                                  |
| Responsive · màn nhỏ · điện thoại · tablet · laptop 14" / 16" (bố cục, sheet, bộ lọc, chụp ma trận viewport)                                                 | `responsive-screens` → `ipad-responsive`                                                                                                      |
| Máy tính bảng / PWA · màn TV                                                                                                                                 | `ipad-responsive` · `tv-display-mode`                                                                                                         |
| Biến môi trường, chế độ demo / app, triển khai (Vercel / Docker)                                                                                             | `README.md` gốc §Dựng dự án thật · `architecture.md` §15 · `quality-gates` §2b                                                                |
| Tối ưu render / bundle (React Compiler, `npm run analyze`)                                                                                                   | `code-optimization` → `architecture.md` §16                                                                                                   |
| Tạo / chuyển folder, đặt tên file                                                                                                                            | `folder-structure` → `code-style`                                                                                                             |
| Viết / sửa test                                                                                                                                              | `testing` → `quality-gates`                                                                                                                   |
| Browser smoke test (route thật, `proxy.ts`, phiên, chuyển ngôn ngữ, viewport) trên bản build production — `e2e/`, `npm run test:e2e`                         | `testing` §8 → `quality-gates`                                                                                                                |
| Trước khi commit / mở PR                                                                                                                                     | `quality-gates` → `security-checklist`                                                                                                        |
| Sửa tài liệu                                                                                                                                                 | `documentation-management` (trang này là mục lục)                                                                                             |
| Gặp hành vi lạ                                                                                                                                               | [`known-issues.md`](known-issues.md) trước khi sửa                                                                                            |

## Triệu chứng → file đầu tiên cần xem

Gặp lỗi mà chưa biết bắt đầu từ đâu: mở file ở cột giữa trước, rồi cột phải. Mục tiêu: lần ra file đầu tiên trong vài phút,
không cần hỏi người dựng base.

| Triệu chứng / việc                              | Đọc đầu tiên                                   | Sau đó                                                                                                  |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| API trả 401, refresh lặp                        | `src/core/http/api-client.ts`                  | `src/domains/session/lifecycle/session.lifecycle.ts`                                                    |
| Đăng nhập xong không chuyển trang               | `src/features/auth/service/auth.queries.ts`    | `src/app/_guards/GuestGate.tsx`                                                                         |
| Tải lại trang mất phiên hoặc treo ở màn chờ     | `src/app/_providers/sync/SessionBootstrap.tsx` | `src/domains/session/lifecycle/useRestoreSession.ts`                                                    |
| Đăng xuất còn dữ liệu của tài khoản cũ          | `src/app/_providers/bootstrap.ts`              | cache query, progress center, state có phạm vi tài khoản                                                |
| Menu không hiện / bấm ra 404                    | `src/app/_navigation/navigation.config.ts`     | `src/app/_navigation/build-menu.utils.ts`, quyền của mục                                                |
| Đường dẫn ngôn ngữ sai (`/en/…`, thiếu tiền tố) | `src/core/i18n/navigation.ts`                  | `src/proxy.ts`, `src/core/i18n/routing.ts`                                                              |
| Chữ hiện sai ngôn ngữ / hiện tên khoá           | `src/messages/vi/` và `src/messages/en/`       | `npm run check:i18n`, [`guides/i18n.md`](guides/i18n.md)                                                |
| Title / canonical / hreflang sai                | `src/app/_seo/page-metadata.ts`                | `src/core/seo/metadata.ts`, khoá `metadata.*` ở `src/messages`                                          |
| Nút / modal / bảng sai giao diện                | component trong `src/shared/ui/`               | file `*.theme.ts`, `parts/`, hook cùng module                                                           |
| Cảnh báo hydration / nháy bố cục điện thoại     | `src/shared/hooks/browser/useMediaQuery.ts`    | [`responsive-screens.md`](rules/display/responsive-screens.md) §2.4                                     |
| Route thành động (`ƒ`) sau `build`              | `scripts/check-static-routes.mjs`              | `cookies()` / `headers()` / `searchParams` ở layout hoặc page — [`architecture.md`](architecture.md) §3 |
| Build chậm hoặc JS tăng                         | import của route bị ảnh hưởng                  | `npm run analyze`; icon registry ở [`known-issues.md`](known-issues.md) mục F                           |
| Cổng kiến trúc đỏ                               | tên rule trong thông báo ESLint                | `scripts/eslint/architecture.mjs`, `scripts/eslint/syntax-guards.mjs`, hoặc test ở `tests/policy/`      |

## Toàn bộ rule

Chỉ 7 rule mang nhãn **(BẮT BUỘC)** ở tiêu đề — vi phạm là lỗi thật cho người dùng (dữ liệu sai,
mất dấu tiếng Việt, sai ngôn ngữ, lộ phiên…), không chỉ lệch quy ước: `async-safety`, `security-checklist`,
`ime-safe-input`, `search-matching`, `form-validation`, `navigable-controls`, `i18n`.

**`rules/foundations/` — nền chung**

| File                                                                      | Khi nào đọc                                                                                                                                  |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [development-rules](rules/foundations/development-rules.md)               | YAGNI / KISS / DRY (ngưỡng tách dùng chung), không tạo file `-v2`                                                                            |
| [folder-structure](rules/foundations/folder-structure.md)                 | ≤ 8 mục / folder, folder vai trò, đặt tên file, **giới hạn số dòng** (nguồn duy nhất), cây `src/app` + các folder `_`, cách chuyển file      |
| [code-style](rules/foundations/code-style.md)                             | Đặt tên, mẫu export component, vị trí `'use client'`, thứ tự import (kể cả `next/*`, `next-intl`), TypeScript                                |
| [clean-code-standards](rules/foundations/clean-code-standards.md)         | Một file một component, hằng / hàm ở module-scope, phần con nội bộ, `.ts` hay `.tsx`                                                         |
| [code-optimization](rules/foundations/code-optimization.md)               | React Compiler đã bật: khi nào VẪN cần `memo` / `useMemo` / `useCallback`; React Query, import, tải bundle                                   |
| [comment-policy](rules/foundations/comment-policy.md)                     | Bốn loại comment được phép; lý do dài đi đâu                                                                                                 |
| [documentation-management](rules/foundations/documentation-management.md) | Khi nào viết rule / note mới, giữ docs khớp code                                                                                             |
| [testing](rules/foundations/testing.md)                                   | Cây `tests/`, đặt tên, helper (provider next-intl), test luật; §8 browser smoke test Playwright (`e2e/`, mock API, chạy trên bản production) |
| [quality-gates](rules/foundations/quality-gates.md)                       | Cổng nào bắt luật nào, chạy khi nào, đỏ thì làm gì; hook husky, CI, kiểm env                                                                 |

**`rules/structure/` — chia code**

| File                                                                | Khi nào đọc                                                                                                                             |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [server-client-boundary](rules/structure/server-client-boundary.md) | **Ranh giới server / client**: file nào PHẢI có `'use client'`, file nào KHÔNG được có, hằng / hàm thuần tách file riêng, test giữ luật |
| [reuse-first](rules/structure/reuse-first.md)                       | Trước khi viết JSX: "cần X → dùng component / hook / util nào" (catalog)                                                                |
| [ui-kit-architecture](rules/structure/ui-kit-architecture.md)       | Nhóm của UI kit, cây quyết định đặt file, public API, 3R                                                                                |
| [component-structure](rules/structure/component-structure.md)       | Thứ tự trong file, bảng `*_CLASSES`, khối tài liệu, folder component                                                                    |
| [widget-composition](rules/structure/widget-composition.md)         | Khuôn widget `shared/widgets`, `*.theme.ts`, store cục bộ                                                                               |
| [page-structure](rules/structure/page-structure.md)                 | `page.tsx` mỏng + view; layout, shell, provider                                                                                         |
| [feature-structure](rules/structure/feature-structure.md)           | **Cây folder feature** (nguồn duy nhất), tính năng con                                                                                  |
| [routing-conventions](rules/structure/routing-conventions.md)       | Route theo hệ thống file, khai điều hướng một chỗ (`navigation.config.ts`), quyền, `proxy.ts` + guard                                   |

**`rules/i18n/` — đa ngôn ngữ**

| File                       | Khi nào đọc                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| [i18n](rules/i18n/i18n.md) | Mọi chữ hiển thị qua khoá dịch, `vi` là nguồn, `Link` / `useRouter` của `@/core/i18n`, hàm thuần nhận `locale`, `check:i18n` |

**`rules/seo/` — công cụ tìm kiếm**

| File                    | Khi nào đọc                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| [seo](rules/seo/seo.md) | Metadata / canonical / hreflang qua `core/seo`, JSON-LD, `PUBLIC_ROUTES` ↔ sitemap, `noindex` vùng riêng tư, preview tự chặn, SSG |

**`rules/data/` — dữ liệu**

| File                                                   | Khi nào đọc                                                                                        |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| [api-patterns](rules/data/api-patterns.md)             | `api/` · `service/` · React Query, lỗi báo một lần, lọc trên URL                                   |
| [async-safety](rules/data/async-safety.md)             | Mọi `await`: lượt mới nhất thắng, huỷ / reset, phiên, dữ liệu lưu trữ                              |
| [state-management](rules/data/state-management.md)     | Zustand vs React Query vs URL; store `persist` + `skipHydration`                                   |
| [form-validation](rules/data/form-validation.md)       | Schema Zod: `.trim().min(1)`, validator dùng chung                                                 |
| [security-checklist](rules/data/security-checklist.md) | Bảo mật & non-functional trước khi ship (env `NEXT_PUBLIC_*` vs server-only, header, cookie phiên) |

**`rules/interaction/` — tương tác**

| File                                                            | Khi nào đọc                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [navigable-controls](rules/interaction/navigable-controls.md)   | Đi tới trang = liên kết thật (`<Link>` của `@/core/i18n`), không `onClick={router.push}`        |
| [ime-safe-input](rules/interaction/ime-safe-input.md)           | Ô tìm kiếm / nhập tự do: `useImeSafeSearchInput`                                                |
| [search-matching](rules/interaction/search-matching.md)         | So khớp bỏ dấu: `matchesSearch` / `normalizeSearch`                                             |
| [keyboard-navigation](rules/interaction/keyboard-navigation.md) | Đi giữa các ô nhập bằng mũi tên                                                                 |
| [interaction-ux](rules/interaction/interaction-ux.md)           | Sửa tại chỗ hay modal, tự focus, phím tắt chuẩn + phím toàn app (`Ctrl/⌘+K` · `/` · `Ctrl/⌘+↑`) |

**`rules/styling/` — giao diện**

| File                                                          | Khi nào đọc                                                                                                                                                                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [light-theme](rules/styling/light-theme.md)                   | **Đọc đầu tiên khi làm giao diện**: ngôn ngữ theme SÁNG (mặc định) — màu thương hiệu VCI, nền, bo góc, độ nổi, header nổi (cấp 0–3, tab trang từ `xl`), Dock, tông phân hệ, mẫu macOS (hộp nhóm, kính, viền bắt sáng) |
| [color-system](rules/styling/color-system.md)                 | Token màu, `colors-theme.json`, ngoại lệ hex                                                                                                                                                                          |
| [color-usage-guide](rules/styling/color-usage-guide.md)       | Chọn token cho từng tình huống (nền lớp, chữ, viền, trạng thái, chart)                                                                                                                                                |
| [text-contrast](rules/styling/text-contrast.md)               | Cấp bậc màu chữ `fg-*`                                                                                                                                                                                                |
| [font-system](rules/styling/font-system.md)                   | `text-{scale}-{weight}`, độ nét chữ, `next/font`                                                                                                                                                                      |
| [icon-conventions](rules/styling/icon-conventions.md)         | `SystemIcon` (icon chrome), outline vs bold, thêm icon                                                                                                                                                                |
| [vci-icon-system](rules/styling/vci-icon-system.md)           | Bộ icon VCI: lưới 24, vòng hở + chấm nhấn từ logo, line / duo, `AppIcon`, thêm icon                                                                                                                                   |
| [spacing-system](rules/styling/spacing-system.md)             | Thang padding / gap, ai đệm ai tạo khe                                                                                                                                                                                |
| [visual-hierarchy](rules/styling/visual-hierarchy.md)         | Ngôn ngữ sáng / tối (§0b — HUD chỉ qua `dark:`), bố cục, mật độ, viền, số liệu                                                                                                                                        |
| [tailwind-conventions](rules/styling/tailwind-conventions.md) | `cn()`, thứ tự class, thang bo góc `rounded-*`                                                                                                                                                                        |
| [css-architecture](rules/styling/css-architecture.md)         | Bản đồ `src/styles/`, tầng layer, đặt CSS thuần ở đâu                                                                                                                                                                 |
| [scrollbar](rules/styling/scrollbar.md)                       | Class thanh cuộn, ba bẫy trình duyệt                                                                                                                                                                                  |

**`rules/display/` — thiết bị hiển thị**

| File                                                      | Khi nào đọc                                                                                                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [chart-conventions](rules/display/chart-conventions.md)   | Recharts qua `@/shared/charts`: mật độ, màu, trục, nhãn                                                                                                                                    |
| [data-entry-table](rules/display/data-entry-table.md)     | Bảng nhập liệu kiểu bảng tính: mật độ, control phẳng, trạng thái ô / dòng, bàn phím, dòng nháp, trạng thái lưu một chỗ (`TABLE_ENTRY_*`)                                                   |
| [responsive-screens](rules/display/responsive-screens.md) | **Rule tổng mọi cỡ màn**: bảng thiết bị → viewport, gate `phone:` / `touch:` / `max-wide:`, công thức điện thoại · tablet · laptop · màn ngoài, mẫu thành phần, bẫy, ma trận kiểm bằng máy |
| [ipad-responsive](rules/display/ipad-responsive.md)       | `touch:` / `standalone:`, vùng chạm, `dvh`, safe-area, laptop 14" / 16" (`max-wide:`), PWA                                                                                                 |
| [tv-display-mode](rules/display/tv-display-mode.md)       | Chế độ TV / kiosk                                                                                                                                                                          |

## Hướng dẫn

| File                                   | Khi nào đọc                                                                                                                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [app-layer](guides/app-layer.md)       | Tầng `src/app`: luồng khởi động, cây route, thêm trang / phân hệ / route con / quyền, guard và phiên, lỗi và màn chờ, layout, shell, test — từng bước, có mẫu code                                                          |
| [i18n](guides/i18n.md)                 | Thêm / sửa chuỗi dịch (Server và Client Component), thêm ngôn ngữ, `Link` / `useRouter`, định dạng theo ngôn ngữ, chạy `check:i18n` — từng bước                                                                             |
| [crud-feature](guides/crud-feature.md) | Màn CRUD đầu tiên từ feature mẫu `customers`: hợp đồng dữ liệu (DTO ↔ model), query key + `queryOptions`, bộ lọc trên URL, form + lỗi máy chủ, xoá, quyền, route tĩnh + `?id=`, dữ liệu giả ở chế độ demo, test — từng bước |
| [seo](guides/seo.md)                   | Thêm trang vào sitemap, đặt metadata / canonical / hreflang, JSON-LD, ảnh Open Graph, `noindex`, kiểm bằng `build` và `robots.txt` — từng bước                                                                              |

## Note

- `notes/components/`: `actions` · `data-display` · `data-display-table` · `feedback` · `form` · `icons` ·
  `inputs` · `layout` · `media` · `media-upload` · `navigation` · `overlays` · `pickers` · `primitives` ·
  `selects` · `surfaces` · `surfaces-cards` · `surfaces-hud`.
- `notes/code/`: `app` · `auth` · `charts` · `constants` · `core` · `customers` · `domains` · `hooks` · `utils` ·
  `widgets` (dock · tab-bar · command-palette · progress-center · work-tabs) · `widgets-header`.

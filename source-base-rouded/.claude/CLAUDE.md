# base-project — Claude Code memory

React 19 + TypeScript base template. Design system riêng — **"UI kit"** = `src/shared/ui/` (import `@/shared/ui`) —
đã hoàn chỉnh: đừng dựng lại, hãy **đọc và tái sử dụng**.

Theme **SÁNG là mặc định**, thương hiệu **VCI** (dải logo xanh lá → ngọc → lam + vàng kim, bo mềm theo thang
`rounded-*`, thanh header nổi đổi theo cấp — tab của trang lên header từ `xl`, Dock kiểu macOS); theme tối giữ ngôn ngữ
HUD (trang trí chỉ qua `dark:`, góc vuông). Làm giao diện → đọc `docs/rules/styling/light-theme.md` TRƯỚC; icon nhận
diện → `docs/rules/styling/vci-icon-system.md`; bảng có ô sửa được → `docs/rules/display/data-entry-table.md`.

## Tài liệu — mục lục DUY NHẤT

Mục lục (sắp làm gì → đọc rule nào, theo thứ tự; danh sách mọi rule theo `docs/rules/<nhóm>/…`) được nạp kèm file
này: @../docs/README.md

File này KHÔNG chép lại bảng rule. Sửa luật → sửa trong `docs/rules/<nhóm>/*.md`; thêm / đổi tên file tài liệu →
sửa dòng tương ứng ở `docs/README.md`. Quyết định kiến trúc + vì sao: `docs/architecture.md`. Việc còn treo:
`docs/known-issues.md`.

## Tech stack

| Layer | Lựa chọn |
|---|---|
| Framework | React 19 + TypeScript 5.9 + Vite 8 |
| Styling | Tailwind CSS v4 (CSS-first `@theme`, KHÔNG có `tailwind.config.js`) |
| Biến thể component | Bảng `*_CLASSES` + `cn()` — KHÔNG `tv()` ở bất cứ đâu |
| UI primitives | Radix UI (Dialog · Select · Popover · Tabs · Switch · RadioGroup · Avatar · Toast · ContextMenu · DropdownMenu) |
| Form | react-hook-form + zod v4 (`useZodForm`) |
| Server state · client state | TanStack Query v5 · Zustand v5 |
| Routing | React Router v7 — khai một chỗ ở module registry |
| Chart · kéo-thả · ngày giờ | Recharts v3 (qua `@/shared/charts`) · dnd-kit · dayjs |
| Test | Vitest (jsdom) + Testing Library — không có Playwright |

## Luật vàng — KHÔNG THƯƠNG LƯỢNG

**`@/shared/ui` là nguồn DUY NHẤT cho mọi UI.** Trước khi viết `.tsx`: tra `docs/rules/structure/reuse-first.md`
(bảng "HTML → UI kit" + catalog) rồi `docs/rules/structure/ui-kit-architecture.md` (cây quyết định đặt file).

```
1. REUSE   → Đã có component UI kit? DÙNG LẠI.
2. EXTEND  → Gần giống nhưng thiếu prop/variant? Thêm khoá vào union + bảng `*_CLASSES`.
3. CREATE  → CHỈ tạo mới khi không trùng concept với bất kỳ component nào.
```

Cấm: raw `<button>/<input>/<select>/<table>`, inline `<svg>`, hex màu trong `className`/`style` (3 ngoại lệ hợp lệ:
`docs/rules/styling/color-system.md` §"Ngoại lệ"), raw Tailwind font (`text-sm font-medium`), `clsx()`/`twMerge()`
trực tiếp (dùng `cn()`), tự viết `useToggle`/`useModal` (dùng `useDisclosure`), `any`, file fork `XxxV2.tsx`.

## Quy ước code đang áp (tóm tắt — luật đầy đủ ở file được trỏ)

- **Tên file theo vai trò:** `PascalCase.tsx` (= tên export) · `useXxx.ts` · `kebab-case.<vai>.ts` với vai ∈ `utils ·
  types · constants · theme · store · context · schema · api · queries · selectors · lifecycle · sync · config ·
  routes`; file làm MỘT việc được đặt kebab = tên một export (`create-query-client.ts` ↔ `createQueryClient`);
  file trong `utils/` → `*.utils.ts`; `parts/` chỉ phần NỘI BỘ, kebab-case — `folder-structure.md §4`.
- **Folder ≤ 8 mục**, gom theo chức năng; giới hạn số dòng file (máy giữ) — `folder-structure.md §1`. Cây feature:
  `feature-structure.md`.
- **Import public API:** UI kit `@/shared/ui` · hook `@/shared/hooks` · widget `@/shared/widgets/<widget>` (không
  barrel gốc) · util THEO FILE (`@/shared/utils/format/format.utils`) · domain / feature qua `index.ts` của nó.
  Barrel chỉ `export … from` — `folder-structure.md §5`. Chiều tầng: `app → features → domains → shared → core`.
- **React 19:** không `forwardRef` (`ref` là prop thường); file component kết thúc `export default Xxx`; cần memo thì
  `const Xxx = memo(function Xxx(…) {…})` — `code-style.md`.
- **Khối tài liệu SÁT trên component / hook:** `Tên — mô tả`, `@param props.<tên>` từng prop, `@example` (bắt buộc
  với component `shared/**`); ngoài đó chỉ JSDoc ≤ 3 dòng — `component-structure.md §4`, `comment-policy.md`.
  Lý do dài → note (`docs/notes/…`).
- **Toast / lỗi:** `showToast` · `showErrorToast` từ `@/shared/ui`; lỗi query / mutation đã được báo tập trung, câu
  báo qua `claimErrorMessage` (`@/core/http`) — `api-patterns.md`.
- **Bất đồng bộ:** `useLatestRequest`, kiểm `isCurrent()` sau MỖI `await`, có `catch` — `async-safety.md`. Store
  `persist`: hằng `XXX_STORAGE = { key, version }` + `storage: createSafeJSONStorage()` — `state-management.md`.
- **Lệnh:** `npm run typecheck` (⛔ KHÔNG `npx tsc --noEmit` — tsconfig kiểu solution, lệnh đó kiểm 0 file);
  trước commit / PR: `npm run check` xanh — `quality-gates.md`. Test: `docs/rules/foundations/testing.md`.

## Ví dụ chuẩn (đọc trước khi build feature mới)

- `src/features/auth/` — feature có gọi API thật: `api/ service/ schemas/ pages/ components/`, form dùng
  `useZodForm` + schema Zod + `Form`/`FormItem`/field UI kit.
- `src/features/demo/` — showcase toàn bộ UI kit (`library/`), màn ghép sẵn (`composed/ComposedDemoPage.tsx`),
  dashboard một viewport (`dashboard/`), bảng nhập liệu kiểu bảng tính (`entry/`, route `/demo/nhap-lieu`).
- `src/shared/ui/actions/Button.tsx` — mẫu chuẩn một file component UI kit.

## Skills (`.claude/skills/*/SKILL.md`)

| Skill | Dùng khi |
|---|---|
| `ui-kit-component-picker` | "Tình huống này dùng component nào" |
| `ui-styling` | Style một component, đổi theme, chọn token / biến thể |
| `frontend-development` | Viết component / page / hook mới |
| `new-feature` | Dựng một phân hệ / feature mới từ đầu (folder + module registry) |
| `react-best-practices` | Nghi chậm, tối ưu re-render / bundle |
| `frontend-design` | Dựng UI mới từ đầu, tránh thẩm mỹ rập khuôn "AI slop" |
| `web-testing` | Viết / sửa test Vitest + Testing Library |
| `fix` | Có bug / lỗi type / lint / CI — điều tra gốc rễ trước khi sửa; gồm cả khi bế tắc |
| `brainstorm` | Cân nhắc trade-off trước một quyết định kiến trúc khó đảo ngược |
| `docs` | Cập nhật tài liệu sau khi code đổi, hoặc viết rule mới |
| `git` | Commit / push / tạo PR |

Agents (`.claude/agents/`): `frontend` (viết UI theo UI kit) · `code-reviewer` (review theo rule của repo) ·
`ui-ux-designer` (bố cục, mật độ, tương phản).

## Design tokens — pipeline

| Đổi gì | Sửa file | Chạy lại |
|---|---|---|
| Màu sắc | `src/styles/theme/colors-theme.json` (`ramps` · `alias` · `shared` · `theme` [light, dark]) | `npm run generate:colors` |
| Typography | `src/styles/font/font.json` | `npm run generate:font` |
| Icon SVG | `src/assets/icons/*.svg` | ⛔ KHÔNG chạy `generate:icons` — generator lệch registry đã commit, xem `docs/known-issues.md` |
| Icon VCI (nhận diện) | `src/assets/vci-icons/*.svg` | `npm run generate:vci-icons` |
| Ảnh hệ thống | `src/assets/image/*` | ⛔ KHÔNG chạy `generate:images` (cùng lý do) |

KHÔNG BAO GIỜ sửa tay file sinh: `generated-colors.css`, `generated-font.css`, `shared/theme/colors.generated.ts`,
`shared/ui/icons/index.ts`, `shared/ui/icons/vci-icon/vci-icons.generated.ts`, `assets/icons/index.tsx`,
`assets/image/index.ts`.

## Cấu trúc thư mục

```
src/
  app/        lắp ráp: bootstrap.ts, components, layouts, pages, providers, router, shell — page-structure.md
  features/   1 thư mục / 1 nghiệp vụ (auth, demo) — feature-structure.md
  domains/    dữ liệu dùng chung nhiều feature: session (phiên, quyền), preferences (theme, TV)
  shared/     ui (UI kit) · widgets · charts · hooks · utils · constants · theme
  core/       nền tảng, KHÔNG biết giao diện: config (env schema) · http (apiClient, AppError) · query
  styles/     globals.css (entry — chỉ @import) + theme/ base/ utilities/ overrides/ modes/ font/ — css-architecture.md
```

Tầng dưới cần hành vi tầng trên → nhận qua tham số ở `src/app/bootstrap.ts` (`docs/architecture.md §1`).

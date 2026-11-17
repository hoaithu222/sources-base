# base-project — Claude Code memory

Next.js 16 (App Router) + React 19 + TypeScript base template. Design system riêng — **"UI kit"** = `src/shared/ui/`
(import `@/shared/ui`) — đã hoàn chỉnh: đừng dựng lại, hãy **đọc và tái sử dụng**.

Theme **SÁNG là mặc định**, thương hiệu **VCI** (dải logo xanh lá → ngọc → lam + vàng kim, bo mềm, header nổi, Dock kiểu
macOS); theme tối giữ ngôn ngữ HUD (trang trí chỉ qua `dark:`, góc vuông). Làm giao diện → đọc
`docs/rules/styling/light-theme.md` TRƯỚC; icon nhận diện → `vci-icon-system.md`; bảng ô sửa được → `docs/rules/display/data-entry-table.md`.

## Tài liệu — mục lục DUY NHẤT

Mục lục (sắp làm gì → đọc rule nào, theo thứ tự; mọi rule theo `docs/rules/<nhóm>/…`) được nạp kèm file này: @../docs/README.md

File này KHÔNG chép lại bảng rule. Sửa luật → `docs/rules/<nhóm>/*.md`; thêm / đổi tên file tài liệu → sửa dòng ở
`docs/README.md`. Quyết định kiến trúc + vì sao: `docs/architecture.md`. Việc còn treo: `docs/known-issues.md`.

## Tech stack

| Layer         | Lựa chọn                                                                                                                                                 |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | Next.js 16 App Router + Turbopack · React 19 + React Compiler (`reactCompiler: true`) · TypeScript ~6.0 (ghim có chủ ý, `architecture.md §17`)           |
| Render · auth | SSG mặc định (`[locale]` + `next/root-params`) · `src/proxy.ts` chặn sớm vùng riêng tư                                                                   |
| i18n          | next-intl — `vi` (mặc định, không tiền tố) · `en`; thông điệp `src/messages/<locale>/*.json`                                                             |
| Styling       | Tailwind CSS v4 qua `@tailwindcss/postcss` (CSS-first `@theme`, KHÔNG có `tailwind.config.js`) · biến thể = bảng `*_CLASSES` + `cn()`, KHÔNG `tv()`      |
| UI · Form     | Radix UI (Dialog · Select · Popover · Tabs · Switch · RadioGroup · Avatar · Toast · ContextMenu · DropdownMenu) · react-hook-form + Zod 4 (`useZodForm`) |
| State · chart | TanStack Query 5 · Zustand 5 · Recharts 3 (qua `@/shared/charts`) · dnd-kit · dayjs                                                                      |
| Test          | Vitest 5 (jsdom) + Testing Library · Playwright (`e2e/`, chạy trên bản build production qua `npm run test:e2e`, chỉ CI + chạy chủ động)                  |

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

**Luật vàng của Next:**

1. **Ranh giới server / client** (`docs/rules/structure/server-client-boundary.md`). `page.tsx` / `layout.tsx` là Server
   Component MỎNG: `generateMetadata` + ghép MỘT view. Mọi file chạm API chỉ-client (hook state / effect, `createContext`, prop
   sự kiện, Radix · Zustand · RHF · Recharts · dnd-kit, `next/navigation`) PHẢI có `'use client'` — kể cả `.ts` (hook, store,
   context). Component thuần trình bày KHÔNG thêm directive. Hằng / bảng class / hàm thuần ở file riêng
   (`*.theme.ts` · `*.constants.ts` · `*.utils.ts`) để Server Component gọi được.
2. **Mọi chữ người dùng thấy đi qua next-intl** (`docs/rules/i18n/i18n.md`, `docs/guides/i18n.md`) — KHÔNG hard-code
   tiếng Việt / tiếng Anh. `useTranslations('ns')` ở component; `getTranslations` (`@/core/i18n/server`) ở hàm async server. Khoá
   phải có ở CẢ `src/messages/vi` và `en` (`tsc` + `npm run check:i18n`; ESLint chỉ bắt chữ Việt cứng — chữ Anh cứng là việc review). `Link` · `useRouter` · `usePathname` · `redirect` từ
   `@/core/i18n` (prop `href`), KHÔNG `next/link`.
3. **Mỗi trang có metadata + SEO** (`docs/rules/seo/seo.md`, `docs/guides/seo.md`): `generateMetadata` bằng
   `generatePageMetadata({ params, key, path })` (`@/app/_seo/page-metadata`; khoá `metadata.<key>` ở cả hai locale; mặc định
   `noindex`) hoặc `buildPageMetadata` (`@/core/seo`) khi cần JSON-LD. Trang công khai → `noIndex: false` + một dòng ở
   `PUBLIC_ROUTES` (`src/app/_navigation/public-routes.ts`). Đúng MỘT `<h1>` / trang. JSON-LD qua `<JsonLd>` (escape `<`).
4. **Giữ trang tĩnh.** Thêm / đổi route xong chạy `npm run build`, đọc bảng `Route (app)`: KHÔNG có `ƒ` (động) ngoài
   `[...rest]` và `/api/*`. Thủ phạm: `cookies()` / `headers()` / `searchParams` ở server, `useSearchParams` thiếu `<Suspense>`.
5. **KHÔNG sửa tay file sinh** (danh sách ở "Design tokens") — lần chạy sau ghi đè.

## Quy ước code đang áp (tóm tắt — luật đầy đủ ở file được trỏ)

- **Tên file theo vai trò:** `PascalCase.tsx` (= tên export) · `useXxx.ts` · `kebab-case.<vai>.ts` với vai ∈ `utils ·
types · constants · theme · store · context · schema · api · queries · selectors · lifecycle · sync · config`;
  file làm MỘT việc đặt kebab = tên một export (`create-query-client.ts` ↔ `createQueryClient`); `parts/` chỉ phần
  NỘI BỘ — `folder-structure.md §4`. **Folder ≤ 8 mục**, giới hạn số dòng file (máy giữ) — `§1`; cây feature: `feature-structure.md`.
- **Import public API:** UI kit `@/shared/ui` · hook `@/shared/hooks` · widget `@/shared/widgets/<widget>` (không
  barrel gốc) · util THEO FILE (`@/shared/utils/format/format.utils`) · domain / feature qua `index.ts` của nó.
  Barrel chỉ `export … from` — `folder-structure.md §5`. Chiều tầng: `app → features → domains → shared → core`.
- **React 19 + Compiler:** không `forwardRef` (`ref` là prop thường); file component kết thúc `export default Xxx`; Compiler
  tự memo hoá nên KHÔNG thêm `memo` / `useMemo` / `useCallback` phản xạ — `code-style.md`, `code-optimization.md`.
- **Khối tài liệu SÁT trên component / hook:** `Tên — mô tả`, `@param props.<tên>`, `@example` (bắt buộc với `shared/**`);
  ngoài đó chỉ JSDoc ≤ 3 dòng — `component-structure.md §4`, `comment-policy.md`. Lý do dài → note (`docs/notes/…`).
- **Toast / lỗi:** `showToast` · `showErrorToast` từ `@/shared/ui`; lỗi query / mutation đã được báo tập trung qua
  `claimErrorMessage` (`@/core/http`) — `api-patterns.md`.
- **Bất đồng bộ:** `useLatestRequest`, kiểm `isCurrent()` sau MỖI `await`, có `catch` — `async-safety.md`. Store `persist`:
  `XXX_STORAGE = { key, version }` + `createSafeJSONStorage()` + `skipHydration: true` + `registerPersistedStore` — `state-management.md`.
- **Env:** client đọc `NEXT_PUBLIC_*` qua `appConfig` (`@/core/config`), truy cập THẲNG `process.env.NEXT_PUBLIC_X`; secret chỉ ở
  biến server-only (`serverConfig`, `import 'server-only'`) — KHÔNG đặt secret vào `NEXT_PUBLIC_*`.

## Lệnh

| Lệnh                         | Việc                                                                                                                                                                                                                                                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                | Dev server Turbopack — http://localhost:3000                                                                                                                                                                                                         |
| `npm run typecheck`          | `next typegen && tsc --noEmit` (⛔ KHÔNG `tsc --noEmit` trần — thiếu kiểu route `PageProps` / `LayoutProps`)                                                                                                                                         |
| `npm run check`              | `check:hooks → typecheck → lint → check:eslint-config → format:check → check:i18n → check:imports → check:cycles → check:unused-files → test` — xanh trước commit / PR (`quality-gates.md`); sửa lỗi định dạng / lint: `npm run format` · `lint:fix` |
| `npm run build`              | `generate:styles` + `next build` (đọc bảng Route); `check:fast` = kiểu + lint + kiến trúc (pre-push) · `check:ci` = đúng bộ CI (+ coverage, smoke, build demo + app) · `verify:commit` = build BẢN STAGE · `analyze` = phân tích bundle              |
| `npm run test:unit -- <tên>` | Vòng lặp test nhanh (`test:smoke`, `test:watch`) — `docs/rules/foundations/testing.md`                                                                                                                                                               |

Lỗi lạ sau khi đổi `next.config.ts` / env / route → xoá `.next/` rồi chạy lại (cache Turbopack).

## Ví dụ chuẩn · Skills · Agents

- `src/features/auth/` (API thật: `api/ service/ schemas/ views/ components/`) + route mỏng `src/app/[locale]/(workspace)/(auth)/login/page.tsx`
  · `src/app/[locale]/(public)/about/page.tsx` + `_views/marketing/AboutView.tsx` (trang công khai SSG: metadata + `JsonLd` + view)
  · `src/shared/ui/actions/Button.tsx` (mẫu một file component UI kit).
- Skills (`.claude/skills/*/SKILL.md`, mô tả ở frontmatter): `ui-kit-component-picker` · `ui-styling` · `frontend-development` ·
  `new-feature` · `react-best-practices` · `frontend-design` · `web-testing` · `fix` (cả khi bế tắc) · `brainstorm` · `docs` · `git`.
- Agents (`.claude/agents/`): `frontend` (viết UI theo UI kit) · `code-reviewer` (review theo rule của repo) ·
  `ui-ux-designer` (bố cục, mật độ, tương phản).

## Design tokens — pipeline

| Đổi gì               | Sửa file                                                                                                         | Chạy lại                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Màu sắc              | `src/styles/theme/colors-theme.json` (`ramps` · `alias` · `shared` · `theme` [light, dark])                      | `npm run generate:colors`                                                        |
| Typography           | `src/styles/font/font.json`                                                                                      | `npm run generate:font`                                                          |
| Icon SVG             | `src/assets/icons/*.svg`                                                                                         | `npm run generate:icons` (sinh cả registry; `npm run check:generated` kiểm khớp) |
| Icon VCI (nhận diện) | `src/assets/vci-icons/*.svg`                                                                                     | `npm run generate:vci-icons`                                                     |
| Ảnh hệ thống         | `src/assets/image/*`                                                                                             | `npm run generate:images`                                                        |
| Icon PWA             | `public/favicon.svg`                                                                                             | `npm run generate:pwa-icons` → `public/icons/*.png`                              |
| Chữ giao diện        | `src/messages/{vi,en}/<namespace>.json` (vi = nguồn kiểu; namespace mới → gắn vào `vi/index.ts` + `en/index.ts`) | SỬA TAY (không sinh); kiểm `npm run typecheck` + `check:i18n`                    |

KHÔNG BAO GIỜ sửa tay file sinh: `generated-colors.css`, `generated-font.css`, `shared/theme/colors.generated.ts`,
`shared/ui/icons/index.ts`, `shared/ui/icons/vci-icon/vci-icons.generated.ts`, `assets/icons/index.tsx`, `assets/icons/standalone.tsx`,
`assets/image/index.ts`, `public/icons/*.png`, `.next/`, `next-env.d.ts`.

## Cấu trúc thư mục

```
src/
  app/        TẦNG LẮP RÁP = thư mục route của Next — page-structure.md, guides/app-layer.md
    [locale]/   route: (public) SSG marketing · (workspace)/(auth) trang khách · (workspace)/(app) vùng làm việc
    _providers/ _layouts/ _shell/ _views/ _navigation/ _guards/ _components/ _seo/   thư mục private (`_` = Next bỏ qua)
  features/   1 thư mục / 1 nghiệp vụ: api/ service/ schemas/ views/ components/ — feature-structure.md
  domains/    dữ liệu dùng chung nhiều feature: session (phiên, quyền), preferences (theme, TV)
  shared/     ui (UI kit) · widgets · charts · hooks · utils · constants · theme
  core/       nền tảng, KHÔNG biết giao diện: config (env schema) · http (apiClient, AppError) · query · i18n · seo
  messages/   thông điệp dịch {vi,en}/<namespace>.json (ngoài tầng)
  styles/     globals.css (entry — chỉ @import) + theme/ base/ utilities/ overrides/ modes/ font/ — css-architecture.md
  proxy.ts    cổng chặn trước route (phiên + ngôn ngữ) — Next 16, không phải middleware.ts
```

Tầng dưới cần hành vi tầng trên → nhận qua tham số ở `src/app/_providers/bootstrap.ts` (`docs/architecture.md §1`).

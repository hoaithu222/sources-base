# Next Base

Khung dự án **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4**, chuyển từ base Vite + React Router
(`source-base-rouded`) sang để có SSR / SSG, SEO và đa ngôn ngữ ngay từ nền. Giữ phần nền đã được kiểm chứng, bỏ toàn bộ
nghiệp vụ. Đây là bản **SÁNG làm mặc định** cho ERP mang thương hiệu **VCI** (dải xanh lá → ngọc → lam của logo + vàng kim,
bo mềm, thanh header nổi đổi theo cấp, Dock kiểu macOS, bộ icon VCI); theme tối HUD vẫn còn (nút đổi theme, chế độ TV) —
ngôn ngữ giao diện: [`light-theme.md`](docs/rules/styling/light-theme.md).

**Trong hộp:** UI kit (design system riêng, `src/shared/ui`) · hệ form RHF + Zod 21 field · design token sinh từ JSON
(189 màu × 2 theme, 14 thang chữ, 377 icon hệ thống + bộ icon VCI) · auth JWT có refresh chống bão · **đa ngôn ngữ
`vi` / `en`** (next-intl, `vi` không tiền tố URL) · **SEO dựng từ nền** (metadata + canonical + hreflang, JSON-LD, sitemap,
robots, ảnh Open Graph có chữ Việt, preview tự `noindex`) · route do hệ thống file quyết, menu / Dock / ⌘K dựng từ MỘT khai
báo điều hướng · hook / util dùng chung · bộ quy tắc code có máy giữ (ESLint + test luật).

**Không có:** màn hình nghiệp vụ. Base có sẵn trang chủ + giới thiệu (công khai, SSG), đăng nhập, đăng ký, quên / đặt lại mật
khẩu, bảng điều khiển, hồ sơ, cài đặt, và **`/demo`** — một trang trưng bày gọn các nhóm UI kit chính (bản Vite có thư viện
demo đầy đủ 151 file, chưa chuyển — xem [`docs/known-issues.md`](docs/known-issues.md)).

> ⚠️ **Base xuất xưởng ở chế độ DEMO** (`NEXT_PUBLIC_APP_MODE=demo` trong `.env`): kiểm đăng nhập tắt, có phân hệ
> "Thư viện UI", `npm run dev` vào thẳng mọi trang khi chưa có backend. **Dự án thật phải đổi sang
> `NEXT_PUBLIC_APP_MODE=app`** — kiểm đăng nhập bật, build production dừng nếu thiếu cấu hình. Xem
> [Dựng dự án thật](#dựng-dự-án-thật) và [`docs/architecture.md` §15](docs/architecture.md).

📚 **Tài liệu: [`docs/README.md`](docs/README.md)** — mục lục duy nhất: sắp làm gì thì đọc gì, theo thứ tự.

---

## Bắt đầu

```bash
npm ci                         # cài ĐÚNG package-lock (Node ≥ 22.22.2 — xem .nvmrc, engines)
cp .env.example .env.local     # tuỳ chọn: giá trị riêng của máy bạn
npm run dev                    # http://localhost:3000
```

`.env` (được commit) giữ mặc định dùng chung; `.env.local` (không commit) ghi đè cho máy bạn. Backend chạy ở cổng khác `5000`
thì đặt `API_PROXY_TARGET` trong `.env.local` — `next.config.ts` rewrite `/api/*` tới đó. Biến sai định dạng làm
`npm run dev` / `build` dừng ngay kèm tên biến sai. Danh sách biến và ý nghĩa: [`.env.example`](.env.example).

> ⛔ **Repo phải có `.git` TRƯỚC `npm ci`.** Hook `prepare` cài husky, mà husky cần thư mục `.git`. Thiếu nó husky in
> `.git can't be found` rồi **thoát 0** — cài vẫn "thành công" nhưng hook không được gắn, mọi guard im lặng không chạy. Repo
> này đã `git init` sẵn; chép thư mục ra chỗ khác thì `git init` trước. Lỡ rồi thì `git init && npm run prepare`.

### Chế độ demo và chế độ app

|                                                | `demo` (base xuất xưởng)               | `app` (mặc định khi không khai)                                                             |
| ---------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| Kiểm đăng nhập (`NEXT_PUBLIC_AUTH_ENABLED`)    | TẮT                                    | **BẬT** — `proxy.ts` chặn vùng riêng tư ở server, `AuthGate` lo phần còn lại ở trình duyệt |
| Phân hệ `/demo`                                | Có                                     | `notFound()`                                                                                |
| `npm run build`                                | Chạy, in cảnh báo "đang build bản demo" | **Dừng** nếu `NEXT_PUBLIC_AUTH_ENABLED=false`, thiếu `NEXT_PUBLIC_API_BASE_URL` hoặc `NEXT_PUBLIC_SITE_URL` |

## Lệnh hằng ngày

| Lệnh                                                          | Việc                                                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                                 | Máy chủ phát triển (Turbopack) — `predev` cảnh báo nếu hook husky chưa cài                                 |
| `npm run test:unit -- <tên>`                                  | Test đơn vị (nhanh, dùng lúc code); `npm run test:smoke` — test dựng cả cây app                             |
| `npm run typecheck`                                           | `next typegen && tsc --noEmit` — ⛔ KHÔNG chạy `tsc --noEmit` đơn lẻ: thiếu kiểu route (`PageProps<…>`) do `next typegen` sinh |
| `npm run lint` / `lint:fix`                                   | ESLint (`--max-warnings 0`)                                                                                |
| `npm run format` / `format:check`                             | Prettier — ghi lại / chỉ kiểm (không phủ `.md`)                                                            |
| **`npm run check`**                                           | **Trước khi đẩy code:** hook → typecheck → lint → cấu hình ESLint → định dạng → i18n → kiểm import → kiểm vòng → file thừa → test |
| `npm run check:fast`                                          | Nhanh (pre-push): kiểu → lint → cấu hình ESLint → i18n → kiểm import → kiểm vòng                           |
| `npm run check:ci`                                            | Như CI: static check + coverage + smoke + `build` + route tĩnh + `build:app`                               |
| `npm run build` · `npm start`                                 | Sinh style → `next build` (đọc bảng `Route (app)` — không có `ƒ` ngoài `[...rest]` và `/api/*`) · chạy bản đã build |
| `npm run analyze`                                             | Phân tích bundle theo route (`next experimental-analyze`, Turbopack) — không có cổng ngân sách bundle         |
| `npm run check:i18n`                                          | Hai ngôn ngữ đủ khoá như nhau; khoá dùng mà chưa khai / khai mà không dùng                                 |
| `npm run test:coverage`                                       | Độ phủ — có ngưỡng cho `core/` và `domains/session/`                                                       |
| `npm run test:e2e`                                            | Browser smoke test (Playwright + Chrome hệ thống) trên BẢN BUILD PRODUCTION chế độ app, backend giả bằng `page.route` — KHÔNG nằm trong `check` (`testing.md §8`) |
| `npm run check:unused-files` · `npm run report:unused-exports` | File / gói thừa (chặn, nằm trong `check`) · export thừa (chỉ báo cáo)                                      |
| `npm run generate:styles`                                     | Sinh lại CSS màu + chữ từ JSON (tự chạy trong `build`)                                                     |
| `npm run generate:vci-icons`                                  | Sinh dữ liệu bộ icon VCI từ `src/assets/vci-icons/*.svg` (`vci-icon-system.md`)                            |
| `npm run generate:pwa-icons`                                  | Sinh icon PNG của PWA từ `public/favicon.svg`                                                              |
| `npm run generate:images`                                     | Sinh registry ảnh `src/assets/image/index.ts` (import tĩnh của Next, lấy `.src`)                           |
| `npm run generate:icons`                                      | Sinh `assets/icons/index.tsx` + registry `shared/ui/icons/index.ts` từ SVG; `npm run check:generated` kiểm khớp |

Cổng nào bắt luật nào, đỏ thì làm gì: [`docs/rules/foundations/quality-gates.md`](docs/rules/foundations/quality-gates.md).

## Cấu trúc `src/`

```
src/
├── proxy.ts            Cổng chặn TRƯỚC route (Next 16): vùng riêng tư cần cookie phiên + định tuyến ngôn ngữ
├── app/                Tầng lắp ráp = thư mục route của Next — biết về ứng dụng CỤ THỂ này
│   ├── [locale]/       Route: layout gốc + (public) SSG · (workspace)/(auth) trang khách · (workspace)/(app) vùng làm việc
│   ├── robots.ts · sitemap.ts · manifest.ts · global-error.tsx · global-not-found.tsx · api/health/
│   ├── _providers/     BaseProviders · AppProviders · bootstrap.ts (nối HTTP ↔ phiên ↔ cache ↔ thông báo) · LocaleSync
│   ├── _layouts/       AppShellLayout (lề, header, dock, ⌘K) · AuthLayout · public/ (header, footer trang công khai)
│   ├── _shell/         Nối widget với store: AppHeader · AppDock · AppCommandPalette · AppTabBar
│   ├── _views/         Nội dung trang (page.tsx chỉ ghép): Landing · About · Dashboard · Profile · Settings · status/ · demo/
│   ├── _navigation/    navigation.config.ts (khai MỘT chỗ) · useAppMenu · public-routes.ts (sitemap / robots)
│   ├── _guards/        AuthGate · GuestGate · PermissionGate (lớp thứ hai sau proxy.ts)
│   ├── _components/    Màn chờ / màn lỗi / LocaleSwitcher dùng chung
│   └── _seo/           page-metadata.ts — gắn metadata của từng route
├── features/           Một nghiệp vụ một folder — base có auth/ (api · service · schemas · components · views)
├── domains/            Dữ liệu dùng chung nhiều feature: session/ (phiên, quyền) · preferences/ (theme, TV)
├── shared/             Dùng chung, KHÔNG biết nghiệp vụ
│   ├── ui/             UI kit — 14 nhóm theo chức năng, import qua @/shared/ui
│   ├── widgets/        header/ · dock/ · tab-bar/ · command-palette/ · progress-center/ · work-tabs/ (import @/shared/widgets/<widget>)
│   ├── charts/         Hạ tầng Recharts: mật độ, bảng màu, trục, nhãn
│   ├── hooks/          state/ · timing/ · url/ · dom/ · browser/ · input/ · table/
│   ├── utils/          format/ · style/ · browser/ · validation/ · url/ (import THEO FILE, không barrel)
│   ├── constants/      *.constants.ts: PATHS, layout, phân trang…
│   └── theme/          colors.generated.ts (SINH TỰ ĐỘNG)
├── core/               Nền tảng, KHÔNG biết store / giao diện: config/ · http/ · query/ · i18n/ · seo/
├── messages/           Thông điệp dịch: vi/ (NGUỒN, định kiểu) · en/ — <locale>/<namespace>.json
├── styles/             globals.css (entry, chỉ @import) + theme/ base/ utilities/ overrides/ modes/ + font/
└── assets/             icons/ (377 SVG) · vci-icons/ · image/ · fonts/og/ — kèm registry sinh tự động
```

Chiều phụ thuộc (ESLint chặn cứng): `app → features → domains → shared → core`. Mỗi folder ≤ 8 mục — luật:
[`folder-structure.md`](docs/rules/foundations/folder-structure.md). Ranh giới server / client (file nào cần `'use client'`):
[`server-client-boundary.md`](docs/rules/structure/server-client-boundary.md).

## Những quyết định đáng biết

| Quyết định                                                                                | Vì sao (1 câu)                                                                                                             | Chi tiết                                   |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Tầng một chiều, tầng dưới nhận hành vi qua tham số ở `_providers/bootstrap.ts`            | Tầng nào cũng thay / test được độc lập, không thể có vòng import giữa tầng                                                 | `architecture.md` §1                       |
| `page.tsx` / `layout.tsx` là Server Component mỏng; mọi file chạm API chỉ-client có `'use client'` | `@/shared/ui` là một barrel mà Server Component import — thiếu directive là lỗi biên dịch; thuần trình bày thì KHÔNG thêm | `architecture.md` §2                       |
| Mọi route `[locale]/…` là SSG, ngôn ngữ đọc từ `next/root-params` (không `setRequestLocale`) | Prerender tĩnh không phụ thuộc việc nhớ gọi API ở từng layout / page                                                       | `architecture.md` §3                       |
| Provider chia hai tầng: `BaseProviders` (root) · `AppProviders` (chỉ `(workspace)`)       | Trang marketing không tải React Query / phiên / toast — Core Web Vitals                                                    | `architecture.md` §3                       |
| Auth hai lớp: `proxy.ts` chặn sớm (có cookie phiên không?) + `AuthGate` ở trình duyệt     | Người lạ không nhận HTML riêng tư; cookie hỏng không gây vòng lặp `/login` ⇄ `/dashboard`                                  | `architecture.md` §3 · §11                 |
| Store `persist` bật `skipHydration`, nạp lại MỘT lần sau hydrate                          | Render đầu ở trình duyệt phải khớp HTML server (không có localStorage)                                                     | `architecture.md` §4                       |
| `vi` không tiền tố (`/login`), `en` có (`/en/login`); điều hướng qua `@/core/i18n`         | URL cũ giữ nguyên, mỗi ngôn ngữ một địa chỉ để lập chỉ mục                                                                 | `architecture.md` §5                       |
| UI kit chia theo chức năng, import qua barrel `@/shared/ui`                               | Người ta nhớ component _làm gì_, không nhớ nó "atomic" hay "composite"                                                     | `ui-kit-architecture.md`                   |
| Biến thể = bảng `*_CLASSES` `satisfies Record<…>` + `cn()`, không `tv()`                  | Thiếu ô là `tsc` đỏ; `tv()` nuốt class màu chữ khi gặp token font                                                          | `component-structure.md` §2                |
| Trang ghép `PageShell` → `TitleScreen` → `Toolbar` → `PageBody`, không tự đệm             | Lề cấp một lần ở `AppShellLayout` nên header và nội dung nằm trên một lưới                                                 | `architecture.md` §8                       |
| Màu / chữ / icon sinh từ JSON / SVG                                                       | Một nguồn cho CSS lẫn TS; test chặn class không tồn tại (Tailwind im lặng bỏ qua)                                          | `architecture.md` §9                       |
| Access token chỉ trong bộ nhớ, một đường refresh ba nhánh                                 | Không mở cửa cho XSS; refresh xoay vòng bắn song song là phiên chết oan                                                    | `architecture.md` §11                      |
| Lỗi HTTP là `AppError`, báo một lần ở tầng query                                          | Không toast trùng, chỉ báo sau khi đã thử lại xong                                                                         | `api-patterns.md`                          |
| Điều hướng khai MỘT chỗ (`navigation.config.ts`), route do hệ thống file quyết             | Dock, header, ⌘K, tab bar, tên tab cùng dựng từ một khai báo; test đối chiếu khai báo ↔ thư mục route                       | `routing-conventions.md`                   |
| Sáng mặc định; trang trí HUD và góc vuông chỉ ở theme tối (`dark:`)                       | Một bộ component cho hai ngôn ngữ, không hai bộ class phải giữ khớp                                                        | `architecture.md` §20 · `light-theme.md`   |
| ESLint chặn ô tìm kiếm controlled và `toLowerCase().includes`                             | Hai lỗi tiếng Việt đã gây bug thật: mất dấu khi gõ, tìm không dấu không ra                                                 | `ime-safe-input.md` · `search-matching.md` |
| `NEXT_PUBLIC_APP_MODE` demo / app; env qua schema Zod, tách `NEXT_PUBLIC_*` / server-only   | Chạy được khi chưa có backend mà không lọt bản demo lên production; secret không lọt vào bundle                            | `architecture.md` §15                      |
| React Compiler bật (`reactCompiler: true`)                                                | Không rải `memo` / `useMemo` / `useCallback` "cho chắc"                                                                    | `code-optimization.md`                     |
| `tsc` qua `next typegen`; TypeScript ghim `~6.0`; `dpdm` kiểm vòng import                    | Kiểu route cần sinh trước; TS 7 làm sập typescript-eslint; madge khai peer TypeScript ^5 và ngừng bảo trì                 | `architecture.md` §17                      |

Nợ kỹ thuật và việc còn treo (có trạng thái): [`docs/known-issues.md`](docs/known-issues.md).

## Dựng dự án thật

1. **Đổi chế độ và khai cấu hình** (`.env`; CI: biến của job `build-app` trong `.github/workflows/ci.yml`):

   | Biến                                        | Khai gì                                                                                                      |
   | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
   | `NEXT_PUBLIC_APP_MODE=app`                  | Kiểm đăng nhập tự bật, `/demo` thành 404                                                                     |
   | `NEXT_PUBLIC_API_BASE_URL`                  | Gốc API: `/api` (same-origin, qua rewrite) hoặc URL đầy đủ. Build dừng nếu không khai tường minh             |
   | `NEXT_PUBLIC_SITE_URL`                      | Gốc site THẬT (`https://example.com`, không `/` cuối) — nền của canonical, hreflang, sitemap, robots, ảnh OG. Trên Vercel có thể bỏ trống (lấy host production) |
   | `API_PROXY_TARGET` (server-only)            | Đích `rewrites()` của `/api/*` — mặc định `http://localhost:5000`; đặt trước `next build`                    |
   | `AUTH_SESSION_COOKIE` (server-only)         | Tên cookie HttpOnly mà BE đặt khi đăng nhập (mặc định `refresh_token`); `proxy.ts` chỉ kiểm cookie CÓ TỒN TẠI |
   | `SEO_ALLOW_INDEXING` (server-only)          | Bỏ trống: production = cho lập chỉ mục, còn lại (preview / staging) = chặn toàn bộ. Chỉ đặt tay khi cần ghi đè |
   | `NEXT_PUBLIC_APP_NAME`                      | Tên app — hiện ở `<title>`, Open Graph, JSON-LD, manifest                                                    |
   | `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` | Mã xác minh quyền sở hữu site (tuỳ chọn)                                                           |

   ⛔ Mọi biến `NEXT_PUBLIC_*` nằm TRONG bundle gửi cho trình duyệt — không đặt secret ở đó.
2. **Gỡ demo** (khi đã có màn hình thật):
   - bỏ `demoModule` khỏi `src/app/_navigation/navigation.config.ts`;
   - xoá route `src/app/[locale]/(workspace)/(app)/demo/` và view `src/app/_views/demo/`;
   - bỏ `PATHS.DEMO` (+ dòng trong `PROTECTED_PATH_PREFIXES`) ở `src/shared/constants/paths.constants.ts`, bỏ lối vào `/demo` ở
     `DashboardView`; xoá khoá `demo` / `demoLibrary` ở `src/messages/{vi,en}/shell.json` và `metadata.json`;
   - xoá namespace `demo` của catalog: `src/messages/{vi,en}/demo.json`, dòng `demo` ở `vi/index.ts` + `en/index.ts`, `'demo'` ở
     `CLIENT_NAMESPACES` (`src/core/i18n/messages.ts`);
   - sửa test còn nhắc path demo (`grep -rn "/demo" tests/`) và xoá `tests/app/_views/demo-catalog*.test.ts*`.
   Chạy `npm run check` — knip (`check:unused-files`) và `check:i18n` báo phần còn sót.
3. **Thêm phân hệ đầu tiên:** skill `new-feature`, hoặc theo [`docs/guides/app-layer.md`](docs/guides/app-layer.md): tạo thư mục route
   dưới `src/app/[locale]/(workspace)/(app)/<path>/` (`page.tsx` mỏng + view), khai ở `navigation.config.ts`, thêm chữ ở
   `messages/{vi,en}/shell.json` (`nav.<id>`). Khai path ở cấu hình thì PHẢI có `page.tsx` — test đối chiếu.
4. Đổi tên app (`NEXT_PUBLIC_APP_NAME`), logo (`src/assets/image/logo-vci.svg`), favicon (`public/favicon.svg` rồi
   `npm run generate:pwa-icons`), màu thương hiệu (`src/styles/theme/colors-theme.json` rồi `generate:styles`).

### Đa ngôn ngữ — bắt đầu nhanh

- **Thêm / sửa một chuỗi:** khai khoá ở CẢ `src/messages/vi/<namespace>.json` (nguồn) và `src/messages/en/<namespace>.json`,
  rồi `useTranslations('<namespace>')` (Server hay Client Component đều dùng được). Thiếu / thừa khoá ở `en` là `tsc` đỏ; khoá
  sai là `tsc` đỏ; `npm run check:i18n` bắt khoá không dùng.
- **Điều hướng:** `Link` / `useRouter` / `usePathname` từ `@/core/i18n`, KHÔNG `next/link` — chúng tự thêm tiền tố ngôn ngữ.
- **Thêm ngôn ngữ:** thêm vào `LOCALES` + `LOCALE_META` (`src/core/i18n/locales.ts`), tạo `src/messages/<mã>/`, đăng ký loader ở
  `src/core/i18n/messages.ts` — TypeScript báo đỏ chỗ nào còn thiếu.

Luật: [`rules/i18n/i18n.md`](docs/rules/i18n/i18n.md) · từng bước: [`guides/i18n.md`](docs/guides/i18n.md).

### SEO — danh sách kiểm trước khi ra production

- [ ] `NEXT_PUBLIC_SITE_URL` là gốc site thật (build production dừng nếu thiếu — trừ khi chạy trên Vercel).
- [ ] Mỗi trang công khai có `generateMetadata` qua `generatePageMetadata` (`src/app/_seo/page-metadata.ts`, truyền `noIndex: false`;
      cần JSON-LD thì gọi `buildPageMetadata` của `@/core/seo`) — canonical + hreflang + OG — và đúng MỘT `<h1>`.
- [ ] Trang công khai mới được thêm vào `PUBLIC_ROUTES` (`src/app/_navigation/public-routes.ts`) — sitemap tự có bản dịch + hreflang.
- [ ] Vùng riêng tư / trang khách `noindex` (layout nhóm `(auth)` · `(app)` đặt `robots: { index: false }`; `generatePageMetadata`
      mặc định `noIndex: true` nên trang mới không vô tình lọt vào Google) — test giữ `PUBLIC_ROUTES` và `PRIVATE_PATHS` không giao nhau.
- [ ] Preview / staging KHÔNG đặt `SEO_ALLOW_INDEXING=true`; production có `robots.txt` + `sitemap.xml` đúng (mở `/robots.txt`, `/sitemap.xml`).
- [ ] `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION` đã khai nếu dùng Search Console / Bing Webmaster.
- [ ] Bảng `Route (app)` của `npm run build` không có `ƒ` ngoài `[...rest]` và `/api/*` (route động mất lợi thế SSG).

Luật: [`rules/seo/seo.md`](docs/rules/seo/seo.md) · từng bước (thêm trang vào sitemap, metadata, JSON-LD): [`guides/seo.md`](docs/guides/seo.md).

## Triển khai

- **Vercel (đường mặc định):** import repo, đặt biến môi trường theo bảng ở trên cho từng môi trường, build `npm run build`. Không
  cần đặt `NEXT_OUTPUT`. Preview tự `noindex` (`SEO_ALLOW_INDEXING` suy từ `VERCEL_ENV`); `NEXT_PUBLIC_SITE_URL` có thể bỏ trống vì
  lấy `VERCEL_PROJECT_PRODUCTION_URL`. `next/font/google` cần mạng lúc build — runner Vercel có sẵn.
- **Docker / máy chủ tự quản:** build với `NEXT_OUTPUT=standalone npm run build` → gói tự chứa ở `.next/standalone`; chép `public/` →
  `.next/standalone/public` và `.next/static` → `.next/standalone/.next/static` rồi chạy `node server.js` (cổng `PORT`, mặc định
  3000). Font của ảnh Open Graph đã được khai cho bước đóng gói (`outputFileTracingIncludes`). Repo chưa kèm `Dockerfile`.
  `NEXT_PUBLIC_*` được nhúng LÚC BUILD (đổi giá trị = build lại); biến server-only (`AUTH_SESSION_COOKIE`, `SEO_ALLOW_INDEXING`…)
  đọc lúc chạy. Kiểm sống: `GET /api/health`.
- **Cổng trước khi triển khai:** `npm run check:ci` xanh; CI chạy cùng bộ (job `check` ở chế độ demo, job `build-app` ở chế độ app) và thêm job `e2e` (`npm run test:e2e`).
# source-base-nextjs

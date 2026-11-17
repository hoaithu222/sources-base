# Testing — cây `tests/`, đặt tên, helper, test luật

> Hai lớp: Vitest 5 (jsdom) + Testing Library cho hành vi / luật (§1–§6) và Playwright trên BẢN BUILD PRODUCTION cho
> vài kịch bản chỉ trình duyệt thật chứng minh được (§8, thư mục `e2e/`). Lệnh và cổng: `quality-gates.md`.
> Cách viết một test (AAA, query theo role, IME…): skill `web-testing`. File này giữ CẤU TRÚC và QUY ƯỚC.
> Vitest không chạy Next: không có Router, không có Server Component bất đồng bộ — §4b nói thứ gì thay thế thứ gì.

---

## 1. Hai nhóm chạy

| Nhóm    | Gồm                                                                           | Lệnh                                                         | Ngân sách                                               |
| ------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| `unit`  | `tests/**/*.test.{ts,tsx}` trừ smoke                                          | `npm run test:unit` (lúc code: `npm run test:unit -- <tên>`) | timeout mặc định 5 giây — chạm ngưỡng là có vấn đề thật |
| `smoke` | `tests/**/*.smoke.test.{ts,tsx}` — dựng cây provider / layout lớn trong jsdom | `npm run test:smoke`                                         | 30 giây (thời gian chủ yếu là nạp hàng trăm module)     |

`npm test` chạy cả hai (nằm trong `npm run check`) và KHÔNG nhặt `e2e/` (Vitest chỉ nhận `tests/**/*.{test,spec}.{ts,tsx}`; file e2e đặt
tên `*.e2e.ts`). Cấu hình ở `test.projects` của `vitest.config.ts`; test cố định chế độ
demo (`test.env` → `NEXT_PUBLIC_APP_MODE=demo`) nên kết quả không đổi theo `.env` của từng máy; CSS chỉ nạp cho `*.css?raw`
(bài kiểm CSS cần nội dung thật); `server-only` được thay bằng module rỗng (`resolve.alias`) và `next-intl` được Vite xử lý
(`server.deps.inline`) — xem comment trong file cấu hình. Coverage (`npm run test:coverage`) có ngưỡng chỉ cho `src/core/**` và
`src/domains/session/**`; tầng giao diện đo để biết, không đặt ngưỡng.

---

## 2. Cây `tests/` — phản chiếu `src/`

```
tests/
├── setup.ts          setup toàn cục: jest-dom, mock `next/navigation`, matchMedia / ResizeObserver / IntersectionObserver, cleanup
├── helpers/          tiện ích dùng chung cho test (§4) — import `@tests/helpers/<file>`
├── policy/           TEST LUẬT — đọc mã nguồn / tài liệu, giữ luật của docs/rules (§5)
│   └── <nhóm rule>/  cùng tên nhóm với docs/rules: foundations/ · structure/ · data/ · styling/ · display/
├── app/              ↔ src/app (proxy, điều hướng, route SEO…)
├── core/             ↔ src/core (config, http, query, seo…)
├── domains/          ↔ src/domains
├── features/<f>/     ↔ src/features/<f>
└── shared/           ↔ src/shared: charts/ · hooks/ · utils/ (theo họ) · widgets/ · ui/
    └── ui/           hành vi theo cặp nhóm UI kit (form/ · data-display/ · selects-pickers/ · overlays-navigation/ ·
                      surfaces-media/ · behavior/ — actions-inputs, display-basics) + render/ (bộ "render nông mà rộng", §4)
```

- Test HÀNH VI đặt ở folder phản chiếu đúng file nguồn nó kiểm (`src/shared/utils/style/color-mix.utils.ts` →
  `tests/shared/utils/style/color-mix.utils.test.ts`). Test LUẬT (đọc nhiều file để giữ một quy ước) vào `policy/`.
- Máy giữ (`policy/foundations/tests-layout`): mọi test nằm dưới `tests/{policy,app,core,domains,features,shared,helpers}/`;
  hai cấp đầu của test hành vi trùng một folder có thật trong `src/`; file không phải test chỉ ở `helpers/` (và
  `setup.ts`); mỗi folder ≤ 8 mục như `src/`. Giới hạn số dòng file KHÔNG áp cho `tests/`.

---

## 3. Đặt tên

| Thứ                          | Quy ước                                                                                                         | Ví dụ                                                 |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| File test của một file nguồn | tên file nguồn + `.test.ts(x)`                                                                                  | `format.utils.test.ts`, `dock-settings.store.test.ts` |
| File test của hook           | kebab-case của tên hook                                                                                         | `use-latest-request.test.tsx`                         |
| File test theo chủ đề / màn  | `kebab-case` mô tả chủ đề                                                                                       | `session-lifecycle.test.ts`, `proxy.test.ts`          |
| Smoke                        | `*.smoke.test.tsx`                                                                                              | `app-boot.smoke.test.tsx`                             |
| `describe` / `it`            | tiếng Việt, nói HÀNH VI mong đợi ("nên làm gì khi nào"), không `it works`                                       | `it('lượt về sau không ghi đè lượt mới hơn')`         |
| Test luật                    | tên theo luật nó giữ; khối JSDoc đầu file trỏ rule (`docs/rules/<nhóm>/<file>.md §…`) và nói VÌ SAO cần máy giữ | `policy/foundations/file-size.test.ts`                |

Thông báo lỗi của `expect` trong test luật nói LUẬT là gì + sửa thế nào + đường dẫn rule (`quality-gates.md §6`).

---

## 4. Helper (`tests/helpers/`)

| File                                                                                                                                   | Dùng khi                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `http-mock.ts` — `mockHttp(handler)`, `bearerOf(config)`                                                                               | Test có gọi API: thay `adapter` của axios nên interceptor, hàm API và React Query THẬT vẫn chạy. KHÔNG `vi.mock('@/core/http')`. Request tự gắn `adapter` riêng (như adapter demo của `features/customers`) BỎ QUA `mockHttp` — test lỗi thật phải mock `@/core/config` đặt `isDemo = false`                                                                                                                   |
| `deferred.ts` — `createDeferred()`, `createGate()`                                                                                     | Dựng đúng THỨ TỰ về của các request (A gọi trước, về sau B) mà không ngủ thật — hợp đồng của `async-safety.md`                                                                                                                                                                                                                                                                                                 |
| `render.tsx` — `renderWithIntl(ui, { locale })`, `renderInRouter(ui, { pathname, search, locale })`, `renderInForm(ui, defaultValues)` | **Mọi component dùng `useTranslations`, `Link` / `useRouter` của `@/core/i18n` hoặc UI kit có chữ** (gần như tất cả): bọc `NextIntlClientProvider` với thông điệp THẬT của `vi` (mặc định) hoặc `en`. `renderInRouter` = `renderWithIntl` + đặt vị trí điều hướng giả; `renderInForm` thêm một `<Form>` thật cho field cần `name`. Dựng thẳng bằng `render` của Testing Library sẽ ném "No intl context found" |
| `render-with-query.tsx` — `renderWithQuery(ui, { locale, pathname, search, queryClient })`, `createTestQueryClient()`                  | View CÓ DỮ LIỆU (React Query): provider next-intl + `LocaleSync` + `QueryClient` có bộ báo lỗi tập trung và TẮT `retry` (lỗi 5xx hiện ngay). Truyền `queryClient` để hai lần render dùng chung cache (ca "lưu xong, danh sách làm mới"). Mẫu: `tests/features/customers/`                                                                                                                                      |
| `navigation-mock.ts` — `navigationMock` (`setLocation`, `push`, `replace`…)                                                            | Component đọc `usePathname` / `useSearchParams` / `useRouter`: `tests/setup.ts` mock `next/navigation` đọc từ đây (reset sau mỗi test). `navigationMock.setLocation('/en/settings', '?tab=2')`; `expect(navigationMock.push).toHaveBeenCalledWith('/dashboard')`                                                                                                                                               |
| `server-only.ts`                                                                                                                       | Alias rỗng thay `server-only` (khai ở `vitest.config.ts`) — module `core/seo`, `core/config/server-config` import được trong test                                                                                                                                                                                                                                                                              |
| `render-suite.tsx` — `describeRenderSuite`, `RENDER_SUITES`                                                                            | Bộ "render nông mà rộng" của UI kit (`tests/shared/ui/render/<bộ>.test.tsx`): mỗi component công khai một lượt render tối thiểu; thêm component vào barrel mà quên ca là đỏ                                                                                                                                                                                                                                    |
| `ui-kit-exports.ts`                                                                                                                    | Danh sách export của UI kit đọc từ chuỗi barrel — nguồn duy nhất cho mọi test cần "mọi component"                                                                                                                                                                                                                                                                                                              |
| `source-files.ts` — `SOURCE_CODE`, `SOURCE_CSS`, `HANDWRITTEN_CODE`, `DOC_FILES`, `lineCount`…                                         | Nội dung file của repo dạng chuỗi cho test luật (đọc bằng `import.meta.glob`, KHÔNG `fs`)                                                                                                                                                                                                                                                                                                                      |
| `doc-blocks.ts`                                                                                                                        | Đọc khối tài liệu component bằng TypeScript compiler API (kiểu props thật)                                                                                                                                                                                                                                                                                                                                     |

Đổi `appConfig` (vd bật kiểm đăng nhập): `vi.mock('@/core/config', …)` như test của guard (`_guards`). Muốn test với ngôn ngữ khác `vi`:
`renderWithIntl(ui, { locale: 'en' })`; chữ trong test viết theo `vi` (ngôn ngữ nguồn) trừ khi test chính là kiểm bản `en`.

### 4b. Thứ Vitest không có — làm gì thay

| Next có                                                                              | Trong Vitest                                            | Cách kiểm                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Router (`next/navigation`)                                                           | Bản giả ở `tests/setup.ts`                              | `navigationMock` (§4). `notFound()` / `redirect()` ném lỗi như bản thật — `expect(() => …).toThrow('NEXT_NOT_FOUND')`                                                                                       |
| Server Component bất đồng bộ (`page.tsx`, `generateMetadata`, `opengraph-image.tsx`) | KHÔNG dựng trong jsdom                                  | Kiểm HÀM THUẦN nó gọi (`buildPageMetadata`, `buildSitemap`, `buildRobots`, `serializeJsonLd`…) và View client / tĩnh bằng `renderWithIntl`; bảng `Route (app)` của `npm run build` kiểm route có tĩnh không |
| `proxy.ts`                                                                           | Gọi hàm `proxy(request)` với `NextRequest` dựng tay     | `tests/app/proxy.test.ts` — cookie phiên có / không, `?next=`, ngôn ngữ                                                                                                                                     |
| Cấu hình điều hướng ↔ thư mục route                                                  | Đọc cây file                                            | `app/navigation` — mỗi path khai ở `navigation.config.ts` có `page.tsx`                                                                                                                                     |
| Env `NEXT_PUBLIC_*` / server-only                                                    | `parseAppEnv(raw)` / `parseServerEnv(raw)` là hàm thuần | `tests/core/env-schema.test.ts`; không đặt `process.env` toàn cục                                                                                                                                           |

---

## 5. Test luật (`tests/policy/**`)

Một luật chỉ nằm trong tài liệu là một luật sẽ bị quên. Luật đo được bằng máy → thêm test ở `tests/policy/<nhóm>/`,
cùng nhóm với rule nó giữ, rồi thêm một dòng vào bảng dưới.

| Test                            | Giữ luật                                                                                                                                                                                                                                                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `foundations/file-size`         | Giới hạn dòng — `folder-structure.md §1`                                                                                                                                                                                                                                                                       |
| `foundations/naming`            | Tên file theo vai trò: `PascalCase.tsx` = default export, `useXxx.ts`, `kebab-case.<vai>.ts` hoặc `kebab-case.ts` = kebab của MỘT export trong file, `utils/` → `*.utils.ts`, zustand → `*.store.ts`, `createContext` → `*.context.ts` — `folder-structure.md §4`                                              |
| `foundations/folder-structure`  | ≤ 8 mục / folder; folder vai trò; `index.ts` (UI kit bắt buộc · feature chỉ ở gốc); độ lồng UI kit — `folder-structure.md`, `feature-structure.md`                                                                                                                                                             |
| `foundations/ui-kit-docs`       | Khối tài liệu sát trên component, `@param props.*` khớp props thật, có `@example` — `comment-policy.md §1`, `component-structure.md §4`                                                                                                                                                                        |
| `foundations/docs-blocks`       | Như `ui-kit-docs` cho component công khai của `shared/widgets` · `shared/charts`; component `app` / `features` có khối sát khai báo + `@param` — `comment-policy.md §1`                                                                                                                                        |
| `foundations/docs-links`        | Link `.md`, đường `@/…` / `src/…` / `tests/…` / `e2e/…` trong docs tồn tại; lệnh nguy hiểm (`tsc --noEmit` đơn lẻ) phải có ⛔; không còn tên cũ của bộ UI — `documentation-management.md`                                                                                                                                |
| `foundations/tests-layout`      | Cây `tests/` phản chiếu `src/`, ≤ 8 mục / folder (§2)                                                                                                                                                                                                                                                          |
| `structure/use-client`          | Mọi file chạm API chỉ-client có `'use client'`; component thuần trình bày thì không; `page.tsx` / `layout.tsx` không có — `server-client-boundary.md`                                                                                                                                                          |
| `structure/ui-kit-props-types`  | Component công khai xuất kèm `XxxProps` — `ui-kit-architecture.md §1`                                                                                                                                                                                                                                          |
| `structure/widgets`             | Khuôn widget: không barrel gốc, có `*.theme.ts`, không import chéo widget — `widget-composition.md §9–§10`                                                                                                                                                                                                     |
| `data/persist-stores`           | Store `persist`: hằng `XXX_STORAGE = { key, version }`, `createSafeJSONStorage()`, `sanitize…` ở cả `migrate` lẫn `merge`, có `partialize`, `skipHydration` — `state-management.md`                                                                                                                            |
| `styling/color-tokens`          | Class màu trỏ tới token có thật; token nào cũng có nơi dùng — `color-system.md`                                                                                                                                                                                                                                |
| `styling/font-tokens`           | Chữ chỉ qua `text-{scale}-{weight}` (TV phóng đúng) — `font-system.md`                                                                                                                                                                                                                                         |
| `styling/spacing-policy`        | Thang khoảng cách, chủ sở hữu mép, số trong rule khớp code — `spacing-system.md`                                                                                                                                                                                                                               |
| `styling/css-structure`         | `globals.css` chỉ là entry, thanh cuộn, độ nét chữ, autofill — `css-architecture.md`, `scrollbar.md`                                                                                                                                                                                                           |
| `display/responsive-foundation` | Nền responsive: `phone:` khai dạng khối + `@slot`, `wide` 1800 / `3xl` 1920, bản JS (`media-query.constants.ts`) khớp CSS, bảng thiết bị rơi đúng bậc + đúng `phone:`, viewport không khoá phóng to, `:hover` tay bọc `(hover: hover)`, không `h-screen` — `ipad-responsive.md`, `responsive-screens.md §1–§2` |
| `display/responsive-docs`       | `responsive-screens.md` có thật + `docs/README.md` trỏ tới; mốc `wide` và điều kiện `phone:` trong tài liệu khớp CSS; mọi biến thể ở `variants.css` có trong bảng §2.2 — `documentation-management.md §3`                                                                                                      |

Test giữ luật nhưng nằm cạnh vùng nó kiểm: `app/navigation` (khai điều hướng ↔ thư mục route có `page.tsx`) · `app/seo-routes`
(`PUBLIC_ROUTES` ↔ `PRIVATE_PATHS` không giao nhau, mỗi route công khai có trang) · `app/proxy` (cổng chặn theo cookie phiên) ·
`core/seo-*` (metadata có canonical + hreflang + `x-default`, khoá `robots` vắng mặt khi cho lập chỉ mục, JSON-LD escape `<`,
sitemap / robots) · `core/env-schema` (env sai là dừng) · `shared/ui/render/*` (mọi component công khai render
được; `suites.test.ts` buộc mỗi nhóm UI kit thuộc đúng một bộ render). Khoá dịch vi ↔ en không có test riêng: `npm run check:i18n`
(`quality-gates.md §2`) giữ, còn `tsc` giữ hình dạng (`en` `satisfies Messages`).

---

## 6. Checklist khi viết test

- [ ] Đúng folder phản chiếu (§2), đúng tên (§3); `describe` / `it` tiếng Việt nói hành vi
- [ ] Component có chữ / link / router dựng bằng `renderWithIntl` / `renderInRouter` (§4), không `render` trần
- [ ] Gọi API qua `mockHttp`; thứ tự bất đồng bộ qua `createDeferred` / `createGate` — không `setTimeout` ngủ thật
- [ ] Query theo role / label; ô tìm kiếm IME mô phỏng `compositionStart` / `compositionEnd` (skill `web-testing`)
- [ ] Bug đã sửa có regression test đỏ khi bỏ bản sửa
- [ ] Đổi giao diện → đã chụp ma trận viewport (§7), không chỉ chạy Vitest
- [ ] Đụng route / `proxy.ts` / guard / phiên / header / SEO → `npm run test:e2e` xanh (§8)
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 7. Kiểm bằng viewport — trình duyệt thật, ngoài Vitest

Vitest chạy trên jsdom: KHÔNG có bố cục thật (không đo được tràn ngang, chồng lấn, vùng chạm, `dvh`, safe-area) và
`matchMedia` bị mock ở `tests/setup.ts`. Bài kiểm luật khoá cấu hình + tài liệu (`display/responsive-*` ở §5) nhưng không
khoá bố cục. Lớp TỐI THIỂU (không tràn ngang, không lỗi console ở 390×844 · 820×1180 · 1366×768) do bộ e2e giữ (§8); phần còn lại
— ma trận đầy đủ, ảnh chụp, vùng chạm, so pixel — vẫn chụp từ trình duyệt thật theo `responsive-screens.md §6` (chạy tay, `known-issues.md`).

| Khi nào                                                   | Bắt buộc chụp                                                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Mọi thay đổi UI hiển thị                                  | Ma trận tối thiểu: 360×800 · 390×844 · 844×390 · 768×1024 · 1024×768 · 1280×720 · 1440×900 · 1920×1080 |
| Đụng vỏ ứng dụng, lớp nổi, bảng, form, chart, khoảng cách | Toàn bộ 36 cỡ ở `responsive-screens.md §1`, sáng + tối                                                 |
| Sửa giá trị ở `xl` / `2xl` / `wide` hoặc token toàn cục   | 1920×1080 trước / sau, so pixel = 0                                                                    |

Máy chạm phải giả lập `isMobile` + `hasTouch` (không thì `touch:` không khớp). Ma trận chi tiết, script đo (tràn ngang,
vùng chạm bằng `elementFromPoint`, so pixel) và checklist: **`responsive-screens.md §6`** — không chép lại ở đây.
Trang để chụp (chạy `npm run dev` ở chế độ demo, không cần đăng nhập — `architecture.md §15`): `/demo` · `/dashboard` ·
`/settings` · `/` (trang công khai) · `/login` — thêm `/en/…` khi đổi chữ có thể làm dài hơn.

---

## 8. Browser smoke test trên bản build production (`e2e/`)

Vitest + jsdom không chứng minh được: route thật, hydration, chuyển hướng / cookie của `proxy.ts`, chuyển ngôn ngữ, header của
`next.config.ts`, route SEO (`robots.txt`, `sitemap.xml`, ảnh OG), focus thật của hộp thoại, bố cục viewport. Next khuyên chạy
Playwright trên bản production, nên có VÀI kịch bản giá trị cao chạy trên `next build` + `next start` thật. KHÔNG viết hàng
trăm: logic và hành vi vẫn ở Vitest (§1–§6) — thêm e2e chỉ khi jsdom KHÔNG kiểm được VÀ lỗi chạm người dùng thật.

| Lệnh                                               | Việc                                                                                                                                                                        |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:e2e`                                 | Build `.next-e2e` (chế độ app, env ở `scripts/ci-env.mjs`) → `next start` cổng `3210` → chạy bộ test → tắt server. Build lần đầu mất tới vài chục giây (Turbopack có cache) |
| `E2E_SKIP_BUILD=1 npm run test:e2e`                | Bỏ bước build, dùng lại `.next-e2e` — CHỈ khi mã nguồn và env chưa đổi (`NEXT_PUBLIC_*` nhúng lúc build)                                                                    |
| `npm run test:e2e -- e2e/keyboard.e2e.ts -g "Esc"` | Một file / một test; thêm `--headed` để xem, `--ui` để gỡ lỗi                                                                                                               |
| `E2E_REUSE_SERVER=1 npm run test:e2e`              | (ngoài CI) dùng server đang nghe ở cổng e2e thay vì báo "cổng đã bị chiếm"                                                                                                  |

Cần **Chrome hệ thống** (`channel: 'chrome'`; ⛔ KHÔNG `npx playwright install` — runner `ubuntu-latest` có sẵn Chrome). Không nằm trong
`npm run check` / `check:fast` / `check:ci` (có bước build): chạy chủ động trước PR đụng route, `proxy.ts`, guard / phiên, điều hướng,
header, SEO, vỏ ứng dụng; CI có job `e2e` riêng (`quality-gates.md §1`), đỏ thì tải artifact `playwright-report` (HTML + trace).

### 8.1. Cây và kịch bản

```
playwright.config.ts          testMatch `e2e/**/*.e2e.ts` · Chrome hệ thống · webServer · trace chỉ giữ khi đỏ · retry chỉ ở CI
scripts/e2e-server.mjs        build + start bản production (webServer gọi; không chạy tay)
e2e/
├── public-pages.e2e.ts       `/` · `/en`: lang, MỘT h1, title, canonical, hreflang, og:image · ảnh OG · LocaleSwitcher giữ trang · robots / sitemap · header bảo mật
├── auth-session.e2e.ts       proxy chặn sớm (307 + `next`) · đăng nhập → đúng `next` · tải lại giữ phiên · đăng xuất xoá dữ liệu · 503 / mất mạng ≠ 401
├── keyboard.e2e.ts           bảng lệnh: mở bằng phím, Tab bị giữ trong hộp thoại, Esc đóng + TRẢ focus, Ctrl/⌘+K · `/` · tìm không dấu
├── viewports.e2e.ts          `/` · `/login` · `/dashboard` ở 390×844 · 820×1180 · 1366×768: không tràn ngang
├── demo-route.e2e.ts         `/demo` ở chế độ app: chưa đăng nhập → login (proxy chạy trước 404); đã đăng nhập → màn "không tìm thấy"
└── support/                  env · fake-api · flows · layout · messages · test
```

Mọi test còn có `consoleGuard` (tự chạy): `pageerror` hoặc `console.error` ở bất kỳ trang nào là đỏ — hydration mismatch, lỗi chunk,
lỗi runtime hiện ra ở đây mà jsdom không thấy.

### 8.2. Mock API và phiên

- **Không backend.** Mọi `/api/**` do `FakeApi` (`support/fake-api.ts`, `context.route`) giả ở tầng trình duyệt — request không tới
  `rewrites()` của Next. Chỉ kiểm HỢP ĐỒNG phía frontend (endpoint `/auth/{login,refresh,logout}`, vỏ `{ data }`, cookie phiên,
  401 khác 503); hợp đồng với BE thật là việc khác. Request `/api/**` chưa giả → ghi vào `unhandled`, test đỏ — thêm endpoint thì thêm một `case` ở `FakeApi`.
- **Phiên có hai nửa, giống thật**: cookie HttpOnly `refresh_token` (= `AUTH_SESSION_COOKIE`, `proxy.ts` chỉ kiểm CÓ TỒN TẠI) và "máy
  chủ nhớ phiên" (refresh 200 / 401). Đăng nhập qua form: `FakeApi` đặt cookie bằng header `Set-Cookie` của phản hồi login như BE.
  Vào thẳng vùng riêng tư: `api.seedReturningVisitor()`. Giả lỗi: `api.refreshFault = 'unavailable' | 'offline'`, `api.expireServerSession()`.
- Tài khoản / token giả ở `fake-api.ts`; access token KHÔNG được vào `localStorage` (có test giữ).

### 8.3. Luật viết e2e

- Tên `*.e2e.ts` — KHÔNG `.test.` / `.spec.` (Vitest không được nhặt, `check:unused-files` coi là entry). Import `test` / `expect` từ `./support/test`.
- Chờ bằng web-first assertion (`expect(locator)…`, `expect.poll`), ⛔ KHÔNG `waitForTimeout`. Chờ hydrate bằng tín hiệu thật
  (`expectHydrated`, hoặc refresh đã được gọi — `submitLoginForm`): bấm trước hydrate chạy hành vi thuần của thẻ, không phải handler React.
- Chữ lấy từ khoá dịch thật — `vi('auth.login.submit')` / `en('about.title')` (`support/messages.ts`), không chép chữ Việt vào test.
- Truy vấn theo role + tên truy cập được (`getByRole`), như người dùng và trình đọc màn hình.
- `await` MỌI lệnh Playwright: ESLint `no-floating-promises` bật cho `e2e/**` và `check:eslint-config` giữ. Tham số fixture đặt tên `provide`, không `use` (`react-hooks` coi `use` là hook).
- `BASE_URL` là `localhost`, không `127.0.0.1` (`known-issues.md` §F). Máy chạm giả lập `isMobile` + `hasTouch`.
- Test đỏ ngẫu nhiên thì tìm nguyên nhân (thường là chờ thiếu tín hiệu), không tăng retry; retry chỉ bật ở CI để báo `flaky`, không che lỗi.

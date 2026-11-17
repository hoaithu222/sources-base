# Hướng dẫn tầng ứng dụng — `src/app` từ lúc khởi động tới khi thêm phân hệ

> Đọc xong là tự làm được những việc thường gặp ở `src/app`: thêm trang, thêm phân hệ, phân quyền, đổi khung,
> gắn thêm thứ vào Header, viết test. Mọi tên file / hàm / prop dưới đây là code THẬT; thấy lệch thì code là nguồn
> thật — sửa file này trong cùng PR (`documentation-management.md §3`).
> File này là HƯỚNG DẪN, không đặt luật: luật nằm ở rule được trỏ tới (chủ yếu
> [`routing-conventions.md`](../rules/structure/routing-conventions.md) và
> [`page-structure.md`](../rules/structure/page-structure.md)); lý do thiết kế từng file:
> [`notes/code/app.md`](../notes/code/app.md).

**Mục lục**

1. Tầng app là gì
2. Bản đồ thư mục `src/app`
3. Luồng khởi động
4. Cây route
5. Hướng dẫn từng bước (trang tĩnh · phân hệ · trang con · tham số động · quyền · cờ · trang mở đầu)
6. Menu · Dock · bảng lệnh
7. Guard và phiên đăng nhập
8. Đồng bộ và điều hướng
9. Lỗi và màn chờ
10. Theme và hiển thị
11. Shell: Header, Dock, bảng lệnh
12. Layout
13. Kiểm thử
14. Checklist và lỗi thường gặp
15. Liên kết

---

## 1. Tầng app là gì

```
app → features → domains → shared → core
```

Mũi tên là chiều ĐƯỢC import (`docs/architecture.md §1`). `app` đứng trên cùng: nó được dùng mọi tầng dưới và
**không tầng nào được import nó** — chỉ `src/main.tsx` mount `App`. App là tầng LẮP RÁP: nối các tầng dưới với nhau,
khai route, dựng khung; nó không chứa nghiệp vụ.

| App LÀM | App KHÔNG làm → đặt ở |
|---|---|
| Khởi động: nối `core/http` với phiên đăng nhập (`bootstrapApp`) | Gọi API, logic của một nghiệp vụ → `src/features/<id>/` |
| Khai route, guard, layout | Component giao diện dùng lại → UI kit `src/shared/ui` / widget `src/shared/widgets` |
| Nối widget thuần (Header, Dock, bảng lệnh) với store và registry (`src/app/shell`) | Dữ liệu dùng chung nhiều feature → `src/domains/` |
| Trang chung không thuộc phân hệ: trang chủ, hồ sơ, cài đặt, giữ chỗ, 403 / 404 | Trang nghiệp vụ → `src/features/<id>/pages/` |
| Provider toàn cục, phần tử gắn một lần (toast, thẻ tiến trình) | Store / hook dùng lại → `src/domains/` hoặc `src/shared/hooks` |

Ranh giới import mà ESLint giữ cho vùng này (bảng vùng ở `scripts/eslint/architecture.mjs`, tóm tắt ở
`quality-gates.md §3`):

- Feature / domain / shared / core **không** import `@/app/...` — hệ quả: trang của feature không gọi được
  `getRoutePath` (cách làm thay: §5.6).
- Trong `src/app`: màn dùng chung qua barrel `@/app/components` (không với vào `@/app/components/ErrorScreen`).
- Ngoài `src/app/router`: import THƯ MỤC CON của router (`@/app/router/menu`, `@/app/router/modules`,
  `@/app/router/definition`, `@/app/router/guards`, `@/app/router/sync`, `@/app/router/setup`), không với vào file
  bên trong (`@/app/router/menu/useAppMenu` là sai).
- Barrel `@/app/router` (export `appRoutes`) **chỉ `App.tsx`** dùng. Trang, shell, layout import nó là import vòng.
- Tầng dưới qua public API: `@/domains/session`, `@/domains/preferences`, `@/shared/ui`, `@/shared/hooks`,
  `@/shared/widgets/<widget>`, `@/core/config`.
- Trang của feature nạp bằng `import()` động trong `lazyPage(...)` — luật chỉ soi import tĩnh, nên router (tầng app)
  nạp được thẳng file trang của feature.

## 2. Bản đồ thư mục `src/app`

```
src/main.tsx                       điểm vào: nạp CSS, bootstrapApp(), render <App /> trong StrictMode
index.html                         khung HTML: #root, class `dark` mặc định, meta PWA, font
src/app/
├── App.tsx                        ErrorBoundary → Suspense → AppProvider → AppRouter
├── bootstrap.ts                   bootstrapApp(): nối các tầng trước render, trả disposer
├── components/                    màn dùng chung KHÔNG phụ thuộc router — import qua `@/app/components`
│   ├── ErrorBoundary.tsx          ranh giới lỗi duy nhất (bọc App + từng trang); `resetKey` đổi → xoá lỗi
│   ├── ErrorScreen.tsx            màn lỗi: "Tải lại trang" (+ "Về trang chủ" khi không phải lỗi chunk)
│   ├── LoadingScreen.tsx          màn chờ, `level` app | content
│   ├── chunk-reload.utils.ts      reloadOnceOnChunkError: lỗi tải chunk → tự tải lại MỘT lần
│   ├── describe-error.ts          describeError · isChunkLoadError · logAppError (tiền tố `[giao diện]`)
│   ├── screen.types.ts            ScreenLevel = 'app' | 'content'
│   └── index.ts
├── layouts/                       khung quanh <Outlet /> — import qua `@/app/layouts`
│   ├── RootLayout.tsx             route gốc: nền toàn màn + vùng cuộn của trang NGOÀI khung (scope 'root')
│   ├── AuthLayout.tsx             thẻ hai khoang (thương hiệu | form) của trang khách
│   ├── auth-layout.css            nền, viền, hiệu ứng `.auth-*` — chỉ AuthLayout import
│   ├── auth/                      phần con của AuthLayout: AuthBackdrop · AuthBrandPanel · BrandLayerDiagram
│   ├── AppShellLayout.tsx         khung ứng dụng: Header + <main> cuộn (scope 'main') + Dock + bảng lệnh
│   ├── app-shell-layout.css       nền lưới `.app-background`, đường sáng `.app-header-line`
│   ├── useRouteScrollRestoration.ts  vị trí cuộn theo route cho vùng cuộn không dựng lại
│   └── index.ts
├── pages/                         trang chung, không thuộc phân hệ
│   ├── HomePage.tsx · ProfilePage.tsx · SettingsPage.tsx
│   ├── PlaceholderPage.tsx        giữ chỗ cho phân hệ chưa có màn (tiêu đề lấy từ `meta.title`)
│   └── status/                    StatusPage (khung toàn màn) · ForbiddenPage · NotFoundPage · SessionUnavailablePage
├── providers/                     import qua `@/app/providers`
│   ├── AppProvider.tsx            QueryClientProvider + AppearanceSync + ChartScaleProvider + AppOverlays
│   ├── AppOverlays.tsx            ToastContainer + ProgressCenter
│   ├── query-client.ts            `queryClient` singleton: lỗi query / mutation → toast đỏ
│   └── appearance/                appearance.utils (initializeAppearance · applyAppearance) · AppearanceSync
├── router/                        chi tiết ở §4
│   ├── index.ts                   CHỈ AppRouter + appRoutes
│   ├── static.routes.ts           GUEST_PAGES · APP_PAGES · FALLBACK_PAGES
│   ├── setup/                     AppRouter · app-routes (`appRoutes`) · build-routes (khai báo → RouteObject)
│   ├── modules/                   module-registry (MODULE_REGISTRY · getRoutePath) · demo.routes ·
│   │                              validate-modules · lazy-placeholder-page
│   ├── definition/                THUẦN: route.types · lazy-page · route-tree.utils · route-handle.utils
│   ├── menu/                      build-menu.utils (toPageMenu · toModuleMenu) · useAppMenu (lọc quyền)
│   ├── guards/                    AuthGuard · GuestGuard · PermissionGuard · useSessionGate · return-path.utils
│   ├── components/                LazyLoad (vỏ của mọi trang) · RouteErrorScreen (errorElement gốc)
│   └── sync/                      DocumentTitleSync · RouteAnnouncer · DisplayUrlSync · document-title.utils
└── shell/                         nối widget thuần với app — import qua `@/app/shell`
    ├── AppHeader.tsx              Header + phiên + theme + mục "Ẩn / Hiện thanh Dock"
    ├── AppDock.tsx                Dock ← useAppMenu().modules
    └── AppCommandPalette.tsx      CommandPalette ← useAppMenu() + lệnh đổi theme, phím Ctrl/⌘+K
```

**Thứ mới đặt ở đâu:**

| Cần thêm | Đặt ở |
|---|---|
| Trang nghiệp vụ | `src/features/<id>/pages/` + khai ở `src/app/router/modules/<id>.routes.ts` |
| Trang chung không thuộc phân hệ nào | `src/app/pages/` + một entry trong `static.routes.ts` |
| Trang trạng thái toàn màn (lỗi, bảo trì) | `src/app/pages/status/`, dựng bằng `StatusPage` |
| Bước khởi tạo trước khi render | `bootstrapApp()` (§3) |
| Provider toàn cục / phần tử gắn một lần | `AppProvider` / `AppOverlays` |
| Lớp bọc nghiệp vụ toàn app CẦN router (stream thông báo…) | quanh `<Outlet />` trong `RootLayout` |
| Nút toàn cục trên Header, mục menu tài khoản, lệnh bảng lệnh | `src/app/shell/` (§11) |
| Layout cho một nhóm trang mới | `src/app/layouts/` + export ở `index.ts` + dùng trong `app-routes.tsx` (§12) |

Mỗi folder ≤ 8 mục (`folder-structure.md §1`). `modules/` đang có 4 mục (không tính `index.ts`); gỡ demo
(`demo.routes.ts`) thì trống thêm một chỗ. Quá 8 thì gom theo `folder-structure.md §2` — chưa có quy ước sẵn cho
folder này, thống nhất với chủ repo trước.

## 3. Luồng khởi động

```
index.html
  <html class="dark">  <div id="root">  <script type="module" src="/src/main.tsx">
        │
        ▼
src/main.tsx
  import './styles/globals.css'                       CSS toàn cục — một entry duy nhất
  try {
    bootstrapApp()  ──────────────────────────────►  src/app/bootstrap.ts (bảng bên dưới)
    root.render(<StrictMode><App /></StrictMode>)
  } catch (error) {
    logAppError('Khởi động ứng dụng thất bại:', error)
    root.render(<ErrorScreen error={describeError(error)} level="app" />)
  }
        │
        ▼
<App>                                                src/app/App.tsx
  <ErrorBoundary label="Ứng dụng" level="app">        lỗi ngoài cây route → màn lỗi toàn màn
    <Suspense fallback={<LoadingScreen level="app" />}>
      <AppProvider>                                  src/app/providers/AppProvider.tsx
        <QueryClientProvider client={queryClient}>
          <AppearanceSync />                         theme / TV / scale → <html>, mỗi lần preferences đổi
          <ChartScaleProvider uiScale={…}>           biểu đồ phóng theo cỡ chữ TV
            <AppRouter />                            createBrowserRouter(appRoutes) — dựng MỘT lần
          </ChartScaleProvider>
          <AppOverlays />                            ToastContainer + ProgressCenter — sống qua mọi route
```

**`bootstrapApp()` — từng bước** (thứ tự trong code):

| # | Bước | Để làm gì |
|---|---|---|
| 1 | `configureZodLocale()` | Câu lỗi mặc định của Zod bằng tiếng Việt, trước khi parse schema nào |
| 2 | `configureHttp({ auth: { getAccessToken, refreshAccessToken } })` | `core/http` gắn token và tự làm mới khi 401 mà không cần biết store phiên nằm đâu |
| 3 | `initializeAppearance()` | Áp theme / TV / scale lên `<html>` TRƯỚC lần vẽ đầu; `?display=` `?scale=` hợp lệ trên URL thắng lựa chọn đã lưu |
| 4 | `onSessionEnd(…)` → `resetAccountScopedState()` | Phiên kết thúc hoặc đổi tài khoản: `queryClient.clear()` + `resetProgressCenter()`; lý do `expired` thêm toast cảnh báo |
| 5 | `startSessionSync()` | Đồng bộ đăng nhập / đăng xuất giữa các tab |

- **Disposer.** `bootstrapApp()` trả hàm dừng: gỡ listener (bước 4, 5) theo thứ tự ngược và gỡ cấu hình HTTP. Gọi trùng
  trả CÙNG hàm (idempotent). HMR tự gọi qua `import.meta.hot.dispose`; test phải gọi sau mỗi lượt
  (`tests/app/bootstrap.test.ts`, `tests/app/app-boot.smoke.test.tsx`).
- **Một bước ném lỗi** → listener đã đăng ký được dọn, cấu hình HTTP được gỡ, lỗi ném tiếp lên `main.tsx` → màn lỗi
  `level="app"` có nút "Tải lại trang".
- `main.tsx` không giữ disposer — trang sống tới khi đóng tab.

**Thêm một bước khởi tạo** (vd mở luồng thông báo): hàm của tầng dưới trả hàm dừng thì đẩy vào `cleanups`, không
trả thì chỉ gọi. Tầng dưới cần hành vi của tầng trên thì nhận qua THAM SỐ ở đây, không import ngược.

```ts
export function bootstrapApp(): () => void {
  if (disposeApp) return disposeApp;
  const cleanups: (() => void)[] = [];
  try {
    configureZodLocale();
    configureHttp({ auth: { getAccessToken, refreshAccessToken } });
    initializeAppearance();
    cleanups.push(resetWhenSessionEnds());
    cleanups.push(startSessionSync());
    cleanups.push(startNotificationStream());
  } catch (error) {
```

**State gắn với tài khoản** (cache, hàng đợi, store giữ dữ liệu của người đang đăng nhập) phải được xoá trong
`resetAccountScopedState()` — không thì người đăng nhập sau thấy dữ liệu người trước. Đừng tự nghe `logout()` ở nơi
khác: `onSessionEnd` là nguồn duy nhất, kể cả khi đổi tài khoản (`switched`).

**Thêm provider toàn cục:** bọc trong `AppProvider` (dưới `QueryClientProvider` nếu cần query). Phần tử gắn một lần
không phụ thuộc route (lớp nổi, toast kiểu mới) → `AppOverlays`. Thứ cần router (`useNavigate`, `useLocation`) KHÔNG
đặt ở đây — router nằm bên trong; đặt quanh `<Outlet />` của `RootLayout`.

## 4. Cây route

```
appRoutes                                   src/app/router/setup/app-routes.tsx
└── route gốc
    │   element:      DocumentTitleSync + RouteAnnouncer + DisplayUrlSync + RootLayout
    │   errorElement: RouteErrorScreen      lưới đỡ cuối: lỗi ở guard, layout, Header, Dock
    ├── GuestGuard                          đang có phiên → đưa tới đích quay lại
    │   └── AuthLayout
    │       └── GUEST_PAGES                 /login · /register · /forgot-password · /reset-password
    ├── AuthGuard                           chưa đăng nhập → /login (nhớ đích)
    │   └── AppShellLayout                  Header + <main> + Dock + bảng lệnh
    │       ├── APP_PAGES                   / · /profile · /settings
    │       └── MODULE_REGISTRY             mỗi phân hệ là một layout route (/demo …)
    ├── FALLBACK_PAGES  (level 'app')       /403 · /404 — ngoài mọi guard và layout, nạp sẵn
    └── *  → <Navigate replace to={PATHS.NOT_FOUND} />
```

Mỗi trang sau khi dựng có dạng `PermissionGuard?` → `LazyLoad` → trang. Hai bộ đồng bộ và vùng báo chuyển trang
đứng ở route GỐC (cạnh `RootLayout`) để phủ cả trang ngoài `AuthGuard` (đăng nhập, 403, 404).
⛔ `app-routes.tsx` không khai component (`clean-code-standards.md §5`) và chỉ trả lời "nhóm nào sau guard nào, trong
layout nào" — path, trang, quyền, tiêu đề khai ở hai nơi dưới đây.

### 4.1 Hai nơi khai route — và chỉ hai

| Khai ở | Cho | Path lấy từ | Nhóm |
|---|---|---|---|
| `src/app/router/static.routes.ts` | Trang tĩnh, không thuộc phân hệ | `PATHS` (`src/shared/constants/paths.constants.ts`) | `GUEST_PAGES` (sau `GuestGuard`, trong `AuthLayout`) · `APP_PAGES` (sau `AuthGuard`, trong `AppShellLayout`) · `FALLBACK_PAGES` (ngoài mọi guard / layout) |
| `src/app/router/modules/<id>.routes.ts` + một dòng trong `MODULE_REGISTRY` | Phân hệ nghiệp vụ | khai ngay trong `ModuleDef` | luôn sau `AuthGuard`, trong `AppShellLayout` |

Từ hai nơi đó dựng ra route, guard quyền, Dock, bảng lệnh, tên tab, câu báo chuyển trang — không chỗ nào giữ danh
sách path / tên thứ hai (`routing-conventions.md §1`).

### 4.2 Kiểu khai báo — `definition/route.types.ts`

| Kiểu | Hình dạng | Ghi chú |
|---|---|---|
| `RouteDef` — trang | `{ id?, path, page, permission?, meta }` | path con TƯƠNG ĐỐI (`create`, `:id`) |
| `RouteDef` — trang index | `{ id?, index: true, page, permission?, meta? }` | trang mặc định của route cha; bỏ `meta` thì dùng của cha |
| `RouteDef` — layout | `{ id?, path, layout?, permission?, meta?, children }` | `layout` phải render `<Outlet />`; bỏ trống = `<Outlet />` trần |
| `StaticPageDef` | trang + `id` bắt buộc, `path` tuyệt đối, `meta: RouteMeta & MenuMeta` | entry của `static.routes.ts` |
| `ModuleDef` | `{ id, path, layout?, permission?, meta, children }` | `meta.icon` bắt buộc; `permission` bỏ trống = `{ resource: id, action: 'view' }` |

Thứ tự key cố định: `id → path / index → page / layout → permission → meta → children`. `meta` đi nguyên vào
`handle` của route (`RouteHandle = Partial<RouteMeta> & { id? }`) và hiện ra ở:

| Field | Khai ở | Hiện ra ở |
|---|---|---|
| `title` | mọi route | Dock (tooltip), bảng lệnh, vế tên tab trình duyệt, câu báo chuyển trang, `PlaceholderPage` |
| `tabTitle` | mọi route | tên tab trình duyệt, thay `title` |
| `tabTitles` + `defaultTab` | route có tab nội bộ | tên tab trình duyệt theo `?tab=` / `:tab` (§8) |
| `icon` | phân hệ (bắt buộc) · trang tĩnh (tuỳ) | Dock, bảng lệnh; trang tĩnh không `icon` thì không vào menu |
| `subtitle` | cấp cao nhất | dòng mô tả trong bảng lệnh |
| `order` · `hideInMenu` | cấp cao nhất | thứ tự tăng dần · ẩn khỏi Dock và bảng lệnh (route vẫn chạy) |
| `landingPath` | phân hệ | đích khi bấm ở Dock / bảng lệnh (§5.9) |

Lỗi hay gặp của từng field: `routing-conventions.md §6`.

### 4.3 Từ khai báo tới `RouteObject` — `setup/build-routes.tsx`

- `buildRoutes(defs, { level })` dựng `RouteObject[]`; `buildModuleRoutes(modules, options)` chuẩn hoá phân hệ bằng
  `toModuleRoute` (giải `permission` mặc định / `'authenticated'`) rồi dựng như trên.
- Mỗi `RouteDef` thành một route LỒNG NHAU: `permission` → bọc `<PermissionGuard>`; guard của cha render trước,
  của con render bên trong → quyền CỘNG DỒN tự nhiên.
- Có `children` → layout: `<LazyLoad component={layout} />` hoặc `<Outlet />`. Không có → trang bọc `<LazyLoad>`.
- `level`: `content` (mặc định — route nằm trong layout, màn chờ / lỗi lấp vùng nội dung) hoặc `app` (ngoài mọi layout,
  chiếm trọn màn hình — `FALLBACK_PAGES` dùng mức này).

### 4.4 `LazyLoad`, `lazyPage` và `preload`

`lazyPage(loader)` là cách DUY NHẤT đưa trang vào route; `LazyLoad` là vỏ mà `buildRoutes` tự bọc (`ErrorBoundary`
có `resetKey={pathname}`) — trang không dùng tay. `Suspense` nằm ở layout (`RootLayout` · `AppShellLayout` ·
`AuthLayout`), đứng yên khi đổi trang — `routing-conventions.md §7`.

```ts
page: lazyPage(() => import('@/features/report/pages/ReportListPage')),
```

Trang export có tên (không `export default`) thì đổi ngay tại loader:

```ts
page: lazyPage(() =>
  import('@/features/report/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
),
```

- Mỗi lần gọi `lazyPage()` là MỘT component riêng — hai route phải giữ nguyên trang khi chuyển qua lại thì khai một
  hằng rồi dùng chung (`routing-conventions.md §7`).
- `page.preload()` tải trước mã trang và giữ lượt tải; `React.lazy` dùng lại đúng lượt đó (không tải hai lần, lượt hỏng
  thì quên để lần sau tải lại). Menu tự gọi khi người dùng có ý định mở (§6) — không tự gọi hàng loạt lúc khởi động.
- `isLazyPage(page)` phân biệt trang nạp lười với trang nạp sẵn (403, 404 không có `preload`).

### 4.5 `getRoutePath(id)` — `@/app/router/modules`

- Tra path ĐẦY ĐỦ của phân hệ / route con có `id`: `getRoutePath('demo.composed')` → `'/demo/ghep'`. Segment động giữ
  nguyên (`'/reports/:id'`) — điền bằng `generatePath` của React Router.
- Chỉ có route thuộc `MODULE_REGISTRY`; trang tĩnh dùng `PATHS.X`. Trả `undefined` khi phân hệ không đăng ký ở chế độ
  đang chạy (tắt theo cờ, demo ở chế độ app) → nơi gọi phải xử lý (xem `DemoLink` trong `HomePage.tsx`: `undefined`
  thì không render nút).
- Chỉ tầng `app` gọi được. Feature cần path tuyệt đối của phân hệ khác: §5.6.

### 4.6 `validateModules` — bắt khai báo sai ngay khi nạp

`module-registry.ts` gọi `validateModules(MODULE_REGISTRY, Object.values(PATHS))` khi `import.meta.env.DEV` (dev và
test). Sai thì ném MỘT lỗi liệt kê mọi vấn đề, dạng:

```
[module-registry] Khai báo phân hệ không hợp lệ:
  • Trùng path "/settings": đã khai ở trang tĩnh "/settings", khai lại ở phân hệ "settings"
  • phân hệ "report" › "/create": path con phải TƯƠNG ĐỐI (vd "create", ":id") — …
```

Dev: lỗi nổ lúc nạp module → overlay của Vite / trang trắng, đọc console. Test:
`tests/app/router/validate-modules.test.ts` ("registry thật của app hợp lệ") đỏ. Danh sách luật kiểm:
`routing-conventions.md §8`. Bản build production không chạy bước này — cổng là test.

## 5. Hướng dẫn từng bước

Ví dụ xuyên suốt: phân hệ **Báo cáo**, `id` `report`, path `/reports`, trang ở `src/features/<id>/pages/`. Mẫu code
viết đúng quy ước repo: khối tài liệu sát khai báo, `export default` ở cuối, UI qua `@/shared/ui`, không comment
khác (`comment-policy.md`). Thay tên theo dự án.

### 5.1 Thêm trang tĩnh sau đăng nhập (vd `/notifications`)

1. Thêm path vào `PATHS` (`src/shared/constants/paths.constants.ts`):

   ```ts
   PROFILE: '/profile',
   SETTINGS: '/settings',
   NOTIFICATIONS: '/notifications',
   ```

2. Tạo trang. Trang chung của app → `src/app/pages/<Tên>Page.tsx`; trang thuộc một nghiệp vụ → feature của nó.

   ```tsx
   import { EmptyState, PageShell, TitleScreen } from '@/shared/ui';

   /**
    * NotificationsPage — thông báo của người đang đăng nhập (`/notifications`).
    */
   function NotificationsPage() {
     return (
       <PageShell variant="flow">
         <TitleScreen icon="bell-bold" iconColor="sky" subtitle="THÔNG BÁO" title="Thông báo" />
         <EmptyState
           description="Bạn chưa có thông báo nào."
           icon="bell-bold"
           iconColor="sky"
           title="Chưa có thông báo"
         />
       </PageShell>
     );
   }

   export default NotificationsPage;
   ```

3. Thêm entry vào `APP_PAGES` trong `static.routes.ts`. Có `meta.icon` → hiện ở nhóm "Điều hướng chung" của bảng lệnh
   (trang tĩnh không lên Dock):

   ```ts
   {
     id: 'notifications',
     path: PATHS.NOTIFICATIONS,
     page: lazyPage(() => import('@/app/pages/NotificationsPage')),
     meta: { title: 'Thông báo', icon: 'bell-outline' },
   },
   ```

4. Test: `tests/app/router/app-routes.test.tsx` tự kiểm `PATHS` ↔ entry. Entry CÓ `icon` → sửa kỳ vọng của bài
   `nhóm "Điều hướng chung"…` (nó liệt kê đủ danh sách) — thêm `{ id: 'notifications', … }` vào cuối.
5. Dẫn tới trang: `<Link to={PATHS.NOTIFICATIONS}>` (`navigable-controls.md`).

Trang cần quyền riêng: thêm `permission: { resource: 'notification', action: 'view' }` vào entry — `buildRoutes` tự bọc
`PermissionGuard`, menu tự ẩn với người thiếu quyền.

### 5.2 Thêm trang khách — chưa đăng nhập (vd kích hoạt tài khoản)

Trang khách nằm sau `GuestGuard`, trong `AuthLayout`: người ĐANG có phiên mở trang này bị đưa đi (tới đích quay lại
hoặc trang chủ).

1. `PATHS.ACTIVATE_ACCOUNT: '/activate'`.
2. Trang đặt cạnh các trang xác thực, dựng bằng `AuthPageFrame` (mẫu thật: `src/features/auth/pages/ForgotPasswordPage.tsx`):

   ```tsx
   import { PATHS } from '@/shared/constants/paths.constants';
   import { Callout } from '@/shared/ui';

   import AuthPageFrame from '../components/AuthPageFrame';

   const FOOTER = { label: 'Quay lại đăng nhập', to: PATHS.LOGIN } as const;

   /**
    * ActivateAccountPage — kích hoạt tài khoản từ liên kết trong email (`/activate`), cho người chưa đăng nhập.
    */
   function ActivateAccountPage() {
     return (
       <AuthPageFrame footer={FOOTER} title="Kích hoạt tài khoản">
         <Callout intent="info">Đang kiểm tra liên kết kích hoạt…</Callout>
       </AuthPageFrame>
     );
   }

   export default ActivateAccountPage;
   ```

3. Entry trong `GUEST_PAGES`, **không** `icon` (test kỳ vọng `toPageMenu(GUEST_PAGES)` rỗng):

   ```ts
   {
     id: 'activate-account',
     path: PATHS.ACTIVATE_ACCOUNT,
     page: lazyPage(() => import('@/features/auth/pages/ActivateAccountPage')),
     meta: { title: 'Kích hoạt tài khoản' },
   },
   ```

Trang khách chỉ gọi API; **không** tự `navigate` sau khi đăng nhập thành công — `GuestGuard` thấy phiên mới và tự đưa
đi (§7). Chế độ demo (kiểm đăng nhập tắt) vẫn xem được trang khách để trình diễn form.

### 5.3 Trang dự phòng và trang công khai (không cần đăng nhập)

**Trang dự phòng** (`FALLBACK_PAGES` — 403, 404, bảo trì): ngoài mọi guard và layout, `level="app"`, **nạp sẵn**
(import tĩnh, không `lazyPage`) để vẫn hiện được khi mạng hỏng. Ví dụ trang bảo trì: thêm `PATHS.MAINTENANCE`, trang
đặt ở `src/app/pages/status/` dựng bằng `StatusPage` (có `<main>`, `<h1>` và cặp nút "Quay lại / Về trang chủ" sẵn),
rồi một entry trong `FALLBACK_PAGES`:

```tsx
import StatusPage from './StatusPage';

/**
 * MaintenancePage — trang bảo trì, nằm ngoài mọi guard / layout.
 */
function MaintenancePage() {
  return (
    <StatusPage
      code="503"
      description="Hệ thống đang bảo trì. Vui lòng quay lại sau ít phút."
      title="Đang bảo trì"
    />
  );
}

export default MaintenancePage;
```

```ts
import MaintenancePage from '@/app/pages/status/MaintenancePage';

{ id: 'maintenance', path: PATHS.MAINTENANCE, page: MaintenancePage, meta: { title: 'Đang bảo trì' } },
```

**Trang công khai** (ai cũng xem được, có phiên hay không — điều khoản, giới thiệu) phải nằm NGOÀI cả `AuthGuard`
lẫn `GuestGuard`. Base chưa có nhóm này; đừng nhét vào `FALLBACK_PAGES` (nhóm đó dành cho trang nạp sẵn). Tạo nhóm
mới — bốn chỗ sửa:

1. `PATHS.TERMS: '/terms'`.
2. Nhóm mới trong `static.routes.ts`, trang nạp lười như thường:

   ```ts
   /** Công khai — ngoài mọi guard: ai cũng xem được, có phiên hay không. */
   export const PUBLIC_PAGES: readonly StaticPageDef[] = [
     {
       id: 'terms',
       path: PATHS.TERMS,
       page: lazyPage(() => import('@/app/pages/TermsPage')),
       meta: { title: 'Điều khoản sử dụng' },
     },
   ];
   ```

3. Một dòng trong `app-routes.tsx`, đặt TRƯỚC nhóm dự phòng. Không layout → `level: 'app'`; nhiều trang chung một khung
   → bọc layout (§12) và để `level` mặc định:

   ```tsx
   ...buildRoutes(PUBLIC_PAGES, { level: 'app' }),
   ...buildRoutes(FALLBACK_PAGES, { level: 'app' }),
   ```

4. Thêm `PUBLIC_PAGES` vào `STATIC_PAGES` của `tests/app/router/app-routes.test.tsx` — bài "mỗi entry dùng một path
   của `PATHS`" đối chiếu đúng danh sách đó.

Trang ngoài layout tự lo khung toàn màn: đúng một `<main>` và một `<h1>` (`tests/app/layouts/page-frames.test.tsx` giữ
quy ước này cho trang ngoài khung; `StatusPage` là mẫu). Trang ngoài `AppShellLayout` không có Header, Dock, bảng lệnh,
`PageHeader` (§11).

### 5.4 Thêm phân hệ mới từ đầu

Quy trình rút gọn có ở skill `new-feature`; dưới đây là bản đầy đủ có mẫu.

**Bước 0 — chốt ba thứ:** `id` kebab-case (cũng là tên folder feature và `resource` khi kiểm quyền), `path` tuyệt đối
(`/reports`), quyền BE cấp cho người được vào (mặc định chuỗi `report:view` trong `user.permissions`).

**Bước 1 — folder feature** theo cây ở `feature-structure.md` (nguồn duy nhất). Ban đầu chỉ cần `pages/`; thêm
`api/ service/ schemas/ components/ hooks/` khi có file thật. Không tạo `index.ts` ở gốc feature nếu chưa ai ngoài
feature import nó.

**Bước 2 — trang mở đầu** (ghép theo `page-structure.md`; chọn component bằng `reuse-first.md`):

```tsx
import { Link } from 'react-router-dom';

import { usePermission } from '@/domains/session';
import { Button, EmptyState, PageBody, PageShell, TitleScreen } from '@/shared/ui';

/**
 * ReportListPage — trang mở đầu của phân hệ Báo cáo (`/reports`); nút "Tạo báo cáo" chỉ hiện khi có quyền
 * `report:create` (route `create` cũng tự chặn bằng `permission`).
 */
function ReportListPage() {
  const canCreate = usePermission({ resource: 'report', action: 'create' });

  return (
    <PageShell>
      <TitleScreen
        icon="chart-line-bold"
        iconColor="sky"
        right={
          canCreate && (
            <Button asChild size="sm">
              <Link to="create">Tạo báo cáo</Link>
            </Button>
          )
        }
        subtitle="REPORTS"
        title="Báo cáo"
      />
      <PageBody overflow="scroll">
        <EmptyState
          description="Chưa có báo cáo nào."
          icon="chart-line-bold"
          iconColor="sky"
          title="Danh sách trống"
        />
      </PageBody>
    </PageShell>
  );
}

export default ReportListPage;
```

**Bước 3 — khai `ModuleDef`** ở `src/app/router/modules/<id>.routes.ts` (chép `demo.routes.ts`):

```ts
import { lazyPage, type ModuleDef } from '../definition';

/**
 * reportModule — phân hệ Báo cáo: danh sách (index), tạo mới, chi tiết theo `:id`.
 */

export const reportModule: ModuleDef = {
  id: 'report',
  path: '/reports',
  meta: {
    title: 'Báo cáo',
    subtitle: 'Báo cáo định kỳ và số liệu tổng hợp',
    icon: 'chart-line-outline',
    order: 10,
  },
  children: [
    { index: true, page: lazyPage(() => import('@/features/report/pages/ReportListPage')) },
    {
      id: 'report.create',
      path: 'create',
      page: lazyPage(() => import('@/features/report/pages/CreateReportPage')),
      permission: { resource: 'report', action: 'create' },
      meta: { title: 'Tạo báo cáo' },
    },
    {
      id: 'report.detail',
      path: ':id',
      page: lazyPage(() => import('@/features/report/pages/ReportDetailPage')),
      meta: { title: 'Chi tiết' },
    },
  ],
};
```

**Bước 4 — đăng ký** trong `src/app/router/modules/module-registry.ts`. Chỉ sửa file này — không đụng `app-routes.tsx`,
Dock, bảng lệnh hay logic tên tab:

```ts
import { demoModule } from './demo.routes';
import { reportModule } from './report.routes';
import { validateModules } from './validate-modules';

export const MODULE_REGISTRY: readonly ModuleDef[] = [
  reportModule,
  ...(appConfig.isDemo ? [demoModule] : []),
];
```

**Bước 5 — icon.** `meta.icon` là `SystemIconName`: chọn bản `-outline` có sẵn (xem mục icon ở `/demo`, tìm không dấu);
icon trong trang (`TitleScreen`) dùng bản `-bold`. Cần icon mới → `icon-conventions.md`.
⛔ KHÔNG chạy `generate:icons` — generator lệch registry đang commit (`known-issues.md`).

**Bước 6 — quyền.** Mặc định vào phân hệ cần `report:view`; route con khai thêm (`report:create`). Phân hệ không có dữ
liệu riêng của ai → `permission: 'authenticated'` (đừng chép từ `demo.routes.ts` sang phân hệ nghiệp vụ). Chi tiết §5.7.

**Bước 7 — chạy thật.** `npm run dev`, mở `/reports`: có mục Dock, có trong Ctrl/⌘+K, tên tab `Báo cáo | <tên app>`,
F5 vẫn đứng đúng trang. ⚠️ Chế độ demo mở MỌI quyền — muốn thấy guard / menu ẩn hiện thật thì chạy chế độ app
(`VITE_APP_MODE=app` trong `.env.local`, cần backend) hoặc kiểm bằng test (§13).

**Bước 8 — test + `npm run check`** (§13). `check:unused-files` (knip) báo file `*.routes.ts` / trang chưa ai nạp — dấu
hiệu quên bước 4.

**Chưa có màn hình thật?** Đăng ký ngay với trang giữ chỗ — route, Dock, quyền chạy được, tiêu đề lấy từ `meta.title`;
có màn thật thì đổi `page`:

```ts
import { LazyPlaceholderPage } from './lazy-placeholder-page';

children: [{ index: true, page: LazyPlaceholderPage }],
```

### 5.5 Thêm trang con, layout con, tab

**Trang con** — một entry trong `children`, path TƯƠNG ĐỐI:

```ts
{
  id: 'report.export',
  path: 'export',
  page: lazyPage(() => import('@/features/report/pages/ExportReportPage')),
  permission: { resource: 'report', action: 'export' },
  meta: { title: 'Xuất báo cáo' },
},
```

→ URL `/reports/export`, tên tab `Báo cáo · Xuất báo cáo | <tên app>`, quyền `report:view` + `report:export`.
`id` chỉ cần khi có nơi tra path bằng `getRoutePath`; quy ước `<id phân hệ>.<tên>`.

**Layout con** — nhóm màn chung một khung (vd `/reports/:id` và `/reports/:id/settings`): route có `children`,
`layout` render `<Outlet />`, màn mặc định là `index: true`:

```ts
{
  path: ':id',
  layout: lazyPage(() => import('@/features/report/pages/ReportLayout')),
  meta: { title: 'Chi tiết' },
  children: [
    { index: true, page: lazyPage(() => import('@/features/report/pages/ReportDetailPage')) },
    {
      path: 'settings',
      page: lazyPage(() => import('@/features/report/pages/ReportSettingsPage')),
      meta: { title: 'Cài đặt báo cáo' },
    },
  ],
},
```

```tsx
import { Outlet, useParams } from 'react-router-dom';

import { PageHeader } from '@/shared/widgets/header';

/**
 * ReportLayout — khung chung của `/reports/:id/*`: giữ tên báo cáo trên thanh header, màn con (chi tiết,
 * cài đặt) render vào `<Outlet />`.
 */
function ReportLayout() {
  const { id } = useParams();

  return (
    <>
      <PageHeader subtitle="BÁO CÁO" title={`Báo cáo ${id ?? ''}`} titleSize="sm" />
      <Outlet />
    </>
  );
}

export default ReportLayout;
```

Layout giữ nguyên khi đi giữa các màn con (state của nó không mất). Nó có vùng cuộn RIÊNG sống qua các màn con thì
gắn `useRouteScrollRestoration` (§8).

**Tab trên URL (`?tab=`)** — tab là trạng thái của MỘT trang, không phải route riêng. Đọc / ghi bằng `useQueryParams()`,
href thật bằng `useNavHref()` (giữ nguyên các param lọc khác), hiện trên thanh header bằng `PageHeader nav` (thân trang
lược bớt; mẫu đầy đủ có tab trong state: `src/features/demo/composed/pages/ComposedDemoPage.tsx`):

```tsx
import { useMemo } from 'react';

import { useNavHref, useQueryParams } from '@/shared/hooks';
import { PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

const REPORT_TABS = [
  { key: 'summary', label: 'Tổng quan' },
  { key: 'detail', label: 'Số liệu chi tiết' },
] as const;

const DEFAULT_TAB = 'summary';

/**
 * ReportListPage — danh sách báo cáo, chia tab `?tab=summary | detail` trên thanh header.
 */
function ReportListPage() {
  const { tab, setTab } = useQueryParams();
  const buildHref = useNavHref();

  const navItems = useMemo(
    () => REPORT_TABS.map((item) => ({ ...item, href: buildHref({ tab: item.key }) })),
    [buildHref],
  );

  return (
    <PageShell>
      <PageHeader
        nav={{ items: navItems, active: tab || DEFAULT_TAB, onSelect: setTab }}
        title="Báo cáo"
        tone="sky"
      />
    </PageShell>
  );
}

export default ReportListPage;
```

Tên tab trình duyệt theo tab: khai chuỗi NGAY trong `meta` của route (không import hằng từ feature — kéo code feature
vào bundle chính):

```ts
meta: {
  title: 'Báo cáo',
  icon: 'chart-line-outline',
  tabTitles: { summary: 'Tổng quan', detail: 'Số liệu chi tiết' },
  defaultTab: 'summary',
},
```

→ `/reports` thành `Báo cáo · Tổng quan`, `/reports?tab=detail` thành `Báo cáo · Số liệu chi tiết`.
`defaultTab` phải có trong `tabTitles` (`validateModules` kiểm).

**Tab là segment của path** — route con đặt tên tham số đúng là `tab`; bảng `tabTitles` gần nhất (từ trang ra phân
hệ) được tra trước:

```ts
{ path: 'view/:tab', page: ReportViewPage, meta: { title: 'Xem', tabTitles: { chart: 'Biểu đồ' } } },
```

### 5.6 Route có tham số động (`:id`) và dẫn link tới nó

**Khai:** `{ id: 'report.detail', path: ':id', page, meta: { title: 'Chi tiết' } }` (§5.4). Nhiều tham số:
`path: ':id/versions/:versionId'`. `:id` và `:slug` cùng cấp là CÙNG một mẫu — `validateModules` báo trùng.

**Đọc trong trang:** `useParams()` trả `string | undefined` — xử lý `undefined`, không ép kiểu:

```tsx
import { Link, useParams } from 'react-router-dom';

import { Button, PageShell, TitleScreen } from '@/shared/ui';

/**
 * ReportDetailPage — chi tiết một báo cáo (`/reports/:id`); `id` đọc từ URL, dữ liệu lấy qua hook của
 * `service/` của feature.
 */
function ReportDetailPage() {
  const { id = '' } = useParams();

  return (
    <PageShell variant="flow">
      <TitleScreen
        icon="chart-line-bold"
        iconColor="sky"
        right={
          <Button asChild size="sm" variant="stroke">
            <Link to="..">Về danh sách</Link>
          </Button>
        }
        subtitle="REPORT"
        title={`Báo cáo ${id}`}
      />
    </PageShell>
  );
}

export default ReportDetailPage;
```

**Dẫn link — chọn theo nơi đặt link:**

| Link nằm ở | Viết | Ví dụ |
|---|---|---|
| Trong chính phân hệ (feature) | Path TƯƠNG ĐỐI theo cây route | `<Link to={row.id}>` ở trang index → `/reports/12` · `<Link to="..">` · `<Link to="settings">` |
| Tầng `app` (trang chủ, shell) | `getRoutePath(id)` + `generatePath` | mẫu dưới |
| Feature KHÁC (không import được `app`) | Hằng path trong feature + test đối chiếu `getRoutePath` | mẫu thật: `src/features/demo/shared/constants/screens.constants.ts` + bài "đường dẫn giữa các màn khớp route đã đăng ký" trong `tests/features/demo/demo-sections-wired.test.ts` |
| Trang tĩnh | `PATHS.X` | `<Link to={PATHS.PROFILE}>` |

```tsx
import { generatePath, Link } from 'react-router-dom';

import { getRoutePath } from '@/app/router/modules';

const REPORT_DETAIL_PATH = getRoutePath('report.detail');

{REPORT_DETAIL_PATH && (
  <Link to={generatePath(REPORT_DETAIL_PATH, { id: report.id })}>{report.name}</Link>
)}
```

Đi tới trang là `<Link>` thật, không `onClick={() => navigate(…)}` (`navigable-controls.md`). `navigate()` chỉ dùng SAU
một hành động, vd tạo xong thì sang trang chi tiết: `` void navigate(`../${created.id}`, { replace: true }) `` từ
trang `create` (đường tương đối theo route: `..` là `/reports`).

### 5.7 Quyền — ở route và trong component

| Muốn | Khai |
|---|---|
| Vào phân hệ cần quyền mặc định | bỏ trống `permission` → `{ resource: '<id>', action: 'view' }` |
| Vào phân hệ cần quyền khác | `ModuleDef.permission: { resource: 'report', action: 'approve' }` |
| Chỉ cần đăng nhập | `ModuleDef.permission: 'authenticated'` (route con có `permission` vẫn chặn) |
| Một màn con cần THÊM quyền | `permission` trên route con / layout con / trang index — cộng dồn, không "nới" được quyền cha |
| Trang tĩnh cần quyền | `permission` trên entry của `APP_PAGES` |
| Ẩn / khoá một nút, một khối | `usePermission({ resource, action })` trong component |
| Hành động mới (`'sign'`…) | thêm vào union `PermissionAction` ở `src/domains/session/model/permission.utils.ts` |

```tsx
const canExport = usePermission({ resource: 'report', action: 'export' });

return canExport ? <Button onClick={handleExport}>Xuất Excel</Button> : null;
```

- Một luật cho cả ba nơi — guard, menu, `usePermission` — là `canAccess(user, permissions)` (`@/domains/session`):
  vai trò `admin` có mọi quyền; quyền lưu trong `user.permissions` dạng `"resource:action"`.
- Chế độ demo (kiểm đăng nhập tắt): `canAccess` luôn `true` — nút ẩn theo quyền vẫn hiện.
- `PermissionGuard` phản ứng NGAY khi quyền đổi (quyền bị thu hồi lúc đang đứng trong route → 403).
- Khai lại đúng quyền mà cha đã áp là lỗi (`validateModules`: "permission trùng với quyền cấp cha đã áp").
- ⚠️ Chỉ điều khiển giao diện; quyền thật do BE kiểm trên từng API (`routing-conventions.md §5`).

### 5.8 Bật / tắt phân hệ theo cờ

Registry là mảng tĩnh, dựng một lần lúc nạp — cờ phải biết được lúc nạp module (biến môi trường), không phải dữ liệu
tải từ BE.

```ts
export const MODULE_REGISTRY: readonly ModuleDef[] = [
  reportModule,
  ...(appConfig.reportEnabled ? [reportArchiveModule] : []),
  ...(appConfig.isDemo ? [demoModule] : []),
];
```

- Cờ mới: khai biến `VITE_*` theo hướng dẫn đầu `src/core/config/env.schema.ts` (`rawEnvSchema` + `AppEnv` +
  `src/vite-env.d.ts` + `.env.example`), đọc qua `appConfig` (`@/core/config`).
- Tắt thì: route không mount (URL gõ tay → 404), không có ở Dock / bảng lệnh, `getRoutePath` của nó trả `undefined`,
  chunk trang không bao giờ tải.
- Chỉ muốn giấu khỏi menu, route vẫn chạy → `meta.hideInMenu: true`. Ẩn theo NGƯỜI dùng → quyền (§5.7), không phải cờ.
- Gỡ hẳn phân hệ demo khi dựng dự án thật: `README.md` gốc §"Dựng dự án thật" (nhớ sửa các test còn nhắc id / path
  `demo` trong `tests/app/router/`).

### 5.9 Đổi trang mở đầu (landing) của phân hệ

Bấm phân hệ ở Dock / bảng lệnh đi tới `meta.landingPath ?? path`. Mục menu nạp trước và kiểm quyền theo CHÍNH trang đích
đó (`findLandingEntry`).

- **Cách 1 (nên dùng):** cho màn muốn mở đầu làm `index: true` của phân hệ.
- **Cách 2 — `landingPath`:** khi màn đó phải có URL riêng (`/reports/overview`), hoặc mở sẵn một tab
  (`landingPath: '/reports?tab=detail'` — phần `?query` bỏ qua khi tra route). Phải trỏ tới route đã khai, không thì
  `validateModules` ném lỗi.

⚠️ Với cách 2 mà phân hệ KHÔNG có trang index, gõ thẳng `/reports` chỉ khớp layout của phân hệ → khung trống. Giữ một
trang index (danh sách) hoặc trang index chuyển hướng:

```tsx
import { Navigate } from 'react-router-dom';

/**
 * ReportIndexPage — `/reports` gõ tay thì chuyển sang màn mở đầu `overview` (khớp `meta.landingPath`).
 */
function ReportIndexPage() {
  return <Navigate replace to="overview" />;
}

export default ReportIndexPage;
```

## 6. Menu · Dock · bảng lệnh

```
APP_PAGES ──────── toPageMenu ───┐                                         ┌─► AppDock            (modules)
                                 ├─► useAppMenu() ── canAccess(user, …) ───┤
MODULE_REGISTRY ── toModuleMenu ─┘   (src/app/router/menu)                  └─► AppCommandPalette  (pages + modules)
```

- `toPageMenu` / `toModuleMenu` (`menu/build-menu.utils.ts`) dựng `MenuItem { id, title, subtitle?, icon, href,
  permissions, preload? }` MỘT lần lúc nạp module; `useAppMenu()` chỉ lọc theo người dùng hiện tại.
- Vào menu: trang tĩnh có `meta.icon` và không `hideInMenu`; phân hệ không `hideInMenu`. Sắp theo `meta.order` tăng dần,
  không khai thì xếp cuối theo thứ tự khai báo.
- `href` = `landingPath ?? path`; `permissions` = mọi quyền cộng dồn tới TRANG ĐÍCH → mục nào hiện thì bấm vào là vào
  được (bài kiểm "menu và guard nói cùng một điều" — `tests/app/router/module-routes.test.tsx`).
- `preload` nạp trước trang đích + layout của mọi tầng bao nó; Dock gọi khi rê chuột / focus (`onIntent`), bảng lệnh gọi
  khi mục được tô sáng. Phân hệ chỉ có trang nạp sẵn → không có `preload`.
- Không nơi nào tự lọc quyền hay giữ danh sách mục riêng: thêm mục Dock = thêm phân hệ. Lệnh không phải điều hướng
  (đổi theme, mở modal) thêm ở `AppCommandPalette` (§11).

## 7. Guard và phiên đăng nhập

**`useSessionGate()`** (`guards/useSessionGate.ts`) khôi phục phiên nếu chưa (`useRestoreSession`) rồi trả MỘT trong năm
nhánh — hai guard chỉ còn một `switch`, không tự đọc `status` hay `appConfig.authEnabled`:

| Gate | Khi | `AuthGuard` | `GuestGuard` |
|---|---|---|---|
| `signed-in` | `status === 'authenticated'` | vào (`<Outlet />`) | `<Navigate replace>` tới `resolveReturnPath(location.state)` |
| `open` | kiểm đăng nhập tắt (chế độ demo) | vào | vào (xem form) |
| `pending` | `idle` / `restoring` — chưa hỏi xong máy chủ | `<LoadingScreen level="app" />` | `<LoadingScreen level="app" />` |
| `unavailable` | không hỏi được máy chủ (mất mạng, 5xx) | `SessionUnavailablePage`, GIỮ URL | vào |
| `signed-out` | máy chủ xác nhận không có phiên | `<Navigate replace to={PATHS.LOGIN} state=…>` | vào |

- **Đích quay lại.** `AuthGuard` ghi `createReturnState(location)` (pathname + search + hash) — trừ khi vừa đăng xuất
  CHỦ ĐỘNG (`endReason === 'logout'`). `GuestGuard` đọc bằng `resolveReturnPath`, chỉ nhận đường NỘI BỘ (`//evil.com`,
  `/\evil.com`, URL tuyệt đối → về trang chủ). Chỉ cặp này đụng tới `location.state.from`.
- **Đăng nhập.** Trang gọi `useLogin()` (`establishSession` khi thành công) và KHÔNG `navigate` — `GuestGuard` thấy
  `signed-in` và đưa đi.
- **Đăng xuất.** Gọi `void logout()` rồi thôi. `AuthGuard` là nơi DUY NHẤT đưa về `/login` (hết hạn, tab khác đăng xuất,
  và cả ngay sau `logout()`); hai nơi cùng điều hướng thì lệch nhau về `replace` / đích quay lại. ESLint
  `guard/login-redirect` chặn `navigate(PATHS.LOGIN…)` ngoài `src/app/router/guards`.
- **Khôi phục phiên (F5).** Token chỉ nằm trong bộ nhớ → khung hình đầu là `idle` → `pending` → một lượt refresh →
  `authenticated` / `anonymous` / `unavailable`. Nút "Thử lại" của `SessionUnavailablePage` gọi `restoreSession()`.
  Gọi trùng vô hại: chỉ chạy từ `idle` / `unavailable` (`docs/architecture.md §6`).
- **Đa tab / đổi người.** `startSessionSync()` (bootstrap) đồng bộ giữa các tab; `onSessionEnd` dọn cache theo tài khoản.
- **Chế độ demo** (`VITE_APP_MODE=demo` → `authEnabled` mặc định `false`): gate `open`, không có lời gọi refresh nào,
  `canAccess` luôn `true`, phân hệ demo được đăng ký. Bảng hai chế độ: `docs/architecture.md §10`.
- **`PermissionGuard`** thiếu quyền → `<Navigate replace to={PATHS.FORBIDDEN} />`; luôn nằm BÊN TRONG `AuthGuard`, không
  kiểm đăng nhập. `buildRoutes` tự lồng theo `permission` — hầu như không viết tay.
- Điều kiện vào riêng của MỘT phân hệ (vd phải chọn dự án trước) → `layout` của phân hệ tự render `<Navigate>` hoặc
  `<Outlet />`; đừng chèn guard mới vào `app-routes.tsx` chỉ cho một phân hệ.

## 8. Đồng bộ và điều hướng

**Tên tab trình duyệt** — `DocumentTitleSync` + `resolveDocumentTitle(useMatches(), search)`:

- Dạng `Phân hệ · Màn con | Tên app`. Vế đầu: route ngoài cùng có tiêu đề (`tabTitle ?? title`); vế sau: tab nội bộ
  (`:tab` → `?tab=` → `defaultTab` của chính trang đang đứng, tra `tabTitles` từ trong ra ngoài) hoặc tiêu đề của route
  sâu nhất. Hai vế trùng thì chỉ một vế. Không route nào có tiêu đề → chỉ `APP_NAME`.
- Ví dụ thật (`tests/app/router/sync/document-title.test.tsx`): `/demo/ghep` →
  `Thư viện giao diện · Ghép thực tế — màn hình mẫu | <tên app>`; `/reports/12/settings` → `Báo cáo · Cài đặt báo cáo`.

**URL hiển thị TV** — `DisplayUrlSync`: `?display=tv&scale=1.2` mở thẳng chế độ TV (gửi link cho màn treo tường).
Mỗi `location.key` mới mang param hợp lệ thì URL thắng store MỘT lần; sau đó URL được viết lại khớp store
(`replace`, giữ `hash` + `state` — không làm rơi đích quay lại của guard). Param rác (`?display=abc`) coi như không có.
Trang không cần tự đọc / ghi hai param này. Luật: `tv-display-mode.md`.

**Câu báo chuyển trang** — `RouteAnnouncer`: vùng `aria-live="polite"` ẩn đọc tên màn mới mỗi khi `pathname` đổi (cùng
`resolveScreenTitle` của tên tab). Không đọc ở lần tải đầu và khi chỉ đổi `?search` / `#hash`.

**Khôi phục cuộn** — `useRouteScrollRestoration(ref, scope)` (`src/app/layouts/useRouteScrollRestoration.ts`), gắn ở
`RootLayout` (scope `'root'`) và `<main>` của `AppShellLayout` (scope `'main'`):

| Điều hướng | Vùng cuộn |
|---|---|
| Đổi `pathname` bằng PUSH (bấm link) / REPLACE | về đầu |
| POP (Back / Forward) | khôi phục vị trí đã lưu của mục lịch sử đó (`location.key`) |
| Chỉ đổi `?search` / `#hash` (lọc, tab) | giữ nguyên |

Không dùng `<ScrollRestoration>` của React Router (chỉ cuộn `window`, mà `body` khoá cuộn). Vùng cuộn mới SỐNG QUA nhiều
route (layout con có `overflow-y-auto`) → gắn hook với `scope` riêng. Vùng cuộn nằm TRONG trang (`PageBody
overflow="scroll"`) dựng lại cùng trang nên không cần. Trang tải dữ liệu sau khi hiện thì Back chỉ khôi phục được tới
chiều cao đang có.

## 9. Lỗi và màn chờ

`ScreenLevel` (`screen.types.ts`): `app` — chưa có khung bao quanh, chiếm trọn màn hình; `content` — đã có layout,
chỉ lấp vùng nội dung (Header, Dock vẫn dùng được).

| Chuyện gì xảy ra | Ai bắt | Hiện gì |
|---|---|---|
| `bootstrapApp()` ném lỗi | `try/catch` ở `main.tsx` | `ErrorScreen level="app"` |
| Provider ném lỗi khi render (ngoài cây route) | `ErrorBoundary` của `App` (không `resetKey`) | `ErrorScreen level="app"` tới khi tải lại |
| Guard, layout, Header, Dock ném lỗi | `errorElement` gốc → `RouteErrorScreen` | `ErrorScreen level="app"`; lỗi HTTP do router trả hiện `Lỗi <mã>` |
| MỘT trang ném lỗi / không tải được chunk | `ErrorBoundary` trong `LazyLoad` (`resetKey={pathname}`) | `ErrorScreen` cỡ `level` của route; sang trang khác là tự xoá |
| Đang tải mã trang | `Suspense` của layout (`RootLayout` · `AppShellLayout` · `AuthLayout`) | lần mở đầu: `LoadingScreen` cỡ `app` / `content`; đổi trang: giữ trang cũ, không màn chờ |
| Đang khôi phục phiên | guard (`pending`) | `LoadingScreen level="app"` |
| Lỗi API của query / mutation | `queryClient` (`providers/query-client.ts`) | toast đỏ — KHÔNG phải màn lỗi; tự vẽ lỗi thì `meta: { silentError: true }` (`api-patterns.md`) |

- **Lỗi tải chunk** (vừa triển khai bản mới: `index.html` cũ trỏ tới file đã xoá) → `reloadOnceOnChunkError` tự tải lại
  trang MỘT lần; vẫn lỗi trong 60 giây (`CHUNK_RELOAD_WINDOW_MS`) thì giữ màn lỗi có nút "Tải lại trang". Không ghi được
  cờ chống lặp (storage bị chặn) thì không tự tải lại.
- `describeError(error, showDetail?)` → `{ kind: 'chunk' | 'response' | 'unexpected', title, description }`; chi tiết kỹ
  thuật chỉ hiện ở dev. `logAppError(message, …details)` ghi `console.error` với tiền tố `[giao diện]` — lọc console bằng
  chuỗi này. Code app tự bắt lỗi cũng log qua hàm này.
- Nút của `ErrorScreen` điều hướng CỨNG (`location.reload` / `assign`) — cây React vừa hỏng, không tin client router.
- Tự bọc `ErrorBoundary` quanh một khối? Dùng chính `ErrorBoundary` của `@/app/components` và truyền `resetKey` đổi theo
  thứ mà khối hiển thị — thiếu `resetKey` thì màn lỗi giữ tới khi tải lại trang. Trong feature (không import được `app`):
  hiện lỗi dữ liệu bằng `Callout` / `EmptyState` của UI kit (`page-structure.md §1`).

## 10. Theme và hiển thị

- `<html>` mang trạng thái hiển thị: class `dark`, class `tv`, biến `--ui-scale` và `--lh-scale` (`1 + (scale − 1) × 0.5`)
  — `applyAppearance({ theme, isTv, uiScale })` trong `providers/appearance/appearance.utils.ts` ghi chúng.
- **Lần đầu:** `initializeAppearance()` trong `bootstrapApp` (trước render): áp `?display` / `?scale` hợp lệ vào store
  (`readDisplayOverrides` + `applyDisplayOverrides`), rồi áp lên `<html>`. **Về sau:** `AppearanceSync` (gắn một lần trong
  `AppProvider`) gọi lại bằng `useLayoutEffect` mỗi khi preferences đổi — trước khi trình duyệt vẽ.
- **Giá trị HIỆU LỰC, không phải giá trị đã lưu:** `useEffectiveTheme()` — TV luôn `dark`, ngoài TV là lựa chọn đã lưu;
  `useDisplayStore(selectEffectiveUiScale)` — `1` ngoài TV, ở TV là `1.1 | 1.2 | 1.3` (`UI_SCALE_VALUES`). Đọc thẳng
  `state.uiScale` là sai (ngoài TV store vẫn nhớ mức cũ).
- **Đổi:** theme → `useThemeStore((s) => s.setTheme)` / `toggleTheme`; chế độ → `useDisplayStore((s) => s.setMode)`;
  mức chữ → `setUiScale`. Giá trị từ điều khiển kiểm bằng `parseThemeMode` / `parseUiScale` trước khi ghi (mẫu:
  `SettingsPage.tsx`). TV không ghi đè lựa chọn theme — tắt TV là theme cũ quay lại.
- Biểu đồ nhận hệ số chữ qua `ChartScaleProvider` (gắn trong `AppProvider`); UI kit, widget, chart nhận theme qua props,
  không đọc `@/domains/preferences` (tầng `shared` không được import `domains`).
- Thoát TV bằng phím: Ctrl/⌘ + Alt + Shift + T (`useTvEscapeHatch`, chỉ trong `AppShellLayout`).
- `index.html` mặc định `class="dark"`: chưa có cơ chế đọc preferences trước khi bundle chạy → người dùng theme sáng có
  thể thấy nền tối một nhịp lúc tải.

## 11. Shell: Header, Dock, bảng lệnh

Widget ở `src/shared/widgets` là UI THUẦN — không đọc registry, store phiên hay preferences. `src/app/shell` nối chúng
với app; `AppShellLayout` gắn mỗi thứ MỘT lần.

**`AppHeader`** → `Header` của `@/shared/widgets/header`:

| Prop được nối | Từ |
|---|---|
| `user` | `useSessionStore(selectUser)` → `{ displayName, email, avatarUrl }` |
| `onUserMenuSelect(key)` | `profile` / `settings` → `navigate(USER_MENU_PATHS[key])`; `logout` → `void logout()` |
| `extraMenuOptions` | mục gắn thêm vào menu tài khoản, mỗi mục mang `onSelect` riêng (đang có "Ẩn / Hiện thanh Dock") |
| `actions` | nút icon toàn cục trước nút đổi theme (đang có `CommandPaletteTrigger`) |
| `theme` · `onThemeToggle` · `hideThemeToggle` | `useEffectiveTheme()` · `toggleTheme` · ẩn ở TV |
| `brandLabel` | `APP_NAME` |

Thêm một mục vào menu tài khoản — nối vào mảng `extraMenuOptions` (giữ `useMemo` và dependency):

```tsx
{
  key: 'help',
  label: 'Hướng dẫn sử dụng',
  icon: <SystemIcon name="circle-question-outline" size={16} />,
  onSelect: openHelp,
},
```

Nút toàn cục mới: truyền thêm vào `actions` (Fragment), class `HEADER_ICON_BUTTON_CLASS` để cùng cỡ. "Hồ sơ" / "Cài
đặt" của menu tài khoản hiện là nút + `navigate` vì `Menu` chưa nhận `href` (`known-issues.md`).

**`AppDock`** → `Dock`: `useAppMenu().modules` → `{ id, label, icon, href, onIntent: preload }`. Không thêm mục tay —
thêm phân hệ (§5.4).

**`AppCommandPalette`** → `CommandPalette`, phím Ctrl/⌘+K (`useCommandPaletteShortcut`). Nhóm: "Điều hướng chung"
(trang tĩnh có icon), "Phân hệ", "Giao diện" (đổi theme — ẩn ở TV). Thêm lệnh tại chỗ: thêm nhóm / mục trong `useMemo`
`groups`; mục ĐI TỚI TRANG có `href` (thành `<Link>` thật), mục LỆNH có `onSelect` — không có cả hai
(`CommandPaletteItem`).

**Trang chiếm thanh header bằng `PageHeader`** (`@/shared/widgets/header`): portal tiêu đề, dải tab (`nav`), node trái /
phải (`start` / `end`), nút quay lại (`onBack` + `backHref`) lên `Header`. Đặt ở đầu JSX của trang; trang unmount thì
portal gỡ theo. Cần `HeaderSlotsProvider` — chỉ `AppShellLayout` có, nên trang khách / dự phòng dùng `PageHeader` thì im
lặng không hiện gì. Chip tab đi tới URL phải có `href`. Mẫu thật: `src/features/demo/composed/pages/ComposedDemoPage.tsx`
(tab trong state) · §5.5 (tab trên URL).

## 12. Layout

| Layout | Ở đâu trong cây | Làm gì | Đừng |
|---|---|---|---|
| `RootLayout` | element của route gốc | Nền `bg-bg-page` toàn màn, `h-dvh` + `overflow-y-auto` + `*:shrink-0`: VÙNG CUỘN của mọi trang ngoài khung (`body` khoá cuộn) | Bỏ `overflow-y-auto` / `*:shrink-0` — trang đăng ký cao hơn màn hình mất nút gửi |
| `AuthLayout` | sau `GuestGuard` | Thẻ hai khoang; khoang form là `<main>` tự cuộn, `my-auto` canh giữa form ngắn | Thêm `<main>` thứ hai trong trang khách |
| `AppShellLayout` | sau `AuthGuard` | `HeaderSlotsProvider` → `AppHeader` + đường sáng + `<main>` (lề `SHELL_GUTTER_X` / `SHELL_GUTTER_Y`) + `AppDock` + `AppCommandPalette`; phím thoát TV | Trang tự thêm lề ngoài (`guard/spacing`); thêm prop bật / tắt vùng |

- Lớp bọc nghiệp vụ toàn app (stream thông báo, kiểm phiên bản…) đặt quanh `<Outlet />` của `RootLayout` — phủ cả trang
  ngoài khung, có router.
- Dock mặc định ghim nổi che ~72px đáy giữa, `<main>` không chừa chỗ — màn một-viewport nên để Dock `autohide` /
  `collapsed` (`known-issues.md`).
- **CSS cạnh layout** — thứ Tailwind không diễn đạt được (nền nhiều lớp, gradient, mask) đặt ở file `.css` cạnh layout,
  CHỈ layout đó import. Khuôn (chép từ `src/app/layouts/app-shell-layout.css`):

  ```css
  @reference '../../styles/globals.css';

  @layer components {
    .public-backdrop {
      background-color: var(--color-bg-page);
    }
  }
  ```

  `@reference` bật pipeline Tailwind cho file (không xuất thêm CSS) — có nó mới sinh fallback `color-mix` cho trình duyệt
  cũ. `@layer components` để utility Tailwind gắn cùng phần tử vẫn thắng. Màu chỉ qua `var(--color-*)`
  (`color-system.md`, `css-architecture.md`).
- **Layout mới cho một nhóm trang:** file `src/app/layouts/<Tên>Layout.tsx` render `<Outlet />`, class gom vào bảng
  `XXX_SLOT_CLASSES` khoá theo vùng (`page-structure.md §4`), export ở `src/app/layouts/index.ts`, dùng làm `element` trong
  `app-routes.tsx`. Có vùng cuộn sống qua nhiều route → `useRouteScrollRestoration(ref, '<scope>')`. Layout chỉ của MỘT
  phân hệ → `ModuleDef.layout` / `layout` của route con, đặt trong feature — không đặt ở `src/app/layouts`.

## 13. Kiểm thử

Cây `tests/app` phản chiếu `src/app` (`testing.md §2`):

```
tests/app/
├── app-boot.smoke.test.tsx          mount THẬT cả App ở hai chế độ authEnabled (smoke)
├── bootstrap.test.ts                bootstrapApp: idempotent, disposer, dọn state theo tài khoản
├── appearance.test.tsx              theme / TV / scale lên <html>, SettingsPage
├── index-html.test.ts               index.html khớp tên app, màu nền
├── components/                      ErrorBoundary (resetKey) · ErrorScreen / LoadingScreen · tự tải lại chunk
├── layouts/                         khung trang ngoài khung (vùng cuộn, landmark) · useRouteScrollRestoration
├── router/
│   ├── app-routes.test.tsx          PATHS ↔ route ↔ menu ↔ getRoutePath
│   ├── authenticated-routes.test.tsx  /profile, /settings, 404 dựng THẬT qua appRoutes
│   ├── module-routes.test.tsx       quyền cộng dồn, layout lồng, menu = guard, preload
│   ├── validate-modules.test.ts     registry thật hợp lệ + từng luật của validateModules
│   ├── lazy-load.test.tsx           LazyLoad, lazyPage().preload()
│   ├── route-handle.test.ts         đọc meta từ useMatches()
│   ├── guards/                      AuthGuard / GuestGuard / PermissionGuard · useSessionGate
│   └── sync/                        tên tab · DisplayUrlSync · RouteAnnouncer
└── shell/                           menu tài khoản · Dock / bảng lệnh nạp trước trang
```

**Công cụ:**

| Cần | Dùng |
|---|---|
| Dựng ĐÚNG cây route của app (guard, layout, lazy) | `createMemoryRouter(appRoutes, { initialEntries: [path] })` bọc trong `<AppProvider>` |
| Thử một phân hệ GIẢ, không đụng registry | `buildModuleRoutes([fakeModule])` (`@/app/router/setup`) — mẫu: `tests/app/router/module-routes.test.tsx` |
| Có người đăng nhập | `establishSession({ accessToken, user })` (`@/domains/session`); reset `useSessionStore.setState(useSessionStore.getInitialState(), true)` ở `beforeEach` |
| Bật kiểm đăng nhập (test cố định chế độ demo) | `vi.mock('@/core/config', …)` đặt `authEnabled: true` — mẫu: `tests/app/router/guards/guards.test.tsx` |
| Giả máy chủ (refresh, API) | `mockHttp(handler)` (`tests/helpers/http-mock.ts`) — không `vi.mock('@/core/http')` |
| Component có `<Link>` / `useNavigate` | `renderInRouter(ui, { paths })` (`tests/helpers/render.tsx`) — ném lại lỗi render thay vì xanh giả |

**Mẫu — phân hệ mới mount được và đúng path** (test hành vi của feature đặt ở `tests/features/<id>/`):

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AppProvider } from '@/app/providers';
import { appRoutes } from '@/app/router';
import { getRoutePath } from '@/app/router/modules';

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] });
  render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
  return router;
}

describe('phân hệ Báo cáo', () => {
  it('đăng ký đủ route con, segment động giữ nguyên', () => {
    expect(getRoutePath('report')).toBe('/reports');
    expect(getRoutePath('report.create')).toBe('/reports/create');
    expect(getRoutePath('report.detail')).toBe('/reports/:id');
  });

  it('mở /reports hiện trang danh sách trong khung ứng dụng', async () => {
    renderAt('/reports');
    expect(await screen.findByText('Chưa có báo cáo nào.')).toBeInTheDocument();
  });
});
```

**Mẫu — quyền ở mức route** (bật kiểm đăng nhập, import SAU `vi.mock`):

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return { ...actual, appConfig: { ...actual.appConfig, authEnabled: true } };
});

const { AppProvider } = await import('@/app/providers');
const { appRoutes } = await import('@/app/router');
const { establishSession, useSessionStore } = await import('@/domains/session');

beforeEach(() => {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
});

describe('quyền của phân hệ Báo cáo', () => {
  it('có report:view nhưng thiếu report:create → /reports/create ra 403', async () => {
    establishSession({
      accessToken: 't',
      user: { id: 'u1', email: 'an@congty.vn', name: 'An', roles: [], permissions: ['report:view'] },
    });
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/reports/create'] });
    render(
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>,
    );

    expect(
      await screen.findByRole('heading', { name: 'Không có quyền truy cập' }),
    ).toBeInTheDocument();
  });
});
```

**Mẫu — component có link:**

```tsx
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ReportListPage from '@/features/report/pages/ReportListPage';
import { renderInRouter } from '@tests/helpers/render';

describe('ReportListPage', () => {
  it('"Tạo báo cáo" là liên kết thật tới trang tạo', () => {
    renderInRouter(<ReportListPage />, { paths: ['/reports'] });
    expect(screen.getByRole('link', { name: 'Tạo báo cáo' })).toHaveAttribute('href', '/reports/create');
  });
});
```

Bẫy khi test app:

- ⛔ Đừng chờ chuỗi mà Header / Dock cũng in (tên người dùng, tên phân hệ) — bài kiểm xanh giả. Chờ thứ CHỈ trang đó có
  (lý do ghi ở đầu `tests/app/router/authenticated-routes.test.tsx`).
- Trang nạp lười → dùng `findBy…` / `waitFor`, không `getBy…` ngay sau render.
- Test cố định chế độ demo (`test.env` trong `vite.config.ts`): mọi quyền mở, phân hệ demo có đăng ký — muốn kiểm quyền
  phải bật `authEnabled` như mẫu trên.
- Dựng app thật (`bootstrapApp` + `App`) thì gọi disposer trong `afterEach` — mẫu: `tests/app/app-boot.smoke.test.tsx`.

## 14. Checklist và lỗi thường gặp

**Thêm / sửa trang**

- [ ] Một route = một file `XxxPage.tsx`, `export default`, khối tài liệu sát khai báo (`page-structure.md §2`)
- [ ] Nạp bằng `lazyPage()` (trừ trang dự phòng nạp sẵn); hai route dùng chung trang thì dùng chung một hằng
- [ ] Trang tĩnh: path ở `PATHS` + entry đúng nhóm; có `icon` thì đã sửa kỳ vọng menu trong `app-routes.test.tsx`
- [ ] `meta.title` ngắn; tên tab cần đầy đủ hơn thì `tabTitle`
- [ ] Không tự đệm lề, không thẻ HTML thô, không gọi API trong trang
- [ ] Link là `<Link>` thật; trang tĩnh `PATHS.X`, trong phân hệ path tương đối

**Thêm / sửa phân hệ**

- [ ] `id` kebab-case = folder feature; `path` tuyệt đối, tĩnh; path con tương đối
- [ ] Có trang index (hoặc `landingPath` + trang index chuyển hướng)
- [ ] `meta.icon` (`-outline`) có sẵn; `order` nếu cần thứ tự
- [ ] Quyền: BE cấp `<id>:view` (hoặc khai `permission`); route con chỉ khai quyền THÊM
- [ ] Đã thêm vào `MODULE_REGISTRY`; `validateModules` không ném; `npm run dev` thấy ở Dock, Ctrl/⌘+K, tên tab đúng
- [ ] Test mount route + test quyền (§13)

**Thêm / sửa guard, layout, bootstrap**

- [ ] Điều hướng về `/login` chỉ ở `AuthGuard`; sau đăng nhập chỉ ở `GuestGuard`
- [ ] Bước bootstrap mới có hàm dừng → đã đẩy vào `cleanups`; state theo tài khoản đã xoá trong `resetAccountScopedState`
- [ ] Vùng cuộn mới sống qua nhiều route → `useRouteScrollRestoration` với `scope` riêng
- [ ] `npm run check` xanh (`quality-gates.md`)

**Lỗi thường gặp**

| Triệu chứng | Nguyên nhân | Sửa |
|---|---|---|
| ESLint: "`@/app/router` export `appRoutes`… import vòng"; `check:cycles` đỏ; lúc chạy một hằng là `undefined` / `Cannot access … before initialization` | Trang / shell / layout import barrel `@/app/router` | Import thư mục con: `@/app/router/modules`, `@/app/router/menu`… |
| Mở `/reports` ra 404, Dock không có mục; knip báo file `*.routes.ts` không ai dùng | Tạo `<id>.routes.ts` mà quên thêm vào `MODULE_REGISTRY` | Thêm một dòng vào mảng (§5.4 bước 4) |
| Dev: trang trắng + `[module-registry] Khai báo phân hệ không hợp lệ` | `validateModules`: trùng id / path (kể cả trùng `PATHS` của trang tĩnh), path con có `/` đầu, thiếu trang index, `landingPath` sai, quyền thừa, `defaultTab` lạ | Đọc từng gạch trong thông báo — nó chỉ đúng route; đổi path phân hệ khỏi path của trang tĩnh |
| `app-routes.test.tsx` đỏ "Không route nào mount" / "mỗi entry dùng một path của `PATHS`" | Thêm `PATHS.X` mà chưa có entry, hoặc entry dùng path không có trong `PATHS`, hoặc nhóm trang tĩnh mới chưa vào `STATIC_PAGES` của test | Khai đủ hai phía (§5.1, §5.3) |
| Chạy demo thấy phân hệ, bản thật biến mất khỏi Dock / bấm vào ra 403 | Demo mở mọi quyền; bản thật người dùng thiếu `<id>:view` hoặc quyền THÊM của trang mở đầu | Xem "Quyền chi tiết" ở `/profile`; nhờ BE cấp quyền, hoặc sửa `permission` / `landingPath` |
| Effect / lời gọi API chạy hai lần lúc dev | `StrictMode` (dev) mount → unmount → mount để lộ effect thiếu dọn | Effect trả hàm dọn; lấy dữ liệu bằng React Query; hàm khởi tạo idempotent. KHÔNG bỏ `StrictMode`, không chặn bằng cờ `useRef` |
| Sang trang mới vẫn đứng giữa trang | Vùng cuộn mới sống qua các route mà không gắn `useRouteScrollRestoration` (hoặc chỉ đổi `?search` — cố ý giữ vị trí) | Gắn hook với `scope` riêng (§8) |
| Chuyển `/a` ↔ `/a/:id` dựng lại cả màn (mất state, viewer tải lại) | Gọi `lazyPage()` hai lần cho cùng file | Khai một hằng `lazyPage(…)` dùng cho cả hai route |
| Một trang lỗi rồi trang nào cũng lỗi | Tự bọc `ErrorBoundary` quanh `<Outlet />` mà không `resetKey` | Để `LazyLoad` lo; tự bọc thì `resetKey={pathname}` |
| ESLint `guard/login-redirect` | `navigate(PATHS.LOGIN)` sau `logout()` | Chỉ `void logout()` — `AuthGuard` tự đưa về |
| ESLint `guard/ui-kit-elements` | `<button>` / `<input>` / `<table>` / `<svg>` thô trong `src/app` / feature | Component của `@/shared/ui` (`reuse-first.md`) |
| ESLint `guard/spacing` | Trang tự đệm (`p-6`, `p-[18px]`, `PageShell className="p-2"`) | Bỏ — lề do `AppShellLayout` cấp (`spacing-system.md`) |
| ESLint `guard/store-write` | `useSessionStore.setState(…)` trong app / feature | Hàm của domain: `establishSession`, `logout`, `restoreSession` |
| ESLint "Tầng `features` không được import `app`" | Trang feature import `getRoutePath` (hay thứ khác dưới `@/app`) | Path tương đối, hoặc hằng path trong feature + test đối chiếu (§5.6); `PATHS` thì import được (`shared`) |
| `PageHeader` không hiện gì | Trang nằm ngoài `AppShellLayout` (trang khách, dự phòng) — không có `HeaderSlotsProvider` | Dùng `TitleScreen` / khung của nhóm đó |
| Trang tĩnh mới không có trong Ctrl/⌘+K | Thiếu `meta.icon` (hoặc `hideInMenu`) | Thêm `icon` + sửa kỳ vọng test menu |
| Commit bị chặn ở `pre-commit` (`scripts/verify-commit.mjs`) dù dev chạy được | Bản STAGE không build được: lỗi kiểu, import vòng, build chế độ app (như CI `build-app`) đỏ, quên `git add` file mới | Sửa đúng bước đỏ trong log; `--no-verify` chỉ khi khẩn cấp — CI vẫn chặn |

## 15. Liên kết

- Luật route, quyền, `meta`, `lazyPage`, `validateModules`: [`routing-conventions.md`](../rules/structure/routing-conventions.md)
- Trang, layout, shell, provider: [`page-structure.md`](../rules/structure/page-structure.md) · cây feature:
  [`feature-structure.md`](../rules/structure/feature-structure.md)
- Link và điều hướng: [`navigable-controls.md`](../rules/interaction/navigable-controls.md) · lọc / tab trên URL:
  [`api-patterns.md`](../rules/data/api-patterns.md)
- Chế độ TV: [`tv-display-mode.md`](../rules/display/tv-display-mode.md) · khoảng cách:
  [`spacing-system.md`](../rules/styling/spacing-system.md) · CSS thuần:
  [`css-architecture.md`](../rules/styling/css-architecture.md)
- Folder, tên file, giới hạn: [`folder-structure.md`](../rules/foundations/folder-structure.md) · test:
  [`testing.md`](../rules/foundations/testing.md) · cổng kiểm: [`quality-gates.md`](../rules/foundations/quality-gates.md)
- Vì sao của từng file trong `src/app`: [`notes/code/app.md`](../notes/code/app.md) · trang xác thực:
  [`notes/code/auth.md`](../notes/code/auth.md) · phiên: [`notes/code/domains.md`](../notes/code/domains.md)
- Quyết định kiến trúc (tầng, phiên, demo / app): [`architecture.md`](../architecture.md) · việc còn treo:
  [`known-issues.md`](../known-issues.md) · mục lục: [`README.md`](../README.md)

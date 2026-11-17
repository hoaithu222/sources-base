# Hướng dẫn tầng ứng dụng — `src/app` từ lúc khởi động tới khi thêm phân hệ

> Đọc xong là tự làm được những việc thường gặp ở `src/app`: thêm trang, thêm phân hệ, phân quyền, đổi khung,
> gắn thêm thứ vào Header, viết test. Mọi tên file / hàm / prop dưới đây là code THẬT (ví dụ phân hệ `report` / trang
> `notifications` là mẫu minh hoạ — chép rồi đổi tên); thấy lệch thì code là nguồn thật — sửa file này trong cùng PR
> (`documentation-management.md §3`).
> File này là HƯỚNG DẪN, không đặt luật: luật nằm ở rule được trỏ tới (chủ yếu
> [`routing-conventions.md`](../rules/structure/routing-conventions.md),
> [`page-structure.md`](../rules/structure/page-structure.md) và
> [`server-client-boundary.md`](../rules/structure/server-client-boundary.md)); lý do thiết kế từng file:
> [`notes/code/app.md`](../notes/code/app.md). Quyết định kiến trúc của bản Next: [`architecture.md`](../architecture.md).
> Thêm ngôn ngữ / chuỗi dịch: [`i18n.md`](i18n.md) · SEO từng trang: [`seo.md`](seo.md).

**Mục lục**

1. Tầng app là gì
2. Bản đồ thư mục `src/app`
3. Luồng khởi động
4. Cây route
5. Hướng dẫn từng bước (trang tĩnh · trang khách · trang công khai · phân hệ · trang con · tham số động · quyền · cờ · trang mở đầu)
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
**không tầng nào được import nó**. App là tầng LẮP RÁP: nối các tầng dưới với nhau, đặt route, dựng khung; nó không chứa nghiệp vụ.
Thư mục `src/app/` của Next gồm HAI loại, tách bằng dấu gạch dưới: **route** (`[locale]/…`, `robots.ts`, `sitemap.ts`… — `page.tsx` /
`layout.tsx` MỎNG) và **lắp ráp** (`_providers _layouts _shell _views _navigation _guards _components _seo` — Next bỏ qua khi định tuyến).

| App LÀM | App KHÔNG làm → đặt ở |
|---|---|
| Khởi động: nối `core/http` với phiên đăng nhập (`bootstrapApp`) | Gọi API, logic của một nghiệp vụ → `src/features/<id>/` |
| Đặt route (thư mục), gate, layout; `generateMetadata` | Component giao diện dùng lại → UI kit `src/shared/ui` / widget `src/shared/widgets` |
| Nối widget thuần (Header, Dock, bảng lệnh) với store và cấu hình điều hướng (`src/app/_shell`) | Dữ liệu dùng chung nhiều feature → `src/domains/` |
| View chung không thuộc phân hệ: chủ, bảng điều khiển, hồ sơ, cài đặt, 403 / 404 | View nghiệp vụ → `src/features/<id>/views/` |
| Provider toàn cục, phần tử gắn một lần (toast, thẻ tiến trình) | Store / hook dùng lại → `src/domains/` hoặc `src/shared/hooks` |

Ranh giới import mà ESLint giữ cho vùng này (bảng vùng ở `scripts/eslint/architecture.mjs`, tóm tắt ở `quality-gates.md §3`):

- Feature / domain / shared / core **không** import `@/app/...` — hệ quả: view của feature không biết path của `app`; link dùng `PATHS`
  (`@/shared/constants/paths.constants`) hoặc hằng path đặt trong feature (cách làm: §5.6).
- Trong `src/app`: thư mục có barrel (`_navigation`, `_shell`, `_providers`, `_guards`, `_components`) import qua `index.ts`
  (`@/app/_navigation`), không với vào file bên trong; `_layouts`, `_views`, `_seo` không barrel nên import thẳng file. Ngoại lệ có lý do:
  `@/app/_navigation/public-routes` (dữ liệu thuần — `robots.ts` / `sitemap.ts` nạp mà không kéo hook client).
- Tầng dưới qua public API: `@/domains/session`, `@/domains/preferences`, `@/features/<id>` (view), `@/shared/ui`, `@/shared/hooks`,
  `@/shared/widgets/<widget>`, `@/core/config`, `@/core/i18n`.
- `Link` / `useRouter` / `usePathname` lấy từ `@/core/i18n` (tự thêm tiền tố ngôn ngữ), không phải `next/link` / `next/navigation`.

## 2. Bản đồ thư mục `src/app`

```
src/proxy.ts                         cổng chặn trước route: chưa có cookie phiên → /login?next=…, rồi định tuyến ngôn ngữ (next-intl)
src/app/
├── [locale]/                        ROUTE — segment gốc `vi` (không tiền tố) · `en`
│   ├── layout.tsx                   root layout: <html lang>, font, script giao diện, NextIntlClientProvider, BaseProviders
│   ├── error.tsx · not-found.tsx · opengraph-image.tsx · 403/page.tsx · [...rest]/page.tsx (→ notFound())
│   ├── (public)/                    marketing, SSG, ít JS: layout (header + main + footer) · page.tsx (/) · about/page.tsx
│   └── (workspace)/                 layout.tsx = AppProviders
│       ├── (auth)/                  GuestGate + AuthLayout · login · register · forgot-password · reset-password
│       └── (app)/                   AuthGate + AppShellLayout · layout · loading · error · dashboard · profile · settings · demo
├── global-error.tsx · global-not-found.tsx · manifest.ts · robots.ts · sitemap.ts · api/health/route.ts
├── _components/                     màn dùng chung — import qua `@/app/_components`
│   ├── ErrorScreen.tsx · LoadingScreen.tsx · RouteErrorScreen.tsx   màn lỗi / chờ; `RouteErrorScreen` là thân của mọi `error.tsx`
│   ├── LocaleSwitcher.tsx           chuyển ngôn ngữ (`<Link locale>` thật)
│   ├── chunk-reload.utils.ts        reloadOnceOnChunkError: lỗi tải chunk → tự tải lại MỘT lần
│   ├── describe-error.ts            describeError · isChunkLoadError · logAppError (tiền tố `[giao diện]`)
│   ├── screen.types.ts              ScreenLevel = 'app' | 'content'
│   └── index.ts
├── _guards/                         AuthGate · GuestGate · PermissionGate · useSessionGate — import qua `@/app/_guards`
├── _layouts/                        khung quanh `children` — import thẳng file
│   ├── AppShellLayout.tsx · app-shell-layout.css   khung ứng dụng: Header + <main> cuộn + Dock + bảng lệnh (client)
│   ├── AuthLayout.tsx · auth-layout.css · auth/    thẻ hai khoang (thương hiệu | form) của trang khách
│   ├── public/                      PublicHeader · PublicFooter · PublicThemeButton — khung trang công khai
│   └── useRouteScrollRestoration.ts · useDockOverlap.ts   cuộn theo route · chừa chỗ cho Dock
├── _navigation/                     CẤU HÌNH điều hướng — import qua `@/app/_navigation`
│   ├── navigation.config.ts         NAV_PAGES · NAV_MODULES — nơi khai DUY NHẤT của menu
│   ├── navigation.types.ts          NavPageDef · NavModuleDef · NavScreenDef · MenuItem · ModuleNavLink
│   ├── build-menu.utils.ts          buildMenu (THUẦN): cấu hình + nhãn + người dùng → menu đã dịch + lọc quyền
│   ├── useAppMenu.ts · useActiveModule.ts · useScreenTitle.ts · screen-title.utils.ts
│   ├── DisplayUrlSync.tsx           `?display=tv&scale=1.2` ↔ display store
│   └── public-routes.ts             PUBLIC_ROUTES (sitemap) · PRIVATE_PATHS (robots)
├── _providers/                      import qua `@/app/_providers`
│   ├── BaseProviders.tsx            StoreHydration + AppearanceSync — MỌI trang
│   ├── AppProviders.tsx             QueryClient + LocaleSync + SessionBootstrap + DisplayUrlSync + ChartScaleProvider + AppOverlays — chỉ `(workspace)`
│   ├── StoreHydration.tsx · SessionBootstrap.tsx · LocaleSync.tsx · AppOverlays.tsx
│   ├── bootstrap.ts                 bootstrapApp(): nối các tầng, trả disposer
│   ├── query-client.ts              getQueryClient(): server MỚI mỗi lần, trình duyệt singleton
│   └── appearance/                  appearance.utils (applyAppearance) · AppearanceSync
├── _seo/                            page-metadata.ts — generatePageMetadata (generateMetadata một dòng)
├── _shell/                          nối widget thuần với app — import qua `@/app/_shell`
│   ├── AppHeader.tsx · useHeaderModules.ts   Header + phiên + theme + phân hệ ← useActiveModule()
│   ├── AppDock.tsx · AppCommandPalette.tsx   Dock · CommandPalette ← useAppMenu()
│   ├── AppPhoneTopBar.tsx · AppTabBar.tsx    dạng điện thoại của Header / Dock
│   ├── AppWorkTabs.tsx              thanh dọc lịch sử thẻ làm việc
│   └── useShellAccount.ts           danh tính, theme, TV, xử lý menu tài khoản — chung AppHeader / AppPhoneTopBar
└── _views/                          view của trang chung — import thẳng file
    ├── LandingView · AboutView      trang công khai (server)
    ├── DashboardView · ProfileView · SettingsView (+ settings/) · ModuleHomeView
    ├── status/                      StatusView (khung toàn màn) · ForbiddenView · NotFoundView · SessionUnavailableView
    └── demo/DemoLibraryView.tsx     catalog component (+ catalog/: mục lục, mỗi nhóm một ví dụ sống), chỉ chế độ demo
```

**Thứ mới đặt ở đâu:**

| Cần thêm | Đặt ở |
|---|---|
| Trang chung không thuộc phân hệ (sau đăng nhập) | `(workspace)/(app)/<path>/page.tsx` mỏng + view `_views/` + `PATHS` + `PROTECTED_PATH_PREFIXES` (+ `NAV_PAGES`) — §5.1 |
| Trang khách | `(workspace)/(auth)/<path>/page.tsx` + `GUEST_ONLY_PATHS` — §5.2 |
| Trang công khai cho công cụ tìm kiếm | `(public)/<path>/page.tsx` + `PUBLIC_ROUTES` — §5.3 |
| Trang nghiệp vụ / phân hệ | view ở `src/features/<id>/views/` + thư mục route `(app)/<path>/` + `NAV_MODULES` — §5.4 |
| Trang trạng thái toàn màn (lỗi, bảo trì) | `_views/status/`, dựng bằng `StatusView` |
| Bước khởi tạo phía trình duyệt | `bootstrapApp()` (§3) |
| Provider chỉ vùng làm việc cần | `AppProviders`; phần tử gắn một lần không phụ thuộc route → `AppOverlays`; thứ MỌI trang cần (hiếm) → `BaseProviders` |
| Lớp bọc nghiệp vụ toàn vùng làm việc (stream thông báo…) | quanh `children` trong `AppProviders` hoặc `(app)/layout.tsx` |
| Nút toàn cục trên Header, mục menu tài khoản, lệnh bảng lệnh | `src/app/_shell/` (§11) |
| Layout cho một nhóm trang mới | `src/app/_layouts/` + `layout.tsx` của nhóm route mới (§12) |

Mỗi folder ≤ 8 mục (`folder-structure.md §1`). Quá 8 thì gom theo `folder-structure.md §2` — chưa có quy ước sẵn cho các thư mục
`_xxx`, thống nhất với chủ repo trước.

## 3. Luồng khởi động

Không còn `index.html` / `main.tsx` / `App.tsx`: Next dựng HTML ở server (SSG), trình duyệt hydrate rồi các provider chạy.

```
[locale]/layout.tsx  (Server)                                   <html lang> + font CSS variables + `suppressHydrationWarning`
  <head><script>appearanceInitScript()</script></head>          áp theme / TV / màu nhấn / cỡ chữ ĐÃ LƯU lên <html> TRƯỚC lần vẽ đầu
  <NextIntlClientProvider locale messages={pickClientMessages(messages)}>   chỉ CLIENT_NAMESPACES đi xuống trình duyệt
    <BaseProviders>                                             (client) mọi trang
      <StoreHydration />   rehydratePersistedStores() — useLayoutEffect, MỘT lần sau hydrate
      <AppearanceSync />   áp giao diện khi preferences đổi; đợi `usePersistedStoresHydrated()` mới ghi đè
      {children}
        ├── (public)/layout.tsx → PublicHeader + <main> + PublicFooter                    KHÔNG provider nặng
        └── (workspace)/layout.tsx → <AppProviders>
              <QueryClientProvider client={getQueryClient()}>
                <LocaleSync />          errors.http + locale Zod theo ngôn ngữ (layout effect)
                <SessionBootstrap />    bootstrapApp() (layout effect)
                <Suspense><DisplayUrlSync /></Suspense>   `?display=` / `?scale=` — bọc Suspense vì đọc useSearchParams
                <ChartScaleProvider uiScale={…}>{children}</ChartScaleProvider>
                <AppOverlays />         ToastContainer + ProgressCenter — sống qua mọi route
                  ├── (auth)/layout.tsx → GuestGate → AuthLayout → page
                  └── (app)/layout.tsx  → AuthGate → AppShellLayout → page
```

**Vì sao `StoreHydration` chạy trước mọi effect khác:** mọi store `persist` bật `skipHydration: true` và đăng ký bằng `registerPersistedStore`
(`shared/utils/browser/storage.utils.ts`) — nạp localStorage ngay lúc tạo store làm lần render đầu khác HTML server (lỗi hydration). `StoreHydration`
là anh em đứng TRƯỚC `{children}` trong `BaseProviders`, nên layout effect của nó chạy trước mọi effect của cây con: guard và widget thấy state thật
ngay lần effect đầu. Giao diện thì không chờ bước này — script trong `<head>` đã áp nó trước lần vẽ đầu (không nháy sáng → tối).

**`bootstrapApp({ queryClient, onSessionExpired })` — từng bước** (`_providers/bootstrap.ts`; `SessionBootstrap` gọi trong `useLayoutEffect` để
API đầu tiên của cây con — khôi phục phiên — đã có token adapter):

| # | Bước | Để làm gì |
|---|---|---|
| 1 | `configureHttp({ auth: { getAccessToken, refreshAccessToken } })` | `core/http` gắn token và tự làm mới khi 401 mà không cần biết store phiên nằm đâu |
| 2 | `onSessionEnd(…)` → `queryClient.clear()` + `resetProgressCenter()` | Phiên kết thúc hoặc đổi tài khoản: dọn cache + hàng đợi tải lên + thẻ tác vụ; lý do `expired` thêm toast cảnh báo (`onSessionExpired`) |
| 3 | `startSessionSync()` | Đồng bộ đăng nhập / đăng xuất giữa các tab |

- **Đã chuyển đi chỗ khác so với bản Vite:** locale Zod + thông điệp lỗi HTTP theo ngôn ngữ → `LocaleSync`; áp giao diện → script `<head>` + `AppearanceSync`.
- **Disposer.** `bootstrapApp()` trả hàm dừng: gỡ listener (bước 2, 3) theo thứ tự ngược và gỡ cấu hình HTTP (`configureHttp({})`). Gọi trùng
  trả CÙNG hàm (idempotent). `SessionBootstrap` trả nó làm cleanup của `useLayoutEffect`; test phải gọi sau mỗi lượt.
- **Một bước ném lỗi** → listener đã đăng ký được dọn, cấu hình HTTP được gỡ, lỗi ném tiếp lên → `error.tsx` gần nhất bắt (`RouteErrorScreen`).

**Thêm một bước khởi tạo** (vd mở luồng thông báo): hàm của tầng dưới trả hàm dừng thì đẩy vào `cleanups`, không trả thì chỉ gọi. Tầng dưới cần hành vi của
tầng trên thì nhận qua THAM SỐ ở đây, không import ngược:

```ts
try {
  configureHttp({ auth: { getAccessToken, refreshAccessToken } });
  cleanups.push(onSessionEnd((reason) => { /* … */ }));
  cleanups.push(startSessionSync());
  cleanups.push(startNotificationStream());   // ← bước mới
} catch (error) {
  cleanups.reverse().forEach((cleanup) => cleanup());
  configureHttp({});
  throw error;
}
```

**State gắn với tài khoản** (cache, hàng đợi, store giữ dữ liệu của người đang đăng nhập) phải được xoá trong callback `onSessionEnd` — không thì
người đăng nhập sau thấy dữ liệu người trước. Đừng tự nghe `logout()` ở nơi khác: `onSessionEnd` là nguồn duy nhất, kể cả khi đổi tài khoản (`switched`).

**Thêm provider:** chỉ vùng làm việc cần → bọc trong `AppProviders` (dưới `QueryClientProvider` nếu cần query). Phần tử gắn một lần không phụ thuộc route (lớp
nổi, toast kiểu mới) → `AppOverlays`. Thứ MỌI trang cần (hiếm; marketing sẽ tải nó) → `BaseProviders`. Provider là Client Component nhận `children`, đặt SÂU nhất có thể
(`server-client-boundary.md §6`). `getQueryClient()` — server tạo client MỚI mỗi lần gọi (không rò dữ liệu giữa người dùng), trình duyệt dùng MỘT client duy nhất.

## 4. Cây route

```
src/app/[locale]/
├── layout.tsx                         root: <html>, BaseProviders · generateStaticParams (vi, en) · generateMetadata (buildRootMetadata)
├── (public)/        layout: PublicHeader + main + PublicFooter, TÀI LIỆU CUỘN TỰ NHIÊN    / · /about   (SSG, sitemap)
└── (workspace)/     layout: AppProviders
    ├── (auth)/      layout: GuestGate → AuthLayout, noindex                                /login · /register · /forgot-password · /reset-password
    └── (app)/       layout: AuthGate → AppShellLayout (khoá viewport), noindex             /dashboard · /profile · /settings · /demo
                     loading.tsx (LoadingScreen content) · error.tsx (RouteErrorScreen content)
error.tsx (level app) · not-found.tsx · 403/page.tsx (ngoài mọi guard) · [...rest]/page.tsx → notFound()
```

Mỗi `page.tsx` là **Server Component mỏng**: `generateMetadata` + ghép MỘT view (`_views/…` hoặc `@/features/<id>`). `proxy.ts` chặn sớm; gate ở layout nhóm
lo phần proxy không biết. ⛔ Không kiểm phiên bằng `cookies()` / `headers()` trong layout / page — route thành động (`ƒ`), mất SSG.

### 4.1 Ba nơi khai — route, path, menu

| Khai ở | Cho | Ghi chú |
|---|---|---|
| Thư mục `src/app/[locale]/…/<path>/page.tsx` | URL có tồn tại không, nằm sau gate / layout nào | nhóm `(public)` · `(auth)` · `(app)` quyết định layout + gate |
| `PATHS` · `GUEST_ONLY_PATHS` · `PROTECTED_PATH_PREFIXES` (`src/shared/constants/paths.constants.ts`) | Hằng path (KHÔNG tiền tố ngôn ngữ) + chính sách truy cập cho `proxy.ts`, sitemap, robots | feature import được (`shared`) |
| `NAV_PAGES` · `NAV_MODULES` (`_navigation/navigation.config.ts`) | Mục menu: trang có icon, phân hệ, màn hình, quyền | chỉ MÔ TẢ; không sinh route / guard |
| `PUBLIC_ROUTES` (`_navigation/public-routes.ts`) | Trang vào `sitemap.xml` | trang công khai cho SEO |

Từ cấu hình điều hướng dựng ra Dock, bộ chọn phân hệ + dải điều hướng trên header, bảng lệnh, tab bar điện thoại, tên màn cho thẻ làm việc (§6). Chữ của mỗi mục
ở `messages/<locale>/shell.json` → `nav.<id>`. Tên tab trình duyệt do `generateMetadata` của từng `page.tsx`.

### 4.2 Kiểu khai báo — `navigation.types.ts`

```ts
interface NavPageDef   { id; path; icon?; hideInMenu?; permission?; order? }           // trang tĩnh ngoài phân hệ
interface NavScreenDef { id; path; icon?; hideInNav?; permission? }                    // màn hình của phân hệ
interface NavModuleDef { id; path; icon; tone?; permission?; order?; screens }         // phân hệ
```

`id` là khoá `nav.<id>` ở `shell.json` (`NavId = keyof Messages['shell']['nav']`) — thiếu khoá là `tsc` đỏ ở cả hai ngôn ngữ; ba loại dùng CHUNG không gian id.
Từng field + lỗi hay gặp: `routing-conventions.md §6`.

### 4.3 Từ cấu hình tới menu — `buildMenu`

`buildMenu(NAV_PAGES, NAV_MODULES, labelOf, user)` (`_navigation/build-menu.utils.ts`, hàm THUẦN) → `{ pages: MenuItem[], modules: MenuItem[] }`: sắp theo `order`,
dịch chữ qua `labelOf`, gộp `permissions` (quyền phân hệ + quyền màn hình), lọc bằng `canAccess`, dựng `MenuItem.nav` từ `screens` (bỏ `hideInNav`). `useAppMenu()` chỉ nối nó
với `useTranslations('shell.nav')` + người dùng hiện tại. Hàm thuần nên test được không cần React (§13).

### 4.4 Tải, lỗi, 404

Next tách mã theo route, không còn `lazyPage` / `LazyLoad` / `preload`. `loading.tsx` / `error.tsx` / `not-found.tsx` / `global-error.tsx` thay `Suspense` + `ErrorBoundary` của bản Vite — §9.

### 4.5 Ngôn ngữ trong route

`requireLocale((await params).locale)` (`@/core/i18n/server`) ở `generateMetadata` / `page.tsx` cần ngôn ngữ; chữ dịch trong Server Component dùng `useTranslations` (hoặc
`getTranslations({ locale, namespace })` trong hàm async). KHÔNG `setRequestLocale` — ngôn ngữ đọc từ tham số gốc của route bằng `next/root-params` (`core/i18n/request.ts`) nên route vẫn SSG.
Chi tiết: `i18n.md`.

## 5. Hướng dẫn từng bước

### 5.1 Thêm trang tĩnh sau đăng nhập (vd `/notifications`)

**Bước 1 — path.** `src/shared/constants/paths.constants.ts`:

```ts
export const PATHS = {
  // …
  NOTIFICATIONS: '/notifications',
} as const;

export const PROTECTED_PATH_PREFIXES: readonly string[] = [
  // …
  PATHS.NOTIFICATIONS,
];
```

Thêm vào `PROTECTED_PATH_PREFIXES` để `proxy.ts` chặn người chưa có cookie phiên (`PRIVATE_PATHS` của robots đọc từ đó nên tự có).

**Bước 2 — chữ.** `messages/{vi,en}/metadata.json` thêm khoá `notifications` (`title`, `description` — `PageMetadataKey` suy từ file này nên thiếu một ngôn ngữ là `tsc` đỏ); `messages/{vi,en}/notifications.json`
cho chữ của view (đăng ký trong `messages/{vi,en}/index.ts`, và thêm `'notifications'` vào `CLIENT_NAMESPACES` ở `core/i18n/messages.ts` nếu view là Client Component — `i18n.md`).

**Bước 3 — view** `src/app/_views/NotificationsView.tsx` (ghép theo `page-structure.md`; chọn component bằng `reuse-first.md`):

```tsx
import { useTranslations } from 'next-intl';

import { EmptyState, PageBody, PageShell, TitleScreen } from '@/shared/ui';

/**
 * NotificationsView — danh sách thông báo của người dùng (`/notifications`); hiện trạng thái rỗng cho tới khi có API.
 */
export default function NotificationsView() {
  const t = useTranslations('notifications');

  return (
    <PageShell>
      <TitleScreen icon="bell-bold" iconColor="sky" subtitle="NOTIFICATIONS" title={t('title')} />
      <PageBody overflow="scroll">
        <EmptyState
          description={t('empty.description')}
          icon="bell-bold"
          iconColor="sky"
          title={t('empty.title')}
        />
      </PageBody>
    </PageShell>
  );
}
```

View này KHÔNG `'use client'`: chỉ `useTranslations` + component trình bày. Thêm hook / state / handler thì đặt `'use client'` ở dòng đầu (`server-client-boundary.md §2`).

**Bước 4 — route** `src/app/[locale]/(workspace)/(app)/notifications/page.tsx` (cùng mẫu `dashboard/page.tsx`):

```tsx
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import NotificationsView from '@/app/_views/NotificationsView';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/notifications'>) =>
  generatePageMetadata({ params, key: 'notifications', path: PATHS.NOTIFICATIONS });

export default function NotificationsPage() {
  return <NotificationsView />;
}
```

`generatePageMetadata` mặc định `noindex`; route nằm dưới `(app)` nên `layout.tsx` đã `noindex` cả nhóm. Kiểu `PageProps<'/[locale]/notifications'>` do `next typegen` sinh (`npm run typecheck`).

**Bước 5 — menu (tuỳ chọn).** Muốn có ở bảng lệnh / tab bar: `NAV_PAGES` thêm `{ id: 'notifications', path: PATHS.NOTIFICATIONS, icon: 'bell-outline', order: 3 }` và `nav.notifications.title` ở `shell.json` cả hai ngôn ngữ. Trang cần quyền:
`permission: { resource: 'notification' }` ở đó VÀ bọc view bằng `PermissionGate` ở `page.tsx` (§5.7). Chỉ cần liên kết từ trang khác thì bỏ qua bước này.

**Bước 6 — kiểm.** `npm run dev` mở `/notifications` và `/en/notifications`; `npm run build` đọc bảng `Route (app)` — trang phải là `●` (SSG).

### 5.2 Thêm trang khách — chưa đăng nhập (vd kích hoạt tài khoản `/activate`)

Như §5.1 nhưng: route đặt dưới `(workspace)/(auth)/activate/page.tsx` (layout nhóm có sẵn `GuestGate` + `AuthLayout` + `noindex`); path thêm vào `GUEST_ONLY_PATHS` (KHÔNG vào
`PROTECTED_PATH_PREFIXES`); không khai `NAV_PAGES`. Dựng view bằng `AuthPageFrame` của feature `auth` làm mẫu (`src/features/auth/views/LoginView.tsx`): khung chung, form `useZodForm`, lỗi `Callout`,
KHÔNG tự điều hướng sau khi xong — `GuestGate` đưa người đã có phiên đi (§7). Trang đọc `?token=` thì `page.tsx` bọc `<Suspense>` (mẫu: `reset-password/page.tsx`):

```tsx
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordView />
    </Suspense>
  );
}
```

### 5.3 Trang công khai (SEO) và trang trạng thái

**Trang công khai cho công cụ tìm kiếm** (`/pricing`): `PATHS.PRICING`; thư mục `(public)/pricing/page.tsx` — Server Component, `generateMetadata` bằng `buildPageMetadata` (canonical + hreflang + OG), JSON-LD nếu
cần (mẫu: `(public)/about/page.tsx`); view tĩnh ở `_views/PricingView.tsx` KHÔNG `'use client'`; thêm `{ path: PATHS.PRICING, changeFrequency, priority }` vào `PUBLIC_ROUTES`
(sitemap tự có bản dịch + hreflang). KHÔNG đưa vào `PROTECTED_PATH_PREFIXES` / `GUEST_ONLY_PATHS`. Hướng dẫn đủ (metadata, JSON-LD, OG, sitemap, kiểm bằng build): [`seo.md`](seo.md).

**Trang trạng thái toàn màn** (bảo trì, mất kết nối): `_views/status/<Tên>View.tsx` dựng bằng `StatusView` (chữ từ `errors.screens.*`); route đứng riêng ngoài mọi guard như `[locale]/403/page.tsx`
(`generatePageMetadata` với `noIndex` mặc định). `PermissionGate` hiện `ForbiddenView` TẠI CHỖ (giữ URL); `/403` là trang đứng riêng cho đường dẫn trực tiếp.

**404:** `notFound()` ở page, hoặc URL không khớp route nào → `[...rest]/page.tsx` → `[locale]/not-found.tsx` (`NotFoundView`, Next tự trả HTTP 404 + `noindex`); URL ngoài `[locale]` (đuôi file) → `global-not-found.tsx`.

### 5.4 Thêm phân hệ mới từ đầu

Quy trình rút gọn có ở skill `new-feature`; dưới đây là bản đầy đủ có mẫu.

**Bước 0 — chốt ba thứ:** `id` kebab-case cho folder feature và thư mục route (`report`), `path` tuyệt đối (`/reports`), quyền BE cấp cho người được vào (chuỗi `report:view` trong `user.permissions`).

**Bước 1 — folder feature** theo cây ở `feature-structure.md` (nguồn duy nhất). Ban đầu chỉ cần `views/` + `index.ts` (export view); thêm `api/ service/ schemas/ components/ hooks/` khi có file thật.

**Bước 2 — view đầu tiên** `src/features/report/views/ReportListView.tsx` (ghép theo `page-structure.md`; chọn component bằng `reuse-first.md`). Có hook / quyền nên là Client Component:

```tsx
'use client';

import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n';
import { usePermission } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';
import { Button, EmptyState, PageBody, PageShell, TitleScreen } from '@/shared/ui';

/**
 * ReportListView — trang mở đầu của phân hệ Báo cáo (`/reports`); nút "Tạo báo cáo" chỉ hiện khi có quyền
 * `report:create` (route `create` cũng tự chặn bằng `PermissionGate`).
 */
export default function ReportListView() {
  const t = useTranslations('report.list');
  const canCreate = usePermission({ resource: 'report', action: 'create' });

  return (
    <PageShell>
      <TitleScreen
        icon="chart-line-bold"
        iconColor="sky"
        right={
          canCreate && (
            <Button asChild size="sm">
              <Link href={PATHS.REPORT_CREATE}>{t('create')}</Link>
            </Button>
          )
        }
        subtitle="REPORTS"
        title={t('title')}
      />
      <PageBody overflow="scroll">
        <EmptyState
          description={t('empty.description')}
          icon="chart-line-bold"
          iconColor="sky"
          title={t('empty.title')}
        />
      </PageBody>
    </PageShell>
  );
}
```

`src/features/report/index.ts` export view cho `page.tsx` (`export { default as ReportListView } from './views/ReportListView';`).

**Bước 3 — path + route.** `PATHS.REPORTS = '/reports'`, `PATHS.REPORT_CREATE = '/reports/create'`; chỉ `PATHS.REPORTS` cần vào `PROTECTED_PATH_PREFIXES` (khớp path và mọi route con). Thư mục:

```
src/app/[locale]/(workspace)/(app)/reports/
├── layout.tsx          PermissionGate quyền phân hệ → mọi màn con
├── page.tsx            trang mở đầu (/reports)
├── create/page.tsx     /reports/create — thêm quyền report:create
└── [id]/page.tsx       /reports/<id>  — await params
```

```tsx
// reports/layout.tsx
import type { ReactNode } from 'react';

import { PermissionGate } from '@/app/_guards';

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission={{ resource: 'report' }}>{children}</PermissionGate>;
}
```

```tsx
// reports/page.tsx
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { ReportListView } from '@/features/report';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/reports'>) =>
  generatePageMetadata({ params, key: 'report', path: PATHS.REPORTS });

export default function ReportsPage() {
  return <ReportListView />;
}
```

`metadata.report` / `metadata.reportCreate` / `metadata.reportDetail` thêm vào `messages/{vi,en}/metadata.json`.

**Bước 4 — khai menu** `src/app/_navigation/navigation.config.ts` (chép `demoModule`):

```ts
const reportModule: NavModuleDef = {
  id: 'report',
  path: PATHS.REPORTS,
  icon: 'analytics',        // AppIconName — ưu tiên icon VCI
  tone: 'blue',             // tông ô AppTile ở Dock / launcher / nút bộ chọn
  permission: { resource: 'report' },   // quyền phân hệ; bỏ trống = chỉ cần đăng nhập
  order: 10,
  screens: [
    { id: 'reportOverview', path: PATHS.REPORTS },    // màn ĐẦU = trang chủ phân hệ
    {
      id: 'reportCreate',
      path: PATHS.REPORT_CREATE,
      permission: { resource: 'report', action: 'create' },   // quyền THÊM VÀO
    },
  ],
};

export const NAV_MODULES: readonly NavModuleDef[] = [
  reportModule,
  ...(appConfig.isDemo ? [demoModule] : []),
];
```

`shell.json` (cả `vi` và `en`): `nav.report.{title, subtitle?}`, `nav.reportOverview.title`, `nav.reportCreate.title` (+ `description` nếu dùng `ModuleHomeView`). Chỉ sửa file này —
không đụng Dock, header, bảng lệnh, tab bar hay `useAppMenu`.

**Bước 5 — icon + tông.** `icon` (và `icon` của màn hình) là `AppIconName`: ưu tiên tên trong bộ icon VCI, ô `AppTile` tự vẽ bản `duo` + chấm vàng kim; dùng icon hệ thống thì chọn bản `-bold` (vẽ trắng trên
ô màu). `tone` là danh tính phân hệ — khác tông các phân hệ cùng nhóm, không mang nghĩa trạng thái (`light-theme.md` §6.4). Thiếu icon VCI → vẽ thêm theo `vci-icon-system.md` §6
(`npm run generate:vci-icons`); icon hệ thống mới → `icon-conventions.md`. thêm SVG rồi `npm run generate:icons`.

**Phân hệ nhiều màn hình:** `page.tsx` của gốc phân hệ render `ModuleHomeView` (thay `ReportListView`) — trang chủ tự dựng thẻ giới thiệu + lưới thẻ màn hình từ `screens` (icon + `nav.<id>.description`).
Header ở cấp 1 trên trang này, vào một màn hình là đổi sang cấp 2 (vệt ‹ · phân hệ › màn hình).

**Bước 6 — quyền.** Quyền khai ở HAI nơi (§5.7): `permission` trong cấu hình (ẩn menu) và `PermissionGate` ở route (chặn thật ở giao diện) — giữ khớp. Phân hệ nghiệp vụ PHẢI khai `permission`
(bỏ trống = ai đăng nhập cũng thấy mục).

**Bước 7 — chạy thật.** `npm run dev`, mở `/reports` (`/en/reports`): có mục Dock + launcher, header có dải `Tổng quan · Tạo báo cáo`, có trong Ctrl/⌘+K; F5 vẫn đứng đúng trang. ⚠️ Chế độ demo mở MỌI quyền —
muốn thấy gate / menu ẩn hiện thật thì chạy chế độ app (`NEXT_PUBLIC_APP_MODE=app` trong `.env.local`, cần backend) hoặc kiểm bằng test (§13).

**Bước 8 — test + `npm run check` + `npm run build`** (§13): bảng `Route (app)` không có `ƒ` mới (§14). `check:unused-files` (knip) báo file view chưa ai nạp — dấu hiệu quên `page.tsx`.

**Chưa có màn hình thật?** Đăng ký ngay với một view giữ chỗ (`EmptyState`) — route, Dock, quyền chạy được; có màn thật thì đổi view.

### 5.5 Thêm trang con, layout con, tab

**Trang con** — một thư mục con có `page.tsx` + khai thêm vào `screens` nếu muốn lên dải điều hướng:

```
reports/export/page.tsx     →  /reports/export        PermissionGate { resource: 'report', action: 'export' } ở page
```

```ts
{ id: 'reportExport', path: PATHS.REPORT_EXPORT, permission: { resource: 'report', action: 'export' } },
```

→ URL `/reports/export`, quyền `report:view` (từ layout) + `report:export`.

**Layout con** — nhóm màn chung một khung (vd `/reports/<id>` và `/reports/<id>/settings`): `reports/[id]/layout.tsx` (Server Component nhận `children`; không `<Outlet />`), màn con là
`page.tsx` / `settings/page.tsx`. Layout giữ nguyên khi đi giữa các màn con (state của nó không mất). Nếu cần `PageHeader` với tên bản ghi thì view client đặt ở trang
(layout server không đọc dữ liệu client):

```tsx
// reports/[id]/layout.tsx
import type { ReactNode } from 'react';

export default function ReportDetailLayout({ children }: { children: ReactNode }) {
  return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
}
```

Nó có vùng cuộn RIÊNG sống qua các màn con thì gắn `useRouteScrollRestoration` (§8).

**Tab trên URL (`?tab=`)** — tab là trạng thái của MỘT trang, không phải route riêng. Đọc / ghi bằng `useQueryParams()`, href thật bằng `useNavHref()` (giữ nguyên các param lọc khác),
hiện bằng `PageHeader nav` (≥ `xl` trên thanh header sau tên trang, < `xl` dải gạch chân trong trang). `useSearchParams` buộc `page.tsx` bọc `<Suspense>`:

```tsx
'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useNavHref, useQueryParams } from '@/shared/hooks';
import { PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

const REPORT_TABS = ['summary', 'detail'] as const;
const DEFAULT_TAB = 'summary';

/**
 * ReportListView — danh sách báo cáo, chia tab `?tab=summary | detail` (tab của trang qua `PageHeader nav`).
 */
export default function ReportListView() {
  const t = useTranslations('report.list');
  const { tab, setTab } = useQueryParams();
  const buildHref = useNavHref();

  const navItems = useMemo(
    () => REPORT_TABS.map((key) => ({ key, label: t(`tabs.${key}`), href: buildHref({ tab: key }) })),
    [buildHref, t],
  );

  return (
    <PageShell>
      <PageHeader
        nav={{ items: navItems, active: tab || DEFAULT_TAB, onSelect: setTab }}
        title={t('title')}
        tone="sky"
      />
    </PageShell>
  );
}
```

```tsx
// reports/page.tsx — bọc Suspense vì view đọc ?tab=
export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportListView />
    </Suspense>
  );
}
```

Tên tab trình duyệt KHÔNG theo `?tab=` nữa (bản Vite có `tabTitles`) — `generateMetadata` ở mức trang; cần tiêu đề theo tab thì đó là yêu cầu mới, bàn với chủ repo.

### 5.6 Route có tham số động (`[id]`) và dẫn link tới nó

**Khai:** thư mục `reports/[id]/page.tsx`. `params` là `Promise` — `await` ở `page.tsx` rồi truyền `id` xuống view làm prop (view client không đọc `params` của route):

```tsx
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import { ReportDetailView } from '@/features/report';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/reports/[id]'>) =>
  generatePageMetadata({ params, key: 'reportDetail', path: PATHS.REPORTS });

export default async function ReportDetailPage({ params }: PageProps<'/[locale]/reports/[id]'>) {
  const { id } = await params;

  return <ReportDetailView id={id} />;
}
```

Segment động không có `generateStaticParams` thì render theo yêu cầu (`ƒ` trong `Route (app)`) — chấp nhận ở vùng làm việc `noindex` có dữ liệu lấy ở client; trang CÔNG KHAI thì khai `generateStaticParams`
(`routing-conventions.md §11`). Hai segment động cùng cấp tên khác nhau (`[id]` vs `[slug]`) là lỗi build.

**Dẫn link — chọn theo nơi đặt link** (Next KHÔNG có đường dẫn tương đối theo cây route: `href="settings"` giải theo URL hiện tại như thẻ `<a>`):

| Link nằm ở | Viết | Ví dụ |
|---|---|---|
| Trang tĩnh | `PATHS.X` | `<Link href={PATHS.PROFILE}>` |
| Trong chính phân hệ (feature) | Hằng path của phân hệ (`PATHS.REPORTS`) + helper dựng path trong feature | `<Link href={reportDetailPath(row.id)}>` |
| Tầng `app` (trang chủ, shell) | `PATHS.X` / `menu.href` (đã dịch + lọc quyền) | `<Link href={item.href}>` |
| Feature KHÁC | Hằng `PATHS` (nằm ở `shared`, import được) — không import feature khác | — |

```ts
// src/features/report/utils/report-path.utils.ts
import { PATHS } from '@/shared/constants/paths.constants';

/** Đường dẫn chi tiết một báo cáo — dùng trong `<Link href>`; `id` được mã hoá để ký tự lạ không phá URL. */
export const reportDetailPath = (id: string): string =>
  `${PATHS.REPORTS}/${encodeURIComponent(id)}`;
```

Đi tới trang là `<Link href>` thật (`Link` của `@/core/i18n`), không `onClick={() => router.push(…)}` (`navigable-controls.md`). `router.push` chỉ dùng SAU một hành động,
vd tạo xong thì sang trang chi tiết: `` router.replace(reportDetailPath(created.id)) `` (`useRouter` của `@/core/i18n`).

### 5.7 Quyền — ở menu, ở route và trong component

| Muốn | Khai |
|---|---|
| Chỉ cần đăng nhập (hồ sơ, cài đặt) | bỏ trống `permission` |
| Vào phân hệ cần quyền | `NavModuleDef.permission: { resource: 'report' }` (action bỏ trống = `view`) **và** `PermissionGate` ở `layout.tsx` phân hệ |
| Một màn con cần THÊM quyền | `NavScreenDef.permission` **và** `PermissionGate` ở `page.tsx` của màn — cộng dồn, không "nới" được quyền phân hệ |
| Trang tĩnh cần quyền | `NavPageDef.permission` **và** `PermissionGate` ở `page.tsx` |
| Ẩn / khoá một nút, một khối | `usePermission({ resource, action })` trong component |
| Hành động mới (`'sign'`…) | thêm vào union `PermissionAction` ở `src/domains/session/model/permission.utils.ts` |

```tsx
const canExport = usePermission({ resource: 'report', action: 'export' });

return canExport ? <Button onClick={handleExport}>{t('export')}</Button> : null;
```

- Một luật cho cả ba nơi — menu, `PermissionGate`, `usePermission` — là `canAccess(user, permissions)` (`@/domains/session`): vai trò `admin` có mọi quyền; quyền lưu trong
  `user.permissions` dạng `"resource:action"`.
- **Cấu hình điều hướng chỉ ẩn / hiện mục menu; `PermissionGate` mới chặn trang.** Hai nơi phải khớp: lệch thì menu ẩn mà URL gõ tay vẫn vào được, hoặc menu hiện mà bấm ra 403.
- `PermissionGate` đặt BÊN TRONG `AuthGate` (không kiểm đăng nhập); thiếu quyền → `ForbiddenView` tại chỗ, giữ URL. Phản ứng NGAY khi quyền đổi.
- Chế độ demo (kiểm đăng nhập tắt): `canAccess` luôn `true` — nút ẩn theo quyền vẫn hiện.
- ⚠️ Chỉ điều khiển giao diện; quyền thật do BE kiểm trên từng API (`routing-conventions.md §5`).

### 5.8 Bật / tắt phân hệ theo cờ

`NAV_MODULES` là mảng tĩnh dựng một lần lúc nạp module — cờ phải biết được lúc nạp (biến môi trường), không phải dữ liệu tải từ BE.

```ts
export const NAV_MODULES: readonly NavModuleDef[] = [
  reportModule,
  ...(appConfig.reportEnabled ? [reportArchiveModule] : []),
  ...(appConfig.isDemo ? [demoModule] : []),
];
```

- Cờ mới: khai biến `NEXT_PUBLIC_*` theo hướng dẫn đầu `src/core/config/env.schema.ts` (schema + `AppEnv` + `.env.example` + map TƯỜNG MINH ở `app-config.ts` — Next chỉ nhúng
  `process.env.NEXT_PUBLIC_X` khi truy cập thẳng), đọc qua `appConfig` (`@/core/config`).
- **Tắt cờ chỉ ẩn khỏi menu — thư mục route vẫn tồn tại.** Muốn URL gõ tay ra 404 thì `page.tsx` tự `if (!appConfig.reportEnabled) notFound();` (mẫu: `demo/page.tsx`).
- Chỉ muốn giấu khỏi menu, route vẫn chạy → bỏ khỏi `NAV_*` hoặc `hideInMenu: true` (trang). Ẩn theo NGƯỜI dùng → quyền (§5.7), không phải cờ.
- Gỡ hẳn phân hệ demo khi dựng dự án thật: `README.md` gốc §"Dựng dự án thật" — xoá `demoModule`, `(app)/demo/`, `_views/demo/`, `PATHS.DEMO`, khoá `nav.demo*` / `metadata.demo`, namespace `demo` (`demo.json` + `CLIENT_NAMESPACES`).

### 5.9 Đổi trang mở đầu (landing) của phân hệ

Bấm phân hệ ở Dock / bảng lệnh đi tới `NavModuleDef.path`; màn đầu tiên của `screens` là gốc của dải điều hướng (`rootHref`, cấp 1) — thường có `path` trùng `path` phân hệ.

- **Cách 1 (nên dùng):** cho màn muốn mở đầu là `page.tsx` ở gốc thư mục phân hệ và là `screens[0]`.
- **Cách 2:** màn mở đầu có URL riêng (`/reports/overview`) → `screens[0].path` là URL đó, `NavModuleDef.path` vẫn là `/reports`, và `reports/page.tsx` `redirect` sang màn mở đầu:

```tsx
import { redirect } from '@/core/i18n';
import { requireLocale } from '@/core/i18n/server';
import { PATHS } from '@/shared/constants/paths.constants';

export default async function ReportsIndexPage({ params }: PageProps<'/[locale]/reports'>) {
  const locale = requireLocale((await params).locale);
  redirect({ href: PATHS.REPORTS_OVERVIEW, locale });
}
```

`redirect` của `@/core/i18n` (next-intl) cần `locale` để giữ đúng tiền tố ngôn ngữ. Giữ trang gốc này để gõ thẳng `/reports` không ra 404.

## 6. Menu · Dock · bảng lệnh

```
NAV_PAGES ───┐                                                  ┌─► AppDock            (modules)
             ├─► buildMenu(…, labelOf, user) ◄─ useAppMenu() ──┼─► useHeaderModules   (modules + nav → AppHeader)
NAV_MODULES ─┘     canAccess(user, permissions)  (_navigation)  ├─► AppCommandPalette  (pages + modules)
                                                                └─► AppTabBar          (Bảng điều khiển + modules)
```

- `buildMenu` (`_navigation/build-menu.utils.ts`) dựng `MenuItem { id, title, subtitle?, icon, href, permissions, tone?, nav? }`; `useAppMenu()` bọc nó với chữ `shell.nav` đã dịch
  và `selectUser` hiện tại, nên đổi ngôn ngữ hay đổi người dùng là menu dựng lại.
- `nav`: `screens` của phân hệ (bỏ `hideInNav`) → dải điều hướng trên header; mỗi mục có `permissions` = quyền phân hệ + quyền màn, đã lọc theo người dùng.
  `useActiveModule` chọn phân hệ đang mở theo URL và sáng mục SÂU NHẤT khớp URL (khớp tiền tố phân đoạn); CẤP 0–3 + `backHref` suy ra từ đó.
- Vào menu: trang tĩnh có `icon` và không `hideInMenu` (bảng lệnh · tab bar); mọi phân hệ. Sắp theo `order` tăng dần, không khai thì xếp cuối theo thứ tự khai báo.
- `href` = `path` của phân hệ / màn; mục nào hiện thì bấm vào là vào được vì cùng `canAccess` với `PermissionGate` — miễn quyền ở cấu hình khớp quyền ở gate (§5.7).
- Next `<Link>` tự prefetch trang đích khi mục vào tầm nhìn — không còn `preload` thủ công.
- Không nơi nào tự lọc quyền hay giữ danh sách mục riêng: thêm mục Dock / launcher = thêm phân hệ; thêm mục dải điều hướng = thêm màn vào `screens`. Lệnh không phải điều hướng
  (đổi theme, mở modal) thêm ở `AppCommandPalette` (§11).

## 7. Guard và phiên đăng nhập

Ba lớp (`routing-conventions.md §8`): **`proxy.ts`** chặn sớm ở server (route khớp `PROTECTED_PATH_PREFIXES` mà không có cookie phiên → `/login?next=…`; KHÔNG chặn trang khách);
**`AuthGate` / `GuestGate`** ở client lo cookie hết hạn / phiên bị thu hồi; **`PermissionGate`** hiện `ForbiddenView` tại chỗ.

**`useSessionGate()`** (`_guards/useSessionGate.ts`) khôi phục phiên nếu chưa (`useRestoreSession`) rồi trả MỘT trong năm nhánh — hai gate chỉ còn một `switch`, không tự đọc `status` hay `appConfig.authEnabled`:

| Gate | Khi | `AuthGate` | `GuestGate` |
|---|---|---|---|
| `signed-in` | `status === 'authenticated'` | vào (`children`) | `router.replace(resolveReturnPath(?next=))` + `LoadingScreen` |
| `open` | kiểm đăng nhập tắt (chế độ demo) | vào | vào (xem form) |
| `pending` | `idle` / `restoring` — chưa hỏi xong máy chủ | `<LoadingScreen level="app" />` | vào (form hiện ngay) |
| `unavailable` | không hỏi được máy chủ (mất mạng, 5xx) | `SessionUnavailableView`, GIỮ URL | vào |
| `signed-out` | máy chủ xác nhận không có phiên | `LoadingScreen` + `router.replace('/login?next=…')` | vào |

- **Đích quay lại là `?next=`.** `AuthGate` ghi `createReturnPath(pathname, window.location.search)` vào `/login?next=` — trừ khi vừa đăng xuất CHỦ ĐỘNG (`endReason === 'logout'`);
  `proxy.ts` ghi cùng định dạng cho người không có cookie. `GuestGate` đọc bằng `resolveReturnPath(?next=)`, chỉ nhận đường NỘI BỘ (`//evil.com`, `/\evil.com`, URL tuyệt đối → `PATHS.DASHBOARD`).
- **Đăng nhập.** View gọi `useLogin()` (`establishSession` khi thành công) và KHÔNG điều hướng — `GuestGate` thấy `signed-in` và đưa đi.
- **Đăng xuất.** Gọi `void logout()` rồi thôi. `AuthGate` là nơi DUY NHẤT đưa về `/login` phía trình duyệt (hết hạn, tab khác đăng xuất, và cả ngay sau `logout()`); hai nơi cùng điều hướng
  thì lệch nhau về `replace` / đích quay lại. ESLint `guard/login-redirect` chặn `router.push|replace(PATHS.LOGIN…)` ngoài `src/app/_guards`.
- **Khôi phục phiên (F5).** Token chỉ nằm trong bộ nhớ → khung hình đầu là `idle` → `pending` → một lượt refresh → `authenticated` / `anonymous` / `unavailable`. Nút "Thử lại" của
  `SessionUnavailableView` gọi `restoreSession()`. Gọi trùng vô hại: chỉ chạy từ `idle` / `unavailable` (`docs/architecture.md §11`). Server luôn dựng màn chờ (chưa biết phiên) nên HTML tĩnh của `(app)` không mang dữ liệu riêng tư.
- **Đa tab / đổi người.** `startSessionSync()` (bootstrap) đồng bộ giữa các tab; `onSessionEnd` dọn cache theo tài khoản.
- **Chế độ demo** (`NEXT_PUBLIC_APP_MODE=demo` → `authEnabled` mặc định `false`): `proxy.ts` không chặn, gate `open`, không có lời gọi refresh nào, `canAccess` luôn `true`, phân hệ demo được đăng ký. Bảng hai chế độ: `docs/architecture.md §15`.
- **`PermissionGate`** thiếu quyền → `ForbiddenView` TẠI CHỖ (không chuyển trang); luôn nằm BÊN TRONG `AuthGate`, không kiểm đăng nhập; đặt ở `layout.tsx` phân hệ hoặc `page.tsx`.
- Điều kiện vào riêng của MỘT phân hệ (vd phải chọn dự án trước) → `layout.tsx` của phân hệ tự render màn chọn hoặc `children`; đừng chèn gate mới vào `(app)/layout.tsx` chỉ cho một phân hệ.
- **Path mới cần đăng nhập** phải vào `PROTECTED_PATH_PREFIXES`; quên thì `proxy.ts` không chặn (vẫn còn `AuthGate`, nhưng người lạ nhận khung HTML). `proxy.ts` không import `server-only`.

## 8. Đồng bộ và điều hướng

**Tên tab trình duyệt** — `generateMetadata` của từng `page.tsx` (`generatePageMetadata` → `buildPageMetadata`): tiêu đề từ `metadata.<key>.title`, template `%s | Tên app` của root layout. Không còn `DocumentTitleSync`
hay `meta.tabTitle`; trang công khai muốn tiêu đề tuyệt đối (trang chủ) truyền `absoluteTitle: true`.

**Câu báo chuyển trang cho trình đọc màn hình** — Next App Router tự thông báo route mới (`next-route-announcer`); không còn `RouteAnnouncer` riêng.

**URL hiển thị TV** — `DisplayUrlSync` (`_providers/sync/`, gắn trong `AppProviders`, bọc `<Suspense>` vì `useSearchParams`): `?display=tv&scale=1.2` mở thẳng chế độ TV (gửi link cho màn treo tường). Mỗi URL MỚI (`pathname?search`)
mang param hợp lệ thì URL thắng store MỘT lần (`applyDisplayOverrides` — `mode` + `uiScale` ghi một lần, không có khung hình nửa vời); sau đó URL được viết lại khớp store bằng `router.replace(…, { scroll: false })`
(giữ `hash`). Param rác (`?display=abc`) coi như không có. Trang không cần tự đọc / ghi hai param này. Luật: `tv-display-mode.md`.

**Khôi phục cuộn** — `useRouteScrollRestoration(ref, scope)` (`_layouts/useRouteScrollRestoration.ts`), gắn ở `<main>` của `AppShellLayout` (scope `'main'`):

| Điều hướng | Vùng cuộn |
|---|---|
| Đổi `pathname` bằng bấm link / `router.push` | về đầu |
| Back / Forward (nhận diện bằng sự kiện `popstate`, tới TRƯỚC lần đổi pathname) | khôi phục vị trí đã lưu của trang đó (khoá `scope:pathname`, Map cấp module) |
| Chỉ đổi `?search` / `#hash` (lọc, tab) | giữ nguyên |

Bộ khôi phục cuộn mặc định của Next chỉ cuộn `window`, mà vùng làm việc khoá viewport (`<main>` cuộn) — nên cần hook riêng; App Router không cho biết kiểu điều hướng nên dùng `popstate`.
Vùng cuộn mới SỐNG QUA nhiều route (layout con có `overflow-y-auto`) → gắn hook với `scope` riêng. Vùng cuộn nằm TRONG trang (`PageBody overflow="scroll"`) dựng lại cùng trang nên không cần.
Trang tải dữ liệu sau khi hiện thì Back chỉ khôi phục được tới chiều cao đang có. Trang công khai (`(public)`) cuộn document nên dùng cơ chế mặc định của Next.

## 9. Lỗi và màn chờ

`ScreenLevel` (`_components/screen.types.ts`): `app` — chưa có khung bao quanh, chiếm trọn màn hình; `content` — đã có layout, chỉ lấp vùng nội dung (Header, Dock vẫn dùng được).

| Chuyện gì xảy ra | Ai bắt | Hiện gì |
|---|---|---|
| Một bước `bootstrapApp()` ném lỗi · provider ném khi render | `error.tsx` gần nhất (`[locale]/error.tsx`) | `RouteErrorScreen level="app"` |
| Lỗi của chính root layout | `app/global-error.tsx` (tự dựng `<html>`, chọn chữ từ `errors.json`) | `ErrorScreen level="app"`, chỉ chạy ở production |
| MỘT trang trong vùng làm việc ném lỗi / không tải được chunk | `(app)/error.tsx` | `RouteErrorScreen level="content"`; header / Dock vẫn dùng để đi trang khác |
| Đang tải trang / dữ liệu route | `(app)/loading.tsx` (Suspense Next tự bọc quanh `page.tsx`) | `LoadingScreen level="content"` |
| Đang khôi phục phiên | `AuthGate` / `GuestGate` (`pending`) | `LoadingScreen level="app"` |
| `notFound()` · URL không khớp route | `[locale]/not-found.tsx` · `[...rest]` · `global-not-found.tsx` | `NotFoundView` (HTTP 404 + `noindex`) |
| Lỗi API của query / mutation | `getQueryClient()` (`_providers/query-client.ts`) | toast đỏ — KHÔNG phải màn lỗi; tự vẽ lỗi thì `meta: { silentError: true }` (`api-patterns.md`) |

- **Lỗi tải chunk** (vừa triển khai bản mới: HTML cũ trỏ tới file đã xoá) → `RouteErrorScreen` gọi `reloadOnceOnChunkError` tự tải lại trang MỘT lần; vẫn lỗi trong 60 giây (`CHUNK_RELOAD_WINDOW_MS`) thì giữ màn lỗi có nút
  "Tải lại trang". Không ghi được cờ chống lặp (storage bị chặn) thì không tự tải lại.
- `describeError(error, showDetail?)` → `{ kind: 'chunk' | 'response' | 'unexpected', title, description }`; chi tiết kỹ thuật chỉ hiện ở dev. `logAppError(message, …details)` ghi `console.error` với tiền tố `[giao diện]` — lọc console
  bằng chuỗi này. Code app tự bắt lỗi cũng log qua hàm này.
- `error.tsx` PHẢI `'use client'` (Next yêu cầu); nút "Tải lại trang" / "Về trang chủ" điều hướng CỨNG (`location.reload` / `assign` qua `getPathname`) — cây React vừa hỏng, không tin client router; "Thử lại" gọi `reset`.
- `error.tsx` không bắt lỗi của `layout.tsx` cùng cấp (lỗi đó lên `error.tsx` của cha). Thêm `error.tsx` / `loading.tsx` cho một nhóm route mới: chép `(app)/error.tsx`, `(app)/loading.tsx`.
- Trong feature (không import được `app`): hiện lỗi dữ liệu bằng `Callout` / `EmptyState` của UI kit (`page-structure.md §1`).

## 10. Theme và hiển thị

- `<html>` mang trạng thái hiển thị: class `dark`, class `tv`, `data-accent` (màu nhấn khác VCI), biến `--ui-scale` và `--lh-scale` (`1 + (scale − 1) × 0.5`) — `applyAppearance({ theme, accent, isTv, uiScale })`
  trong `_providers/appearance/appearance.utils.ts` ghi chúng và đồng bộ `<meta name="theme-color">` theo token `--color-bg-page`.
- **Lần đầu (trước lần vẽ đầu):** `appearanceInitScript()` (`@/domains/preferences/appearance-script`) — chuỗi JS đồng bộ trong `<head>` của root layout, đọc đúng khoá localStorage của theme / display store và `?display` / `?scale`
  hợp lệ trên URL (thắng giá trị đã lưu). Nhờ đó không nháy sáng → tối và `<html suppressHydrationWarning>` là bắt buộc. Script PHẢI khớp `applyAppearance` (`tests/app/_providers/appearance.test.tsx` chạy script và so kết quả).
- **Về sau:** `AppearanceSync` (gắn một lần trong `BaseProviders`) gọi `applyAppearance` bằng `useLayoutEffect` mỗi khi preferences đổi — nhưng chỉ sau `usePersistedStoresHydrated()`, để không ghi đè giao diện đã lưu bằng giá trị mặc định.
  `DisplayUrlSync` lo phần URL ↔ store (§8).
- **Giá trị HIỆU LỰC, không phải giá trị đã lưu:** `useEffectiveTheme()` — TV luôn `dark`, ngoài TV là lựa chọn đã lưu; `useDisplayStore(selectEffectiveUiScale)` — `1` ngoài TV, ở TV là `1.1 | 1.2 | 1.3` (`UI_SCALE_VALUES`).
  Đọc thẳng `state.uiScale` là sai (ngoài TV store vẫn nhớ mức cũ).
- **Đổi:** theme → `useThemeStore((s) => s.setTheme)` / `toggleTheme`; chế độ → `useDisplayStore((s) => s.setMode)`; mức chữ → `setUiScale`. Giá trị chuỗi từ điều khiển kiểm bằng `parseUiScale` (và `parseThemeMode` khi nhận chuỗi tự do) trước khi ghi
  (mẫu: `_views/SettingsView.tsx`). TV không ghi đè lựa chọn theme — tắt TV là theme cũ quay lại.
- Biểu đồ nhận hệ số chữ qua `ChartScaleProvider` (gắn trong `AppProviders`); UI kit, widget, chart nhận theme qua props, không đọc `@/domains/preferences` (tầng `shared` không được import `domains`).
- Thoát TV bằng phím: Ctrl/⌘ + Alt + Shift + T (`useTvEscapeHatch`, chỉ trong `AppShellLayout`).
- Mặc định SÁNG (`THEME_INITIAL_STATE` = `light`, `<html>` không có `class="dark"`); `viewport.themeColor` (`@/core/seo`) chỉ theo `prefers-color-scheme` của HĐH nên `applyAppearance` ghi lại `theme-color` khi theme app khác HĐH.
- Mọi store `persist` bật `skipHydration: true` + `registerPersistedStore` (`state-management.md`); thêm store mới theo mẫu `display.store.ts`, không tự gọi `persist.rehydrate()`.

## 11. Shell: Header, Dock, bảng lệnh

Widget ở `src/shared/widgets` là UI THUẦN — không đọc cấu hình điều hướng, store phiên hay preferences. `src/app/_shell` nối chúng với app; `AppShellLayout` gắn mỗi thứ MỘT lần.

**`AppHeader`** → `Header` của `@/shared/widgets/header`:

| Prop được nối | Từ |
|---|---|
| `user` | `useShellAccount()` ← `useSessionStore(selectUser)` → `{ displayName, email, avatarUrl }` |
| `onUserMenuSelect(key)` | `profile` / `settings` → `router.push(USER_MENU_PATHS[key])` (`PATHS`); `logout` → `void logout()` |
| `extraMenuOptions` | mục gắn thêm vào menu tài khoản, mỗi mục mang `onSelect` riêng (đang có "Ẩn / Hiện thanh Dock", "Ẩn / Hiện thẻ làm việc") |
| `modules` · `activeModuleId` · `moduleNav` | `useHeaderModules()` — launcher của bộ chọn phân hệ, phân hệ đang mở, dải điều hướng của nó |
| `level` · `backHref` · `moduleHref` | `useHeaderModules()` ← `useActiveModule()` — cấp của URL (0–3), đích nút ‹, trang chủ phân hệ; cấp ≥ 2 header đổi sang vệt ‹ · phân hệ › màn hình (`light-theme.md` §6.1) |
| `search` · `shortcutLabel` | ô "Tìm kiếm… Ctrl K": `<CommandPaletteTrigger variant="field" className={HEADER_SEARCH_FIELD_CLASS} />` · `COMMAND_PALETTE_SHORTCUT_LABEL` |
| `theme` · `onThemeToggle` · `hideThemeToggle` | `useEffectiveTheme()` · `toggleTheme` · ẩn ở TV |
| `context` | chip ngữ cảnh — `HeaderContextChip` "Bản trình diễn" ở chế độ demo (dự án thật truyền công ty / chi nhánh đang chọn) |
| `brandLabel` · `brandMark` | `""` (logo đã có chữ) · `BRAND_MARK` — logo VCI `logo-vci.svg` trên viên trắng; đổi logo = thay `src/assets/image/logo-vci.svg` + `public/favicon.svg` |

Thêm một mục vào menu tài khoản — nối vào mảng `extraMenuOptions` (giữ `useMemo` và dependency); chữ lấy từ `useTranslations('shell.header')`:

```tsx
{
  key: 'help',
  label: t('help'),
  icon: <SystemIcon name="circle-question-outline" size={16} />,
  onSelect: openHelp,
},
```

(thêm khoá `shell.header.help` ở cả hai ngôn ngữ). Nút toàn cục mới: truyền thêm vào `actions`, class `HEADER_ICON_BUTTON_CLASS` để cùng cỡ. "Hồ sơ" / "Cài đặt" của menu tài khoản hiện là nút + `router.push` vì `Menu` chưa nhận `href` (`known-issues.md`).

**`AppDock`** → `Dock`: `useAppMenu().modules` → `{ id, label, icon, tone, href }` (mục là `<Link>` nên Next tự prefetch). Không thêm mục tay — thêm phân hệ (§5.4).

**`AppCommandPalette`** → `CommandPalette`, phím Ctrl/⌘+K hoặc `/` khi không gõ trong ô nhập (`useCommandPaletteShortcut`). Nhóm: "Điều hướng chung" (`pages`), "Phân hệ", "Giao diện" (đổi theme — ẩn ở TV); chữ
nhóm ở `shell.commandPalette`. Thêm lệnh tại chỗ: thêm nhóm / mục trong `useMemo` `groups`; mục ĐI TỚI TRANG có `href` (thành `<Link>` thật), mục LỆNH có `onSelect` — không có cả hai (`CommandPaletteItem`).

**`AppTabBar` · `AppPhoneTopBar`** — dạng điện thoại (`useIsPhone()`): thanh tab đáy dựng từ Bảng điều khiển + `modules` (quá 5 mục thì ô "Thêm"); top bar hiện `useScreenTitle()?.title` (trang có `PageHeader` thì tên của trang thắng).
**`AppWorkTabs`** — thanh dọc lịch sử thẻ làm việc: mỗi lần đổi màn, đẩy màn đang mở (`useScreenTitle` + `useActiveModule`) vào `useWorkTabsStore` trước khi vẽ.

**Trang đưa tên lên thanh header bằng `PageHeader`** (`@/shared/widgets/header`): portal crumb `/ ● tên · dòng phụ`, node trái / phải (`start` / `end`), nút quay lại (`onBack` + `backHref`) lên `Header`; `nav` dựng tab của trang:
từ `xl` (1280px) là nhóm segmented trên thanh ngay sau crumb, dưới `xl` là dải gạch chân trong luồng trang (tab của PHÂN HỆ đã có ở dải điều hướng phân hệ — `nav` chỉ cho tab TRONG một trang). Đặt ở đầu JSX của view;
view unmount thì portal gỡ theo. Cần `HeaderSlotsProvider` — chỉ `AppShellLayout` có, nên trang khách / công khai dùng `PageHeader` thì im lặng không hiện gì. Tab đi tới URL phải có `href`. Mẫu thật: `_views/demo/DemoLibraryView.tsx`
(`PageHeader` + tiêu đề dịch) · §5.5 (tab trên URL).

## 12. Layout

| Layout | Ở đâu trong cây | Làm gì | Đừng |
|---|---|---|---|
| `[locale]/layout.tsx` | root | `<html lang>`, font `next/font`, script giao diện, `NextIntlClientProvider`, `BaseProviders` | Thêm provider nặng (React Query, toast) — đó là việc của `AppProviders` |
| `(public)/layout.tsx` | nhóm công khai | `min-h-dvh` + `PublicHeader` + `<main id="main-content">` + `PublicFooter`; TÀI LIỆU CUỘN TỰ NHIÊN; link "Bỏ qua tới nội dung" | Khoá viewport / `PageShell` khoá cao ở đây; thêm Client Component nặng |
| `AuthLayout` | trong `GuestGate` | Thẻ hai khoang; khoang form là `<main>` tự cuộn, `my-auto` canh giữa form ngắn | Thêm `<main>` thứ hai trong trang khách |
| `AppShellLayout` | trong `AuthGate` | `HeaderSlotsProvider` → `AppHeader` + `<main>` (lề `SHELL_GUTTER_X` / `SHELL_GUTTER_Y` + đệm chừa Dock ghim `useDockReserveClass`) + `AppWorkTabs` + `AppDock` + `AppCommandPalette`; phím thoát TV; khoá `h-dvh overflow-hidden` | Trang tự thêm lề ngoài (`guard/spacing`); thêm prop bật / tắt vùng |

- **Hai mô hình cuộn:** trang công khai cuộn tài liệu (anchor, thanh địa chỉ mobile, Lighthouse đúng); vùng làm việc khoá viewport, chỉ `<main>` cuộn. Bản Vite khoá `body` cho cả app — với trang SEO nó làm hỏng anchor và Lighthouse
  (`docs/architecture.md §3`).
- Lớp bọc nghiệp vụ toàn vùng làm việc (stream thông báo, kiểm phiên bản…) đặt trong `AppProviders` (cần phiên, cần query) hoặc quanh `children` của `(app)/layout.tsx` — KHÔNG ở root layout (marketing sẽ tải nó).
- Dock GHIM: trái / phải NỔI ĐÈ (cùng thanh dọc lịch sử thẻ sát mép trái — không chiếm bề ngang); ĐÁY — trang trôi chừa 80px, trang khoá cao (`PageShell` `scroll`) cao trọn màn và Dock kính nổi đè, nội dung lấp trọn dải đáy; vùng
  cuộn DÀI hơn khung tự chừa cuối (`useDockOverlap` → `--dock-overlap` trên `[data-dock-aware]`). Đặt nội dung quan trọng ở GIỮA đáy khối khoá cao là bị Dock che — để trống (dòng tổng: nhãn trái, số phải). Tự ẩn / thu gọn / ẩn: Dock nổi đè, `<main>` dùng trọn màn.
- **CSS cạnh layout** — thứ Tailwind không diễn đạt được (nền nhiều lớp, gradient, mask) đặt ở file `.css` cạnh layout, CHỈ layout đó import. Khuôn (chép từ `src/app/_layouts/app-shell-layout.css`):

  ```css
  @reference '../../styles/globals.css';

  @layer components {
    .public-backdrop {
      background-color: var(--color-bg-page);
    }
  }
  ```

  `@reference` bật pipeline Tailwind cho file (không xuất thêm CSS) — có nó mới sinh fallback `color-mix` cho trình duyệt cũ. `@layer components` để utility Tailwind gắn cùng phần tử vẫn thắng. Màu chỉ qua
  `var(--color-*)` (`color-system.md`, `css-architecture.md`).
- **Layout mới cho một nhóm trang:** tạo nhóm route `(tên)/layout.tsx` (Server Component, nhận `children`); khung client đặt ở `src/app/_layouts/<Tên>Layout.tsx`, class gom vào bảng `XXX_SLOT_CLASSES` khoá theo vùng
  (`page-structure.md §4`), export ở `src/app/_layouts/index.ts` nếu nhiều nơi dùng. Có vùng cuộn sống qua nhiều route → `useRouteScrollRestoration(ref, '<scope>')`. Layout chỉ của MỘT phân hệ → `layout.tsx` trong thư mục route của phân hệ — không đặt ở `src/app/_layouts`.

## 13. Kiểm thử

Cây `tests/app` phản chiếu `src/app` (`testing.md §2`); Vitest 5 + jsdom + Testing Library, helper render bọc `NextIntlClientProvider` (`tests/helpers/render.tsx`). Playwright (`e2e/`, `testing.md §8`) chạy vài kịch bản của vùng này trên bản production: `proxy.ts` chặn sớm, đăng nhập / khôi phục / đăng xuất, `/demo` ở chế độ app, bảng lệnh. Các bài kiểm quan trọng của vùng này:

| Bài | Giữ điều gì |
|---|---|
| `tests/app/navigation.test.ts` | Mỗi path khai ở `NAV_PAGES` / `NAV_MODULES` có thư mục `page.tsx`; id nào cũng có khoá `nav.<id>` |
| `tests/app/seo-routes.test.ts` | `PUBLIC_ROUTES` và `PRIVATE_PATHS` không giao nhau |
| `tests/app/_providers/appearance.test.tsx` | `appearanceInitScript` cho cùng kết quả với `applyAppearance` |
| `tests/policy/structure/use-client.test.ts` | file chạm API client có `'use client'` (`server-client-boundary.md §9`) |

**Công cụ:**

| Cần | Dùng |
|---|---|
| Menu theo quyền, không cần React | `buildMenu(pages, modules, labelOf, user)` (`@/app/_navigation`) — hàm thuần |
| Có người đăng nhập | `establishSession({ accessToken, user })` (`@/domains/session`); reset `useSessionStore.setState(useSessionStore.getInitialState(), true)` ở `beforeEach` |
| Bật kiểm đăng nhập (test cố định chế độ demo) | `vi.mock('@/core/config', …)` đặt `authEnabled: true` |
| Giả máy chủ (refresh, API) | `mockHttp(handler)` (`tests/helpers/http-mock.ts`) — không `vi.mock('@/core/http')` |
| Component có `<Link>` / `useRouter` của `@/core/i18n` | helper render của `tests/helpers/render.tsx` (bọc provider next-intl) |

**Mẫu — menu và quyền cộng dồn** (bật kiểm đăng nhập, import SAU `vi.mock`):

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return { ...actual, appConfig: { ...actual.appConfig, authEnabled: true } };
});

const { buildMenu } = await import('@/app/_navigation');
import type { NavModuleDef } from '@/app/_navigation';

const MODULE: NavModuleDef = {
  id: 'demo',
  path: '/demo',
  icon: 'apps',
  permission: { resource: 'demo' },
  screens: [{ id: 'demoLibrary', path: '/demo', permission: { resource: 'demo', action: 'update' } }],
};

const labelOf = (id: string) => ({ title: id });
const user = (permissions: string[]) => ({ id: 'u1', email: 'an@congty.vn', name: 'An', roles: [], permissions });

describe('menu theo quyền', () => {
  it('có demo:view nhưng thiếu demo:update → phân hệ hiện, màn hình bị lọc khỏi dải điều hướng', () => {
    const { modules } = buildMenu([], [MODULE], labelOf, user(['demo:view']));

    expect(modules).toHaveLength(1);
    expect(modules[0]?.nav).toEqual([]);
  });

  it('đủ cả hai quyền → màn hình có trong dải điều hướng', () => {
    const { modules } = buildMenu([], [MODULE], labelOf, user(['demo:view', 'demo:update']));

    expect(modules[0]?.nav?.map((link) => link.href)).toEqual(['/demo']);
  });

  it('thiếu demo:view → phân hệ không có trong menu', () => {
    expect(buildMenu([], [MODULE], labelOf, user([])).modules).toEqual([]);
  });
});
```

**Mẫu — đích quay lại chỉ nhận đường nội bộ** (`return-path.utils.ts`):

```ts
import { describe, expect, it } from 'vitest';

import { PATHS } from '@/shared/constants/paths.constants';
import { resolveReturnPath } from '@/shared/utils/url/return-path.utils';

describe('resolveReturnPath', () => {
  it('giữ đường nội bộ, bỏ đường dẫn ra ngoài', () => {
    expect(resolveReturnPath('/dashboard?tab=2')).toBe('/dashboard?tab=2');
    expect(resolveReturnPath('//evil.com')).toBe(PATHS.DASHBOARD);
    expect(resolveReturnPath('https://evil.com')).toBe(PATHS.DASHBOARD);
  });
});
```

Bẫy khi test app:

- ⛔ Đừng chờ chuỗi mà Header / Dock cũng in (tên người dùng, tên phân hệ) — bài kiểm xanh giả. Chờ thứ CHỈ view đó có.
- Test render component có chữ dịch phải bọc provider next-intl (helper render); thiếu là `useTranslations` ném lỗi thiếu context.
- Test cố định chế độ demo (`test.env` trong cấu hình Vitest): mọi quyền mở, phân hệ demo có đăng ký — muốn kiểm quyền phải bật `authEnabled` như mẫu trên.
- Dựng `bootstrapApp` thật thì gọi disposer trong `afterEach`.
- Store `persist` bật `skipHydration` — test muốn state đã lưu phải gọi `useXxxStore.persist.rehydrate()` hoặc `rehydratePersistedStores()`.

## 14. Checklist và lỗi thường gặp

**Thêm / sửa trang**

- [ ] Một route = `page.tsx` MỎNG (`generateMetadata` + một view, không `'use client'`) + file view `XxxView.tsx` `export default`, khối tài liệu sát khai báo (`page-structure.md §2`)
- [ ] `PATHS.X` + thư mục route khớp; trang cần đăng nhập đã vào `PROTECTED_PATH_PREFIXES`, trang khách vào `GUEST_ONLY_PATHS`, trang SEO vào `PUBLIC_ROUTES`
- [ ] `metadata.<key>` có ở CẢ `messages/vi` lẫn `messages/en`; chữ view qua `useTranslations`, không chữ Việt cứng
- [ ] Trang có `icon` ở `NAV_PAGES` thì đã có `nav.<id>` hai ngôn ngữ
- [ ] `?query` đọc bằng `useSearchParams` / `useQueryParams` → `page.tsx` bọc `<Suspense>`; `npm run build` — không `ƒ` mới ngoài `[...rest]` và `/api/*`
- [ ] Không tự đệm lề, không thẻ HTML thô, không gọi API trong view
- [ ] Link là `<Link href>` của `@/core/i18n`; trang tĩnh `PATHS.X`

**Thêm / sửa phân hệ**

- [ ] `id` kebab-case = folder feature = thư mục route; `path` tuyệt đối; màn đầu của `screens` có `path` trùng `path` phân hệ
- [ ] `icon` (`-bold` nếu icon hệ thống), `tone` khác các phân hệ cùng nhóm; `order` nếu cần thứ tự
- [ ] Quyền ở HAI nơi khớp nhau: `permission` trong `navigation.config.ts` + `PermissionGate` ở `layout.tsx` / `page.tsx`; phân hệ nghiệp vụ không để trống `permission`
- [ ] Đã thêm vào `NAV_MODULES`; `nav.<id>` (+ màn hình) ở `shell.json` hai ngôn ngữ; `npm run dev` thấy ở Dock, Ctrl/⌘+K
- [ ] Test menu theo quyền + test đối chiếu cấu hình ↔ thư mục route (§13)

**Thêm / sửa gate, layout, bootstrap**

- [ ] Điều hướng về `/login` chỉ ở `AuthGate` (và `proxy.ts` ở server); sau đăng nhập chỉ ở `GuestGate`
- [ ] Bước bootstrap mới có hàm dừng → đã đẩy vào `cleanups`; state theo tài khoản đã xoá trong `onSessionEnd`
- [ ] Provider mới đặt sâu nhất có thể (`AppProviders`, không phải `BaseProviders`, nếu marketing không cần)
- [ ] Vùng cuộn mới sống qua nhiều route → `useRouteScrollRestoration` với `scope` riêng
- [ ] `npm run check` xanh (`quality-gates.md`)

**Lỗi thường gặp**

| Triệu chứng | Nguyên nhân | Sửa |
|---|---|---|
| Menu có mục, bấm ra 404 | Khai path ở `navigation.config.ts` mà thiếu thư mục `page.tsx` | Thêm route; `tests/app/navigation.test.ts` bắt lỗi này |
| Mục menu ẩn mà gõ URL vẫn vào được | Quyền chỉ khai ở `navigation.config.ts`, thiếu `PermissionGate` | Thêm `PermissionGate` ở `layout.tsx` / `page.tsx` (§5.7) |
| Menu hiện mục, bấm ra "Không có quyền" | `permission` ở cấu hình nhẹ hơn `PermissionGate` ở route | Giữ hai nơi khớp |
| Ai đăng nhập cũng thấy phân hệ | Bỏ trống `permission` ở `NavModuleDef` (mặc định = chỉ cần đăng nhập) | Khai `permission: { resource: '<id>' }` |
| Người lạ mở `/reports` vẫn nhận khung HTML | Quên thêm path vào `PROTECTED_PATH_PREFIXES` (`proxy.ts` không chặn) | Thêm vào `paths.constants.ts` |
| Build báo `useSearchParams() should be wrapped in a suspense boundary` · route thành `ƒ` | `useSearchParams` / `useQueryParams` thiếu `<Suspense>`, hoặc `cookies()` / `headers()` trong server | Bọc `<Suspense>` ở `page.tsx`; bỏ API động khỏi layout / page |
| Build báo "You're importing a component that needs `useState`…" | Hook / `createContext` / `on*=` ở file thiếu `'use client'` (kể cả `.ts`) | Thêm `'use client'` ở dòng đầu (`server-client-boundary.md`) |
| URL `/en/...` mất tiền tố khi bấm link | Dùng `next/link` / `useRouter` của `next/navigation` | `Link` / `useRouter` / `usePathname` từ `@/core/i18n` |
| `Link to=…` không đi đâu / lỗi kiểu | Còn viết theo React Router | Prop `href`, đường tuyệt đối |
| `tsc` đỏ ở `nav.<id>` / `metadata.<key>` | Thiếu khoá ở một ngôn ngữ | Thêm vào CẢ hai (`i18n.md`) |
| ESLint `guard/i18n-text` | Chữ tiếng Việt cứng trong JSX / prop / toast | `useTranslations` + khoá hai ngôn ngữ |
| ESLint "Import thư mục lắp ráp của app qua barrel" | Import file bên trong `_navigation` / `_shell` / `_providers` / `_guards` / `_components` | `@/app/_navigation`… (trừ `public-routes`) |
| Lỗi hydration lúc F5, giao diện nháy | Store `persist` thiếu `skipHydration` / `registerPersistedStore`, hoặc đọc `localStorage` ở thân component | Theo mẫu `display.store.ts`; đọc state đã lưu sau `usePersistedStoresHydrated()` |
| Effect / lời gọi API chạy hai lần lúc dev | `reactStrictMode` mount → unmount → mount để lộ effect thiếu dọn | Effect trả hàm dọn; lấy dữ liệu bằng React Query; hàm khởi tạo idempotent. KHÔNG bỏ StrictMode |
| Sang trang mới vẫn đứng giữa trang | Vùng cuộn mới sống qua các route mà không gắn `useRouteScrollRestoration` (hoặc chỉ đổi `?search` — cố ý giữ vị trí) | Gắn hook với `scope` riêng (§8) |
| Một trang lỗi rồi Header cũng mất | Lỗi ném từ `layout.tsx` (không bị `error.tsx` cùng cấp bắt) | Đưa phần dễ lỗi xuống `page.tsx` / view |
| ESLint `guard/login-redirect` | `router.push(PATHS.LOGIN)` sau `logout()` | Chỉ `void logout()` — `AuthGate` tự đưa về |
| ESLint `guard/ui-kit-elements` | `<button>` / `<input>` / `<table>` / `<svg>` thô trong `src/app` / feature | Component của `@/shared/ui` (`reuse-first.md`) |
| ESLint `guard/spacing` | Trang tự đệm (`p-6`, `p-[18px]`, `PageShell className="p-2"`) | Bỏ — lề do `AppShellLayout` cấp (`spacing-system.md`) |
| ESLint `guard/store-write` | `useSessionStore.setState(…)` trong app / feature | Hàm của domain: `establishSession`, `logout`, `restoreSession` |
| ESLint "Tầng `features` không được import `app`" | View feature import thứ dưới `@/app` | `PATHS` (nằm ở `shared`) hoặc hằng path trong feature (§5.6) |
| `PageHeader` không hiện gì | Trang nằm ngoài `AppShellLayout` (trang khách, công khai) — không có `HeaderSlotsProvider` | Dùng `TitleScreen` / khung của nhóm đó |
| Bản build production không chạy / dừng | `NEXT_PUBLIC_APP_MODE=app` mà thiếu `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_SITE_URL`, hoặc `NEXT_PUBLIC_AUTH_ENABLED=false` | Khai đủ biến (`docs/architecture.md §15`); bản trưng bày dùng `NEXT_PUBLIC_APP_MODE=demo` |
| Commit bị chặn ở `pre-commit` (`scripts/verify-commit.mjs --quick`) | `package-lock.json` lệch `package.json`, hoặc file sinh style lệch nguồn | Chạy `npm install` / `npm run generate:styles` rồi `git add`; `--no-verify` chỉ khi khẩn cấp — CI vẫn chặn. Build bản stage: `npm run verify:commit` |

## 15. Liên kết

- Luật route, quyền, cấu hình điều hướng, guard: [`routing-conventions.md`](../rules/structure/routing-conventions.md)
- Ranh giới server / client: [`server-client-boundary.md`](../rules/structure/server-client-boundary.md)
- Trang, view, layout, shell, provider: [`page-structure.md`](../rules/structure/page-structure.md) · cây feature:
  [`feature-structure.md`](../rules/structure/feature-structure.md)
- Link và điều hướng: [`navigable-controls.md`](../rules/interaction/navigable-controls.md) · lọc / tab trên URL:
  [`api-patterns.md`](../rules/data/api-patterns.md)
- Chế độ TV: [`tv-display-mode.md`](../rules/display/tv-display-mode.md) · khoảng cách:
  [`spacing-system.md`](../rules/styling/spacing-system.md) · CSS thuần:
  [`css-architecture.md`](../rules/styling/css-architecture.md)
- Đa ngôn ngữ: [`i18n.md`](i18n.md) · SEO: [`seo.md`](seo.md)
- Folder, tên file, giới hạn: [`folder-structure.md`](../rules/foundations/folder-structure.md) · test:
  [`testing.md`](../rules/foundations/testing.md) · cổng chất lượng: [`quality-gates.md`](../rules/foundations/quality-gates.md)
- Lý do thiết kế từng file: [`notes/code/app.md`](../notes/code/app.md) · [`notes/code/auth.md`](../notes/code/auth.md)

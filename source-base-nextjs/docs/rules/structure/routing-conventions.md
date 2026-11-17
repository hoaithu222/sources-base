# Routing Conventions — route do hệ thống file quyết, menu khai MỘT chỗ

> Nguồn thật: route ở `src/app/[locale]/` (hệ thống file của Next App Router) · cấu hình menu ở
> `src/app/_navigation/navigation.config.ts` · cổng chặn sớm ở `src/proxy.ts` · hằng path ở
> `src/shared/constants/paths.constants.ts`. File này giữ phần GIẢI THÍCH (luật, lý do, mẫu); code chỉ trỏ về đây
> (`AuthGate` / `GuestGate` trỏ tới §8; `guard/login-redirect` và `quality-gates.md` trỏ tới §10 — giữ nguyên số mục khi sửa).
> Làm từng bước (thêm trang, phân hệ, route con, quyền, test) có mã mẫu: [`guides/app-layer.md`](../../guides/app-layer.md).
> Ranh giới server / client của từng file route: [`server-client-boundary.md`](server-client-boundary.md).
> Bản Vite cũ khai route trong module registry (`ModuleDef`, `lazyPage`, `getRoutePath`, `meta`…) — **không còn**: Next đã có hệ thống
> file, nên route là THƯ MỤC và cấu hình điều hướng chỉ MÔ TẢ cho menu.

## 1. Nguyên tắc: route là thư mục, menu là cấu hình, mọi thứ khác dựng theo

Mỗi thứ được khai **đúng một lần**, ở đúng nơi của nó:

| Khai ở | Quyết định gì | Chuỗi path |
|---|---|---|
| Thư mục `src/app/[locale]/…/<path>/page.tsx` | URL có tồn tại không, layout / guard nào bao nó | tên thư mục |
| `PATHS` (`@/shared/constants/paths.constants`) | Hằng path (KHÔNG tiền tố ngôn ngữ) cho `<Link>`, redirect, `generateMetadata` | `PATHS.X` |
| `GUEST_ONLY_PATHS` · `PROTECTED_PATH_PREFIXES` (cùng file) | Chính sách truy cập cho `proxy.ts`, sitemap, robots | `PATHS.X` |
| `NAV_PAGES` · `NAV_MODULES` (`_navigation/navigation.config.ts`) | Mục menu: trang tĩnh có icon, phân hệ, màn hình của phân hệ, quyền | `PATHS.X` |
| `PUBLIC_ROUTES` · `PRIVATE_PATHS` (`_navigation/public-routes.ts`) | Trang nào vào `sitemap.xml` / bị chặn ở `robots.txt` | `PATHS.X` |
| `messages/<locale>/shell.json` → `nav.<id>` | Chữ của mục menu (tên, mô tả) | — |

Từ cấu hình điều hướng **dựng ra** — không chỗ nào giữ danh sách path / tên thứ hai:

| Thứ dựng ra | Bằng | Đọc ở |
|---|---|---|
| Menu đã dịch + lọc quyền | `buildMenu(NAV_PAGES, NAV_MODULES, labelOf, user)` — hàm thuần; `useAppMenu()` bọc nó | `_navigation/build-menu.utils.ts` → `_navigation/useAppMenu.ts` |
| Dock | `useAppMenu().modules` (ô `AppTile` theo `tone`) | `_shell/AppDock.tsx` |
| Header: bộ chọn phân hệ + dải điều hướng phân hệ + CẤP (0–3, nút ‹) | `useAppMenu().modules` → `MenuItem.nav` (màn hình không `hideInNav`, đã lọc quyền); `useActiveModule`: màn hình = mục SÂU NHẤT khớp URL, cấp + `backHref` suy từ đó | `_navigation/useActiveModule.ts` → `_shell/useHeaderModules.ts` → `_shell/AppHeader.tsx` |
| Trang chủ phân hệ (lưới thẻ màn hình) | `useActiveModule` + `description` / `icon` của màn hình | `_views/ModuleHomeView.tsx` (đặt làm `page.tsx` của gốc phân hệ) |
| Bảng lệnh (Ctrl/⌘+K) | `useAppMenu()` (`pages` + `modules`) | `_shell/AppCommandPalette.tsx` |
| Tab bar điện thoại | `useAppMenu()` (Bảng điều khiển + `modules`) | `_shell/AppTabBar.tsx` |
| Tên màn cho top bar điện thoại / thẻ làm việc | `resolveScreenTitle(pathname, pages, modules)` | `_navigation/useScreenTitle.ts` → `_shell/AppPhoneTopBar.tsx` · `AppWorkTabs.tsx` |
| Cổng chặn sớm ở server | `PROTECTED_PATH_PREFIXES` · `isProtectedPath()` | `src/proxy.ts` |
| `sitemap.xml` · `robots.txt` | `PUBLIC_ROUTES` · `PRIVATE_PATHS` | `app/sitemap.ts` · `app/robots.ts` |
| Tên tab trình duyệt | `generateMetadata` của TỪNG `page.tsx` (`title` + template `%s \| Tên app`) | `_seo/page-metadata.ts` · `core/seo` |

⛔ Cấu hình điều hướng KHÔNG sinh route và KHÔNG sinh guard — nó chỉ mô tả. Khai path ở đó mà thiếu thư mục `page.tsx` là menu
dẫn tới 404 (`tests/app/navigation.test.ts` đối chiếu từng path khai ↔ thư mục route); khai quyền ở đó mà thiếu `PermissionGate`
ở route là menu ẩn mục nhưng gõ tay URL vẫn vào được (§5, §8).
Không còn: `preload()` nạp trước (Next `<Link>` tự prefetch khi vào tầm nhìn), `meta.tabTitle` / `tabTitles` (tên tab do
`generateMetadata`), `RouteAnnouncer` / `DocumentTitleSync` (Next tự báo chuyển trang và `<title>` do Metadata API lo).

## 2. Cây route và hình dạng một route

```
src/app/
├── [locale]/                       ← segment GỐC: `vi` (không tiền tố) · `en` (/en/…) — `generateStaticParams` ở layout
│   ├── layout.tsx                  root layout: <html lang>, font, script giao diện, NextIntlClientProvider, BaseProviders
│   ├── error.tsx · not-found.tsx · opengraph-image.tsx
│   ├── 403/page.tsx                trang trạng thái đứng riêng (ngoài mọi guard / layout)
│   ├── [...rest]/page.tsx          bắt mọi URL lạ → `notFound()`
│   ├── (public)/                   marketing / nội dung SEO — SSG, KHÔNG React Query / phiên         (/ · /about)
│   │   ├── layout.tsx              header + <main> + footer, tài liệu cuộn tự nhiên
│   │   └── page.tsx · about/page.tsx
│   └── (workspace)/                mọi thứ cần phiên: layout gắn `AppProviders`
│       ├── layout.tsx
│       ├── (auth)/                 trang khách — `GuestGate` + `AuthLayout`, noindex        (/login · /register · /forgot-password · /reset-password)
│       │   └── layout.tsx · <trang>/page.tsx
│       └── (app)/                  vùng làm việc — `AuthGate` + `AppShellLayout`, noindex     (/dashboard · /profile · /settings · /demo)
│           └── layout.tsx · loading.tsx · error.tsx · <trang>/page.tsx
├── global-error.tsx · global-not-found.tsx    lưới đỡ cuối — tự dựng <html>
├── manifest.ts · robots.ts · sitemap.ts · api/health/route.ts
└── _providers/ _layouts/ _shell/ _views/ _navigation/ _guards/ _components/ _seo/   ← KHÔNG phải route (`_` đầu tên)
```

| File / thư mục | Vai | Ghi nhớ |
|---|---|---|
| `page.tsx` | Làm URL tồn tại. MỎNG: `generateMetadata` + ghép MỘT view | Server Component, `export default`. Không `useState`, không handler, không `'use client'` |
| `layout.tsx` | Khung quanh mọi route con, KHÔNG dựng lại khi đổi trang con | Server Component; bọc gate / provider (client) bằng children. `metadata` của layout nhóm = `noindex` cho cả nhóm |
| `loading.tsx` | Ranh giới `<Suspense>` quanh `page.tsx` của nhóm | Giữ header / Dock khi chuyển trang; không dùng hook trạng thái nên chạy ở server |
| `error.tsx` | Ranh giới lỗi của MỘT nhóm route | PHẢI `'use client'` (Next yêu cầu); thân là `RouteErrorScreen` |
| `not-found.tsx` · `notFound()` | 404 có ngôn ngữ, Next tự trả HTTP 404 + `noindex` | `[...rest]` đẩy URL lạ sang đây |
| `global-error.tsx` · `global-not-found.tsx` | Lỗi của chính root layout · URL ngoài `[locale]` | Tự dựng `<html>` / `<body>`, tự chọn chữ từ `errors.json` (không có provider i18n) |
| `(nhóm)/` | Nhóm route: chia layout mà KHÔNG đổi URL | Tên nhóm không vào URL; hai nhóm trùng URL là build lỗi |
| `[locale]` · `[id]` · `[...rest]` | Segment động | `params` là `Promise` — `await params` |
| `_xxx/` | Thư mục private — Next bỏ qua khi định tuyến | Chỗ lắp ráp (`page-structure.md §4`). Không bao giờ đặt `page.tsx` trong đó |

**`page.tsx` mỏng — mẫu thật** (`(workspace)/(app)/dashboard/page.tsx`):

```tsx
import { generatePageMetadata } from '@/app/_seo/page-metadata';
import DashboardView from '@/app/_views/DashboardView';
import { PATHS } from '@/shared/constants/paths.constants';

export const generateMetadata = ({ params }: PageProps<'/[locale]/dashboard'>) =>
  generatePageMetadata({ params, key: 'dashboard', path: PATHS.DASHBOARD });

export default function DashboardPage() {
  return <DashboardView />;
}
```

- **View ở đâu:** trang chung của app → `src/app/_views/<Tên>View.tsx`; trang nghiệp vụ → `src/features/<id>/views/<Tên>View.tsx` rồi
  export ở `index.ts` của feature (`import { LoginView } from '@/features/auth'`). Lý do: view là Client Component (form,
  query) còn `page.tsx` phải là Server Component để có `generateMetadata`.
- **`generatePageMetadata({ params, key, path, noIndex? })`** (`_seo/page-metadata.ts`) lấy tiêu đề + mô tả từ `metadata.<key>` ở
  `messages/<locale>/metadata.json`, dựng canonical + hreflang; mặc định `noindex` — thêm trang mới không vô tình lọt vào Google.
  `key` thiếu ở một ngôn ngữ là `tsc` đỏ. Trang CÔNG KHAI muốn lập chỉ mục: `noIndex: false` (hoặc gọi `buildPageMetadata` thẳng như
  `(public)/page.tsx` khi cần JSON-LD / tiêu đề tuyệt đối) + thêm vào `PUBLIC_ROUTES` — xem [`guides/seo.md`](../../guides/seo.md).
- **Kiểu route** `PageProps<'/[locale]/dashboard'>` · `LayoutProps<'/[locale]'>` do `next typegen` sinh (đã nằm trong
  `npm run typecheck`) — đổi tên thư mục là kiểu báo đỏ ngay.
- Ngôn ngữ: `requireLocale((await params).locale)` (`@/core/i18n/server`) thu hẹp `string` thành `Locale`, lạ → 404. KHÔNG gọi
  `setRequestLocale` — ngôn ngữ đọc từ tham số gốc bằng `next/root-params` (`docs/architecture.md §3`).
- Trang `use*` tham số URL (`useSearchParams`) → PHẢI `<Suspense>` ở `page.tsx` (§7, §9).

## 3. Thêm trang / phân hệ — tóm tắt (mã mẫu ở `guides/app-layer.md §5`)

**Trang tĩnh sau đăng nhập** (`/notifications`):

1. `PATHS.NOTIFICATIONS` ở `paths.constants.ts`, và thêm vào `PROTECTED_PATH_PREFIXES` (để `proxy.ts` chặn người chưa có phiên).
2. Thư mục `src/app/[locale]/(workspace)/(app)/notifications/page.tsx` — mỏng, mẫu ở §2.
3. Khoá `metadata.notifications` ở `messages/{vi,en}/metadata.json`; view ở `src/app/_views/NotificationsView.tsx`.
4. Muốn có trong bảng lệnh / tab bar: một dòng ở `NAV_PAGES` (`id`, `path`, `icon`, `order`) + `nav.<id>` ở `shell.json` (cả hai ngôn ngữ).
5. `npm run build`, đọc bảng `Route (app)`: trang phải là `●` (SSG), không `ƒ` (§11).

**Trang khách** (`/activate`): như trên nhưng đặt dưới `(workspace)/(auth)/`, thêm vào `GUEST_ONLY_PATHS`, không khai `NAV_PAGES`.

**Trang công khai SEO** (`/pricing`): `(public)/pricing/page.tsx`, `PATHS`, `PUBLIC_ROUTES`, `generateMetadata` bằng `buildPageMetadata`
(+ JSON-LD) — KHÔNG thêm vào `PROTECTED_PATH_PREFIXES` / `GUEST_ONLY_PATHS`. Hướng dẫn đủ: `guides/seo.md`.

**Phân hệ nghiệp vụ** (`/reports`):

1. Thư mục `(workspace)/(app)/reports/` + `page.tsx` (gốc phân hệ), `layout.tsx` nếu cần `PermissionGate` / khung riêng.
2. `PATHS.REPORTS` + thêm vào `PROTECTED_PATH_PREFIXES`.
3. Khai một `NavModuleDef` vào `NAV_MODULES`: `id`, `path`, `icon`, `tone`, `permission`, `screens` (§6).
4. `nav.<id>` (+ `nav.<id của từng màn hình>`) ở `shell.json` cả hai ngôn ngữ; `metadata.<key>` cho từng `page.tsx`.
5. Quyền ở HAI nơi (§5): `permission` trong cấu hình (ẩn menu) VÀ `PermissionGate` ở `layout.tsx` / `page.tsx` (chặn thật ở giao diện).

Không sửa Dock, header, bảng lệnh, tab bar, `useAppMenu` — chúng đều đọc cấu hình. Tắt phân hệ theo cờ: `...(flag ? [xModule] : [])` trong
`NAV_MODULES` (cờ phải biết được lúc nạp module: biến `NEXT_PUBLIC_*` qua `appConfig`) — tắt thì thư mục route vẫn tồn tại, nên trang
phải tự `notFound()` khi cờ tắt (mẫu: `demo/page.tsx` — `if (!appConfig.isDemo) notFound()`).

`demoModule` (chỉ đăng ký ở chế độ demo, `NEXT_PUBLIC_APP_MODE=demo`) là bản mẫu sống: một phân hệ một màn hình `/demo`. Dự án thật gỡ nó:
xoá `demoModule` ở `NAV_MODULES`, thư mục `(app)/demo/`, `_views/demo/`, `PATHS.DEMO` (+ khỏi `PROTECTED_PATH_PREFIXES`), khoá `nav.demo*` /
`metadata.demo` ở hai ngôn ngữ, namespace `demo` (`demo.json` + `CLIENT_NAMESPACES`).

**Route con · layout con · path động**: thêm thư mục con dưới thư mục phân hệ (`reports/create/page.tsx`); nhóm màn dùng chung một khung
→ `reports/[id]/layout.tsx` (Server Component, nhận `children`; không `<Outlet />`). Segment động `[id]`: `await params` ở `page.tsx`
rồi truyền `id` xuống view làm prop — view client không đọc `params` của route. Màn con muốn lên dải điều hướng header → khai trong
`screens`; trang chi tiết / path động không khai (hoặc `hideInNav: true`).

## 4. Luật đường dẫn

- `PATHS` giữ path **không tiền tố ngôn ngữ** (`/login`, không `/en/login`) và **tuyệt đối**. Mỗi giá trị phải có thư mục tương ứng dưới
  `src/app/[locale]/` — nhóm route `(…)` không nằm trong URL.
- `Link` / `useRouter` / `usePathname` / `redirect` / `getPathname` lấy từ `@/core/i18n` — chúng tự thêm `/en`. `usePathname()` trả path
  KHÔNG tiền tố nên so thẳng với `PATHS.*`. Không gõ cứng `/en/…`, không `next/link`, không `useRouter` của `next/navigation`
  (`useSearchParams` / `useParams` thì vẫn lấy ở `next/navigation` — không phụ thuộc ngôn ngữ).
- **Không có đường dẫn tương đối theo cây route** như React Router (`<Link to="settings">`, `to=".."`). `href="settings"` được
  trình duyệt giải theo URL hiện tại như thẻ `<a>` thường. Luôn dùng đường tuyệt đối: `PATHS.X` cho trang tĩnh; trong phân hệ, hằng
  path của phân hệ (`REPORTS_PATH`) hoặc ghép từ `PATHS`.
- Trang mặc định của một nhóm là `page.tsx` ở gốc thư mục, không phải path rỗng. Hai nhóm route không được cùng URL
  (`(public)/about` và `(app)/about` → build lỗi).
- `[locale]` là segment gốc: `vi` là ngôn ngữ mặc định, KHÔNG tiền tố (`localePrefix: 'as-needed'`) — URL tiếng Việt giữ nguyên.
- Thêm `PATHS.X` thì thêm thư mục tương ứng NGAY; thêm thư mục route công khai / riêng tư mà không đưa vào đúng danh sách của
  `PUBLIC_ROUTES` / `PROTECTED_PATH_PREFIXES` / `GUEST_ONLY_PATHS` là sai sitemap, robots hoặc proxy. `PUBLIC_ROUTES` và
  `PRIVATE_PATHS` không được giao nhau (`tests/app/seo-routes.test.ts`).

## 5. Luật quyền — cộng dồn, không "ghi đè"

- `NavModuleDef.permission` là quyền **tối thiểu** để vào bất kỳ màn hình nào của phân hệ; `NavScreenDef.permission` /
  `NavPageDef.permission` là quyền **thêm vào**. Vào được một màn ⟺ thoả **mọi** quyền từ phân hệ xuống tới màn đó
  (`buildMenu` gộp `permissions = [quyền phân hệ, quyền màn hình]`). Không có cách để màn con "nới" quyền của phân hệ.
- ⚠️ **Bỏ trống `permission` = chỉ cần đăng nhập** (khác bản Vite: mặc định `<id>:view`). Phân hệ có dữ liệu riêng PHẢI khai
  `permission: { resource: '<id>' }` (action bỏ trống = `'view'`); chỉ trang không có dữ liệu riêng của ai (hồ sơ, cài đặt, bảng điều
  khiển) mới để trống.
- Menu và gate dùng chung **một luật** `canAccess(user, permissions)` (`@/domains/session`): `buildMenu` lọc mục (và lọc từng màn hình của
  `nav` — nhóm rỗng thì bỏ), `usePermission` / `PermissionGate` lọc giao diện. Menu không bao giờ hiện mục mà bấm vào ra 403.
- **Quyền khai ở hai nơi — giữ khớp nhau.** `navigation.config.ts` chỉ ẩn / hiện mục menu; chặn THẬT ở giao diện là `PermissionGate`
  đặt trong `layout.tsx` của phân hệ (mọi màn) hoặc `page.tsx` của màn (§8). Hai nơi lệch nhau thì hoặc menu ẩn mà URL vẫn vào được,
  hoặc menu hiện mà bấm ra 403.
- `appConfig.authEnabled === false` (chế độ demo): không có ai để kiểm quyền, `canAccess` luôn `true`, menu hiện đủ.
- Hành động mới (`'sign'`…): thêm vào union `PermissionAction` ở `src/domains/session/model/permission.utils.ts`.

⚠️ Tất cả chỉ điều khiển giao diện. Quyền thật do BE kiểm trên từng API.

## 6. Cấu hình điều hướng — field hay dùng sai

`NavPageDef` (trang tĩnh ngoài phân hệ) · `NavModuleDef` (phân hệ) · `NavScreenDef` (màn hình của phân hệ) — kiểu ở
`_navigation/navigation.types.ts`. Mọi `id` là khoá trong `messages/<locale>/shell.json` → `nav.<id>.{title, subtitle?, description?}`:
trang tĩnh, phân hệ và màn hình dùng CHUNG một không gian id (vd phân hệ `demo`, màn hình `demoLibrary`); thiếu khoá thì `tsc` đỏ ở cả
hai ngôn ngữ.

| Field | Ở | Ý nghĩa | Lỗi hay gặp |
|---|---|---|---|
| `id` | cả ba | Khoá `nav.<id>` — tên, `subtitle` (dòng phụ), `description` (thẻ màn hình) lấy từ đây | Hai mục trùng `id` → trùng chữ; `title` viết dài → bị cắt ở Dock / header |
| `path` | cả ba | Path tuyệt đối, không tiền tố ngôn ngữ, lấy từ `PATHS` | Khai mà thiếu `page.tsx` → 404; phân hệ mới quên thêm vào `PROTECTED_PATH_PREFIXES` |
| `icon` | cả ba | `AppIconName` (tên VCI hoặc tên `SystemIcon`). Bắt buộc với phân hệ (glyph trong ô `AppTile` — ưu tiên icon VCI, icon hệ thống thì bản `-bold`); trang tĩnh có `icon` thì hiện ở bảng lệnh và tab bar; màn hình bỏ trống → dùng icon phân hệ | Mượn icon chung chung (`wallet`, `cubes`) khi bộ VCI đã có icon nghiệp vụ (`vci-icon-system.md`) |
| `tone` | phân hệ | Tông ô `AppTile` (`AppTileTone`) — CÙNG tông ở Dock, bộ chọn phân hệ, thẻ. Bỏ trống → `primary` | Dùng `red` cho phân hệ "quan trọng": tông là DANH TÍNH, không phải trạng thái |
| `permission` | cả ba | `RoutePermission` — cộng dồn (§5) | Bỏ trống ở phân hệ nghiệp vụ → ai đăng nhập cũng thấy mục |
| `order` | trang · phân hệ | Thứ tự menu tăng dần; bỏ trống → xếp cuối theo thứ tự khai báo | — |
| `hideInMenu` | trang | Trang vẫn chạy, không hiện ở bảng lệnh / tab bar | Trang không có `icon` thì vốn không vào menu |
| `hideInNav` | màn hình | Màn vẫn chạy, KHÔNG hiện ở dải điều hướng phân hệ trên header (trang phụ, chi tiết) | Path động (`[id]`) không khai ở `screens` là đủ — không cần cờ |
| `screens` | phân hệ | Danh sách màn hình của dải điều hướng; **màn đầu tiên là gốc của phân hệ** (`rootHref`, cấp 1) — thường `path` trùng `path` phân hệ | Màn đầu có `path` khác phân hệ mà gốc phân hệ không `redirect` sang nó → gõ thẳng `path` phân hệ ra khung trống |

- **Cấp điều hướng (0–3)** do `useActiveModule` tính một chỗ: `0` ngoài mọi phân hệ · `1` trang chủ phân hệ · `2` một màn hình · `3` sâu hơn
  (chi tiết bản ghi, trang `hideInNav`). Header đổi dạng theo cấp, dải < 2 mục thì ẩn. Màn hình khớp theo tiền tố PHÂN ĐOẠN và lấy mục
  DÀI NHẤT (`/reports` không sáng khi đang ở `/reports/create`).
- Tên tab trình duyệt KHÔNG ở đây — do `generateMetadata` của từng `page.tsx` (`messages/<locale>/metadata.json`). `resolveScreenTitle`
  chỉ phục vụ top bar điện thoại và thẻ làm việc, không ghi `document.title`.
- `NAV_MODULES` / `NAV_PAGES` là mảng tĩnh dựng một lần lúc nạp module; điều kiện phải biết được lúc nạp (`appConfig.isDemo`).

## 7. Nạp lười, màn chờ, màn lỗi — Next lo phần lớn

- **Tách mã theo route là mặc định** của Next — không còn `lazyPage()`, `LazyLoad`, `preload()`. Chỉ phần nặng KHÔNG nằm sẵn trong
  trang (biểu đồ, trình soạn ảnh, viewer 3D…) mới cần `next/dynamic` — luật ở `server-client-boundary.md §7`. Liên kết `<Link>` tự
  prefetch trang đích khi vào tầm nhìn (production).
- **Hai cấp màn chờ / màn lỗi** (`ScreenLevel` ở `_components/screen.types.ts`): `content` (mặc định — đã có layout bao quanh, header /
  Dock vẫn dùng được) và `app` (ngoài mọi layout, chiếm trọn màn hình). `loading.tsx` và `error.tsx` của `(app)` dùng `content`;
  `[locale]/error.tsx` dùng `app`.
- `loading.tsx` = ranh giới `<Suspense>` Next tự bọc quanh `page.tsx` cùng cấp; đặt MỘT file ở `(app)/` là đủ cho cả vùng làm việc.
- `error.tsx` bắt lỗi render của route con (KHÔNG bắt lỗi của `layout.tsx` cùng cấp — lỗi đó lên `error.tsx` của cha, root layout lên
  `global-error.tsx`). Thân luôn là `RouteErrorScreen`: ghi log, lỗi tải chunk (vừa triển khai bản mới) thì tự tải lại MỘT lần
  (`reloadOnceOnChunkError`, cờ chống lặp qua `safeStorage`), vẫn lỗi thì nút "Tải lại trang". "Tải lại trang" và "Về trang chủ" điều hướng CỨNG
  (`location.reload` / `assign`) — cây React vừa hỏng, không tin client router; "Thử lại" gọi `reset` của Next.
- `useSearchParams` / `useQueryParams` / `useNavHref` đọc `?query` ở client → trang (hoặc phần đọc nó) PHẢI nằm trong `<Suspense>`, nếu
  không cả route mất SSG (build báo `useSearchParams() should be wrapped in a suspense boundary`). Mẫu thật: `reset-password/page.tsx`,
  `DisplayUrlSync` trong `AppProviders`.

## 8. Guard — `proxy.ts` chặn sớm, `AuthGate` / `GuestGate` / `PermissionGate` lo phần còn lại

Ba lớp, mỗi lớp một việc — đừng gộp:

| Lớp | Ở đâu | Chặn gì | KHÔNG làm gì |
|---|---|---|---|
| **`proxy.ts`** (tên mới của `middleware.ts` ở Next 16) | `src/proxy.ts` | Route khớp `PROTECTED_PATH_PREFIXES` mà KHÔNG có cookie phiên → `redirect /login?next=…` (đúng tiền tố ngôn ngữ). Người lạ không nhận HTML của vùng riêng tư | Không kiểm chữ ký token (việc của BE). **Không chặn trang khách**: chuyển người đã đăng nhập đi mà cookie còn nhưng phiên hỏng gây vòng lặp `/login` ⇄ `/dashboard` |
| **`AuthGate`** | `(workspace)/(app)/layout.tsx` | Phía trình duyệt: cookie hết hạn, phiên bị thu hồi, đăng xuất từ tab khác → `/login?next=…`; phiên `unavailable` → `SessionUnavailableView` (GIỮ URL) | Không kiểm quyền chi tiết |
| **`GuestGate`** | `(workspace)/(auth)/layout.tsx` | Người đã có phiên → `?next=` (chỉ đường nội bộ) hoặc bảng điều khiển | Không chặn form trong lúc khôi phục phiên — người chưa có cookie thấy form ngay từ HTML server |
| **`PermissionGate`** | `layout.tsx` của phân hệ hoặc `page.tsx` | Thiếu quyền → `ForbiddenView` TẠI CHỖ (giữ URL, không chuyển trang) | Không kiểm đăng nhập — luôn đặt BÊN TRONG `AuthGate` |

`useSessionGate()` (`_guards/useSessionGate.ts`) khôi phục phiên nếu chưa (`useRestoreSession`) rồi trả MỘT trong năm nhánh — hai gate chỉ
còn một `switch`, không tự đọc `status` hay `appConfig.authEnabled`:

| Gate | Khi | `AuthGate` | `GuestGate` |
|---|---|---|---|
| `signed-in` | `status === 'authenticated'` | vào (`children`) | `router.replace(resolveReturnPath(?next=))` + `LoadingScreen` |
| `open` | kiểm đăng nhập tắt (chế độ demo) | vào | vào (xem form) |
| `pending` | `idle` / `restoring` — chưa hỏi xong máy chủ | `LoadingScreen level="app"` | vào (form hiện ngay) |
| `unavailable` | không hỏi được máy chủ (mất mạng, 5xx) | `SessionUnavailableView`, GIỮ URL | vào |
| `signed-out` | máy chủ xác nhận không có phiên | `LoadingScreen` + `router.replace('/login?next=…')` | vào |

- **Server luôn dựng màn chờ của `AuthGate`** (phiên chưa biết ở server) nên HTML tĩnh của `(app)` không mang dữ liệu riêng tư; dữ liệu
  của người dùng chỉ có sau khi phiên khôi phục ở client. Vì vậy `(app)` vẫn SSG được.
- ⛔ **Không kiểm phiên bằng `cookies()` / `headers()` trong `page.tsx` / `layout.tsx`** — chúng biến route thành render động (`ƒ`) và phá SSG
  của cả nhánh. Cổng phía server chỉ là `proxy.ts`.
- **Thêm path cần đăng nhập:** thêm vào `PROTECTED_PATH_PREFIXES` (khớp path và mọi route con). Quên bước này thì `proxy.ts` không chặn,
  chỉ còn `AuthGate` ở client — vẫn an toàn về dữ liệu nhưng người lạ nhận được khung HTML. **Thêm path chỉ khách:** `GUEST_ONLY_PATHS`.
  `proxy.ts` không import `server-only` / `server-config` (không chạy ở điều kiện `react-server`) — đọc env bằng `parseServerEnv`. Muốn
  bỏ qua đường mới (file tĩnh, API) thì sửa `matcher`, không thêm `if` đầu hàm.
- **Điều kiện vào riêng của MỘT phân hệ** (vd phải chọn dự án trước) → `layout.tsx` của phân hệ tự render màn chọn hoặc `children`; đừng
  chèn gate mới vào `(app)/layout.tsx` chỉ cho một phân hệ.
- **Chế độ demo** (`NEXT_PUBLIC_APP_MODE=demo` → `authEnabled` mặc định `false`): `proxy.ts` không chặn, gate `open`, không có lời gọi refresh,
  `canAccess` luôn `true`. Bảng hai chế độ: `docs/architecture.md §15`.

## 9. Điều hướng trong code — theo `navigable-controls.md`

- Đi tới trang là `<Link href>` thật (`Link` của `@/core/i18n`), không `onClick={() => router.push(…)}`. Nút trông như nút:
  `<Button asChild><Link href={PATHS.PROFILE}>…</Link></Button>`. `router.push` / `replace` chỉ dùng SAU một hành động (tạo xong thì sang trang
  chi tiết) hoặc cho hiệu ứng phụ (`DisplayUrlSync` ghi lại `?display=`).
- Trang tĩnh: `PATHS.PROFILE`, `PATHS.LOGIN`… — chính các chuỗi mà thư mục route và `proxy.ts` dùng.
- Feature KHÔNG import được `@/app/…` (ESLint chặn): link sang trang tĩnh dùng `PATHS` (nằm ở `shared`); link trong nội bộ phân hệ dùng hằng
  path đặt trong feature (`features/report/constants/report-paths.constants.ts`), segment động ghép bằng template
  (`` `${REPORT_PATH}/${encodeURIComponent(id)}` ``) — và một test đối chiếu hằng đó với thư mục route để không trôi.
- Tab / lọc / phân trang trên URL (`?tab=`, `?page=`): `useQueryParams()` + `useNavHref()` (`@/shared/hooks`) để giữ nguyên các param khác —
  nhớ `<Suspense>` (§7). Ghi bằng `router.replace` (không thêm mục lịch sử).
- `usePathname()` của `@/core/i18n` trả path đã bỏ tiền tố ngôn ngữ; `getPathname({ href, locale })` dựng path có tiền tố khi cần điều hướng
  CỨNG (`window.location.assign` — chỉ ở màn lỗi, nơi không tin client router).
- Chuyển ngôn ngữ giữ nguyên trang: `LocaleSwitcher` (`<Link locale>` thật, `<a hreflang>` — công cụ tìm kiếm lần theo được).
- URL ngoài ứng dụng: `<a href rel="noopener noreferrer">`, không qua `Link`.

## 10. Đăng nhập / đăng xuất — mỗi chiều một nơi điều hướng

- **Vào `/login`:** ở phía trình duyệt `AuthGate` là nơi **duy nhất** — khi phiên hết hạn, bị đăng xuất từ tab khác, và cả ngay sau `logout()`
  (nơi gọi `logout()` — menu tài khoản — không tự `router.push`). Nó ghi nơi người dùng định vào bằng `createReturnPath(pathname, search)`
  (`shared/utils/url/return-path.utils.ts`) vào query `?next=` (`RETURN_PATH_PARAM`), trừ khi người dùng vừa CHỦ ĐỘNG đăng xuất
  (`endReason === 'logout'` của `@/domains/session`): người đăng nhập kế tiếp có thể là người khác, và họ vừa chọn rời trang đó. Hết hạn /
  tab khác đăng xuất (`expired` · `remote`) thì giữ đích — đăng nhập lại là về đúng chỗ đang làm. Ở phía server `proxy.ts` làm cùng việc cho
  người KHÔNG có cookie (cùng `createReturnPath`, cùng `?next=`) — hai lớp, một định dạng. ESLint `guard/login-redirect` chặn
  `router.push|replace(PATHS.LOGIN…)` ngoài `src/app/_guards`.
- **Hai gate rẽ nhánh theo `useSessionGate()`** (§8) — mỗi gate chỉ còn một `switch`, không tự đọc `status` hay `authEnabled`.
- **Rời `/login`:** `GuestGate` là nơi **duy nhất** điều hướng khi phiên vừa được xác lập, tới `resolveReturnPath(?next=)` — hàm này chỉ nhận
  đường nội bộ của app (`//evil.com`, `/\evil.com`, URL tuyệt đối đều bị bỏ, rơi về `PATHS.DASHBOARD`; phân tích bằng `URL`, không so chuỗi).
  Trang đăng nhập chỉ gọi API (`useLogin` → `establishSession`), **không** tự điều hướng.
- **Đích quay lại là `?next=`, không còn `location.state`** — nên F5 giữ đích, link `/login?next=…` chia sẻ được, và `proxy.ts` (không có
  `state`) dùng được cùng cơ chế.

## 11. Cấu trúc thư mục và giữ SSG

Tên file theo `folder-structure.md §4`: hậu tố vai (`*.utils.ts`, `*.types.ts`, `*.config.ts`) khi file gom nhiều thứ cùng vai; `kebab-case.ts(x)` =
kebab của MỘT export khi file chỉ công bố thứ đó.

```
src/app/
├── [locale]/…                 route — page.tsx / layout.tsx MỎNG (§2)
├── _components/               màn dùng chung: ErrorScreen · LoadingScreen · RouteErrorScreen · LocaleSwitcher · describe-error · chunk-reload.utils · screen.types
├── _guards/                   AuthGate · GuestGate · PermissionGate · useSessionGate
├── _layouts/                  AppShellLayout (+ .css) · AuthLayout (+ .css) · public/ (header, footer) · auth/ · useRouteScrollRestoration · useDockOverlap
├── _navigation/               navigation.config · navigation.types · build-menu.utils · useAppMenu · useActiveModule · useScreenTitle ·
│                              screen-title.utils · DisplayUrlSync · public-routes
├── _providers/                BaseProviders · AppProviders · AppOverlays · StoreHydration · SessionBootstrap · LocaleSync · bootstrap · query-client · appearance/
├── _seo/                      page-metadata (generatePageMetadata)
├── _shell/                    AppHeader · AppDock · AppCommandPalette · AppPhoneTopBar · AppTabBar · AppWorkTabs · useHeaderModules · useShellAccount
└── _views/                    view của trang chung (Landing · About · Dashboard · Profile · Settings · ModuleHome · status/ · demo/)
```

- Import vào các thư mục có barrel (`_components`, `_guards`, `_navigation`, `_providers`, `_shell`) đi qua `index.ts` (`@/app/_navigation`);
  `_layouts`, `_views`, `_seo` không barrel nên import thẳng file. Ngoại lệ có lý do: `@/app/_navigation/public-routes` (dữ liệu thuần —
  `robots.ts` / `sitemap.ts` nạp mà không kéo hook client). Trong một thư mục `_xxx` dùng đường tương đối.
- **Giữ SSG:** sau MỖI lần thêm route, đọc bảng `Route (app)` của `npm run build` — không có `ƒ` ngoài `[...rest]` và `/api/*`. Thứ làm route
  động: `cookies()` / `headers()` / `searchParams` ở Server Component, `useSearchParams` thiếu `<Suspense>`, segment động `[id]` không có
  `generateStaticParams` (render theo yêu cầu — chấp nhận ở vùng riêng tư `noindex` có dữ liệu lấy ở client; trang công khai thì khai
  `generateStaticParams`). Trang tĩnh KHÔNG cần gọi `setRequestLocale`.

## Liên quan

`server-client-boundary.md` (file nào có `'use client'`) · `page-structure.md` (view, layout, shell, provider) · `feature-structure.md` (cấu trúc
`src/features/{id}/`) · `navigable-controls.md` (điều hướng phải là `<Link>`) · `api-patterns.md` (`useQueryParams`) · `tv-display-mode.md`
(`?display=` / `?scale=`) · `../i18n/i18n.md` · `../seo/seo.md`.

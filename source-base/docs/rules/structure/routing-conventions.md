# Routing Conventions — khai route MỘT chỗ

> Nguồn thật: `src/app/router/`. Kiểu của khai báo ở `definition/route.types.ts`.
> File này giữ phần GIẢI THÍCH (luật, lý do, mẫu đầy đủ); code chỉ trỏ về đây.
> Làm từng bước (thêm trang, phân hệ, route con, quyền, test) có mẫu code: [`guides/app-layer.md`](../../guides/app-layer.md).

## 1. Nguyên tắc: một khai báo, mọi thứ dựng theo

Mỗi trang được khai **đúng một lần**, trong một entry mang đủ path, component,
quyền và metadata của chính nó:

| Khai ở | Cho | Chuỗi path |
|---|---|---|
| `router/static.routes.ts` | Trang tĩnh: đăng nhập, trang chủ, hồ sơ, cài đặt, 403, 404 | `PATHS` (`@/shared/constants/paths.constants`) |
| `router/modules/module-registry.ts` + `modules/{id}.routes.ts` | Phân hệ nghiệp vụ | khai ngay trong `ModuleDef` |

Từ hai nơi đó **dựng ra** — không chỗ nào giữ danh sách path / tên thứ hai:

| Thứ dựng ra | Bằng | Đọc ở |
|---|---|---|
| `RouteObject[]` (`appRoutes`) | `buildRoutes()` · `buildModuleRoutes()` | `router/setup/app-routes.tsx` |
| Guard quyền | `permission` → `<PermissionGuard>` lồng nhau | `setup/build-routes.tsx` |
| Dock | `useAppMenu().modules` (rê chuột / focus → `preload` trang đích) | `shell/AppDock.tsx` |
| Bảng lệnh (Ctrl/Cmd+K) | `useAppMenu()` (`pages` + `modules`; mục tô sáng → `preload`) | `shell/AppCommandPalette.tsx` |
| Tên tab trình duyệt | `meta` → `handle` → `useMatches()` | `sync/DocumentTitleSync.tsx` |
| Câu báo chuyển trang (trình đọc màn hình) | cùng `resolveScreenTitle` của tên tab | `sync/RouteAnnouncer.tsx` |
| Tiêu đề trang giữ chỗ | `resolvePageTitle(useMatches())` | `definition/route-handle.utils.ts` |
| Đích điều hướng | `PATHS.X` (trang tĩnh) · `getRoutePath(id)` (phân hệ) | — |

`router/setup/app-routes.tsx` chỉ còn trả lời một câu: nhóm trang nào nằm sau guard nào,
trong layout nào. Base **chưa có breadcrumb** — cần thì dựng từ `titledMatches(useMatches())`
(`definition/route-handle.utils.ts`), không khai danh sách thứ hai.

## 2. Hình dạng một entry

Thứ tự key **cố định** — đọc entry nào cũng theo đúng một nhịp:

```
id → path / index → page / layout → permission → meta → children
```

Ba dạng route, phân biệt bằng chính các key có mặt:

| Dạng | Key | Ý nghĩa |
|---|---|---|
| Trang | `{ path, page, meta }` | Một URL, một trang |
| Trang index | `{ index: true, page }` | Trang mặc định của route cha; bỏ `meta` thì dùng của cha |
| Layout | `{ path, layout?, children }` | Render `<Outlet />`, **không** tự là trang |

```ts
// src/app/router/modules/report.routes.ts
import { lazyPage, type ModuleDef } from '../definition';

export const reportModule: ModuleDef = {
  id: 'report',                       // cũng là `resource` khi kiểm quyền
  path: '/reports',                   // TUYỆT ĐỐI
  // permission bỏ trống = { resource: 'report', action: 'view' }
  meta: { title: 'Báo cáo', icon: 'chart-line-outline', order: 10 },
  children: [
    { index: true, page: lazyPage(() => import('@/features/report/pages/ReportPage')) },
    {
      id: 'report.create',
      path: 'create',                 // TƯƠNG ĐỐI → /reports/create
      page: lazyPage(() => import('@/features/report/pages/CreateReportPage')),
      permission: { resource: 'report', action: 'create' },   // quyền THÊM VÀO
      meta: { title: 'Tạo báo cáo' },
    },
    {
      path: ':id',                    // có children → LAYOUT
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
  ],
};
```

```
/reports
├── index     → ReportPage
├── create    → CreateReportPage          (+ quyền report:create)
└── :id       → ReportLayout + <Outlet />
    ├── index     → ReportDetailPage
    └── settings  → ReportSettingsPage
```

Trang tĩnh viết cùng kiểu, chỉ khác là path lấy từ `PATHS`:

```ts
{ id: 'profile', path: PATHS.PROFILE, page: lazyPage(() => import('@/app/pages/ProfilePage')),
  meta: { title: 'Hồ sơ cá nhân', tabTitle: 'Thông tin cá nhân', icon: 'user-outline' } },
```

## 3. Thêm phân hệ mới — 2 bước

1. Tạo `src/app/router/modules/{id}.routes.ts` export một `ModuleDef` (chép
   `demo.routes.ts`).
2. Thêm nó vào mảng `MODULE_REGISTRY` trong `module-registry.ts`.

Không sửa `app-routes.tsx`, Dock, bảng lệnh hay logic tên tab. Tắt phân hệ theo cờ:
`...(flag ? [xModule] : [])`. Chưa có màn hình thật:
`{ index: true, page: LazyPlaceholderPage }` (`modules/lazy-placeholder-page.ts`) — giữ chỗ
trong menu, **không** bỏ entry.

`demoModule` (`demo.routes.ts`) là bản mẫu sống, chỉ đăng ký ở chế độ demo. Khi
dự án đã có phân hệ thật: xoá dòng của nó trong `module-registry.ts`, xoá
`demo.routes.ts` và `src/features/demo/`.

Thêm **trang tĩnh**: thêm path vào `PATHS`, rồi thêm entry vào đúng nhóm trong
`static.routes.ts` (`GUEST_PAGES` · `APP_PAGES` · `FALLBACK_PAGES`).
`tests/app/router/app-routes.test.tsx` chặn việc khai path mà quên entry, và ngược lại.

## 4. Luật đường dẫn

- Entry cấp cao nhất (trang tĩnh, phân hệ): path **tuyệt đối**, tĩnh — `/reports`.
- `children[].path`: **tương đối** — `create`, `:id`. React Router tự ghép.
- Route nằm ngoài cây của cha thì khai ở đúng cấp của nó. Path con bắt đầu bằng
  `/` bị `validateModules` từ chối (React Router ném lỗi lúc dựng router nếu để lọt).
- Trang mặc định của một layout là `index: true`, không phải một path rỗng.

## 5. Luật quyền — cộng dồn, không "ghi đè"

- `ModuleDef.permission` là quyền **tối thiểu** để vào bất kỳ trang nào của phân
  hệ. Bỏ trống = `{ resource: id, action: 'view' }`. `'authenticated'` = chỉ cần
  đã đăng nhập (dùng cho trang không có dữ liệu riêng của ai — đừng chép sang
  phân hệ nghiệp vụ).
- `permission` của layout / trang con / trang index là quyền **thêm vào**.
- Vào được một trang ⟺ thoả **mọi** `permission` từ phân hệ xuống tới trang đó.
  Không có cách nào để route con "nới" quyền của phân hệ.
- Menu và guard dùng chung `canAccess()` (`@/domains/session`), và mục menu kiểm
  quyền của **trang đích** (`findLandingEntry`: trang index hoặc `landingPath`) — nên
  Dock không hiện mục mà bấm vào lại ra 403.
- `appConfig.authEnabled === false` (chế độ demo): không có ai để kiểm quyền,
  mọi route mở và menu hiện đủ.

⚠️ Tất cả chỉ điều khiển giao diện. Quyền thật do BE kiểm trên từng API.

## 6. `meta` — field hay dùng sai

| Field | Ý nghĩa | Lỗi hay gặp |
|---|---|---|
| `title` | Tên ngắn: menu, vế đầu tên tab, tiêu đề trang giữ chỗ | Viết dài → bị cắt ở Dock |
| `tabTitle` | Tên đầy đủ cho tab trình duyệt | — |
| `tabTitles` + `defaultTab` | Tên tab trình duyệt theo tab nội bộ (`?tab=` / `:tab`) | Import hằng số tab từ feature vào registry → kéo code feature vào bundle chính. Khai chuỗi ngay tại đây |
| `icon` | Bắt buộc với phân hệ; trang tĩnh có `icon` thì hiện ở bảng lệnh | — |
| `order` | Thứ tự menu, tăng dần | — |
| `hideInMenu` | Route vẫn chạy, không hiện ở menu | Chỉ có nghĩa ở entry cấp cao nhất |
| `landingPath` | Đích khi bấm phân hệ ở menu, nếu khác `path` | Phải trỏ tới route đã khai, nếu không `validateModules` ném lỗi |

Tên tab trình duyệt có dạng `Phân hệ · Màn con | Tên app`. `defaultTab` chỉ áp
cho chính trang khai nó — trang con là trang khác, không phải tab mặc định.

## 7. Trang nạp lười — `lazyPage()`

`lazyPage(loader)` là cách **duy nhất** đưa trang vào route; loader luôn trả
`{ default: Component }`. Trang export có tên thì đổi ngay tại loader:

```ts
page: lazyPage(() => import('…/UsersPage').then((m) => ({ default: m.UsersPage })))
```

⚠️ Mỗi lần gọi `lazyPage()` tạo **một component riêng**. Hai route phải giữ
nguyên trang khi chuyển qua lại (vd `/bim-3d` và `/bim-3d/:id` cùng một màn,
không được dựng lại viewer) thì khai **một hằng** rồi dùng cho cả hai:

```ts
const Bim3dPage = lazyPage(() => import('@/features/bim-3d/pages/Bim3dPage'));
// … { index: true, page: Bim3dPage }, { path: ':id', page: Bim3dPage, meta: … }
```

Gọi hai lần với cùng đường import là hai component khác nhau: React thấy đổi
loại phần tử và mount lại cả trang.

**Nạp trước khi có ý định.** Trang `lazyPage()` có `preload()`: gọi loader MỘT lần và giữ lượt tải,
`React.lazy` dùng lại đúng lượt đó (không tải hai lần; lượt hỏng thì quên để lần sau tải lại). Menu tự
gắn `MenuItem.preload` (trang đích + layout các tầng bao nó — `menu/build-menu.utils.ts`); Dock gọi khi
rê chuột / focus, bảng lệnh gọi khi mục được tô sáng. KHÔNG nạp trước hàng loạt lúc khởi động — mất
đúng cái lợi của chia chunk.

Mọi trang được bọc `<LazyLoad>` (`ErrorBoundary`). Hai cấp màn chờ / màn
lỗi (`ScreenLevel`, tuỳ chọn `level` của `buildRoutes`): `content` (mặc định — đã có
layout bao quanh) và `app` (ngoài mọi layout, chiếm trọn màn hình). Ranh giới lỗi tự
xoá khi `pathname` đổi, không xoá khi chỉ đổi query.
⛔ **`Suspense` nằm ở LAYOUT, không ở `LazyLoad`**: `RootLayout` (cấp `app`) · `AppShellLayout` · `AuthLayout` (cấp `content`)
mỗi nơi một `<Suspense>` quanh `<Outlet />`, đứng yên qua mọi lần đổi trang. Mỗi route tự có `Suspense` thì trang đích
chưa tải xong là ranh giới MỚI → hiện màn chờ thay trang cũ (chớp); ranh giới đã hiện thì React giữ trang cũ tới khi trang
mới sẵn sàng (router đã bọc cập nhật trong `startTransition`). Trang nạp lười luôn phải nằm dưới một layout có `Suspense`.
Lỗi tải chunk (thường do vừa triển khai bản mới) thì tự tải lại trang MỘT lần
(`reloadOnceOnChunkError`, cờ chống lặp qua `safeStorage`); vẫn lỗi thì giữ màn lỗi có nút "Tải lại trang".
`LazyLoad` giữ nguyên phần tử trang khi URL đổi — trang không cần `memo`, chỉ vẽ lại khi chính nó đọc
router / store.

## 8. Kiểm tra registry — `validateModules`

Chạy khi nạp `module-registry.ts` ở dev và test; ném lỗi liệt kê **mọi** vấn đề:

- trùng `id` (phân hệ hoặc route con), trùng path (kể cả với trang tĩnh; `:id`
  và `:slug` là cùng một mẫu);
- path phân hệ không tuyệt đối / không tĩnh; path con không tương đối;
- `landingPath` không trỏ tới route đã khai; phân hệ không có trang index mà
  cũng không khai `landingPath`;
- `permission` của route con trùng quyền cấp cha đã áp (thừa);
- `defaultTab` không có trong `tabTitles`.

## 9. Điều hướng trong code — theo `navigable-controls.md`

- Trang tĩnh: `PATHS.PROFILE`, `PATHS.LOGIN`… — chính các chuỗi mà
  `static.routes.ts` dùng để khai route.
- Phân hệ / route con: `getRoutePath('report.create')` (`@/app/router/modules`).
  Trả `string | undefined` — `undefined` khi phân hệ không đăng ký ở chế độ đang
  chạy, nên nơi gọi phải xử lý thay vì dẫn tới 404. Segment động:
  `generatePath(path, { id })` của React Router.
- Tab nội bộ một phân hệ (`?tab=`): `useNavHref()` (`@/shared/hooks`) để giữ
  nguyên các param lọc khác.
- Feature không import được `app`: link trong nội bộ phân hệ dùng path tương đối
  (`<Link to="settings">`); sang trang tĩnh thì dùng `PATHS`.

## 10. Đăng nhập / đăng xuất — mỗi chiều một nơi điều hướng

- **Vào `/login`:** `AuthGuard` là nơi **duy nhất** — khi phiên hết hạn, bị đăng
  xuất từ tab khác, và cả ngay sau `logout()` (nơi gọi `logout()` không tự
  `navigate`). Nó ghi nơi người dùng định vào (`createReturnState`: pathname +
  search + hash, `guards/return-path.utils.ts`), trừ khi người dùng vừa CHỦ ĐỘNG
  đăng xuất (`endReason === 'logout'` của `@/domains/session`): người đăng nhập kế
  tiếp có thể là người khác, và họ vừa chọn rời trang đó. Hết hạn / tab khác đăng
  xuất (`expired` · `remote`) thì giữ đích — đăng nhập lại là về đúng chỗ đang làm.
- **Hai guard rẽ nhánh theo `useSessionGate()`** (`open` · `pending` · `unavailable` ·
  `signed-in` · `signed-out`, đã gộp `appConfig.authEnabled`) — mỗi guard chỉ còn một
  `switch`, không tự đọc `status` hay `authEnabled`.
- **Rời `/login`:** `GuestGuard` là nơi **duy nhất** điều hướng khi phiên vừa được
  xác lập, tới `resolveReturnPath(location.state)` — hàm này chỉ nhận đường nội bộ
  của app (`//evil.com`, `/\evil.com`, URL tuyệt đối đều bị bỏ, về trang chủ). Trang
  đăng nhập chỉ gọi API, **không** tự `navigate`.

## 11. Cấu trúc thư mục

Tên file theo `folder-structure.md §4`: hậu tố vai (`*.utils.ts`, `*.types.ts`, `*.routes.ts`) khi file gom
nhiều thứ cùng vai; `kebab-case.ts(x)` = kebab của MỘT export khi file chỉ công bố thứ đó.

```
src/app/
├── components/         ErrorBoundary · ErrorScreen · LoadingScreen · describe-error · chunk-reload.utils ·
│                       screen.types (màn dùng chung, KHÔNG phụ thuộc router — import qua `@/app/components`)
├── layouts/            RootLayout · AppShellLayout (+ .css) · AuthLayout (+ .css) · useRouteScrollRestoration · auth/
├── providers/          AppProvider · AppOverlays · query-client (`queryClient`) · appearance/
└── router/
    ├── index.ts                chỉ `AppRouter` + `appRoutes`
    ├── static.routes.ts        khai báo trang tĩnh (`GUEST_PAGES` · `APP_PAGES` · `FALLBACK_PAGES`)
    ├── setup/                  AppRouter.tsx (dựng router lười) · app-routes.tsx (`appRoutes`: route gốc +
    │                           guard + layout + nhóm trang) · build-routes.tsx (khai báo → `RouteObject`)
    ├── modules/                module-registry.ts · {id}.routes.ts · validate-modules.ts ·
    │                           lazy-placeholder-page.ts
    ├── definition/             THUẦN (không component): route.types.ts · lazy-page.ts · route-tree.utils.ts ·
    │                           route-handle.utils.ts
    ├── menu/                   build-menu.utils.ts (dựng từ khai báo) · useAppMenu.ts (lọc theo quyền)
    ├── guards/                 AuthGuard · GuestGuard · PermissionGuard · useSessionGate · return-path.utils.ts
    ├── components/             LazyLoad · RouteErrorScreen (cơ chế của router)
    └── sync/                   DocumentTitleSync · RouteAnnouncer · DisplayUrlSync · document-title.utils.ts
```

- `@/app/router` chỉ export `AppRouter` và `appRoutes`. Thứ khác import thẳng thư
  mục con (`@/app/router/menu`, `/modules`, `/definition`, `/guards`, `/sync`,
  `/setup`). File mà chính route nạp (trang ở `app/pages`, shell) **không** đi qua
  `@/app/router` — index đó export `appRoutes`, đi qua là import vòng.
- Router trình duyệt dựng lười trong `AppRouter` (`useState(() => createBrowserRouter(appRoutes))`),
  không dựng lúc import module; test dựng router bộ nhớ: `createMemoryRouter(appRoutes, …)`.

## Liên quan

`feature-structure.md` (cấu trúc `src/features/{id}/`) · `navigable-controls.md`
(điều hướng phải là `<Link>`) · `api-patterns.md` (`useQueryParams`) ·
`tv-display-mode.md` (`?display=` / `?scale=`).

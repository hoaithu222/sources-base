# Ghi chú code — app (`src/app/`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/app/` (bootstrap, components, layouts, pages, providers, router),
> tách khỏi code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Router: `routing-conventions.md`. Trang xác thực: `notes/code/auth.md`.

## bootstrap

- **Điểm lắp ráp duy nhất.** `core/http` không biết store, `domains/session` không biết cache của
  React Query, cả hai không biết toast — `bootstrapApp()` đưa cho mỗi bên đúng thứ nó cần qua tham số.
- **`queryClient.clear()` khi phiên kết thúc hoặc đổi người**: không dọn thì người đăng nhập sau thấy dữ liệu
  người trước (`invalidateQueries` vẫn giữ dữ liệu cũ). Chỉ nghe MỘT nguồn — `onSessionEnd`, kể cả `switched`.
- **`resetProgressCenter()` chạy cùng nó** (`resetAccountScopedState`): hàng đợi tải lên và thẻ tác vụ là
  state của tài khoản. Chỉ bỏ phía trình duyệt — việc máy chủ đã nhận (nhập Excel…) vẫn chạy tiếp.
- **401 không toast theo từng query.** Phiên chết thì cả loạt query cùng hỏng; chỉ có MỘT thông báo
  "phiên hết hạn" ở `onSessionEnd('expired')`.
- **`bootstrapApp()` trả disposer và idempotent**: gọi trùng trả cùng hàm dừng; test và HMR gọi disposer trước
  lượt kế. Một bước khởi tạo lỗi thì listener đã đăng ký được dọn để thử lại được.

## App · providers

- **`main.tsx` nạp `styles/globals.css`**, khởi tạo rồi mount `App`; lỗi bootstrap đồng bộ có màn lỗi để tải lại.
- **`App` bọc providers và router bằng `ErrorBoundary`** (`level="app"`, không `resetKey`); ranh giới quanh
  từng trang (`LazyLoad`) và `RouteErrorScreen` vẫn xử lý lỗi bên trong router.
- **`AppProvider` cấp QueryClient, mount `AppearanceSync`, `ChartScaleProvider` (biểu đồ phóng theo cỡ chữ TV) và
  `AppOverlays` một lần**: test truyền client riêng
  để cô lập query; production dùng singleton `queryClient` (`providers/query-client.ts`, qua `@/app/providers`).
- **`AppOverlays` chứa toast và tiến trình; command palette thuộc `AppShellLayout`** nên phím tắt điều hướng chỉ
  có trong shell, không xuất hiện ở màn xác thực hoặc trang dự phòng.

## providers/appearance

- **`initializeAppearance` áp theme, TV và scale trước render React**: URL hợp lệ thắng lựa chọn đã lưu, đọc
  bằng CHÍNH `readDisplayOverrides` + `applyDisplayOverrides` mà `DisplayUrlSync` dùng.
- **`applyAppearance` nhận giá trị ĐÃ HIỆU LỰC** (`useEffectiveTheme`, `selectEffectiveUiScale`) và chỉ ghi DOM —
  luật "TV ép tối, scale chỉ có ở TV" nằm một chỗ trong domain. `AppearanceSync` ghi trước paint.
- **Nền HTML trước khi bundle chạy vẫn dark mặc định**: chưa có cơ chế đọc preferences trước khi tải bundle.
- **`theme-color` ghi lại từ token `--color-bg-page` mỗi lần áp**: `index.html` chỉ có hai meta theo `prefers-color-scheme`
  của HĐH, nên theme app khác HĐH thì thanh trạng thái lệch màu; token rỗng (CSS chưa nạp) thì bỏ qua.

## layouts

- **`RootLayout` (route gốc) là khung nền `h-dvh` TỰ CUỘN**: `body` khoá cuộn, nên trang ngoài khung (đăng ký
  cao hơn màn hình) chỉ cuộn được nhờ nó; con `shrink-0` để không bị co rồi cắt. `AppShellLayout` vừa khít `h-dvh`.
- **`AppShellLayout` là khung ứng dụng thật** (Header, `<main>` cuộn, Dock, bảng lệnh, `HeaderSlotsProvider`, phím
  thoát TV) — không có prop bật / tắt vùng.
- **Vạch dưới header là `rail` của chính `Header`** — layout không vẽ thêm đường nào (hai vạch sát nhau đọc ra
  viền dày lệch màu).
- **Dock ghim chừa chỗ TRONG LUỒNG** (`DOCK_RESERVE_CLASS`, con của cột flex sau `<main>`) nên `<main>` co lại;
  lề `SHELL_GUTTER_*` giữ nguyên — `notes/code/widgets.md`.
- **`AuthLayout` dùng `my-auto` (không `justify-center`)** trong vùng cuộn của khoang form: form ngắn thì nằm
  giữa, form dài hơn khoang thì đầu form vẫn cuộn tới được.

## layouts/app-shell-layout.css · auth-layout.css

- **Nền, gradient và mask của layout nằm ở file CSS cạnh layout**, do chính layout import, trong
  `@layer components` để utility vẫn thắng. JSX giữ cấu trúc và utility bố cục.
- **`.app-background` đổi theo theme bằng BIẾN** (`--app-grid-line`, `--app-glow-*` đè ở `.dark`): sáng lưới
  trung tính + quầng gần tắt, tối lưới teal + ba quầng. `StatusPage` dùng lại để trang dự phòng cùng nền app.
- **`.auth-*`: sáng là thẻ trắng + viền + bóng mềm; `.dark .auth-*` giữ kính teal.** Đốm chạy viền, vạch quét,
  điểm sáng và ngoặc góc màn chỉ `dark:block` (ẩn hẳn thì animation vô hạn cũng không chạy).

## pages

- **`StatusPage` (403, 404, mất kết nối)**: nút "Quay lại / Về trang chủ" là phần con riêng (router hook) nên trang
  truyền `children` không cần `<Router>`. Trang đứng ngoài mọi layout: gốc là `<main>`, tiêu đề `<h1>` cỡ chữ h3.
- **`StatusPage` tự import `app-shell-layout.css`** (nguồn `.app-background`): layout lazy chưa tải thì trang dự phòng
  vẫn có nền. Mã trạng thái mỗi ký tự một ô số (`aria-hidden`); con số thật đọc qua `sr-only`.
- **Trang chủ · Cài đặt · Hồ sơ cùng công thức `SectionHeader accent` + `Surface` chia dòng `divide-y`**
  (`color-usage-guide.md §15`); ô icon / số thứ tự theo tone `sky` của trang.
- **`SettingsPage` kiểm giá trị theme và scale** trước khi ghi store.

## layouts/AppShellLayout.tsx — khung điện thoại

- **Điện thoại (`useIsPhone()`) đổi Header → top bar, Dock → thanh tab đáy**; hai thanh nằm TRONG luồng `h-dvh flex-col`
  (không `fixed`) nên `<main>` tự co, không phải chừa đáy bằng số rời rạc.
- **Máy ≥ 768px vẫn là Dock**: chế độ ghim tự chừa chỗ trong luồng (`DOCK_RESERVE_CLASS`, Dock đứng SAU `<main>`) nên `<main>`
  co lại; vỏ điện thoại không có Dock nên không chừa gì thêm.
- **Lề `<main>` cộng `SHELL_SAFE_INSET_X`** (không hẹp hơn `--safe-l` / `--safe-r`): iPhone xoay ngang có tai thỏ; laptop
  `--safe-*` = 0 nên vẫn 16px.

## layouts/AuthLayout.tsx · pages/status · components/ErrorScreen.tsx — điện thoại

- **`AuthLayout` một cột, khoang thương hiệu chỉ còn logo + tên**: tiêu đề, sơ đồ, danh sách đẩy ô đăng nhập xuống
  ~900px; thẻ neo ĐỈNH (`items-start`) để bàn phím ảo không đẩy ô nhập khuất.
- **`ErrorScreen level="app"` · `StatusPage` tự CUỘN** (`h-dvh overflow-y-auto` + `items-center-safe`): `body` khoá cuộn nên
  khung `min-h-dvh` thấp hơn nội dung (phone xoay ngang) cắt mất nút; canh giữa thường thì phần đầu tràn lên không cuộn tới được.

## shell/ — AppPhoneTopBar · AppTabBar · useShellAccount

- **Hai vỏ, MỘT nguồn dữ liệu**: `AppHeader` (laptop / tablet) và `AppPhoneTopBar` (điện thoại) đọc danh tính, theme,
  handler menu qua `useShellAccount` — chỉ khác cách vẽ, đăng xuất / điều hướng không lệch nhau.
- **Thanh tab dựng từ registry, không hardcode**: Trang chủ (trang tĩnh khai ở `PATHS.HOME`) rồi `useAppMenu().modules`
  đã lọc quyền; quá 5 mục widget tự gom vào ô "Thêm". Hồ sơ / Cài đặt vào bằng avatar, không chiếm ô.
- **Nút đổi theme rời của Header không còn ở điện thoại**: nó thành mục "Giao diện sáng / tối" trong sheet tài khoản
  (`extraMenuOptions`, ẩn ở chế độ TV); "Ẩn thanh Dock" và "Kiểu header" vô nghĩa ở đó nên không đưa vào.
- **Tên dự phòng của top bar = `meta.title` của route sâu nhất** (`resolvePageTitle`); trang có `<PageHeader>` thì tên của
  trang thắng (ô `title`), nên route chi tiết đặt được tên bản ghi.

## layouts/useRouteScrollRestoration

- **Ghi vị trí bằng sự kiện `scroll`** vào Map cấp module theo `scope:location.key` (sống qua lần layout dựng
  lại); không đọc lúc dọn effect — khi đó DOM đã là trang mới, `scrollTop` đã bị kẹp.
- **Không dùng `<ScrollRestoration>` của React Router**: nó chỉ cuộn `window`, mà `body` khoá cuộn — vùng cuộn thật
  là `<main>` (trong khung) và `RootLayout` (ngoài khung), mỗi vùng một `scope`.
- **Chỉ đổi `?search` / `#hash` thì giữ vị trí**: bộ lọc / tab trên URL không phải "sang trang mới".

## guards

- **`unavailable` ≠ chưa đăng nhập.** `AuthGuard` hiện `SessionUnavailablePage` và giữ nguyên URL; đá
  về `/login` vì backend đang khởi động lại là bắt người dùng đăng nhập lại một phiên còn sống.
- **Cả hai guard đi qua `useSessionGate`** (gọi `useRestoreSession`): mở thẳng `/login` thì `AuthGuard` chưa từng
  mount nên `GuestGuard` cũng phải tự khôi phục phiên. Chờ ở `pending` để F5 không nháy màn đăng nhập.
- **Kiểm đăng nhập tắt → `open`, không gọi refresh:** chế độ demo không có backend (gọi là có một request
  đỏ ở mọi lần tải trang); trang khách vẫn xem được để trình diễn form.
- **Sau `logout()` không ai `navigate`** — `AuthGuard` thấy `signed-out` và tự về `/login`; hai nơi cùng
  điều hướng thì lệch nhau về `replace` / đích quay lại. Đăng xuất chủ động không ghi đích quay lại.
- **`return-path` phân tích bằng `URL`, không so chuỗi:** `//evil.com` và `/\evil.com` đều bắt đầu bằng
  `/` nhưng trình duyệt đọc thành máy chủ khác.

## router/sync

- **Mỗi `location.key` chỉ cho URL thắng store MỘT lần** (`DisplayUrlSync`); sau đó store thắng và URL
  được viết lại cho khớp.
- **URL ghi vào store bằng `applyDisplayOverrides` (một lần cho cả `mode` + `uiScale`)**: ghi hai bước thì
  có một khung hình vẽ ở trạng thái nửa vời.
- **`selectIsTv` / `selectEffectiveUiScale` được subscribe chỉ để effect chạy lại khi store đổi;** giá trị
  dùng thật đọc bằng `getState()` trong effect (`nextDisplaySearch(location.search, state)`).
- **`navigate` dùng `replace` và giữ `hash` + `state`:** không tạo mục lịch sử mới, không làm mất
  `state.from` mà guard đăng nhập cần.
- **`DocumentTitleSync`:** `search` đổi ở mỗi lần gõ tìm kiếm nên `title` được memo; `document.title` chỉ
  ghi khi chuỗi kết quả đổi.
- **`RouteAnnouncer` ghi câu báo bằng "chỉnh state theo prop" trong render** (so `pathname` đã báo), không
  bằng effect: lần tải đầu giữ rỗng, đổi `?search` không đọc lại; vùng `aria-live` có sẵn từ đầu để trình đọc bắt.

## components

- **`app/components` = màn dùng chung KHÔNG phụ thuộc router** (`LoadingScreen`, `ErrorScreen`, `ErrorBoundary`,
  `describeError`); lỗi HTTP của React Router do `router/components/RouteErrorScreen` tự mô tả.
- **Một `ErrorBoundary` cho cả hai chỗ:** bọc cả cây ở `App` và bọc từng trang ở `LazyLoad`; `label` chỉ
  để phân biệt hai chỗ trong log. Mọi log lỗi giao diện đi qua `logAppError` với tiền tố `[giao diện]`.
- **`LoadingScreen level="app"` là màn chờ ngoài khung duy nhất:** Suspense ngoài cùng của `App` và hai
  guard cùng dùng nó nên chuyển từ chờ tải sang chờ khôi phục phiên không đổi hình.
- **`ErrorScreen` dùng điều hướng CỨNG** (`location.reload` / `assign`): cây React vừa ném lỗi, không tin nó dựng
  lại nổi bằng điều hướng client. Ô icon cùng khuôn ô icon `EmptyState` (viền tint + hai ngoặc góc), màu theo lỗi.
- **Lỗi tải chunk nêu cả hai nguyên nhân** (mất mạng, bản mới vừa triển khai) vì cùng một thông báo lỗi.
  Production chỉ hiện câu thân thiện; `showDetail` (mặc định chỉ ở dev) mới hiện thông điệp kỹ thuật.
- **Lỗi chunk tự tải lại MỘT lần**: cờ là thời điểm tự tải lại, chặn 60 giây (đủ cho mạng chậm); màn lỗi vẫn
  render phòng khi việc tải lại bị chặn (`beforeunload` của form chưa lưu) — kẹt ở màn chờ thì không lối ra.

## router/components

- **Ranh giới quanh trang phải xoá lỗi khi `resetKey` đổi** (`LazyLoad` truyền `pathname`): React Router
  render mọi trang ở cùng một vị trí trong cây nên ranh giới được dùng lại cho trang kế tiếp.
- **Có lỗi hay không do cờ `hasError`, không do giá trị `error`:** React cho ném cả `null` / `undefined`,
  so `error === null` thì ranh giới dựng lại đúng con vừa ném.
- **`LazyLoad` memo PHẦN TỬ trang** (`useMemo(<Page/>)`): vỏ đọc `useLocation()` để xoá
  lỗi theo `pathname` nên vẽ lại ở mọi lần đổi URL; giữ nguyên phần tử thì trang không vẽ lại theo.
- **`RouteErrorScreen` không phải ranh giới lỗi** mà là `errorElement` của route gốc: React Router tự bắt
  lỗi ở guard, layout, header rồi render nó.

- **`LazyLoad` KHÔNG có `Suspense`, ranh giới chờ nằm ở layout**: đo trên trình duyệt (chunk giả chậm 600ms), đổi từ `/settings`
  sang `/demo` hiện màn chờ ngay vì trang đích nằm sâu hơn một tầng (module có route con) → ranh giới `Suspense` MỚI. Với một
  ranh giới đã hiện ở layout, React giữ trang cũ tới khi trang mới tải xong (không màn chờ, `<header>` / `<main>` không dựng lại).
  Test `lazy-load` dựng đúng ca "trang đích sâu hơn" — dựng hai trang cùng độ sâu thì dùng lại ranh giới nên xanh giả.

## router/setup

- **`appRoutes` gồm cả route gốc:** `DocumentTitleSync`, `RouteAnnouncer`, `DisplayUrlSync` đứng cạnh `RootLayout`
  để phủ cả trang ngoài `AuthGuard`; `errorElement` ở đó là lưới đỡ cuối. Test dựng `createMemoryRouter(appRoutes)`.
- **Router trình duyệt dựng LƯỜI trong `AppRouter`** (`useState(() => createBrowserRouter(appRoutes))`): dựng lúc
  import thì mọi test import hàm thuần của router đều ngầm tạo router. Không `dispose()` trong effect (StrictMode).

## router/definition · router/modules

- **`definition/` THUẦN** (kiểu, `lazyPage`, `route-tree.utils`, `route-handle.utils`): không import guard / component;
  phần dựng `RouteObject` (cần `LazyLoad`, `PermissionGuard`) ở `setup/build-routes.tsx`.
- **`lazyPage().preload()` giữ PROMISE, không giữ module**: `React.lazy` nhận cùng promise nên không tải hai
  lần; promise hỏng bị quên ngay (rê chuột lúc mất mạng không làm hỏng lần mở trang sau).
- **`validateModules` (`modules/validate-modules.ts`) chạy trên `flattenModule()`**, mỗi luật một hàm `check…`;
  path chỉ "giữ chỗ" khi nó và mọi tầng cha hợp lệ, để một path sai không kéo theo loạt lỗi trùng giả.

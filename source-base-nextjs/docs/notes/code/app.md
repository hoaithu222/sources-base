# Ghi chú code — app (`src/app/`, `src/proxy.ts`)

> Lý do thiết kế KHÔNG hiển nhiên của `src/app/` (route, `_providers`, `_guards`, `_navigation`, `_layouts`, `_shell`, `_views`, `_components`, `_seo`)
> và `src/proxy.ts`, tách khỏi code theo `comment-policy.md §3`. Mỗi mục ≤ 6 gạch; chỉ ghi điều code không tự nói và rule
> chung chưa có. Route + cấu hình điều hướng: `routing-conventions.md`. Ranh giới server / client: `server-client-boundary.md`.
> Trang xác thực: `notes/code/auth.md`. Hướng dẫn làm việc thường gặp: `guides/app-layer.md`.

## bootstrap

- **Điểm lắp ráp duy nhất.** `core/http` không biết store, `domains/session` không biết cache của
  React Query, cả hai không biết toast — `bootstrapApp()` (`_providers/bootstrap.ts`) đưa cho mỗi bên đúng thứ nó cần qua tham số.
- **`queryClient.clear()` khi phiên kết thúc hoặc đổi người**: không dọn thì người đăng nhập sau thấy dữ liệu
  người trước (`invalidateQueries` vẫn giữ dữ liệu cũ). Chỉ nghe MỘT nguồn — `onSessionEnd`, kể cả `switched`.
- **`resetProgressCenter()` chạy cùng nó**: hàng đợi tải lên và thẻ tác vụ là state của tài khoản. Chỉ bỏ phía trình duyệt —
  việc máy chủ đã nhận (nhập Excel…) vẫn chạy tiếp.
- **401 không toast theo từng query.** Phiên chết thì cả loạt query cùng hỏng; chỉ có MỘT thông báo
  "phiên hết hạn" ở `onSessionEnd('expired')` (`onSessionExpired` do `SessionBootstrap` truyền vào, đã dịch).
- **`bootstrapApp()` trả disposer và idempotent**: gọi trùng trả cùng hàm dừng; test gọi disposer trước lượt kế. Một bước khởi tạo lỗi thì
  listener đã đăng ký được dọn để thử lại được. Zod locale và thông điệp lỗi HTTP theo ngôn ngữ KHÔNG ở đây — `LocaleSync`.

## providers

- **Provider chia HAI tầng.** `BaseProviders` (nạp store đã lưu + áp giao diện) ở root layout cho MỌI trang; `AppProviders` (React Query, phiên,
  toast, biểu đồ) chỉ ở `(workspace)/layout.tsx`. Trang marketing là thứ công cụ tìm kiếm chấm điểm Core Web Vitals — không để nó tải
  React Query, Zustand phiên, Recharts.
- **`StoreHydration` nạp store `persist` MỘT lần sau hydrate** (`useLayoutEffect` → `rehydratePersistedStores()`): store bật
  `skipHydration: true` vì nạp localStorage lúc tạo store làm lần render đầu khác HTML server (lỗi hydration). Nó đứng TRƯỚC `{children}` nên
  layout effect của nó chạy trước mọi effect của cây con — gate và widget thấy state thật ngay lần effect đầu.
- **`LocaleSync` đẩy ngôn ngữ vào hai chỗ KHÔNG đi qua React**: câu lỗi của tầng HTTP (`configureErrorMessages`) và locale Zod toàn cục
  (`configureZodLocale`). Zod giữ cấu hình ở biến toàn cục nên chỉ gọi ở trình duyệt — server không bao giờ gọi (cấu hình toàn cục sẽ rò giữa các request khác ngôn ngữ).
- **`getQueryClient()`: server tạo client MỚI mỗi lần gọi, trình duyệt dùng MỘT client**: server dùng chung một client là rò dữ liệu giữa người
  dùng; trình duyệt tạo lại mỗi render là mất cache. Mẫu chính thức của TanStack Query cho App Router.
- **`AppOverlays` chứa toast và tiến trình; command palette thuộc `AppShellLayout`** nên phím tắt điều hướng chỉ có trong vùng làm việc, không
  xuất hiện ở trang khách hoặc trang công khai.
- **`DisplayUrlSync` bọc `<Suspense fallback={null}>`** trong `AppProviders`: nó đọc `useSearchParams`, không bọc thì mọi route dưới `(workspace)` mất SSG.

## providers/appearance

- **Hai lớp áp giao diện, vì server không biết localStorage.** `appearanceInitScript()` (`domains/preferences/appearance-script.ts`) là chuỗi JS đồng bộ trong
  `<head>` áp theme / TV / màu nhấn / cỡ chữ đã lưu lên `<html>` TRƯỚC lần vẽ đầu (không nháy sáng → tối); `AppearanceSync` giữ nó đúng về sau. Script PHẢI
  khớp `applyAppearance` — test chạy script rồi so kết quả.
- **`AppearanceSync` đợi `usePersistedStoresHydrated()`** mới ghi: trước đó store còn mặc định, ghi lúc này là xoá giao diện script vừa áp bằng giá trị mặc định.
- **`applyAppearance` nhận giá trị ĐÃ HIỆU LỰC** (`useEffectiveTheme`, `selectEffectiveUiScale`) và chỉ ghi DOM — luật "TV ép tối, scale chỉ có ở TV" nằm
  một chỗ trong domain. URL `?display` / `?scale` hợp lệ thắng lựa chọn đã lưu ở CẢ script lẫn `DisplayUrlSync` (cùng `readDisplayOverrides`).
- **`theme-color` ghi lại từ token `--color-bg-page` mỗi lần áp**: `viewport.themeColor` (`core/seo`) chỉ có hai giá trị theo `prefers-color-scheme` của HĐH, nên theme app
  khác HĐH thì thanh trạng thái lệch màu; token rỗng (CSS chưa nạp) thì bỏ qua.
- **`<html suppressHydrationWarning>`** vì script đổi class / style của chính `<html>` trước khi React hydrate — chỉ tắt cảnh báo ở đúng phần tử này.

## layouts

- **Root layout (`[locale]/layout.tsx`) KHÔNG khoá cuộn.** Trang công khai cuộn tài liệu (anchor, thanh địa chỉ mobile thu gọn, Lighthouse đúng); chỉ `AppShellLayout` khoá
  `h-dvh overflow-hidden` và cuộn trong `<main>`. Bản Vite khoá `body` cho cả app — với trang SEO nó làm hỏng cả ba thứ trên.
- **`(public)/layout.tsx` là Server Component thuần** (header + `<main>` + footer, `useTranslations` bản server): không React Query, không phiên → ít JS nhất. Link "Bỏ qua tới nội dung"
  đứng đầu layout (WCAG 2.4.1).
- **`AppShellLayout` là khung ứng dụng thật** (Header, `<main>` cuộn, Dock, bảng lệnh, `HeaderSlotsProvider`, phím thoát TV) — không có prop bật / tắt vùng. Nó là Client
  Component duy nhất của khung; trang bên trong vẫn là Server Component vì đi qua `children`.
- **Viền / bóng của header do chính `Header` vẽ theo kiểu** (sáng: thanh NỔI — `glass` viền bắt sáng `rim-glass` + bóng,
  `brand` `rim-tile` + bóng mềm; tối: vạch `inset` đáy) — layout không vẽ thêm đường nào (hai vạch sát nhau đọc ra viền
  dày lệch màu).
- **Dock ghim — chỗ chừa theo LOẠI TRANG** (`useDockReserveClass`, ghép SAU `SHELL_*`): trái / phải KHÔNG chừa (Dock dọc + thanh lịch sử thẻ
  nổi đè, người dùng muốn nội dung trọn bề ngang); đáy: trang trôi
  đệm 80px (cuộn qua dải Dock rồi dừng trên nó), trang khoá cao (`data-page-shell="scroll"`, `:has()` trên `<main>`) CAO TRỌN
  MÀN — dải xám trống hai bên Dock là chỗ phí. Đổi lại Dock đè lên đáy khối, nên `useDockOverlap` đo vỏ Dock THẬT
  (`.dock-shell`) và ghi `--dock-overlap` (phần lấn + 8px) lên vùng cuộn `[data-dock-aware]` nằm dưới nó — CHỈ khi nội
  dung dài hơn vùng (`Table`, `PageBody` cuộn chừa cuối để dòng cuối cuộn lên trên Dock). Nội dung vừa khung LẤP TRỌN tới
  đáy, Dock nổi giữa dải đáy: không thu khối lên (để dải trống hai bên Dock là phí — người dùng muốn thông tin ở đó). Chỉ vùng cao CỐ ĐỊNH nằm trọn trong màn (vùng cao theo nội dung
  mà thêm đệm sẽ tự cao thêm → vòng lặp). Tự ẩn / thu gọn / ẩn: không chừa, không đo.
- **`AuthLayout` dùng `my-auto` (không `justify-center`)** trong vùng cuộn của khoang form: form ngắn thì nằm
  giữa, form dài hơn khoang thì đầu form vẫn cuộn tới được.

## layouts/app-shell-layout.css · auth-layout.css

- **Nền, gradient và mask của layout nằm ở file CSS cạnh layout**, do chính layout import, trong
  `@layer components` để utility vẫn thắng. JSX giữ cấu trúc và utility bố cục.
- **`.app-background` đổi theo theme bằng BIẾN** (`--app-wash`, `--app-grid-line`, `--app-glow-*` đè ở `.dark`): sáng KHÔNG
  lưới — wash `primary-2` 320px ở đỉnh + quầng thương hiệu nhạt; tối lưới teal + ba quầng. `StatusView` dùng lại cho trang
  trạng thái.
- **`.auth-*`: sáng là thẻ trắng + viền + bóng mềm; `.dark .auth-*` giữ kính teal.** Đốm chạy viền, vạch quét,
  điểm sáng và ngoặc góc màn chỉ `dark:block` (ẩn hẳn thì animation vô hạn cũng không chạy).

## views

- **`page.tsx` mỏng, view ở `_views/`**: `page.tsx` phải là Server Component để có `generateMetadata`; view (form, store, tương tác) là Client Component. View tĩnh (`LandingView`,
  `AboutView`, `ForbiddenView`) KHÔNG directive — render ở server, chữ qua `useTranslations` bản server.
- **`StatusView` (403, 404, mất kết nối)**: nút "Quay lại / Về trang chủ" là phần con riêng (`StatusNavActions`, dùng router hook) nên view truyền `children` không nạp phần client
  này và khung vẫn render được ở server. Trang đứng ngoài mọi layout: gốc là `<main>`, tiêu đề `<h1>` cỡ chữ h3.
- **`StatusView` tự import `app-shell-layout.css`** (nguồn `.app-background`): layout lazy chưa tải thì trang trạng thái
  vẫn có nền. Mã trạng thái mỗi ký tự một ô số (`aria-hidden`); con số thật đọc qua `sr-only`.
- **`PermissionGate` hiện `ForbiddenView` TẠI CHỖ** (giữ URL) thay vì chuyển sang `/403`: F5 / gõ lại vẫn đứng đúng chỗ và quyền đổi giữa chừng phản ứng ngay; `/403` là trang đứng riêng cho đường dẫn trực tiếp.
- **`DashboardView` · `ProfileView` cùng công thức `SectionHeader accent` + `Surface` / `InsetGroup` chia dòng `divide-y`**
  (`color-usage-guide.md §15`); bàn làm việc dựng từ `useAppMenu()` nên thêm phân hệ là có thẻ, "Mở gần đây" lấy từ `useWorkTabsStore`.
- **`SettingsView` theo System Settings của macOS**: hộp nhóm `InsetGroup` một cột giữa trang (Ngôn ngữ · Giao diện · Màn hình lớn ·
  Phím tắt); kiểm giá trị scale (`parseUiScale`) trước khi ghi store. Nhóm "Phím tắt" liệt kê phím toàn app (`SETTINGS_SHORTCUTS` ở `settings/settings.constants.ts`) để người dùng TỰ khám phá —
  thêm phím toàn app thì thêm dòng ở đó + khoá `account.settings.shortcuts.items.<id>`.
- **`ModuleHomeView` là trang chủ CHUNG của mọi phân hệ** (đặt làm `page.tsx` của gốc phân hệ): dựng từ `useActiveModule` + `screens` (`icon` / `description`), nên phân hệ mới không viết trang chủ
  riêng; thẻ là `<Link>` thật. Màn đầu tiên của `screens` là gốc nên KHÔNG thành thẻ.
- **`DemoLibraryView` là catalog component cho dev, không phải ảnh chụp**: `/demo` chỉ có ở chế độ demo (bản `app` `notFound()`), `noindex`. View ghép `CatalogToc` (mục lục + ô tìm IME-safe) với mỗi nhóm một `<Id>Catalog` (`demo/catalog/entry/` · `display/`); mỗi `<Id>Catalog` tự bọc `CatalogSection` (tiêu đề, một câu "dùng khi nào", dòng import, file nguồn, tài liệu) và bày từng trạng thái bằng `CatalogState`.
- **Tra cứu của catalog là DỮ LIỆU, không phải chuỗi gõ tay** (`catalog/data/catalog.constants.ts`): dòng import dựng từ `{ from, names }` nên `tests/app/_views/demo-catalog-data.test` kiểm mọi tên là export thật của `@/shared/ui` / `@/shared/hooks` và mọi đường file / tài liệu tồn tại; lọc theo ô tìm bỏ luôn cả mục lẫn dòng mục lục nên neo `#catalog-<id>` luôn có đích. Thêm nhóm: id vào `CATALOG_GROUP_ORDER` + một khoá ở `CATALOG_GROUPS` + hai khoá `demo.groups.<id>` + một dòng ở view.
- **Ví dụ chạy đúng app providers và phải ổn định giữa server / client**: ngày mẫu dựng `new Date(y, m, d)` (không `new Date()` — HTML SSG lệch hydration), định dạng ngày truyền theo ngôn ngữ vì picker mặc định `DD/MM/YYYY`; dữ liệu mẫu chỉ có tên Latin không dấu, nhãn đi qua `demo.json`. Namespace `demo` nằm trong `CLIENT_NAMESPACES` nên đi xuống MỌI trang — giữ khoá ngắn; gỡ demo thì gỡ cả `demo.json` + hai `index.ts` + dòng đó.
- **Catalog KHÔNG nhân đôi `features/customers`**: màn ghép Form + Table + Dialog + bộ lọc thực chiến nằm ở `/demo/customers`; catalog chỉ trỏ tới (khối thông tin đầu trang) và minh hoạ từng mảnh. Thư viện demo đầy đủ của bản Vite chưa chuyển sang — nhóm chưa có catalog: `docs/known-issues.md`.

## layouts/AppShellLayout.tsx — khung điện thoại

- **Điện thoại (`useIsPhone()`) đổi Header → top bar, Dock → thanh tab đáy**; hai thanh nằm TRONG luồng `h-dvh flex-col`
  (không `fixed`) nên `<main>` tự co, không phải chừa đáy bằng số rời rạc.
- **Máy ≥ 768px vẫn là Dock**: khi ghim, `<main>` có đệm ở cạnh neo (`!isPhone && dockReserveClass`); vỏ điện thoại không
  có Dock nên không chừa gì thêm (thanh tab nằm trong luồng).
- **Lề `<main>` cộng `SHELL_SAFE_INSET_X`** (không hẹp hơn `--safe-l` / `--safe-r`): iPhone xoay ngang có tai thỏ; laptop
  `--safe-*` = 0 nên vẫn 16px.
- **`AppShellLayout` chọn Header / top bar theo `useIsPhone()` — an toàn ở chế độ `app` vì server chưa dựng nó**: `AuthGate` chỉ dựng màn chờ ở server, khung chỉ mount ở client nên hook đọc `matchMedia` ngay lúc khởi tạo mà không lệch hydration.
  ⚠️ Chế độ demo (gate `open`) server dựng luôn khung → trên điện thoại lần hydrate đầu có thể lệch HTML server. Cây có SSR (trang công khai, trang khách) thì đổi class bằng CSS (`phone:`), không rẽ JSX theo hook.

## layouts/AuthLayout.tsx · views/status · components/ErrorScreen.tsx — điện thoại

- **`AuthLayout` một cột, khoang thương hiệu chỉ còn logo + tên**: tiêu đề, sơ đồ, danh sách đẩy ô đăng nhập xuống
  ~900px; thẻ neo ĐỈNH (`items-start`) để bàn phím ảo không đẩy ô nhập khuất.
- **`ErrorScreen level="app"` · `StatusView` tự CUỘN** (`h-dvh overflow-y-auto` + `items-center-safe`): khung `min-h-dvh` thấp hơn nội dung (phone xoay ngang) cắt mất nút;
  canh giữa thường thì phần đầu tràn lên không cuộn tới được.

## shell — AppPhoneTopBar · AppTabBar · useShellAccount

- **Hai vỏ, MỘT nguồn dữ liệu**: `AppHeader` (laptop / tablet) và `AppPhoneTopBar` (điện thoại) đọc danh tính, theme,
  handler menu qua `useShellAccount` — chỉ khác cách vẽ, đăng xuất / điều hướng không lệch nhau.
- **Thanh tab dựng từ cấu hình điều hướng, không hardcode**: Bảng điều khiển (trang tĩnh khai ở `PATHS.DASHBOARD`) rồi `useAppMenu().modules`
  đã lọc quyền; quá 5 mục widget tự gom vào ô "Thêm". Hồ sơ / Cài đặt vào bằng avatar, không chiếm ô.
- **Nút đổi theme rời của Header không còn ở điện thoại**: nó thành mục "Giao diện sáng / tối" trong sheet tài khoản
  (`extraMenuOptions`, ẩn ở chế độ TV); "Ẩn thanh Dock" và "Kiểu header" vô nghĩa ở đó nên không đưa vào.
- **Tên của top bar = `useScreenTitle()?.title`** (rơi về `APP_NAME` khi URL không thuộc mục menu nào); trang có `<PageHeader>` thì tên của trang thắng (ô `title`), nên view chi tiết đặt được tên bản ghi.

## shell — AppHeader · useHeaderModules

- **Phân hệ của header đọc CÙNG `useAppMenu().modules` với Dock và bảng lệnh**: đã lọc quyền (cả cây `nav`, nhóm rỗng sau
  lọc thì bỏ) nên mục nào hiện là bấm vào được; không có danh sách phân hệ thứ hai.
- **`MenuItem.nav` dựng từ `screens` trong `buildMenu`**; `useActiveModule` (`_navigation/`) chỉ chọn theo URL: phân hệ đang mở = phân hệ có gốc chứa `pathname`; màn hình = `href` DÀI NHẤT khớp
  theo phân đoạn; CẤP 0–3 + `backHref` suy ra từ đó. Một nguồn cho header (đổi cấp), `ModuleHomeView` và Dock.
- **Ô tìm dạng field + phím tắt ở chân launcher dùng chung `COMMAND_PALETTE_SHORTCUT_LABEL`**: nhãn phím ở ô tìm, tooltip và
  launcher không lệch nhau.
- **Ô thương hiệu là logo VCI trên VIÊN trắng** (`BRAND_MARK`): logo nhiều màu chỉ giữ đúng màu trên nền trắng, ở cả
  gradient `brand` lẫn kính `glass`; đổi logo = thay `src/assets/image/logo-vci.svg` + `public/favicon.svg`. Chip ngữ cảnh
  chỉ có ở demo (dự án thật truyền công ty / chi nhánh đang chọn).
- **`AppWorkTabs` đẩy màn đang mở vào store TRƯỚC khi vẽ** (`useLayoutEffect`): khung hình đầu của màn mới đã có ô của nó trên thanh; bọc `<Suspense>` vì đọc `useSearchParams`.

## navigation

- **Cấu hình MÔ TẢ, không SINH route.** Bản Vite khai route trong registry và dựng `RouteObject`; Next đã có hệ thống file, nên `navigation.config.ts` chỉ nói cho menu biết có mục nào.
  Hệ quả: path khai mà thiếu `page.tsx` là menu dẫn tới 404 (`tests/app/navigation.test.ts` bắt), quyền khai mà thiếu `PermissionGate` là menu ẩn nhưng URL vẫn vào được — nên quyền khai ở HAI nơi, giữ khớp.
- **`buildMenu` THUẦN** (cấu hình + `labelOf` + người dùng → `{ pages, modules }`): chữ vào qua tham số nên test được không cần provider next-intl; `useAppMenu` chỉ là lớp nối `useTranslations('shell.nav')` + `selectUser`.
- **`permissions` cộng dồn tới màn hình** (quyền phân hệ + quyền màn) và lọc bằng `canAccess` — cùng luật với `PermissionGate` / `usePermission`. `permission` bỏ trống = chỉ cần đăng nhập (khác bản Vite: mặc định `<id>:view`).
- **`useAppMenu` đọc `t.has` để `subtitle` / `description` tuỳ chọn**: khoá không khai thì bỏ, không ném lỗi thiếu chuỗi; `t.has` nhận chuỗi tự do nên ép kiểu một chỗ.
- **`screen-title.utils` khớp theo tiền tố PHÂN ĐOẠN và lấy mục SÂU NHẤT** (`/demo/x` thuộc màn `/demo`); chỉ phục vụ top bar điện thoại và thẻ làm việc — `<title>` của tab do `generateMetadata` lo.
- **`DisplayUrlSync`: mỗi URL (`pathname?search`) mới chỉ cho URL thắng store MỘT lần** (`appliedUrlRef`); sau đó store thắng và URL được viết lại cho khớp. URL ghi vào store bằng
  `applyDisplayOverrides` (một lần cho cả `mode` + `uiScale`) — ghi hai bước thì có một khung hình vẽ ở trạng thái nửa vời. `selectIsTv` / `selectEffectiveUiScale` được subscribe chỉ để effect chạy lại
  khi store đổi; giá trị dùng thật đọc bằng `getState()`. `router.replace(…, { scroll: false })` không tạo mục lịch sử, không cuộn.
- **`public-routes.ts` là dữ liệu thuần, ngoại lệ của luật barrel** (`robots.ts` / `sitemap.ts` import thẳng, không kéo hook client); `PUBLIC_ROUTES` và `PRIVATE_PATHS` không giao nhau (test).

## layouts/useRouteScrollRestoration

- **Ghi vị trí bằng sự kiện `scroll`** vào Map cấp module theo `scope:pathname` (sống qua lần layout dựng lại, vd ra 403 rồi Back); không đọc lúc dọn effect — khi đó DOM đã là trang mới, `scrollTop` đã bị kẹp.
- **Không dùng bộ khôi phục cuộn mặc định của Next**: nó chỉ cuộn `window`, mà vùng làm việc khoá viewport — vùng cuộn thật là `<main>`.
- **Back / Forward nhận diện bằng sự kiện `popstate`**: App Router không cho biết kiểu điều hướng, mà `popstate` chỉ phát khi bấm Back / Forward và tới TRƯỚC lần đổi `pathname` — đủ để đánh dấu "lần đổi này là POP" rồi khôi phục thay vì về đầu.
- **Chỉ đổi `?search` / `#hash` thì giữ vị trí**: bộ lọc / tab trên URL không phải "sang trang mới" (chỉ `pathname` đổi mới tính).

## guards

- **Hai lớp, không gộp.** `src/proxy.ts` chặn SỚM ở server: route khớp `PROTECTED_PATH_PREFIXES` mà không có cookie phiên → `/login?next=…` (người lạ không nhận HTML riêng tư; chỉ kiểm cookie CÓ MẶT, không kiểm chữ ký — việc của BE).
  `AuthGate` lo phần proxy không biết: cookie hết hạn, phiên bị thu hồi, đăng xuất từ tab khác.
- **Proxy cố ý KHÔNG chặn trang khách**: chuyển người đã đăng nhập đi do `GuestGate`. Nếu proxy làm việc đó, cookie còn mà phiên hỏng (đã hết hạn) sẽ gây vòng lặp `/login` ⇄ `/dashboard`.
- **Proxy không import `server-only` / `server-config`** (không chạy ở điều kiện `react-server`): đọc env bằng `parseAppEnv` / `parseServerEnv`. Matcher bỏ qua `/api`, `_next`, file có đuôi — đường mới cần bỏ qua thì sửa matcher.
- **`unavailable` ≠ chưa đăng nhập.** `AuthGate` hiện `SessionUnavailableView` và giữ nguyên URL; đá
  về `/login` vì backend đang khởi động lại là bắt người dùng đăng nhập lại một phiên còn sống.
- **Cả hai gate đi qua `useSessionGate`** (gọi `useRestoreSession`): mở thẳng `/login` thì `AuthGate` chưa từng
  mount nên `GuestGate` cũng phải tự khôi phục phiên. `pending` ở `AuthGate` chờ (F5 không nháy màn đăng nhập), ở `GuestGate` hiện form ngay — người chưa có cookie (đa số) thấy form từ HTML server (LCP nhanh).
- **Kiểm đăng nhập tắt → `open`, không gọi refresh:** chế độ demo không có backend (gọi là có một request
  đỏ ở mọi lần tải trang); trang khách vẫn xem được để trình diễn form; proxy cũng không chặn.
- **Sau `logout()` không ai điều hướng** — `AuthGate` thấy `signed-out` và tự về `/login`; hai nơi cùng
  điều hướng thì lệch nhau về `replace` / đích quay lại (ESLint `guard/login-redirect`). Đăng xuất chủ động không ghi đích quay lại.
- **Server luôn dựng màn chờ của `AuthGate`** (phiên chưa biết) nên HTML tĩnh của `(app)` không mang dữ liệu riêng tư và route vẫn SSG; đừng kiểm phiên bằng `cookies()` / `headers()` ở layout — route thành động.
- **Đích quay lại là `?next=`, không còn `location.state`**: `createReturnPath` / `resolveReturnPath` (`shared/utils/url/return-path.utils.ts`) dùng chung cho proxy (không có `state`), `AuthGate` và `GuestGate`; sống qua F5 và chia sẻ link được.
  Phân tích bằng `URL`, không so chuỗi: `//evil.com` và `/\evil.com` đều bắt đầu bằng `/` nhưng trình duyệt đọc thành máy chủ khác.
- **`PermissionGate` đặt BÊN TRONG `AuthGate`, không kiểm đăng nhập**, dùng `usePermission` (cùng `canAccess`). Quyền thật do BE kiểm trên từng API.

## components · route error files

- **`_components` = màn dùng chung** (`LoadingScreen`, `ErrorScreen`, `RouteErrorScreen`, `describeError`); `RouteErrorScreen` là thân của mọi `error.tsx` (`[locale]/error.tsx` level `app`, `(app)/error.tsx` level `content`).
  Không còn `ErrorBoundary` tự viết — `error.tsx` của Next thay nó, ranh giới tự xoá khi sang segment khác.
- **`LoadingScreen` không dùng hook trạng thái** nên render được ở server (`loading.tsx`); `level="app"` là màn chờ ngoài khung duy nhất — hai gate cùng dùng nó nên chuyển từ chờ tải sang chờ khôi phục phiên không đổi hình.
- **`ErrorScreen` dùng điều hướng CỨNG** (`location.reload` / `assign`): cây React vừa ném lỗi, không tin nó dựng
  lại nổi bằng điều hướng client. Ô icon cùng khuôn ô icon `EmptyState` (viền tint + hai ngoặc góc), màu theo lỗi.
- **Lỗi tải chunk nêu cả hai nguyên nhân** (mất mạng, bản mới vừa triển khai) vì cùng một thông báo lỗi.
  Production chỉ hiện câu thân thiện; `showDetail` (mặc định chỉ ở dev) mới hiện thông điệp kỹ thuật.
- **Lỗi chunk tự tải lại MỘT lần**: cờ là thời điểm tự tải lại, chặn 60 giây (đủ cho mạng chậm); màn lỗi vẫn
  render phòng khi việc tải lại bị chặn (`beforeunload` của form chưa lưu) — kẹt ở màn chờ thì không lối ra.
- **`global-error.tsx` tự dựng `<html>`, tự chọn chữ**: nó thay CẢ root layout nên không có `NextIntlClientProvider`; ngôn ngữ đoán từ tiền tố URL, chữ lấy thẳng từ `errors.json`. Chỉ chạy ở production (dev hiện overlay lỗi).
- **404 có hai tầng**: URL dưới `[locale]` không khớp → `[...rest]/page.tsx` gọi `notFound()` → `[locale]/not-found.tsx` (giữ layout + chữ đã dịch + HTTP 404 đúng); URL không qua `proxy.ts` (có đuôi file) → `global-not-found.tsx`
  hiện cả hai ngôn ngữ vì không biết ngôn ngữ.

## _seo

- **`generatePageMetadata` mặc định `noIndex = true`**: thêm trang mới không vô tình lọt vào Google; trang công khai phải chủ động `noIndex: false` + vào `PUBLIC_ROUTES`. Khoá `metadata.<key>` suy từ `messages` nên thiếu ngôn ngữ là `tsc` đỏ.
- **Chỉ chạy ở server** (`getTranslations`, `core/seo` đọc cấu hình server) — gọi từ `generateMetadata` của `page.tsx`, không từ view client.

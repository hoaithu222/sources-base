# Page Structure — trang, view, layout, shell (`src/app` và `src/features/*/views`)

> Trang chỉ **GHÉP**: lấy dữ liệu qua hook, lắp component UI kit, nối sự kiện. Mọi thứ khác
> có chỗ riêng. Với Next, một "trang" là HAI file: `page.tsx` MỎNG (Server Component: `generateMetadata` + ghép một view) và
> **view** (`XxxView.tsx` — chỗ ghép UI thật). Bổ sung `component-structure.md` (thứ tự file, bảng class, comment),
> `feature-structure.md` (folder của feature) và `server-client-boundary.md` (file nào có `'use client'`). Công thức bố cục trang
> (`PageShell` → `TitleScreen` → `Toolbar` → `PageBody`) và vì sao trang không tự đệm: `docs/architecture.md §8`.

---

## 1. Trang làm gì — và không làm gì

| Trang LÀM                                                                                                                                           | Trang KHÔNG làm → đặt ở                                                   |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Ghép UI kit theo công thức bố cục                                                                                                                   | Gõ tay lề / đệm / `min-h-dvh` ngoài khung → `PageShell`, `AppShellLayout` |
| Gọi hook dữ liệu / form / store (`useXxx`)                                                                                                          | Gọi API, `useEffect` fetch → `service/*.queries.ts`                       |
| Nối handler bằng `useCallback`                                                                                                                      | Logic nghiệp vụ, biến đổi dữ liệu → `hooks/`, `utils/`                    |
| Trạng thái loading / lỗi / rỗng bằng UI kit (`Spinner`, `Callout`, `EmptyState`)                                                                    | Schema Zod, hằng dài, cột bảng → `schemas/`, `constants/`, `columns.tsx`  |
| Lấy MỌI chữ hiển thị qua `useTranslations('<namespace>')` — chữ ở `messages/{vi,en}/*.json`, không default tiếng Việt cứng trong JSX / props        | Chuỗi tiếng Việt cứng trong JSX, `aria-label`, `placeholder`, toast (ESLint `guard/i18n-text` chặn) |
| Một route = `page.tsx` MỎNG + MỘT file view `XxxView.tsx`, `export default`; `page.tsx` chỉ có `generateMetadata` và ghép view                      | Hai view trong một file; logic / `useState` / handler trong `page.tsx`    |
|                                                                                                                                                     | `<button>/<input>/<table>` thô, hex màu, `text-sm` → UI kit + token       |

---

## 2. Thứ tự trong file view (cố định)

| #   | Mục                             | Ghi chú                                                                                                                                                                                                                                                                                                         |
| --- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Imports                         | thứ tự theo `code-style.md`                                                                                                                                                                                                                                                                                     |
| 2   | Types / Props                   | view do `page.tsx` ghép không nhận prop (trừ giá trị route động như `id`); chỉ có `interface` của phần con nội bộ (mục 4). KHÔNG JSDoc trên từng dòng của `XxxProps`                                                                                                                                              |
| 3   | Hằng của riêng view             | theo `clean-code-standards.md §2` (`SCREAMING_SNAKE_CASE`, chỉ file này dùng, ~≤ 10 dòng; dài / dùng ≥ 2 file → `constants/`). Object style / mảng tĩnh PHẢI hoist ở đây, không dựng lại mỗi render                                                                                                             |
| 4   | Phần con nội bộ                 | khối / hàng JSX lặp ≥ 2 lần trong file → phần con `memo` đặt NGAY TRÊN view (điều kiện: `clean-code-standards.md §1`). Lặp ở ≥ 2 file → `components/` (ở `src/app/_views`: folder nhóm view, vd `_views/status/StatusView.tsx`). Mỗi phần con có khối tài liệu riêng sát khai báo của nó                         |
| 5   | Khối tài liệu + component view  | khối tài liệu SÁT ngay trên dòng khai báo (không dòng trống ở giữa, `comment-policy.md §1`): dòng đầu `Tên — mô tả`, thêm điều không hiển nhiên về route / quyền / dữ liệu; `@param props.<tên>` cho từng prop nếu có; KHÔNG bắt `@example`. Thân component theo luồng ở §3                                       |
| 6   | Export                          | `export default Xxx`                                                                                                                                                                                                                                                                                            |

Mục nào không có thì bỏ, KHÔNG đảo thứ tự các mục còn lại. Directive `'use client'` (nếu view cần) là dòng ĐẦU TIÊN của file, trước imports
(`server-client-boundary.md §2`): view có hook / state / form / handler thì có, view tĩnh chỉ `useTranslations` + component trình bày thì KHÔNG.

**`page.tsx` thì chỉ có ba thứ** (mẫu: `routing-conventions.md §2`): `generateMetadata` (qua `generatePageMetadata` của `@/app/_seo/page-metadata`),
`<Suspense>` nếu view đọc `useSearchParams`, và view. Không `'use client'`, không hook, không JSX layout.

---

## 3. Luồng trong component view

Từ trên xuống, không đảo:

1. Hook route / URL (`useQueryParams`, `useSearchParams`; `useRouter` / `usePathname` của `@/core/i18n`) và chữ (`useTranslations`)
2. Hook dữ liệu (`useXxxQuery`, `useXxxMutation`), hook form (`useZodForm`), store
3. Giá trị dẫn xuất (`useMemo` chỉ khi đo được cần)
4. Handler (`useCallback`)
5. Early return trạng thái đặc biệt: loading → lỗi → rỗng
6. JSX

- JSX chỉ **mô tả**: `.map` dài > 10 dòng, ternary lồng, IIFE → tách phần con hoặc biến.
- Hàng cấu hình giống nhau (nhãn + mô tả + control) → một phần con `SettingRow`, KHÔNG chép
  ba lần.
- Chuỗi class > một dòng hoặc dùng lại → hằng / bảng `*_CLASSES` + `cn()` (`component-structure.md §2`).
- Điều hướng có URL đích là `<Link href>` của `@/core/i18n` (`navigable-controls.md`) — không `next/link`, không prop `to`; tìm kiếm dùng
  `useImeSafeSearchInput` (`ime-safe-input.md`).
- Chữ hiển thị: `const t = useTranslations('auth.login')` rồi `{t('title')}` — thêm khoá vào CẢ hai ngôn ngữ (`../i18n/i18n.md`). Hằng
  danh sách trong view chỉ giữ `id` / `icon` / `tone`, chữ tra bằng `t(`${id}.title`)` — đừng đặt nhãn tiếng Việt trong mảng hằng.

---

## 3b. Tầng tên của trang — đã có `PageHeader` thì không `TitleScreen`

Một trang chỉ có MỘT tầng tên. Hai kiểu, chọn một:

| Trang                                                                                                       | Tầng tên                                                                           | Hành động của trang                                                                                       |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Có `<PageHeader>` (crumb tên + dòng phụ trên thanh header; tab của trang lên header từ `xl`, dưới `xl` là dải gạch chân trong trang) | CHỈ crumb tên trên header. **KHÔNG** dựng `<TitleScreen>` — nó lặp lại đúng tên đó | Cùng hàng với dải thẻ KPI, ở cuối hàng, **căn giữa theo chiều dọc** (`KpiActionRow`, dựng trên `Toolbar`) |
| Không có `PageHeader` (trang đứng riêng, vd 403 / hồ sơ)                                                    | `<TitleScreen>`                                                                    | Slot `actions` của `TitleScreen`                                                                          |

- Tên màn hình (vd "Tổng quan dự án") đi vào `subtitle` của `PageHeader`, không thành một hàng riêng. Crumb tên render `<h1>`
  — trang vẫn có heading cấp 1 cho trình đọc màn hình.
- Trang con của PHÂN HỆ đã có ở dải điều hướng phân hệ trên header (tự dựng từ `screens` của `NavModuleDef` trong
  `src/app/_navigation/navigation.config.ts` — `routing-conventions.md`); `PageHeader nav` chỉ dành cho tab TRONG một trang (`?tab=`).
- Tab của trang có HAI chỗ, cùng một dữ liệu `nav`, chia nhau đúng một mốc `xl` (1280px): **≥ `xl`** nhóm segmented TRÊN
  thanh header ngay sau crumb (portal vào ô `tabs` — nội dung trang lên sát header, không tốn một hàng) · **< `xl`** dải
  gạch chân trong luồng trang, ngay chỗ đặt `<PageHeader>` · điện thoại: dải chip cuộn ngang dưới top bar. Trang chỉ
  truyền `nav`, KHÔNG tự dựng tab ở chỗ khác. ← / → đi giữa các tab khi tiêu điểm ở nhóm tab.
- Trang chủ PHÂN HỆ (cấp 1) không viết tay: `page.tsx` của gốc phân hệ render `ModuleHomeView` (`src/app/_views/ModuleHomeView.tsx` —
  thẻ giới thiệu + lưới thẻ màn hình dựng từ `screens` của `NavModuleDef`, chữ ở `shell.json` `nav.<id>.description` — `guides/app-layer.md`).
- Trang không có dải KPI: hành động đặt ở `Toolbar` ngay đầu thân trang (`right` = hành động), cũng căn giữa dọc.
- Hành động của trang = xuất, thêm, đổi khoảng thời gian, làm mới, nhãn "Cập nhật lúc…". Bộ lọc của MỘT panel nằm ở
  header panel đó, không kéo lên hàng này.
- Hẹp (điện thoại): cụm hành động rớt xuống hàng riêng, canh phải — không bóp dải KPI.
- `PageHeader` cần `HeaderSlotsProvider` — chỉ `AppShellLayout` (vùng `(app)`) có; trang công khai / trang khách không có nên không dùng nó.
- Máy kiểm: `tests/policy/structure/page-title-layer.test.ts` — file ngoài kit chứa cả `<PageHeader` lẫn `<TitleScreen`
  là lỗi.

---

## 4. Layout, shell, provider, view (`src/app/_*`)

Mọi thứ lắp ráp nằm ở thư mục **private** (`_` đầu tên → Next bỏ qua khi định tuyến), mỗi thư mục một việc. Route thật là `src/app/[locale]/…`
(`routing-conventions.md §2`).

| Loại                                        | Việc của nó                                                                                        | KHÔNG làm                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Layout** (`_layouts/`)                    | Dựng khung quanh `children`; cấp lề / nền MỘT lần (`AppShellLayout`, `AuthLayout`, `public/`)      | Nghiệp vụ, dữ liệu, quyền                                                         |
| **Shell** (`_shell/`)                       | Nối widget (Header, Dock, bảng lệnh) với cấu hình điều hướng + phiên (`useAppMenu`, `useShellAccount`) | Danh sách path / tên thứ hai ngoài `navigation.config.ts` (`routing-conventions.md`) |
| **Provider** (`_providers/`)                | Dựng context toàn cục, mount phần tử gắn một lần (toast, nạp store, đồng bộ giao diện / ngôn ngữ)   | Render nội dung trang                                                             |
| **Gate** (`_guards/`)                       | `AuthGate` · `GuestGate` · `PermissionGate` — chặn ở phía trình duyệt (`routing-conventions.md §8`) | Gọi `router.push(PATHS.LOGIN)` ở nơi khác (ESLint `guard/login-redirect`)         |
| **Cấu hình điều hướng** (`_navigation/`)    | `NAV_PAGES` / `NAV_MODULES`, `useAppMenu`, `useActiveModule`, `public-routes`                   | Sinh route hay guard — nó chỉ mô tả                                               |
| **View dùng chung** (`_views/`)             | Nội dung trang tĩnh của app: chủ, bảng điều khiển, hồ sơ, cài đặt, giới thiệu, 403 / 404 / mất kết nối | View nghiệp vụ → `features/{f}/views/`                                         |
| **Màn dùng chung** (`_components/`)         | `LoadingScreen` · `ErrorScreen` · `RouteErrorScreen` · `LocaleSwitcher`                            | Phụ thuộc layout / route cụ thể                                                   |
| **SEO** (`_seo/`)                           | `generatePageMetadata` — `generateMetadata` một dòng cho trang thường                              | Gọi từ client (chỉ chạy ở server)                                                 |

- **Hai họ layout, hai mô hình cuộn — đừng lẫn:**
  - `(public)/layout.tsx` (marketing, SEO): **tài liệu cuộn tự nhiên** — `min-h-dvh` + header + `<main>` + footer; anchor, thanh địa chỉ
    mobile thu gọn, Lighthouse hoạt động đúng. Tĩnh (SSG), không React Query / phiên.
  - `AppShellLayout` (vùng làm việc `(app)`): **khoá viewport** — `h-dvh overflow-hidden`, document KHÔNG cuộn, chỉ `<main>` cuộn
    (`useRouteScrollRestoration` giữ vị trí cuộn theo route). `AuthLayout` (trang khách): thẻ hai khoang, khoang form tự cuộn.
  Trang trong vùng làm việc dùng `PageShell` / `PageBody` (nơi cuộn); trang công khai KHÔNG dùng `PageShell` khoá cao.
- **Provider chia hai tầng:** `BaseProviders` (nạp store đã lưu + áp giao diện) ở `[locale]/layout.tsx` cho MỌI trang; `AppProviders` (React Query,
  phiên, toast, biểu đồ) chỉ ở `(workspace)/layout.tsx` — marketing không tải chúng (`server-client-boundary.md §6`).
- Hai view trở lên cùng khung toàn màn (403, 404, mất kết nối…) → MỘT khung dùng chung (`StatusView`), mỗi view chỉ truyền nội dung đã dịch;
  các view cùng khung gom vào một folder nhóm (`_views/status/`).
- Layout / shell / provider theo `component-structure.md` §1–§5 (khối tài liệu, class thành hằng khi dài, luồng code); không cần bảng
  `skin × variant` nếu không có trục. Layout nhiều vùng gom class vào MỘT bảng `XXX_SLOT_CLASSES` khoá theo tên vùng (`AuthLayout`,
  `AppShellLayout`); phần con có trục (vd `level`) dùng `XXX_{TRỤC}_CLASSES`.
- CSS riêng của một layout (nền, gradient, mask — Tailwind không diễn đạt được) đặt CẠNH
  file layout và do chính layout import (`_layouts/app-shell-layout.css`, `_layouts/auth-layout.css`)
  — `css-architecture.md` §"Thêm CSS mới". Ngoại lệ có chủ đích: `_views/status/StatusView.tsx` cũng
  import `@/app/_layouts/app-shell-layout.css` để có nền `.app-background` khi render ngoài
  `AppShellLayout` (403 / 404 / mất phiên).

---

## 5. Folder

```
src/app/
├── [locale]/…       # route: page.tsx / layout.tsx MỎNG, nhóm (public) · (workspace)/(auth) · (workspace)/(app) — routing-conventions.md
├── _components/     # màn dùng chung: LoadingScreen · ErrorScreen · RouteErrorScreen · LocaleSwitcher (barrel `@/app/_components`)
├── _guards/         # AuthGate · GuestGate · PermissionGate · useSessionGate (barrel)
├── _layouts/        # AppShellLayout · AuthLayout (+ CSS cạnh layout) · public/ · auth/ · useRouteScrollRestoration · useDockOverlap
├── _navigation/     # navigation.config · useAppMenu · useActiveModule · public-routes (barrel)
├── _providers/      # BaseProviders · AppProviders · AppOverlays · bootstrap · query-client · appearance/ · sync/ (SessionBootstrap · StoreHydration · LocaleSync · DisplayUrlSync) (barrel)
├── _seo/            # page-metadata (generatePageMetadata)
├── _shell/          # AppHeader · AppDock · AppCommandPalette · AppPhoneTopBar · AppTabBar · AppWorkTabs (barrel)
└── _views/          # view trang chung: marketing/ (LandingView · AboutView) · DashboardView · ProfileView · SettingsView · ModuleHomeView · status/ · demo/
src/features/{f}/views/   # view nghiệp vụ (page.tsx mỏng ở src/app/[locale]/… import qua `@/features/{f}`) — cấu trúc feature: feature-structure.md
```

Mỗi folder ≤ 8 mục (`folder-structure.md`). View nghiệp vụ lớn có nhiều file đi kèm thì
thành tính năng con (`features/{f}/{con}/views|components|hooks`).

---

## 6. Checklist khi viết / sửa trang

- [ ] Một route = `page.tsx` mỏng (`generateMetadata` + ghép view, không `'use client'`) + một file view, `export default`
- [ ] Đúng thứ tự §2; khối tài liệu sát khai báo view (và từng phần con); không comment nào khác (`comment-policy.md`)
- [ ] `'use client'` chỉ khi view có hook / handler / store (`server-client-boundary.md`); view tĩnh KHÔNG đánh dấu
- [ ] Không gọi API / `useEffect` fetch / logic nghiệp vụ trong view
- [ ] Chữ hiển thị qua `useTranslations`, khoá có ở CẢ `messages/vi` lẫn `messages/en`; không default tiếng Việt cứng
- [ ] Không tự thêm lề; không raw HTML control; không hex, không `text-sm`
- [ ] Khối JSX lặp ≥ 2 lần đã thành phần con; object style tĩnh đã hoist
- [ ] Trạng thái loading / lỗi / rỗng dùng UI kit
- [ ] Trang đứng riêng (KHÔNG có `PageHeader`) có hàng tiêu đề màu (`TitleScreen`); trang CÓ `PageHeader` thì không `TitleScreen` và hành động nằm cùng hàng dải KPI, căn giữa (§3b)
- [ ] Mỗi khối có `SectionHeader accent` và thân có viền thấy được — công thức ở `color-usage-guide.md` §15
- [ ] Đọc `?query` bằng `useSearchParams` / `useQueryParams` → `page.tsx` bọc `<Suspense>`; `npm run build` không có `ƒ` mới
- [ ] `npm run check` xanh (`quality-gates.md`)

---

## 7. Cross-references

`server-client-boundary.md` · `component-structure.md` · `comment-policy.md` · `feature-structure.md` ·
`routing-conventions.md` · `folder-structure.md` · `reuse-first.md` · `visual-hierarchy.md` · `../i18n/i18n.md`

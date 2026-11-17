# Server / Client Boundary — file nào có `'use client'`

> Next render mọi thứ ở **server theo mặc định**; chỉ file có `'use client'` (và mọi thứ nó import) mới vào bundle trình duyệt. Rule này
> giữ ranh giới đó sạch: marketing ít JS, `page.tsx` có `generateMetadata`, không lỗi biên dịch "needs useState".
> Lý do quyết định: [`docs/architecture.md §2`](../../architecture.md). Route / layout: [`routing-conventions.md`](routing-conventions.md).
> Máy giữ: `tests/policy/structure/use-client.test.ts`.

---

## 1. Mặc định theo vị trí

| Nơi | Là gì | Ghi chú |
|---|---|---|
| `page.tsx` · `layout.tsx` · `not-found.tsx` | **Server** | Metadata, JSON-LD, ghép MỘT view; KHÔNG `useState`, KHÔNG handler |
| `error.tsx` · `global-error.tsx` | **Client** (Next bắt buộc) | Thân là `RouteErrorScreen` / `ErrorScreen` |
| `src/app/_views/` trang tĩnh (`LandingView`, `AboutView`, `status/ForbiddenView`) | Server — KHÔNG directive | Chỉ dùng `useTranslations`, `Link`, UI kit trình bày |
| `src/app/_views/` có state / form (`DashboardView`, `SettingsView`) · `features/*/views/` | Client | Hook trạng thái, mutation, store |
| `src/app/_guards/` · `_providers/` · `_shell/` · `AppShellLayout` | Client | Hook, store, context |
| `shared/ui` thuần trình bày (`Skeleton`, `Spinner`, `EmptyState`, icon, `BoxGrid`…) | Server-capable — KHÔNG directive | Render ở server, không thêm byte JS |
| `shared/ui` tương tác (`Button`, `Modal`, `Dropdown`, form…) · `shared/widgets` · `shared/hooks` | Client | Radix, handler, hook |
| `*.theme.ts` · `*.constants.ts` · `*.utils.ts` · `*.types.ts` | Không directive | Hằng / hàm thuần — Server Component gọi được (§4) |
| `core/seo/**` · `core/config/server-config.ts` · `core/i18n/server.ts` | Chỉ server (`server-only`) | Client import là build đỏ (§8) |

## 2. Luật chính — file chạm API chỉ-client PHẢI có `'use client'`

Một file thuộc diện này nếu có BẤT KỲ thứ nào dưới đây — **kể cả file `.ts`** (hook, store, context):

| Dấu hiệu | Ví dụ |
|---|---|
| Hook trạng thái / vòng đời của React | `useState` · `useEffect` · `useLayoutEffect` · `useReducer` · `useRef` · `useMemo` · `useCallback` · `useContext` · `useId` · `useTransition` · `useSyncExternalStore` |
| Tạo context | `createContext` |
| GỌI hook của repo | `useQueryParams`, `useDisclosure`, `useAppMenu`, `useSessionStore(selectUser)`… (mọi `use*` tự viết, kể cả hook store) |
| Hook của `next/navigation` | `useSearchParams` · `useParams` · `useRouter` · `usePathname` (và bản bọc của `@/core/i18n`) |
| Prop sự kiện trong JSX | `onClick=` · `onChange=` · `onSubmit=`… |
| Thư viện chỉ chạy ở client, dùng trong component / hook | Radix, React Hook Form, Recharts, dnd-kit |
| API trình duyệt ở thân component / hook | `window` · `document` · `localStorage` |

**Ngoại lệ:** `useTranslations` / `useLocale` / `useMessages` của `next-intl` có bản chạy được ở Server Component — file chỉ dùng chúng
KHÔNG cần directive (mẫu: `LoadingScreen`, `AboutView`, `ForbiddenView`). `useTranslations` ở server là bản đồng bộ, không phải hook trạng thái.

**Không thuộc diện (không directive):** file KHAI store (`*.store.ts` — `create(persist(…))`, `registerPersistedStore`) và file bọc hook của
TanStack (`*.queries.ts` — `export const useLogin = () => useMutation(…)`) vì cấp module không gọi hook nào; nơi GỌI `useSessionStore(…)` /
`useLogin()` (hook của repo, view, component) mới là client. Hàm thuần (`*.utils.ts`), hằng, kiểu, schema Zod cũng không.

**Vì sao cả file `.ts`:** `@/shared/ui` là MỘT barrel mà Server Component import. Barrel kéo MỌI file nó `export` vào đồ thị server; chỉ cần một
module trong đó gọi `useState` mà không có directive là Next báo lỗi biên dịch ("You're importing a component that needs `useState`…"),
dù Server Component đó chỉ dùng `Skeleton`. Hook / store / context nằm ở `.ts` cũng là module trong đồ thị đó.

⛔ Không thêm `'use client'` "cho chắc" vào file KHÔNG chạm API client — nó biến cả cây con của file thành bundle trình duyệt (§3).

## 3. Component thuần trình bày KHÔNG có directive

`Skeleton`, `Spinner`, `EmptyState`, icon, `PageShell` / `BoxGrid`, view tĩnh… render ở server, không tải JS. Đặt directive vào là:
(a) Server Component phải gánh JS của nó, (b) mọi thứ nó import theo vào bundle. Một file KHÔNG directive mà được import từ file
`'use client'` thì tự thành client trong cây đó — không cần (và không nên) đánh dấu hai lần.

**Component vừa trình bày vừa tương tác → tách đôi**, đừng đánh dấu cả khối: phần tĩnh ở file không directive, nút / ô nhập ở file
`'use client'` riêng (mẫu: `StatusView` là server, `StatusNavActions` dùng `useRouter` nên là client riêng — `StatusView` chỉ dùng nó khi không có `children`).

## 4. Hằng, bảng class, hàm thuần — file riêng

Server Component chỉ dùng được **component** do file `'use client'` export; mọi export khác (hằng, hàm) bị Next đổi thành tham chiếu client — gọi
trong server là lỗi. Vì vậy:

- Bảng `*_CLASSES` dùng chung → `*.theme.ts`; hằng dữ liệu → `*.constants.ts`; hàm thuần → `*.utils.ts`; kiểu → `*.types.ts`. Các file này
  KHÔNG có hook nên không bị đánh dấu client.
- Bảng class chỉ MỘT component dùng ở lại file component (`component-structure.md §2`) — nhưng nếu server cần đọc nó thì tách ra theme.
- `appearance-script.ts`, `paths.constants.ts`, `navigation.config.ts` (dữ liệu) là mẫu: import được từ cả server lẫn client.

## 5. Truyền dữ liệu qua ranh giới

- **Props server → client phải serialize được**: chuỗi, số, boolean, mảng / object thuần, `Date`, `Map` / `Set`. KHÔNG hàm (trừ Server Action),
  KHÔNG instance của class, KHÔNG `Symbol`. Cần hành vi thì để client tự dựng từ dữ liệu (vd `generateMetadata` ra chuỗi, view client tra `t('…')`).
- **`children` là cách ghép chuẩn**: Client Component nhận `children` (RSC payload, không vào bundle). Mẫu thật:
  `(app)/layout.tsx` (server) → `<AuthGate><AppShellLayout>{children}</AppShellLayout></AuthGate>` — hai file client bọc, trang bên trong
  vẫn là Server Component.
- **Thông điệp dịch**: chỉ `CLIENT_NAMESPACES` (`common`, `errors`, `validation`, `ui`, `auth`, `shell`, `account`, `customers`, `demo`) đi xuống client qua
  `NextIntlClientProvider`; `metadata`, `landing`, `about`, `site` ở lại server. View client dùng `useTranslations('auth.login')` — namespace
  chưa thuộc `CLIENT_NAMESPACES` là chuỗi thiếu ở client.
- **Dữ liệu người dùng** (phiên, quyền) KHÔNG đọc ở server — lấy ở client qua store / React Query (để route còn SSG). Server chỉ biết dữ liệu tĩnh.

## 6. Đặt provider và gate

| Provider | Ở đâu | Chứa |
|---|---|---|
| `NextIntlClientProvider` | `[locale]/layout.tsx` (server dựng) | thông điệp client |
| `BaseProviders` | `[locale]/layout.tsx` — MỌI trang | `StoreHydration` (nạp store `persist`), `AppearanceSync` — KHÔNG React Query / phiên / toast |
| `AppProviders` | `(workspace)/layout.tsx` — chỉ vùng cần phiên | `QueryClientProvider`, `LocaleSync`, `SessionBootstrap`, `DisplayUrlSync`, `ChartScaleProvider`, `AppOverlays` |

- Đặt provider **sâu nhất có thể** và để nó nhận `children`: trang marketing không được tải React Query / Zustand phiên / toast / Recharts.
- `AuthGate` / `GuestGate` là Client Component đặt ở `layout.tsx` nhóm; không nhét logic gate vào `page.tsx` (server).
- Đừng import `recharts` / dnd-kit / `react-arborist` vào layout hay barrel dùng chung — chỉ vào bundle của trang nào import chúng.

## 7. `useSearchParams`, nạp động

- **`useSearchParams` (và `useQueryParams`, `useNavHref`) đọc `?query` ở client → bọc `<Suspense>`** ở `page.tsx` hoặc ở chỗ gắn component
  (mẫu: `reset-password/page.tsx`, `DisplayUrlSync` trong `AppProviders`). Thiếu là route mất SSG, build báo lỗi.
- **Widget client nặng** (biểu đồ, trình soạn ảnh, viewer 3D) chưa cần ngay lúc vào trang → `next/dynamic(() => import('…'))`.
  `ssr: false` chỉ khai được BÊN TRONG Client Component. Đừng `dynamic` import một barrel (kéo cả nhóm); import đúng file widget. Hiện base
  chưa có chỗ nào cần — thêm khi đo thấy bundle trang quá nặng (`npm run analyze`).

## 8. `server-only`

- `core/config/server-config.ts` (`serverConfig`) và `core/seo/site.config.ts` có `import 'server-only'` — lọt vào Client Component là **build đỏ**,
  secret không bao giờ vào bundle. Client chỉ đọc `appConfig` (`NEXT_PUBLIC_*`).
- `core/i18n/server.ts` (`requireLocale`, `getTranslations`…) chỉ cho Server Component / `generateMetadata`; client dùng `@/core/i18n`.
- ⛔ `src/proxy.ts` KHÔNG import `server-only` / `server-config` (proxy không chạy ở điều kiện `react-server`) — đọc env bằng `parseServerEnv`.

## 9. Máy kiểm tra

`tests/policy/structure/use-client.test.ts` quét `src/**/*.{ts,tsx}` và báo file **thiếu** `'use client'` mà có: `useState|useEffect|useLayoutEffect|useReducer|useRef|
useMemo|useCallback|useContext|createContext`, import `next/navigation`, hook tự viết `use*`, hoặc prop JSX `on*=`. Ngược chiều (thừa directive) là
việc review (§10). Bổ trợ: `server-only` (build đỏ), lỗi biên dịch của Next khi server import hook, build bảng `Route (app)` (route nào thành `ƒ`).

## 10. Checklist cho người review

- [ ] `page.tsx` / `layout.tsx` không có `'use client'`, hook, handler; chỉ `generateMetadata` + ghép view
- [ ] File mới gọi hook (React hoặc `useXxx` của repo, kể cả `useXxxStore(…)`) / `createContext` / `on*=` / `next/navigation` / Radix / RHF / Recharts → ĐÃ có `'use client'` (kể cả `.ts`)
- [ ] File thuần trình bày KHÔNG có directive; component vừa tĩnh vừa tương tác đã tách đôi
- [ ] Hằng / bảng class / hàm thuần ở `*.theme.ts` · `*.constants.ts` · `*.utils.ts`, không cùng file với component `'use client'` mà server cần gọi
- [ ] Props qua ranh giới serialize được; ghép bằng `children`, không truyền hàm xuống từ server
- [ ] Provider mới đặt sâu nhất có thể (`BaseProviders` chỉ cho thứ MỌI trang cần); không kéo thư viện nặng vào layout / barrel chung
- [ ] `useSearchParams` đã nằm trong `<Suspense>`; build không có `ƒ` ngoài `[...rest]` và `/api/*`
- [ ] Thứ chỉ-server (`serverConfig`, `site.config`) không bị client import; `proxy.ts` không import `server-only`

## 11. Tham chiếu

`routing-conventions.md` (route, Suspense, SSG) · `page-structure.md` (view vs `page.tsx`) · `component-structure.md` (file theme riêng) ·
`widget-composition.md` · `../i18n/i18n.md` · `../data/state-management.md` (store `persist` + `skipHydration`).

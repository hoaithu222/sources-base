# Kiến trúc — các quyết định đáng biết trước khi sửa

> Mỗi mục: **quyết định** · **vì sao** · **luật chi tiết ở đâu**. Luật đầy đủ nằm ở `docs/rules/`; file này
> chỉ giữ phần "vì sao" để người sau không lật ngược một quyết định đã trả giá. Mục lục: [`README.md`](README.md).
> Base này chuyển từ bản Vite + React Router (`source-base-rouded`) sang **Next.js 16 App Router** — mục nào đổi so với
> bản cũ có ghi rõ.

---

## 1. Tầng và chiều phụ thuộc — ESLint chặn cứng

```
app → features → domains → shared → core
```

Mũi tên là chiều ĐƯỢC PHÉP import. `core` không import tầng nào; `shared` chỉ import `core`; feature không
import feature khác và không import `app`. Từ bên ngoài, một domain / feature chỉ được import qua `index.ts` của
nó (`@/domains/session`, `@/features/auth`).

**Tầng `app` = thư mục `src/app/` của Next.** Nó gồm HAI loại thứ, tách bằng dấu gạch dưới:

| Thứ trong `src/app/`                          | Là gì                                                                                         |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `[locale]/…`, `robots.ts`, `sitemap.ts`, …    | **Route** (hệ thống file của Next) — `page.tsx` / `layout.tsx` MỎNG: metadata + ghép một view |
| `_providers/ _layouts/ _shell/ _views/ _navigation/ _guards/ _components/ _seo/` | **Lắp ráp** — thư mục private (`_` đầu tên → Next bỏ qua khi định tuyến), mỗi cái một module |

Vì sao: giữ nguyên mô hình tầng đã được kiểm chứng của base cũ mà không phải đặt tên lại "tầng lắp ráp" ra ngoài
`src/app` (Next cố định `app/` là nơi route). Route mỏng + view ở `_views/` cũng là chỗ để Server Component lo metadata
và Client Component lo tương tác.

**Tầng dưới cần hành vi của tầng trên thì nhận qua tham số** ở `src/app/_providers/bootstrap.ts`, không import ngược.
Ví dụ thật: `core/http` cần access token và cách làm mới nó nhưng không được biết store nằm đâu:

```ts
configureHttp({ auth: { getAccessToken, refreshAccessToken } }); // hai hàm của @/domains/session
```

Vì sao: tầng nào cũng thay / test được độc lập; vòng import không thể xuất hiện giữa các tầng. Luật ở đầu
`eslint.config.js` + `scripts/eslint/architecture.mjs` (`npm run lint` đỏ khi vi phạm) · `quality-gates.md`.

`core/` cũng chứa hai khối hạ tầng MỚI của bản Next: `core/i18n` (đa ngôn ngữ — §5) và `core/seo` (metadata, JSON-LD,
sitemap, robots — §6). `src/messages/` (thông điệp dịch) và `src/proxy.ts` (cổng chặn trước route) đứng ngoài tầng.

## 2. Ranh giới server / client — quyết định lớn nhất của bản Next

Next render mọi thứ ở **server theo mặc định**; chỉ file có `'use client'` (và những gì nó import) mới vào bundle trình
duyệt. Bốn luật giữ ranh giới này sạch:

1. **`page.tsx` / `layout.tsx` là Server Component.** Chúng lo `generateMetadata`, dữ liệu SEO (JSON-LD),
   rồi ghép MỘT view. Không `useState`, không handler.
2. **Mọi file chạm API chỉ-client PHẢI có `'use client'`** — hook trạng thái / effect, `createContext`, prop sự kiện JSX,
   thư viện chỉ chạy ở client (Radix, Zustand, React Hook Form, Recharts, dnd-kit), `next/navigation`, hook tự viết. Kể cả
   file `.ts` (hook, store, context). Lý do: `@/shared/ui` là MỘT barrel mà Server Component import; barrel kéo cả file hook
   vào đồ thị server, và Next báo lỗi biên dịch nếu một module ở đó import `useState` mà không có directive. Test
   `tests/policy/structure/use-client.test.ts` giữ luật này.
3. **Component thuần trình bày (Skeleton, Callout, icon, view tĩnh…) KHÔNG có `'use client'`** — chúng render ở server và không
   thêm byte JS nào. Đừng thêm directive "cho chắc".
4. **Hằng / bảng class / hàm thuần nằm file riêng** (`*.theme.ts`, `*.constants.ts`, `*.utils.ts`) — không có hook nên không
   bị đánh dấu client, Server Component gọi được. Đặt chúng cạnh component trong cùng file `'use client'` là Server Component
   mất quyền gọi (Next chỉ cho dùng một export của file client như component, không như hàm).

Luật: `rules/structure/server-client-boundary.md`.

## 3. Chiến lược render: tĩnh trước, hai nhóm route

```
src/app/[locale]/
  layout.tsx        root layout: <html lang>, font, script giao diện, NextIntlClientProvider, BaseProviders
  (public)/         marketing — SSG, KHÔNG React Query / phiên → ít JS nhất  (/, /about)
  (workspace)/      mọi thứ cần phiên: AppProviders (React Query, phiên, toast, biểu đồ)
    (auth)/         trang khách — GuestGate + AuthLayout, noindex           (/login, /register, …)
    (app)/          vùng làm việc — AuthGate + AppShellLayout, noindex      (/dashboard, /profile, /settings, /demo)
```

- **Mọi route `[locale]/…` là SSG** (`generateStaticParams` ở layout trả `vi`, `en`). Ngôn ngữ đọc từ THAM SỐ GỐC của route bằng
  `next/root-params` (`core/i18n/request.ts`), không từ header — nên Server Component nào dùng chữ dịch (`useTranslations`) cũng
  prerender tĩnh mà KHÔNG cần `setRequestLocale` (API đó next-intl đã đánh dấu deprecated; bản Next trước phải gọi nó ở từng layout /
  page, quên một chỗ là cả route thành render động). **Sau mỗi lần thêm route, đọc bảng `Route (app)` của `npm run build`** — không
  có `ƒ` ngoài `[...rest]` và `/api/*`; thứ làm route động là `cookies()` / `headers()` / `searchParams` / `useSearchParams` thiếu `<Suspense>`.
- **Provider chia hai tầng:** `BaseProviders` (nạp store đã lưu + áp giao diện) ở root; `AppProviders` chỉ ở `(workspace)`. Vì sao: trang
  marketing là thứ công cụ tìm kiếm chấm điểm Core Web Vitals — không để nó tải React Query, Zustand phiên, toast.
- **Tài liệu cuộn tự nhiên ở trang công khai; vùng làm việc tự khoá viewport** (`h-dvh overflow-hidden` ở `AppShellLayout`, cuộn
  trong `<main>`). Bản Vite khoá `body` cho cả app — với trang SEO nó làm hỏng anchor, thanh địa chỉ mobile thu gọn, và Lighthouse.
- **Auth chia hai lớp.** `src/proxy.ts` (tên mới của middleware ở Next 16) chặn SỚM ở server: route cần đăng nhập mà không có cookie
  phiên → `/login?next=…` (người lạ không nhận HTML riêng tư). Guard phía client (`AuthGate`) lo phần proxy không biết — cookie
  hết hạn, phiên bị thu hồi. Proxy cố ý KHÔNG chặn trang khách: chuyển người đã đăng nhập đi mà cookie còn nhưng phiên hỏng sẽ gây vòng
  lặp `/login` ⇄ `/dashboard`.

### Chính sách render theo loại trang

Mặc định TĨNH vì base phục vụ trang công khai tĩnh + ERP lấy dữ liệu phía client. Cần khác thì khai MỘT dòng ở `RENDER_POLICY`
(`scripts/check-static-routes.mjs`, kèm lý do) — không phải sửa luật toàn cục.

| Loại trang | Hướng xử lý |
|---|---|
| Landing, giới thiệu | SSG (mặc định) |
| Nội dung công khai lấy từ CMS | SSG + `revalidate` (ISR), hoặc cache có thời hạn — theo độ mới cần có; route vẫn prerender nên cổng tĩnh không đổi |
| ERP tương tác, bảng dữ liệu | Khung tĩnh + React Query phía client — lựa chọn hợp lệ, là hiện trạng |
| Trang cần dữ liệu riêng của người dùng NGAY từ server | Render động (khai `RENDER_POLICY`) + truy cập dữ liệu có `server-only`, kiểm quyền gần nguồn dữ liệu |

Menu thuộc `app/_navigation`, cây thư mục quyết định route, `RENDER_POLICY` chỉ là danh sách ngoại lệ nhỏ — đừng gom render, auth và menu thành một
cấu hình lớn. Route ẩn khỏi menu hay có tham số (`[id]`) cũng phải qua cổng này: cổng đọc mọi route của bản build, không đọc menu.

### Dữ liệu từ server (khi thêm SSR có phiên)

Hiện mọi luồng đăng nhập chạy ở client; `core/http/api-client.ts` giữ cấu hình cấp module và lấy token từ store trình duyệt. Mẫu đó KHÔNG dùng
được trên server nhiều request đồng thời. Khi thêm dữ liệu riêng từ server:

- Tạo lớp truy cập dữ liệu riêng có `import 'server-only'`; token / cookie đọc từ request (`cookies()`), truyền theo từng lời gọi — không đọc
  Zustand, không đặt người dùng hiện tại vào biến cấp module.
- Tách điểm vào theo môi trường ở đúng module cần (kiểu + schema thuần dùng chung, hàm gọi API chia `browser` / `server`); không cần đổi tên mọi file.
- Mỗi dữ liệu có MỘT chủ: hoặc Server Component tải, hoặc React Query — đừng để cả hai làm mới độc lập rồi hiện hai phiên bản.
- Kiểm phiên + quyền TẠI nơi truy cập dữ liệu (Server Component, Server Action, Route Handler). `proxy.ts` chỉ là kiểm sớm "có cookie không"; `AuthGate`
  chỉ quyết định giao diện ở client và KHÔNG ngăn một Server Component con chạy ở server. Xem `docs/rules/data/security-checklist.md`.

## 4. State lưu trữ + SSR: `skipHydration`

Store Zustand `persist` mặc định nạp localStorage NGAY lúc tạo store, nên lần render đầu ở trình duyệt khác HTML server (server
không có localStorage) → lỗi hydration. Mọi store `persist` bật `skipHydration: true` và đăng ký vào `registerPersistedStore`;
`StoreHydration` gọi `rehydratePersistedStores()` MỘT lần sau hydrate (layout effect, đứng đầu cây provider nên chạy trước
effect của cây con). Giao diện (theme, TV, màu nhấn) không chờ bước đó: script `appearanceInitScript()` trong `<head>` áp chúng lên
`<html>` TRƯỚC lần vẽ đầu — không nháy sáng → tối. `AppearanceSync` đợi `usePersistedStoresHydrated()` mới ghi đè, để không xoá giao
diện đã lưu bằng giá trị mặc định. Luật: `state-management.md` · `docs/notes/code/app.md`.

## 5. Đa ngôn ngữ (next-intl)

- **Ngôn ngữ mặc định `vi` KHÔNG tiền tố** (`/login`), ngôn ngữ khác có (`/en/login`) — `localePrefix: 'as-needed'`. Vì sao: URL
  tiếng Việt giữ nguyên (không mất xếp hạng cũ), mỗi ngôn ngữ vẫn có địa chỉ riêng để Google lập chỉ mục độc lập.
- **Thông điệp ở `src/messages/<locale>/<namespace>.json`**, ghép có kiểu ở `<locale>/index.ts`. Tiếng Việt là NGUỒN (kiểu `Messages`
  suy từ nó); `en/index.ts` dùng `satisfies Messages` nên thiếu / thừa khoá là `tsc` đỏ. `useTranslations('ui.form')` có gợi ý khoá và
  báo đỏ khoá sai nhờ `core/i18n/next-intl.d.ts`.
- **Chỉ nhóm thông điệp trình duyệt cần đi xuống client** (`CLIENT_NAMESPACES`); nội dung SEO / trang tĩnh (`metadata`, `landing`, `about`,
  `site`) ở lại server — bundle nhỏ hơn.
- **UI kit dùng `useTranslations('ui.<nhóm>')`**, không còn chuỗi cứng; prop có chữ mặc định (`cancelLabel`…) rơi về khoá dịch. Hàm thuần
  (`formatCurrency`, validator Zod) nhận tham số `locale` hoặc lấy chữ lười từ registry (`validationMessages()`), giữ thuần và test được.
  Thông báo lỗi HTTP cũng vậy (`errors.http` → `configureErrorMessages`).
- **Điều hướng dùng `Link` / `useRouter` / `usePathname` của `@/core/i18n`**, không phải `next/link` — chúng tự thêm tiền tố ngôn ngữ.
  `LocaleSwitcher` là `<a hreflang href>` thật: bot lần theo được các bản dịch, không cần JS.
- Zod giữ cấu hình ở biến toàn cục → `configureZodLocale` chỉ gọi ở trình duyệt (`LocaleSync`); server không bao giờ gọi.

Luật: `rules/i18n/i18n.md` · hướng dẫn thêm chuỗi / ngôn ngữ: `guides/i18n.md`.

## 6. SEO — làm đúng từ nền, không rải từng trang

| Việc | Nơi làm | Vì sao |
| --- | --- | --- |
| `<html lang>`, một `<h1>`/trang, landmark `header/nav/main/footer` | root layout + view | Công cụ tìm kiếm + trình đọc màn hình |
| Metadata từng trang: title template, description, **canonical**, **hreflang + `x-default`**, OG, Twitter | `core/seo/metadata.ts` (`buildRootMetadata`, `buildPageMetadata`) | Một chỗ → không trang nào quên canonical |
| Ảnh Open Graph theo ngôn ngữ, có chữ Việt | `[locale]/opengraph-image.tsx` + Noto Sans `vietnamese` | Chia sẻ link đẹp; Satori mặc định thiếu glyph tiếng Việt |
| JSON-LD (`WebSite`, `Organization`, `WebPage`, `BreadcrumbList`) | `core/seo/json-ld.utils.ts` + `<JsonLd>` | Rich result; escape `<` chống XSS |
| `sitemap.xml` có hreflang từng cặp, `robots.txt` | `app/sitemap.ts`, `app/robots.ts` ← `PUBLIC_ROUTES` / `PRIVATE_PATHS` | Một danh sách route công khai duy nhất |
| `noindex` cho vùng riêng tư, trang khách, `/api`, 404 | layout nhóm + `X-Robots-Tag` + `robots.txt` | Không để trang đăng nhập tranh hạng với trang chủ |
| **Preview / staging tự chặn toàn bộ** | `SEO_ALLOW_INDEXING` (mặc định suy từ môi trường) | Bản thử không lọt vào Google |
| Font tự host `next/font`, `viewport-fit=cover`, `theme-color` hai theme | root layout, `buildViewport` | CLS thấp, không request tới Google lúc chạy |
| PWA: manifest có icon PNG, `apple-touch-icon` | `app/manifest.ts`, `npm run generate:pwa-icons` | Cài được lên iPad / Android |
| Header bảo mật, `poweredByHeader: false`, HTTP cache ảnh | `next.config.ts` | Tín hiệu tin cậy + bớt thông tin cho kẻ dò quét |

⛔ **Next KHÔNG gộp sâu khối `openGraph` / `twitter` / `robots`:** trang khai `openGraph` là thay NGUYÊN khối của layout — kể cả ảnh
từ file convention. Vì vậy `buildPageMetadata` lặp lại siteName / locale / type / images ở mỗi trang, và khoá `robots` phải VẮNG MẶT
(không phải `undefined`) khi cho lập chỉ mục. Luật: `rules/seo/seo.md` · hướng dẫn: `guides/seo.md`.

## 7. UI kit chia theo chức năng, import qua một barrel

`src/shared/ui` chia theo **việc component làm** (`primitives/ feedback/ actions/ inputs/ selects/ pickers/
overlays/ navigation/ data-display/ surfaces/ media/ layout/ form/ icons/`), không theo bậc "atomic". Khi cần
một component, người ta nhớ _nó làm gì_ ("chọn ngày"), không nhớ nó thuộc bậc trừu tượng nào.

Code ngoài UI kit import qua `@/shared/ui`; chỉ ba đường import sâu có lý do (`icons/Icons`, `media/image-annotator`,
`overlays/modal.theme`). Mọi file component đọc theo cùng thứ tự (imports → types → bảng `*_CLASSES` → khối tài
liệu + component → export), biến thể là bảng `satisfies Record<…>` — thiếu ô là `tsc` đỏ. Điều hướng đi trang dùng `<Link>` của
`@/core/i18n` (prop `href`, không phải `to`). Luật: `ui-kit-architecture.md` · `component-structure.md` · catalog `reuse-first.md`.

## 8. Bố cục trang: một công thức, một nguồn lề

Mọi trang nội dung ghép bằng bốn hộp của `layout/`, không gõ tay class:

```tsx
<PageShell>                       {/* vỏ — KHÔNG đệm, layout ngoài đã cấp lề */}
  <TitleScreen title="…" />
  <Toolbar left={…} right={…} />  {/* cụm trái nở, cụm phải ghim */}
  <PageBody overflow="hidden">    {/* chiếm phần còn lại; đây mới là chỗ cuộn */}
    <BoxPanel>…</BoxPanel>
  </PageBody>
</PageShell>
```

- ⛔ **Một trang một tầng tên.** Trang đã có `<PageHeader>` (tên trang nằm trên thanh header, tab của trang lên header từ `xl`,
  dưới `xl` là dải gạch chân trong trang) thì BỎ `TitleScreen` ở trên (`page-structure.md §3b`).
- ⛔ **Trang KHÔNG tự thêm đệm.** Lề do `SHELL_GUTTER_X` / `SHELL_GUTTER_Y` (`shared/constants/layout.constants.ts`)
  cấp MỘT lần ở `AppShellLayout`, và thanh header đọc cùng hằng đó — header, nội dung, mép logo nằm trên một lưới.
- ⛔ `min-h-0` trong `PageShell` / `PageBody` không phải để đẹp: flex item mặc định `min-height: auto` nên không
  co nhỏ hơn nội dung — thiếu nó thì bảng **đẩy cả trang dài ra** thay vì cuộn trong khung.
- Ba lưới, đừng lẫn: `BoxGrid` (thẻ / panel) · `FormGrid` (field) · lưới của trang trưng bày.

Luật: `page-structure.md` · `spacing-system.md` (ESLint chặn trang tự đệm).

## 9. Design token sinh từ JSON, không viết tay

```
src/styles/theme/colors-theme.json  ──generate:colors──▶  generated-colors.css · shared/theme/colors.generated.ts
src/styles/font/font.json           ──generate:font────▶  generated-font.css
src/assets/icons/*.svg              ──generate:icons───▶  assets/icons/{index,standalone}.tsx · shared/ui/icons/index.ts   (check:generated)
src/assets/vci-icons/*.svg          ──generate:vci-icons─▶  shared/ui/icons/vci-icon/vci-icons.generated.ts
public/favicon.svg                  ──generate:pwa-icons─▶  public/icons/*.png
```

189 token màu × 2 theme (sáng / tối), 14 thang chữ × 4 độ đậm. Đổi màu / cỡ chữ → sửa **file JSON** rồi chạy
lại script (`generate:styles` tự chạy trong `npm run build`). ⛔ Không sửa file `*.generated.*` / `generated-*`
— lần chạy sau ghi đè. Vì sao: một nguồn cho cả CSS lẫn TS (chart canvas cần giá trị màu), và test (`color-tokens`, `font-tokens`)
chặn class màu / chữ không tồn tại — Tailwind im lặng bỏ qua class sai. Luật: `color-system.md` · `font-system.md` ·
`icon-conventions.md` · `vci-icon-system.md`.

Font: `next/font` (Inter + JetBrains Mono + Noto Sans, subset `latin` · `latin-ext` · `vietnamese`) khai biến `--font-inter` /
`--font-jetbrains-mono` / `--font-noto-sans`; `styles/base/root-vars.css` nối chúng vào `--font-sans` / `--font-mono` (có fallback
`var(--font-inter, 'Inter')` để test / trang ngoài layout vẫn hợp lệ). `next/font` đọc option TĨNH nên `subsets` phải là literal.

## 10. Nhóm "sống & tự chạy" — và luật giảm chuyển động

`AnimatedNumber`, `ScrollBoard`, `RankingBoard`, `CapsuleChart`, `LiquidGauge` tự làm một việc theo thời gian
(học từ giao diện bảng điều khiển lớn kiểu DataV); `SummaryCard`, `CompactKpiCard`, `SummaryPill` đếm số theo
mặc định. Vì sao: trên màn 20 con số, số nhảy phịch thì mắt không bắt được cái nào vừa đổi.

⛔ Mọi hiệu ứng TỰ CHẠY phải hỏi `usePrefersReducedMotion()` và **nhảy thẳng tới trạng thái cuối** (không phải
chạy nhanh hơn) — chuyển động không mong muốn gây chóng mặt thật với người rối loạn tiền đình. Tắt từng chỗ bằng
`animate={false}` hoặc `disabled` / `disableAnimation`; nên tắt khi số nằm trong bảng dài.

## 11. Phiên đăng nhập

**Access token KHÔNG nằm trong localStorage.** `session.store.ts` chỉ persist `user`; `accessToken` sống trong bộ
nhớ, refresh token ở cookie HttpOnly do BE đặt (đi same-origin nhờ `rewrites()` của `next.config.ts` proxy `/api/*` về
`API_PROXY_TARGET`). Sau F5 phiên dựng lại bằng một lượt refresh. Đổi lại cho "tiện" là mở cửa cho XSS lấy trọn phiên.

**Một đường refresh cho mọi tình huống.** Khởi động tab, request ăn 401, tab khác vừa đăng nhập — tất cả đi qua
`refreshSession()` (nội bộ `domains/session/lifecycle`) và nhận cùng một kiểu kết quả. Ba nhánh, đừng gộp:

| Kết quả                                    | Lúc khởi động                     | Khi request ăn 401                              |
| ------------------------------------------ | --------------------------------- | ----------------------------------------------- |
| `ok`                                       | Vào ứng dụng                      | Phát lại request gốc bằng token mới             |
| `unauthenticated` (BE trả 400 / 401 / 403) | Về `/login`, nhớ URL định vào     | Xoá phiên → `AuthGate` đưa về `/login`          |
| `unavailable` (mất mạng, 5xx, payload sai) | Màn "Thử lại", **giữ nguyên URL** | **Giữ nguyên phiên**, request fail như lỗi mạng |

Ba bất biến (test `session-lifecycle`, `http-client`): **single-flight** — N request cùng hết hạn → một lời gọi
refresh (trong tab bằng promise chung, giữa các tab bằng Web Locks; refresh token xoay vòng ở BE, bắn song song là
phiên chết oan) · **kết quả cũ không ghi đè phiên mới** · **đa tab** — đăng xuất / đăng nhập ở tab này thì tab
khác tự cập nhật (`BroadcastChannel`), cache React Query được dọn khi phiên kết thúc hoặc đổi người
(`_providers/bootstrap.ts`). Đích quay lại sau đăng nhập là `?next=` và chỉ nhận đường NỘI BỘ (`resolveReturnPath` chống
open-redirect). Luật: `async-safety.md` · `security-checklist.md` · `notes/code/domains.md`.

## 12. Lỗi HTTP: một hình dạng, báo một lần

Mọi lỗi ra khỏi `apiClient` là `AppError` (`@/core/http`): `kind` để quyết định xử lý, `message` là câu hiển thị được ngay **theo ngôn
ngữ đang chọn**, `fieldErrors` gắn thẳng vào form (`useServerErrors`). Tầng HTTP **không tự toast**: thông báo
nằm ở `QueryCache` / `MutationCache` (`core/query`), nên một lỗi báo đúng một lần và chỉ SAU khi đã thử lại xong;
lỗi nào được báo, câu nào — một chỗ quyết (`claimErrorMessage`). Màn tự vẽ lỗi thì khai `meta: { silentError: true }`;
request huỷ bằng `AbortSignal` không bao giờ bị báo. Hàm API trả payload qua `readData(response, schema?)`. Câu lỗi lấy từ
`messages/<locale>/errors.json` (`http`) qua registry `errorMessages()`, `LocaleSync` cập nhật khi đổi ngôn ngữ — `core` vẫn không biết React.

Lỗi giao diện: `error.tsx` (từng nhóm route) + `global-error.tsx` (lỗi của chính root layout, tự dựng `<html>`) thay `ErrorBoundary` của
bản Vite; `[locale]/not-found.tsx` + `[...rest]` cho 404 có ngôn ngữ, `global-not-found.tsx` cho URL ngoài `[locale]`. Lỗi tải chunk (vừa
triển khai bản mới) tự tải lại MỘT lần. Luật: `api-patterns.md`.

## 13. Điều hướng khai MỘT chỗ, route do hệ thống file quyết

Bản Vite khai route trong module registry. Next đã có hệ thống file, nên `src/app/_navigation/navigation.config.ts` chỉ MÔ TẢ cho menu:
trang tĩnh (`NAV_PAGES`) và phân hệ (`NAV_MODULES`: id, path, icon, tông, quyền, màn hình). Từ đó dựng ra Dock, bộ chọn phân hệ +
dải điều hướng trên header, bảng lệnh (Ctrl/⌘+K), tab bar điện thoại, tên màn cho thẻ làm việc. Chữ ở `shell.json` (`nav.<id>`).

- Menu và guard dùng chung `canAccess` (`@/domains/session`) — menu không bao giờ hiện mục mà bấm vào ra 403. `useAppMenu()` là nguồn
  duy nhất; không nơi nào tự lọc quyền riêng.
- Widget `CommandPalette` / `Header` / `Dock` là UI thuần, không đọc cấu hình hay store; tầng nối là `src/app/_shell/`.
- **Khai path ở `navigation.config.ts` thì PHẢI có `page.tsx`.** Test `tests/app/navigation.test.ts` đối chiếu cấu hình ↔ thư mục route.
- `PUBLIC_ROUTES` (sitemap) và `PRIVATE_PATHS` (robots) ở `_navigation/public-routes.ts`; `GUEST_ONLY_PATHS` / `PROTECTED_PATH_PREFIXES` ở
  `PATHS` cho `proxy.ts`. Test giữ hai nhóm không giao nhau.

Luật: `routing-conventions.md` · `navigable-controls.md`.

## 14. Hai lỗi tiếng Việt bị ESLint chặn cứng

Gác `guard/search-input` (`scripts/eslint/syntax-guards.mjs`) bắt hai lỗi đã gây bug thật: **ô tìm kiếm controlled** cắt ngang
composition của bộ gõ → gõ Telex mất dấu (dùng `useImeSafeSearchInput`); **`x.toLowerCase().includes(y)`** không bỏ
dấu → gõ "met khoi" không ra "Mét khối" (dùng `matchesSearch` / `includesSearch`). ⛔ Không tắt bằng
`eslint-disable`; cần ngoại lệ thì sửa rule kèm lý do. Luật: `ime-safe-input.md` · `search-matching.md`.

## 15. Chế độ demo và chế độ app

```bash
NEXT_PUBLIC_APP_MODE=demo   # base xuất xưởng — không cần backend, có phân hệ "Thư viện UI"
NEXT_PUBLIC_APP_MODE=app    # sản phẩm thật (mặc định khi không khai)
```

|                                                            | `demo`                                  | `app`                                                                                              |
| ---------------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Kiểm đăng nhập (`NEXT_PUBLIC_AUTH_ENABLED`) khi không khai | TẮT                                     | **BẬT** (`proxy.ts` chặn vùng riêng tư, `AuthGate` lo phiên)                                        |
| Phân hệ `/demo`                                            | Có                                      | `notFound()`                                                                                       |
| `npm run build`                                            | Chạy, in cảnh báo "đang build bản demo" | **Dừng** nếu `NEXT_PUBLIC_AUTH_ENABLED=false`, thiếu `NEXT_PUBLIC_API_BASE_URL` hoặc `NEXT_PUBLIC_SITE_URL` |

Mọi biến môi trường đi qua schema Zod (`core/config/env.schema.ts`) dùng chung cho `next.config.ts`, server và trình duyệt: chuỗi rỗng = mặc định;
`NEXT_PUBLIC_API_TIMEOUT=30000abc` hay `NEXT_PUBLIC_AUTH_ENABLED=ture` là dừng ngay chứ không chạy bằng giá trị đoán. Hai khối:
`NEXT_PUBLIC_*` (vào bundle — `appConfig`) và biến server-only (`serverConfig`, có `import 'server-only'`: lọt vào client là build đỏ).
⛔ Next chỉ nhúng `NEXT_PUBLIC_*` khi truy cập THẲNG `process.env.NEXT_PUBLIC_X` — `app-config.ts` liệt kê từng biến, đừng đổi thành
`parseAppEnv(process.env)`. CI khai biến tường minh theo từng job. Luật: `quality-gates.md` §2b.

## 16. Tải ban đầu: Server Components + tách theo route

Next tự tách mã theo route và Server Component không gửi JS — nên bản Next bỏ `manualChunks` / `check-bundle` của Vite. Thứ giữ bundle nhỏ là
**kỷ luật ranh giới** (§2) và provider chia hai tầng (§3): trang marketing không kéo React Query, Zustand phiên, toast, Recharts.
`next.config.ts` bật `optimizePackageImports` cho thư viện nhiều export, `reactCompiler: true` (tự memo hoá — xem `code-optimization.md`), ảnh
AVIF / WebP. Phân tích bundle: `npm run analyze` (`next experimental-analyze`, Turbopack). Biểu đồ / cây / dnd-kit chỉ vào bundle của trang
nào import chúng — đừng import `recharts` vào layout hay barrel dùng chung. Registry icon vẫn nằm trọn trong tải đầu — xem `known-issues.md`.

## 17. Công cụ: Next 16 + Turbopack, TypeScript 6.0

- **`npm run typecheck` = `next typegen && tsc --noEmit`.** `next typegen` sinh kiểu route (`PageProps<'/[locale]/about'>`,
  `LayoutProps`) vào `.next/types` — thiếu bước này `tsc` báo thiếu kiểu toàn cục.
- **TypeScript ghim `~6.0.x` có chủ ý.** Bản 7 (compiler native) ra rồi nhưng `typescript-eslint@8` khai peer `<6.1.0` — nâng lên là ESLint
  sập lúc nạp module, mất sạch rule chặn lỗi tiếng Việt. Chỉ nâng khi `typescript-eslint` hỗ trợ TS 7.
- **`madge` được thay bằng `dpdm`** (madge khai peer `typescript ^5` và ngừng bảo trì từ 8/2024) cho `check:cycles`.
- `proxy.ts` (không phải `middleware.ts`) từ Next 16; chạy Node runtime nhưng KHÔNG ở điều kiện `react-server` → không import `server-only`.
- Test: Vitest 5 + jsdom + Testing Library; `next-intl` được bọc bằng provider ở `tests/helpers/render.tsx`. Playwright CHỈ cho browser smoke test trên bản build production chế độ app (`e2e/`, `npm run test:e2e`, backend giả bằng `page.route`) — `rules/foundations/testing.md §8`.

## 18. Trang demo — công cụ cho dev, không phải ảnh chụp

`/demo` (chỉ chế độ demo, `noindex`) là catalog component: mục lục + ô tìm, mỗi nhóm UI kit chính có ví dụ sống, các trạng thái cạnh nhau,
dòng import đúng, file nguồn và tài liệu — bằng đúng component sản phẩm dùng, chạy đúng app providers; sửa `colors-theme.json` /
`font.json` là trang đổi theo; nó cũng là bài kiểm nhanh "component này còn render đúng sau SSR + hydrate, ở cả hai theme và hai ngôn ngữ".
Catalog không nhân đôi màn ghép thực chiến `/demo/customers`, chỉ trỏ tới; nhóm nào chưa có: `known-issues.md`.
Bản Vite có thêm thư viện demo đầy đủ (151 file: icon, form 21 field, biểu đồ, bảng nhập liệu, dashboard) — chưa chuyển sang; nếu cần, chép thư mục features/demo của base cũ (`source-base-rouded`) sang `features/demo` ở đây rồi đổi `Link to=` → `href=` (xem `known-issues.md`).

## 19. Responsive: ba trục tách bạch, một component chạy mọi cỡ màn

Ba câu hỏi khác nhau, ba gate khác nhau: **hẹp chỗ** (bậc bề rộng `sm … wide`) · **ngón tay** (`touch:`) · **điện thoại**
(`phone:`, cả dọc lẫn ngang). Không gộp được: iPad Pro ngang (1366px) trùng laptop 14" nên bề rộng không tách được máy
chạm khỏi máy chuột, và điện thoại ngang (844–932px) rộng hơn iPad dọc nên bề rộng cũng không tách được điện thoại.
Mốc `wide` = 1800px là bản màn ngoài đã chốt — mọi đợt responsive chỉ THÊM bậc cho màn nhỏ để 1920×1080 so từng pixel
vẫn bằng 0. Một component, CSS chọn dạng; chỉ khi hai dạng là hai cây DOM khác nhau mới rẽ nhánh bằng `useIsPhone()`.
Lưu ý SSR: `useIsPhone()` / `useMediaQuery` trả giá trị mặc định ở server và lần render đầu, rồi cập nhật sau hydrate — dùng CSS
(`phone:`, `max-lg:`) cho thứ cần đúng ngay từ HTML đầu. Luật: `responsive-screens.md` · `ipad-responsive.md` · cấu hình:
`styles/theme/variants.css` · `styles/theme/breakpoints.css`.

## 20. Sáng là mặc định, tối giữ HUD — một class, hai hình

Base này là bản SÁNG: `THEME_INITIAL_STATE` = `light`, `<html>` mặc định không có `class="dark"`; nút đổi theme vẫn còn, chế độ TV ép
tối; theme lưu ở khoá `next-base:theme` (mọi khoá localStorage mang tiền tố `next-base:`). Thương hiệu VCI: `primary` 1–9 là dải logo xanh lá →
ngọc → lam, vàng kim (`yellow` = `accent`), neutral ánh "sage", `icon-accent` = chấm đỏ logo cho icon VCI. Vì sao chung một bộ component cho hai
ngôn ngữ:

- **Trang trí HUD chỉ qua `dark:`** (quầng, ray, ngoặc góc, dấu `//`, lưới nền) — theme sáng là thẻ trắng bo mềm, bóng
  mảnh, MỘT dải gradient ở header. Thêm trang trí mà quên `dark:` là nó hiện cả ở màn quản trị sáng.
- **Bo góc là token**, không phải class rời: `rounded-md` = 8px ở sáng, 0 ở tối (`styles/theme/radius.css` + `.dark`
  đưa thang về 0). Component không viết `dark:rounded-none` → không có hai bộ class phải giữ khớp.
- **Header một dải, thanh nổi** (logo VCI · bộ chọn phân hệ · điều hướng phân hệ · tên trang + tab) thay sidebar. Header
  đổi theo CẤP của URL (0–3, tính một chỗ ở `useActiveModule`): từ cấp 2 dải phân hệ nhường chỗ cho vệt ‹ · phân hệ ›
  màn hình. Tab của TRANG lên thanh từ `xl`, dưới `xl` rơi về dải trong luồng trang. Kiểu thanh (`brand` / `glass`) chỉ là bộ biến `--hdr-*`.
- **Icon nhận diện là bộ riêng** (`VciIcon`, vẽ theo logo: vòng hở 3 cung + chấm nhấn), icon chrome vẫn là `SystemIcon`;
  cấu hình (Dock, bảng lệnh) khai `AppIconName` để chọn bộ nào cũng được mà nơi vẽ không rẽ nhánh.

Luật: `light-theme.md` (ngôn ngữ sáng — đọc đầu tiên khi làm giao diện) · `visual-hierarchy.md` §0b · `color-system.md`
· `vci-icon-system.md` · `data-entry-table.md` (bảng nhập liệu) · note: `notes/code/widgets-header.md`.

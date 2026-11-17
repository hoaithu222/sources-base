# Quy tắc SEO

> Áp dụng cho **mọi route dưới `src/app/[locale]/`**. Phần nền (title template, canonical, hreflang, OG, sitemap, robots, font, viewport, header) đã dựng MỘT lần ở `core/seo` + root layout
> (`architecture.md` §6) — trang mới chỉ cần khai đúng vài thứ. Trang công khai là thứ công cụ tìm kiếm chấm điểm (nội dung + Core Web Vitals); trang riêng tư KHÔNG được lọt vào kết quả.
> Vi phạm mục **⛔** → **block merge**. Hướng dẫn từng bước: `docs/guides/seo.md` · chuỗi dịch: `rules/i18n/i18n.md`.

---

## 0. Quyết định đầu tiên: công khai hay riêng tư?

| Loại | Ví dụ | Metadata | `robots.txt` | `sitemap.xml` | Nơi khai |
|---|---|---|---|---|---|
| **Công khai** (nhóm `(public)`) | `/`, `/about` | `buildPageMetadata` — được lập chỉ mục | cho phép | CÓ | `PUBLIC_ROUTES` ở `app/_navigation/public-routes.ts` |
| **Trang khách** (nhóm `(auth)`) | `/login`, `/register`… | `noindex` (layout + `generatePageMetadata`) | `Disallow` | không | `GUEST_ONLY_PATHS` (`shared/constants/paths.constants.ts`) → `PRIVATE_PATHS` |
| **Vùng làm việc** (nhóm `(app)`) | `/dashboard`, `/demo`… | `noindex` (layout + `generatePageMetadata`); `proxy.ts` chặn người chưa đăng nhập | `Disallow` | không | `PROTECTED_PATH_PREFIXES` → `PRIVATE_PATHS` |
| **Trạng thái** | `/403` · 404 | `noindex` (403 qua `generatePageMetadata`; 404 Next tự thêm + trả HTTP 404) | `Disallow` `/403` | không | `PATHS.FORBIDDEN` → `PRIVATE_PATHS` |
| **API** | `/api/*` | — | `Disallow: /api/` | không | header `X-Robots-Tag: noindex, nofollow` ở `next.config.ts` |
| **Bản preview / staging** | mọi route | `noindex, nofollow` | `Disallow: /` | rỗng | `SEO_ALLOW_INDEXING` (§8) |

- ⛔ Mỗi giá trị của `PATHS` thuộc ĐÚNG MỘT nhóm (công khai hoặc riêng tư) — `tests/app/seo-routes.test.ts` đỏ nếu thêm path mà quên xếp nhóm, hoặc nếu hai danh sách giao nhau, hoặc
  `PUBLIC_ROUTES` trỏ tới path không có `page.tsx`.
- **An toàn mặc định:** `generatePageMetadata` có `noIndex = true`. Thêm trang mới mà quên khai là trang đó KHÔNG lọt vào Google — muốn công khai phải TỰ truyền `noIndex: false` (hoặc dùng `buildPageMetadata`).
- ⛔ `robots.txt` chỉ là LỜI MỜI, không phải kiểm soát truy cập (`rules/data/security-checklist.md` §15): trang riêng tư dựa vào `proxy.ts` + `noindex`, không phải `Disallow`.

---

## 1. Checklist từng trang công khai

| # | Việc | Cách làm | Kiểm bằng |
|---|---|---|---|
| 1 | Tiêu đề + mô tả riêng, dịch đủ mọi ngôn ngữ | `generateMetadata` → `buildPageMetadata` (§2); chữ ở `metadata.<key>` | `view-source` · `check:i18n` |
| 2 | **Canonical** + **hreflang** (mọi ngôn ngữ + `x-default`) | `buildPageMetadata` tự thêm (§4) | `curl` (§12) |
| 3 | Thêm vào sitemap | một dòng ở `PUBLIC_ROUTES` | `/sitemap.xml` |
| 4 | **Một `<h1>`**, heading đi đúng cấp h1 → h2 → h3 | view của trang (§5) | DevTools / Lighthouse |
| 5 | Landmark: `<header>` · `<nav aria-label>` · `<main>` · `<footer>` | `(public)/layout.tsx` đã có; view KHÔNG dựng `<main>` thứ hai | Lighthouse a11y |
| 6 | JSON-LD đúng loại | builder ở `core/seo` + `<JsonLd>` (§6) | Rich Results Test |
| 7 | Ảnh: `next/image` có `width` / `height` / `alt`; `priority` CHỈ cho ảnh LCP | §5 | Lighthouse (CLS, LCP) |
| 8 | Liên kết là `<Link href>` thật (có `<a href>` trong HTML) | `Link` của `@/core/i18n` | `curl` + `grep '<a '` |
| 9 | Nội dung chính render Ở SERVER (không phải đợi JS) | Server Component; không `'use client'` ở view nội dung | `view-source` thấy chữ |
| 10 | Route vẫn **tĩnh** (SSG) | không `cookies()` / `headers()` / `searchParams` trong layout / page | bảng `Route (app)` của `npm run build` không có `ƒ` |
| 11 | Ảnh Open Graph đúng ngôn ngữ | mặc định `[locale]/opengraph-image.tsx`; riêng cho trang → §7 | Facebook / LinkedIn debugger |

---

## 2. Metadata: `generatePageMetadata` hay `buildPageMetadata`

| | `generatePageMetadata` (`app/_seo/page-metadata.ts`) | `buildPageMetadata` (`core/seo/metadata.ts`) |
|---|---|---|
| Dùng cho | Trang thường: một dòng, chữ lấy từ `metadata.<key>` | Trang cần thêm thứ (JSON-LD, `absoluteTitle`, `ogType`, ảnh OG riêng) |
| `noIndex` | Mặc định **`true`** (an toàn) | Mặc định `false` (cho lập chỉ mục) — trang riêng tư PHẢI truyền `noIndex: true` |
| Tiêu đề | `%s \| Tên site` (template ở root) | như bên cạnh; `absoluteTitle: true` bỏ phần `\| Tên site` (trang chủ) |

```tsx
// Trang RIÊNG TƯ / trạng thái — (auth), (app), 403
export const generateMetadata = ({ params }: PageProps<'/[locale]/login'>) =>
  generatePageMetadata({ params, key: 'login', path: PATHS.LOGIN });

// Trang CÔNG KHAI — (public)/about/page.tsx
export async function generateMetadata({ params }: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'metadata.about' });
  return buildPageMetadata({ locale, path: PATHS.ABOUT, title: t('title'), description: t('description') });
}
```

- `path` là đường dẫn KHÔNG tiền tố ngôn ngữ (`PATHS.*`) — nền của canonical + hreflang. Sai `path` là sai canonical của cả hai ngôn ngữ.
- Mỗi khoá mới ở `metadata.<key>` có `title` + `description` ở MỌI ngôn ngữ (`PageMetadataKey` bắt thiếu khoá).
- Layout nhóm riêng tư còn đặt `export const metadata = { robots: { index: false, follow: false } }` (`(auth)/layout.tsx`, `(app)/layout.tsx`) — lớp bảo hiểm thứ hai cho mọi trang con.
- Độ dài: title ≲ 60 ký tự, description ~120–160; MỖI trang và MỖI ngôn ngữ một câu riêng (không chép; bản `en` là tiếng Anh thật). Không nhồi từ khoá.

---

## 3. ⛔ Cái bẫy gộp metadata của Next

Next **KHÔNG gộp sâu** các khối con. Hệ quả đã tính sẵn vào `buildPageMetadata`:

| Khối | Điều gì xảy ra | Cách tránh |
|---|---|---|
| `openGraph` · `twitter` | Trang khai `openGraph` là **thay NGUYÊN khối** của layout (mất `siteName`, `locale`, `type`, `images`) | `buildPageMetadata` LẶP LẠI `siteName` / `locale` / `alternateLocale` / `type` / `images` ở mỗi trang. ⛔ Đừng tự viết `openGraph: { title }` trong page |
| `robots` | `robots: undefined` ở trang vẫn là "có khoá" → **ghi đè** khối `index + googleBot` của layout | Khoá `robots` phải VẮNG MẶT khi cho lập chỉ mục (`...(noIndex ? { robots } : {})`) — KHÔNG gán `undefined` |
| Ảnh OG từ file (`opengraph-image.tsx`) | Next chỉ tự gắn khi `openGraph` / `twitter` CÙNG CẤP **không có khoá `images`** (`hasOwnProperty('images')`); vì `buildPageMetadata` luôn khai `images` tường minh nên file cạnh `page.tsx` bị BỎ QUA | Ảnh riêng cho một trang: xem §7 — ghi đè `images` hoặc bỏ HẲN khoá `images` |
| `title` | `title: 'X'` là chuỗi → áp template `%s \| Tên site`; `{ absolute }` thì không | Dùng `absoluteTitle` thay vì tự ghép |

Cách kiểm sau mỗi lần đổi metadata: `npm run build && npm start`, rồi `curl` lấy thẻ (§12) và đối chiếu — `npm run dev` không phản ánh đúng kết quả cuối.

---

## 4. Canonical + hreflang

- `buildAlternates(path, locale, origin)` (`core/seo/url.utils.ts`) trả `canonical` (CHÍNH trang đó, tự trỏ) + `languages` cho MỌI ngôn ngữ (cả chính nó, theo khuyến nghị của Google) + `x-default` = ngôn ngữ mặc định (`vi`).
- URL luôn TUYỆT ĐỐI: root layout đặt `metadataBase = getSiteOrigin()`; origin lấy từ `NEXT_PUBLIC_SITE_URL` (§8). Origin sai = canonical / sitemap / OG sai trên cả site.
- Quy tắc tiền tố của `localizedPath` PHẢI khớp `routing.localePrefix` (`as-needed`): `vi` không tiền tố, ngôn ngữ khác có (`/en/about`). Đổi một bên mà quên bên kia → test so với `getPathname` của next-intl đỏ.
- hreflang hai chiều: trang `vi` liệt kê `en` và ngược lại. ⛔ Mọi route trong `PUBLIC_ROUTES` PHẢI có bản dịch ở MỌI ngôn ngữ (sitemap và hreflang phát cho từng ngôn ngữ); trang chưa có đủ bản dịch thì
  KHÔNG đưa vào `PUBLIC_ROUTES` (đừng công khai nửa vời) — làm xong bản dịch rồi mới thêm, tránh hreflang / sitemap trỏ vào 404.
- Query string (`?tab=`, `?page=`) KHÔNG đổi canonical — canonical luôn là path sạch, tránh nhân bản qua tham số.
- Không có `alternateLinks` của next-intl (đã tắt ở `routing.ts`): hreflang chỉ xuất MỘT lần qua Metadata API.

---

## 5. Cấu trúc nội dung: heading, landmark, liên kết, ảnh, font

- ⛔ **Một `<h1>` mỗi trang** (tiêu đề trang, đúng chủ đề của `<title>`); thứ bậc h1 → h2 → h3 không nhảy cấp. Chữ heading từ message. Trang auth hiện thiếu h1 / h2 (nhảy cấp) — `known-issues.md` §B.
- **Landmark**: `(public)/layout.tsx` có `<header>` (trong `PublicHeader`) · `<nav aria-label>` · `<main id="main-content">` · `<footer>` + liên kết "Bỏ qua tới nội dung" (`site.skipToContent`). View của trang chỉ là nội dung bên trong `<main>`.
- **Liên kết crawl được**: `<Link href>` render ra `<a href>` thật trong HTML. ⛔ Không `<div onClick>` / `<button>` + `router.push` / `href="#"` cho điều hướng (bot không bấm chuột; `rules/interaction/navigable-controls.md`).
  Chữ liên kết mô tả được đích ("Giới thiệu", không "bấm vào đây"); liên kết ra ngoài có `rel="noopener noreferrer"` (`NEW_TAB_LINK_PROPS`).
- **Ảnh nội dung trang công khai dùng `next/image`**: `width` + `height` (hoặc `fill` trong khung có tỉ lệ) để giữ chỗ → CLS ≈ 0; `alt` dịch được (ảnh trang trí `alt=""`); `sizes` đúng bề rộng hiển thị;
  **`priority` CHỈ cho ảnh LCP của trang** (thường một ảnh hero trên màn đầu) — `priority` mọi nơi là tranh băng thông của chính ảnh LCP. Ảnh từ host ngoài khai ở `images.remotePatterns` (`next.config.ts`);
  AVIF / WebP và cache 31 ngày đã bật. `Image` / `ImagePreview` của UI kit (`<img>`, ảnh hệ thống / dữ liệu) dành cho vùng làm việc — trang marketing chưa có ảnh nào, khi thêm thì dùng `next/image`.
- **Font tự host qua `next/font`** (`app/[locale]/layout.tsx`): không `<link>` Google Fonts, `display: 'swap'`, subset `vietnamese` + `latin-ext` — CLS thấp, không request ngoài lúc chạy (`rules/styling/font-system.md`).
- `<html lang>` đúng ngôn ngữ (`LOCALE_META[locale].htmlLang`); đoạn ngôn ngữ khác trong trang có `lang` riêng.

---

## 6. Dữ liệu có cấu trúc (JSON-LD)

| Trang | JSON-LD | Builder (`core/seo/json-ld.utils.ts`) |
|---|---|---|
| `/` (`(public)/page.tsx`) | `WebSite` + `Organization` | `websiteJsonLd` · `organizationJsonLd` |
| `/about` (`(public)/about/page.tsx`) | `WebPage` + `BreadcrumbList` | `webPageJsonLd` · `breadcrumbJsonLd` |

```tsx
// Server Component (page.tsx) — dữ liệu dựng bằng builder, nhúng bằng <JsonLd>
<JsonLd data={[webPageJsonLd({ name, url, description, inLanguage: LOCALE_META[locale].htmlLang, isPartOf: homeUrl }), breadcrumbJsonLd(trail)]} />
```

- ⛔ Luôn đi qua `<JsonLd>` / `serializeJsonLd`: nó thay `<` bằng `<` nên chuỗi do người dùng nhập chứa `</script>` KHÔNG thoát được thẻ `<script>` (XSS — `security-checklist.md` §3). Không tự `JSON.stringify` rồi nhét vào `<script>`.
- Thẻ là `<script type="application/ld+json">` thuần, KHÔNG `next/script` (dữ liệu, không phải mã chạy).
- Builder có kiểu từ `schema-dts` — loại mới (`Article`, `Product`, `FAQPage`…) thì thêm builder vào `json-ld.utils.ts` + xuất ở `core/seo/index.ts`, đừng viết object tay trong page.
- Dữ liệu PHẢI khớp nội dung thấy được trên trang; `url` tuyệt đối (`absoluteUrl` + `localizedPath`); `inLanguage` theo ngôn ngữ của trang; breadcrumb bắt đầu từ trang chủ, thứ tự `position` 1-based.
- JSON-LD nằm trong HTML tĩnh — không tạo ở client (bot đọc HTML ban đầu).

---

## 7. Ảnh Open Graph + font tiếng Việt

- Mặc định: `app/[locale]/opengraph-image.tsx` sinh PNG **1200×630** theo ngôn ngữ (`landing.hero.title` + `metadata.site.description` + tên site), URL `/opengraph-image` (vi) · `/en/opengraph-image`;
  `buildPageMetadata` khai tường minh làm `og:image` + `twitter:image` (kèm `width` / `height` / `alt`). Sinh lúc build nhờ `generateStaticParams`.
- ⛔ **Font phải nạp tay và PHẢI có glyph tiếng Việt.** Satori (`next/og`) không dùng font hệ thống: dùng Noto Sans `latin` + `vietnamese` ở `src/assets/fonts/og/` (OFL, kèm giấy phép). Satori chỉ đọc **TTF / OTF / WOFF**, KHÔNG đọc WOFF2.
  Thiếu subset `vietnamese` là mất dấu (ô vuông). Thêm ngôn ngữ dùng chữ khác (Hán, Thái, Ả Rập…) → thêm subset tương ứng.
- Đóng gói `output: 'standalone'` (Docker): font đọc bằng `fs` lúc chạy nên `outputFileTracingIncludes` ở `next.config.ts` phải mang thư mục font theo.
- Thiết kế: chữ lớn, tương phản cao, ≤ 3 dòng, vùng an toàn ~72px (nền tảng cắt mép khác nhau); kiểm bằng debugger của Facebook / LinkedIn / Zalo chia sẻ thử.
- **Ảnh riêng cho một trang** (vì bẫy §3): (a) ảnh tĩnh — đặt PNG ở `public/og/` rồi ghi đè `openGraph.images` + `twitter.images` sau `buildPageMetadata`; (b) ảnh sinh động — đặt `opengraph-image.tsx` cạnh `page.tsx` VÀ bỏ hẳn khoá `images`
  (không phải `undefined`) khỏi `openGraph` / `twitter` để Next tự gắn file. Từng bước: `guides/seo.md`.

---

## 8. `sitemap.xml`, `robots.txt`, môi trường

- **Sitemap** (`app/sitemap.ts` ← `buildSitemap(PUBLIC_ROUTES, origin)`): mỗi route công khai một mục CHO TỪNG ngôn ngữ, kèm `alternates.languages`; chỉ URL canonical, lập chỉ mục được. `changeFrequency` / `priority` / `lastModified` tuỳ chọn.
  Nội dung động (bài viết, sản phẩm): nối dữ liệu vào `sitemap.ts` (mỗi mục một `PublicRoute`); quá 50.000 URL thì tách bằng `generateSitemaps`.
- **Robots** (`app/robots.ts` ← `buildRobots`): production `Allow: /`, `Disallow: /api/` + mọi `PRIVATE_PATHS` (cả bản `/en/…`), có dòng `Sitemap:` + `Host:`. Môi trường không lập chỉ mục: `Disallow: /`, sitemap rỗng.
- **`SEO_ALLOW_INDEXING`** (biến server): `true | false`; bỏ trống thì tự suy — `VERCEL_ENV === 'production'` trên Vercel, ngoài Vercel là `NODE_ENV === 'production'`.
  ⚠️ Staging TỰ build bằng `next build` cũng có `NODE_ENV=production` nên MẶC ĐỊNH được lập chỉ mục — đặt `SEO_ALLOW_INDEXING=false` cho staging / preview tự dựng.
- ⚠️ `robots.txt`, `sitemap.xml`, metadata `robots` được sinh **LÚC BUILD** (tĩnh) — đổi `SEO_ALLOW_INDEXING` / `NEXT_PUBLIC_SITE_URL` phải build lại, không đổi được lúc chạy.
- **`NEXT_PUBLIC_SITE_URL`**: gốc site THẬT, không kèm đường dẫn / dấu `/` cuối (`https://example.com`). `npm run build` ở chế độ `app` DỪNG nếu thiếu (trừ khi Vercel cấp `VERCEL_PROJECT_PRODUCTION_URL`).
  Mặc định `http://localhost:3000` chỉ hợp lý lúc phát triển.
- **Xác minh quyền sở hữu**: `GOOGLE_SITE_VERIFICATION` · `BING_SITE_VERIFICATION` (chỉ mã, không cả thẻ) → root layout xuất `<meta name="google-site-verification">` / `msvalidate.01`.

---

## 9. Core Web Vitals — những đòn bẩy đã có, đừng phá

| Đòn bẩy | Nơi | Tác dụng |
|---|---|---|
| **Mọi route `[locale]/…` là SSG**; ngôn ngữ từ tham số route, không từ header | `core/i18n/request.ts`, `generateStaticParams` ở layout | HTML dựng sẵn → TTFB / LCP tốt, cache CDN |
| **Provider chia hai tầng**: `BaseProviders` ở root, `AppProviders` chỉ ở `(workspace)` | `app/_providers` | Trang marketing KHÔNG tải React Query, Zustand phiên, toast, biểu đồ → ít JS (TBT / INP) |
| **Nội dung là Server Component** (`LandingView`, `AboutView`) | `app/_views` | Không thêm byte JS cho chữ / bố cục |
| **Không thư viện nặng ở layout / barrel dùng chung** (`recharts`, `@dnd-kit`, `react-arborist`) | quy tắc `architecture.md` §16 | Bundle trang đầu nhỏ; kiểm bằng `npm run analyze` |
| `next/font` tự host + font dự phòng canh số đo | root layout | CLS gần 0, không request Google |
| `next/image` (`width` / `height`, `priority` đúng chỗ, AVIF / WebP) | `next.config.ts` `images` | LCP + CLS |
| Script giao diện đồng bộ ở `<head>` (`appearanceInitScript`) | root layout | Không nháy sáng → tối (CLS cảm nhận) |
| `reactCompiler` + `optimizePackageImports` | `next.config.ts` | Ít re-render, tree-shake thư viện nhiều export |
| `loading.tsx` ở vùng làm việc | `(workspace)/(app)/loading.tsx` | Chuyển trang hiện khung ngay, không trắng |

- ⛔ **Sau mỗi lần thêm route / sửa layout, đọc bảng `Route (app)` của `npm run build`**: không có `ƒ` (động) ngoài `[...rest]` và `/api/*`. Thứ làm route động: `cookies()` · `headers()` · `searchParams` · `useSearchParams` thiếu `<Suspense>`.
- Script bên thứ ba (analytics, chat) nạp bằng `next/script` với `strategy="lazyOnload"` (hoặc `afterInteractive`), KHÔNG `<script>` chặn render; đặt ở layout nhóm cần nó, không ở root layout.
- Đo trên bản `npm run build && npm start`, không phải `npm run dev`. Lighthouse trên điện thoại giả lập (4× CPU) cho trang `/` và `/about`.

---

## 10. ⛔ Tránh

| ❌ Đừng | Vì sao | ✅ Thay bằng |
|---|---|---|
| Render nội dung chính chỉ ở client (`'use client'` + `useEffect` fetch) | Bot / JS chậm thấy trang rỗng | Server Component, dữ liệu qua `fetch` ở server (`api-patterns.md` §0) |
| `useSearchParams` không có `<Suspense>` | Đẩy cả route sang render client / `next build` báo lỗi | Bọc `<Suspense>` ở `page.tsx` |
| `cookies()` / `headers()` trong layout công khai | Route thành render động — mất SSG, mất cache | Đọc ở client sau hydrate; ngôn ngữ từ tham số route |
| Hai ngôn ngữ cùng nội dung mà thiếu hreflang / canonical | Bị coi là nội dung trùng lặp | `buildPageMetadata` (canonical tự trỏ + hreflang) |
| Dịch máy chép nguyên title / description giữa các ngôn ngữ | Trùng lặp, mất xếp hạng | Câu riêng từng ngôn ngữ |
| Tự viết `openGraph` / `robots` trong `generateMetadata` | Thay nguyên khối của layout (§3) | `buildPageMetadata` |
| `robots: undefined` | Ghi đè khối `index + googleBot` | Để VẮNG MẶT khoá |
| Nhiều `<h1>`; nhảy cấp heading; heading chỉ để làm to chữ | Mất cấu trúc tài liệu | Một `<h1>`, đúng cấp; kiểu chữ bằng class `text-*` |
| `<img>` không `width` / `height` / `alt` | CLS, mất ngữ nghĩa ảnh | `next/image` |
| `priority` cho mọi ảnh | Tranh băng thông với ảnh LCP | Chỉ ảnh LCP |
| `<Link>` / `<a>` trỏ về trang noindex làm lối chính từ trang công khai | Lãng phí crawl budget | Nút "Đăng nhập" là chấp nhận được; còn lại hạn chế |
| Sửa `robots.txt` / `sitemap.xml` tay trong `public/` | Hai nguồn sự thật, lệch `PUBLIC_ROUTES` | Sửa `PUBLIC_ROUTES` / `PRIVATE_PATHS` |
| Đặt `Disallow` rồi mong `noindex` có hiệu lực | Bot không đọc được trang bị chặn nên không thấy `noindex` | Trang cần loại khỏi chỉ mục: cho crawl + `noindex`; trang đứng sau đăng nhập đã có `proxy.ts` |

---

## 11. Search Console / Bing Webmaster

1. Đặt `NEXT_PUBLIC_SITE_URL` + `GOOGLE_SITE_VERIFICATION` (và `BING_SITE_VERIFICATION`) ở môi trường production, build lại, triển khai.
2. Search Console → thêm property (tiền tố URL) → xác minh bằng thẻ `<meta>` → gửi `https://<site>/sitemap.xml`.
3. Dùng "Kiểm tra URL" cho `/` và `/en`: xem "Canonical do người dùng khai báo" khớp, hreflang không báo lỗi, dữ liệu có cấu trúc hợp lệ.
4. Theo dõi "Core Web Vitals" và "Lập chỉ mục trang" — trang riêng tư xuất hiện ở "Đã loại trừ bởi thẻ noindex" là ĐÚNG.

---

## 12. Cách kiểm (bản build, không phải dev)

```bash
npm run build && npm start        # bảng Route (app) không có `ƒ` ngoài [...rest] và /api/*

# Thẻ SEO của một trang
curl -s http://localhost:3000/about | grep -oE '<(title|link rel="canonical"|link rel="alternate"|meta name="robots"|meta name="description"|meta property="og:[a-z:]+")[^>]*>'
curl -s http://localhost:3000/about | grep -o '<h1' | wc -l                       # đúng 1
curl -s http://localhost:3000/en/about | grep -oE '<html[^>]*lang="[a-z-]+"'      # lang="en"

# Tệp sinh ra
curl -s http://localhost:3000/robots.txt
curl -s http://localhost:3000/sitemap.xml
curl -sI http://localhost:3000/opengraph-image | grep -i content-type             # image/png
curl -s http://localhost:3000/manifest.webmanifest

# Header
curl -sI http://localhost:3000/api/ping | grep -i x-robots-tag                    # noindex, nofollow
curl -sI http://localhost:3000/ | grep -iE 'x-frame-options|x-content-type-options|referrer-policy'
```

- Trang riêng tư (`/login`, `/dashboard`): `curl` thấy `<meta name="robots" content="noindex, nofollow">`; `/dashboard` chưa đăng nhập (chế độ `app`, `NEXT_PUBLIC_AUTH_ENABLED` bật) → 307 sang `/login?next=…`.
- JSON-LD: dán URL vào **Rich Results Test** / **Schema Markup Validator**; ảnh chia sẻ: **Facebook Sharing Debugger**, **LinkedIn Post Inspector**.
- Hiệu năng: **Lighthouse** (DevTools) / **PageSpeed Insights** trên URL production; `npm run analyze` cho kích thước bundle.
- Mọi thứ trên là bản build tĩnh: sau khi đổi env hoặc `PUBLIC_ROUTES`, build lại rồi mới `curl`.

---

## 13. Checklist trước khi commit trang mới

- [ ] Quyết định xong công khai / riêng tư; path có trong `PATHS` và nằm đúng MỘT nhóm (`PUBLIC_ROUTES` hoặc `PRIVATE_PATHS`)
- [ ] `generateMetadata` dùng `buildPageMetadata` / `generatePageMetadata`; khoá `metadata.<key>` có ở MỌI ngôn ngữ
- [ ] Trang riêng tư `noindex` (mặc định `generatePageMetadata`); trang công khai `noIndex: false` / `buildPageMetadata`
- [ ] Một `<h1>`, heading đúng cấp, ảnh `next/image` có `alt` + kích thước, `priority` chỉ ảnh LCP
- [ ] JSON-LD (nếu có) qua builder + `<JsonLd>`
- [ ] Liên kết là `<Link href>`; không `cookies()` / `headers()`; `useSearchParams` có `<Suspense>`
- [ ] `npm run build`: route không `ƒ`; `curl` thấy canonical + hreflang + robots đúng; `npm run check` xanh

---

## 14. Liên quan

`guides/seo.md` (thêm trang công khai / riêng tư, ảnh OG riêng, env production, lỗi thường gặp) · `rules/i18n/i18n.md` §6, §9 · `architecture.md` §3, §6 · `rules/data/security-checklist.md` §3, §11, §15 ·
`rules/structure/routing-conventions.md` · `rules/styling/font-system.md` · `rules/foundations/quality-gates.md`

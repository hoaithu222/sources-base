# Hướng dẫn SEO — thêm trang, ảnh Open Graph, môi trường production, kiểm tra

> Đọc xong là tự làm được: thêm một trang công khai (có trong sitemap), thêm một trang riêng tư (không lọt vào Google), đặt ảnh chia sẻ riêng cho một trang, cấu hình môi trường production, và kiểm bằng lệnh.
> File này là HƯỚNG DẪN, không đặt luật: luật nằm ở [`rules/seo/seo.md`](../rules/seo/seo.md); chuỗi dịch: [`rules/i18n/i18n.md`](../rules/i18n/i18n.md) · [`i18n.md`](i18n.md);
> lý do thiết kế: [`architecture.md`](../architecture.md) §6. Mọi tên file / hàm dưới đây là code THẬT (trang `/pricing` là ví dụ minh hoạ — chép rồi đổi tên); thấy lệch thì code là nguồn thật, sửa file này trong cùng PR.

**Mục lục**

1. Thêm một trang công khai
2. Thêm một trang riêng tư
3. Ảnh Open Graph riêng cho một trang
4. Môi trường production
5. Kiểm bằng lệnh
6. Lỗi thường gặp
7. Checklist

---

## 1. Thêm một trang công khai

**Ví dụ:** `/pricing` ("Bảng giá") — tĩnh (SSG), có trong sitemap, có JSON-LD, hai ngôn ngữ.

**Bước 1 — Khai path.** Thêm vào `PATHS` ở `src/shared/constants/paths.constants.ts` (KHÔNG thêm vào `GUEST_ONLY_PATHS` / `PROTECTED_PATH_PREFIXES` — đó là nhóm riêng tư):

```ts
export const PATHS = { …, PRICING: '/pricing' } as const;
```

**Bước 2 — Chữ metadata (cả hai ngôn ngữ).** Thêm khoá vào `src/messages/vi/metadata.json` và `src/messages/en/metadata.json`:

```jsonc
// vi/metadata.json                                       // en/metadata.json
"pricing": {                                              "pricing": {
  "title": "Bảng giá",                                      "title": "Pricing",
  "description": "So sánh các gói và chọn gói phù hợp…"      "description": "Compare plans and pick the right one…"
}                                                         }
```

Chữ nội dung trang để ở namespace riêng (`pricing.json`, chỉ server — `guides/i18n.md` §3), KHÔNG nhét vào `metadata`.

**Bước 3 — File route** `src/app/[locale]/(public)/pricing/page.tsx` — MỎNG: metadata + JSON-LD + ghép một view:

```tsx
import type { Metadata } from 'next';

import PricingView from '@/app/_views/PricingView';
import { LOCALE_META } from '@/core/i18n';
import { getTranslations, requireLocale } from '@/core/i18n/server';
import { absoluteUrl, breadcrumbJsonLd, buildPageMetadata, getSiteOrigin, JsonLd, localizedPath, webPageJsonLd } from '@/core/seo';
import { PATHS } from '@/shared/constants/paths.constants';

export async function generateMetadata({ params }: PageProps<'/[locale]/pricing'>): Promise<Metadata> {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'metadata.pricing' });
  return buildPageMetadata({ locale, path: PATHS.PRICING, title: t('title'), description: t('description') });
}

export default async function PricingPage({ params }: PageProps<'/[locale]/pricing'>) {
  const locale = requireLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'metadata.pricing' });
  const tPage = await getTranslations({ locale, namespace: 'pricing' });   // chữ nội dung trang (namespace riêng)
  const origin = getSiteOrigin();
  const homeUrl = absoluteUrl(origin, localizedPath(PATHS.HOME, locale));
  const url = absoluteUrl(origin, localizedPath(PATHS.PRICING, locale));

  return (
    <>
      <JsonLd
        data={[
          webPageJsonLd({ name: t('title'), url, description: t('description'), inLanguage: LOCALE_META[locale].htmlLang, isPartOf: homeUrl }),
          breadcrumbJsonLd([{ name: tPage('breadcrumbHome'), url: homeUrl }, { name: t('title'), url }]),
        ]}
      />
      <PricingView />
    </>
  );
}
```

- Mẫu thật để chép: `src/app/[locale]/(public)/about/page.tsx` (WebPage + BreadcrumbList) và `src/app/[locale]/(public)/page.tsx` (WebSite + Organization, `absoluteTitle`).
- Trang KHÔNG cần JSON-LD thì rút gọn: `export const generateMetadata = ({ params }: PageProps<'/[locale]/pricing'>) => generatePageMetadata({ params, key: 'pricing', path: PATHS.PRICING, noIndex: false })` —
  ⛔ phải truyền **`noIndex: false`**, vì `generatePageMetadata` mặc định `noindex` (`app/_seo/page-metadata.ts`).
- `PageProps<'/[locale]/pricing'>` là kiểu Next sinh ra: chạy `npm run typecheck` (`next typegen`) sau khi tạo route để có kiểu.
- Chữ trong `breadcrumbJsonLd` / heading lấy từ message (`getTranslations`), không viết cứng — mẫu: khoá `about.breadcrumbHome` ở `about/page.tsx`.

**Bước 4 — View** `PricingView` ở `src/app/_views/` — Server Component (KHÔNG `'use client'`): đúng MỘT `<h1>`, h2 / h3 đúng cấp, chữ từ `useTranslations('pricing')`, liên kết bằng `Link` của `@/core/i18n`, ảnh bằng `next/image` có `width` / `height` / `alt` (`rules/seo/seo.md` §5). Không dựng `<main>` — `(public)/layout.tsx` đã có.

**Bước 5 — Vào sitemap.** Thêm một dòng ở `src/app/_navigation/public-routes.ts`:

```ts
export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  { path: PATHS.HOME, changeFrequency: 'weekly', priority: 1 },
  { path: PATHS.ABOUT, changeFrequency: 'monthly', priority: 0.7 },
  { path: PATHS.PRICING, changeFrequency: 'monthly', priority: 0.8 },   // ← mới
];
```

Sitemap tự phát một mục cho TỪNG ngôn ngữ kèm hreflang. ⛔ Chỉ thêm khi đã có bản dịch đủ mọi ngôn ngữ.

**Bước 6 — Nối từ chỗ có sẵn** (liên kết nội bộ giúp bot tìm ra trang): thêm `<Link href={PATHS.PRICING}>` vào `PublicHeader` / `PublicFooter` (`src/app/_layouts/public/`) với khoá chữ `site.header.pricing` ở CẢ hai ngôn ngữ.

**Bước 7 — Kiểm** (§5) rồi `npm run check`. `tests/app/seo-routes.test.ts` bắt: path chưa xếp nhóm, `PUBLIC_ROUTES` trỏ path không có `page.tsx`, trùng path.

---

## 2. Thêm một trang riêng tư

Mặc định an toàn: `generatePageMetadata` → `noindex`. Việc cần làm là xếp path đúng nhóm để `proxy.ts`, `robots.txt` và test cùng biết.

| Loại trang | Thư mục | Khai path ở | Metadata |
|---|---|---|---|
| Vùng làm việc (cần đăng nhập) | `src/app/[locale]/(workspace)/(app)/<đường>/page.tsx` | `PATHS` + `PROTECTED_PATH_PREFIXES` (`paths.constants.ts`) — `proxy.ts` chặn người chưa đăng nhập, `robots.txt` `Disallow` | `generatePageMetadata({ params, key, path })` |
| Trang khách (đăng nhập / đăng ký…) | `src/app/[locale]/(workspace)/(auth)/<đường>/page.tsx` | `PATHS` + `GUEST_ONLY_PATHS` | như trên |
| Trang trạng thái đứng riêng (như `/403`) | `src/app/[locale]/<đường>/page.tsx` | `PATHS` + thêm thẳng vào `PRIVATE_PATHS` (`public-routes.ts`) | như trên |

```tsx
// src/app/[locale]/(workspace)/(app)/reports/page.tsx
export const generateMetadata = ({ params }: PageProps<'/[locale]/reports'>) =>
  generatePageMetadata({ params, key: 'reports', path: PATHS.REPORTS });   // noIndex mặc định true

export default function ReportsPage() {
  return <ReportsView />;
}
```

- Thêm khoá `metadata.reports.{title,description}` ở CẢ hai ngôn ngữ (`PageMetadataKey` bắt thiếu).
- Layout `(app)` và `(auth)` đã đặt `robots: { index: false, follow: false }` cho mọi trang con — lớp bảo hiểm thứ hai.
- KHÔNG thêm vào `PUBLIC_ROUTES`. `PRIVATE_PATHS` = `PROTECTED_PATH_PREFIXES` + `GUEST_ONLY_PATHS` + `/403` nên hai nhóm đầu tự vào `robots.txt` (cả bản `/en/…`).
- Có menu (Dock, header, bảng lệnh) → khai thêm ở `NAV_PAGES` / `NAV_MODULES` (`guides/app-layer.md`).
- Ngoài `[locale]`: trang 404 do Next tự thêm `noindex`.

---

## 3. Ảnh Open Graph riêng cho một trang

Mặc định mọi trang dùng `src/app/[locale]/opengraph-image.tsx` (1200×630, đúng ngôn ngữ, font Noto Sans có glyph tiếng Việt). Cần ảnh riêng (vd bài viết, sản phẩm) — nhớ bẫy gộp metadata (`rules/seo/seo.md` §3):
`buildPageMetadata` luôn khai `openGraph.images` / `twitter.images`, nên một `opengraph-image.tsx` đặt cạnh `page.tsx` bị Next **bỏ qua** trừ khi khoá `images` VẮNG MẶT. Hai cách:

**Cách A — ảnh tĩnh (đơn giản, nên dùng trước).** Đặt PNG 1200×630 mỗi ngôn ngữ vào `public/og/` (vd `pricing-vi.png`, `pricing-en.png`), rồi ghi đè `images` sau `buildPageMetadata`:

```ts
const base = buildPageMetadata({ locale, path: PATHS.PRICING, title: t('title'), description: t('description') });
const images = [{ url: `/og/pricing-${locale}.png`, width: 1200, height: 630, alt: t('title') }];  // tương đối → Next nối `metadataBase`
return { ...base, openGraph: { ...base.openGraph, images }, twitter: { ...base.twitter, images } };
```

**Cách B — ảnh sinh động (Satori).** Đặt `opengraph-image.tsx` cạnh `page.tsx`, chép khung từ `src/app/[locale]/opengraph-image.tsx` (`size`, `contentType`, `generateStaticParams`, nạp font Noto Sans `latin` + `vietnamese` từ `src/assets/fonts/og`,
`requireLocale`). Rồi BỎ HẲN khoá `images` (KHÔNG gán `undefined`) để Next tự gắn ảnh của file:

```ts
const { openGraph, twitter, ...rest } = buildPageMetadata({ locale, path, title, description });
const { images: _ogImages, ...openGraphRest } = openGraph ?? {};
const { images: _twitterImages, ...twitterRest } = twitter ?? {};
return { ...rest, openGraph: openGraphRest, twitter: twitterRest };
```

- Đừng ghi cứng URL của ảnh sinh động: trang nằm trong route group `(public)` thì Next thêm hậu tố băm vào URL (`…/opengraph-image-<băm>`) — để Next gắn tự động.
- Cách B chưa có trang nào dùng trong base — **kiểm bằng `view-source`** sau `npm run build && npm start` (`og:image` phải trỏ tới ảnh của trang, không phải `/opengraph-image` chung). Dùng nhiều thì thêm tuỳ chọn (vd `ownImage`) vào `buildPageMetadata` thay vì chép đoạn trên.
- Font: thiếu subset `vietnamese` là mất dấu; Satori chỉ đọc TTF / OTF / **WOFF** (không WOFF2). Docker `standalone`: `outputFileTracingIncludes` ở `next.config.ts` phải liệt kê thư mục font mới nếu bạn thêm.
- Kiểm: Facebook Sharing Debugger / LinkedIn Post Inspector (bấm "Scrape again" — nền tảng cache ảnh cũ rất lâu).

---

## 4. Môi trường production

| Biến | Bắt buộc? | Ý nghĩa |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **BẮT BUỘC** ở chế độ `app` (trừ khi Vercel cấp host) | Gốc site thật, KHÔNG kèm đường dẫn / `/` cuối: `https://example.com`. Nền của canonical, hreflang, sitemap, `robots.txt`, OG. Thiếu → `npm run build` DỪNG |
| `NEXT_PUBLIC_API_BASE_URL` | Bắt buộc ở `app` | Gốc API — không phải SEO nhưng chặn cùng cổng build |
| `NEXT_PUBLIC_APP_NAME` | Nên đặt | Tên site trong `<title>` (`%s \| Tên site`), OG, JSON-LD, manifest (mặc định "Base App") |
| `SEO_ALLOW_INDEXING` | Tuỳ chọn | `true` / `false`. Bỏ trống: production = `true`, còn lại `false`. **Staging tự build (`next build`) cũng là `NODE_ENV=production` → đặt `false` tường minh** |
| `GOOGLE_SITE_VERIFICATION` | Tuỳ chọn | Mã xác minh Search Console (chỉ mã, không cả thẻ) → `<meta name="google-site-verification">` |
| `BING_SITE_VERIFICATION` | Tuỳ chọn | Mã Bing Webmaster → `<meta name="msvalidate.01">` |

Các biến công khai `NEXT_PUBLIC_*` vào bundle; biến còn lại chỉ ở server (`rules/data/security-checklist.md` §10). Mẫu đầy đủ + giải thích: `.env.example`.

1. Đặt biến ở môi trường production (Vercel: Project → Settings → Environment Variables, scope **Production**; Docker / VPS: biến lúc `npm run build`).
2. ⚠️ Các tệp **sinh LÚC BUILD** — `robots.txt`, `sitemap.xml`, metadata `robots`, canonical — nên đổi biến thì PHẢI build lại, không đổi được lúc chạy.
3. Vercel: `VERCEL_ENV` và `VERCEL_PROJECT_PRODUCTION_URL` do nền tảng cấp (dùng để suy `SEO_ALLOW_INDEXING` và host khi thiếu `NEXT_PUBLIC_SITE_URL`); có tên miền riêng thì vẫn nên khai `NEXT_PUBLIC_SITE_URL` tường minh. Preview deployment tự `noindex`.
4. Docker (`NEXT_OUTPUT=standalone`): font ảnh OG đi theo nhờ `outputFileTracingIncludes`; chạy `server.js` với biến server-only (`API_PROXY_TARGET`, `AUTH_SESSION_COOKIE`…).
5. Sau khi triển khai: kiểm (§5) → Search Console: thêm property, xác minh bằng thẻ meta, gửi `https://<site>/sitemap.xml`, "Kiểm tra URL" cho `/` và `/en` (`rules/seo/seo.md` §11).

---

## 5. Kiểm bằng lệnh

Luôn kiểm bản **build** — `npm run dev` không phản ánh SSG / metadata cuối.

```bash
npm run build && npm start            # bảng Route (app): không có `ƒ` ngoài [...rest] và /api/*

# 1) Thẻ SEO của trang
curl -s http://localhost:3000/pricing | grep -oE '<(title|link rel="canonical"|link rel="alternate"|meta name="robots"|meta name="description"|meta property="og:[a-z:]+")[^>]*>'
#    mong đợi: title có "| Tên site"; canonical = https://<site>/pricing; hreflang vi · en · x-default;
#    robots "index, follow"; og:image = https://<site>/opengraph-image (hoặc ảnh riêng của trang)
curl -s http://localhost:3000/en/pricing | grep -oE '<link rel="canonical"[^>]*>'   # canonical của bản en tự trỏ /en/pricing

# 2) Cấu trúc
curl -s http://localhost:3000/pricing | grep -o '<h1' | wc -l                      # đúng 1
curl -s http://localhost:3000/en/pricing | grep -oE '<html[^>]*lang="[a-z-]+"'      # lang="en"

# 3) Tệp sinh ra
curl -s http://localhost:3000/sitemap.xml | grep -A3 pricing                        # có /pricing và /en/pricing + xhtml:link
curl -s http://localhost:3000/robots.txt                                            # Disallow đủ đường riêng tư, có dòng Sitemap
curl -sI http://localhost:3000/opengraph-image | grep -i content-type               # image/png

# 4) Trang riêng tư + header
curl -s http://localhost:3000/login | grep -oE '<meta name="robots"[^>]*>'          # noindex, nofollow
curl -sI http://localhost:3000/dashboard | head -3                                  # 307 → /login?next=… (chế độ app)
curl -sI http://localhost:3000/api/ping | grep -i x-robots-tag                      # noindex, nofollow
```

- Tệp sinh lúc build cũng xem được ở `.next/server/app/robots.txt.body` và `sitemap.xml.body`.
- JSON-LD: dán URL vào **Rich Results Test** (`search.google.com/test/rich-results`) và **Schema Markup Validator** (`validator.schema.org`); không còn lỗi / cảnh báo bắt buộc.
- Hiệu năng: **Lighthouse** (DevTools, giả lập điện thoại) hoặc **PageSpeed Insights** trên URL production; `npm run analyze` cho bundle. Mục tiêu: LCP < 2,5 s · CLS < 0,1 · INP < 200 ms ở trang công khai.
- Chia sẻ: Facebook Sharing Debugger, LinkedIn Post Inspector; Zalo — gửi thử link vào một cuộc trò chuyện.
- Hreflang hai chiều: mở `/pricing` và `/en/pricing`, đối chiếu mỗi bên liệt kê CẢ HAI + `x-default`.

---

## 6. Lỗi thường gặp

| Hiện tượng | Nguyên nhân | Sửa |
|---|---|---|
| Canonical / hreflang / sitemap / OG trỏ `http://localhost:3000` trên production | Thiếu `NEXT_PUBLIC_SITE_URL` lúc build (rơi về mặc định dev) | Khai tường minh + build lại (build chế độ `app` đã chặn thiếu biến này) |
| Trang mới không có trong Google / sitemap | Quên `PUBLIC_ROUTES`; hoặc `generatePageMetadata` mặc định `noindex`; hoặc `SEO_ALLOW_INDEXING=false` | Thêm vào `PUBLIC_ROUTES`, truyền `noIndex: false`, kiểm biến môi trường (§4) |
| Trang riêng tư xuất hiện trong kết quả tìm kiếm | Quên `noIndex` / layout không `noindex` / path chưa ở `PRIVATE_PATHS`; hoặc bị liên kết từ ngoài trước khi chặn | Xếp path vào `PROTECTED_PATH_PREFIXES` / `GUEST_ONLY_PATHS`; `noindex` + (nếu đã vào chỉ mục) dùng công cụ "Xoá URL" của Search Console |
| Staging bị lập chỉ mục | `NODE_ENV=production` khi tự build nên `SEO_ALLOW_INDEXING` suy ra `true` | Đặt `SEO_ALLOW_INDEXING=false` cho staging, build lại |
| `robots.txt` / sitemap cũ sau khi đổi env | Sinh lúc build | Build lại rồi triển khai |
| Chia sẻ link mất `og:site_name` / `og:locale` / ảnh trên MỘT trang | Trang tự viết `openGraph: { … }` thay nguyên khối (bẫy §3 của rule) | Dùng `buildPageMetadata` |
| Trang có noindex nhưng vẫn `index, follow` | `robots: undefined` ghi đè, hoặc dựng metadata không qua `buildPageMetadata` | Để khoá `robots` VẮNG MẶT / dùng `noIndex: true` |
| `opengraph-image.tsx` cạnh page không có tác dụng | `buildPageMetadata` đã khai `images` (Next bỏ qua file) | §3 Cách A hoặc B |
| Ảnh OG thấy ô vuông thay dấu tiếng Việt | Thiếu font `vietnamese` / dùng WOFF2 | Nạp `noto-sans-vietnamese-*.woff` (`src/assets/fonts/og`) |
| Ảnh OG 404 khi chạy Docker | Font ở `src/assets/fonts/og` không được đóng gói | `outputFileTracingIncludes` ở `next.config.ts` |
| Route công khai bỗng thành `ƒ` (động) trong bảng build | `cookies()` / `headers()` / `searchParams` / `useSearchParams` thiếu `<Suspense>` trong layout hoặc page | Gỡ, hoặc bọc `<Suspense>`; ngôn ngữ luôn từ tham số route |
| hreflang trỏ 404 | `PUBLIC_ROUTES` có path chưa có bản dịch / thiếu `page.tsx` | Đủ bản dịch rồi mới thêm; `seo-routes.test.ts` bắt thiếu `page.tsx` |
| Canonical của `/en/x` trỏ về `/x` | Truyền sai `locale` vào `buildPageMetadata` | `requireLocale((await params).locale)` rồi truyền đúng |
| Rich Results báo thiếu trường | Builder JSON-LD chưa có trường đó | Thêm vào builder ở `core/seo/json-ld.utils.ts` (có kiểu `schema-dts`), không viết object tay |
| Người dùng vào `/` bị chuyển sang `/en` | next-intl `localeDetection` (cookie / `Accept-Language`) — bot không gửi nên vẫn thấy bản `vi` | Bình thường; muốn URL ổn định tuyệt đối thì đặt `localeDetection: false` ở `core/i18n/routing.ts` (quyết định của chủ repo) |
| Facebook / Zalo hiện ảnh cũ | Nền tảng cache | "Scrape again" ở debugger; đổi tên file ảnh |

---

## 7. Checklist

- [ ] Path trong `PATHS`, đúng MỘT nhóm (`PUBLIC_ROUTES` hoặc `PRIVATE_PATHS`); `tests/app/seo-routes.test.ts` xanh
- [ ] Khoá `metadata.<key>` có `title` + `description` ở CẢ hai ngôn ngữ
- [ ] Trang công khai: `buildPageMetadata` (hoặc `generatePageMetadata` + `noIndex: false`); trang riêng tư: `generatePageMetadata` mặc định
- [ ] Một `<h1>`, heading đúng cấp, ảnh `next/image` có `alt` + kích thước, `priority` chỉ ảnh LCP; JSON-LD qua builder + `<JsonLd>`
- [ ] Không `cookies()` / `headers()` / `useSearchParams` trần → route vẫn tĩnh
- [ ] Production: `NEXT_PUBLIC_SITE_URL`, mã xác minh, `SEO_ALLOW_INDEXING` (staging = `false`); build lại sau khi đổi
- [ ] `npm run build && npm start` + `curl` (§5): canonical, hreflang, robots, `og:image`, sitemap đúng; `npm run check` xanh

Luật đầy đủ: [`rules/seo/seo.md`](../rules/seo/seo.md) · i18n: [`i18n.md`](i18n.md) · tầng app: [`app-layer.md`](app-layer.md)

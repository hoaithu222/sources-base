/**
 * SEO — dựng metadata, hreflang, JSON-LD, sitemap, robots cho Next Metadata API.
 *
 *   buildRootMetadata · buildPageMetadata · buildPrivateMetadata · buildViewport   → `generateMetadata` / `viewport`
 *   JsonLd · websiteJsonLd · organizationJsonLd · webPageJsonLd · breadcrumbJsonLd  → dữ liệu có cấu trúc
 *   buildSitemap · buildRobots                                                      → `sitemap.ts` · `robots.ts`
 *   getSiteOrigin · getSiteName · localizedPath · absoluteUrl · buildAlternates     → URL tuyệt đối, hreflang
 *
 * Lưu ý: CHỈ DÙNG Ở SERVER (đọc cấu hình server). Hướng dẫn thêm trang vào sitemap / đặt metadata: `docs/guides/seo.md`.
 */

export { default as JsonLd } from './JsonLd';
export {
  breadcrumbJsonLd,
  organizationJsonLd,
  serializeJsonLd,
  webPageJsonLd,
  websiteJsonLd,
} from './json-ld.utils';
export type { BreadcrumbItem } from './json-ld.utils';
export {
  buildPageMetadata,
  buildPrivateMetadata,
  buildRootMetadata,
  buildViewport,
} from './metadata';
export { buildRobots } from './robots.utils';
export { getSiteName, getSiteOrigin, isIndexingAllowed, THEME_COLOR } from './site.config';
export { buildSitemap } from './sitemap.utils';
export type { PublicRoute } from './sitemap.utils';
export { absoluteUrl, buildAlternates, localizedPath } from './url.utils';

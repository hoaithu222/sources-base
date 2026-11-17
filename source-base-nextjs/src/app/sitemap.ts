import type { MetadataRoute } from 'next';

import { PUBLIC_ROUTES } from '@/app/_navigation/public-routes';
import { buildSitemap, getSiteOrigin, isIndexingAllowed } from '@/core/seo';

/**
 * `/sitemap.xml` — mỗi route công khai một mục CHO TỪNG ngôn ngữ, kèm hreflang (`alternates.languages`). Môi trường không
 * được lập chỉ mục trả sitemap rỗng (khớp `robots.txt` chặn toàn bộ). Thêm trang: `PUBLIC_ROUTES` (`app/_navigation/public-routes.ts`).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexingAllowed()) return [];
  return buildSitemap(PUBLIC_ROUTES, getSiteOrigin());
}

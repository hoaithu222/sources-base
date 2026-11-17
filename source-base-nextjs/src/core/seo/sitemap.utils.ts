import type { MetadataRoute } from 'next';

import { LOCALE_META, LOCALES } from '@/core/i18n';

import { absoluteUrl, localizedPath } from './url.utils';

/**
 * Dựng `sitemap.xml` từ danh sách route CÔNG KHAI — mỗi route xuất một mục cho từng ngôn ngữ, kèm
 * `alternates.languages` (hreflang) để công cụ tìm kiếm nối các bản dịch lại với nhau.
 *
 * Lưu ý: chỉ route cho phép lập chỉ mục (landing, giới thiệu, pháp lý…). Trang đăng nhập, vùng làm việc, API
 * KHÔNG nằm ở đây — danh sách nguồn: `src/app/_navigation/public-routes.ts`.
 */

export interface PublicRoute {
  /** Đường dẫn KHÔNG tiền tố ngôn ngữ, vd `/about`. */
  path: string;
  changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
  /** 0.0 – 1.0; trang chủ 1.0. */
  priority?: number;
  lastModified?: Date;
}

export function buildSitemap(
  routes: readonly PublicRoute[],
  origin: string,
): MetadataRoute.Sitemap {
  return routes.flatMap((route) => {
    const languages = Object.fromEntries(
      LOCALES.map((locale) => [
        LOCALE_META[locale].hrefLang,
        absoluteUrl(origin, localizedPath(route.path, locale)),
      ]),
    );

    return LOCALES.map((locale) => ({
      url: absoluteUrl(origin, localizedPath(route.path, locale)),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      lastModified: route.lastModified,
      alternates: { languages },
    }));
  });
}

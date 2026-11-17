import type { MetadataRoute } from 'next';

import { LOCALES } from '@/core/i18n';

import { localizedPath } from './url.utils';

/**
 * Dựng `robots.txt`.
 *
 * Môi trường KHÔNG được lập chỉ mục (preview, staging) → chặn toàn bộ: tránh bản thử lọt vào kết quả tìm kiếm
 * và tranh hạng với bản thật. Production → cho phép, chặn vùng riêng tư (cả bản dịch có tiền tố) + API.
 *
 * Lưu ý: `robots.txt` chỉ là LỜI MỜI, không ngăn truy cập. Trang riêng tư còn có `robots: noindex` trong
 * metadata và `proxy.ts` chặn người chưa đăng nhập.
 */

export interface RobotsInput {
  origin: string;
  allowIndexing: boolean;
  /** Đường dẫn KHÔNG tiền tố ngôn ngữ của vùng riêng tư. */
  privatePaths: readonly string[];
}

export function buildRobots({
  origin,
  allowIndexing,
  privatePaths,
}: RobotsInput): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: { userAgent: '*', disallow: '/' } };

  const disallow = [
    '/api/',
    ...privatePaths.flatMap((path) => LOCALES.map((locale) => localizedPath(path, locale))),
  ];

  return {
    rules: { userAgent: '*', allow: '/', disallow },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

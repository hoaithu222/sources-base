import 'server-only';

import { appConfig } from '@/core/config';
import { serverConfig } from '@/core/config/server-config';

/**
 * Danh tính site cho SEO — gốc URL, tên, và có được lập chỉ mục hay không.
 *
 * Dùng:   getSiteOrigin() trong `generateMetadata`, `sitemap.ts`, `robots.ts`, JSON-LD.
 * Lưu ý:  chỉ chạy ở server (`server-only`). Thứ tự gốc URL: `NEXT_PUBLIC_SITE_URL` → host production do Vercel
 *         cấp → `http://localhost:3000` (chỉ hợp lý lúc phát triển; build production bị chặn nếu thiếu — `findProductionIssues`).
 */

/** Màu thanh trình duyệt = token `bg-page` của `colors-theme.json` (sáng · tối); `tests/core/seo-metadata.test.ts` giữ khớp. */
export const THEME_COLOR = { light: '#F1F5F4', dark: '#070B10' } as const;

export function getSiteOrigin(): string {
  if (appConfig.siteUrlExplicit) return appConfig.siteUrl;
  if (serverConfig.vercelProductionHost) return `https://${serverConfig.vercelProductionHost}`;
  return appConfig.siteUrl;
}

export function getSiteName(): string {
  return appConfig.appName;
}

export function isIndexingAllowed(): boolean {
  return serverConfig.allowIndexing;
}

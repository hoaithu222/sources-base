import type { PublicRoute } from '@/core/seo';
import {
  GUEST_ONLY_PATHS,
  PATHS,
  PROTECTED_PATH_PREFIXES,
} from '@/shared/constants/paths.constants';

/**
 * Route CÔNG KHAI cho phép công cụ tìm kiếm lập chỉ mục — nguồn của `sitemap.xml`; phần đối lập (`PRIVATE_PATHS`) là
 * nguồn của `robots.txt`.
 *
 * Dùng:   trang marketing / nội dung mới → thêm một dòng vào `PUBLIC_ROUTES` (sitemap tự có bản dịch + hreflang) và đặt
 *         `generateMetadata` bằng `buildPageMetadata` ở `page.tsx`. Hướng dẫn: `docs/guides/seo.md`.
 * Lưu ý:  trang đăng nhập / vùng làm việc KHÔNG đưa vào đây (chúng `noindex`); `tests/app/seo-routes.test.ts` giữ hai
 *         danh sách không giao nhau.
 */

export const PUBLIC_ROUTES: readonly PublicRoute[] = [
  { path: PATHS.HOME, changeFrequency: 'weekly', priority: 1 },
  { path: PATHS.ABOUT, changeFrequency: 'monthly', priority: 0.7 },
];

/** Đường KHÔNG được lập chỉ mục: vùng cần đăng nhập, trang khách, trạng thái lỗi. */
export const PRIVATE_PATHS: readonly string[] = [
  ...PROTECTED_PATH_PREFIXES,
  ...GUEST_ONLY_PATHS,
  PATHS.FORBIDDEN,
];

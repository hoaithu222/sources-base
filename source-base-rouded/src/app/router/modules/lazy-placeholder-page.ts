import { lazyPage } from '../definition';

/**
 * Trang giữ chỗ cho phân hệ chưa có màn hình thật: `{ index: true, page: LazyPlaceholderPage }` — route,
 * Dock và phân quyền chạy được ngay; xong thì đổi `page` sang trang thật.
 */
export const LazyPlaceholderPage = lazyPage(() => import('@/app/pages/PlaceholderPage'));

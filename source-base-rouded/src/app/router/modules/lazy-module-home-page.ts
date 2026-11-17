import { lazyPage } from '../definition';

/**
 * Trang chủ phân hệ dựng sẵn: `{ index: true, page: LazyModuleHomePage }` — thẻ giới thiệu + lưới thẻ màn hình của phân
 * hệ (dựng từ chính route con, `meta.navIcon` / `meta.navDescription`). Header ở cấp 1 trên trang này.
 */
export const LazyModuleHomePage = lazyPage(() => import('@/app/pages/ModuleHomePage'));

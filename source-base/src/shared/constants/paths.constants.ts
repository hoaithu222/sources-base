/**
 * PATHS — đường route tĩnh của ứng dụng, dùng cho `<Link>`, redirect, breadcrumb.
 *
 * Dùng:   <Link to={PATHS.LOGIN}>Đăng nhập</Link>
 * Lưu ý:  mỗi giá trị phải có entry trong `src/app/router/static.routes.ts`. Path của phân hệ
 *         nghiệp vụ không khai ở đây — lấy bằng `getRoutePath(id)` từ `@/app/router/modules` (chỉ tầng app).
 */

export const PATHS = {
  HOME: '/',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  PROFILE: '/profile',
  SETTINGS: '/settings',

  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

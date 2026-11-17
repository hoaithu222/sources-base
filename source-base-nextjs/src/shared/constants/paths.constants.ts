/**
 * PATHS — đường route tĩnh của ứng dụng (KHÔNG tiền tố ngôn ngữ), dùng cho `<Link>`, redirect, breadcrumb.
 *
 * Dùng:   <Link href={PATHS.LOGIN}>…</Link>   — `Link` của `@/core/i18n` tự thêm `/en` khi cần.
 * Lưu ý:  mỗi giá trị phải có thư mục tương ứng dưới `src/app/[locale]/`. Path của phân hệ nghiệp vụ lấy từ
 *         registry điều hướng ở `src/app/_navigation` (chỉ tầng app).
 */

export const PATHS = {
  HOME: '/',
  ABOUT: '/about',

  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DEMO: '/demo',
  DEMO_CUSTOMERS: '/demo/customers',
  DEMO_CUSTOMER_NEW: '/demo/customers/new',
  DEMO_CUSTOMER_EDIT: '/demo/customers/edit',

  FORBIDDEN: '/403',
} as const;

/**
 * Chính sách truy cập theo route — `proxy.ts`, sitemap và robots cùng đọc; route không thuộc nhóm nào = công khai.
 *   GUEST_ONLY_PATHS         chỉ cho người CHƯA đăng nhập (đã đăng nhập thì `GuestGate` đưa đi)
 *   PROTECTED_PATH_PREFIXES  cần đăng nhập (khớp đường dẫn và mọi route con)
 */
export const GUEST_ONLY_PATHS: readonly string[] = [
  PATHS.LOGIN,
  PATHS.REGISTER,
  PATHS.FORGOT_PASSWORD,
  PATHS.RESET_PASSWORD,
];

export const PROTECTED_PATH_PREFIXES: readonly string[] = [
  PATHS.DASHBOARD,
  PATHS.PROFILE,
  PATHS.SETTINGS,
  PATHS.DEMO,
];

/** Query param mang đích quay lại sau khi đăng nhập (`/login?next=/dashboard`). */
export const RETURN_PATH_PARAM = 'next';

const matchesPrefix = (pathname: string, prefix: string): boolean =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

export const isGuestOnlyPath = (pathname: string): boolean => GUEST_ONLY_PATHS.includes(pathname);

export const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PATH_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));

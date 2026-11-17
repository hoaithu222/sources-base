import ForbiddenPage from '@/app/pages/status/ForbiddenPage';
import NotFoundPage from '@/app/pages/status/NotFoundPage';
import { PATHS } from '@/shared/constants/paths.constants';

import { lazyPage, type StaticPageDef } from './definition';

/**
 * static.routes — trang tĩnh (không thuộc phân hệ), khai cùng kiểu với phân hệ; path lấy từ `PATHS`.
 *
 * Dùng:   thêm path vào `PATHS`, rồi thêm entry vào đúng nhóm GUEST_PAGES · APP_PAGES · FALLBACK_PAGES.
 * Lưu ý:  entry có `meta.icon` thì hiện ở nhóm "Điều hướng chung" của bảng lệnh.
 */

/** Chưa đăng nhập — sau `GuestGuard`, trong `AuthLayout`. */
export const GUEST_PAGES: readonly StaticPageDef[] = [
  {
    id: 'login',
    path: PATHS.LOGIN,
    page: lazyPage(() => import('@/features/auth/pages/LoginPage')),
    meta: { title: 'Đăng nhập' },
  },
  {
    id: 'register',
    path: PATHS.REGISTER,
    page: lazyPage(() => import('@/features/auth/pages/RegisterPage')),
    meta: { title: 'Đăng ký' },
  },
  {
    id: 'forgot-password',
    path: PATHS.FORGOT_PASSWORD,
    page: lazyPage(() => import('@/features/auth/pages/ForgotPasswordPage')),
    meta: { title: 'Quên mật khẩu' },
  },
  {
    id: 'reset-password',
    path: PATHS.RESET_PASSWORD,
    page: lazyPage(() => import('@/features/auth/pages/ResetPasswordPage')),
    meta: { title: 'Đặt lại mật khẩu' },
  },
];

/** Đã đăng nhập — sau `AuthGuard`, trong `AppShellLayout`, cạnh các phân hệ. */
export const APP_PAGES: readonly StaticPageDef[] = [
  {
    id: 'home',
    path: PATHS.HOME,
    page: lazyPage(() => import('@/app/pages/HomePage')),
    meta: { title: 'Trang chủ', icon: 'home' },
  },
  {
    id: 'profile',
    path: PATHS.PROFILE,
    page: lazyPage(() => import('@/app/pages/ProfilePage')),
    meta: { title: 'Hồ sơ cá nhân', tabTitle: 'Thông tin cá nhân', icon: 'customer' },
  },
  {
    id: 'settings',
    path: PATHS.SETTINGS,
    page: lazyPage(() => import('@/app/pages/SettingsPage')),
    meta: { title: 'Cài đặt', icon: 'settings' },
  },
];

/** Dự phòng — ngoài mọi guard và layout; nạp sẵn để vẫn hiện được khi mạng hỏng. */
export const FALLBACK_PAGES: readonly StaticPageDef[] = [
  {
    id: 'forbidden',
    path: PATHS.FORBIDDEN,
    page: ForbiddenPage,
    meta: { title: 'Không có quyền truy cập' },
  },
  {
    id: 'not-found',
    path: PATHS.NOT_FOUND,
    page: NotFoundPage,
    meta: { title: 'Không tìm thấy trang' },
  },
];

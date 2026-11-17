/**
 * Đường dẫn endpoint xác thực — nối sau `appConfig.apiBaseUrl`.
 *
 * Tách riêng khỏi service để đổi đường dẫn không phải đụng vào logic, và để
 * `grep` một lần là thấy hết mặt tiếp xúc với backend.
 *
 * ⚠️ `REFRESH` được khai ở `core/config/auth.config.ts` (hằng `AUTH_REFRESH_PATH`)
 * chứ không phải ở đây, vì lời gọi refresh đi bằng `fetch` trần ngoài `apiClient` —
 * xem chú thích trong `session.ts`.
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REGISTER: '/auth/register',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

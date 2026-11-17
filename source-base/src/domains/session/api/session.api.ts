import { apiClient, readData } from '@/core/http';

import { sessionPayloadSchema, sessionUserSchema } from '../model/session.schema';
import type { SessionPayload, SessionUser } from '../model/session.types';

/**
 * API của phiên: làm mới, đăng xuất, hồ sơ người đang đăng nhập.
 *
 * Đăng nhập / đăng ký / quên mật khẩu thuộc `features/auth/api`.
 * Đường dẫn tính từ `VITE_API_BASE_URL`; BE có version (`/v1`) thì ghi vào biến đó.
 *
 * Lưu ý: không gọi `sessionApi.refresh()` trực tiếp — dùng `refreshSession()`.
 */

const ENDPOINTS = {
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  me: '/auth/me',
} as const;

const REFRESH_TIMEOUT_MS = 10_000;

export const sessionApi = {
  refresh: async (): Promise<SessionPayload> =>
    readData(
      await apiClient.post(ENDPOINTS.refresh, undefined, {
        skipAuthRefresh: true,
        timeout: REFRESH_TIMEOUT_MS,
      }),
      sessionPayloadSchema,
    ),

  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.logout, undefined, { skipAuthRefresh: true });
  },

  /** Truyền `signal` từ `queryFn` để huỷ request khi query bị huỷ. */
  me: async (signal?: AbortSignal): Promise<SessionUser> =>
    readData(await apiClient.get(ENDPOINTS.me, { signal }), sessionUserSchema),
};

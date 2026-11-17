import { apiClient, readData } from '@/core/http';
import { sessionPayloadSchema } from '@/domains/session';
import type { SessionPayload } from '@/domains/session';

import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from './auth.types';

/**
 * Hàm gọi API của các màn hình xác thực — async thuần, trả thẳng payload.
 *
 * Làm mới phiên, đăng xuất, `/me` thuộc `@/domains/session`.
 * Đường dẫn tính từ `NEXT_PUBLIC_API_BASE_URL`; BE có version (`/v1`) thì ghi vào biến đó, không thêm ở đây.
 */

const ENDPOINTS = {
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
} as const;

const PUBLIC_ENDPOINT = { skipAuthRefresh: true } as const;

export const authApi = {
  login: async (data: LoginRequest): Promise<SessionPayload> =>
    readData(await apiClient.post(ENDPOINTS.login, data, PUBLIC_ENDPOINT), sessionPayloadSchema),

  register: async (data: RegisterRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.register, data, PUBLIC_ENDPOINT);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.forgotPassword, data, PUBLIC_ENDPOINT);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post(ENDPOINTS.resetPassword, data, PUBLIC_ENDPOINT);
  },
};

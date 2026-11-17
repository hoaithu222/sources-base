import { useMutation } from '@tanstack/react-query';

import { establishSession } from '@/domains/session';

import { authApi } from '../api/auth.api';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from '../api/auth.types';

/**
 * React Query hooks cho các màn hình xác thực — chỉ lo dữ liệu và phiên.
 *
 *   const login = useLogin();
 *   await login.mutateAsync({ email, password });
 *
 * Lưu ý: hook KHÔNG báo gì cho người dùng (toast, Callout, điều hướng) — trang quyết hết; cả bốn
 * trang tự vẽ lỗi nên mọi mutation khai `silentError`. Sau đăng nhập `GuestGuard` đưa người dùng đi.
 */

const INLINE_ERROR = { silentError: true } as const;

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginRequest) => authApi.login(payload),
    meta: INLINE_ERROR,
    onSuccess: establishSession,
  });

export const useRegister = () =>
  useMutation({
    mutationFn: (payload: RegisterRequest) => authApi.register(payload),
    meta: INLINE_ERROR,
  });

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authApi.forgotPassword(payload),
    meta: INLINE_ERROR,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordRequest) => authApi.resetPassword(payload),
    meta: INLINE_ERROR,
  });

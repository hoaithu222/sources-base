import type { AuthUser } from '@/shell/store/slices/auth';

/** Thân request đăng nhập. */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

/**
 * Phản hồi đăng nhập / làm mới token.
 *
 * Nhận CẢ HAI cách đặt tên (`accessToken` và `access_token`) vì backend .NET và
 * backend theo chuẩn OAuth đặt khác nhau, và base này không chọn hộ dự án dùng
 * cái nào. `auth.service.ts` chuẩn hoá về một dạng ngay tại cửa vào.
 */
export interface AuthTokens {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
}

export interface LoginResponse extends AuthTokens {
  user?: AuthUser;
}

/** Kết quả đã chuẩn hoá — phần còn lại của app chỉ thấy dạng này. */
export interface NormalizedSession {
  accessToken: string;
  refreshToken: string | null;
  user: AuthUser | null;
}

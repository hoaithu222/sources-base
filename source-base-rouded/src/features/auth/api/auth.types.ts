/** Kiểu request của các màn hình xác thực. Kiểu của phiên: `@/domains/session`. */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  /** Token dùng một lần nhận qua email. */
  token: string;
  newPassword: string;
}

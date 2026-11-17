import { z } from 'zod';

/**
 * Schema Zod cho form xác thực — dựng bằng `createAuthSchemas(messages)` (thông báo đã dịch), truyền vào
 * `useZodForm(schema)`; kiểu form lấy bằng `z.infer`. Trong component dùng `useAuthSchemas()` (đã nối `auth.validation`).
 *
 * Lưu ý: `confirmPassword` (đăng ký, đặt lại mật khẩu) chỉ để đối chiếu ở client — view ánh xạ
 * tường minh sang `RegisterRequest` / `ResetPasswordRequest`, đừng gửi nguyên giá trị form.
 */

/** Độ dài tối thiểu của mật khẩu — dùng cho schema và placeholder. */
export const PASSWORD_MIN_LENGTH = 6;

export interface AuthValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordMin: string;
  confirmRequired: string;
  mismatch: string;
  nameRequired: string;
  tokenInvalid: string;
}

export function createAuthSchemas(messages: AuthValidationMessages) {
  const emailField = z.string().trim().min(1, messages.emailRequired).email(messages.emailInvalid);

  const passwordField = z.string().min(PASSWORD_MIN_LENGTH, messages.passwordMin);

  const confirmPasswordField = z.string().min(1, messages.confirmRequired);

  const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
    data.password === data.confirmPassword;

  const passwordsMismatch = { message: messages.mismatch, path: ['confirmPassword'] };

  const loginSchema = z.object({
    email: emailField,
    password: passwordField,
  });

  const registerSchema = z
    .object({
      email: emailField,
      name: z.string().trim().min(1, messages.nameRequired),
      password: passwordField,
      confirmPassword: confirmPasswordField,
    })
    .refine(passwordsMatch, passwordsMismatch);

  const forgotPasswordSchema = z.object({
    email: emailField,
  });

  const resetPasswordSchema = z
    .object({
      token: z.string().min(1, messages.tokenInvalid),
      password: passwordField,
      confirmPassword: confirmPasswordField,
    })
    .refine(passwordsMatch, passwordsMismatch);

  return { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema };
}

export type AuthSchemas = ReturnType<typeof createAuthSchemas>;

export type LoginFormValues = z.infer<AuthSchemas['loginSchema']>;
export type RegisterFormValues = z.infer<AuthSchemas['registerSchema']>;
export type ForgotPasswordFormValues = z.infer<AuthSchemas['forgotPasswordSchema']>;
export type ResetPasswordFormValues = z.infer<AuthSchemas['resetPasswordSchema']>;

import { z } from 'zod';

/**
 * Schema Zod cho form xác thực — truyền vào `useZodForm(schema)`; kiểu form lấy bằng `z.infer`.
 *
 * Lưu ý: `confirmPassword` (đăng ký, đặt lại mật khẩu) chỉ để đối chiếu ở client — trang ánh xạ
 * tường minh sang `RegisterRequest` / `ResetPasswordRequest`, đừng gửi nguyên giá trị form.
 */

const emailField = z
  .string()
  .trim()
  .min(1, 'Email không được để trống')
  .email('Email không đúng định dạng');

const passwordField = z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự');

const confirmPasswordField = z.string().min(1, 'Vui lòng nhập lại mật khẩu');

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;

const PASSWORDS_MISMATCH = {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
};

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: emailField,
    name: z.string().trim().min(1, 'Tên không được để trống'),
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH);

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token không hợp lệ'),
    password: passwordField,
    confirmPassword: confirmPasswordField,
  })
  .refine(passwordsMatch, PASSWORDS_MISMATCH);

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

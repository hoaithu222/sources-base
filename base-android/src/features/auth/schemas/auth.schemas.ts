import { z } from 'zod';

/**
 * Schema kiểm dữ liệu cho các màn hình xác thực.
 *
 * Thông báo lỗi mặc định đã là tiếng Việt nhờ `configureZodLocale()` (gọi ở
 * `AppProviders`), nên chỉ viết `message` cho những luật RIÊNG của nghiệp vụ.
 */

const email = z
  .string()
  .min(1)
  /**
   * ⛔ `.trim()` là bắt buộc, không phải cho đẹp.
   *
   * Bàn phím di động TỰ CHÈN một dấu cách sau khi người dùng nhận gợi ý tự động
   * hoàn thành — hành vi mặc định trên cả iOS lẫn Android. Không cắt thì
   * `"a@b.com "` trượt kiểm định dạng, và người dùng nhìn ô nhập thấy đúng y
   * nguyên nên không hiểu vì sao báo sai.
   */
  .trim()
  .toLowerCase()
  .email('Email không đúng định dạng');

/**
 * Mật khẩu lúc ĐĂNG NHẬP — chỉ kiểm "có nhập gì chưa".
 *
 * ⛔ KHÔNG áp luật độ mạnh ở đây. Người dùng cũ có thể có mật khẩu đặt từ trước
 * khi luật hiện tại ra đời; chặn ở client là họ KHÔNG đăng nhập được vào chính
 * tài khoản của mình, và không có cách nào tự thoát. Luật độ mạnh chỉ áp lúc
 * ĐẶT mật khẩu.
 */
const loginPassword = z.string().min(1);

/** Mật khẩu lúc ĐẶT MỚI — đây mới là chỗ áp luật độ mạnh. */
const newPassword = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/\d/, 'Mật khẩu phải có ít nhất 1 chữ số');

export const loginSchema = z.object({
  email,
  password: loginPassword,
});

export const registerSchema = z
  .object({
    name: z.string().min(1).trim(),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1),
  })
  /**
   * Gắn lỗi vào `confirmPassword` chứ không phải vào cả form: lỗi phải hiện
   * ngay DƯỚI ô mà người dùng cần sửa. Lỗi ở tầng form nổi lên đầu màn hình,
   * và trên điện thoại thì lúc đó bàn phím đang che mất — người dùng không
   * thấy gì cả và tưởng nút bấm hỏng.
   */
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({ email });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: newPassword,
    confirmPassword: z.string().min(1),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Mật khẩu nhập lại không khớp',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { PATHS } from '@/shell/config';
import { authService } from '@/core/api/auth';
import { toErrorMessage } from '@/core/api/client.helpers';
import type {
  ForgotPasswordFormValues,
  ResetPasswordFormValues,
} from '@/features/auth/schemas/auth.schemas';
import { showToast } from '@/shared/utils/toast.utils';

/**
 * Gửi yêu cầu đặt lại mật khẩu.
 *
 * ⛔ Thông báo thành công phải TRUNG TÍNH: "Nếu e-mail tồn tại, chúng tôi đã
 * gửi hướng dẫn." Nói thẳng "Đã gửi tới a@b.com" biến màn hình này thành công
 * cụ dò xem một địa chỉ có tài khoản trong hệ thống hay không — kẻ tấn công thử
 * hàng loạt e-mail để dựng danh sách tài khoản có thật. Backend tử tế cũng trả
 * 200 cho cả hai ca vì lý do này; câu chữ ở client phải khớp với ý đồ đó.
 */
export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => authService.forgotPassword(values),
    onSuccess: () => {
      showToast('success', 'Nếu e-mail tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.');
    },
  });

  return {
    requestReset: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errorMessage: mutation.error ? toErrorMessage(mutation.error) : null,
  };
}

/** Đặt lại mật khẩu bằng mã nhận qua e-mail. */
export function useResetPassword() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirmPassword, ...payload }: ResetPasswordFormValues) =>
      authService.resetPassword(payload),
    onSuccess: () => {
      showToast('success', 'Đã đổi mật khẩu. Đăng nhập lại bằng mật khẩu mới.');
      router.replace(PATHS.LOGIN);
    },
  });

  return {
    resetPassword: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toErrorMessage(mutation.error) : null,
  };
}

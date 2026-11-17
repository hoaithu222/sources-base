import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { PATHS } from '@/shell/config';
import { useAuthStore } from '@/shell/store/slices/auth';
import { authService } from '@/core/api/auth';
import { toErrorMessage } from '@/core/api/client.helpers';
import { queryClient } from '@/core/config/query-client';
import type { RegisterFormValues } from '@/features/auth/schemas/auth.schemas';
import { showToast } from '@/shared/utils/toast.utils';

/**
 * Đăng ký tài khoản.
 *
 * Xử lý được CẢ HAI kiểu backend, vì base không chọn hộ dự án dùng kiểu nào:
 *
 *   · Trả token luôn        → vào thẳng app.
 *   · Bắt xác thực e-mail   → `register` trả `null`; báo cho người dùng biết
 *                             phải mở hộp thư, rồi đưa về màn đăng nhập.
 *
 * ⛔ Đừng bỏ nhánh thứ hai. Không có nó thì với backend cần xác thực e-mail,
 * người dùng bấm "Đăng ký" và KHÔNG có gì xảy ra — không lỗi, không chuyển màn.
 */
export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const mutation = useMutation({
    mutationFn: ({ confirmPassword: _confirmPassword, ...payload }: RegisterFormValues) =>
      authService.register(payload),

    onSuccess: async (session) => {
      if (!session) {
        showToast('info', 'Đã tạo tài khoản. Kiểm tra hộp thư để kích hoạt.');
        router.replace(PATHS.LOGIN);
        return;
      }

      queryClient.clear();
      let user = session.user;
      if (!user) {
        try {
          user = await authService.me();
        } catch {
          user = null;
        }
      }
      setAuth({ user, token: session.accessToken });
      router.replace(PATHS.HOME);
    },
  });

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: mutation.error ? toErrorMessage(mutation.error) : null,
  };
}

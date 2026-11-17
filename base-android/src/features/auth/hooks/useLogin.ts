import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { PATHS } from '@/shell/config';
import { useAuthStore } from '@/shell/store/slices/auth';
import { authService } from '@/core/api/auth';
import { toErrorMessage } from '@/core/api/client.helpers';
import { queryClient } from '@/core/config/query-client';
import type { LoginFormValues } from '@/features/auth/schemas/auth.schemas';

/**
 * Đăng nhập.
 *
 * Trả về `error` dạng CHUỖI ĐÃ DỊCH thay vì `AxiosError` thô, để màn hình chỉ
 * việc hiển thị. `authService.login` đã bật `skipErrorToast` nên lỗi KHÔNG ra
 * toast — sai mật khẩu là chuyện thường ngày, câu lỗi phải nằm ngay dưới ô nhập
 * chứ không phải bay ngang màn hình rồi biến mất sau 4 giây.
 */
export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),

    onSuccess: async (session) => {
      /**
       * ⛔ Xoá SẠCH cache trước khi vào app.
       *
       * Nếu người trước vừa đăng xuất trên cùng máy này, cache của React Query
       * vẫn còn dữ liệu của HỌ. Không xoá thì người mới đăng nhập nhìn thấy
       * danh sách, số liệu, tên dự án của người cũ trong khoảng thời gian giữa
       * lúc vào màn hình và lúc request mới trả về. Trên máy dùng chung ở công
       * trường, đó là rò rỉ dữ liệu thật.
       */
      queryClient.clear();

      /**
       * Một số backend không trả `user` kèm lượt đăng nhập. Lấy hồ sơ ngay,
       * vì thanh tab cần `permissions` để biết hiện phân hệ nào.
       */
      let user = session.user;
      if (!user) {
        try {
          user = await authService.me();
        } catch {
          // Lấy hồ sơ hỏng KHÔNG chặn đăng nhập: token đã hợp lệ. App vào được,
          // chỉ là danh sách phân hệ tạm thời rút gọn cho tới lượt làm mới sau.
          user = null;
        }
      }
      setAuth({ user, token: session.accessToken });

      /**
       * `replace` chứ không phải `push`: bấm nút Back trên Android sau khi đăng
       * nhập KHÔNG được quay lại màn đăng nhập.
       */
      router.replace(PATHS.HOME);
    },
  });

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    /** Câu lỗi tiếng Việt, `null` khi chưa có lỗi. */
    errorMessage: mutation.error ? toErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}

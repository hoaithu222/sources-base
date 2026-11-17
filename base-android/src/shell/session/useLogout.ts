import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import { authService } from '@/core/api/auth';
import { queryClient } from '@/core/config/query-client';
import { PATHS } from '@/shell/config';

/**
 * Đăng xuất.
 *
 * ── Vì sao hook này nằm ở `shell/` chứ không ở `features/auth/` ──────────────
 * Nó từng ở `features/auth/hooks/useLogout.ts` và `features/profile` nhập
 * thẳng sang — đúng thứ `docs/rules/feature-structure.md` cấm cứng, mà cả
 * `check:imports` lẫn ESLint đều mù (`check:imports` chỉ đối chiếu tên gói với
 * `package.json`, còn `import/no-cycle` chỉ đỏ khi vòng đã KHÉP LẠI). Import
 * chéo feature là con đường ngắn nhất tới import vòng, và trên React Native
 * vòng hiện ra LÚC CHẠY dưới dạng `undefined is not a function` ở một file
 * hoàn toàn không liên quan.
 *
 * Chỗ đúng của nó là vỏ ứng dụng, vì ba việc nó làm đều là việc của vỏ:
 * dọn store phiên, dọn cache React Query, và điều hướng. Không việc nào là
 * nghiệp vụ của riêng phân hệ đăng nhập — bất kỳ màn hình nào (hồ sơ, cài đặt,
 * ngăn kéo bên) cũng có quyền gọi.
 *
 * `authService.logout` đã bảo đảm phiên phía client bị dọn DÙ lời gọi tới máy
 * chủ có hỏng hay không (xem chú thích ở đó), nên hook này chỉ còn hai việc:
 * dọn cache và điều hướng.
 */
export function useLogout() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => authService.logout(),

    /**
     * ⛔ Dùng `onSettled` chứ KHÔNG phải `onSuccess`.
     *
     * `logout()` không bao giờ ném lỗi (nó nuốt lỗi mạng), nhưng nếu sau này ai
     * đó đổi hành vi đó thì `onSuccess` sẽ không chạy và người dùng kẹt lại
     * trong app với một phiên đã bị dọn — mọi request sau đó ăn 401. `onSettled`
     * chạy ở cả hai nhánh nên hành vi không phụ thuộc chi tiết đó.
     */
    onSettled: () => {
      // Xoá cache TRƯỚC khi chuyển màn: dữ liệu của người vừa đăng xuất không
      // được nằm lại trong bộ nhớ cho người đăng nhập kế tiếp trên cùng máy.
      queryClient.clear();
      /**
       * ⚠️ Vẫn điều hướng TƯỜNG MINH dù guard ở `app/(app)/_layout.tsx` cũng
       * theo dõi trạng thái phiên: guard chỉ chặn khi `EXPO_PUBLIC_AUTH_ENABLED=true`.
       * Thiếu dòng này thì ở cấu hình mặc định của base (cờ tắt) người dùng bấm
       * "Đăng xuất" và… ở nguyên màn hình cũ.
       */
      router.replace(PATHS.LOGIN);
    },
  });

  return { logout: mutation.mutate, isPending: mutation.isPending };
}

import { appConfig } from '@/core/config';
import { createQueryClient } from '@/core/query';
import { showToast } from '@/shared/ui';

/**
 * queryClient — QueryClient của app: lỗi query / mutation hiện toast đỏ, tắt bằng
 * `VITE_ENABLE_ERROR_TOAST=false`. Lỗi nào được báo: `claimErrorMessage` (`@/core/http`).
 * Query / mutation tự vẽ lỗi khai `meta: { silentError: true }`.
 */

export const queryClient = createQueryClient({
  notifyUser: (message) => showToast('error', message),
  enabled: appConfig.enableErrorToast,
});

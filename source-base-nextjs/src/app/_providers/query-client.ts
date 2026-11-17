import { isServer } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

import { appConfig } from '@/core/config';
import { createQueryClient } from '@/core/query';
import { showToast } from '@/shared/ui';

/**
 * getQueryClient — QueryClient của app: lỗi query / mutation hiện toast đỏ, tắt bằng
 * `NEXT_PUBLIC_ENABLE_ERROR_TOAST=false`. Lỗi nào được báo: `claimErrorMessage` (`@/core/http`).
 * Query / mutation tự vẽ lỗi khai `meta: { silentError: true }`.
 *
 * Lưu ý: server tạo client MỚI cho mỗi lần gọi (không rò dữ liệu giữa người dùng khác nhau); trình duyệt dùng MỘT client
 * duy nhất để cache sống qua mọi lần render — mẫu chính thức của TanStack Query cho Next App Router.
 */

function makeQueryClient(): QueryClient {
  return createQueryClient({
    notifyUser: (message) => showToast('error', message),
    enabled: appConfig.enableErrorToast,
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

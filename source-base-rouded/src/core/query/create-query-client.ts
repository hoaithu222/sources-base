import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import type { MutationMeta, QueryMeta } from '@tanstack/react-query';

import { claimErrorMessage, isAppError, isRetryableError } from '@/core/http';

/**
 * Nhà máy `QueryClient` kèm bộ báo lỗi tập trung: mỗi lỗi báo một lần, sau khi đã thử lại xong.
 *
 *   createQueryClient({ notifyUser: (message) => showToast('error', message), enabled: true });
 *
 * Màn hình tự vẽ lỗi (hoặc muốn câu riêng) thì tắt báo tập trung cho riêng query / mutation đó:
 *   useMutation({ mutationFn, meta: { silentError: true } })
 *
 * Lỗi nào được báo: `claimErrorMessage`. Lý do thiết kế: `docs/notes/code/core.md`.
 */

interface CreateQueryClientOptions {
  /** Hiện một câu lỗi cho người dùng (vd toast); mỗi lỗi gọi tối đa một lần. */
  notifyUser?: (message: string) => void;
  /** `false` = tắt báo lỗi tập trung; thử lại vẫn chạy như thường. Mặc định `true`. */
  enabled?: boolean;
}

export function createQueryClient({
  notifyUser,
  enabled = true,
}: CreateQueryClientOptions = {}): QueryClient {
  const reportToUser = (error: unknown, meta: QueryMeta | MutationMeta | undefined): void => {
    if (!notifyUser || !enabled || meta?.silentError || !isAppError(error)) return;
    const message = claimErrorMessage(error);
    if (message !== null) notifyUser(message);
  };

  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => reportToUser(error, query.meta),
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => reportToUser(error, mutation.meta),
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: (failureCount, error) => failureCount < 1 && isRetryableError(error),
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

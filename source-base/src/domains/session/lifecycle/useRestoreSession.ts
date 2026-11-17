import { useEffect } from 'react';

import { appConfig } from '@/core/config';

import { restoreSession } from './session.lifecycle';

/**
 * useRestoreSession — khôi phục phiên (một lượt refresh) khi component được mount.
 *
 * Kiểm đăng nhập tắt (chế độ demo) thì không làm gì: không có backend để hỏi. Gọi ở nhiều nơi cùng lúc
 * vô hại — `restoreSession` chỉ chạy từ `idle` / `unavailable`. Guard dùng qua `useSessionGate`.
 *
 * @example
 * useRestoreSession();
 */
export function useRestoreSession(): void {
  useEffect(() => {
    if (appConfig.authEnabled) void restoreSession();
  }, []);
}

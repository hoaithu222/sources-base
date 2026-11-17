'use client';

import { appConfig } from '@/core/config';
import { selectStatus, useRestoreSession, useSessionStore } from '@/domains/session';

type SessionGate = 'open' | 'pending' | 'unavailable' | 'signed-in' | 'signed-out';

/**
 * useSessionGate — khôi phục phiên (nếu chưa) rồi trả guard nên rẽ nhánh nào; đã gộp
 * `appConfig.authEnabled`, nên `AuthGate` / `GuestGate` chỉ còn một `switch`.
 *
 * `signed-in` — đang có phiên. `open` — kiểm đăng nhập tắt (chế độ demo): không có phiên để hỏi, trang
 * nào cũng mở. `pending` — chưa hỏi xong máy chủ (`idle` / `restoring`): chờ, để F5 không nháy màn đăng
 * nhập. `unavailable` — không hỏi được máy chủ, chưa biết còn phiên không. `signed-out` — máy chủ xác
 * nhận không có phiên.
 *
 * @example
 * switch (useSessionGate()) { case 'pending': return <LoadingScreen level="app" />; … }
 */
export function useSessionGate(): SessionGate {
  const status = useSessionStore(selectStatus);
  useRestoreSession();

  if (status === 'authenticated') return 'signed-in';
  if (!appConfig.authEnabled) return 'open';
  if (status === 'idle' || status === 'restoring') return 'pending';
  if (status === 'unavailable') return 'unavailable';
  return 'signed-out';
}

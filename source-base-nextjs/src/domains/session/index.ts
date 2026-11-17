/**
 * Domain phiên đăng nhập — ai đang đăng nhập, có quyền gì, phiên sống hay chết.
 *
 *   Đọc   useSessionStore(selectUser) · usePermission(permission) · canAccess(user, permissions)
 *   Ghi   establishSession(payload) · logout() · restoreSession() / useRestoreSession()
 *   Nối   getAccessToken · refreshAccessToken   → `configureHttp` ở app/_providers/bootstrap.ts
 *         onSessionEnd · startSessionSync       → dọn state theo tài khoản, đồng bộ đa tab
 *
 * Lưu ý: bên ngoài chỉ import từ `@/domains/session`, không với vào `model/`, `lifecycle/`, `api/`.
 */

export { useSessionStore } from './model/session.store';
export { selectEndReason, selectStatus, selectUser } from './model/session.selectors';
export { canAccess } from './model/permission.utils';
export { usePermission } from './model/usePermission';
export { sessionPayloadSchema } from './model/session.schema';
export {
  establishSession,
  getAccessToken,
  logout,
  onSessionEnd,
  refreshAccessToken,
  restoreSession,
  startSessionSync,
} from './lifecycle/session.lifecycle';
export { useRestoreSession } from './lifecycle/useRestoreSession';
export type { PermissionAction, RoutePermission } from './model/permission.utils';
export type { SessionEndReason, SessionPayload, SessionUser } from './model/session.types';

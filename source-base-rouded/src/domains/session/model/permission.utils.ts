import { appConfig } from '@/core/config';

import type { SessionUser } from './session.types';

/**
 * Phân quyền phẳng `{ resource, action }`, lưu trong `user.permissions` dưới dạng `"resource:action"`.
 *
 *   canAccess(user, [{ resource: 'report' }, { resource: 'report', action: 'export' }])
 *   usePermission({ resource: 'report', action: 'export' })   // trong component
 *
 * Lưu ý: kiểm quyền ở FE chỉ để ẩn/hiện giao diện; quyền thật do BE kiểm. Kiểm đăng nhập tắt (chế độ
 * demo) thì `canAccess` luôn `true` — không có ai để kiểm quyền.
 */

/** Thêm hành động riêng của dự án vào union này. */
export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'approve';

/** Một quyền: tài nguyên kebab-case (`'user'`, `'audit-log'`) + hành động, bỏ trống = `'view'`. */
export interface RoutePermission {
  resource: string;
  action?: PermissionAction;
}

/** Vai trò được bỏ qua mọi kiểm tra quyền chi tiết. */
const SUPER_ROLE = 'admin';

/** `{ resource: 'user' }` → `'user:view'` — đúng dạng chuỗi lưu trong `user.permissions`. */
function permissionKey({ resource, action = 'view' }: RoutePermission): string {
  return `${resource}:${action}`;
}

/** Người dùng có quyền này không (`admin` luôn có). Hàm thuần, KHÔNG xét chế độ demo — dùng `canAccess`. */
export function hasPermission(user: SessionUser | null, permission: RoutePermission): boolean {
  if (!user) return false;
  return user.roles.includes(SUPER_ROLE) || user.permissions.includes(permissionKey(permission));
}

/** Luật "được vào / được thấy" DUY NHẤT (guard, menu, `usePermission`): thoả MỌI quyền trong `permissions`. */
export function canAccess(
  user: SessionUser | null,
  permissions: readonly RoutePermission[],
): boolean {
  if (!appConfig.authEnabled) return true;
  return permissions.every((permission) => hasPermission(user, permission));
}

import { canAccess } from './permission.utils';
import type { RoutePermission } from './permission.utils';
import { useSessionStore } from './session.store';

/**
 * usePermission — `true` khi người đang đăng nhập có `permission`; tự render lại khi quyền đổi.
 *
 * Cùng một luật với `PermissionGuard` và menu (`canAccess`): kiểm đăng nhập tắt (chế độ demo) → luôn
 * `true`, nên nút ẩn theo quyền vẫn hiện trong demo. Admin luôn có mọi quyền.
 * Lưu ý: chỉ ẩn/hiện giao diện — quyền thật do BE kiểm trên từng API.
 *
 * @param permission - Quyền cần có; bỏ `action` thì hiểu là `'view'`.
 *
 * @example
 * const canExport = usePermission({ resource: 'report', action: 'export' });
 */
export function usePermission(permission: RoutePermission): boolean {
  return useSessionStore((state) => canAccess(state.user, [permission]));
}

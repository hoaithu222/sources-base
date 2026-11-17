import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { usePermission } from '@/domains/session';
import type { RoutePermission } from '@/domains/session';
import { PATHS } from '@/shared/constants/paths.constants';

interface PermissionGuardProps {
  permission: RoutePermission;
  children: ReactNode;
}

/**
 * PermissionGuard — thiếu quyền thì chuyển sang trang 403; đặt BÊN TRONG `AuthGuard` (không kiểm đăng nhập).
 *
 * `buildRoutes` tự lồng guard theo `permission` khai ở route nên hiếm khi phải viết tay. Cùng luật với
 * menu và `usePermission` (`canAccess`): chế độ demo mở hết.
 * Lưu ý: chỉ điều khiển giao diện; quyền thật do BE kiểm trên từng API.
 *
 * @param props.permission - Quyền cần có để thấy `children`.
 * @param props.children - Phần được bảo vệ (layout hoặc trang).
 */
function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const allowed = usePermission(permission);

  if (!allowed) return <Navigate replace to={PATHS.FORBIDDEN} />;
  return <>{children}</>;
}

export default PermissionGuard;

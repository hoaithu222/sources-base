'use client';

import type { ReactNode } from 'react';

import ForbiddenView from '@/app/_views/status/ForbiddenView';
import { usePermission } from '@/domains/session';
import type { RoutePermission } from '@/domains/session';

interface PermissionGateProps {
  permission: RoutePermission;
  children: ReactNode;
}

/**
 * PermissionGate — thiếu quyền thì hiện `ForbiddenView` TẠI CHỖ (giữ URL, không chuyển trang); đặt BÊN TRONG `AuthGate`
 * (không kiểm đăng nhập) — trong `layout.tsx` của phân hệ hoặc trong `page.tsx`.
 *
 * Cùng luật với menu và `usePermission` (`canAccess`): chế độ demo mở hết.
 * Lưu ý: chỉ điều khiển giao diện; quyền thật do BE kiểm trên từng API. Quyền của phân hệ cũng khai ở
 * `src/app/_navigation/navigation.config.ts` để menu ẩn mục — giữ hai nơi khớp nhau.
 *
 * @param props.permission - Quyền cần có để thấy `children`.
 * @param props.children - Phần được bảo vệ (layout hoặc trang).
 *
 * @example
 * <PermissionGate permission={{ resource: 'report', action: 'export' }}><ReportView /></PermissionGate>
 */
export default function PermissionGate({ permission, children }: PermissionGateProps) {
  const allowed = usePermission(permission);

  return allowed ? <>{children}</> : <ForbiddenView />;
}

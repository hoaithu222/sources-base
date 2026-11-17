import type { ReactNode } from 'react';
import { Outlet, type RouteObject } from 'react-router-dom';

import type { ScreenLevel } from '@/app/components';
import type { RoutePermission } from '@/domains/session';

import { LazyLoad } from '../components';
import { toModuleRoute, type ModuleDef, type RouteDef, type RouteHandle } from '../definition';
import { PermissionGuard } from '../guards';

/**
 * build-routes — dựng `RouteObject[]` cho React Router từ khai báo route (`definition/`).
 *
 * Dùng:   buildRoutes(APP_PAGES) · buildRoutes(FALLBACK_PAGES, { level: 'app' })
 *         buildModuleRoutes(MODULE_REGISTRY)
 * Lưu ý:  mỗi `RouteDef` thành một route LỒNG NHAU nên `permission` cộng dồn tự nhiên — guard của cha
 *         render trước, guard của con render bên trong. Mọi trang được bọc `LazyLoad`.
 */

export interface BuildRoutesOptions {
  /** Cỡ màn chờ / màn lỗi: mặc định `content` (route nằm trong layout); ngoài mọi layout thì `app`. */
  level?: ScreenLevel;
}

function withPermission(permission: RoutePermission | undefined, element: ReactNode) {
  if (!permission) return element;
  return <PermissionGuard permission={permission}>{element}</PermissionGuard>;
}

function buildRoute(def: RouteDef, level: ScreenLevel): RouteObject {
  const handle: RouteHandle = { id: def.id, ...def.meta };

  if (def.children) {
    const layout = def.layout ? <LazyLoad component={def.layout} level={level} /> : <Outlet />;
    return {
      path: def.path,
      element: withPermission(def.permission, layout),
      handle,
      children: def.children.map((child) => buildRoute(child, level)),
    };
  }

  const element = withPermission(def.permission, <LazyLoad component={def.page} level={level} />);
  return def.index ? { index: true, element, handle } : { path: def.path, element, handle };
}

export function buildRoutes(
  defs: readonly RouteDef[],
  { level = 'content' }: BuildRoutesOptions = {},
): RouteObject[] {
  return defs.map((def) => buildRoute(def, level));
}

/** Nhận registry làm tham số để test được bằng cấu hình giả. */
export function buildModuleRoutes(
  modules: readonly ModuleDef[],
  options?: BuildRoutesOptions,
): RouteObject[] {
  return buildRoutes(modules.map(toModuleRoute), options);
}

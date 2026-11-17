import { matchPath } from 'react-router-dom';

import type { RoutePermission } from '@/domains/session';

import type { LayoutRouteDef, ModuleDef, RouteDef } from './route.types';

/**
 * route-tree.utils — trải cây khai báo route thành danh sách phẳng để tra path theo id, tra quyền của một
 * trang và kiểm tra hợp lệ.
 *
 * Dùng:   flattenModule(module) → RouteEntry[] · findLandingEntry(module) → trang đích của menu
 *         toModuleRoute(module) → layout route cấp cao nhất (build-routes dựng route từ đây)
 */

export interface RouteEntry {
  /** Khai báo gốc; phân hệ đã chuẩn hoá bằng `toModuleRoute`. */
  def: RouteDef;
  /** Entry cha; `undefined` ở phân hệ. */
  parent?: RouteEntry;
  kind: 'page' | 'index' | 'layout';
  /** Path tuyệt đối đầy đủ, còn nguyên segment động (`/reports/:id`). */
  path: string;
  /** Mọi quyền phải thoả để vào route này, xếp từ ngoài vào trong. */
  permissions: readonly RoutePermission[];
}

function joinPath(parentPath: string, childPath: string): string {
  if (!parentPath) return childPath;
  return `${parentPath.replace(/\/$/, '')}/${childPath}`;
}

/** Quyền tối thiểu của phân hệ; `undefined` khi phân hệ chỉ cần đã đăng nhập. */
function resolveModulePermission(module: ModuleDef): RoutePermission | undefined {
  if (module.permission === 'authenticated') return undefined;
  return module.permission ?? { resource: module.id, action: 'view' };
}

/** Phân hệ là một layout route cấp cao nhất, với quyền đã chuẩn hoá. */
export function toModuleRoute(module: ModuleDef): LayoutRouteDef {
  return {
    id: module.id,
    path: module.path,
    layout: module.layout,
    permission: resolveModulePermission(module),
    meta: module.meta,
    children: module.children,
  };
}

function kindOf(def: RouteDef): RouteEntry['kind'] {
  if (def.children) return 'layout';
  return def.index ? 'index' : 'page';
}

function flattenRoutes(defs: readonly RouteDef[], parent?: RouteEntry): RouteEntry[] {
  return defs.flatMap((def) => {
    const parentPath = parent?.path ?? '';
    const parentPermissions = parent?.permissions ?? [];
    const entry: RouteEntry = {
      def,
      parent,
      kind: kindOf(def),
      path: def.index ? parentPath : joinPath(parentPath, def.path),
      permissions: def.permission ? [...parentPermissions, def.permission] : parentPermissions,
    };

    return def.children ? [entry, ...flattenRoutes(def.children, entry)] : [entry];
  });
}

/** Mọi route của phân hệ, entry đầu là chính phân hệ, xếp theo thứ tự khai báo (cha trước con). */
export function flattenModule(module: ModuleDef): RouteEntry[] {
  return flattenRoutes([toModuleRoute(module)]);
}

/**
 * Trang đích khi bấm phân hệ ở menu: route khớp `meta.landingPath` (bỏ `?query` / `#hash`), hoặc trang
 * index tại `path` của phân hệ. `undefined` khi không trang nào khớp.
 */
export function findLandingEntry(module: ModuleDef): RouteEntry | undefined {
  const pathname = (module.meta.landingPath ?? module.path).split(/[?#]/)[0];
  const pages = flattenModule(module).filter((entry) => entry.kind !== 'layout');

  return (
    pages.find((entry) => entry.path === pathname) ??
    pages.find((entry) => matchPath({ path: entry.path, end: true }, pathname))
  );
}

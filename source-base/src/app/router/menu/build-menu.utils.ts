import type { ComponentType } from 'react';

import type { RoutePermission } from '@/domains/session';
import type { SystemIconName } from '@/shared/ui';

import { findLandingEntry, flattenModule, isLazyPage } from '../definition';
import type { MenuMeta, ModuleDef, RouteEntry, StaticPageDef } from '../definition';

/**
 * build-menu.utils — dựng mục menu TỪ khai báo route; Dock và bảng lệnh không giữ danh sách path / tên riêng.
 *
 * Dùng:   toPageMenu(APP_PAGES) · toModuleMenu(MODULE_REGISTRY)  (đã lọc theo quyền: `useAppMenu()`)
 *         item.preload?.()  khi người dùng có ý định mở mục (rê chuột / focus / tô sáng)
 */

export interface MenuItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: SystemIconName;
  /** URL đích thật — để render `<Link>`. */
  href: string;
  /** Mọi quyền cần có để vào được `href` (xem `canAccess`). */
  permissions: readonly RoutePermission[];
  /** Nạp trước mã của trang đích (và layout bao nó); gọi nhiều lần vẫn chỉ tải một lần. */
  preload?: () => void;
}

const orderOf = ({ meta }: { meta: MenuMeta }) => meta.order ?? Number.MAX_SAFE_INTEGER;
const byOrder = (a: { meta: MenuMeta }, b: { meta: MenuMeta }) => orderOf(a) - orderOf(b);

/** Hàm nạp trước các trang / layout khai bằng `lazyPage()`; `undefined` khi không có gì để nạp. */
function preloaderOf(components: readonly ComponentType[]): (() => void) | undefined {
  const lazyPages = components.filter(isLazyPage);
  if (lazyPages.length === 0) return undefined;
  return () => lazyPages.forEach((page) => void page.preload());
}

/** Trang của route và layout của mọi tầng cha — thứ phải tải xong mới vẽ được route đó. */
function componentsOnPath(entry: RouteEntry | undefined): ComponentType[] {
  const components: ComponentType[] = [];
  for (let current = entry; current; current = current.parent) {
    const component = current.def.page ?? current.def.layout;
    if (component) components.push(component);
  }
  return components;
}

/** Trang tĩnh hiện trong menu: có `icon` và không `hideInMenu`. */
export function toPageMenu(pages: readonly StaticPageDef[]): MenuItem[] {
  return [...pages].sort(byOrder).flatMap(({ id, path, page, permission, meta }) => {
    if (!meta.icon || meta.hideInMenu) return [];
    return [
      {
        id,
        title: meta.title,
        subtitle: meta.subtitle,
        icon: meta.icon,
        href: path,
        permissions: permission ? [permission] : [],
        preload: preloaderOf([page]),
      },
    ];
  });
}

/** Phân hệ hiện trong menu: không `hideInMenu`, sắp theo `order`; quyền là quyền của TRANG ĐÍCH. */
export function toModuleMenu(modules: readonly ModuleDef[]): MenuItem[] {
  return modules
    .filter((module) => !module.meta.hideInMenu)
    .sort(byOrder)
    .map((module) => {
      const landing = findLandingEntry(module) ?? flattenModule(module)[0];
      return {
        id: module.id,
        title: module.meta.title,
        subtitle: module.meta.subtitle,
        icon: module.meta.icon,
        href: module.meta.landingPath ?? module.path,
        permissions: landing.permissions,
        preload: preloaderOf(componentsOnPath(landing)),
      };
    });
}

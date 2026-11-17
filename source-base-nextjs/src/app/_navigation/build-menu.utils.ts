import { canAccess } from '@/domains/session';
import type { RoutePermission, SessionUser } from '@/domains/session';

import type {
  MenuItem,
  ModuleNavLink,
  NavLabelResolver,
  NavModuleDef,
  NavPageDef,
  NavScreenDef,
} from './navigation.types';

/**
 * build-menu.utils — dựng mục menu TỪ cấu hình điều hướng; Dock, header và bảng lệnh không giữ danh sách path / tên riêng.
 *
 * Dùng:   buildMenu(NAV_PAGES, NAV_MODULES, labelOf, user)  → `{ pages, modules }` đã dịch + lọc quyền (`useAppMenu()`)
 * Lưu ý:  hàm THUẦN — chữ đến từ `labelOf` (do `useAppMenu` dựng từ `messages.shell.nav`), quyền đến từ `canAccess`
 *         (cùng luật với guard nên mục nào hiện ra thì bấm vào là vào được).
 */

export interface AppMenu {
  /** Trang tĩnh có `icon` (nhóm "Điều hướng chung" của bảng lệnh, ô Trang chủ của tab bar điện thoại). */
  pages: MenuItem[];
  /** Phân hệ (Dock, bảng lệnh, bộ chọn phân hệ ở header) — `nav` đã lọc quyền. */
  modules: MenuItem[];
}

const orderOf = ({ order }: { order?: number }) => order ?? Number.MAX_SAFE_INTEGER;
const byOrder = (a: { order?: number }, b: { order?: number }) => orderOf(a) - orderOf(b);

const permissionsOf = (permission: RoutePermission | undefined): RoutePermission[] =>
  permission ? [permission] : [];

function toPageItem(page: NavPageDef, labelOf: NavLabelResolver): MenuItem[] {
  if (!page.icon || page.hideInMenu) return [];
  const { title, subtitle } = labelOf(page.id);
  return [
    {
      id: page.id,
      title,
      subtitle,
      icon: page.icon,
      href: page.path,
      permissions: permissionsOf(page.permission),
    },
  ];
}

function toScreenLink(
  screen: NavScreenDef,
  modulePermissions: readonly RoutePermission[],
  labelOf: NavLabelResolver,
): ModuleNavLink {
  const { title, description } = labelOf(screen.id);
  return {
    id: screen.id,
    title,
    href: screen.path,
    permissions: [...modulePermissions, ...permissionsOf(screen.permission)],
    icon: screen.icon,
    description,
  };
}

function toModuleItem(module: NavModuleDef, labelOf: NavLabelResolver): MenuItem {
  const { title, subtitle } = labelOf(module.id);
  const permissions = permissionsOf(module.permission);
  return {
    id: module.id,
    title,
    subtitle,
    icon: module.icon,
    href: module.path,
    permissions,
    tone: module.tone,
    nav: module.screens
      .filter((screen) => !screen.hideInNav)
      .map((screen) => toScreenLink(screen, permissions, labelOf)),
  };
}

export function buildMenu(
  pages: readonly NavPageDef[],
  modules: readonly NavModuleDef[],
  labelOf: NavLabelResolver,
  user: SessionUser | null,
): AppMenu {
  const visible = <T extends { permissions: readonly RoutePermission[] }>(item: T) =>
    canAccess(user, item.permissions);

  return {
    pages: [...pages]
      .sort(byOrder)
      .flatMap((page) => toPageItem(page, labelOf))
      .filter(visible),
    modules: [...modules]
      .sort(byOrder)
      .map((module) => toModuleItem(module, labelOf))
      .filter(visible)
      .map((item) => ({ ...item, nav: item.nav?.filter(visible) })),
  };
}

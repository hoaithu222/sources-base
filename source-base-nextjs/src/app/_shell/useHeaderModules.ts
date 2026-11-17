'use client';

import { useMemo } from 'react';

import { useActiveModule, type MenuItem, type ModuleNavLink } from '@/app/_navigation';
import type { AppIconName } from '@/shared/ui';
import type { HeaderLevel, HeaderModule, HeaderNavItem } from '@/shared/widgets/header';

interface HeaderModules {
  modules: HeaderModule[];
  activeModuleId?: string;
  moduleNav: HeaderNavItem[];
  level: HeaderLevel;
  backHref?: string;
  moduleHref?: string;
  screenKey?: string;
}

/** Icon của mục: `meta.navIcon`; trang chủ phân hệ → `overview`, nhóm (layout có con) → `folder`. */
function navIconOf(link: ModuleNavLink, rootHref: string | undefined): AppIconName | undefined {
  if (link.icon) return link.icon;
  if (link.href === rootHref) return 'overview';
  return link.children ? 'folder' : undefined;
}

function toNavItem(
  link: ModuleNavLink,
  activeHref: string | undefined,
  rootHref: string | undefined,
): HeaderNavItem {
  const children = link.children?.map((child) => toNavItem(child, activeHref, rootHref));
  return {
    key: link.id,
    label: link.title,
    href: link.href,
    icon: navIconOf(link, rootHref),
    active: link.href === activeHref || Boolean(children?.some((child) => child.active)),
    children,
  };
}

function toHeaderModule(item: MenuItem, activeHref: string | undefined): HeaderModule {
  return {
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    icon: item.icon,
    tone: item.tone,
    href: item.href,
    screens: (item.nav ?? []).map((link) => toNavItem(link, activeHref, item.href)),
  };
}

/**
 * useHeaderModules — dữ liệu PHÂN HỆ cho `<Header>`: launcher (đã lọc quyền), phân hệ đang mở, dải màn hình của nó, CẤP
 * của URL và đích nút quay lại (`useActiveModule`).
 *
 * Dùng:   const { modules, activeModuleId, moduleNav, level, backHref, moduleHref, screenKey } = useHeaderModules();
 * Lưu ý:  cấp 1 (trang chủ phân hệ) header hiện dải màn hình; cấp 2–3 header ĐỔI CẤP: nút ‹ + tên phân hệ + màn hình
 *         đang mở (bấm để chuyển màn cùng phân hệ).
 */
export function useHeaderModules(): HeaderModules {
  const { modules, module, rootHref, screen, level, backHref } = useActiveModule();

  return useMemo(
    () => ({
      modules: modules.map((item) => toHeaderModule(item, screen?.href)),
      activeModuleId: module?.id,
      moduleNav: (module?.nav ?? []).map((link) => toNavItem(link, screen?.href, rootHref)),
      level,
      backHref,
      moduleHref: rootHref,
      screenKey: screen?.id,
    }),
    [modules, module, rootHref, screen, level, backHref],
  );
}

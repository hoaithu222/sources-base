import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import type { MenuItem, ModuleNavLink } from './build-menu.utils';
import { useAppMenu } from './useAppMenu';

/**
 * Cấp điều hướng của URL hiện tại: `0` ngoài mọi phân hệ (trang chủ, hồ sơ) · `1` TRANG CHỦ phân hệ · `2` một MÀN HÌNH
 * của phân hệ (route con có trên dải điều hướng) · `3` sâu hơn màn hình (chi tiết bản ghi, trang phụ `hideInNav`).
 */
export type ModuleLevel = 0 | 1 | 2 | 3;

export interface ActiveModule {
  /** Mọi phân hệ đã lọc quyền (launcher, Dock). */
  modules: MenuItem[];
  module?: MenuItem;
  /** Trang chủ của phân hệ đang mở (route index / `landingPath`). */
  rootHref?: string;
  /** Màn hình đang mở = mục điều hướng SÂU NHẤT khớp URL. */
  screen?: ModuleNavLink;
  level: ModuleLevel;
  /** Đích nút quay lại: cấp 2 → trang chủ phân hệ · cấp 3 → màn hình chứa nó. */
  backHref?: string;
}

/** `pathname` thuộc `href` (khớp chính xác hoặc theo tiền tố PHÂN ĐOẠN: `/a` khớp `/a/b`, không khớp `/ab`). */
export function isUnderPath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mục lá (trang) của cây điều hướng — nhóm thay bằng các trang con của nó. */
export function flattenNavLinks(links: readonly ModuleNavLink[]): ModuleNavLink[] {
  return links.flatMap((link) => (link.children ? flattenNavLinks(link.children) : [link]));
}

function levelOf(
  pathname: string,
  rootHref: string,
  screen: ModuleNavLink | undefined,
): ModuleLevel {
  if (pathname === rootHref) return 1;
  if (!screen || screen.href === rootHref) return isUnderPath(pathname, rootHref) ? 2 : 1;
  return pathname === screen.href ? 2 : 3;
}

function backHrefOf(
  level: ModuleLevel,
  rootHref: string,
  screen: ModuleNavLink | undefined,
): string | undefined {
  if (level === 3) return screen?.href ?? rootHref;
  if (level === 2) return rootHref;
  return undefined;
}

/**
 * useActiveModule — phân hệ, màn hình và CẤP của URL hiện tại, dựng từ module registry (đã lọc quyền). Nguồn chung của
 * header (đổi cấp + nút quay lại), trang chủ phân hệ (lưới màn hình) và Dock.
 *
 * Dùng:   const { module, screen, level, backHref } = useActiveModule();
 * Lưu ý:  màn hình = mục SÂU NHẤT khớp URL (`/tai-chinh` không sáng khi đang ở `/tai-chinh/so-cai`).
 */
export function useActiveModule(): ActiveModule {
  const { modules } = useAppMenu();
  const { pathname } = useLocation();

  return useMemo(() => {
    const module = modules.find((item) => {
      const root = item.nav?.[0]?.href ?? item.href;
      return isUnderPath(pathname, root) || isUnderPath(pathname, item.href);
    });
    if (!module) return { modules, level: 0 };

    const leaves = flattenNavLinks(module.nav ?? []);
    const rootHref = module.nav?.[0]?.href ?? module.href;
    const screen = leaves
      .filter((link) => isUnderPath(pathname, link.href))
      .sort((a, b) => b.href.length - a.href.length)[0];
    const level = levelOf(pathname, rootHref, screen);
    return {
      modules,
      module,
      rootHref,
      screen,
      level,
      backHref: backHrefOf(level, rootHref, screen),
    };
  }, [modules, pathname]);
}

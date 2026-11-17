import { useMemo } from 'react';

import { canAccess, selectUser, useSessionStore } from '@/domains/session';

import { MODULE_REGISTRY } from '../modules';
import { APP_PAGES } from '../static.routes';

import { toModuleMenu, toPageMenu, type MenuItem } from './build-menu.utils';

interface AppMenu {
  /** Trang tĩnh có `icon` (nhóm "Điều hướng chung" của bảng lệnh). */
  pages: MenuItem[];
  /** Phân hệ (Dock, bảng lệnh). */
  modules: MenuItem[];
}

const PAGE_MENU = toPageMenu(APP_PAGES);
const MODULE_MENU = toModuleMenu(MODULE_REGISTRY);

/**
 * useAppMenu — menu của app (trang tĩnh + phân hệ) đã lọc theo quyền người dùng hiện tại bằng CHÍNH
 * `canAccess` của `PermissionGuard`, nên mục nào hiện ra thì bấm vào là vào được.
 *
 * Dùng:   const { modules } = useAppMenu()  (Dock) · const { pages, modules } = useAppMenu()  (bảng lệnh)
 */
export function useAppMenu(): AppMenu {
  const user = useSessionStore(selectUser);

  return useMemo(
    () => ({
      pages: PAGE_MENU.filter((item) => canAccess(user, item.permissions)),
      modules: MODULE_MENU.filter((item) => canAccess(user, item.permissions)),
    }),
    [user],
  );
}

import { appConfig } from '@/core/config';
import { PATHS } from '@/shared/constants/paths.constants';

import type { NavModuleDef, NavPageDef } from './navigation.types';

/**
 * Cấu hình điều hướng — nơi khai báo DUY NHẤT của trang tĩnh và phân hệ; Dock, header, bảng lệnh, tab bar điện thoại
 * đều dựng từ đây (qua `useAppMenu`).
 *
 * Dùng:   thêm phân hệ → tạo thư mục route dưới `src/app/[locale]/(workspace)/(app)/<path>/`, thêm id + chữ vào
 *         `messages/{vi,en}/shell.json` (`nav.<id>`), rồi khai ở `NAV_MODULES`.
 * Lưu ý:  route thật do HỆ THỐNG FILE của Next quyết định — file này chỉ MÔ TẢ cho menu; `tests/app/navigation.test.ts`
 *         kiểm mỗi path khai ở đây đều có `page.tsx`. Tắt phân hệ theo cờ: `...(flag ? [xModule] : [])`.
 *         Quyền cộng dồn: `permission` của màn hình là phần THÊM vào quyền của phân hệ.
 */

export const NAV_PAGES: readonly NavPageDef[] = [
  { id: 'dashboard', path: PATHS.DASHBOARD, icon: 'home', order: 0 },
  { id: 'profile', path: PATHS.PROFILE, icon: 'customer', order: 1 },
  { id: 'settings', path: PATHS.SETTINGS, icon: 'settings', order: 2 },
];

const demoModule: NavModuleDef = {
  id: 'demo',
  path: PATHS.DEMO,
  icon: 'apps',
  tone: 'primary',
  screens: [
    { id: 'demoLibrary', path: PATHS.DEMO },
    {
      id: 'demoCustomers',
      path: PATHS.DEMO_CUSTOMERS,
      icon: 'customer',
      permission: { resource: 'customer' },
    },
    {
      id: 'demoCustomerNew',
      path: PATHS.DEMO_CUSTOMER_NEW,
      hideInNav: true,
      permission: { resource: 'customer', action: 'create' },
    },
    { id: 'demoCustomerEdit', path: PATHS.DEMO_CUSTOMER_EDIT, hideInNav: true },
  ],
};

export const NAV_MODULES: readonly NavModuleDef[] = [...(appConfig.isDemo ? [demoModule] : [])];

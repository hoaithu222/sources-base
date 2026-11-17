import { Navigate, type RouteObject } from 'react-router-dom';

import { AppShellLayout, AuthLayout, RootLayout } from '@/app/layouts';
import { PATHS } from '@/shared/constants/paths.constants';

import { RouteErrorScreen } from '../components';
import { AuthGuard, GuestGuard } from '../guards';
import { MODULE_REGISTRY } from '../modules';
import { APP_PAGES, FALLBACK_PAGES, GUEST_PAGES } from '../static.routes';
import { DisplayUrlSync, DocumentTitleSync, RouteAnnouncer } from '../sync';

import { buildModuleRoutes, buildRoutes } from './build-routes';

/**
 * appRoutes — cây route của app: chỉ trả lời "nhóm trang nào nằm sau guard nào, trong layout nào".
 *
 * Dùng:   createBrowserRouter(appRoutes) (AppRouter) · createMemoryRouter(appRoutes, …) (test)
 *         path, trang, quyền, tiêu đề khai ở `static.routes.ts` và `modules/module-registry.ts`.
 * Lưu ý:  hai bộ đồng bộ + vùng báo chuyển trang đứng CẠNH `RootLayout` ở route gốc để phủ cả trang
 *         ngoài `AuthGuard` (đăng nhập, 403, 404); `errorElement` ở đó là lưới đỡ cuối cho lỗi ở guard,
 *         layout, header.
 *         ⛔ không khai component trong file này — docs/rules/foundations/clean-code-standards.md §5.
 */

export const appRoutes: RouteObject[] = [
  {
    element: (
      <>
        <DocumentTitleSync />
        <RouteAnnouncer />
        <DisplayUrlSync />
        <RootLayout />
      </>
    ),
    errorElement: <RouteErrorScreen />,
    children: [
      {
        element: <GuestGuard />,
        children: [{ element: <AuthLayout />, children: buildRoutes(GUEST_PAGES) }],
      },
      {
        element: <AuthGuard />,
        children: [
          {
            element: <AppShellLayout />,
            children: [...buildRoutes(APP_PAGES), ...buildModuleRoutes(MODULE_REGISTRY)],
          },
        ],
      },
      ...buildRoutes(FALLBACK_PAGES, { level: 'app' }),
      { path: '*', element: <Navigate replace to={PATHS.NOT_FOUND} /> },
    ],
  },
];

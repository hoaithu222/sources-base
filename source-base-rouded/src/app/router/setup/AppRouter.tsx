import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { appRoutes } from './app-routes';

/**
 * AppRouter — gắn router trình duyệt của app vào cây React.
 *
 * Router dựng MỘT lần khi component mount lần đầu (`useState` lười), không dựng lúc import module — nên
 * test import hàm thuần của `@/app/router/*` không vô tình tạo router trình duyệt.
 */
export default function AppRouter() {
  const [router] = useState(() => createBrowserRouter(appRoutes));

  return <RouterProvider router={router} />;
}

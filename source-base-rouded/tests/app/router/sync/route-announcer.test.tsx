/**
 * `RouteAnnouncer` — báo chuyển trang cho trình đọc màn hình.
 *
 * Điều hướng phía client không tải lại trang nên trình đọc màn hình im lặng: người dùng bấm một liên
 * kết mà không biết trang đã đổi. Vùng `aria-live="polite"` ẩn đọc tên trang mới (cùng nguồn với tên
 * tab — `resolveScreenTitle`), không đọc ở lần tải đầu và khi chỉ đổi `?search` / `#hash`.
 */

import { act, render } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { appRoutes } from '@/app/router';
import { RouteAnnouncer } from '@/app/router/sync';
import { APP_NAME } from '@/shared/constants/app.constants';
import { PATHS } from '@/shared/constants/paths.constants';

const ROUTES: RouteObject[] = [
  {
    element: (
      <>
        <RouteAnnouncer />
        <Outlet />
      </>
    ),
    children: [
      {
        path: '/reports',
        element: null,
        handle: { title: 'Báo cáo', tabTitles: { chi: 'Chi tiết' } },
      },
      { path: '/settings', element: null, handle: { title: 'Cài đặt' } },
      { path: '/khong-tieu-de', element: null },
    ],
  },
];

let router: ReturnType<typeof createMemoryRouter> | undefined;

function renderAt(path: string, routes: RouteObject[] = ROUTES) {
  router = createMemoryRouter(routes, { initialEntries: [path] });
  const view = render(<RouterProvider router={router} />);
  const region = view.container.querySelector('[aria-live="polite"]');
  if (!region) throw new Error('Không thấy vùng aria-live của RouteAnnouncer');
  return { region, router };
}

afterEach(() => {
  router?.dispose();
  router = undefined;
});

describe('RouteAnnouncer', () => {
  it('vùng báo ẩn khỏi mắt (sr-only), đọc cả câu (aria-atomic)', () => {
    const { region } = renderAt('/reports');

    expect(region).toHaveClass('sr-only');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('lần tải đầu KHÔNG đọc gì — trình đọc đã tự đọc trang vừa mở', () => {
    const { region } = renderAt('/reports');

    expect(region).toBeEmptyDOMElement();
  });

  it('đổi `pathname` → đọc tên trang mới', async () => {
    const { region, router: r } = renderAt('/reports');

    await act(() => r.navigate('/settings'));

    expect(region).toHaveTextContent('Cài đặt');
  });

  it('chỉ đổi `?search` / `#hash` (lọc, tab) → không đọc lại', async () => {
    const { region, router: r } = renderAt('/reports');
    await act(() => r.navigate('/settings'));

    await act(() => r.navigate('/settings?page=2#bang'));

    expect(region).toHaveTextContent('Cài đặt');
    await act(() => r.navigate('/reports?tab=chi'));
    expect(region).toHaveTextContent('Báo cáo · Chi tiết');
  });

  it('trang không khai tiêu đề → đọc tên app', async () => {
    const { region, router: r } = renderAt('/reports');

    await act(() => r.navigate('/khong-tieu-de'));

    expect(region).toHaveTextContent(APP_NAME);
  });

  it('gắn sẵn ở route gốc của app: cả trang ngoài khung đăng nhập (404) cũng được báo', async () => {
    const { region, router: r } = renderAt(PATHS.LOGIN, appRoutes);

    await act(() => r.navigate(PATHS.NOT_FOUND));

    expect(region).toHaveTextContent('Không tìm thấy trang');
    expect(region).not.toHaveTextContent(APP_NAME);
  });
});

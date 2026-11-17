/**
 * Tên tab trình duyệt lấy từ `meta` của chính route đang khớp —
 * không có bảng path → tiêu đề thứ hai để lệch với bảng route.
 */

import { act, render, waitFor } from '@testing-library/react';
import { createMemoryRouter, matchRoutes, Outlet, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { appRoutes } from '@/app/router';
import type { ModuleDef } from '@/app/router/definition';
import { buildModuleRoutes } from '@/app/router/setup';
import { DocumentTitleSync, resolveDocumentTitle, resolveScreenTitle } from '@/app/router/sync';
import { APP_NAME } from '@/shared/constants/app.constants';
import { PATHS } from '@/shared/constants/paths.constants';

const Page = () => null;

const reportModule: ModuleDef = {
  id: 'report',
  path: '/reports',
  permission: 'authenticated',
  meta: {
    title: 'Báo cáo',
    icon: 'chart-line-outline',
    tabTitles: { summary: 'Tổng quan', detail: 'Số liệu chi tiết' },
    defaultTab: 'summary',
  },
  children: [
    { index: true, page: Page },
    { path: 'create', page: Page, meta: { title: 'Tạo báo cáo' } },
    {
      path: ':id',
      meta: { title: 'Chi tiết' },
      children: [
        { index: true, page: Page },
        { path: 'settings', page: Page, meta: { title: 'Cài đặt báo cáo' } },
        {
          path: 'view/:tab',
          page: Page,
          meta: { title: 'Xem', tabTitles: { chart: 'Biểu đồ' } },
        },
      ],
    },
  ],
};

const FAKE_ROUTES = buildModuleRoutes([reportModule]);

/** Dựng đúng thứ `useMatches()` trả về, không cần mount router. */
function matchesAt(routeObjects: RouteObject[], pathname: string) {
  return (matchRoutes(routeObjects, pathname) ?? []).map((match) => ({
    pathname: match.pathname,
    params: match.params,
    handle: match.route.handle as unknown,
  }));
}

const titleAt = (url: string, routeObjects: RouteObject[] = FAKE_ROUTES) => {
  const [pathname, search = ''] = url.split('?');
  return resolveDocumentTitle(matchesAt(routeObjects, pathname), search && `?${search}`);
};

const withApp = (head: string) => `${head} | ${APP_NAME}`;

describe('tên tab trình duyệt', () => {
  it('trang tĩnh của app: tên lấy từ entry khai path', () => {
    expect(titleAt(PATHS.LOGIN, appRoutes)).toBe(withApp('Đăng nhập'));
    expect(titleAt(PATHS.PROFILE, appRoutes)).toBe(withApp('Thông tin cá nhân'));
    expect(titleAt(PATHS.NOT_FOUND, appRoutes)).toBe(withApp('Không tìm thấy trang'));
  });

  it('phân hệ thật: `tabTitle` thắng `title`, màn con đứng sau tên phân hệ', () => {
    expect(titleAt('/demo', appRoutes)).toBe(withApp('Thư viện giao diện'));
    expect(titleAt('/demo/ghep', appRoutes)).toBe(
      withApp('Thư viện giao diện · Ghép thực tế — màn hình mẫu'),
    );
  });

  it('URL không route nào có tiêu đề → tên app', () => {
    expect(titleAt('/duong-dan-khong-ton-tai', appRoutes)).toBe(APP_NAME);
  });

  it('route ĐỘNG: khớp theo mẫu, không cần khai từng URL', () => {
    expect(titleAt('/reports/12/settings')).toBe(withApp('Báo cáo · Cài đặt báo cáo'));
    expect(titleAt('/reports/9999/settings')).toBe(withApp('Báo cáo · Cài đặt báo cáo'));
  });

  it('trang index không khai `meta` dùng tiêu đề của route cha', () => {
    expect(titleAt('/reports/12')).toBe(withApp('Báo cáo · Chi tiết'));
  });

  it('`defaultTab` áp ở chính trang khai nó', () => {
    expect(titleAt('/reports')).toBe(withApp('Báo cáo · Tổng quan'));
  });

  it('`?tab=` đổi tên tab; param khác không ảnh hưởng', () => {
    expect(titleAt('/reports?tab=detail&page=3')).toBe(withApp('Báo cáo · Số liệu chi tiết'));
  });

  it('tab lạ (người dùng sửa URL) → về tên trang, không hiện chuỗi rác', () => {
    expect(titleAt('/reports?tab=khong-co')).toBe(withApp('Báo cáo'));
  });

  it('⛔ `defaultTab` của phân hệ KHÔNG đè tên trang con', () => {
    expect(titleAt('/reports/create')).toBe(withApp('Báo cáo · Tạo báo cáo'));
  });

  it('trang con dùng được bảng `tabTitles` của route cha khi tab khai tường minh', () => {
    expect(titleAt('/reports/create?tab=detail')).toBe(withApp('Báo cáo · Số liệu chi tiết'));
  });

  it('tên màn (`resolveScreenTitle`, câu báo chuyển trang) = tên tab bỏ đuôi tên app', () => {
    expect(resolveScreenTitle(matchesAt(FAKE_ROUTES, '/reports/12/settings'))).toBe(
      'Báo cáo · Cài đặt báo cáo',
    );
    expect(resolveScreenTitle(matchesAt(FAKE_ROUTES, '/reports'), '?tab=detail')).toBe(
      'Báo cáo · Số liệu chi tiết',
    );
    expect(resolveScreenTitle(matchesAt(appRoutes, '/duong-dan-khong-ton-tai'))).toBeUndefined();
  });

  it('path param `:tab` cũng là tab; bảng gần nhất được tra trước', () => {
    expect(titleAt('/reports/12/view/chart')).toBe(withApp('Báo cáo · Biểu đồ'));
    expect(titleAt('/reports/12/view/summary')).toBe(withApp('Báo cáo · Tổng quan'));
  });
});

describe('DocumentTitleSync', () => {
  it('đổi `document.title` khi đổi route và khi đổi tab', async () => {
    const router = createMemoryRouter(
      [
        {
          element: (
            <>
              <DocumentTitleSync />
              <Outlet />
            </>
          ),
          children: FAKE_ROUTES,
        },
      ],
      { initialEntries: ['/reports'] },
    );
    render(<RouterProvider router={router} />);
    await waitFor(() => expect(document.title).toBe(withApp('Báo cáo · Tổng quan')));

    await act(() => router.navigate('/reports?tab=detail'));
    await waitFor(() => expect(document.title).toBe(withApp('Báo cáo · Số liệu chi tiết')));

    await act(() => router.navigate('/reports/7/settings'));
    await waitFor(() => expect(document.title).toBe(withApp('Báo cáo · Cài đặt báo cáo')));
  });
});

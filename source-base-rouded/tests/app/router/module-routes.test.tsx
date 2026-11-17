/**
 * Từ MỘT khai báo phân hệ dựng ra route, guard quyền và menu — ba thứ phải nói
 * cùng một điều.
 *
 *  - Quyền CỘNG DỒN: của phân hệ là tối thiểu, của trang index / route con là
 *    thêm vào. Không cái nào "ghi đè" cái nào.
 *  - Route có `children` là layout: render `<Outlet />`, trang mặc định là
 *    `index: true`, path con là tương đối.
 *  - Menu chỉ hiện mục mà bấm vào là vào được.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { lazyPage, type ModuleDef } from '@/app/router/definition';

vi.mock('@/core/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/core/config')>();
  return { ...actual, appConfig: { ...actual.appConfig, authEnabled: true } };
});

const { toModuleMenu } = await import('@/app/router/menu');
const { buildModuleRoutes } = await import('@/app/router/setup');
const { canAccess, establishSession, useSessionStore } = await import('@/domains/session');

const ReportLayout = () => (
  <section aria-label="Khung báo cáo">
    <Outlet />
  </section>
);

const reportModule: ModuleDef = {
  id: 'report',
  path: '/reports',
  meta: { title: 'Báo cáo', icon: 'chart-line-outline', order: 20 },
  children: [
    { index: true, page: () => <p>Danh sách báo cáo</p> },
    {
      path: 'create',
      page: () => <p>Tạo báo cáo</p>,
      permission: { resource: 'report', action: 'create' },
      meta: { title: 'Tạo báo cáo' },
    },
    {
      path: ':id',
      layout: ReportLayout,
      meta: { title: 'Chi tiết' },
      children: [
        { index: true, page: () => <p>Chi tiết báo cáo</p> },
        {
          path: 'settings',
          page: () => <p>Cài đặt báo cáo</p>,
          permission: { resource: 'report', action: 'update' },
          meta: { title: 'Cài đặt báo cáo' },
        },
      ],
    },
  ],
};

/** Trang index đòi THÊM quyền `export` ngoài quyền `view` của phân hệ. */
const ledgerModule: ModuleDef = {
  id: 'ledger',
  path: '/ledger',
  meta: { title: 'Sổ cái', icon: 'chart-simple-outline', order: 10 },
  children: [
    {
      index: true,
      page: () => <p>Sổ cái</p>,
      permission: { resource: 'ledger', action: 'export' },
    },
  ],
};

/** Chỉ cần đăng nhập — nhưng quyền khai ở route con vẫn có hiệu lực. */
const guideModule: ModuleDef = {
  id: 'guide',
  path: '/guide',
  permission: 'authenticated',
  meta: { title: 'Hướng dẫn', icon: 'grid-2-outline' },
  children: [
    { index: true, page: () => <p>Hướng dẫn</p> },
    {
      path: 'admin',
      page: () => <p>Hướng dẫn quản trị</p>,
      permission: { resource: 'guide', action: 'update' },
      meta: { title: 'Quản trị' },
    },
  ],
};

const hiddenModule: ModuleDef = {
  id: 'audit',
  path: '/audit',
  meta: { title: 'Nhật ký', icon: 'grid-2-outline', hideInMenu: true },
  children: [{ index: true, page: () => <p>Nhật ký</p> }],
};

const MODULES = [reportModule, ledgerModule, guideModule, hiddenModule];

const ROUTES: RouteObject[] = [
  ...buildModuleRoutes(MODULES),
  { path: '/403', element: <p>Không có quyền</p> },
];

function signIn(permissions: string[], roles: string[] = ['editor']) {
  establishSession({
    accessToken: 't',
    user: { id: 'u1', email: 'an@congty.vn', name: 'An', roles, permissions },
  });
  return useSessionStore.getState().user;
}

function renderAt(path: string) {
  const router = createMemoryRouter(ROUTES, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => {
  useSessionStore.setState(useSessionStore.getInitialState(), true);
});

describe('quyền của phân hệ và của route con cộng dồn', () => {
  it('có quyền tối thiểu của phân hệ → vào được trang index', async () => {
    signIn(['report:view']);
    renderAt('/reports');
    expect(await screen.findByText('Danh sách báo cáo')).toBeInTheDocument();
  });

  it('thiếu quyền tối thiểu của phân hệ → 403', async () => {
    signIn([]);
    renderAt('/reports');
    expect(await screen.findByText('Không có quyền')).toBeInTheDocument();
  });

  it('⛔ có quyền của route con nhưng THIẾU quyền phân hệ → vẫn 403', async () => {
    signIn(['report:create']);
    renderAt('/reports/create');
    expect(await screen.findByText('Không có quyền')).toBeInTheDocument();
  });

  it('có quyền phân hệ nhưng thiếu quyền của route con → 403', async () => {
    signIn(['report:view']);
    renderAt('/reports/create');
    expect(await screen.findByText('Không có quyền')).toBeInTheDocument();
  });

  it('đủ cả hai quyền → vào được route con', async () => {
    signIn(['report:view', 'report:create']);
    renderAt('/reports/create');
    expect(await screen.findByText('Tạo báo cáo')).toBeInTheDocument();
  });

  it('⛔ `permission` của TRANG INDEX được áp, không bị bỏ qua', async () => {
    signIn(['ledger:view']);
    renderAt('/ledger');
    expect(await screen.findByText('Không có quyền')).toBeInTheDocument();
  });

  it('trang index: đủ quyền phân hệ + quyền riêng → vào được', async () => {
    signIn(['ledger:view', 'ledger:export']);
    renderAt('/ledger');
    expect(await screen.findByText('Sổ cái')).toBeInTheDocument();
  });

  it("`permission: 'authenticated'` bỏ quyền tối thiểu, KHÔNG bỏ quyền của route con", async () => {
    signIn([]);
    renderAt('/guide');
    expect(await screen.findByText('Hướng dẫn')).toBeInTheDocument();
  });

  it("phân hệ `'authenticated'`: route con có `permission` vẫn chặn", async () => {
    signIn([]);
    renderAt('/guide/admin');
    expect(await screen.findByText('Không có quyền')).toBeInTheDocument();
  });
});

describe('route lồng nhau', () => {
  it('dựng đúng cây: path phân hệ tuyệt đối, path con tương đối, trang mặc định là index', () => {
    const [report] = buildModuleRoutes([reportModule]);

    expect(report.path).toBe('/reports');
    expect(report.children?.map((r) => (r.index ? 'index' : r.path))).toEqual([
      'index',
      'create',
      ':id',
    ]);
    expect(report.children?.[2].children?.map((r) => (r.index ? 'index' : r.path))).toEqual([
      'index',
      'settings',
    ]);
  });

  it('route có children là layout: trang index hiện BÊN TRONG `<Outlet />` của nó', async () => {
    signIn(['report:view']);
    renderAt('/reports/12');

    const frame = await screen.findByRole('region', { name: 'Khung báo cáo' });
    expect(frame).toHaveTextContent('Chi tiết báo cáo');
  });

  it('route con của layout cũng hiện trong `<Outlet />`, quyền vẫn cộng dồn qua từng tầng', async () => {
    signIn(['report:view', 'report:update']);
    renderAt('/reports/12/settings');

    const frame = await screen.findByRole('region', { name: 'Khung báo cáo' });
    expect(frame).toHaveTextContent('Cài đặt báo cáo');
  });

  it('mỗi route mang `meta` của chính nó trong `handle`', () => {
    const [report] = buildModuleRoutes([reportModule]);

    expect(report.handle).toMatchObject({ id: 'report', title: 'Báo cáo' });
    expect(report.children?.[1].handle).toMatchObject({ title: 'Tạo báo cáo' });
  });
});

describe('menu dựng từ cùng khai báo', () => {
  const menu = toModuleMenu(MODULES);

  it('sắp theo `order` (không khai thì xếp cuối), bỏ mục `hideInMenu`', () => {
    expect(menu.map((item) => item.id)).toEqual(['ledger', 'report', 'guide']);
  });

  it('mục menu lấy tên, icon, đích từ `meta` và `path` của phân hệ', () => {
    expect(menu.find((item) => item.id === 'report')).toMatchObject({
      title: 'Báo cáo',
      icon: 'chart-line-outline',
      href: '/reports',
    });
  });

  it('⛔ quyền của mục menu là quyền của TRANG ĐÍCH, gồm cả quyền riêng của trang index', () => {
    const viewer = signIn(['ledger:view', 'report:view']);
    const visible = menu.filter((item) => canAccess(viewer, item.permissions));

    // `ledger` có quyền phân hệ nhưng trang index còn đòi `export` → không hiện.
    expect(visible.map((item) => item.id)).toEqual(['report', 'guide']);
  });

  it.each([
    ['không quyền nào', [] as string[]],
    ['chỉ xem báo cáo', ['report:view']],
    ['xem sổ cái nhưng không được xuất', ['ledger:view']],
    ['đủ quyền sổ cái', ['ledger:view', 'ledger:export']],
  ])('menu và guard nói cùng một điều — %s', async (_name, permissions) => {
    const user = signIn(permissions);

    for (const item of menu) {
      const router = createMemoryRouter(ROUTES, { initialEntries: [item.href] });
      const view = render(<RouterProvider router={router} />);
      await waitFor(() => expect(view.container).not.toBeEmptyDOMElement());

      const blocked = router.state.location.pathname === '/403';
      expect(blocked, `${item.id}: menu và guard lệch nhau`).toBe(
        !canAccess(user, item.permissions),
      );
      view.unmount();
    }
  });

  it('vai trò admin thấy mọi mục không ẩn', () => {
    const admin = signIn([], ['admin']);
    expect(menu.every((item) => canAccess(admin, item.permissions))).toBe(true);
  });
});

describe('mục menu nạp trước trang đích (`preload`)', () => {
  const loaded = () => Promise.resolve({ default: () => null });

  it('nạp layout của mọi tầng + trang ĐÍCH (`landingPath`), không nạp trang anh em; gọi lại không tải lại', async () => {
    const loaders = {
      layout: vi.fn(loaded),
      detailLayout: vi.fn(loaded),
      landing: vi.fn(loaded),
      sibling: vi.fn(loaded),
    };
    const archive: ModuleDef = {
      id: 'archive',
      path: '/archive',
      layout: lazyPage(loaders.layout),
      meta: { title: 'Lưu trữ', icon: 'grid-2-outline', landingPath: '/archive/2024/summary' },
      children: [
        { path: 'list', page: lazyPage(loaders.sibling), meta: { title: 'Danh sách' } },
        {
          path: ':year',
          layout: lazyPage(loaders.detailLayout),
          children: [
            { path: 'summary', page: lazyPage(loaders.landing), meta: { title: 'Tóm tắt' } },
          ],
        },
      ],
    };
    const [item] = toModuleMenu([archive]);

    item.preload?.();
    item.preload?.();
    await Promise.resolve();

    expect(loaders.layout).toHaveBeenCalledTimes(1);
    expect(loaders.detailLayout).toHaveBeenCalledTimes(1);
    expect(loaders.landing).toHaveBeenCalledTimes(1);
    expect(loaders.sibling).not.toHaveBeenCalled();
  });

  it('phân hệ chỉ có trang nạp sẵn → mục menu không có `preload`', () => {
    expect(toModuleMenu(MODULES).every((item) => item.preload === undefined)).toBe(true);
  });
});

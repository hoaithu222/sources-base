import { lazyPage, type ModuleDef } from '../definition';

/**
 * demoModule — thư viện giao diện: phân hệ mẫu của base, chỉ đăng ký ở chế độ demo.
 *
 * Lưu ý:  `permission: 'authenticated'` vì trang này không có dữ liệu riêng của ai —
 *         đừng chép dòng đó sang phân hệ nghiệp vụ.
 */

export const demoModule: ModuleDef = {
  id: 'demo',
  path: '/demo',
  permission: 'authenticated',
  meta: {
    title: 'Thư viện UI',
    tabTitle: 'Thư viện giao diện',
    subtitle: 'Toàn bộ component, token màu và thang chữ của base',
    icon: 'grid-2-outline',
    order: 100,
  },
  children: [
    {
      index: true,
      page: lazyPage(() => import('@/features/demo/library/pages/DemoPage')),
    },
    {
      id: 'demo.composed',
      path: 'ghep',
      page: lazyPage(() => import('@/features/demo/composed/pages/ComposedDemoPage')),
      meta: { title: 'Ghép thực tế', tabTitle: 'Ghép thực tế — màn hình mẫu' },
    },
    {
      id: 'demo.dashboard',
      path: 'tong-quan',
      page: lazyPage(() => import('@/features/demo/dashboard/pages/DashboardDemoPage')),
      meta: { title: 'Tổng quan dự án', tabTitle: 'Tổng quan dự án — màn hình mẫu' },
    },
    {
      id: 'demo.factory',
      path: 'xuong',
      page: lazyPage(() => import('@/features/demo/factory/pages/FactoryDemoPage')),
      meta: { title: 'Điều hành xưởng', tabTitle: 'Điều hành xưởng — màn hình mẫu' },
    },
  ],
};

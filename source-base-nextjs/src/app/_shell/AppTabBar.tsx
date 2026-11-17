'use client';

import { memo, useMemo } from 'react';

import { useAppMenu } from '@/app/_navigation';
import { PATHS } from '@/shared/constants/paths.constants';
import { TabBar } from '@/shared/widgets/tab-bar';
import type { TabBarItem } from '@/shared/widgets/tab-bar';

/**
 * AppTabBar — nối `TabBar` (thanh điều hướng đáy của điện thoại) với menu đã dịch + lọc quyền: Bảng điều khiển (trang tĩnh
 * khai ở `PATHS.DASHBOARD`) rồi các phân hệ (`useAppMenu().modules`); quá 5 mục thì ô "Thêm" mở sheet đủ mọi mục.
 * `AppShellLayout` chọn nó thay `AppDock` khi `useIsPhone()`.
 */
const AppTabBar = memo(function AppTabBar() {
  const { pages, modules } = useAppMenu();

  const items = useMemo<TabBarItem[]>(() => {
    const home = pages.find((page) => page.href === PATHS.DASHBOARD);
    return [...(home ? [home] : []), ...modules].map(({ id, title, icon, href }) => ({
      id,
      label: title,
      icon,
      href,
    }));
  }, [pages, modules]);

  return <TabBar items={items} />;
});

export default AppTabBar;

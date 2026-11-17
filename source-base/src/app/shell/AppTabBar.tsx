import { memo, useMemo } from 'react';

import { useAppMenu } from '@/app/router/menu';
import { PATHS } from '@/shared/constants/paths.constants';
import { TabBar } from '@/shared/widgets/tab-bar';
import type { TabBarItem } from '@/shared/widgets/tab-bar';

/**
 * AppTabBar — nối `TabBar` (thanh điều hướng đáy của điện thoại) với menu đã lọc quyền: Trang chủ (trang tĩnh khai ở
 * `PATHS.HOME`) rồi các phân hệ (`useAppMenu().modules`); quá 5 mục thì ô "Thêm" mở sheet đủ mọi mục. Chạm / focus vào
 * một ô thì nạp trước trang đích (`MenuItem.preload`). `AppShellLayout` chọn nó thay `AppDock` khi `useIsPhone()`.
 */
const AppTabBar = memo(function AppTabBar() {
  const { pages, modules } = useAppMenu();

  const items = useMemo<TabBarItem[]>(() => {
    const home = pages.find((page) => page.href === PATHS.HOME);
    return [...(home ? [home] : []), ...modules].map(({ id, title, icon, href, preload }) => ({
      id,
      label: title,
      icon,
      href,
      onIntent: preload,
    }));
  }, [pages, modules]);

  return <TabBar items={items} />;
});

export default AppTabBar;

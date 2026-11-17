import { memo, useMemo } from 'react';

import { useAppMenu } from '@/app/router/menu';
import { Dock } from '@/shared/widgets/dock';
import type { DockItemConfig } from '@/shared/widgets/dock';

/**
 * AppDock — nối `Dock` với menu phân hệ đã lọc quyền (`useAppMenu().modules`); rê chuột / focus vào một
 * mục thì nạp trước trang đích (`MenuItem.preload`). `AppShellLayout` gắn MỘT lần.
 */
const AppDock = memo(function AppDock() {
  const { modules } = useAppMenu();

  const items = useMemo<DockItemConfig[]>(
    () =>
      modules.map(({ id, title, icon, href, preload }) => ({
        id,
        label: title,
        icon,
        href,
        onIntent: preload,
      })),
    [modules],
  );

  return <Dock items={items} />;
});

export default AppDock;

'use client';

import { memo, useMemo } from 'react';

import { useAppMenu } from '@/app/_navigation';
import { Dock } from '@/shared/widgets/dock';
import type { DockItemConfig } from '@/shared/widgets/dock';

/**
 * AppDock — nối `Dock` với menu phân hệ đã dịch + lọc quyền (`useAppMenu().modules`, kèm tông `AppTile`). Mục là `<Link>` nên
 * Next tự nạp trước trang đích khi vào tầm nhìn. `AppShellLayout` gắn MỘT lần.
 */
const AppDock = memo(function AppDock() {
  const { modules } = useAppMenu();

  const items = useMemo<DockItemConfig[]>(
    () =>
      modules.map(({ id, title, icon, tone, href }) => ({ id, label: title, icon, tone, href })),
    [modules],
  );

  return <Dock items={items} />;
});

export default AppDock;

import { memo, useMemo } from 'react';

import { useAppMenu } from '@/app/router/menu';
import type { MenuItem } from '@/app/router/menu';
import {
  selectIsTv,
  useDisplayStore,
  useEffectiveTheme,
  useThemeStore,
} from '@/domains/preferences';
import {
  CommandPalette,
  useCommandPaletteShortcut,
  useCommandPaletteStore,
} from '@/shared/widgets/command-palette';
import type { CommandPaletteGroup, CommandPaletteItem } from '@/shared/widgets/command-palette';

const toCommand = ({ id, title, subtitle, icon, href, preload }: MenuItem): CommandPaletteItem => ({
  id,
  label: title,
  description: subtitle,
  icon,
  href,
  onIntent: preload,
});

/**
 * AppCommandPalette — nối `CommandPalette` với menu đã lọc quyền (trang chung + phân hệ, mỗi mục là liên
 * kết thật, mục được tô sáng thì nạp trước trang đích) và lệnh đổi theme (ngoài TV); gắn phím Ctrl/⌘+K.
 * Layout khung ứng dụng gắn MỘT lần.
 */
const AppCommandPalette = memo(function AppCommandPalette() {
  const { pages, modules } = useAppMenu();
  const theme = useEffectiveTheme();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isTv = useDisplayStore(selectIsTv);
  const toggleOpen = useCommandPaletteStore((s) => s.toggle);
  useCommandPaletteShortcut(toggleOpen);

  const groups = useMemo<CommandPaletteGroup[]>(() => {
    const groups: CommandPaletteGroup[] = [
      { label: 'Điều hướng chung', items: pages.map(toCommand) },
      { label: 'Phân hệ', items: modules.map(toCommand) },
    ];
    if (!isTv)
      groups.push({
        label: 'Giao diện',
        items: [
          {
            id: 'toggle-theme',
            label: theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối',
            icon: theme === 'dark' ? 'sun-bold' : 'moon-bold',
            onSelect: toggleTheme,
          },
        ],
      });
    return groups;
  }, [pages, modules, theme, toggleTheme, isTv]);

  return <CommandPalette groups={groups} />;
});

export default AppCommandPalette;

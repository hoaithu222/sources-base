'use client';

import { memo, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useAppMenu } from '@/app/_navigation';
import type { MenuItem } from '@/app/_navigation';
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

const toCommand = ({ id, title, subtitle, icon, href }: MenuItem): CommandPaletteItem => ({
  id,
  label: title,
  description: subtitle,
  icon,
  href,
});

/**
 * AppCommandPalette — nối `CommandPalette` với menu đã dịch + lọc quyền (trang chung + phân hệ, mỗi mục là liên
 * kết thật) và lệnh đổi theme (ngoài TV); gắn phím Ctrl/⌘+K.
 * Layout khung ứng dụng gắn MỘT lần.
 */
const AppCommandPalette = memo(function AppCommandPalette() {
  const t = useTranslations('shell.commandPalette');
  const { pages, modules } = useAppMenu();
  const theme = useEffectiveTheme();
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const isTv = useDisplayStore(selectIsTv);
  const toggleOpen = useCommandPaletteStore((s) => s.toggle);
  useCommandPaletteShortcut(toggleOpen);

  const groups = useMemo<CommandPaletteGroup[]>(() => {
    const groups: CommandPaletteGroup[] = [
      { label: t('groupGeneral'), items: pages.map(toCommand) },
      { label: t('groupModules'), items: modules.map(toCommand) },
    ];
    if (!isTv)
      groups.push({
        label: t('groupAppearance'),
        items: [
          {
            id: 'toggle-theme',
            label: theme === 'dark' ? t('toLightTheme') : t('toDarkTheme'),
            icon: theme === 'dark' ? 'sun-bold' : 'moon-bold',
            onSelect: toggleTheme,
          },
        ],
      });
    return groups;
  }, [pages, modules, theme, toggleTheme, isTv, t]);

  return <CommandPalette groups={groups} />;
});

export default AppCommandPalette;

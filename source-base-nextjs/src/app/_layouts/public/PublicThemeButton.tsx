'use client';

import { useTranslations } from 'next-intl';

import { MoonBoldIcon, SunBoldIcon } from '@/assets/icons/standalone';
import { useEffectiveTheme, useThemeStore } from '@/domains/preferences';
import { Button } from '@/shared/ui';
import StaticIcon from '@/shared/ui/icons/StaticIcon';

/**
 * PublicThemeButton — nút đổi sáng / tối cho header trang công khai. Icon đổi sau khi store nạp xong (server luôn dựng theme
 * sáng — xem `StoreHydration`); phần còn lại của trang đã đúng giao diện nhờ script khởi tạo trong `<head>`.
 */
export default function PublicThemeButton() {
  const t = useTranslations('ui.actions.themeToggle');
  const theme = useEffectiveTheme();
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';

  return (
    <Button
      aria-label={isDark ? t('toLight') : t('toDark')}
      size="sm"
      startIcon={<StaticIcon icon={isDark ? SunBoldIcon : MoonBoldIcon} size={16} />}
      variant="ghost"
      onClick={toggleTheme}
    />
  );
}

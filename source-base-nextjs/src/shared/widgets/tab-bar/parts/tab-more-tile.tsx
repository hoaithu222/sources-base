'use client';

import { memo } from 'react';
import { Link } from '@/core/i18n';

import { AppIcon } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { TAB_BAR_SHEET_ACTIVE_CLASSES, TAB_BAR_SHEET_CLASSES } from '../tab-bar.theme';
import type { TabBarItem } from '../tab-bar.types';

interface TabMoreTileProps {
  item: TabBarItem;
  active: boolean;
  spanClassName: string;
  onNavigate: () => void;
}

/**
 * TabMoreTile — một ô vuông trong sheet "Tất cả phân hệ": icon trong khung + nhãn tối đa 2 dòng. Là `<Link>`
 * thật; chọn xong sheet tự đóng. Phần nội bộ của `TabBar`.
 *
 * @param props.item - Mục cần vẽ.
 * @param props.active - Mục đang mở: viền + nền nhấn + vạch ngọc đỉnh + `aria-current="page"`.
 * @param props.spanClassName - Class bề rộng từ `tileSpanClass` (ô lẻ cuối hàng dãn ra).
 * @param props.onNavigate - Gọi khi chọn ô (đóng sheet).
 *
 * @example
 * <TabMoreTile active={false} item={item} spanClassName="col-span-4" onNavigate={closeSheet} />
 */
const TabMoreTile = memo(function TabMoreTile({
  item,
  active,
  spanClassName,
  onNavigate,
}: TabMoreTileProps) {
  const tileClassName = cn(
    TAB_BAR_SHEET_CLASSES.tile,
    active && TAB_BAR_SHEET_ACTIVE_CLASSES.tile,
    spanClassName,
  );
  const iconClassName = cn(
    TAB_BAR_SHEET_CLASSES.tileIcon,
    active && TAB_BAR_SHEET_ACTIVE_CLASSES.tileIcon,
  );

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={tileClassName}
      href={item.href}
      onClick={onNavigate}
      onFocus={item.onIntent}
    >
      {active && <span aria-hidden className={TAB_BAR_SHEET_CLASSES.tileMark} />}
      <span className={iconClassName}>
        <AppIcon name={item.icon} />
      </span>
      <span className={TAB_BAR_SHEET_CLASSES.tileLabel}>{item.label}</span>
    </Link>
  );
});

export default TabMoreTile;

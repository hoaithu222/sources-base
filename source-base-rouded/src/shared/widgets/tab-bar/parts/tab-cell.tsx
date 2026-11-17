import { memo } from 'react';
import { Link } from 'react-router-dom';

import { cn } from '@/shared/utils/style/cn';

import { TAB_BAR_ACTIVE_CLASSES, TAB_BAR_SLOT_CLASSES } from '../tab-bar.theme';
import type { TabBarItem } from '../tab-bar.types';
import TabCellContent from './tab-cell-content';

interface TabCellProps {
  item: TabBarItem;
  active: boolean;
}

/**
 * TabCell — một ô điều hướng của thanh tab: `<Link>` thật (chuột phải / giữ ngón tay mở được tab mới),
 * `aria-current="page"` khi đang mở. Phần nội bộ của `TabBar`.
 *
 * @param props.item - Mục cần vẽ.
 * @param props.active - Mục đang mở: icon `duo` + nhãn ngọc đậm + `aria-current="page"`.
 *
 * @example
 * <TabCell active item={{ id: 'home', label: 'Trang chủ', icon: 'house-outline', href: '/' }} />
 */
const TabCell = memo(function TabCell({ item, active }: TabCellProps) {
  const cellClassName = cn(TAB_BAR_SLOT_CLASSES.cell, active && TAB_BAR_ACTIVE_CLASSES.cell);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      aria-label={item.label}
      className={cellClassName}
      to={item.href}
      onFocus={item.onIntent}
      onPointerEnter={item.onIntent}
    >
      <TabCellContent active={active} item={item} />
    </Link>
  );
});

export default TabCell;

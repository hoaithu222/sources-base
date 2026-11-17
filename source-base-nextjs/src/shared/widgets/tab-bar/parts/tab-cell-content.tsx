import { memo } from 'react';

import { AppIcon } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { TAB_BAR_ACTIVE_CLASSES, TAB_BAR_SLOT_CLASSES } from '../tab-bar.theme';
import type { TabBarItem } from '../tab-bar.types';

interface TabCellContentProps {
  item: Pick<TabBarItem, 'icon' | 'label' | 'shortLabel'>;
  active: boolean;
}

/**
 * TabCellContent — ruột một ô của thanh tab: icon (bản `duo` khi đang mở) + nhãn một dòng.
 * Phần nội bộ của `TabBar`, dùng chung cho ô liên kết và ô "Thêm".
 *
 * @param props.item - Icon + nhãn cần vẽ (`shortLabel` thắng `label`).
 * @param props.active - Ô đang mở: icon bản `duo`, nhãn đậm + màu ngọc.
 *
 * @example
 * <TabCellContent active item={{ icon: 'house-outline', label: 'Trang chủ' }} />
 */
const TabCellContent = memo(function TabCellContent({ item, active }: TabCellContentProps) {
  const labelClassName = cn(TAB_BAR_SLOT_CLASSES.label, active && TAB_BAR_ACTIVE_CLASSES.label);

  return (
    <>
      <span className={TAB_BAR_SLOT_CLASSES.glyph}>
        <AppIcon name={item.icon} variant={active ? 'duo' : 'line'} />
      </span>
      <span className={labelClassName}>{item.shortLabel ?? item.label}</span>
    </>
  );
});

export default TabCellContent;

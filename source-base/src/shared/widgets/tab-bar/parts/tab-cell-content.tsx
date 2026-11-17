import { memo } from 'react';

import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';

import { TAB_BAR_ACTIVE_CLASSES, TAB_BAR_SLOT_CLASSES } from '../tab-bar.theme';
import type { TabBarItem } from '../tab-bar.types';

interface TabCellContentProps {
  item: Pick<TabBarItem, 'icon' | 'label' | 'shortLabel'>;
  active: boolean;
}

/**
 * TabCellContent — ruột một ô của thanh tab: vạch sáng đỉnh ô (chỉ hiện khi đang mở) + icon + nhãn một dòng.
 * Phần nội bộ của `TabBar`, dùng chung cho ô liên kết và ô "Thêm".
 *
 * @param props.item - Icon + nhãn cần vẽ (`shortLabel` thắng `label`).
 * @param props.active - Ô đang mở: vạch sáng hiện, nhãn đậm.
 *
 * @example
 * <TabCellContent active item={{ icon: 'house-outline', label: 'Trang chủ' }} />
 */
const TabCellContent = memo(function TabCellContent({ item, active }: TabCellContentProps) {
  const indicatorClassName = cn(
    TAB_BAR_SLOT_CLASSES.indicator,
    active && TAB_BAR_ACTIVE_CLASSES.indicator,
  );
  const labelClassName = cn(TAB_BAR_SLOT_CLASSES.label, active && TAB_BAR_ACTIVE_CLASSES.label);

  return (
    <>
      <span aria-hidden className={indicatorClassName} />
      <span className={TAB_BAR_SLOT_CLASSES.glyph}>
        <SystemIcon name={item.icon} />
      </span>
      <span className={labelClassName}>{item.shortLabel ?? item.label}</span>
    </>
  );
});

export default TabCellContent;

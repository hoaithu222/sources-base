import { memo } from 'react';

import { Badge } from '@/shared/ui';

import { STOCK_WARNING_META } from '../../constants/stock.constants';
import type { StockWarning } from '../../types/supply.types';

interface StockWarningBadgesProps {
  warnings: readonly StockWarning[];
}

const STOCK_WARNING_BADGES_CLASSES = {
  list: 'flex flex-wrap items-center gap-1',
  none: 'text-caption-12 text-fg-faint',
} satisfies Record<string, string>;

/**
 * StockWarningBadges — ô "Cảnh báo" của bảng tồn kho: mỗi cảnh báo một huy hiệu dạng thẻ (đỏ: quá hạn / dưới
 * tối thiểu · cam: sắp hết hạn), thứ tự nặng → nhẹ; lô bình thường in "—" mờ để cột cảnh báo nổi đúng chỗ cần nhìn.
 *
 * @param props.warnings - Cảnh báo của lô (rỗng = bình thường), đã sắp nặng → nhẹ (`toStockRows`).
 */
const StockWarningBadges = memo(function StockWarningBadges({ warnings }: StockWarningBadgesProps) {
  if (warnings.length === 0) return <span className={STOCK_WARNING_BADGES_CLASSES.none}>—</span>;

  return (
    <div className={STOCK_WARNING_BADGES_CLASSES.list}>
      {warnings.map((warning) => (
        <Badge key={warning} color={STOCK_WARNING_META[warning].color} shape="tag" size="sm">
          {STOCK_WARNING_META[warning].label}
        </Badge>
      ))}
    </div>
  );
});

export default StockWarningBadges;

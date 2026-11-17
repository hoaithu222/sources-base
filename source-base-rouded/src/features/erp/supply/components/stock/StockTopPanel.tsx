import { memo } from 'react';

import { RankingBoard } from '@/shared/ui';
import type { RankingBoardItem } from '@/shared/ui';

import { SUPPLY_SLOT_CLASSES } from '../../supply.theme';
import { formatMoneyShort } from '../../utils/supply-format.utils';
import SupplyPanel from '../SupplyPanel';

interface StockTopPanelProps {
  items: readonly RankingBoardItem[];
}

/**
 * StockTopPanel — khối "Top 5 mã giá trị lớn": xếp hạng mã vật tư theo giá trị tồn (cộng mọi lô trong kho đang xem),
 * thanh một tông, số tiền gọn bên phải. Thân cuộn khi màn thấp thay vì tràn khối.
 *
 * @param props.items - Năm mã lớn nhất `{ id, label, value }` (`topStockItems`), giá trị là đồng.
 */
const StockTopPanel = memo(function StockTopPanel({ items }: StockTopPanelProps) {
  return (
    <SupplyPanel
      bodyClassName="p-2"
      bodyOverflow="scroll"
      className={SUPPLY_SLOT_CLASSES.sideAuto}
      note="theo giá trị tồn"
      title="Top 5 mã giá trị lớn"
    >
      <RankingBoard
        className="min-h-full justify-between"
        highlightTop={false}
        items={items}
        tone="teal"
        valueFormat={formatMoneyShort}
      />
    </SupplyPanel>
  );
});

export default StockTopPanel;

import { memo } from 'react';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Badge, Button, EmptyState, Input, Toggle } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { STOCK_WAREHOUSES } from '../../constants/stock.constants';
import type { StockLotsState } from '../../hooks/useStockLots';
import { SUPPLY_HEADER_FILTERS_CLASSES, SUPPLY_SLOT_CLASSES } from '../../supply.theme';
import SupplyPanel from '../SupplyPanel';
import StockLotTable from './StockLotTable';

interface StockLotPanelProps {
  stock: StockLotsState;
}

/**
 * StockLotPanel — khối "Tồn kho theo lô": bộ lọc nằm NGAY TRÊN hàng tiêu đề (ô tìm an toàn bộ gõ tiếng Việt · công tắc
 * "Chỉ hiện cảnh báo" kèm số lô có cảnh báo), thân là bảng lô hoặc trạng thái rỗng có nút "Xoá bộ lọc". Ghi chú của tiêu
 * đề là kho đang xem; số lô sau lọc đọc ở dòng tổng + phân trang của bảng.
 *
 * @param props.stock - Trạng thái màn từ `useStockLots()`.
 */
const StockLotPanel = memo(function StockLotPanel({ stock }: StockLotPanelProps) {
  const { keyword, rows, setKeyword, warehouse, warningCount } = stock;
  const { inputProps } = useImeSafeSearchInput(keyword, setKeyword);
  const note = warehouse === 'all' ? 'Tất cả kho' : STOCK_WAREHOUSES[warehouse].name;
  const warningLabel = `${warningCount} lô có cảnh báo`;

  return (
    <SupplyPanel
      className={SUPPLY_SLOT_CLASSES.list}
      headerRight={
        <div className={SUPPLY_HEADER_FILTERS_CLASSES.wrap}>
          <Input
            {...inputProps}
            aria-label="Tìm vật tư"
            clearable
            placeholder="Tìm mã, tên vật tư, lô…"
            size="sm"
            startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
            wrapperClassName="w-56 phone:w-full"
          />
          <Toggle
            checked={stock.warningsOnly}
            className="whitespace-nowrap"
            label="Chỉ hiện cảnh báo"
            size="sm"
            onCheckedChange={stock.setWarningsOnly}
          />
          <Badge aria-label={warningLabel} color="warning" size="sm" title={warningLabel}>
            {warningCount}
          </Badge>
        </div>
      }
      note={note}
      title="Tồn kho theo lô"
    >
      {rows.length === 0 ? (
        <EmptyState
          action={
            <Button size="sm" variant="stroke" onClick={stock.resetFilters}>
              Xoá bộ lọc
            </Button>
          }
          className="min-h-0 flex-1"
          description="Thử bỏ bớt từ khoá hoặc tắt “Chỉ hiện cảnh báo”."
          icon="boxes-stacked-bold"
          iconColor="yellow"
          title="Không có lô nào khớp bộ lọc"
        />
      ) : (
        <StockLotTable
          page={stock.page}
          pageRows={stock.pageRows}
          pageSize={stock.pageSize}
          rows={rows}
          showWarehouse={warehouse === 'all'}
          onPageChange={stock.setPage}
          onPageSizeChange={stock.setPageSize}
        />
      )}
    </SupplyPanel>
  );
});

export default StockLotPanel;

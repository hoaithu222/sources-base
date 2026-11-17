import { memo } from 'react';

import { useImeSafeSearchInput } from '@/shared/hooks';
import { Button, EmptyState, Input } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import { PURCHASE_STATUS_META } from '../../constants/purchase-orders.constants';
import type { PurchaseOrdersState } from '../../hooks/usePurchaseOrders';
import { SUPPLY_HEADER_FILTERS_CLASSES, SUPPLY_SLOT_CLASSES } from '../../supply.theme';
import SupplyPanel from '../SupplyPanel';
import PurchaseOrderTable from './PurchaseOrderTable';

interface PurchaseOrderPanelProps {
  orders: PurchaseOrdersState;
}

/**
 * PurchaseOrderPanel — khối "Danh sách" đơn mua: ô tìm (an toàn bộ gõ tiếng Việt) trên hàng tiêu đề; lọc TRẠNG THÁI nằm
 * trên cột lọc dọc mép phải (`PurchaseOrdersPage`) — đang lọc thì cạnh tên khối ghi "Trạng thái: …" để biết danh sách đã
 * thu hẹp. Thân là bảng đơn mua hoặc trạng thái rỗng có nút "Xoá bộ lọc".
 *
 * @param props.orders - Trạng thái màn từ `usePurchaseOrders()`.
 */
const PurchaseOrderPanel = memo(function PurchaseOrderPanel({ orders }: PurchaseOrderPanelProps) {
  const { keyword, rows, setKeyword, status } = orders;
  const { inputProps } = useImeSafeSearchInput(keyword, setKeyword);
  const note = status === 'all' ? undefined : `Trạng thái: ${PURCHASE_STATUS_META[status].label}`;

  return (
    <SupplyPanel
      className={SUPPLY_SLOT_CLASSES.list}
      headerRight={
        <div className={SUPPLY_HEADER_FILTERS_CLASSES.scroll}>
          <Input
            {...inputProps}
            aria-label="Tìm đơn mua"
            clearable
            placeholder="Tìm PO, NCC…"
            size="sm"
            startIcon={<SystemIcon name="magnifying-glass-outline" size={16} />}
            wrapperClassName="w-44 shrink-0"
          />
        </div>
      }
      note={note}
      title="Danh sách"
    >
      {rows.length === 0 ? (
        <EmptyState
          action={
            <Button size="sm" variant="stroke" onClick={orders.resetFilters}>
              Xoá bộ lọc
            </Button>
          }
          className="min-h-0 flex-1"
          description="Thử bỏ bớt từ khoá hoặc chọn lại trạng thái."
          icon="file-lines-bold"
          iconColor="yellow"
          title="Không có đơn mua nào khớp bộ lọc"
        />
      ) : (
        <PurchaseOrderTable
          page={orders.page}
          pageRows={orders.pageRows}
          pageSize={orders.pageSize}
          rows={rows}
          onPageChange={orders.setPage}
          onPageSizeChange={orders.setPageSize}
        />
      )}
    </SupplyPanel>
  );
});

export default PurchaseOrderPanel;

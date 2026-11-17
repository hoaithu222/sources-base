import { useCallback, useMemo } from 'react';

import { PageBody, PageShell, showToast } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';
import { PageHeader, type PageHeaderFilterOption } from '@/shared/widgets/header';

import PurchaseKpiStrip from '../components/purchase/PurchaseKpiStrip';
import PurchaseMonthlyPanel from '../components/purchase/PurchaseMonthlyPanel';
import PurchaseOrderPanel from '../components/purchase/PurchaseOrderPanel';
import PurchaseSupplierPanel from '../components/purchase/PurchaseSupplierPanel';
import {
  PURCHASE_STATUS_META,
  PURCHASE_STATUS_STEPS,
} from '../constants/purchase-orders.constants';
import { usePurchaseOrders } from '../hooks/usePurchaseOrders';
import { SUPPLY_MAIN_GRID_CLASSES, SUPPLY_SIDE_ROWS_CLASSES } from '../supply.theme';

/**
 * PurchaseOrdersPage — màn "Đơn mua" (`/mua-hang/don-mua`) của phân hệ Mua hàng: hành động trang (xuất Excel · tạo
 * đơn mua — `PageHeader actions`) ở mép phải thanh; lọc trạng thái (kèm số đơn) trên CỘT LỌC DỌC mép phải; 4 KPI trọn bề
 * ngang; bảng đơn mua (ô tìm ở hàng tiêu đề); bên phải top 5 nhà cung cấp và giá trị đặt mua theo tháng. Dữ liệu mẫu tĩnh (`purchase-orders.constants.ts`).
 * Lưu ý: tên màn nằm trên thanh header (`PageHeader`) nên không có `TitleScreen`; từ `xl` trang vừa một màn hình.
 */
export default function PurchaseOrdersPage() {
  const orders = usePurchaseOrders();
  const statusOptions = useMemo<PageHeaderFilterOption[]>(
    () =>
      PURCHASE_STATUS_STEPS.map((step) => ({
        value: step,
        label: step === 'all' ? 'Tất cả trạng thái' : PURCHASE_STATUS_META[step].label,
        meta: `${orders.counts[step]} đơn`,
      })),
    [orders.counts],
  );

  const handleExport = useCallback(
    () => showToast('info', 'Đang dựng tệp Excel danh sách đơn mua…'),
    [],
  );
  const handleCreate = useCallback(() => showToast('info', 'Mở phiếu tạo đơn mua (bản demo)'), []);

  return (
    <PageShell>
      <PageHeader
        actions={[
          { key: 'export', label: 'Xuất Excel', icon: 'download-bold', onSelect: handleExport },
          {
            key: 'create',
            label: 'Tạo đơn mua',
            icon: 'plus-outline',
            primary: true,
            onSelect: handleCreate,
          },
        ]}
        filters={[
          {
            key: 'status',
            label: 'Trạng thái đơn',
            icon: 'clipboard-check-outline',
            value: statusOptions.find((option) => option.value === orders.status)?.label,
            active: orders.status !== 'all',
            options: statusOptions,
            selected: orders.status,
            onSelect: orders.setStatus,
          },
        ]}
        subtitle="Đơn đặt hàng · theo dõi giao nhận"
        title="Đơn mua"
        tone="orange"
      />

      <PageBody>
        <PurchaseKpiStrip summary={orders.summary} />

        <div className={cn(SUPPLY_MAIN_GRID_CLASSES, SUPPLY_SIDE_ROWS_CLASSES.even)}>
          <PurchaseOrderPanel orders={orders} />
          <PurchaseSupplierPanel rows={orders.allRows} />
          <PurchaseMonthlyPanel />
        </div>
      </PageBody>
    </PageShell>
  );
}

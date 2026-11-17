import { useCallback, useMemo } from 'react';

import { PageBody, PageShell, showToast } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';
import { PageHeader, type PageHeaderFilterOption } from '@/shared/widgets/header';

import StockGroupPanel from '../components/stock/StockGroupPanel';
import StockKpiStrip from '../components/stock/StockKpiStrip';
import StockLotPanel from '../components/stock/StockLotPanel';
import StockTopPanel from '../components/stock/StockTopPanel';
import { STOCK_LOTS, STOCK_WAREHOUSE_ORDER, STOCK_WAREHOUSES } from '../constants/stock.constants';
import { useStockLots } from '../hooks/useStockLots';
import { SUPPLY_MAIN_GRID_CLASSES, SUPPLY_SIDE_ROWS_CLASSES } from '../supply.theme';

const lotCountOf = (warehouse: string) =>
  warehouse === 'all'
    ? STOCK_LOTS.length
    : STOCK_LOTS.filter((lot) => lot.warehouse === warehouse).length;

/**
 * StockPage — màn "Tồn kho" (`/kho-van/ton-kho`) của phân hệ Kho vận: bộ chọn kho là icon trên CỘT LỌC DỌC mép phải
 * (phạm vi cả trang — đổi kho thì mọi khối tính lại; danh sách kèm số lô) + nút xuất Excel trên thanh; 4 KPI trọn bề ngang (giá trị tồn, số mã, dưới tối thiểu, sắp hết hạn);
 * bảng tồn theo lô có ô tìm + công tắc "chỉ hiện cảnh báo" trên hàng tiêu đề; bên phải cơ cấu tồn theo nhóm và top 5 mã
 * giá trị lớn. Dữ liệu mẫu tĩnh (`stock.constants.ts`).
 * Lưu ý: tên màn nằm trên thanh header (`PageHeader`) nên không có `TitleScreen`; từ `xl` trang vừa một màn hình.
 */
export default function StockPage() {
  const stock = useStockLots();

  const warehouseOptions = useMemo<PageHeaderFilterOption[]>(
    () =>
      STOCK_WAREHOUSE_ORDER.map((key) => ({
        value: key,
        label: key === 'all' ? 'Tất cả kho' : STOCK_WAREHOUSES[key].name,
        meta: `${lotCountOf(key)} lô`,
        icon: key === 'all' ? 'buildings-outline' : 'building-outline',
      })),
    [],
  );

  const handleExport = useCallback(() => showToast('info', 'Đang dựng tệp Excel tồn kho…'), []);

  return (
    <PageShell>
      <PageHeader
        actions={[
          { key: 'export', label: 'Xuất Excel', icon: 'download-bold', onSelect: handleExport },
        ]}
        filters={[
          {
            key: 'warehouse',
            label: 'Kho',
            icon: 'buildings-outline',
            value: warehouseOptions.find((option) => option.value === stock.warehouse)?.label,
            active: stock.warehouse !== 'all',
            options: warehouseOptions,
            selected: stock.warehouse,
            onSelect: stock.setWarehouse,
          },
        ]}
        subtitle="Tồn theo kho, lô, hạn dùng"
        title="Tồn kho"
        tone="yellow"
      />

      <PageBody>
        <StockKpiStrip summary={stock.summary} />

        <div className={cn(SUPPLY_MAIN_GRID_CLASSES, SUPPLY_SIDE_ROWS_CLASSES.fillFirst)}>
          <StockLotPanel stock={stock} />
          <StockGroupPanel slices={stock.groups} total={stock.summary.value} />
          <StockTopPanel items={stock.topItems} />
        </div>
      </PageBody>
    </PageShell>
  );
}

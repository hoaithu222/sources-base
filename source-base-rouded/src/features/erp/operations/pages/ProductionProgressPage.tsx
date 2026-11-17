import { PageBody, PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import ProductionKpiStrip from '../components/production/ProductionKpiStrip';
import ProductionOrderTable from '../components/production/ProductionOrderTable';
import ProductionOutputPanel from '../components/production/ProductionOutputPanel';
import WorkshopPerformancePanel from '../components/production/WorkshopPerformancePanel';
import { PRODUCTION_LAYOUT_CLASSES } from '../components/production/production.theme';
import { OPS_UPDATED_LABEL } from '../constants/operations.constants';
import { WORKSHOP_FILTER_OPTIONS } from '../constants/production.constants';
import { useProductionBoard } from '../hooks/useProductionBoard';

/**
 * ProductionProgressPage — màn `/san-xuat/tien-do` ("Tiến độ sản xuất"): bộ lọc xưởng (cắt uốn · lồng thép ·
 * hoàn thiện) là icon trên CỘT LỌC DỌC mép phải (điện thoại: nút phễu top bar), một hàng bốn KPI, bảng lệnh sản xuất có
 * dải Gantt 3 tuần mỗi dòng lấp phần chiều cao còn lại, hàng dưới là sản lượng theo ngày + hiệu suất từng xưởng.
 * Bộ lọc xưởng áp cho cả trang.
 * Lưu ý: số liệu mẫu tĩnh tính theo `OPS_TODAY` (không gọi API); từ laptop trang vừa một màn hình, bảng tự cuộn.
 */
export default function ProductionProgressPage() {
  const { workshop, selectWorkshop, orders, summary, output, workshops } = useProductionBoard();

  return (
    <PageShell>
      <PageHeader
        filters={[
          {
            key: 'workshop',
            label: 'Xưởng',
            icon: 'gear-outline',
            value: WORKSHOP_FILTER_OPTIONS.find((option) => option.value === workshop)?.label,
            active: workshop !== 'all',
            options: WORKSHOP_FILTER_OPTIONS,
            selected: workshop,
            onSelect: selectWorkshop,
          },
        ]}
        subtitle={OPS_UPDATED_LABEL}
        title="Tiến độ sản xuất"
        tone="indigo"
      />

      <PageBody>
        <ProductionKpiStrip summary={summary} />
        <ProductionOrderTable orders={orders} />
        <div className={PRODUCTION_LAYOUT_CLASSES.bottom}>
          <ProductionOutputPanel rows={output} />
          <WorkshopPerformancePanel active={workshop} workshops={workshops} />
        </div>
      </PageBody>
    </PageShell>
  );
}

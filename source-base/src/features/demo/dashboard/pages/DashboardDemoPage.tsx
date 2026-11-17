import { memo, useCallback, useState } from 'react';

import { Button, PageBody, PageShell, SegmentToggle, showToast } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { PageHeader } from '@/shared/widgets/header';

import KpiActionRow from '../../shared/components/KpiActionRow';
import DashboardClock from '../components/DashboardClock';
import DashboardKpiStrip from '../components/DashboardKpiStrip';
import DashboardContractorPanel from '../components/panels/DashboardContractorPanel';
import DashboardEquipmentPanel from '../components/panels/DashboardEquipmentPanel';
import DashboardAlertsPanel from '../components/panels/DashboardAlertsPanel';
import DashboardProgressPanel from '../components/panels/DashboardProgressPanel';
import DashboardStatusPanel from '../components/panels/DashboardStatusPanel';
import DashboardWorkPanel from '../components/panels/DashboardWorkPanel';
import { DASHBOARD_GRID_CLASSES } from '../dashboard.theme';
import { DEMO_PACKAGE_ROWS, DEMO_PROJECT_NAME } from '../../shared/constants/packages.constants';
import {
  DASHBOARD_DEFAULT_RANGE,
  DASHBOARD_RANGE_OPTIONS,
  type DashboardRange,
} from '../constants/metrics.constants';

/**
 * DashboardDemoPage — màn `/demo/tong-quan` ("Tổng quan dự án"): dashboard MỘT màn hình của dự án
 * (6 KPI + 3 biểu đồ + 3 bảng) dựng hoàn toàn bằng component của base, để soi lỗi chỉ lộ khi nhiều khối
 * chia chung chiều cao một viewport. Tên dự án + tên màn hình đã nằm trên thanh header nên KHÔNG có `TitleScreen`
 * (quy tắc `page-structure.md` §3b); đổi khoảng thời gian, làm mới và nhãn "Cập nhật lúc" ở CÙNG HÀNG với dải KPI, căn giữa (dưới `wide` nhãn giờ ẩn và nút làm mới chỉ còn icon để thẻ KPI không bị bóp).
 * Lưu ý: từ `xl` trở lên trang không cuộn (lưới chia đều chiều cao); dưới `xl` panel xếp cột và `PageBody` cuộn.
 */
const DashboardDemoPage = memo(function DashboardDemoPage() {
  const [range, setRange] = useState<DashboardRange>(DASHBOARD_DEFAULT_RANGE);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRange = useCallback((key: string) => setRange(key as DashboardRange), []);
  const handleRefresh = useCallback(() => {
    setRefreshKey((key) => key + 1);
    showToast('success', 'Đã làm mới số liệu dự án');
  }, []);

  return (
    <PageShell>
      <PageHeader subtitle="Tổng quan dự án" title={DEMO_PROJECT_NAME} tone="sky" />

      <PageBody className="relative">
        <KpiActionRow
          actions={
            <>
              <DashboardClock />
              <SegmentToggle
                options={DASHBOARD_RANGE_OPTIONS}
                size="sm"
                value={range}
                onValueChange={handleRange}
              />
              <Button
                aria-label="Làm mới số liệu"
                size="sm"
                skin="neutral"
                startIcon={<SystemIcon name="arrows-rotate-outline" size={14} />}
                variant="stroke"
                onClick={handleRefresh}
              >
                <span className="max-wide:sr-only">Làm mới</span>
              </Button>
            </>
          }
          kpis={<DashboardKpiStrip key={refreshKey} rows={DEMO_PACKAGE_ROWS} />}
        />

        <div key={refreshKey} className={DASHBOARD_GRID_CLASSES}>
          <DashboardProgressPanel range={range} />
          <DashboardWorkPanel />
          <DashboardStatusPanel rows={DEMO_PACKAGE_ROWS} />
          <DashboardContractorPanel rows={DEMO_PACKAGE_ROWS} />
          <DashboardEquipmentPanel />
          <DashboardAlertsPanel />
        </div>
      </PageBody>
    </PageShell>
  );
});

export default DashboardDemoPage;

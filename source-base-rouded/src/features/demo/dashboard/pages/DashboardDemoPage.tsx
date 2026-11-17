import { memo, useCallback, useState } from 'react';

import { PageBody, PageShell, showToast } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

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

/** Khoảng thời gian của đường S — bộ lọc dạng danh sách trên cột lọc dọc mép phải. */
const RANGE_FILTER_OPTIONS = DASHBOARD_RANGE_OPTIONS.map(({ key, label }) => ({
  value: key,
  label,
  description: `Đường S lũy kế theo ${label.toLowerCase()}`,
}));

/**
 * DashboardDemoPage — màn `/demo/tong-quan` ("Tổng quan dự án"): dashboard MỘT màn hình của dự án
 * (6 KPI + 3 biểu đồ + 3 bảng) dựng hoàn toàn bằng component của base, để soi lỗi chỉ lộ khi nhiều khối
 * chia chung chiều cao một viewport. Tên dự án + tên màn hình đã nằm trên thanh header nên KHÔNG có `TitleScreen`
 * (quy tắc `page-structure.md` §3b). Khoảng thời gian là icon trên CỘT LỌC DỌC mép phải (`PageHeader filters`), nút làm
 * mới (giờ cập nhật trong tooltip) ở mép phải thanh header — dải KPI dùng trọn bề ngang, 6 thẻ chia đều.
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
      <PageHeader
        actions={[
          {
            key: 'refresh',
            label: 'Làm mới số liệu',
            icon: 'arrows-rotate-outline',
            hint: <DashboardClock />,
            onSelect: handleRefresh,
          },
        ]}
        filters={[
          {
            key: 'range',
            label: 'Khoảng thời gian',
            icon: 'calendar-outline',
            value: RANGE_FILTER_OPTIONS.find((option) => option.value === range)?.label,
            active: range !== DASHBOARD_DEFAULT_RANGE,
            options: RANGE_FILTER_OPTIONS,
            selected: range,
            onSelect: handleRange,
          },
        ]}
        subtitle="Tổng quan dự án"
        title={DEMO_PROJECT_NAME}
        tone="sky"
      />

      <PageBody className="relative">
        <DashboardKpiStrip key={`kpi-${refreshKey}`} rows={DEMO_PACKAGE_ROWS} />

        <div key={`grid-${refreshKey}`} className={DASHBOARD_GRID_CLASSES}>
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

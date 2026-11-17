import { memo, useMemo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { DASHBOARD_KPI } from '../constants/metrics.constants';
import type { DemoPackageRow } from '../../shared/constants/packages.constants';
import { formatMoneyKpi, summarizePackages } from '../utils/packages.utils';
import { DASHBOARD_KPI_STRIP_CLASSES } from '../dashboard.theme';

interface DashboardKpiStripProps {
  rows: readonly DemoPackageRow[];
}

const formatPeople = (n: number) => `${formatNumber(n)} người`;
const formatDays = (n: number) => `${formatNumber(n)} ngày`;

/**
 * DashboardKpiStrip — dải sáu thẻ KPI của màn tổng quan — số tiền / số gói dẫn xuất từ danh sách gói thầu, còn lại lấy ở
 * `DASHBOARD_KPI`. Truyền SỐ THẬT + `valueFormat` (đơn vị nằm trong chuỗi) để thẻ đếm lên được. Dòng phụ chỉ
 * mang số KHÔNG có ở panel bên dưới (chênh kế hoạch nằm ở panel đường S, cơ cấu trạng thái ở panel donut), viết
 * NGẮN và SỐ ĐỨNG ĐẦU: thẻ chỉ ~190px ở màn 1440px, dòng có bị cắt `…` thì con số vẫn còn.
 *
 * @param props.rows - Danh sách gói thầu của dự án (`DEMO_PACKAGE_ROWS`).
 */
const DashboardKpiStrip = memo(function DashboardKpiStrip({ rows }: DashboardKpiStripProps) {
  const { count, totalValue } = useMemo(() => summarizePackages(rows), [rows]);

  const disbursedPct =
    totalValue > 0 ? Math.round((DASHBOARD_KPI.disbursed / totalValue) * 100) : 0;
  const remaining = Math.max(0, totalValue - DASHBOARD_KPI.disbursed);
  const averageValue = count > 0 ? totalValue / count : 0;

  return (
    <section aria-label="Chỉ số chính của dự án" className={DASHBOARD_KPI_STRIP_CLASSES}>
      <SummaryCard
        color="blue"
        description={`${formatMoneyKpi(remaining)} chưa giải ngân`}
        gemSize="xs"
        icon="buildings-bold"
        label="Tổng mức đầu tư"
        value={totalValue}
        valueFormat={formatMoneyKpi}
      />
      <SummaryCard
        color="green"
        description={`${disbursedPct}% tổng mức`}
        gemSize="xs"
        icon="wallet-bold"
        label="Đã giải ngân"
        value={DASHBOARD_KPI.disbursed}
        valueFormat={formatMoneyKpi}
      />
      <SummaryCard
        color="yellow"
        description={`Kế hoạch ${formatPercent(DASHBOARD_KPI.planProgress)}`}
        gemSize="xs"
        icon="chart-line-bold"
        label="Tiến độ tổng thể"
        value={DASHBOARD_KPI.progress}
        valueFormat={formatPercent}
      />
      <SummaryCard
        color="blue"
        description={`${formatMoneyKpi(averageValue)} / gói`}
        gemSize="xs"
        icon="cube-bold"
        label="Gói thầu"
        value={count}
      />
      <SummaryCard
        color="gray"
        description={`+${DASHBOARD_KPI.workforceDelta} so với hôm qua`}
        gemSize="xs"
        icon="users-group-bold"
        label="Nhân lực công trường"
        value={DASHBOARD_KPI.workforce}
        valueFormat={formatPeople}
      />
      <SummaryCard
        color="green"
        description="Không có tai nạn"
        gemSize="xs"
        icon="shield-check-bold"
        label="An toàn"
        value={DASHBOARD_KPI.safeDays}
        valueFormat={formatDays}
      />
    </section>
  );
});

export default DashboardKpiStrip;

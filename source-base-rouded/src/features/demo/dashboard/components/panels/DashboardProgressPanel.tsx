import { memo } from 'react';

import { Badge } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import {
  DASHBOARD_KPI,
  DASHBOARD_RANGE_OPTIONS,
  DASHBOARD_S_CURVE,
  type DashboardRange,
} from '../../constants/metrics.constants';
import SCurveChart from '../../../shared/charts/SCurveChart';
import DashboardPanel from '../DashboardPanel';

interface DashboardProgressPanelProps {
  range: DashboardRange;
}

const LAG = formatNumber(DASHBOARD_KPI.planProgress - DASHBOARD_KPI.progress, 1);

/**
 * DashboardProgressPanel — panel PRIMARY của màn: đường S lũy kế. `range` do nút Tuần / Tháng / Quý ở
 * `TitleScreen` chọn; panel chỉ tra lát cắt tương ứng, và đưa chênh lệch kế hoạch ↔ thực tế lên tiêu đề để đọc được mà không cần rê chuột.
 *
 * @param props.range - Lát cắt thời gian đang chọn: `week` | `month` | `quarter`.
 */
const DashboardProgressPanel = memo(function DashboardProgressPanel({
  range,
}: DashboardProgressPanelProps) {
  const curve = DASHBOARD_S_CURVE[range];
  const rangeLabel = DASHBOARD_RANGE_OPTIONS.find((option) => option.key === range)?.label ?? '';
  const ariaLabel = `Đường S lũy kế theo ${rangeLabel.toLowerCase()}: thực tế ${formatPercent(DASHBOARD_KPI.progress)} so với kế hoạch ${formatPercent(DASHBOARD_KPI.planProgress)} tại mốc ${curve.nowLabel}, chậm ${LAG} điểm phần trăm.`;

  return (
    <DashboardPanel
      accent
      bodyClassName="p-2"
      headerRight={
        <Badge color="warning" size="sm" variant="tinted">
          {`Chậm ${LAG} điểm %`}
        </Badge>
      }
      slot="progress"
      title="Đường S tiến độ lũy kế"
    >
      <SCurveChart
        ariaLabel={ariaLabel}
        className="min-h-0 flex-1"
        nowLabel={curve.nowLabel}
        points={curve.points}
      />
    </DashboardPanel>
  );
});

export default DashboardProgressPanel;

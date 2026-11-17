import { memo } from 'react';

import { Text } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import WorkVolumeChart from '../../../shared/charts/WorkVolumeChart';
import { DASHBOARD_WORK_VOLUME } from '../../constants/metrics.constants';
import DashboardPanel from '../DashboardPanel';

const TOTAL_TASKS = DASHBOARD_WORK_VOLUME.reduce((sum, point) => sum + point.__total, 0);

const ARIA_LABEL = `Khối lượng theo hạng mục, số đầu việc hoàn thành / đang làm / chậm: ${DASHBOARD_WORK_VOLUME.map(
  (p) => `${p.name} ${p.done} / ${p.doing} / ${p.late}`,
).join('; ')}.`;

/**
 * DashboardWorkPanel — panel "Khối lượng theo hạng mục": cột chồng hoàn thành / đang làm / chậm, kèm nhãn
 * tổng trên mỗi cột và tổng đầu việc ở header.
 */
const DashboardWorkPanel = memo(function DashboardWorkPanel() {
  return (
    <DashboardPanel
      bodyClassName="p-2"
      headerRight={
        <Text className="tabular-nums" size="tiny" skin="muted">
          {`${formatNumber(TOTAL_TASKS)} đầu việc`}
        </Text>
      }
      slot="work"
      title="Khối lượng theo hạng mục"
    >
      <WorkVolumeChart
        ariaLabel={ARIA_LABEL}
        className="min-h-0 flex-1"
        data={DASHBOARD_WORK_VOLUME}
      />
    </DashboardPanel>
  );
});

export default DashboardWorkPanel;

import { memo } from 'react';

import { useElementSize } from '@/shared/hooks';
import { Badge, ScrollBoard, Text } from '@/shared/ui';
import type { ScrollBoardColumn } from '@/shared/ui';

import {
  DASHBOARD_ALERT_META,
  DASHBOARD_ALERTS,
  type DashboardAlert,
} from '../../constants/operations.constants';
import DashboardPanel from '../DashboardPanel';

const ROW_HEIGHT = 32;
const MIN_ROWS = 2;

const CRITICAL_COUNT = DASHBOARD_ALERTS.filter((alert) => alert.severity === 'critical').length;

const COLUMNS: ScrollBoardColumn<DashboardAlert>[] = [
  {
    key: 'time',
    header: 'Giờ',
    width: 48,
    cell: (alert) => <span className="tabular-nums">{alert.time}</span>,
  },
  {
    key: 'severity',
    header: 'Mức',
    width: 84,
    cell: (alert) => (
      <Badge color={DASHBOARD_ALERT_META[alert.severity].color} size="sm" variant="tinted">
        {DASHBOARD_ALERT_META[alert.severity].label}
      </Badge>
    ),
  },
  { key: 'message', header: 'Nội dung', cell: (alert) => alert.message },
  {
    key: 'package',
    header: 'Gói',
    width: 52,
    align: 'right',
    cell: (alert) => alert.packageCode ?? '—',
  },
];

const rowKey = (alert: DashboardAlert) => alert.id;

/**
 * DashboardAlertsPanel — panel "Cảnh báo & nhật ký thi công": `ScrollBoard` tự cuộn. Bảng này cao
 * `(rowCount + 1) × rowHeight` cố định nên panel ĐO khung chứa rồi tính số dòng vừa khung — màn cao hiện
 * nhiều dòng (đứng yên nếu đủ), màn thấp thì tự cuộn.
 */
const DashboardAlertsPanel = memo(function DashboardAlertsPanel() {
  const [boxRef, size] = useElementSize<HTMLDivElement>();
  const rowCount = Math.max(MIN_ROWS, Math.floor(size.height / ROW_HEIGHT) - 1);

  return (
    <DashboardPanel
      headerRight={
        <>
          <Badge color="error" size="sm" variant="tinted">{`${CRITICAL_COUNT} khẩn`}</Badge>
          <Text className="tabular-nums" size="tiny" skin="muted">
            {`${DASHBOARD_ALERTS.length} tin hôm nay`}
          </Text>
        </>
      }
      slot="alerts"
      title="Cảnh báo & nhật ký thi công"
    >
      <div ref={boxRef} className="min-h-0 flex-1 overflow-hidden">
        <ScrollBoard
          className="border-0"
          columns={COLUMNS}
          data={DASHBOARD_ALERTS}
          rowCount={rowCount}
          rowHeight={ROW_HEIGHT}
          rowKey={rowKey}
        />
      </div>
    </DashboardPanel>
  );
});

export default DashboardAlertsPanel;

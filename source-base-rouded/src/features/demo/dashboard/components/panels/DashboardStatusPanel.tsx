import { memo, useMemo } from 'react';

import { Badge, Text } from '@/shared/ui';

import {
  PACKAGE_STATUS_META,
  type DemoPackageRow,
} from '../../../shared/constants/packages.constants';
import { DASHBOARD_STATUS_ORDER, DASHBOARD_STATUS_TOKENS } from '../../constants/metrics.constants';
import { summarizePackages } from '../../utils/packages.utils';
import DashboardStatusDonut, { type DashboardDonutSlice } from '../DashboardStatusDonut';
import DashboardPanel from '../DashboardPanel';

interface DashboardStatusPanelProps {
  rows: readonly DemoPackageRow[];
}

const shareOf = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0;

/**
 * DashboardStatusPanel — cơ cấu gói thầu theo trạng thái: donut + chú giải có số đếm và tỉ lệ. Nhãn và màu
 * badge lấy từ `PACKAGE_STATUS_META` (dùng chung với `/demo/ghep`) nên hai màn nói cùng một ngôn ngữ trạng
 * thái. Tổng chỉ in ở tâm donut, không lặp ở tiêu đề.
 *
 * @param props.rows - Danh sách gói thầu của dự án.
 */
const DashboardStatusPanel = memo(function DashboardStatusPanel({
  rows,
}: DashboardStatusPanelProps) {
  const { count, byStatus } = useMemo(() => summarizePackages(rows), [rows]);

  const slices = useMemo<DashboardDonutSlice[]>(
    () =>
      DASHBOARD_STATUS_ORDER.map((status) => ({
        key: status,
        name: PACKAGE_STATUS_META[status].label,
        value: byStatus[status],
        token: DASHBOARD_STATUS_TOKENS[status],
      })),
    [byStatus],
  );

  const ariaLabel = `Cơ cấu gói thầu theo trạng thái, tổng ${count} gói: ${slices
    .map((s) => `${s.name} ${s.value}`)
    .join(', ')}.`;

  return (
    <DashboardPanel
      bodyClassName="flex-row items-center gap-3 p-2"
      slot="status"
      title="Cơ cấu gói thầu theo trạng thái"
    >
      <DashboardStatusDonut
        ariaLabel={ariaLabel}
        centerCaption="gói thầu"
        centerValue={String(count)}
        className="aspect-square h-full max-w-1/2 shrink-0"
        slices={slices}
      />

      <ul className="@container flex min-w-0 flex-1 flex-col gap-1.5">
        {DASHBOARD_STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center justify-between gap-2">
            <Badge
              className="min-w-0"
              color={PACKAGE_STATUS_META[status].color}
              dot
              size="sm"
              variant="tinted"
            >
              <span className="min-w-0 truncate">{PACKAGE_STATUS_META[status].label}</span>
            </Badge>
            <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
              <Text size="small" weight="medium">
                {byStatus[status]}
              </Text>
              <Text className="w-9 text-right @max-[11rem]:hidden" size="tiny" skin="muted">
                {`${shareOf(byStatus[status], count)}%`}
              </Text>
            </span>
          </li>
        ))}
      </ul>
    </DashboardPanel>
  );
});

export default DashboardStatusPanel;

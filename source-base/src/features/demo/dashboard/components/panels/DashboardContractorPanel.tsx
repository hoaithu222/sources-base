import { memo, useMemo } from 'react';

import { RankingBoard, Text } from '@/shared/ui';
import { formatPercent } from '@/shared/utils/format/format.utils';

import type { DemoPackageRow } from '../../../shared/constants/packages.constants';
import { rankContractors } from '../../utils/packages.utils';
import DashboardPanel from '../DashboardPanel';

interface DashboardContractorPanelProps {
  rows: readonly DemoPackageRow[];
}

const formatProgress = (n: number) => formatPercent(n, 0);

/**
 * DashboardContractorPanel — xếp hạng nhà thầu theo tiến độ bình quân gia quyền, dẫn xuất từ danh sách
 * gói thầu (`rankContractors`). Thân có `overflow-auto`: màn thấp hoặc TV ×1.3 thì danh sách cuộn trong panel chứ không tràn ra ngoài.
 *
 * @param props.rows - Danh sách gói thầu của dự án.
 */
const DashboardContractorPanel = memo(function DashboardContractorPanel({
  rows,
}: DashboardContractorPanelProps) {
  const ranking = useMemo(() => rankContractors(rows), [rows]);

  return (
    <DashboardPanel
      bodyClassName="p-2"
      bodyOverflow="scroll"
      headerRight={
        <Text
          className="tabular-nums"
          size="tiny"
          skin="muted"
        >{`${ranking.length} nhà thầu`}</Text>
      }
      slot="contractor"
      title="Xếp hạng nhà thầu theo tiến độ"
    >
      <RankingBoard
        className="min-h-full justify-between"
        items={ranking}
        valueFormat={formatProgress}
      />
    </DashboardPanel>
  );
});

export default DashboardContractorPanel;

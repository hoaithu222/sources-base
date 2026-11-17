import { memo, useCallback, useState } from 'react';

import { PanelCard, SegmentToggle } from '@/shared/ui';

import BarCompareChart from '../../shared/charts/BarCompareChart';
import {
  FACTORY_PLAN_CUMULATIVE_ROWS,
  FACTORY_PLAN_MODES,
  FACTORY_PLAN_ROWS,
  FACTORY_PLAN_SERIES,
  type FactoryPlanMode,
} from '../constants/factory-metrics.constants';
import { FACTORY_PANEL_SLOT_CLASSES } from '../factory.theme';

/**
 * FactoryPlanPanel — panel "Kế hoạch & thực hiện": cột nhóm kế hoạch ↔ thực hiện 12 tháng, nút chuyển Theo tháng /
 * Lũy kế ngay trên header của panel (bộ lọc của MỘT box nằm ở header box đó).
 */
const FactoryPlanPanel = memo(function FactoryPlanPanel() {
  const [mode, setMode] = useState<FactoryPlanMode>('month');
  const handleMode = useCallback((key: string) => setMode(key as FactoryPlanMode), []);
  const rows = mode === 'month' ? FACTORY_PLAN_ROWS : FACTORY_PLAN_CUMULATIVE_ROWS;

  return (
    <PanelCard
      bodyClassName="flex flex-col"
      className={FACTORY_PANEL_SLOT_CLASSES.plan}
      frameWeight="hairline"
      right={
        <SegmentToggle
          options={[...FACTORY_PLAN_MODES]}
          size="sm"
          value={mode}
          variant="tab-hud"
          onValueChange={handleMode}
        />
      }
      title="Kế hoạch & thực hiện"
      tone="sky"
    >
      <BarCompareChart
        ariaLabel={`Khối lượng kế hoạch và thực hiện ${mode === 'month' ? 'theo tháng' : 'lũy kế'}, tấn`}
        className="min-h-0 flex-1"
        rows={rows}
        series={FACTORY_PLAN_SERIES}
        unit="t"
      />
    </PanelCard>
  );
});

export default FactoryPlanPanel;

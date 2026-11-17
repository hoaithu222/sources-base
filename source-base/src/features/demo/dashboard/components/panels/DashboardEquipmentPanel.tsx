import { memo } from 'react';

import { tokenVar } from '@/shared/charts';
import { Badge, StackBar, Text } from '@/shared/ui';

import {
  DASHBOARD_EQUIPMENT,
  DASHBOARD_EQUIPMENT_TOKENS,
  type DashboardEquipmentRow,
} from '../../constants/operations.constants';
import DashboardPanel from '../DashboardPanel';

interface EquipmentRowProps {
  row: DashboardEquipmentRow;
}

const unitsOf = (row: DashboardEquipmentRow) => row.running + row.idle + row.maintenance;

const TOTAL_RUNNING = DASHBOARD_EQUIPMENT.reduce((sum, row) => sum + row.running, 0);
const TOTAL_UNITS = DASHBOARD_EQUIPMENT.reduce((sum, row) => sum + unitsOf(row), 0);
const MAX_UNITS = Math.max(...DASHBOARD_EQUIPMENT.map(unitsOf));

/** EquipmentRow — một loại máy: tên, số đếm chạy / nghỉ / bảo trì và thanh chồng. */
const EquipmentRow = memo(function EquipmentRow({ row }: EquipmentRowProps) {
  const label = `${row.name}: ${row.running} đang chạy, ${row.idle} nghỉ, ${row.maintenance} bảo trì`;

  return (
    <li className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <Text className="truncate" size="tiny" weight="medium">
          {row.name}
        </Text>
        <span className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
          <Text size="tiny" skin="success" weight="medium">{`${row.running} chạy`}</Text>
          <Text size="tiny" skin="warning" weight="medium">{`${row.idle} nghỉ`}</Text>
          <Text size="tiny" skin="error" weight="medium">{`${row.maintenance} bảo trì`}</Text>
        </span>
      </div>
      <StackBar
        ariaLabel={label}
        height={8}
        max={MAX_UNITS}
        segments={[
          { value: row.running, color: tokenVar(DASHBOARD_EQUIPMENT_TOKENS.running) },
          { value: row.idle, color: tokenVar(DASHBOARD_EQUIPMENT_TOKENS.idle) },
          { value: row.maintenance, color: tokenVar(DASHBOARD_EQUIPMENT_TOKENS.maintenance) },
        ]}
      />
    </li>
  );
});

/**
 * DashboardEquipmentPanel — panel "Thiết bị thi công": mỗi loại máy một thanh chồng chạy / nghỉ / bảo trì
 * (`StackBar`, bề ngang = tổng số máy của loại đó). Số đếm in bằng chữ ("9 chạy") chứ không chỉ bằng màu — người mù màu vẫn đọc được.
 */
const DashboardEquipmentPanel = memo(function DashboardEquipmentPanel() {
  return (
    <DashboardPanel
      bodyClassName="p-2"
      bodyOverflow="scroll"
      headerRight={
        <Badge color="success" size="sm" variant="tinted">
          {`${TOTAL_RUNNING}/${TOTAL_UNITS} đang chạy`}
        </Badge>
      }
      slot="equipment"
      title="Thiết bị thi công"
    >
      <ul className="flex min-h-full flex-col justify-between gap-2">
        {DASHBOARD_EQUIPMENT.map((row) => (
          <EquipmentRow key={row.id} row={row} />
        ))}
      </ul>
    </DashboardPanel>
  );
});

export default DashboardEquipmentPanel;

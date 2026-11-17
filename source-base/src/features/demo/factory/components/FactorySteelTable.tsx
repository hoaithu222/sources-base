import { memo, useCallback, useMemo } from 'react';

import { Progress, Table } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import { FACTORY_STEEL_ROWS, type FactorySteelRow } from '../constants/factory-metrics.constants';

const percentOfRow = (row: FactorySteelRow) => (row.plan > 0 ? (row.done / row.plan) * 100 : 0);

/**
 * FactorySteelTable — bảng "Tiến độ theo loại thép": mã · loại · thanh tiến độ + % · thực hiện / kế hoạch · còn lại.
 * Số canh phải `tabular-nums`; tiến độ thấp vẫn thấy được nhờ con số cạnh thanh.
 */
const FactorySteelTable = memo(function FactorySteelTable() {
  const columns = useMemo<TableColumn<FactorySteelRow>[]>(
    () => [
      { key: 'code', header: 'Mã', width: 64 },
      { key: 'name', header: 'Loại thép', width: 110 },
      {
        key: 'progress',
        header: 'Tiến độ',
        width: 200,
        cell: (row) => (
          <div className="flex items-center gap-2">
            <Progress className="flex-1" value={percentOfRow(row)} />
            <span className="w-12 shrink-0 text-right tabular-nums text-caption-12 text-fg-subheading">
              {formatPercent(percentOfRow(row), 2)}
            </span>
          </div>
        ),
      },
      {
        key: 'ratio',
        header: 'Thực hiện / Kế hoạch',
        align: 'right',
        width: 150,
        cell: (row) => (
          <span className="tabular-nums text-fg-heading">
            {`${formatNumber(row.done, 2)} / ${formatNumber(row.plan, 2)} t`}
          </span>
        ),
      },
      {
        key: 'remain',
        header: 'Còn lại',
        align: 'right',
        width: 96,
        cell: (row) => (
          <span className="tabular-nums text-fg-heading">{`${formatNumber(row.plan - row.done, 2)} t`}</span>
        ),
      },
    ],
    [],
  );

  const rowKey = useCallback((row: FactorySteelRow) => row.id, []);

  return (
    <Table
      columns={columns}
      data={[...FACTORY_STEEL_ROWS]}
      fill
      pagination={false}
      rowKey={rowKey}
    />
  );
});

export default FactorySteelTable;

import { memo, useCallback, useMemo, useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';

import { Badge, Table, TableDragHandle, Text } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_BUDGET_ROWS,
  DEMO_RANK_ROWS,
  type DemoBudgetRow,
  type DemoRankRow,
} from '../../constants/data-display/tables.constants';

const HEADER_SIZES = ['sm', 'md', 'lg', 'xl'] as const;

/**
 * TableSection — mục "Bảng nâng cao" của trang `/demo`: `Table` với header 2 tầng, tổng dính đáy, kéo-thả, `fullRowCell`.
 */
const TableSection = memo(function TableSection() {
  const budgetColumns = useMemo<TableColumn<DemoBudgetRow>[]>(
    () => [
      { key: 'contractor', header: 'Nhà thầu', width: 120, frozen: true },
      {
        key: 'planned07',
        header: 'KH',
        align: 'right',
        group: { key: 't07', label: 'Tháng 07' },
        cell: (row) => <span className="tabular-nums">{row.planned07}</span>,
      },
      {
        key: 'actual07',
        header: 'TT',
        align: 'right',
        group: { key: 't07', label: 'Tháng 07' },
        cell: (row) => <span className="tabular-nums text-fg-heading">{row.actual07}</span>,
      },
      {
        key: 'planned08',
        header: 'KH',
        align: 'right',
        group: { key: 't08', label: 'Tháng 08' },
        cell: (row) => <span className="tabular-nums">{row.planned08}</span>,
      },
      {
        key: 'actual08',
        header: 'TT',
        align: 'right',
        group: { key: 't08', label: 'Tháng 08' },
        cell: (row) => <span className="tabular-nums text-fg-heading">{row.actual08}</span>,
      },
    ],
    [],
  );
  const budgetRowKey = useCallback((row: DemoBudgetRow) => row.id, []);
  const budgetFooterCell = useCallback((column: TableColumn<DemoBudgetRow>) => {
    if (column.key === 'contractor') {
      return <span className="text-caption-12-medium text-fg-heading">Tổng</span>;
    }
    const key = column.key as keyof DemoBudgetRow;
    const sum = DEMO_BUDGET_ROWS.reduce((acc, row) => acc + Number(row[key] ?? 0), 0);
    return <span className="tabular-nums text-fg-heading">{sum}</span>;
  }, []);

  const rankColumns = useMemo<TableColumn<DemoRankRow>[]>(
    () => [{ key: 'label', header: 'Hạng mục' }],
    [],
  );
  const rankRowKey = useCallback((row: DemoRankRow) => row.id, []);

  const [order, setOrder] = useState<DemoRankRow[]>(DEMO_RANK_ROWS);
  const dragColumns = useMemo<TableColumn<DemoRankRow>[]>(
    () => [
      { key: 'drag', header: '', width: 40, align: 'center', cell: () => <TableDragHandle /> },
      ...rankColumns,
    ],
    [rankColumns],
  );
  const handleReorder = useCallback((activeKey: UniqueIdentifier, overKey: UniqueIdentifier) => {
    setOrder((prev) => {
      const from = prev.findIndex((r) => r.id === String(activeKey));
      const to = prev.findIndex((r) => r.id === String(overKey));
      if (from === -1 || to === -1) return prev;
      const next = prev.slice();
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const [dblClicked, setDblClicked] = useState<string | null>(null);
  const handleRowDoubleClick = useCallback((row: DemoRankRow) => setDblClicked(row.label), []);
  const fullRowCell = useCallback(
    (_row: DemoRankRow, index: number) =>
      index === 2 ? (
        <div className="text-center text-caption-12-medium text-fg-muted">— Mốc nghiệm thu —</div>
      ) : null,
    [],
  );

  return (
    <DemoSection
      description="Ma trận nâng cao của Table: cột ghim + nhóm 2 tầng + tổng dính đáy · kéo-thả · headerSize · fullRowCell."
      importPath="@/shared/ui"
      title="Bảng nâng cao"
    >
      <DemoRow
        label="Table · frozen + group (header 2 tầng) + footerCell + columnDividers + gridBorder"
        note="cột Nhà thầu ghim trái; KH/TT gộp dưới 1 ô tháng; dòng Tổng dính đáy vùng cuộn"
        stacked
      >
        <Table
          columnDividers
          columns={budgetColumns}
          data={DEMO_BUDGET_ROWS}
          footerCell={budgetFooterCell}
          gridBorder
          pagination={false}
          rowKey={budgetRowKey}
        />
      </DemoRow>

      <DemoRow
        label="Table · sortable + TableDragHandle + onReorder"
        note="tay cầm kéo CHỈ hoạt động trong cell của bảng đang bật sortable"
        stacked
      >
        <Table
          columns={dragColumns}
          data={order}
          pagination={false}
          rowKey={rankRowKey}
          sortable
          onReorder={handleReorder}
        />
      </DemoRow>

      <DemoRow label="Table · headerSize" stacked>
        <div className="flex flex-wrap items-start gap-3">
          {HEADER_SIZES.map((size) => (
            <div key={size} className="flex flex-col gap-1">
              <Text className="font-mono" size="extraTiny" skin="muted">
                headerSize=&quot;{size}&quot;
              </Text>
              <div className="w-40">
                <Table
                  columns={rankColumns}
                  data={DEMO_RANK_ROWS}
                  headerSize={size}
                  pagination={false}
                  rowKey={rankRowKey}
                />
              </div>
            </div>
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="Table · onRowDoubleClick + fullRowCell"
        note="fullRowCell trả node → dòng đó trải hết chiều ngang (dòng phân cách, dòng nhóm…)"
        stacked
      >
        <Table
          columns={rankColumns}
          data={DEMO_RANK_ROWS}
          fullRowCell={fullRowCell}
          pagination={false}
          rowKey={rankRowKey}
          onRowDoubleClick={handleRowDoubleClick}
        />
        {dblClicked && (
          <Badge color="info" variant="tinted">
            Đã bấm đúp: {dblClicked}
          </Badge>
        )}
      </DemoRow>
    </DemoSection>
  );
});

export default TableSection;

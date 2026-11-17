import { memo, useCallback, useMemo, useState } from 'react';

import { Badge, Progress, Table, Text, Toggle, useTableSort } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_STATUS_META,
  DEMO_TABLE_FRAME_CLASSES,
  DEMO_TASK_ROWS,
  type DemoTaskRow,
} from '../../constants/data-display/tables.constants';

const getSortValue = (row: DemoTaskRow, key: string) => row[key as keyof DemoTaskRow];

/** Dòng đang chọn: nền ĐẶC (ô ghim `bg-inherit`) + vạch trái 2px; hover giữ nguyên độ đậm. */
const ROW_SELECTED_CLASSES = cn(
  'bg-[color-mix(in_srgb,var(--color-primary-5)_14%,var(--color-bg-surface))]',
  'hover:bg-[color-mix(in_srgb,var(--color-primary-5)_14%,var(--color-bg-surface))]',
  '[&>td:first-child]:inset-shadow-[2px_0_0_var(--color-primary-5)]',
);

/** Dòng chậm tiến độ: nền đỏ ĐẶC; tự khai `hover:` để hover xanh mặc định của dòng không đè mất màu. */
const ROW_LATE_CLASSES = cn(
  'bg-[color-mix(in_srgb,var(--color-error)_6%,var(--color-bg-surface))]',
  'hover:bg-[color-mix(in_srgb,var(--color-error)_10%,var(--color-bg-surface))]',
);

const BUDGET_TOTAL = DEMO_TASK_ROWS.reduce((sum, row) => sum + row.budget, 0);

/**
 * DataDisplaySection — mục "Bảng & cây" của trang `/demo`: `Table` cơ bản (ghim cột, sắp
 * xếp bằng `useTableSort`, chọn dòng, dòng tổng, phân trang, rỗng / đang tải).
 */
const DataDisplaySection = memo(function DataDisplaySection() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [striped, setStriped] = useState(true);

  const columns = useMemo<TableColumn<DemoTaskRow>[]>(
    () => [
      { key: 'code', header: 'Mã', width: 96, frozen: true, sortable: true },
      { key: 'name', header: 'Hạng mục', sortable: true },
      { key: 'owner', header: 'Phụ trách', width: 160 },
      {
        key: 'progress',
        header: 'Tiến độ',
        width: 150,
        cell: (row) => <Progress showValue size="sm" value={row.progress} />,
      },
      {
        key: 'budget',
        header: 'Ngân sách',
        width: 150,
        align: 'right',
        sortable: true,
        cell: (row) => <span className="tabular-nums">{formatNumber(row.budget)}</span>,
      },
      {
        key: 'status',
        header: 'Trạng thái',
        width: 130,
        align: 'center',
        cell: (row) => {
          const meta = DEMO_STATUS_META[row.status];
          return (
            <Badge color={meta.color} variant="tinted">
              {meta.label}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  const rowKey = useCallback((row: DemoTaskRow) => row.id, []);
  const rowClassName = useCallback(
    (row: DemoTaskRow) => {
      if (row.id === selectedId) return ROW_SELECTED_CLASSES;
      return row.status === 'late' ? ROW_LATE_CLASSES : undefined;
    },
    [selectedId],
  );
  const handleRowClick = useCallback(
    (row: DemoTaskRow) => setSelectedId((prev) => (prev === row.id ? null : row.id)),
    [],
  );
  const footerCell = useCallback((column: TableColumn<DemoTaskRow>) => {
    if (column.key === 'code') return `${DEMO_TASK_ROWS.length} mục`;
    if (column.key === 'budget') return formatNumber(BUDGET_TOTAL);
    return null;
  }, []);
  const { sortKey, sortDir, onSortChange, sorted } = useTableSort(DEMO_TASK_ROWS, getSortValue);

  const selectedName = DEMO_TASK_ROWS.find((row) => row.id === selectedId)?.name;

  return (
    <DemoSection
      description="Table — ghim cột, sắp xếp, chọn dòng, dòng tổng, phân trang, rỗng/đang tải."
      importPath="@/shared/ui"
      title="Bảng"
    >
      <DemoRow
        label="Table · useTableSort (sortKey/sortDir/onSortChange) + rowClassName + onRowClick + footerCell + striped"
        note="bấm tiêu đề Mã/Hạng mục/Ngân sách để sắp xếp; bấm dòng để chọn; dòng Chậm tiến độ tô đỏ nhạt; công tắc bật / tắt sọc xen kẽ"
        stacked
      >
        <Toggle checked={striped} label="striped — sọc xen kẽ" onCheckedChange={setStriped} />{' '}
        <Table
          className={DEMO_TABLE_FRAME_CLASSES}
          columns={columns}
          currentPage={page}
          data={sorted}
          footerCell={footerCell}
          pageSize={10}
          rowClassName={rowClassName}
          rowKey={rowKey}
          sortDir={sortDir}
          sortKey={sortKey}
          striped={striped}
          total={DEMO_TASK_ROWS.length}
          onPageChange={setPage}
          onRowClick={handleRowClick}
          onSortChange={onSortChange}
        />
        <Text size="extraTiny" skin="muted">
          Đang chọn: {selectedName ?? '—'}
        </Text>
      </DemoRow>

      <DemoRow label="Table · rỗng và đang tải (pagination off)" stacked>
        <DemoGrid min="lg">
          <Table
            className={DEMO_TABLE_FRAME_CLASSES}
            columns={columns.slice(0, 3)}
            data={[]}
            pagination={false}
          />
          <Table
            className={DEMO_TABLE_FRAME_CLASSES}
            columns={columns.slice(0, 3)}
            data={[]}
            loading
            pagination={false}
          />
        </DemoGrid>
      </DemoRow>

      <Text size="extraTiny" skin="muted">
        Cột ghim nhiều tầng, nhóm 2 tầng, tổng dính đáy, kéo-thả sắp xếp dòng, headerSize,
        fullRowCell — xem{' '}
        <a className="text-link hover:underline" href="#table">
          Bảng nâng cao
        </a>
        .
      </Text>
    </DemoSection>
  );
});

export default DataDisplaySection;

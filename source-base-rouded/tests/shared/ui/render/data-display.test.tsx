/**
 * Render nông — nhóm `data-display` (`tests/helpers/render-suite.tsx`).
 */

import { expect } from 'vitest';

import {
  AnimatedNumber,
  CapsuleChart,
  CellBar,
  NoticeBoard,
  RankingBoard,
  ScrollBoard,
  StackBar,
  StatusBoard,
  Table,
  TableDragHandle,
  Tree,
  TrendBadge,
} from '@/shared/ui';
import { describeRenderSuite, type RenderCase } from '@tests/helpers/render-suite';

const ROWS = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
];

const CASES: RenderCase[] = [
  [
    'Table',
    <Table
      columns={[{ key: 'name', header: 'Tên' }]}
      data={[{ id: 1, name: 'A' }]}
      rowKey={(row) => row.id}
    />,
  ],
  // Tay cầm chỉ hiện trong bảng `sortable` (đọc context kéo-thả của dòng).
  [
    'TableDragHandle',
    <Table
      columns={[
        { key: 'drag', cell: () => <TableDragHandle /> },
        { key: 'name', header: 'Tên' },
      ]}
      data={ROWS}
      pagination={false}
      rowKey={(row) => row.id}
      sortable
    />,
    {
      check: ({ getAllByLabelText }) => expect(getAllByLabelText('Kéo để sắp xếp')).toHaveLength(2),
    },
  ],
  ['Tree', <Tree data={[{ id: '1', name: 'Nút gốc' }]} />],
  [
    'StackBar',
    <StackBar
      ariaLabel="305 xong, 71 đang làm"
      segments={[
        { value: 305, color: 'var(--color-indigo-5)' },
        { value: 71, color: 'var(--color-yellow-5)' },
      ]}
    />,
  ],
  ['CellBar', <CellBar segments={[{ value: 68, color: 'var(--color-green-5)' }]} total={100} />],
  ['TrendBadge', <TrendBadge current={73} previous={315} versus="tháng 9/2026" />],
  ['AnimatedNumber', <AnimatedNumber suffix=" đ" value={1200} />],
  [
    'ScrollBoard',
    <ScrollBoard
      columns={[
        { key: 'name', header: 'Đơn vị', cell: (row: { id: number; name: string }) => row.name },
      ]}
      data={ROWS}
      rowCount={2}
      rowKey={(row) => row.id}
    />,
  ],
  [
    'RankingBoard',
    <RankingBoard items={[{ id: 'hn', label: 'Hà Nội', value: 9800 }]} tone="teal" />,
  ],
  [
    'CapsuleChart',
    <CapsuleChart items={[{ id: 'thep', label: 'Thép', value: 3500 }]} unit="tấn" />,
  ],
  [
    'NoticeBoard',
    <NoticeBoard
      items={[
        { id: 'd25', title: 'D25 còn khối lượng lớn', value: '150,18 t', onSelect: () => {} },
      ]}
    />,
    { check: ({ getByRole }) => expect(getByRole('button')).toHaveTextContent('150,18 t') },
  ],
  [
    'StatusBoard',
    <StatusBoard items={[{ id: 'cut', label: 'Máy cắt thép 01', state: 'running', value: 85 }]} />,
    { check: ({ getByRole }) => expect(getByRole('meter')).toHaveAttribute('aria-valuenow', '85') },
  ],
];

describeRenderSuite('data-display', CASES);

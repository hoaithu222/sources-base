/**
 * Theme tối cùng HÌNH với theme sáng ("Rounded Graphite") — nhóm data-display. jsdom không có CSS nên bài kiểm đọc CLASS /
 * style dựng ra: lớp `dark:` còn lại chỉ được là chỉnh MÀU phẳng (chữ · nền · viền · vòng), không bóng, gradient, pseudo
 * trang trí hay hình học riêng cho tối; không còn class `hud-*`. Hành vi của từng component ở `data-display.test.tsx`.
 */

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  CapsuleChart,
  CellBar,
  NoticeBoard,
  RankingBoard,
  ScrollBoard,
  StackBar,
  StatusBoard,
  Table,
  Tree,
  TrendBadge,
} from '@/shared/ui';
import type { ScrollBoardColumn, TableColumn } from '@/shared/ui';
import { renderInRouter } from '@tests/helpers/render';

/** Tên token / họ màu hợp lệ sau `text-` · `bg-` · `border-` · `ring-` — loại `caption-*` (cỡ chữ), `t-2` (bề dày), `hud-*`. */
const COLOR_NAME =
  '(?:primary|secondary|accent|info|indigo|success|warning|error|neutral|green|red|yellow|orange|blue|sky|teal|purple|pink|fuchsia|fg|bg|border|divider|action|link)';

/** `dark:` (kèm trạng thái rê / focus) + MỘT tiện ích màu: `text-*` · `bg-*` · `border-*` · `ring-*`. */
const FLAT_DARK_COLOR = new RegExp(
  `^dark:(?:(?:hover|focus-visible|active):)*(?:text|bg|border|ring)-${COLOR_NAME}(?:-[a-z0-9]+)*(?:/\\d+)?$`,
);

/** Mọi class trong cây `root` vi phạm: `dark:` không phải chỉnh màu phẳng, hoặc class `hud-*`. */
function decorativeClasses(root: ParentNode): string[] {
  return [...root.querySelectorAll('[class]')]
    .flatMap((el) => (el.getAttribute('class') ?? '').split(/\s+/))
    .filter((token) => token.includes('dark:') || /(^|:)hud-/.test(token))
    .filter((token) => !FLAT_DARK_COLOR.test(token));
}

interface Row {
  id: number;
  name: string;
  qty: number;
}

const ROWS: Row[] = [
  { id: 1, name: 'A', qty: 3 },
  { id: 2, name: 'B', qty: 5 },
  { id: 3, name: 'C', qty: 1 },
];

const TABLE_COLUMNS: TableColumn<Row>[] = [
  { key: 'name', header: 'Tên', width: 120, frozen: true, sortable: true },
  { key: 'qty', header: 'SL', group: { key: 'g', label: 'Nhóm' }, sortable: true },
  { key: 'id', header: 'Mã', group: { key: 'g', label: 'Nhóm' } },
];

describe('Table · Tree — không trang trí HUD ở theme tối', () => {
  it('Table: header, sọc, ô ghim, sắp xếp, dòng tổng, phân trang', () => {
    renderInRouter(
      <Table
        columnDividers
        columns={TABLE_COLUMNS}
        data={ROWS}
        footerCell={(col) => (col.key === 'qty' ? 9 : 'Tổng')}
        resizable
        rowKey={(row) => row.id}
        sortDir="asc"
        sortKey="qty"
        striped
        onSortChange={() => undefined}
      />,
    );
    expect(decorativeClasses(document.body)).toEqual([]);
  });

  it('Tree: dòng thường, dòng chọn, dòng bị khoá', () => {
    render(
      <Tree
        data={[
          { id: 'a', name: 'Gốc', children: [{ id: 'b', name: 'Con' }] },
          { id: 'c', name: 'Khoá', disabled: true },
        ]}
        height={200}
        openByDefault
        selectedIds={['b']}
      />,
    );
    expect(decorativeClasses(document.body)).toEqual([]);
  });
});

describe('Bảng điều hành — không trang trí HUD ở theme tối', () => {
  it('NoticeBoard · StatusBoard · RankingBoard · CapsuleChart', () => {
    renderInRouter(
      <div>
        <NoticeBoard
          items={[
            { id: 'w', title: 'Cảnh báo', value: '1', tone: 'warning', href: '/x' },
            { id: 'e', title: 'Lỗi', tone: 'error' },
            { id: 'i', title: 'Tin', tone: 'info', onSelect: () => undefined },
            { id: 's', title: 'Ổn', tone: 'success' },
          ]}
        />
        <StatusBoard
          items={[
            { id: 'a', label: 'Máy 1', icon: 'gear-outline', state: 'running', value: 80 },
            { id: 'b', label: 'Máy 2', state: 'stopped', value: 0 },
          ]}
          tone="teal"
        />
        <RankingBoard disableAnimation items={[{ id: 'hn', label: 'Hà Nội', value: 10 }]} />
        <CapsuleChart disableAnimation items={[{ id: 'a', label: 'Thép', value: 50 }]} max={100} />
      </div>,
    );
    expect(decorativeClasses(document.body)).toEqual([]);
  });

  it('ScrollBoard: header + dòng', () => {
    const columns: ScrollBoardColumn<Row>[] = [
      { key: 'name', header: 'Tên', cell: (row) => row.name },
    ];
    render(<ScrollBoard columns={columns} data={ROWS} rowKey={(row) => row.id} />);
    expect(decorativeClasses(document.body)).toEqual([]);
  });

  it('StackBar · CellBar · TrendBadge', () => {
    render(
      <div>
        <StackBar segments={[{ value: 6, color: 'var(--color-primary-6)', label: '6' }]} ticks />
        <CellBar segments={[{ value: 45, color: 'var(--color-info-5)' }]} total={100} />
        <TrendBadge current={120} previous={100} />
        <TrendBadge current={80} previous={100} />
      </div>,
    );
    expect(decorativeClasses(document.body)).toEqual([]);
  });
});

describe('StackBar · CellBar — thanh phẳng như theme sáng', () => {
  const SEGMENTS = [
    { value: 60, color: 'var(--color-primary-6)', label: '60' },
    { value: 40, color: 'var(--color-info-5)' },
  ];

  it('đoạn chỉ là khối màu phẳng: không mặt trên / mặt đầu xiên, không biến gradient hay quầng', () => {
    const { container } = render(<StackBar segments={SEGMENTS} />);

    expect(container.querySelector('[aria-hidden]')).toBeNull();
    for (const part of container.querySelectorAll<HTMLElement>(
      '[title], [style*="--stack-bar-c"]',
    )) {
      expect(part.getAttribute('style') ?? '').not.toMatch(/stack-bar-(face|edge|glow)|skew/);
    }
  });

  it('`emphasis` (@deprecated) không đổi gì — cùng một cây DOM', () => {
    const plain = render(<StackBar segments={SEGMENTS} />);
    const plainHtml = plain.container.innerHTML;
    plain.unmount();

    const loud = render(<StackBar emphasis segments={SEGMENTS} />);
    expect(loud.container.innerHTML).toBe(plainHtml);
  });

  it('CellBar: mỗi đoạn chỉ mang bề rộng — không biến khung / nền pha / quầng của kiểu HUD', () => {
    const { container } = render(
      <CellBar segments={[{ value: 45, color: 'var(--color-primary-6)' }]} total={100} />,
    );
    const parts = container.querySelectorAll(':scope > div > span[style*="width"]');

    expect(parts).toHaveLength(2);
    for (const part of parts) expect(part.getAttribute('style')).toMatch(/^width:\s*[\d.]+%;?$/);
  });
});

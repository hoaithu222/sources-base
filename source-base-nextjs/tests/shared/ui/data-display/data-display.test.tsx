/**
 * Nhóm data-display — hành vi đã sửa theo docs/known-issues.md (Tree · Table) và các bẫy
 * rà soát thêm. Mỗi `describe` một component; tên test nói hành vi người dùng thấy được.
 */

import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CapsuleChart,
  RankingBoard,
  ScrollBoard,
  Table,
  TableDragHandle,
  Tree,
  TrendBadge,
} from '@/shared/ui';
import type { ScrollBoardColumn, TableColumn, TreeHandle, TreeNodeData } from '@/shared/ui';
import { useTableDnd } from '@/shared/ui/data-display/table/hooks/useTableDnd';
import { IntlWrapper, renderWithIntl } from '@tests/helpers/render';

const TREE_DATA: TreeNodeData[] = [
  {
    id: 'r1',
    name: 'Gốc 1',
    children: [
      { id: 'c1', name: 'Con 1' },
      {
        id: 'c2',
        name: 'Con 2',
        children: [{ id: 'g1', name: 'Cháu 1' }],
      },
    ],
  },
  { id: 'r2', name: 'Gốc 2' },
];

const treeItems = () => [...document.querySelectorAll<HTMLElement>('[role="treeitem"]')];
const treeNames = () => treeItems().map((item) => item.textContent);
const chevronOf = (name: string) =>
  treeItems()
    .find((item) => item.textContent?.startsWith(name))
    ?.querySelector('span') as HTMLElement;

describe('Tree — mở sẵn và onToggle', () => {
  it('openByDefault mở mọi node ngay lần dựng đầu', () => {
    renderWithIntl(<Tree data={TREE_DATA} height={300} openByDefault />);
    expect(treeNames()).toEqual(['Gốc 1', 'Con 1', 'Con 2', 'Cháu 1', 'Gốc 2']);
  });

  it('defaultOpenIds chỉ mở đúng các node được nêu', () => {
    renderWithIntl(<Tree data={TREE_DATA} defaultOpenIds={['r1']} height={300} />);
    expect(treeNames()).toEqual(['Gốc 1', 'Con 1', 'Con 2', 'Gốc 2']);
  });

  it('không bắn onToggle lúc dựng; bấm chevron bắn đúng id node', () => {
    const onToggle = vi.fn();
    renderWithIntl(<Tree data={TREE_DATA} height={300} openByDefault onToggle={onToggle} />);
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.click(chevronOf('Con 2'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('c2');
    expect(treeNames()).not.toContain('Cháu 1');
  });

  it('ref.expandAll / collapseAll đổi cây mà không bắn onToggle cho từng node', () => {
    const onToggle = vi.fn();
    const ref = createRef<TreeHandle>();
    renderWithIntl(<Tree ref={ref} data={TREE_DATA} height={300} onToggle={onToggle} />);
    expect(treeNames()).toEqual(['Gốc 1', 'Gốc 2']);

    act(() => ref.current?.expandAll());
    expect(treeNames()).toHaveLength(5);
    act(() => ref.current?.collapseAll());
    expect(treeNames()).toEqual(['Gốc 1', 'Gốc 2']);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('prop expandAll bật / tắt về sau vẫn mở / đóng cả cây, không bắn onToggle', () => {
    const onToggle = vi.fn();
    const { rerender } = renderWithIntl(<Tree data={TREE_DATA} height={300} onToggle={onToggle} />);
    rerender(<Tree data={TREE_DATA} expandAll height={300} onToggle={onToggle} />);
    expect(treeNames()).toHaveLength(5);
    rerender(<Tree data={TREE_DATA} expandAll={false} height={300} onToggle={onToggle} />);
    expect(treeNames()).toEqual(['Gốc 1', 'Gốc 2']);
    expect(onToggle).not.toHaveBeenCalled();
  });
});

describe('Tree — chọn đơn (controlled)', () => {
  const selectedOf = (name: string) =>
    treeItems()
      .find((item) => item.textContent === name)
      ?.getAttribute('aria-selected');

  it('node chọn sẵn nằm trong nhánh đóng vẫn hiện là dòng chọn, không bắn onSelect', () => {
    const onSelect = vi.fn();
    renderWithIntl(<Tree data={TREE_DATA} height={300} selectedIds={['g1']} onSelect={onSelect} />);

    expect(selectedOf('Cháu 1')).toBe('true');
    expect(onSelect).not.toHaveBeenCalled();
  });
});

interface Row {
  id: number;
  name: string;
  qty: number;
}

const ROWS: Row[] = [
  { id: 1, name: 'A', qty: 3 },
  { id: 2, name: 'B', qty: 5 },
];

describe('Table — dòng tổng, tay cầm kéo, cột ghim', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ô dòng tổng giữ vạch trên đậm khi bật columnDividers', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'name', header: 'Tên' },
      { key: 'qty', header: 'SL' },
    ];
    renderWithIntl(
      <Table
        columnDividers
        columns={columns}
        data={ROWS}
        footerCell={(col) => (col.key === 'qty' ? 8 : 'Tổng')}
        pagination={false}
        rowKey={(row) => row.id}
      />,
    );
    const footerCells = [...document.querySelectorAll('tfoot td')];
    expect(footerCells).toHaveLength(2);
    // Vạch trên đậm (2px, màu `--table-rule` — cùng màu ray header) không bị class vạch dọc của tailwind-merge xoá.
    for (const cell of footerCells) expect(cell.className).toContain('border-t-(--table-rule)');
    expect(footerCells[0].className).toContain('border-r');
  });

  it('striped tô nền dòng thứ 2, 4… theo chỉ số dữ liệu; tắt thì không dòng nào mang nền sọc', () => {
    const columns: TableColumn<Row>[] = [{ key: 'name', header: 'Tên' }];
    const data: Row[] = [...ROWS, { id: 3, name: 'C', qty: 1 }, { id: 4, name: 'D', qty: 2 }];
    const bodyRows = () => [...document.querySelectorAll('tbody tr')];
    const { rerender } = renderWithIntl(
      <Table columns={columns} data={data} pagination={false} rowKey={(row) => row.id} striped />,
    );
    expect(bodyRows().map((tr) => tr.className.includes('bg-bg-subtle'))).toEqual([
      false,
      true,
      false,
      true,
    ]);
    rerender(<Table columns={columns} data={data} pagination={false} rowKey={(row) => row.id} />);
    expect(bodyRows().some((tr) => tr.className.includes('bg-bg-subtle'))).toBe(false);
  });

  it('bấm / bấm đúp tay cầm kéo không kích hoạt onRowClick / onRowDoubleClick', () => {
    const onRowClick = vi.fn();
    const onRowDoubleClick = vi.fn();
    const columns: TableColumn<Row>[] = [
      { key: 'drag', cell: () => <TableDragHandle /> },
      { key: 'name', header: 'Tên' },
    ];
    renderWithIntl(
      <Table
        columns={columns}
        data={ROWS}
        pagination={false}
        rowKey={(row) => row.id}
        sortable
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
      />,
    );
    const handle = screen.getAllByLabelText('Kéo để sắp xếp')[0];
    fireEvent.click(handle);
    fireEvent.doubleClick(handle);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(onRowDoubleClick).not.toHaveBeenCalled();

    fireEvent.doubleClick(screen.getByText('A'));
    expect(onRowDoubleClick).toHaveBeenCalledWith(ROWS[0], 0);
  });

  it('sensors của kéo-thả giữ nguyên reference qua các lần render', () => {
    const getRowKey = (row: Row) => row.id;
    const { result, rerender } = renderHook(() => useTableDnd({ data: ROWS, getRowKey }), {
      wrapper: IntlWrapper,
    });
    const first = result.current.sensors;
    rerender();
    expect(result.current.sensors).toBe(first);
  });

  it('cảnh báo dev khi cột ghim không được ghim (cột ghim trước nó thiếu width số)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const columns: TableColumn<Row>[] = [
      { key: 'name', header: 'Tên', frozen: true, width: '30%' },
      { key: 'qty', header: 'SL', frozen: true, width: 80 },
      { key: 'id', header: 'Mã' },
    ];
    renderWithIntl(
      <Table columns={columns} data={ROWS} pagination={false} rowKey={(row) => row.id} />,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('qty');
  });

  it('không cảnh báo khi mọi cột ghim liên tiếp có width số', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const columns: TableColumn<Row>[] = [
      { key: 'name', header: 'Tên', frozen: true, width: 120 },
      { key: 'qty', header: 'SL', frozen: true, width: 80 },
      { key: 'id', header: 'Mã' },
    ];
    renderWithIntl(
      <Table columns={columns} data={ROWS} pagination={false} rowKey={(row) => row.id} />,
    );
    expect(warn).not.toHaveBeenCalled();
    const qtyHeader = screen.getByText('SL').closest('th') as HTMLElement;
    expect(qtyHeader.style.left).toBe('120px');
  });

  const mockOffsetWidth = (el: HTMLElement, px: number) =>
    Object.defineProperty(el, 'offsetWidth', { configurable: true, value: px });
  const resizeHandleOf = (th: HTMLElement) =>
    th.querySelector<HTMLElement>('[aria-label="Kéo giãn cột"]') as HTMLElement;

  it('kéo giãn MỘT cột chốt bề rộng hiện tại của các cột KHÁC — không để chúng co/giãn theo (chỉ cột đang kéo đổi, tránh "resize ra 2 bên")', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'id', header: 'Mã' },
      { key: 'name', header: 'Tên' },
      { key: 'qty', header: 'SL' },
    ];
    renderWithIntl(
      <Table columns={columns} data={ROWS} pagination={false} rowKey={(row) => row.id} />,
    );

    const headers = [...document.querySelectorAll('thead th')] as HTMLElement[];
    const [idHeader, nameHeader, qtyHeader] = headers;
    mockOffsetWidth(idHeader, 100);
    mockOffsetWidth(nameHeader, 150);
    mockOffsetWidth(qtyHeader, 90);

    fireEvent.pointerDown(resizeHandleOf(nameHeader), { clientX: 0, pointerId: 1 });
    // Hai cột hai bên cột đang kéo (chưa khai `width`) phải được chốt NGAY tại bề rộng đang hiển thị.
    expect(idHeader.style.width).toBe('100px');
    expect(qtyHeader.style.width).toBe('90px');

    fireEvent.pointerMove(window, { clientX: 40, pointerId: 1 });
    // Cột đang kéo đổi theo con trỏ, hai cột kia vẫn giữ nguyên bề rộng đã chốt.
    expect(nameHeader.style.width).toBe('190px');
    expect(idHeader.style.width).toBe('100px');
    expect(qtyHeader.style.width).toBe('90px');

    fireEvent.pointerUp(resizeHandleOf(nameHeader), { clientX: 40, pointerId: 1 });
  });

  it('header 2 tầng: kéo cột ở hàng dưới vẫn chốt được cột lẻ rowSpan ở hàng trên (chốt theo toàn bộ <thead>)', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'id', header: 'Mã', group: { key: 'g1', label: 'Nhóm' } },
      { key: 'name', header: 'Tên', group: { key: 'g1', label: 'Nhóm' } },
      { key: 'qty', header: 'SL' },
    ];
    renderWithIntl(
      <Table columns={columns} data={ROWS} pagination={false} rowKey={(row) => row.id} />,
    );

    const cellOf = (key: string) =>
      document.querySelector(`thead th[data-col-key="${key}"]`) as HTMLElement;
    const idHeader = cellOf('id');
    const nameHeader = cellOf('name');
    const qtyHeader = cellOf('qty'); // cột lẻ, rowSpan=2, nằm ở TẦNG TRÊN
    mockOffsetWidth(idHeader, 120);
    mockOffsetWidth(nameHeader, 160);
    mockOffsetWidth(qtyHeader, 70);

    fireEvent.pointerDown(resizeHandleOf(idHeader), { clientX: 0, pointerId: 1 });
    expect(nameHeader.style.width).toBe('160px');
    expect(qtyHeader.style.width).toBe('70px');

    fireEvent.pointerUp(resizeHandleOf(idHeader), { clientX: 0, pointerId: 1 });
  });
});

describe('Tree — icon và màu chữ', () => {
  it('defaultCollapsedIcon có hiệu lực cho node cha; bỏ trống thì dùng ảnh thư mục', () => {
    const { unmount } = renderWithIntl(
      <Tree data={TREE_DATA} defaultCollapsedIcon="folder-outline" height={300} />,
    );
    const parent = treeItems()[0];
    expect(parent.querySelector('img')).toBeNull();
    expect(parent.querySelectorAll('svg').length).toBeGreaterThan(1);
    unmount();

    renderWithIntl(<Tree data={TREE_DATA} height={300} />);
    expect(treeItems()[0].querySelector('img')).not.toBeNull();
  });

  it('tên node dùng token chữ theo theme, không trắng cố định', () => {
    renderWithIntl(<Tree data={TREE_DATA} height={300} />);
    const label = screen.getByText('Gốc 1');
    expect(label.className).not.toContain('text-neutral-0');
    // Nhãn kế thừa màu chữ của dòng: token theo theme (`text-fg-body`; rê / chọn → `text-fg-heading`).
    expect(label.parentElement?.className).toContain('text-fg-body');
  });
});

describe('Table — a11y', () => {
  it('ô header đang sắp có aria-sort đúng chiều', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'name', header: 'Tên', sortable: true },
      { key: 'qty', header: 'SL', sortable: true },
    ];
    renderWithIntl(
      <Table
        columns={columns}
        data={ROWS}
        pagination={false}
        rowKey={(row) => row.id}
        sortDir="desc"
        sortKey="qty"
        onSortChange={() => {}}
      />,
    );
    const headers = [...document.querySelectorAll('thead th')];
    expect(headers[0].getAttribute('aria-sort')).toBeNull();
    expect(headers[1].getAttribute('aria-sort')).toBe('descending');
  });

  it('tay cầm kéo mô tả vai trò và hướng dẫn bàn phím bằng tiếng Việt', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'drag', cell: () => <TableDragHandle /> },
      { key: 'name', header: 'Tên' },
    ];
    renderWithIntl(
      <Table columns={columns} data={ROWS} pagination={false} rowKey={(row) => row.id} sortable />,
    );
    const handle = screen.getAllByLabelText('Kéo để sắp xếp')[0];
    expect(handle.getAttribute('aria-roledescription')).toBe('dòng kéo được');
    const describedBy = handle.getAttribute('aria-describedby') ?? '';
    expect(document.getElementById(describedBy)?.textContent).toContain('Nhấn Space');
  });
});

const nextFrame = () =>
  act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));

const barWidths = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('div[style*="width"]')].map((el) => el.style.width);

describe('CapsuleChart · RankingBoard — thanh mọc từ 0', () => {
  it('CapsuleChart: mảng items mới nhưng cùng số liệu không làm thanh co về 0', async () => {
    const make = () => [{ id: 'a', label: 'Thép', value: 50 }];
    const { container, rerender } = renderWithIntl(<CapsuleChart items={make()} max={100} />);
    await nextFrame();
    expect(barWidths(container)).toEqual(['50%']);

    rerender(<CapsuleChart items={make()} max={100} />);
    expect(barWidths(container)).toEqual(['50%']);

    rerender(<CapsuleChart items={[{ id: 'a', label: 'Thép', value: 80 }]} max={100} />);
    expect(barWidths(container)).toEqual(['0%']);
  });

  it('RankingBoard: mảng items mới nhưng cùng số liệu không làm thanh co về 0', async () => {
    const make = () => [{ id: 'hn', label: 'Hà Nội', value: 10 }];
    const { container, rerender } = renderWithIntl(<RankingBoard items={make()} />);
    await nextFrame();
    expect(barWidths(container)).toEqual(['100%']);
    rerender(<RankingBoard items={make()} />);
    expect(barWidths(container)).toEqual(['100%']);
  });

  it('RankingBoard: bộ số lẻ < 1 vẫn cho hạng nhất thanh đầy', () => {
    const { container } = renderWithIntl(
      <RankingBoard
        disableAnimation
        items={[
          { id: 'a', label: 'A', value: 0.5 },
          { id: 'b', label: 'B', value: 0.25 },
        ]}
      />,
    );
    expect(barWidths(container)).toEqual(['100%', '50%']);
  });
});

interface Alert {
  id: number;
  name: string;
}

const ALERTS: Alert[] = Array.from({ length: 6 }, (_, i) => ({ id: i, name: `Cảnh báo ${i}` }));
const ALERT_COLUMNS: ScrollBoardColumn<Alert>[] = [
  { key: 'name', header: 'Nội dung', cell: (row) => <span>{row.name}</span> },
];

const mockReducedMotion = (reduce: boolean) =>
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: reduce && query.includes('prefers-reduced-motion'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );

describe('ScrollBoard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers-reduced-motion: vùng cuộn tay chứa ĐỦ mọi dòng', () => {
    mockReducedMotion(true);
    renderWithIntl(
      <ScrollBoard columns={ALERT_COLUMNS} data={ALERTS} rowCount={2} rowKey={(r) => r.id} />,
    );
    for (const alert of ALERTS) expect(screen.getByText(alert.name)).toBeInTheDocument();
  });

  it('transitionend nổi lên từ ô con không làm bảng nhảy dòng', () => {
    mockReducedMotion(false);
    renderWithIntl(
      <ScrollBoard columns={ALERT_COLUMNS} data={ALERTS} rowCount={2} rowKey={(r) => r.id} />,
    );
    const firstRowText = () => screen.getAllByText(/Cảnh báo/)[0].textContent;
    expect(firstRowText()).toBe('Cảnh báo 0');

    fireEvent.transitionEnd(screen.getByText('Cảnh báo 0'), { propertyName: 'color' });
    expect(firstRowText()).toBe('Cảnh báo 0');

    const slide = screen.getByText('Cảnh báo 0').closest('[class*="grid"]')
      ?.parentElement as Element;
    fireEvent.transitionEnd(slide, { propertyName: 'transform' });
    expect(firstRowText()).toBe('Cảnh báo 1');
  });
});

describe('TrendBadge', () => {
  it('số không hữu hạn hiện "—" thay vì "NaN%"', () => {
    renderWithIntl(<TrendBadge current={Number.NaN} previous={10} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('tăng 14,2% so với kỳ trước: mũi tên lên, chữ đọc "tăng"', () => {
    renderWithIntl(<TrendBadge current={114.2} previous={100} />);
    expect(screen.getByText('tăng')).toBeInTheDocument();
    expect(screen.getByText('14,2%')).toBeInTheDocument();
  });
});

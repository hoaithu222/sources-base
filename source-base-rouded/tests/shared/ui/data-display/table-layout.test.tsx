/**
 * Table — bố cục: kéo giãn chỉ đổi MỘT cột (cột đệm cuối hút phần dư), dòng tổng sát đáy vùng cuộn,
 * `scroll-padding` chừa chỗ cho header / dòng tổng dính, focus bàn phím kéo cả dòng vào vùng nhìn.
 * jsdom không dựng layout → số đo hình học được giả lập bằng `vi.spyOn` trên prototype.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Table } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';

interface Row {
  id: number;
  name: string;
  qty: number;
}

const ROWS: Row[] = [
  { id: 1, name: 'A', qty: 3 },
  { id: 2, name: 'B', qty: 5 },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: 'id', header: 'Mã' },
  { key: 'name', header: 'Tên' },
  { key: 'qty', header: 'SL' },
];

const rowKey = (row: Row) => row.id;
const FOOTER_TEXT: Record<string, React.ReactNode> = { id: 'Tổng', qty: 8 };
const footerCell = (col: TableColumn<Row>) => FOOTER_TEXT[col.key] ?? null;

const mockOffsetWidth = (el: HTMLElement, px: number) =>
  Object.defineProperty(el, 'offsetWidth', { configurable: true, value: px });
const headerOf = (key: string) =>
  document.querySelector(`thead th[data-col-key="${key}"]`) as HTMLElement;
const resizeHandleOf = (th: HTMLElement) =>
  th.querySelector<HTMLElement>('[aria-label="Kéo giãn cột"]') as HTMLElement;
const fillerHeaders = () => [
  ...document.querySelectorAll<HTMLElement>('thead th[aria-hidden="true"]'),
];

/** Chốt bề rộng giả cho các ô header rồi nhấn tay cầm của cột `key` (bắt đầu kéo). */
function startResize(key: string, widths: Record<string, number>) {
  for (const [colKey, px] of Object.entries(widths)) mockOffsetWidth(headerOf(colKey), px);
  fireEvent.pointerDown(resizeHandleOf(headerOf(key)), { clientX: 0, pointerId: 1 });
}

describe('Table — kéo giãn: chỉ cột được kéo đổi bề rộng', () => {
  it('chưa kéo thì KHÔNG có cột đệm (giữ nguyên cách chia cột cũ)', () => {
    render(<Table columns={COLUMNS} data={ROWS} pagination={false} rowKey={rowKey} />);
    expect(fillerHeaders()).toHaveLength(0);
    expect(document.querySelectorAll('tbody tr')[0].children).toHaveLength(3);
  });

  it('bắt đầu kéo → thêm cột đệm cuối (không width, không data-col-key, aria-hidden) ở header, mọi dòng và dòng tổng', () => {
    render(
      <Table
        columns={COLUMNS}
        data={ROWS}
        footerCell={footerCell}
        pagination={false}
        rowKey={rowKey}
      />,
    );
    startResize('name', { id: 100, name: 150, qty: 90 });

    const [filler] = fillerHeaders();
    expect(filler).toBeDefined();
    expect(filler.dataset.colKey).toBeUndefined();
    expect(filler.style.width).toBe('');
    expect(filler.parentElement?.lastElementChild).toBe(filler);
    expect(filler.querySelector('[aria-label="Kéo giãn cột"]')).toBeNull();
    for (const tr of document.querySelectorAll('tbody:not([aria-hidden]) tr')) {
      expect(tr.children).toHaveLength(4);
      expect(tr.lastElementChild?.getAttribute('aria-hidden')).toBe('true');
    }
    const footerCells = [...document.querySelectorAll('tfoot td')];
    expect(footerCells).toHaveLength(4);
    expect(footerCells[3].textContent).toBe('');
  });

  it('thu hẹp một cột: cột khác GIỮ bề rộng đã chốt (cột đệm hút phần dư), sàn là minColumnWidth', () => {
    render(
      <Table
        columns={COLUMNS}
        data={ROWS}
        minColumnWidth={80}
        pagination={false}
        rowKey={rowKey}
      />,
    );
    startResize('name', { id: 100, name: 150, qty: 90 });

    fireEvent.pointerMove(window, { clientX: -40, pointerId: 1 });
    expect(headerOf('name').style.width).toBe('110px');
    expect(headerOf('id').style.width).toBe('100px');
    expect(headerOf('qty').style.width).toBe('90px');

    fireEvent.pointerMove(window, { clientX: -200, pointerId: 1 });
    expect(headerOf('name').style.width).toBe('80px');
    fireEvent.pointerUp(window, { pointerId: 1 });
  });

  it('header 2 tầng: cột đệm là ô trải 2 tầng ở tầng trên, <colgroup> có thêm <col> không width', () => {
    const columns: TableColumn<Row>[] = [
      { key: 'id', header: 'Mã', group: { key: 'g', label: 'Nhóm' } },
      { key: 'name', header: 'Tên', group: { key: 'g', label: 'Nhóm' } },
      { key: 'qty', header: 'SL' },
    ];
    render(<Table columns={columns} data={ROWS} pagination={false} rowKey={rowKey} />);
    startResize('id', { id: 120, name: 160, qty: 70 });

    const [filler] = fillerHeaders();
    expect(filler.getAttribute('rowspan')).toBe('2');
    const cols = [...document.querySelectorAll('colgroup col')] as HTMLElement[];
    expect(cols.map((col) => col.style.width)).toEqual(['120px', '160px', '70px', '']);
  });

  it('layout="auto" không thêm cột đệm (bề rộng chỉ là gợi ý)', () => {
    render(
      <Table columns={COLUMNS} data={ROWS} layout="auto" pagination={false} rowKey={rowKey} />,
    );
    startResize('name', { id: 100, name: 150, qty: 90 });
    expect(fillerHeaders()).toHaveLength(0);
    fireEvent.pointerUp(window, { pointerId: 1 });
  });

  it('chuột phải trên tay cầm KHÔNG bắt đầu kéo (không chốt bề rộng, không kẹt con trỏ col-resize)', () => {
    render(<Table columns={COLUMNS} data={ROWS} pagination={false} rowKey={rowKey} />);
    fireEvent.pointerDown(resizeHandleOf(headerOf('name')), { button: 2, clientX: 0 });
    expect(headerOf('id').style.width).toBe('');
    expect(fillerHeaders()).toHaveLength(0);
    expect(document.body.classList.contains('splitter-resizing-x')).toBe(false);
  });

  it('kéo cột KHÔNG ghim: các dòng không render lại ở mỗi nhịp kéo (frozenLeft giữ reference)', () => {
    const cell = vi.fn((row: Row) => row.name);
    const columns: TableColumn<Row>[] = [
      { key: 'id', header: 'Mã', width: 80, frozen: true },
      { key: 'name', header: 'Tên', cell },
      { key: 'qty', header: 'SL' },
    ];
    render(<Table columns={columns} data={ROWS} pagination={false} rowKey={rowKey} />);
    startResize('qty', { id: 80, name: 150, qty: 90 });
    const callsAfterStart = cell.mock.calls.length;

    fireEvent.pointerMove(window, { clientX: 10, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 20, pointerId: 1 });
    fireEvent.pointerMove(window, { clientX: 30, pointerId: 1 });
    expect(headerOf('qty').style.width).toBe('120px');
    expect(cell.mock.calls.length).toBe(callsAfterStart);
    fireEvent.pointerUp(window, { pointerId: 1 });
  });
});

describe('Table — dòng tổng sát đáy · scroll-padding · focus bàn phím', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Giả lập: vùng cuộn cao 500,25px (thanh cuộn ngang 0), `<table>` cao 300px khi ô đệm = 0 (chiều cao LAYOUT qua
   * `getComputedStyle`), header 40px, dòng tổng 36px (`offsetHeight`).
   */
  function mockGeometry() {
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el: Element) => {
      const style = realGetComputedStyle(el);
      if (el.tagName === 'TABLE') return { ...style, height: '300px' } as CSSStyleDeclaration;
      if (el.classList.contains('overflow-auto'))
        return { ...style, height: '500.25px' } as CSSStyleDeclaration;
      return style;
    });
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(function (
      this: HTMLElement,
    ) {
      const heights: Record<string, number> = { THEAD: 40, TFOOT: 36 };
      return heights[this.tagName] ?? 0;
    });
  }

  it('vùng cuộn cao hơn bảng → ô đệm trước <tfoot> cao đúng phần trống (dòng tổng xuống sát đáy)', () => {
    mockGeometry();
    render(
      <Table
        columns={COLUMNS}
        data={ROWS}
        fill
        footerCell={footerCell}
        pagination={false}
        rowKey={rowKey}
      />,
    );
    const spacerBody = document.querySelector('tbody[aria-hidden]') as HTMLElement;
    expect(spacerBody.nextElementSibling?.tagName).toBe('TFOOT');
    const spacer = spacerBody.querySelector('td') as HTMLElement;
    expect(spacer.style.height).toBe('200.25px');
    expect(spacer.getAttribute('colspan')).toBe('3');
  });

  it('scroll-padding của vùng cuộn = chiều cao header / dòng tổng', () => {
    mockGeometry();
    render(
      <Table
        columns={COLUMNS}
        data={ROWS}
        footerCell={footerCell}
        pagination={false}
        rowKey={rowKey}
      />,
    );
    const scroller = document.querySelector('table')?.parentElement as HTMLElement;
    expect(scroller.style.scrollPaddingTop).toBe('40px');
    expect(scroller.style.scrollPaddingBottom).toBe('36px');
  });

  it('không footerCell / bảng rỗng → không dựng ô đệm', () => {
    const { unmount } = render(
      <Table columns={COLUMNS} data={ROWS} pagination={false} rowKey={rowKey} />,
    );
    expect(document.querySelector('tbody[aria-hidden]')).toBeNull();
    unmount();
    render(<Table columns={COLUMNS} data={[]} footerCell={footerCell} pagination={false} />);
    expect(document.querySelector('tbody[aria-hidden]')).toBeNull();
  });

  it('focus bàn phím vào nút trong ô → cuộn CẢ dòng vào vùng nhìn; bấm chuột vào nút thì không', () => {
    const columns: TableColumn<Row>[] = [
      ...COLUMNS,
      { key: 'open', cell: (row) => <button type="button">{`Mở ${row.name}`}</button> },
    ];
    render(<Table columns={columns} data={ROWS} pagination={false} rowKey={rowKey} />);
    const button = screen.getByText('Mở B');
    const row = button.closest('tr') as HTMLElement;
    const reveal = vi.spyOn(row, 'scrollIntoView').mockImplementation(() => {});

    const original = Element.prototype.matches;
    const matches = vi.spyOn(Element.prototype, 'matches');
    const focusVisible = (visible: boolean) =>
      matches.mockImplementation(function (this: Element, selector: string) {
        return selector === ':focus-visible' ? visible : original.call(this, selector);
      });
    focusVisible(true);
    fireEvent.focusIn(button);
    expect(reveal).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });

    reveal.mockClear();
    focusVisible(false);
    fireEvent.focusIn(button);
    expect(reveal).not.toHaveBeenCalled();
  });
});

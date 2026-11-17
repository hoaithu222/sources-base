/**
 * Điều hướng trên màn hẹp (Tabs · Pagination · Stepper) — `docs/rules/display/ipad-responsive.md §4`.
 *
 * Chật chỗ thì CUỘN, không ẩn tab / trang. jsdom không có CSS nên test đọc CLASS và số phần tử dựng ra: dải cuộn ngang
 * phải có `overflow-x-auto overscroll-x-contain`, và mọi trang / bước vẫn có mặt ở điện thoại (chỉ đổi cách xếp).
 */

import { screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';

import { Pagination, ScrollEdgeNav, Stepper, Tabs, TabsPanel } from '@/shared/ui';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';

const noop = () => {};
const classesOf = (el: Element) => el.className.split(/\s+/);

/** Tên token / họ màu hợp lệ sau `text-` · `bg-` · `border-` · `ring-` — loại `caption-*` (cỡ chữ), `t-2` (bề dày), `hud-*`. */
const COLOR_NAME =
  '(?:primary|secondary|accent|info|indigo|success|warning|error|neutral|green|red|yellow|orange|blue|sky|teal|purple|pink|fuchsia|fg|bg|border|divider|action|link)';
/** `dark:` (kèm trạng thái rê / focus) + MỘT tiện ích màu: `text-*` · `bg-*` · `border-*` · `ring-*`. */
const FLAT_DARK_COLOR = new RegExp(
  `^dark:(?:(?:hover|focus-visible|active):)*(?:text|bg|border|ring)-${COLOR_NAME}(?:-[a-z0-9]+)*(?:/\\d+)?$`,
);
/** Mọi class trong cây `root` vi phạm: `dark:` không phải chỉnh màu phẳng, hoặc class `hud-*`. */
const decorativeClasses = (root: ParentNode) =>
  [...root.querySelectorAll('[class]')]
    .flatMap((el) => (el.getAttribute('class') ?? '').split(/\s+/))
    .filter((token) => token.includes('dark:') || /(^|:)hud-/.test(token))
    .filter((token) => !FLAT_DARK_COLOR.test(token));

describe('Tabs — dải tab cuộn ngang khi hẹp', () => {
  const OPTIONS = ['Tổng quan', 'Công việc', 'Hồ sơ', 'Nhật ký', 'Báo cáo'].map((label) => ({
    key: label,
    label,
  }));

  it('dải tab có overflow-x-auto + overscroll-x-contain + min-w-0, không ẩn tab nào', () => {
    renderWithIntl(<Tabs options={OPTIONS} />);
    const list = screen.getByRole('tablist');

    expect(classesOf(list)).toEqual(
      expect.arrayContaining(['overflow-x-auto', 'overscroll-x-contain', 'min-w-0', 'max-w-full']),
    );
    expect(screen.getAllByRole('tab')).toHaveLength(OPTIONS.length);
  });

  it('tab nới hộp bấm trên máy chạm bằng ::after, ring focus nằm TRONG tab (không bị dải cắt)', () => {
    renderWithIntl(<Tabs options={OPTIONS} />);
    const tab = screen.getAllByRole('tab')[0];

    expect(classesOf(tab)).toEqual(
      expect.arrayContaining(['relative', 'touch:after:absolute', 'focus-visible:ring-inset']),
    );
  });

  it('có `right`: hàng header cho phép co (min-w-0) để dải tab cuộn thay vì đẩy tràn', () => {
    const { container } = renderWithIntl(
      <Tabs options={OPTIONS} right={<button type="button">Thêm</button>} />,
    );
    const header = container.querySelector('[role="tablist"]')!.parentElement!;

    expect(classesOf(header)).toContain('min-w-0');
  });
});

describe('Pagination — điện thoại: hai hàng, không bớt trang', () => {
  const props = {
    pageIndex: 2,
    pageCount: 5,
    pageSize: 12,
    total: 60,
    onPageChange: noop,
    onPageSizeChange: noop,
  };

  it('dải gốc cho xuống dòng; cụm thông tin + cụm trang có biến thể phone:', () => {
    const { container } = renderInRouter(<Pagination {...props} />);
    const root = container.firstElementChild as HTMLElement;
    const [info, pager] = Array.from(root.children);

    expect(classesOf(root)).toEqual(expect.arrayContaining(['flex-wrap', 'phone:px-3']));
    expect(classesOf(info)).toEqual(
      expect.arrayContaining(['phone:w-full', 'phone:justify-between']),
    );
    expect(classesOf(pager)).toEqual(
      expect.arrayContaining(['phone:w-full', 'phone:flex-wrap', 'phone:justify-center']),
    );
  });

  it('vẫn dựng đủ ‹ 1 2 3 4 5 › (không ẩn trang để gọn)', () => {
    renderInRouter(<Pagination {...props} />);

    for (const page of ['1', '2', '3', '4', '5']) {
      expect(screen.getByRole('button', { name: page })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trang sau' })).toBeInTheDocument();
  });
});

describe('Stepper — hàng ngang co theo khung, không tràn', () => {
  const STEPS = ['Thông tin', 'Kiểm tra', 'Phê duyệt', 'Hoàn tất'].map((label) => ({
    key: label,
    label,
  }));

  it.each(['horizontal-center', 'horizontal-inline'] as const)(
    '%s: mỗi bước flex-1 min-w-0 nên nhãn dài co / xuống dòng thay vì đẩy tràn trang',
    (layout) => {
      renderWithIntl(<Stepper layout={layout} steps={STEPS} />);

      for (const item of screen.getAllByRole('listitem')) {
        expect(classesOf(item)).toEqual(expect.arrayContaining(['min-w-0', 'flex-1']));
      }
    },
  );
});

describe('Tabs · Stepper · Pagination · ScrollEdgeNav — theme tối cùng hình với sáng', () => {
  const OPTIONS = ['Tổng quan', 'Công việc', 'Hồ sơ'].map((label) => ({ key: label, label }));

  it.each([
    ['line', 'top'],
    ['line', 'bottom'],
    ['folder', 'top'],
  ] as const)(
    'Tabs %s / %s: không vát góc, quầng hay gradient riêng cho tối',
    (variant, indicator) => {
      renderWithIntl(
        <Tabs indicator={indicator} options={OPTIONS} variant={variant}>
          <TabsPanel value="Tổng quan">nội dung</TabsPanel>
        </Tabs>,
      );
      expect(decorativeClasses(document.body)).toEqual([]);
    },
  );

  it('Tabs folder: tab có góc bo trên và viền thật như sáng (không clip-path)', () => {
    renderWithIntl(<Tabs options={OPTIONS} variant="folder" />);
    const classes = classesOf(screen.getAllByRole('tab')[0]);

    expect(classes).toEqual(expect.arrayContaining(['rounded-t-lg', 'border']));
    expect(classes.some((c) => c.includes('clip-path'))).toBe(false);
  });

  it.each(['horizontal-center', 'horizontal-inline', 'vertical'] as const)(
    'Stepper %s: đủ trạng thái (xong · đang làm · lỗi · chờ) không quầng / gradient',
    (layout) => {
      renderWithIntl(
        <Stepper
          activeStep={1}
          layout={layout}
          steps={[
            { key: 'a', label: 'A' },
            { key: 'b', label: 'B', description: 'mô tả' },
            { key: 'c', label: 'C', status: 'error' },
            { key: 'd', label: 'D' },
          ]}
        />,
      );
      expect(decorativeClasses(document.body)).toEqual([]);
    },
  );

  it('Pagination: nút trang đang xem là Button primary, không phủ lớp HUD riêng', () => {
    renderInRouter(
      <Pagination
        pageCount={5}
        pageIndex={2}
        pageSize={12}
        total={60}
        onPageChange={noop}
        onPageSizeChange={noop}
      />,
    );
    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute('aria-current', 'page');
    expect(decorativeClasses(document.body)).toEqual([]);
  });

  it('ScrollEdgeNav: nút cuộn không viền / quầng riêng cho tối', () => {
    const ref = createRef<HTMLDivElement>();
    renderWithIntl(
      <div className="group/scroll-edge relative">
        <div ref={ref} />
        <ScrollEdgeNav targetRef={ref} />
      </div>,
    );
    expect(decorativeClasses(document.body)).toEqual([]);
  });
});

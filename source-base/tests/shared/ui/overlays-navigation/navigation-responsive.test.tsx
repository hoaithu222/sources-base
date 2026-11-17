/**
 * Điều hướng trên màn hẹp (Tabs · Pagination · Stepper) — `docs/rules/display/ipad-responsive.md §4`.
 *
 * Chật chỗ thì CUỘN, không ẩn tab / trang. jsdom không có CSS nên test đọc CLASS và số phần tử dựng ra: dải cuộn ngang
 * phải có `overflow-x-auto overscroll-x-contain`, và mọi trang / bước vẫn có mặt ở điện thoại (chỉ đổi cách xếp).
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Pagination, Stepper, Tabs } from '@/shared/ui';
import { renderInRouter } from '@tests/helpers/render';

const noop = () => {};
const classesOf = (el: Element) => el.className.split(/\s+/);

describe('Tabs — dải tab cuộn ngang khi hẹp', () => {
  const OPTIONS = ['Tổng quan', 'Công việc', 'Hồ sơ', 'Nhật ký', 'Báo cáo'].map((label) => ({
    key: label,
    label,
  }));

  it('dải tab có overflow-x-auto + overscroll-x-contain + min-w-0, không ẩn tab nào', () => {
    render(<Tabs options={OPTIONS} />);
    const list = screen.getByRole('tablist');

    expect(classesOf(list)).toEqual(
      expect.arrayContaining(['overflow-x-auto', 'overscroll-x-contain', 'min-w-0', 'max-w-full']),
    );
    expect(screen.getAllByRole('tab')).toHaveLength(OPTIONS.length);
  });

  it('tab nới hộp bấm trên máy chạm bằng ::after, ring focus nằm TRONG tab (không bị dải cắt)', () => {
    render(<Tabs options={OPTIONS} />);
    const tab = screen.getAllByRole('tab')[0];

    expect(classesOf(tab)).toEqual(
      expect.arrayContaining(['relative', 'touch:after:absolute', 'focus-visible:ring-inset']),
    );
  });

  it('có `right`: hàng header cho phép co (min-w-0) để dải tab cuộn thay vì đẩy tràn', () => {
    const { container } = render(
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
      render(<Stepper layout={layout} steps={STEPS} />);

      for (const item of screen.getAllByRole('listitem')) {
        expect(classesOf(item)).toEqual(expect.arrayContaining(['min-w-0', 'flex-1']));
      }
    },
  );
});

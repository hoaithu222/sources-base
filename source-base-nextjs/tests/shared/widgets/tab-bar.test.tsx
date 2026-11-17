/**
 * `TabBar` (`shared/widgets/tab-bar`) — thanh điều hướng đáy của điện thoại.
 *
 * Giữ: ô là liên kết thật có `aria-current="page"`; ≤ 5 mục nằm thẳng trên thanh; quá 5 thì 4 mục + ô "Thêm" mở sheet
 * liệt kê TẤT CẢ mục, có nút Đóng, đóng bằng Esc hoặc khi chọn một mục; ô "Thêm" mượn nhãn của mục đang mở trong sheet.
 * jsdom không dựng layout — số đo (chiều cao thanh, vùng chạm) kiểm bằng trình duyệt thật.
 */

import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { guardAnchorNavigation } from '@tests/helpers/anchor-guard';
import { renderInRouter } from '@tests/helpers/render';
import { TabBar } from '@/shared/widgets/tab-bar';
import type { TabBarItem } from '@/shared/widgets/tab-bar';
import {
  TAB_BAR_MAX_CELLS,
  findActiveId,
  layoutTabBar,
  tileSpanClass,
} from '@/shared/widgets/tab-bar/tab-bar.utils';

const ITEMS: TabBarItem[] = [
  { id: 'home', label: 'Trang chủ', icon: 'house-outline', href: '/' },
  { id: 'reports', label: 'Báo cáo', icon: 'chart-line-outline', href: '/reports' },
  { id: 'ledger', label: 'Sổ cái', icon: 'grid-2-outline', href: '/ledger' },
  { id: 'audit', label: 'Nhật ký', icon: 'user-outline', href: '/audit' },
  { id: 'assets', label: 'Tài sản', icon: 'gear-outline', href: '/assets' },
  {
    id: 'people',
    label: 'Nhân sự cấp cao',
    shortLabel: 'Nhân sự',
    icon: 'users-outline',
    href: '/people',
  },
];

guardAnchorNavigation();

function renderBar(items: readonly TabBarItem[], pathname = '/') {
  return renderInRouter(<TabBar items={items} />, { pathname });
}

describe('TabBar — thanh tab đáy', () => {
  it('≤ 5 mục: mọi mục là liên kết thật trên thanh, không có ô "Thêm"', () => {
    renderBar(ITEMS.slice(0, TAB_BAR_MAX_CELLS), '/');

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    const links = within(nav).getAllByRole('link');
    expect(links).toHaveLength(TAB_BAR_MAX_CELLS);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/reports',
      '/ledger',
      '/audit',
      '/assets',
    ]);
    expect(screen.queryByRole('button', { name: /Thêm/ })).not.toBeInTheDocument();
  });

  it('mục đang mở có aria-current="page" — khớp theo tiền tố phân đoạn, `/` chỉ khớp chính nó', () => {
    renderBar(ITEMS.slice(0, 3), '/reports/2026');

    expect(screen.getByRole('link', { name: 'Báo cáo' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Trang chủ' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Sổ cái' })).not.toHaveAttribute('aria-current');
  });

  it('nhãn một dòng dưới icon: dùng `shortLabel` nếu có, tên đầy đủ vẫn là aria-label', () => {
    renderBar(ITEMS.slice(0, 4).concat(ITEMS[5]).slice(0, 5));

    expect(screen.getByRole('link', { name: 'Nhân sự cấp cao' })).toHaveTextContent('Nhân sự');
  });

  it('không có mục → không vẽ gì', () => {
    renderBar([]);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('gọi `onIntent` khi ô nhận focus (nạp trước trang đích)', () => {
    const onIntent = vi.fn();
    renderBar([{ ...ITEMS[1], onIntent }]);

    fireEvent.focus(screen.getByRole('link', { name: 'Báo cáo' }));

    expect(onIntent).toHaveBeenCalledTimes(1);
  });
});

describe('TabBar — ô "Thêm" và sheet', () => {
  it('quá 5 mục: 4 mục đầu trên thanh + ô "Thêm"', () => {
    renderBar(ITEMS);

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getAllByRole('link')).toHaveLength(TAB_BAR_MAX_CELLS - 1);
    expect(screen.getByRole('button', { name: 'Thêm phân hệ' })).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
  });

  it('mở sheet: liệt kê TẤT CẢ mục, có nút Đóng; Esc đóng', async () => {
    renderBar(ITEMS);

    fireEvent.click(screen.getByRole('button', { name: 'Thêm phân hệ' }));
    const sheet = await screen.findByRole('dialog', { name: 'Tất cả phân hệ' });

    expect(within(sheet).getAllByRole('link')).toHaveLength(ITEMS.length);
    expect(within(sheet).getByRole('button', { name: 'Đóng' })).toBeInTheDocument();

    fireEvent.keyDown(sheet, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('nút Đóng đóng sheet; chọn một mục (liên kết thật tới đích) thì sheet tự đóng', async () => {
    renderBar(ITEMS, '/');

    fireEvent.click(screen.getByRole('button', { name: 'Thêm phân hệ' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Thêm phân hệ' }));
    const sheet = await screen.findByRole('dialog');
    const link = within(sheet).getByRole('link', { name: 'Tài sản' });
    expect(link).toHaveAttribute('href', '/assets');
    fireEvent.click(link);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mục đang mở nằm trong sheet → ô "Thêm" mượn nhãn của nó và báo đang mở', async () => {
    renderBar(ITEMS, '/people');

    const more = screen.getByRole('button', { name: /Thêm — đang mở Nhân sự cấp cao/ });
    expect(more).toHaveTextContent('Nhân sự');

    fireEvent.click(more);
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByRole('link', { name: 'Nhân sự cấp cao' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});

describe('TabBar — ngôn ngữ và nhãn tuỳ chỉnh', () => {
  it('en: chữ mặc định (vùng điều hướng, ô "More", tiêu đề sheet) theo en; liên kết có tiền tố `/en`; mục đang mở nhận ra qua đường không tiền tố', async () => {
    renderInRouter(<TabBar items={ITEMS} />, { pathname: '/en/people', locale: 'en' });

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(within(nav).getAllByRole('link')[1]).toHaveAttribute('href', '/en/reports');

    const more = screen.getByRole('button', { name: 'More — Nhân sự cấp cao is open' });
    fireEvent.click(more);
    const sheet = await screen.findByRole('dialog', { name: 'All modules' });
    expect(within(sheet).getByRole('link', { name: 'Nhân sự cấp cao' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('en: ô "More" chưa có mục nào đang mở trong sheet → nhãn "More modules"', () => {
    renderInRouter(<TabBar items={ITEMS} />, { pathname: '/en', locale: 'en' });

    expect(screen.getByRole('button', { name: 'More modules' })).toBeInTheDocument();
  });

  it('`ariaLabel` / `moreLabel` / `sheetTitle` truyền vào thắng chữ mặc định', async () => {
    renderInRouter(
      <TabBar ariaLabel="Thanh dưới" items={ITEMS} moreLabel="Xem thêm" sheetTitle="Mọi thứ" />,
    );

    expect(screen.getByRole('navigation', { name: 'Thanh dưới' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm phân hệ' }));
    expect(await screen.findByRole('dialog', { name: 'Mọi thứ' })).toBeInTheDocument();
  });
});

describe('tab-bar.utils', () => {
  it('layoutTabBar: đủ chỗ thì không có phần tràn; quá thì chừa một ô cho "Thêm"', () => {
    expect(layoutTabBar(ITEMS.slice(0, 5))).toEqual({ primary: ITEMS.slice(0, 5), overflow: [] });
    expect(layoutTabBar(ITEMS)).toEqual({ primary: ITEMS.slice(0, 4), overflow: ITEMS.slice(4) });
  });

  it('findActiveId: khớp href DÀI NHẤT; không khớp → undefined', () => {
    const nested: TabBarItem[] = [
      { id: 'demo', label: 'Demo', icon: 'grid-2-outline', href: '/demo' },
      { id: 'composed', label: 'Ghép', icon: 'grid-2-outline', href: '/demo/ghep' },
    ];

    expect(findActiveId('/demo/ghep', nested)).toBe('composed');
    expect(findActiveId('/demo', nested)).toBe('demo');
    expect(findActiveId('/demos', nested)).toBeUndefined();
  });

  it('tileSpanClass: ô lẻ cuối hàng dãn ra để hàng cuối không hở', () => {
    expect(tileSpanClass(0, 7)).toContain('col-span-4');
    expect(tileSpanClass(6, 7)).toContain('col-span-12');
    expect(tileSpanClass(6, 8)).toContain('col-span-6');
  });
});

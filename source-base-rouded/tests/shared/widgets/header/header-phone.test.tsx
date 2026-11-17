/**
 * Top bar điện thoại (`header/phone`) — thay `Header` HUD khi `useIsPhone()`.
 *
 * Giữ: `PageHeader` vẫn là cổng duy nhất của trang (tên + dòng phụ vào ô `title`, quay lại vào ô `start`, tab vào ô
 * `nav` — không mất chức năng); tên dự phòng khi trang không có `PageHeader`; menu tài khoản mở thành sheet đáy có
 * nút Đóng, không có mục "Kiểu header". jsdom không dựng layout — số đo (≤ 52px, vùng chạm) kiểm bằng trình duyệt thật.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PHONE_MEDIA_QUERY } from '@/shared/constants/media-query.constants';
import { PageHeader, PhoneTopBar } from '@/shared/widgets/header';
import { HeaderSlotsProvider } from '@/shared/widgets/header';

const originalMatchMedia = window.matchMedia;

function mockViewport(isPhone: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: isPhone && query === PHONE_MEDIA_QUERY,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}

const NAV_ITEMS = [
  { key: 'packages', label: 'Gói thầu' },
  { key: 'progress', label: 'Tiến độ' },
  { key: 'acceptance', label: 'Nghiệm thu', href: '/acceptance' },
];

let router: ReturnType<typeof createMemoryRouter> | undefined;

function renderBar(page?: React.ReactElement, onUserMenuSelect = vi.fn()) {
  router = createMemoryRouter([
    {
      path: '*',
      element: (
        <HeaderSlotsProvider>
          <PhoneTopBar
            title="Tên dự phòng"
            user={{ displayName: 'An', role: 'Quản trị' }}
            onUserMenuSelect={onUserMenuSelect}
          />
          {page}
        </HeaderSlotsProvider>
      ),
    },
  ]);
  render(<RouterProvider router={router} />);
  return { onUserMenuSelect };
}

beforeEach(() => mockViewport(true));

afterEach(() => {
  router?.dispose();
  router = undefined;
  Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia });
});

describe('PhoneTopBar + PageHeader', () => {
  it('trang có PageHeader: tên + dòng phụ vào top bar, tab giữ nguyên chức năng (aria-current, bấm chọn)', () => {
    const onSelect = vi.fn();
    renderBar(
      <PageHeader
        nav={{ items: NAV_ITEMS, active: 'progress', onSelect }}
        subtitle="DEMO"
        title="Gói thầu xây lắp"
      />,
    );

    const bar = screen.getByRole('banner');
    expect(within(bar).getByText('Gói thầu xây lắp')).toBeInTheDocument();
    expect(within(bar).getByText('DEMO')).toBeInTheDocument();
    expect(within(bar).getByRole('button', { name: 'Tiến độ' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(bar).getByRole('link', { name: 'Nghiệm thu' })).toHaveAttribute(
      'href',
      '/acceptance',
    );

    fireEvent.click(within(bar).getByRole('button', { name: 'Gói thầu' }));
    expect(onSelect).toHaveBeenCalledWith('packages');
  });

  it('nút quay lại của trang vào top bar, có tên truy cập và gọi onBack', () => {
    const onBack = vi.fn();
    renderBar(<PageHeader backLabel="Về danh sách" title="Chi tiết" onBack={onBack} />);

    fireEvent.click(
      within(screen.getByRole('banner')).getByRole('button', { name: 'Về danh sách' }),
    );

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('trang không có PageHeader: top bar hiện tên dự phòng', () => {
    renderBar();

    expect(within(screen.getByRole('banner')).getByText('Tên dự phòng')).toBeInTheDocument();
  });

  it('không phải điện thoại: PageHeader giữ dạng laptop — không bơm gì vào top bar (tên lên khối giữa của Header)', () => {
    mockViewport(false);
    renderBar(
      <PageHeader
        nav={{ items: NAV_ITEMS, active: 'packages', onSelect: vi.fn() }}
        title="Gói thầu xây lắp"
      />,
    );

    const bar = screen.getByRole('banner');
    expect(bar.lastElementChild).toBeEmptyDOMElement();
    expect(within(bar).queryByText('Gói thầu xây lắp')).toBeNull();
  });
});

describe('PhoneTopBar — menu tài khoản thành sheet đáy', () => {
  it('avatar mở sheet có nút Đóng; không có mục "Kiểu header"; chọn mục đóng sheet rồi báo app', async () => {
    const { onUserMenuSelect } = renderBar();

    fireEvent.click(screen.getByRole('button', { name: 'Menu người dùng' }));
    const sheet = await screen.findByRole('dialog', { name: 'Tài khoản' });

    expect(within(sheet).getByRole('button', { name: 'Đóng' })).toBeInTheDocument();
    expect(within(sheet).queryByText(/Kiểu header/)).not.toBeInTheDocument();
    expect(within(sheet).getByText('An')).toBeInTheDocument();

    fireEvent.click(within(sheet).getByRole('button', { name: /Cài đặt/ }));

    expect(onUserMenuSelect).toHaveBeenCalledWith('settings');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Esc đóng sheet', async () => {
    renderBar();

    fireEvent.click(screen.getByRole('button', { name: 'Menu người dùng' }));
    const sheet = await screen.findByRole('dialog', { name: 'Tài khoản' });
    fireEvent.keyDown(sheet, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

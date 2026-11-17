/**
 * Vỏ ứng dụng theo cỡ màn (`AppShellLayout` + `app/shell`): điện thoại → top bar phẳng + thanh tab đáy dựng từ
 * module registry; laptop / tablet → Header + Dock như cũ.
 *
 * Danh sách ô của thanh tab đi từ registry (Trang chủ + phân hệ đã lọc quyền), không hardcode nghiệp vụ. jsdom không
 * dựng layout — chiều cao thanh, vùng chạm, che nội dung kiểm bằng trình duyệt thật (`responsive-screens.md §6`).
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShellLayout } from '@/app/layouts';
import { PHONE_MEDIA_QUERY } from '@/shared/constants/media-query.constants';
import { useDockSettingsStore } from '@/shared/widgets/dock';

vi.mock('@/app/router/modules', async () => {
  const { lazyPage } = await import('@/app/router/definition');
  const moduleOf = (id: string, path: string, title: string) => ({
    id,
    path,
    permission: 'authenticated',
    meta: { title, icon: 'chart-line-outline' },
    children: [{ index: true, page: lazyPage(() => Promise.resolve({ default: () => null })) }],
  });
  return {
    MODULE_REGISTRY: [
      moduleOf('report', '/reports', 'Báo cáo'),
      moduleOf('ledger', '/ledger', 'Sổ cái'),
    ],
    getRoutePath: () => undefined,
  };
});

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

let router: ReturnType<typeof createMemoryRouter> | undefined;

function renderShell(path: string) {
  router = createMemoryRouter(
    [
      {
        element: <AppShellLayout />,
        children: [
          { path: '/', element: <p>Trang chủ nội dung</p>, handle: { title: 'Trang chủ' } },
          { path: '/reports', element: <p>Báo cáo nội dung</p>, handle: { title: 'Báo cáo' } },
        ],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
}

beforeEach(() => {
  useDockSettingsStore.setState(useDockSettingsStore.getInitialState(), true);
});

afterEach(() => {
  router?.dispose();
  router = undefined;
  Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia });
});

describe('AppShellLayout — điện thoại', () => {
  beforeEach(() => mockViewport(true));

  it('top bar phẳng thay Header, thanh tab đáy thay Dock; vùng nội dung vẫn là <main>', () => {
    renderShell('/');

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Dock' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('main')).getByText('Trang chủ nội dung')).toBeInTheDocument();
  });

  it('thanh tab dựng từ registry: Trang chủ rồi các phân hệ, mục đang mở có aria-current="page"', () => {
    renderShell('/reports');

    const bar = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(
      within(bar)
        .getAllByRole('link')
        .map((link) => link.getAttribute('aria-label')),
    ).toEqual(['Trang chủ', 'Báo cáo', 'Sổ cái']);
    expect(within(bar).getByRole('link', { name: 'Báo cáo' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(bar).getByRole('link', { name: 'Trang chủ' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('top bar hiện tên route đang mở (meta.title) khi trang không có PageHeader', () => {
    renderShell('/reports');

    expect(within(screen.getByRole('banner')).getByText('Báo cáo')).toBeInTheDocument();
  });

  it('menu tài khoản trên điện thoại có mục đổi giao diện (nút theme rời của Header không còn)', async () => {
    renderShell('/');

    fireEvent.click(screen.getByRole('button', { name: 'Menu người dùng' }));

    expect(await screen.findByRole('button', { name: /Giao diện (sáng|tối)/ })).toBeInTheDocument();
  });
});

describe('AppShellLayout — laptop / tablet', () => {
  beforeEach(() => mockViewport(false));

  it('giữ Header + Dock, không có thanh tab đáy', () => {
    renderShell('/');

    expect(screen.getByRole('navigation', { name: 'Dock' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).not.toBeInTheDocument();
  });
});

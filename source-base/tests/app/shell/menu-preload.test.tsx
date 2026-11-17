/**
 * Dock và bảng lệnh (`app/shell`) NẠP TRƯỚC trang đích khi người dùng có ý định mở (rê chuột, focus,
 * mục được tô sáng) — `MenuItem.preload` dựng từ `lazyPage().preload()`.
 *
 * Giữ hai điều: rê đi rê lại vẫn chỉ tải MỘT lần (cùng lượt tải mà `React.lazy` dùng khi mở trang), và
 * không có gì được nạp trước khi người dùng chưa đụng tới mục nào (không tải hàng loạt lúc khởi động).
 * Lượt tải được nhớ suốt vòng đời trang, nên mỗi bài kiểm dùng MỘT phân hệ giả của riêng nó.
 */

import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MODULE_REGISTRY } from '@/app/router/modules';
import { buildModuleRoutes } from '@/app/router/setup';
import AppCommandPalette from '@/app/shell/AppCommandPalette';
import AppDock from '@/app/shell/AppDock';
import { useCommandPaletteStore } from '@/shared/widgets/command-palette';
import { useDockSettingsStore } from '@/shared/widgets/dock';

const loaders = vi.hoisted(() => {
  const pageOf = (text: string) => () => Promise.resolve({ default: () => <p>{text}</p> });
  return {
    report: vi.fn(pageOf('Trang báo cáo')),
    ledger: vi.fn(pageOf('Trang sổ cái')),
    audit: vi.fn(pageOf('Trang nhật ký')),
  };
});

vi.mock('@/app/router/modules', async () => {
  const { lazyPage } = await import('@/app/router/definition');
  const moduleOf = (id: keyof typeof loaders, path: string, title: string) => ({
    id,
    path,
    permission: 'authenticated',
    meta: { title, icon: 'chart-line-outline' },
    children: [{ index: true, page: lazyPage(loaders[id]) }],
  });
  return {
    MODULE_REGISTRY: [
      moduleOf('report', '/reports', 'Báo cáo'),
      moduleOf('ledger', '/ledger', 'Sổ cái'),
      moduleOf('audit', '/audit', 'Nhật ký'),
    ],
    getRoutePath: () => undefined,
  };
});

let router: ReturnType<typeof createMemoryRouter> | undefined;

/** Shell + `<Outlet />` chứa route thật của các phân hệ giả — mở trang là `React.lazy` chạy thật. */
function renderShell(shell: React.ReactElement) {
  router = createMemoryRouter(
    [
      {
        element: (
          <>
            {shell}
            <Outlet />
          </>
        ),
        children: [{ path: '/', element: null }, ...buildModuleRoutes(MODULE_REGISTRY)],
      },
    ],
    { initialEntries: ['/'] },
  );
  render(<RouterProvider router={router} />);
}

beforeEach(() => {
  useDockSettingsStore.setState(useDockSettingsStore.getInitialState(), true);
});

afterEach(() => {
  act(() => useCommandPaletteStore.getState().close());
  router?.dispose();
  router = undefined;
});

describe('AppDock — nạp trước trang khi rê chuột / focus', () => {
  it('chưa đụng tới mục nào → không nạp trước gì', () => {
    renderShell(<AppDock />);

    expect(screen.getByRole('link', { name: 'Báo cáo' })).toBeInTheDocument();
    expect(loaders.report).not.toHaveBeenCalled();
    expect(loaders.ledger).not.toHaveBeenCalled();
    expect(loaders.audit).not.toHaveBeenCalled();
  });

  it('⛔ rê vào mục Dock (nhiều lần) → loader của trang đích chạy ĐÚNG MỘT lần', () => {
    renderShell(<AppDock />);
    const item = screen.getByRole('link', { name: 'Báo cáo' });

    fireEvent.pointerEnter(item);
    fireEvent.pointerLeave(item);
    fireEvent.pointerEnter(item);

    expect(loaders.report).toHaveBeenCalledTimes(1);
  });

  it('focus bằng bàn phím cũng nạp trước; mở trang sau đó KHÔNG tải lại lần nữa', async () => {
    renderShell(<AppDock />);
    const item = screen.getByRole('link', { name: 'Sổ cái' });

    fireEvent.focus(item);
    expect(loaders.ledger).toHaveBeenCalledTimes(1);

    fireEvent.click(item);

    expect(await screen.findByText('Trang sổ cái')).toBeInTheDocument();
    expect(loaders.ledger).toHaveBeenCalledTimes(1);
  });
});

describe('AppCommandPalette — nạp trước mục được tô sáng', () => {
  it('phím ↓ đi qua mục phân hệ → nạp trước mục đó đúng một lần', async () => {
    act(() => useCommandPaletteStore.getState().open());
    renderShell(<AppCommandPalette />);
    const input = await screen.findByRole('textbox');
    expect(loaders.audit).not.toHaveBeenCalled();

    for (let i = 0; i < 9; i += 1) fireEvent.keyDown(input, { key: 'ArrowDown' });
    for (let i = 0; i < 9; i += 1) fireEvent.keyDown(input, { key: 'ArrowUp' });

    await waitFor(() => expect(loaders.audit).toHaveBeenCalledTimes(1));
  });
});

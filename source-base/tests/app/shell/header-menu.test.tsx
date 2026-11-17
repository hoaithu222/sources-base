/**
 * `AppHeader` (`app/shell`) — menu tài khoản do tầng app gắn vào Header dùng chung:
 *
 *  - "Cài đặt" mở trang hiển thị; base không có mục đổi mật khẩu giả.
 *  - "Ẩn / Hiện thanh Dock" gắn qua `extraMenuOptions` vẫn đổi được chế độ Dock — widget Header
 *    KHÔNG import store của Dock (nối chéo widget là việc của `app/shell`).
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import SettingsPage from '@/app/pages/SettingsPage';
import AppHeader from '@/app/shell/AppHeader';
import { useDisplayStore, useThemeStore } from '@/domains/preferences';
import { useSessionStore } from '@/domains/session';
import { useDockSettingsStore } from '@/shared/widgets/dock';
import { HeaderSlotsProvider } from '@/shared/widgets/header';
import { HEADER_SKIN_ORDER, useHeaderSkinStore } from '@/shared/widgets/header/header-skin.store';
import { HEADER_SKIN_LABEL } from '@/shared/widgets/header/user-menu/user-menu.constants';

let router: ReturnType<typeof createMemoryRouter> | undefined;

const openUserMenu = () =>
  fireEvent.keyDown(screen.getByRole('button', { name: 'Menu người dùng' }), { key: 'Enter' });

describe('menu tài khoản của app', () => {
  beforeEach(() => {
    useDisplayStore.setState(useDisplayStore.getInitialState(), true);
    useThemeStore.setState(useThemeStore.getInitialState(), true);
    useSessionStore.setState({ ...useSessionStore.getInitialState(), status: 'anonymous' }, true);
  });

  afterEach(() => router?.dispose());

  it('Cài đặt mở trang hiển thị; base không có mục đổi mật khẩu giả', async () => {
    router = createMemoryRouter([
      {
        path: '/',
        element: (
          <HeaderSlotsProvider>
            <AppHeader />
            <Outlet />
          </HeaderSlotsProvider>
        ),
        children: [
          { index: true, element: <div>Trang chủ</div> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ]);
    render(<RouterProvider router={router} />);
    openUserMenu();
    const settings = await screen.findByRole('menuitem', { name: /Cài đặt/ });
    expect(screen.queryByRole('menuitem', { name: /Đổi mật khẩu/ })).not.toBeInTheDocument();
    fireEvent.click(settings);
    expect(await screen.findByRole('heading', { name: 'Cài đặt' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/settings');
  });
});

describe('AppHeader — mục "Ẩn / Hiện thanh Dock" gắn từ tầng app', () => {
  afterEach(() => {
    router?.dispose();
    useDockSettingsStore.setState(useDockSettingsStore.getInitialState(), true);
    localStorage.clear();
  });

  it('chọn "Ẩn thanh Dock" → chế độ `hidden`; chọn lại → về mặc định', async () => {
    useDockSettingsStore.setState({ mode: 'collapsed' });
    router = createMemoryRouter([
      {
        path: '/',
        element: (
          <HeaderSlotsProvider>
            <AppHeader />
          </HeaderSlotsProvider>
        ),
      },
    ]);
    render(<RouterProvider router={router} />);

    openUserMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Ẩn thanh Dock/ }));
    expect(useDockSettingsStore.getState().mode).toBe('hidden');

    openUserMenu();
    fireEvent.click(await screen.findByRole('menuitem', { name: /Hiện thanh Dock/ }));
    expect(useDockSettingsStore.getState().mode).toBe('pinned');
  });
});

describe('AppHeader — chọn kiểu header trong menu người dùng', () => {
  afterEach(() => {
    router?.dispose();
    useHeaderSkinStore.setState(useHeaderSkinStore.getInitialState(), true);
    localStorage.clear();
  });

  const renderHeader = () => {
    router = createMemoryRouter([
      {
        path: '/',
        element: (
          <HeaderSlotsProvider>
            <AppHeader />
          </HeaderSlotsProvider>
        ),
      },
    ]);
    render(<RouterProvider router={router} />);
  };

  const openSubmenu = async (name: RegExp) => {
    openUserMenu();
    fireEvent.keyDown(await screen.findByRole('menuitem', { name }), { key: 'ArrowRight' });
  };

  it('menu chỉ có MỘT submenu kiểu header ("Kiểu header"), KHÔNG còn mục "Bố cục header"; mặc định chọn Khay', async () => {
    renderHeader();

    openUserMenu();
    expect(await screen.findByRole('menuitem', { name: /Kiểu header/ })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Bố cục/ })).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('menuitem', { name: /Kiểu header/ }), { key: 'ArrowRight' });

    expect(await screen.findByRole('menuitemradio', { name: 'Khay' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    const labels = screen.getAllByRole('menuitemradio').map((item) => item.textContent);
    expect(labels).toEqual(HEADER_SKIN_ORDER.map((skin) => HEADER_SKIN_LABEL[skin]));
    expect(labels).toHaveLength(15);
    const previews = screen
      .getAllByRole('menuitemradio')
      .map((item) => item.querySelector('[data-skin-preview]')?.getAttribute('data-skin-preview'));
    expect(previews).toEqual([...HEADER_SKIN_ORDER]);
    expect(labels).not.toContain('Viên');
    expect(labels).not.toContain('Ngoặc');
  });

  it.each(
    HEADER_SKIN_ORDER.filter((skin) => skin !== 'tray').map(
      (skin) => [HEADER_SKIN_LABEL[skin], skin] as const,
    ),
  )('chọn kiểu khung "%s" → <header data-skin="%s"> và lưu vào store', async (label, skin) => {
    renderHeader();
    expect(screen.getByRole('banner')).toHaveAttribute('data-skin', 'tray');

    await openSubmenu(/Kiểu header/);
    fireEvent.click(await screen.findByRole('menuitemradio', { name: label }));

    expect(useHeaderSkinStore.getState().skin).toBe(skin);
    expect(screen.getByRole('banner')).toHaveAttribute('data-skin', skin);
  });
});

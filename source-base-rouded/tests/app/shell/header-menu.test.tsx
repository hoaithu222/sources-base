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
import {
  HEADER_APPEARANCE_LABEL,
  HEADER_APPEARANCE_ORDER,
  useHeaderAppearanceStore,
} from '@/shared/widgets/header/chrome/header-appearance.store';

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
    useHeaderAppearanceStore.setState(useHeaderAppearanceStore.getInitialState(), true);
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

  const openSubmenu = async () => {
    openUserMenu();
    fireEvent.keyDown(await screen.findByRole('menuitem', { name: /Kiểu header/ }), {
      key: 'ArrowRight',
    });
  };

  it('submenu "Kiểu header" có đúng hai kiểu (gradient thương hiệu · kính mờ), mặc định chọn thương hiệu', async () => {
    renderHeader();
    expect(screen.getByRole('banner')).toHaveAttribute('data-appearance', 'brand');

    await openSubmenu();

    const labels = screen.getAllByRole('menuitemradio').map((item) => item.textContent);
    expect(labels).toEqual(HEADER_APPEARANCE_ORDER.map((key) => HEADER_APPEARANCE_LABEL[key]));
    expect(
      await screen.findByRole('menuitemradio', { name: HEADER_APPEARANCE_LABEL.brand }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('chọn "Kính mờ" → <header data-appearance="glass"> và lưu vào store', async () => {
    renderHeader();

    await openSubmenu();
    fireEvent.click(
      await screen.findByRole('menuitemradio', { name: HEADER_APPEARANCE_LABEL.glass }),
    );

    expect(useHeaderAppearanceStore.getState().appearance).toBe('glass');
    expect(screen.getByRole('banner')).toHaveAttribute('data-appearance', 'glass');
  });
});

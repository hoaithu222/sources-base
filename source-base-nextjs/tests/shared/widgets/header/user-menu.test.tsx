/**
 * Menu người dùng ở mép phải thanh header (`user-menu`): danh sách mục theo ngôn ngữ (`useUserMenuOptions`), mục "Giao diện tối /
 * sáng" (`themeMenuOption` nhận nhãn đã dịch), submenu "Kiểu header" đọc / ghi store cục bộ, khoá lạ không chạm store.
 */

import { act, fireEvent, renderHook, screen } from '@testing-library/react';
import { isValidElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { MenuOption } from '@/shared/ui';
import { useHeaderAppearanceStore } from '@/shared/widgets/header/chrome/header-appearance.store';
import { UserMenu } from '@/shared/widgets/header/user-menu';
import {
  themeMenuOption,
  useUserMenuOptions,
} from '@/shared/widgets/header/user-menu/useUserMenuOptions';
import { IntlWrapper, renderWithIntl } from '@tests/helpers/render';

afterEach(() => {
  act(() => {
    useHeaderAppearanceStore.setState(useHeaderAppearanceStore.getInitialState(), true);
  });
});

const wrapperFor = (locale: 'vi' | 'en') =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <IntlWrapper locale={locale}>{children}</IntlWrapper>;
  };

/** Nhãn dạng chuỗi của một mục (mục kiểu header có nhãn là phần tử React, không phải chuỗi). */
const labelsOf = (options: readonly MenuOption[]) =>
  options.map((option) => (typeof option.label === 'string' ? option.label : option.key));

describe('themeMenuOption', () => {
  const labels = { dark: 'Chuyển giao diện tối', light: 'Chuyển giao diện sáng' };

  it('đang sáng → mục mang nhãn "sang tối" + icon trăng; bấm gọi onToggle', () => {
    const onToggle = vi.fn();
    const option = themeMenuOption('light', onToggle, labels);

    expect(option).toMatchObject({ key: 'theme-toggle', label: labels.dark });
    expect(isValidElement(option.icon)).toBe(true);
    expect((option.icon as { props: { name: string } }).props.name).toBe('moon-bold');

    option.onSelect();
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('đang tối → nhãn "sang sáng" + icon mặt trời', () => {
    const option = themeMenuOption('dark', vi.fn(), labels);

    expect(option.label).toBe(labels.light);
    expect((option.icon as { props: { name: string } }).props.name).toBe('sun-bold');
  });
});

describe('useUserMenuOptions', () => {
  const render = (
    params: Parameters<typeof useUserMenuOptions>[0] = {},
    locale: 'vi' | 'en' = 'vi',
  ) => renderHook(() => useUserMenuOptions(params), { wrapper: wrapperFor(locale) });

  it('thứ tự: hồ sơ · cài đặt · mục thêm · "Kiểu header" · đăng xuất (luôn CUỐI); chữ theo ngôn ngữ', () => {
    const extra = [{ key: 'hide-dock', label: 'Ẩn Dock', onSelect: vi.fn() }];

    const vi_ = render({ extraOptions: extra }).result.current.options;
    expect(labelsOf(vi_)).toEqual([
      'Hồ sơ cá nhân',
      'Cài đặt',
      'Ẩn Dock',
      'Kiểu header',
      'Đăng xuất',
    ]);
    expect(vi_.at(-1)?.danger).toBe(true);

    const en = render({ extraOptions: extra }, 'en').result.current.options;
    expect(labelsOf(en)).toEqual(['My profile', 'Settings', 'Ẩn Dock', 'Header style', 'Sign out']);
  });

  it('submenu "Kiểu header": mỗi kiểu một dòng khoá `appearance:<kiểu>`, kiểu đang dùng có dấu ✓', () => {
    const { result } = render();
    const submenu = result.current.options.find((option) => option.key === 'header-appearance');

    expect(submenu?.children?.map((child) => [child.key, child.checked])).toEqual([
      ['appearance:brand', true],
      ['appearance:glass', false],
    ]);

    act(() => useHeaderAppearanceStore.getState().setAppearance('glass'));

    const after = result.current.options.find((option) => option.key === 'header-appearance');
    expect(after?.children?.map((child) => child.checked)).toEqual([false, true]);
  });

  it('điện thoại: không có submenu "Kiểu header"', () => {
    const { result } = render({ phone: true });

    expect(result.current.options.map((option) => option.key)).toEqual([
      'profile',
      'settings',
      'logout',
    ]);
  });

  it('handleSelect: kiểu header ghi thẳng store, KHÔNG báo app', () => {
    const onSelect = vi.fn();
    const { result } = render({ onSelect });

    act(() => result.current.handleSelect('appearance:glass'));

    expect(useHeaderAppearanceStore.getState().appearance).toBe('glass');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('⛔ khoá kiểu lạ (`appearance:neon`) không chạm store và không lọt ra app', () => {
    const onSelect = vi.fn();
    const { result } = render({ onSelect });

    act(() => result.current.handleSelect('appearance:neon'));

    expect(useHeaderAppearanceStore.getState().appearance).toBe('brand');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('handleSelect: mục thêm chạy handler riêng; key tĩnh gọi `onSelect(key)`; key lạ bị bỏ qua', () => {
    const onSelect = vi.fn();
    const hide = vi.fn();
    const { result } = render({
      onSelect,
      extraOptions: [{ key: 'hide-dock', label: 'Ẩn Dock', onSelect: hide }],
    });

    act(() => result.current.handleSelect('hide-dock'));
    expect(hide).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();

    act(() => result.current.handleSelect('logout'));
    expect(onSelect).toHaveBeenCalledWith('logout');

    act(() => result.current.handleSelect('khong-ton-tai'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('UserMenu', () => {
  it.each([
    ['vi', 'Khách'],
    ['en', 'Guest'],
  ] as const)('không có `user` → tên dự phòng theo ngôn ngữ %s', (locale, guest) => {
    renderWithIntl(<UserMenu />, { locale });

    expect(screen.getByText(guest)).toBeInTheDocument();
  });

  it.each([
    ['vi', 'Menu người dùng', 'Hồ sơ cá nhân', 'Cài đặt', 'Đăng xuất'],
    ['en', 'User menu', 'My profile', 'Settings', 'Sign out'],
  ] as const)(
    'mở menu (%s): đủ mục tĩnh; chọn "Cài đặt" báo app',
    (locale, triggerName, profile, settings, logout) => {
      const onSelect = vi.fn();
      renderWithIntl(
        <UserMenu user={{ displayName: 'An', role: 'Quản trị' }} onSelect={onSelect} />,
        {
          locale,
        },
      );

      const trigger = screen.getByRole('button', { name: triggerName });
      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
      fireEvent.click(trigger);

      expect(screen.getByRole('menuitem', { name: profile })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: logout })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('menuitem', { name: settings }));
      expect(onSelect).toHaveBeenCalledWith('settings');
    },
  );
});

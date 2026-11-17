/**
 * `Menu` — submenu (`children`) + lựa chọn đơn (`checked`), dùng cho cài đặt nhỏ kiểu "chọn một trong vài dạng"
 * (vd kiểu header trong menu người dùng).
 *
 * Giữ: mục có `children` là SUBMENU (`aria-haspopup`, mở bằng phím →, KHÔNG phát `onSelect`); mục `checked` là
 * `menuitemradio` với `aria-checked` đúng, chỉ mục `checked` có dấu ✓; chọn một mục lá phát `onSelect(option)`; danh sách
 * không có `checked` vẫn là `menuitem` thường (không đổi hành vi cũ).
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Menu, type MenuOption } from '@/shared/ui';

const OPTIONS: MenuOption[] = [
  { key: 'edit', label: 'Sửa' },
  {
    key: 'view',
    label: 'Hiển thị',
    children: [
      { key: 'view:card', label: 'Thẻ', checked: true },
      { key: 'view:list', label: 'Danh sách', checked: false },
    ],
  },
];

function openMenu(onSelect = vi.fn()) {
  render(
    <Menu options={OPTIONS} trigger={<button type="button">Mở</button>} onSelect={onSelect} />,
  );
  fireEvent.keyDown(screen.getByRole('button', { name: 'Mở' }), { key: 'Enter' });
  return onSelect;
}

const openSubmenu = async () => {
  const trigger = await screen.findByRole('menuitem', { name: /Hiển thị/ });
  fireEvent.keyDown(trigger, { key: 'ArrowRight' });
  return trigger;
};

describe('Menu — submenu + lựa chọn đơn', () => {
  it('mục có `children` là submenu: `aria-haspopup`, mở bằng phím →, hiện đúng nhóm radio', async () => {
    openMenu();

    const trigger = await openSubmenu();

    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    const radios = await screen.findAllByRole('menuitemradio');
    expect(radios.map((radio) => radio.textContent)).toEqual(['Thẻ', 'Danh sách']);
  });

  it('chỉ mục `checked` có `aria-checked="true"` và dấu ✓', async () => {
    openMenu();
    await openSubmenu();

    const current = await screen.findByRole('menuitemradio', { name: 'Thẻ' });
    const other = screen.getByRole('menuitemradio', { name: 'Danh sách' });

    expect(current).toHaveAttribute('aria-checked', 'true');
    expect(other).toHaveAttribute('aria-checked', 'false');
    expect(current.querySelector('svg')).not.toBeNull();
    expect(other.querySelector('svg')).toBeNull();
  });

  it('chọn mục lá phát `onSelect(option)` với đúng khoá; mở submenu KHÔNG phát gì', async () => {
    const onSelect = openMenu();
    await openSubmenu();
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Danh sách' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({ key: 'view:list' });
  });

  it('danh sách không có `checked` vẫn là `menuitem` thường, không có nhóm radio', async () => {
    const onSelect = openMenu();

    const menu = await screen.findByRole('menu');
    fireEvent.click(within(menu).getByRole('menuitem', { name: 'Sửa' }));

    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: 'edit' }));
    expect(screen.queryAllByRole('menuitemradio')).toEqual([]);
  });
});

/**
 * CommandPalette — hộp thoại tìm nhanh toàn cục (⌘K).
 *
 * Năm điều bài kiểm này khoá lại:
 *  1. Đóng mặc định — không bật `isOpen` từ ngoài thì không render nội dung
 *     (Radix `Dialog.Content` không mount khi `open=false`).
 *  2. Mở qua store thì thấy đúng danh sách `groups` truyền vào.
 *  3. Gõ tìm kiếm BỎ DẤU vẫn lọc đúng (`matchesSearch`) — cùng lớp kiểm
 *     "gõ không dấu vẫn ra kết quả" mà `docs/rules/interaction/search-matching.md` yêu cầu.
 *  4. Bấm một mục lệnh thì gọi `onSelect` VÀ tự đóng hộp thoại.
 *  5. Mục có `href` là LIÊN KẾT THẬT (`navigable-controls.md`): bấm → đổi URL + tự đóng; Enter cũng vậy.
 *  6. `onIntent` (tuỳ chọn) chạy khi mục được tô sáng — phím ↑ ↓, rê chuột, focus — để tầng app nạp
 *     trước trang đích; mục không khai `onIntent` vẫn chạy như cũ.
 *
 * ⚠️ Mở store TRƯỚC `render()` (không phải sau): mount thẳng ở trạng thái mở
 * tránh phải chạy qua transition đóng→mở của Radix `Presence` giữa lúc test
 * đang chạy — thứ hay kêu "not wrapped in act(...)" trong jsdom vì animation
 * thật không tồn tại ở đó.
 */
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CommandPalette, useCommandPaletteStore } from '@/shared/widgets/command-palette';
import type { CommandPaletteGroup } from '@/shared/widgets/command-palette';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { renderInRouter } from '@tests/helpers/render';

const renderPalette = (element: ReactElement, locale?: 'vi' | 'en') =>
  renderInRouter(element, { locale });

function makeGroups(onSelectHome: () => void, onSelectSettings: () => void): CommandPaletteGroup[] {
  return [
    {
      label: 'Điều hướng chung',
      items: [
        { id: 'home', label: 'Trang chủ', icon: 'house-outline', onSelect: onSelectHome },
        { id: 'settings', label: 'Cài đặt', icon: 'gear-outline', onSelect: onSelectSettings },
        { id: 'demo', label: 'Đông Đô Plaza', icon: 'grid-2-outline', onSelect: vi.fn() },
      ],
    },
  ];
}

const LINK_GROUPS: CommandPaletteGroup[] = [
  {
    label: 'Điều hướng chung',
    items: [{ id: 'settings', label: 'Cài đặt', icon: 'gear-outline', href: '/settings' }],
  },
];

describe('CommandPalette', () => {
  afterEach(() => {
    act(() => useCommandPaletteStore.getState().close());
  });

  it('không render khi store đóng', () => {
    renderPalette(<CommandPalette groups={makeGroups(vi.fn(), vi.fn())} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('mở qua store thì hiện danh sách groups', async () => {
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={makeGroups(vi.fn(), vi.fn())} />);

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
  });

  it('có nút Đóng cho tablet / điện thoại (hiện bằng CSS, Esc vẫn đóng); huy hiệu Esc và dải phím ẩn ở máy chạm', async () => {
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={makeGroups(vi.fn(), vi.fn())} />);
    const dialog = await screen.findByRole('dialog');

    const close = within(dialog).getByRole('button', { name: 'Đóng' });
    expect(close).toHaveClass('max-lg:flex', 'touch:flex');
    expect(within(dialog).getByText('Esc')).toHaveClass('max-lg:hidden', 'touch:hidden');
    expect(within(dialog).getByText('di chuyển').parentElement).toHaveClass(
      'max-lg:hidden',
      'touch:hidden',
    );

    fireEvent.click(close);
    await waitFor(() => expect(useCommandPaletteStore.getState().isOpen).toBe(false));
  });

  it('gõ không dấu vẫn lọc ra mục có dấu (matchesSearch)', async () => {
    const user = userEvent.setup();
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={makeGroups(vi.fn(), vi.fn())} />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.type(screen.getByRole('textbox'), 'dong do');

    expect(screen.getByText('Đông Đô Plaza')).toBeInTheDocument();
    expect(screen.queryByText('Trang chủ')).not.toBeInTheDocument();
  });

  it('bấm một mục lệnh thì gọi onSelect và tự đóng', async () => {
    const user = userEvent.setup();
    const onSelectHome = vi.fn();
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={makeGroups(onSelectHome, vi.fn())} />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.click(screen.getByText('Trang chủ'));

    expect(onSelectHome).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(useCommandPaletteStore.getState().isOpen).toBe(false));
  });

  it('đóng bằng Esc trả focus về phần tử đã giữ focus lúc mở (mở qua store nên Radix không tự trả)', async () => {
    const user = userEvent.setup();
    renderPalette(
      <>
        <button type="button">Nút mở</button>
        <CommandPalette groups={makeGroups(vi.fn(), vi.fn())} />
      </>,
    );
    const opener = screen.getByRole('button', { name: 'Nút mở' });
    opener.focus();

    act(() => useCommandPaletteStore.getState().open());
    await screen.findByRole('dialog');
    expect(screen.getByRole('textbox')).toHaveFocus();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(opener).toHaveFocus();
  });

  it('mục có href là liên kết thật: bấm thì đổi URL và tự đóng', async () => {
    const user = userEvent.setup();
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={LINK_GROUPS} />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    const link = screen.getByRole('link', { name: /Cài đặt/ });
    expect(link).toHaveAttribute('href', '/settings');

    await user.click(link);

    expect(navigationMock.push).toHaveBeenCalledWith('/settings');
    await waitFor(() => expect(useCommandPaletteStore.getState().isOpen).toBe(false));
  });

  it('Enter trên mục có href cũng điều hướng', async () => {
    const user = userEvent.setup();
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={LINK_GROUPS} />);
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    await user.type(screen.getByRole('textbox'), '{Enter}');

    expect(navigationMock.push).toHaveBeenCalledWith('/settings');
  });

  it('⛔ ↓ khi không có kết quả rồi gõ lại có kết quả → mục đầu vẫn được tô sáng', async () => {
    const user = userEvent.setup();
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={makeGroups(vi.fn(), vi.fn())} />);
    const input = await screen.findByRole('textbox');

    await user.type(input, 'khong co muc nao');
    await user.keyboard('{ArrowDown}');
    await user.clear(input);

    expect(screen.getByRole('button', { name: /Trang chủ/ })).toHaveAttribute('data-highlighted');
  });

  it('`onIntent` chạy khi mục được tô sáng: mở (mục đầu), phím ↓, rê chuột, focus', async () => {
    const intents = { home: vi.fn(), settings: vi.fn(), plain: vi.fn() };
    const groups: CommandPaletteGroup[] = [
      {
        label: 'Điều hướng chung',
        items: [
          {
            id: 'home',
            label: 'Trang chủ',
            icon: 'house-outline',
            href: '/',
            onIntent: intents.home,
          },
          {
            id: 'settings',
            label: 'Cài đặt',
            icon: 'gear-outline',
            href: '/settings',
            onIntent: intents.settings,
          },
          { id: 'plain', label: 'Không nạp trước', icon: 'grid-2-outline', onSelect: vi.fn() },
        ],
      },
    ];
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={groups} />);
    await waitFor(() => expect(intents.home).toHaveBeenCalledTimes(1));
    expect(intents.settings).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'ArrowDown' });
    await waitFor(() => expect(intents.settings).toHaveBeenCalledTimes(1));

    fireEvent.mouseEnter(screen.getByRole('link', { name: /Trang chủ/ }));
    await waitFor(() => expect(intents.home).toHaveBeenCalledTimes(2));

    fireEvent.focus(screen.getByRole('link', { name: /Cài đặt/ }));
    await waitFor(() => expect(intents.settings).toHaveBeenCalledTimes(2));

    fireEvent.mouseEnter(screen.getByRole('button', { name: /Không nạp trước/ }));
    expect(screen.getByRole('button', { name: /Không nạp trước/ })).toHaveAttribute(
      'data-highlighted',
    );
  });
});

describe('CommandPalette — ngôn ngữ', () => {
  afterEach(() => {
    act(() => useCommandPaletteStore.getState().close());
  });

  it.each([
    ['vi', 'Tìm phân hệ, trang, hành động…', 'Đóng', 'di chuyển'],
    ['en', 'Search modules, pages, actions…', 'Close', 'navigate'],
  ] as const)(
    'chữ mặc định theo ngôn ngữ %s: placeholder, nút đóng, dải phím',
    async (locale, placeholder, closeLabel, hint) => {
      act(() => useCommandPaletteStore.getState().open());
      renderPalette(<CommandPalette groups={LINK_GROUPS} />, locale);
      const dialog = await screen.findByRole('dialog');

      expect(within(dialog).getByPlaceholderText(placeholder)).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: closeLabel })).toBeInTheDocument();
      expect(within(dialog).getByText(hint)).toBeInTheDocument();
    },
  );

  it('`placeholder` truyền vào thắng chữ mặc định', async () => {
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={LINK_GROUPS} placeholder="Tìm tuỳ chỉnh" />);

    expect(await screen.findByPlaceholderText('Tìm tuỳ chỉnh')).toBeInTheDocument();
  });

  it.each([
    ['vi', 'Không tìm thấy kết quả', 'Không có mục nào khớp "zzz".'],
    ['en', 'No results found', 'No items match "zzz".'],
  ] as const)(
    'không khớp mục nào (%s) → EmptyState kèm từ khoá',
    async (locale, title, description) => {
      const user = userEvent.setup();
      act(() => useCommandPaletteStore.getState().open());
      renderPalette(<CommandPalette groups={LINK_GROUPS} />, locale);

      await user.type(await screen.findByRole('textbox'), 'zzz');

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
    },
  );

  it('mục có href ở en đi qua router của next-intl: thêm tiền tố `/en`', async () => {
    const user = userEvent.setup();
    act(() => useCommandPaletteStore.getState().open());
    renderPalette(<CommandPalette groups={LINK_GROUPS} />, 'en');

    const link = await screen.findByRole('link', { name: /Cài đặt/ });
    expect(link).toHaveAttribute('href', '/en/settings');

    await user.click(link);

    expect(navigationMock.push).toHaveBeenCalledWith('/en/settings');
  });
});

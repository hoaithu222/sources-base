/**
 * LỊCH SỬ THẺ LÀM VIỆC (`work-tabs`): store giữ thẻ màn đã mở (không trùng, có giới hạn, ghim đứng đầu, dữ liệu hỏng bị
 * lọc, mốc mở tăng ngặt); luật chia lịch sử (3 thẻ gần nhất luôn gồm màn đang mở); THANH DỌC bám mép trái — 3 ô gần nhất
 * xếp dọc + nút "+N" mở bảng đầy đủ sang phải (lọc bỏ dấu, đóng / ghim từ bảng, phím ↑↓, Ctrl/⌘ + Shift + `]`).
 */

import { act, fireEvent, renderHook, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { splitHistory } from '@/shared/widgets/work-tabs/work-tabs.utils';
import {
  useWorkTabsRailVisible,
  useWorkTabsStore,
  WORK_TABS_LIMIT,
  WorkTabsRail,
} from '@/shared/widgets/work-tabs';
import { navigationMock } from '@tests/helpers/navigation-mock';
import { IntlWrapper, renderInRouter } from '@tests/helpers/render';

const visit = (path: string, title = path) =>
  useWorkTabsStore.getState().visit({ path, search: '', title, icon: 'finance', tone: 'primary' });

const visitAll = (...paths: string[]) => paths.forEach((path) => visit(path, path.slice(1)));

const paths = () => useWorkTabsStore.getState().tabs.map((tab) => tab.path);

function renderRail(pathname: string, locale?: 'vi' | 'en') {
  return renderInRouter(<WorkTabsRail />, { pathname, locale });
}

const rail = () => screen.getByRole('navigation', { name: 'Thẻ đã mở gần đây' });
const moreButton = () => screen.getByRole('button', { name: /^Tất cả thẻ đã mở/ });
const queryPanel = () => screen.queryByRole('group', { name: 'Tất cả thẻ đã mở' });

function openPanel() {
  fireEvent.click(moreButton());
  return screen.getByRole('group', { name: 'Tất cả thẻ đã mở' });
}

const sectionNames = (panel: HTMLElement, name: string) =>
  within(within(panel).getByRole('region', { name }))
    .getAllByRole('link')
    .map((link) => link.textContent);

const pressNextTab = () =>
  fireEvent.keyDown(window, { code: 'BracketRight', key: '}', ctrlKey: true, shiftKey: true });

afterEach(() => {
  vi.useRealTimers();
  useWorkTabsStore.setState(useWorkTabsStore.getInitialState(), true);
  localStorage.clear();
});

describe('work-tabs.store', () => {
  it('mở lại màn đã có thì cập nhật thẻ cũ (tên, query), không thêm thẻ trùng', () => {
    visit('/tai-chinh/so-cai', 'Sổ cái');
    useWorkTabsStore
      .getState()
      .visit({ path: '/tai-chinh/so-cai', search: '?ky=10', title: 'Sổ cái tổng hợp' });
    const { tabs } = useWorkTabsStore.getState();
    expect(tabs).toHaveLength(1);
    expect(tabs[0]).toMatchObject({ title: 'Sổ cái tổng hợp', search: '?ky=10' });
  });

  it(`đủ ${WORK_TABS_LIMIT} thẻ thì bỏ thẻ chưa ghim mở lâu nhất; thẻ ghim không bao giờ bị bỏ`, () => {
    visit('/a');
    useWorkTabsStore.getState().togglePin('/a');
    for (let i = 0; i < WORK_TABS_LIMIT; i += 1) visit(`/m${i}`);
    expect(paths()).toHaveLength(WORK_TABS_LIMIT);
    expect(paths()[0]).toBe('/a');
    expect(paths()).not.toContain('/m0');
  });

  it('ghim đưa thẻ lên đầu; "đóng các thẻ khác" giữ thẻ ghim', () => {
    visitAll('/a', '/b', '/c');
    useWorkTabsStore.getState().togglePin('/c');
    expect(paths()).toEqual(['/c', '/a', '/b']);
    useWorkTabsStore.getState().closeOthers('/a');
    expect(paths()).toEqual(['/c', '/a']);
  });

  it('mốc mở tăng ngặt kể cả khi mở liền nhau trong cùng một ms', () => {
    visitAll('/a', '/b', '/a');
    const [a, b] = useWorkTabsStore.getState().tabs;
    expect(a.visitedAt).toBeGreaterThan(b.visitedAt);
  });

  it('dữ liệu lưu hỏng bị lọc khi nạp lại (migrate)', async () => {
    localStorage.setItem(
      'next-base:work-tabs',
      JSON.stringify({
        state: {
          tabs: [{ path: 1 }, { path: '/ok', title: 'OK', search: '', visitedAt: 1 }],
          enabled: 'x',
        },
        version: 1,
      }),
    );
    await useWorkTabsStore.persist.rehydrate();
    const { tabs, enabled } = useWorkTabsStore.getState();
    expect(tabs.map((tab) => tab.path)).toEqual(['/ok']);
    expect(enabled).toBe(true);
  });
});

describe('splitHistory', () => {
  it('3 thẻ mở gần nhất lên đầu (mới nhất trước); còn lại chia "ghim" / "trước đó", mỗi thẻ đúng một nhóm', () => {
    visitAll('/a', '/b', '/c', '/d', '/e');
    useWorkTabsStore.getState().togglePin('/a');
    const { recent, pinned, earlier } = splitHistory(useWorkTabsStore.getState().tabs, '/e');
    expect(recent.map((tab) => tab.path)).toEqual(['/e', '/d', '/c']);
    expect(pinned.map((tab) => tab.path)).toEqual(['/a']);
    expect(earlier.map((tab) => tab.path)).toEqual(['/b']);
  });

  it('màn đang mở luôn nằm trong 3 thẻ gần nhất (khung hình trước khi `visit` chạy)', () => {
    visitAll('/a', '/b', '/c', '/d');
    const { recent } = splitHistory(useWorkTabsStore.getState().tabs, '/a');
    expect(recent.map((tab) => tab.path)).toEqual(['/a', '/d', '/c']);
  });
});

describe('WorkTabsRail', () => {
  it('chưa có thẻ / setEnabled(false) → không dựng thanh; useWorkTabsRailVisible theo đúng điều kiện đó', () => {
    const { result } = renderHook(() => useWorkTabsRailVisible(), { wrapper: IntlWrapper });
    renderRail('/');
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(result.current).toBe(false);
    act(() => visit('/a'));
    expect(result.current).toBe(true);
    expect(rail()).toBeInTheDocument();
    act(() => useWorkTabsStore.getState().setEnabled(false));
    expect(result.current).toBe(false);
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('thanh đang dựng thì công bố mép dưới ở --work-tabs-rail-bottom trên :root; ẩn thì gỡ', () => {
    const readVar = () =>
      document.documentElement.style.getPropertyValue('--work-tabs-rail-bottom');
    visit('/a');
    renderRail('/a');
    expect(readVar()).toMatch(/^\d+px$/);
    act(() => useWorkTabsStore.getState().setEnabled(false));
    expect(readVar()).toBe('');
  });

  it('thanh xếp DỌC 3 ô gần nhất (mới nhất trên cùng), ô màn đang mở có aria-current; "+N" đếm phần còn lại', () => {
    visitAll('/a', '/b', '/c', '/d', '/e');
    renderRail('/e');
    const links = within(rail()).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual(['e', 'd', 'c']);
    expect(links[0]).toHaveAttribute('aria-current', 'page');
    expect(links[0]).toHaveAttribute('href', '/e');
    expect(links[1]).not.toHaveAttribute('aria-current');
    expect(moreButton()).toHaveAccessibleName('Tất cả thẻ đã mở (5)');
    expect(moreButton()).toHaveTextContent('+2');
  });

  it('nút "+N" mở bảng đầy đủ: "Gần đây" + "Đã ghim" + "Trước đó", thẻ màn đang mở ghi "Đang mở"', () => {
    visitAll('/a', '/b', '/c', '/d', '/e');
    useWorkTabsStore.getState().togglePin('/a');
    renderRail('/e');
    const panel = openPanel();
    expect(moreButton()).toHaveAttribute('aria-expanded', 'true');
    expect(sectionNames(panel, 'Gần đây')).toEqual(['e', 'd', 'c']);
    expect(sectionNames(panel, 'Đã ghim')).toEqual(['a']);
    expect(sectionNames(panel, 'Trước đó')).toEqual(['b']);
    expect(within(panel).getByRole('link', { name: 'e' })).toHaveAttribute('aria-current', 'page');
    expect(within(panel).getByText('Đang mở')).toBeInTheDocument();
  });

  it('> 6 thẻ có ô lọc bỏ dấu (nhận tiêu điểm khi mở): gõ "cong no" chỉ còn thẻ "Công nợ"', () => {
    visit('/tai-chinh/cong-no', 'Công nợ');
    visitAll('/a', '/b', '/c', '/d', '/e', '/f');
    renderRail('/f');
    const panel = openPanel();
    const filter = within(panel).getByRole('textbox', { name: 'Lọc thẻ' });
    expect(filter).toHaveFocus();
    fireEvent.change(filter, { target: { value: 'cong no' } });
    expect(sectionNames(panel, 'Kết quả lọc')).toEqual(['Công nợ']);
  });

  it('đóng thẻ từ bảng: bảng vẫn mở; đóng thẻ màn đang mở → sang thẻ mở gần nhất còn lại', () => {
    visitAll('/a', '/b', '/c');
    renderRail('/c');
    const panel = openPanel();
    fireEvent.click(within(panel).getByRole('button', { name: 'Đóng a' }));
    expect(paths()).toEqual(['/b', '/c']);
    expect(navigationMock.push).not.toHaveBeenCalled();
    fireEvent.click(within(panel).getByRole('button', { name: 'Đóng c' }));
    expect(navigationMock.push).toHaveBeenCalledWith('/b');
    expect(paths()).toEqual(['/b']);
    expect(queryPanel()).toBeInTheDocument();
  });

  it('ghim từ bảng; "Trang chủ" ở chân bảng là liên kết thật', () => {
    visitAll('/a', '/b');
    renderRail('/b');
    const panel = openPanel();
    fireEvent.click(within(panel).getByRole('button', { name: 'Ghim a' }));
    expect(useWorkTabsStore.getState().tabs[0]).toMatchObject({ path: '/a', pinned: true });
    expect(within(panel).getByRole('link', { name: 'Trang chủ' })).toHaveAttribute('href', '/');
  });

  it('↑↓ chuyển tiêu điểm thật qua các dòng của bảng', () => {
    visitAll('/a', '/b', '/c');
    renderRail('/c');
    const panel = openPanel();
    expect(panel).toHaveFocus();
    fireEvent.keyDown(panel, { key: 'ArrowDown' });
    expect(within(panel).getByRole('link', { name: 'c' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowDown' });
    expect(within(panel).getByRole('link', { name: 'b' })).toHaveFocus();
    fireEvent.keyDown(document.activeElement as Element, { key: 'ArrowUp' });
    expect(within(panel).getByRole('link', { name: 'c' })).toHaveFocus();
  });

  it('Ctrl + Shift + ] sang thẻ sau theo thứ tự mở, vòng về "Trang chủ"', () => {
    visitAll('/a', '/b');
    const view = renderRail('/a');
    pressNextTab();
    expect(navigationMock.push).toHaveBeenLastCalledWith('/b');

    navigationMock.setLocation('/b');
    view.rerender(<WorkTabsRail key="/b" />);
    pressNextTab();
    expect(navigationMock.push).toHaveBeenLastCalledWith('/');
  });

  it('rê chuột lên nút "+N" ~150ms thì mở bảng, rời đi thì đóng', () => {
    vi.useFakeTimers();
    visitAll('/a');
    renderRail('/a');
    fireEvent.pointerEnter(moreButton(), { pointerType: 'mouse' });
    expect(queryPanel()).toBeNull();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(queryPanel()).toBeInTheDocument();
    fireEvent.pointerLeave(moreButton(), { pointerType: 'mouse' });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(queryPanel()).toBeNull();
  });
});

describe('WorkTabsRail — ngôn ngữ', () => {
  it('en: nhãn thanh / nút "+N" / bảng theo en; liên kết có tiền tố `/en`; thẻ màn đang mở nhận ra qua đường không tiền tố', () => {
    visitAll('/a', '/b', '/c', '/d');
    renderRail('/en/d', 'en');

    const nav = screen.getByRole('navigation', { name: 'Recently opened tabs' });
    const links = within(nav).getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/en/d');
    expect(links[0]).toHaveAttribute('aria-current', 'page');

    fireEvent.click(screen.getByRole('button', { name: 'All open tabs (4)' }));
    const panel = screen.getByRole('group', { name: 'All open tabs' });
    expect(within(panel).getByText('Current')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Close d' })).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/en');
  });

  it('en: đóng thẻ màn đang mở → `router.push` đi qua next-intl nên đích mang tiền tố `/en`', () => {
    visitAll('/a', '/b');
    renderRail('/en/b', 'en');

    fireEvent.click(screen.getByRole('button', { name: 'All open tabs (2)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close b' }));

    expect(navigationMock.push).toHaveBeenCalledWith('/en/a');
  });
});

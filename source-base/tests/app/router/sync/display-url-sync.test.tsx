/**
 * `DisplayUrlSync` — URL (`?display=tv&scale=…`) và display store phải theo nhau
 * ở CẢ HAI chiều, kể cả khi người dùng bấm Back / Forward.
 *
 * Lỗi cần chặn: URL chỉ được đọc một lần lúc mount, nên Back về một URL có chế
 * độ khác không đổi store — và lựa chọn cũ còn bị ghi đè ngược lên URL đó.
 */

import { act, render, waitFor } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import type { InitialEntry } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import { DisplayUrlSync } from '@/app/router/sync';
import { nextDisplaySearch, readDisplayOverrides, useDisplayStore } from '@/domains/preferences';
import type { DisplayMode, TvUiScale } from '@/domains/preferences';

function renderAt(...entries: InitialEntry[]) {
  const router = createMemoryRouter(
    [
      {
        element: (
          <>
            <DisplayUrlSync />
            <Outlet />
          </>
        ),
        children: [
          { path: '/a', element: <p>Trang A</p> },
          { path: '/b', element: <p>Trang B</p> },
        ],
      },
    ],
    { initialEntries: entries },
  );
  render(<RouterProvider router={router} />);

  const url = () => {
    const { pathname, search, hash } = router.state.location;
    return pathname + search + hash;
  };
  return { router, url };
}

const display = () => {
  const { mode, uiScale } = useDisplayStore.getState();
  return { mode, uiScale };
};

function saved(mode: DisplayMode, uiScale: TvUiScale) {
  useDisplayStore.setState({ mode, uiScale });
}

beforeEach(() => {
  localStorage.clear();
  saved('standard', 1.1);
});

describe('DisplayUrlSync', () => {
  it('URL có `display` / `scale` hợp lệ → URL thắng lựa chọn đã lưu', async () => {
    saved('standard', 1.1);
    const { url } = renderAt('/a?search=thep&display=tv&scale=1.3');

    await waitFor(() => expect(display()).toEqual({ mode: 'tv', uiScale: 1.3 }));
    expect(url()).toBe('/a?search=thep&display=tv&scale=1.3');
  });

  it('lần mở đầu không có param → dùng lựa chọn đã lưu, viết lên URL, giữ param nghiệp vụ', async () => {
    saved('tv', 1.2);
    const { url } = renderAt('/a?search=thep&page=2');

    await waitFor(() => expect(url()).toBe('/a?search=thep&page=2&display=tv&scale=1.2'));
    expect(display()).toEqual({ mode: 'tv', uiScale: 1.2 });
  });

  it('chế độ thường là mặc định → không ghi gì lên URL', async () => {
    const { url } = renderAt('/a?tab=summary');

    await waitFor(() => expect(display().mode).toBe('standard'));
    expect(url()).toBe('/a?tab=summary');
  });

  it('người dùng đổi chế độ → URL đổi theo; param nghiệp vụ, hash và state còn nguyên', async () => {
    const { router, url } = renderAt({
      pathname: '/a',
      search: '?search=thep&tab=detail',
      hash: '#muc-3',
      state: { from: '/bao-cao' },
    });

    act(() => useDisplayStore.getState().setMode('tv'));
    await waitFor(() => expect(url()).toBe('/a?search=thep&tab=detail&display=tv&scale=1.1#muc-3'));
    expect(router.state.location.state).toEqual({ from: '/bao-cao' });

    act(() => useDisplayStore.getState().setUiScale(1.3));
    await waitFor(() => expect(url()).toBe('/a?search=thep&tab=detail&display=tv&scale=1.3#muc-3'));

    act(() => useDisplayStore.getState().setMode('standard'));
    await waitFor(() => expect(url()).toBe('/a?search=thep&tab=detail#muc-3'));
    expect(router.state.location.state).toEqual({ from: '/bao-cao' });
  });

  it('đồng bộ bằng `replace` — không sinh thêm mục lịch sử', async () => {
    const { router, url } = renderAt('/a', '/b');

    act(() => useDisplayStore.getState().setMode('tv'));
    await waitFor(() => expect(url()).toBe('/b?display=tv&scale=1.1'));

    // Một lần Back phải về thẳng trang trước, không dừng ở bản `/b` chưa có param.
    await act(() => router.navigate(-1));
    await waitFor(() => expect(router.state.location.pathname).toBe('/a'));
  });

  it('⛔ Back / Forward tới URL mang chế độ khác → store đổi theo URL đó', async () => {
    const { router, url } = renderAt('/a?display=tv&scale=1.2');
    await waitFor(() => expect(display()).toEqual({ mode: 'tv', uiScale: 1.2 }));

    await act(() => router.navigate('/b?display=standard'));
    await waitFor(() => expect(display().mode).toBe('standard'));
    expect(url()).toBe('/b');

    await act(() => router.navigate(-1));
    await waitFor(() => expect(display()).toEqual({ mode: 'tv', uiScale: 1.2 }));
    // URL của mục lịch sử đó KHÔNG bị lựa chọn cũ (standard) ghi đè.
    expect(url()).toBe('/a?display=tv&scale=1.2');

    await act(() => router.navigate(1));
    await waitFor(() => expect(url()).toBe('/b?display=tv&scale=1.2'));
  });

  it('link nội bộ không kèm param → giữ chế độ đang bật, viết lại lên URL mới', async () => {
    const { router, url } = renderAt('/a?display=tv&scale=1.3');
    await waitFor(() => expect(display().mode).toBe('tv'));

    await act(() => router.navigate('/b?page=4'));
    await waitFor(() => expect(url()).toBe('/b?page=4&display=tv&scale=1.3'));
  });

  it('param rác bị bỏ qua, không ghi đè lựa chọn đã lưu', async () => {
    saved('tv', 1.2);
    const { url } = renderAt('/a?display=cinema&scale=9');

    await waitFor(() => expect(url()).toBe('/a?display=tv&scale=1.2'));
    expect(display()).toEqual({ mode: 'tv', uiScale: 1.2 });
  });
});

describe('nextDisplaySearch', () => {
  it('TV: luôn ghi cả `display` lẫn `scale`, kể cả mức mặc định', () => {
    expect(nextDisplaySearch('?page=2', { mode: 'tv', uiScale: 1.1 })).toBe(
      'page=2&display=tv&scale=1.1',
    );
  });

  it('thường: gỡ hai param hiển thị, giữ phần còn lại', () => {
    expect(
      nextDisplaySearch('?display=tv&page=2&scale=1.2', { mode: 'standard', uiScale: 1.2 }),
    ).toBe('page=2');
  });

  it('URL đã đúng → `null` (không điều hướng thừa)', () => {
    expect(
      nextDisplaySearch('?page=2&display=tv&scale=1.2', { mode: 'tv', uiScale: 1.2 }),
    ).toBeNull();
    expect(nextDisplaySearch('?page=2', { mode: 'standard', uiScale: 1.1 })).toBeNull();
  });
});

describe('readDisplayOverrides + applyDisplayOverrides', () => {
  it.each([
    ['đủ hai param', '?display=tv&scale=1.3', { mode: 'tv', uiScale: 1.3 }],
    ['chỉ `scale`', '?page=2&scale=1.2', { uiScale: 1.2 }],
    ['chỉ `display`', '?display=standard', { mode: 'standard' }],
    ['param rác', '?display=cinema&scale=9', {}],
    ['`scale` = 1 (không phải mức TV)', '?display=tv&scale=1', { mode: 'tv' }],
    ['không có gì', '', {}],
  ])('%s → chỉ phần hợp lệ', (_name, search, expected) => {
    expect(readDisplayOverrides(search)).toEqual(expected);
  });

  it('ghi MỘT lần cả `mode` lẫn `uiScale` — không có khung hình nửa vời ở mức chữ cũ', () => {
    const states: unknown[] = [];
    const stop = useDisplayStore.subscribe(({ mode, uiScale }) => states.push({ mode, uiScale }));

    useDisplayStore.getState().applyDisplayOverrides(readDisplayOverrides('?display=tv&scale=1.3'));
    stop();

    expect(states).toEqual([{ mode: 'tv', uiScale: 1.3 }]);
  });

  it('không có gì để ghi → store không đổi, không ghi lại localStorage', () => {
    const before = useDisplayStore.getState();
    useDisplayStore.getState().applyDisplayOverrides({});
    expect(useDisplayStore.getState()).toBe(before);
  });
});

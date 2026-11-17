/**
 * `useRouteScrollRestoration` — vị trí cuộn của vùng cuộn không dựng lại khi đổi route (`<main>` của
 * `AppShellLayout`, khung `RootLayout`).
 *
 * Vùng đó KHÔNG dựng lại khi đổi route, nên tự nó giữ vị trí cuộn của trang cũ: sang trang mới mà vẫn
 * đứng ở giữa / cuối trang. Luật: đổi `pathname` bằng PUSH / REPLACE → về đầu; POP (Back / Forward) →
 * vị trí đã lưu của mục lịch sử đó; chỉ đổi `?search` / `#hash` (bộ lọc trên URL) → giữ nguyên.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AppShellLayout from '@/app/layouts/AppShellLayout';
import { useRouteScrollRestoration } from '@/app/layouts/useRouteScrollRestoration';

function ScrollLayout() {
  const ref = useRef<HTMLDivElement>(null);
  useRouteScrollRestoration(ref, 'test');
  return (
    <div ref={ref} data-testid="vung-cuon">
      <Outlet />
    </div>
  );
}

const PAGES = [
  { path: '/a', element: <p>Trang A</p> },
  { path: '/b', element: <p>Trang B</p> },
];

let router: ReturnType<typeof createMemoryRouter> | undefined;

function renderAt(path: string) {
  router = createMemoryRouter(
    [
      { element: <ScrollLayout />, children: PAGES },
      { path: '/ngoai', element: <p>Ngoài khung</p> },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

const scroller = () => screen.getByTestId('vung-cuon');

/** Người dùng cuộn tới `top` — jsdom không tự phát sự kiện `scroll` khi gán `scrollTop`. */
function scrollTo(element: HTMLElement, top: number) {
  element.scrollTop = top;
  fireEvent.scroll(element);
}

afterEach(() => {
  router?.dispose();
  router = undefined;
});

describe('useRouteScrollRestoration', () => {
  it('sang trang khác (PUSH) → về đầu', async () => {
    const r = renderAt('/a');
    scrollTo(scroller(), 500);

    await act(() => r.navigate('/b'));

    expect(screen.getByText('Trang B')).toBeInTheDocument();
    expect(scroller().scrollTop).toBe(0);
  });

  it('REPLACE sang trang khác (vd guard chuyển hướng) cũng về đầu', async () => {
    const r = renderAt('/a');
    scrollTo(scroller(), 500);

    await act(() => r.navigate('/b', { replace: true }));

    expect(scroller().scrollTop).toBe(0);
  });

  it('Back / Forward (POP) → khôi phục đúng vị trí của từng mục lịch sử', async () => {
    const r = renderAt('/a');
    scrollTo(scroller(), 500);
    await act(() => r.navigate('/b'));
    scrollTo(scroller(), 120);

    await act(() => r.navigate(-1));
    expect(screen.getByText('Trang A')).toBeInTheDocument();
    expect(scroller().scrollTop).toBe(500);

    await act(() => r.navigate(1));
    expect(screen.getByText('Trang B')).toBeInTheDocument();
    expect(scroller().scrollTop).toBe(120);
  });

  it('chỉ đổi `?search` / `#hash` (bộ lọc, tab trên URL) → giữ nguyên vị trí', async () => {
    const r = renderAt('/a');
    scrollTo(scroller(), 300);

    await act(() => r.navigate('/a?page=2'));
    expect(scroller().scrollTop).toBe(300);

    await act(() => r.navigate('/a?page=2#bang'));
    expect(scroller().scrollTop).toBe(300);
  });

  it('ra ngoài khung (layout gỡ ra) rồi Back → layout dựng lại vẫn khôi phục vị trí', async () => {
    const r = renderAt('/a');
    scrollTo(scroller(), 640);

    await act(() => r.navigate('/ngoai'));
    expect(screen.queryByTestId('vung-cuon')).not.toBeInTheDocument();

    await act(() => r.navigate(-1));
    expect(scroller().scrollTop).toBe(640);
  });
});

describe('hai vùng cuộn khác `scope`', () => {
  function TwoScrollers() {
    const outer = useRef<HTMLDivElement>(null);
    const inner = useRef<HTMLDivElement>(null);
    useRouteScrollRestoration(outer, 'ngoai');
    useRouteScrollRestoration(inner, 'trong');
    return (
      <div ref={outer} data-testid="ngoai">
        <div ref={inner} data-testid="trong">
          <Outlet />
        </div>
      </div>
    );
  }

  it('Back khôi phục đúng vị trí của TỪNG vùng, không lẫn sang nhau', async () => {
    router = createMemoryRouter([{ element: <TwoScrollers />, children: PAGES }], {
      initialEntries: ['/a'],
    });
    render(<RouterProvider router={router} />);
    scrollTo(screen.getByTestId('ngoai'), 70);
    scrollTo(screen.getByTestId('trong'), 900);

    await act(() => router!.navigate('/b'));
    await act(() => router!.navigate(-1));

    expect(screen.getByTestId('ngoai').scrollTop).toBe(70);
    expect(screen.getByTestId('trong').scrollTop).toBe(900);
  });
});

describe('AppShellLayout dùng hook cho `<main>`', () => {
  it('trang mới trong khung ứng dụng bắt đầu từ đầu, không giữ vị trí cuộn của trang cũ', async () => {
    router = createMemoryRouter([{ element: <AppShellLayout />, children: PAGES }], {
      initialEntries: ['/a'],
    });
    render(<RouterProvider router={router} />);
    const main = screen.getByRole('main');
    scrollTo(main, 800);

    await act(() => router!.navigate('/b'));

    expect(screen.getByRole('main')).toBe(main);
    expect(main.scrollTop).toBe(0);
  });
});

describe('trang cao dần sau khi hiện (dữ liệu tải muộn)', () => {
  /** Vùng cuộn mô phỏng trình duyệt: `scrollTop` bị kẹp ở `maxScroll` (jsdom không có bố cục thật). */
  function clampScroll(element: HTMLElement) {
    const box = { top: 0, max: 0 };
    Object.defineProperty(element, 'scrollTop', {
      configurable: true,
      get: () => box.top,
      set: (value: number) => {
        box.top = Math.min(value, box.max);
      },
    });
    return box;
  }

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  async function backToTallPage(maxAtBack: number) {
    const r = renderAt('/a');
    const box = clampScroll(scroller());
    box.max = 2000;
    scrollTo(scroller(), 800);
    await act(() => r.navigate('/b'));
    box.max = maxAtBack;
    await act(() => r.navigate(-1));
    return { r, box };
  }

  it('⛔ nội dung chưa đủ cao lúc Back → chờ cao lên rồi cuộn đúng chỗ cũ (không dừng ở mức bị kẹp)', async () => {
    const { box } = await backToTallPage(300);
    expect(box.top, 'lúc này mới tới 300, chưa tới 800').toBe(300);

    box.max = 2000;
    await act(() => vi.advanceTimersByTimeAsync(100));

    expect(box.top).toBe(800);
  });

  it('⛔ vị trí bị kẹp trong lúc chờ KHÔNG ghi đè vị trí đã lưu — Back lần nữa vẫn về 800', async () => {
    const { r, box } = await backToTallPage(300);
    fireEvent.scroll(scroller());
    await act(() => r.navigate('/b'));
    box.max = 2000;
    await act(() => r.navigate(-1));

    expect(box.top).toBe(800);
  });

  it('người dùng tự cuộn trong lúc chờ → thôi giằng lại, tôn trọng vị trí họ chọn', async () => {
    const { box } = await backToTallPage(300);

    fireEvent.wheel(scroller());
    box.top = 120;
    box.max = 2000;
    await act(() => vi.advanceTimersByTimeAsync(200));

    expect(box.top).toBe(120);
  });

  it('nội dung không bao giờ đủ cao → bỏ cuộc sau ngân sách chờ, không lặp vô hạn', async () => {
    const { box } = await backToTallPage(300);

    await act(() => vi.advanceTimersByTimeAsync(3000));

    expect(box.top).toBe(300);
    expect(vi.getTimerCount()).toBe(0);
  });
});

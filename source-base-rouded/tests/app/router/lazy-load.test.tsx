/**
 * `LazyLoad` — vỏ chờ tải + ranh giới lỗi của mọi trang; `lazyPage` — trang nạp lười có `preload()`.
 *
 * React Router render các trang ở cùng một vị trí trong cây, nên ranh giới lỗi
 * của trang trước được dùng lại cho trang sau. Không xoá lỗi khi đổi trang thì
 * một trang hỏng khoá luôn mọi trang còn lại.
 *
 * `preload()` (Dock / bảng lệnh gọi khi rê chuột, focus) và `React.lazy` phải dùng CHUNG một lượt tải —
 * nạp trước rồi mở trang mà tải hai lần là phí đúng thứ nạp trước định tiết kiệm.
 */

import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import type { ComponentType } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { describeError, isChunkLoadError } from '@/app/components';
import { RouteErrorScreen } from '@/app/router/components';
import { isLazyPage, lazyPage } from '@/app/router/definition';
import type { RouteDef } from '@/app/router/definition';
import { buildRoutes } from '@/app/router/setup';

const CHUNK_ERROR = new TypeError(
  'Failed to fetch dynamically imported module: https://app.example/assets/ReportPage-a1b2.js',
);

let broken = true;

const BrokenPage = () => {
  if (broken) throw new Error('Không đọc được thuộc tính của undefined');
  return <p>Trang đã chạy lại</p>;
};

const PAGES: RouteDef[] = [
  { path: '/hong', page: BrokenPage, meta: { title: 'Trang hỏng' } },
  { path: '/on', page: () => <p>Trang ổn</p>, meta: { title: 'Trang ổn' } },
  {
    path: '/khong-tai-duoc',
    page: lazyPage(() => Promise.reject(CHUNK_ERROR)),
    meta: { title: 'Trang không tải được' },
  },
  {
    path: '/cham',
    page: lazyPage(() => new Promise<never>(() => undefined)),
    meta: { title: 'Trang tải chậm' },
  },
];

function renderAt(path: string) {
  const router = createMemoryRouter(buildRoutes(PAGES), { initialEntries: [path] });
  render(<RouterProvider router={router} />);
  return router;
}

let consoleError: ReturnType<typeof vi.spyOn>;
const reload = vi.fn();

beforeEach(() => {
  broken = true;
  reload.mockClear();
  vi.stubGlobal('location', { ...window.location, reload });
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => {
  consoleError.mockRestore();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe('LazyLoad', () => {
  it('đang tải trang → hiện trạng thái chờ', async () => {
    renderAt('/cham');
    expect(await screen.findByText('Đang tải…')).toBeInTheDocument();
  });

  it('trang ném lỗi → màn lỗi có lối thoát, chi tiết đi vào console', async () => {
    renderAt('/hong');

    expect(await screen.findByRole('alert')).toHaveTextContent('Có lỗi xảy ra');
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Về trang chủ' })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('[giao diện]'),
      expect.any(Error),
      expect.anything(),
    );
  });

  it('⛔ rời trang đang lỗi → trang kế tiếp hiện bình thường, không kẹt ở màn lỗi', async () => {
    const router = renderAt('/hong');
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await act(() => router.navigate('/on'));

    expect(await screen.findByText('Trang ổn')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('chỉ đổi query thì KHÔNG thử lại; đổi sang trang khác rồi quay về mới thử lại', async () => {
    const router = renderAt('/hong');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    broken = false;

    await act(() => router.navigate('/hong?page=2'));
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await act(() => router.navigate('/on'));
    await act(() => router.navigate('/hong'));
    expect(await screen.findByText('Trang đã chạy lại')).toBeInTheDocument();
  });

  it('không tải được chunk → nói đúng hai khả năng, KHÔNG khẳng định "có phiên bản mới"', async () => {
    renderAt('/khong-tai-duoc');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Không tải được trang');
    expect(alert).toHaveTextContent('kết nối mạng');
    expect(alert).not.toHaveTextContent(/phiên bản mới/i);
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
    expect(reload, 'lỗi chunk lần đầu tự tải lại trang một lần').toHaveBeenCalledTimes(1);
  });

  it('⛔ đổi URL mà trang không đọc URL → trang KHÔNG vẽ lại dù không `memo` (vỏ giữ nguyên phần tử trang)', async () => {
    const quietRendered = vi.fn();
    const readerRendered = vi.fn();
    const QuietPage = () => {
      quietRendered();
      return <p>Trang tĩnh</p>;
    };
    const ReaderPage = () => {
      readerRendered();
      return <p>Đang xem {useLocation().search}</p>;
    };
    const router = createMemoryRouter(
      buildRoutes([
        { path: '/tinh', page: QuietPage, meta: { title: 'Trang tĩnh' } },
        { path: '/doc', page: ReaderPage, meta: { title: 'Trang đọc URL' } },
      ]),
      { initialEntries: ['/tinh'] },
    );
    render(<RouterProvider router={router} />);
    expect(await screen.findByText('Trang tĩnh')).toBeInTheDocument();

    await act(() => router.navigate('/tinh?page=2'));
    await act(() => router.navigate('/tinh?page=3#bang'));
    expect(quietRendered, 'vỏ LazyLoad vẽ lại theo URL, trang thì không').toHaveBeenCalledTimes(1);

    await act(() => router.navigate('/doc'));
    await act(() => router.navigate('/doc?page=2'));
    expect(screen.getByText('Đang xem ?page=2')).toBeInTheDocument();
    expect(
      readerRendered,
      'trang TỰ đọc URL thì vẽ lại — đúng ý, `memo` cũng không chặn được',
    ).toHaveBeenCalledTimes(2);
  });

  it('lỗi chunk NGOÀI trang (route gốc → `RouteErrorScreen`) cũng tự tải lại một lần', async () => {
    const Broken: ComponentType = () => {
      throw CHUNK_ERROR;
    };
    const router = createMemoryRouter([
      { path: '/', element: <Broken />, errorElement: <RouteErrorScreen /> },
    ]);
    render(<RouterProvider router={router} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Không tải được trang');
    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe('lazyPage — preload()', () => {
  const PAGE = { default: () => <p>Trang báo cáo</p> };

  it('⛔ preload nhiều lần rồi mở trang → loader chạy ĐÚNG MỘT lần (React.lazy dùng chung lượt tải)', async () => {
    const loader = vi.fn(() => Promise.resolve(PAGE));
    const Page = lazyPage(loader);

    await Page.preload();
    await Page.preload();
    const router = createMemoryRouter(
      buildRoutes([{ path: '/bao-cao', page: Page, meta: { title: 'Báo cáo' } }]),
      { initialEntries: ['/bao-cao'] },
    );
    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Trang báo cáo')).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('không preload thì tải khi trang render lần đầu (hành vi `React.lazy` cũ)', async () => {
    const loader = vi.fn(() => Promise.resolve(PAGE));
    const Page = lazyPage(loader);
    expect(loader).not.toHaveBeenCalled();

    const router = createMemoryRouter(
      buildRoutes([{ path: '/bao-cao', page: Page, meta: { title: 'Báo cáo' } }]),
      { initialEntries: ['/bao-cao'] },
    );
    render(<RouterProvider router={router} />);

    expect(await screen.findByText('Trang báo cáo')).toBeInTheDocument();
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('preload thất bại (mất mạng lúc rê chuột) không ném lỗi, và lần mở trang sau được tải lại', async () => {
    const loader = vi
      .fn<() => Promise<typeof PAGE>>()
      .mockRejectedValueOnce(CHUNK_ERROR)
      .mockResolvedValue(PAGE);
    const Page = lazyPage(loader);

    await expect(Page.preload()).resolves.toBeUndefined();
    await Page.preload();

    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('`isLazyPage` phân biệt trang nạp lười với trang nạp sẵn (403, 404)', () => {
    expect(isLazyPage(lazyPage(() => Promise.resolve(PAGE)))).toBe(true);
    expect(isLazyPage(PAGE.default)).toBe(false);
  });
});

describe('describeError', () => {
  it('nhận ra lỗi tải chunk của cả ba trình duyệt', () => {
    expect(isChunkLoadError(CHUNK_ERROR)).toBe(true);
    expect(isChunkLoadError(new TypeError('error loading dynamically imported module'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('dev: hiện nguyên thông điệp kỹ thuật', () => {
    expect(describeError(new Error('x is not a function'), true).description).toBe(
      'x is not a function',
    );
  });

  it('production: câu thân thiện, không lộ thông điệp kỹ thuật', () => {
    const { title, description } = describeError(new Error('x is not a function'), false);

    expect(title).toBe('Có lỗi xảy ra');
    expect(description).not.toContain('x is not a function');
  });

  it.each([null, undefined, '', 0, 'chuỗi', { status: 'không phải số' }])(
    'giá trị bị ném %j (không phải Error) → câu chữ chung, không ném lỗi mới',
    (value) => {
      expect(describeError(value, true)).toEqual({
        kind: 'unexpected',
        title: 'Có lỗi xảy ra',
        description:
          'Trang gặp sự cố ngoài dự kiến. Hãy tải lại trang; nếu vẫn lỗi, vui lòng báo cho quản trị viên.',
      });
    },
  );
});

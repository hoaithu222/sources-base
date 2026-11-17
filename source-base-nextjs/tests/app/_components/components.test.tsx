/**
 * Màn lỗi / chờ / chọn ngôn ngữ dùng chung — `src/app/_components`.
 *
 *  - `describeError` / `isChunkLoadError`: phân loại lỗi bị ném (kể cả `null`) để chọn màn.
 *  - `reloadOnceOnChunkError`: lỗi chunk sau khi triển khai bản mới → tải lại ĐÚNG MỘT lần, không lặp vô hạn.
 *  - `RouteErrorScreen`: ghi log một lần, chữ đã dịch, nút theo loại lỗi.
 *  - `LocaleSwitcher`: mỗi ngôn ngữ là `<a hreflang>` thật, giữ nguyên trang đang xem.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';

import {
  ErrorScreen,
  LoadingScreen,
  LocaleSwitcher,
  RouteErrorScreen,
  describeError,
  isChunkLoadError,
  reloadOnceOnChunkError,
} from '@/app/_components';
import {
  CHUNK_RELOAD_STORAGE_KEY,
  CHUNK_RELOAD_WINDOW_MS,
} from '@/app/_components/chunk-reload.utils';
import { APP_ERROR_LOG_PREFIX, logAppError } from '@/app/_components/describe-error';
import enMessages from '@/messages/en';
import viMessages from '@/messages/vi';
import { renderInRouter, renderWithIntl } from '@tests/helpers/render';

const CHUNK_ERROR = new TypeError(
  'Failed to fetch dynamically imported module: https://app.example/assets/ReportPage-a1b2.js',
);

const reload = vi.fn();
const assign = vi.fn();
let consoleError: MockInstance<typeof console.error>;

beforeEach(() => {
  localStorage.clear();
  reload.mockClear();
  assign.mockClear();
  vi.stubGlobal('location', { ...window.location, reload, assign });
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('isChunkLoadError / describeError', () => {
  it.each([
    'Failed to fetch dynamically imported module: /a.js',
    'error loading dynamically imported module',
    'Importing a module script failed.',
    'Failed to load module script: Expected a JavaScript module',
    'Unable to preload CSS for /assets/x.css',
    'Loading chunk 42 failed.',
    'Loading CSS chunk 7 failed.',
  ])('thông điệp "%s" là lỗi chunk', (message) => {
    expect(isChunkLoadError(new Error(message))).toBe(true);
  });

  it('nhận ra lỗi chunk qua `name` (webpack / Turbopack: ChunkLoadError)', () => {
    const error = new Error('x');
    error.name = 'ChunkLoadError';

    expect(isChunkLoadError(error)).toBe(true);
  });

  it.each([new Error('x is not a function'), null, undefined, 'Loading chunk 1 failed', 42, {}])(
    'giá trị không phải lỗi chunk (%s) → false',
    (value) => {
      expect(isChunkLoadError(value)).toBe(false);
    },
  );

  it('lỗi chunk → `kind: chunk`, không kèm chi tiết kỹ thuật', () => {
    expect(describeError(CHUNK_ERROR, true)).toEqual({ kind: 'chunk' });
  });

  it('lỗi khác → `unexpected`; chi tiết CHỈ có khi `showDetail`', () => {
    const error = new Error('Không đọc được thuộc tính');

    expect(describeError(error, true)).toEqual({
      kind: 'unexpected',
      detail: 'Không đọc được thuộc tính',
    });
    expect(describeError(error, false)).toEqual({ kind: 'unexpected', detail: undefined });
  });

  it('⛔ production không lộ chi tiết lỗi cho người dùng', () => {
    vi.stubEnv('NODE_ENV', 'production');

    expect(describeError(new Error('bí mật')).detail).toBeUndefined();
    vi.unstubAllEnvs();
  });

  it('giá trị bị ném không phải Error (null, chuỗi) vẫn phân loại được, không ném', () => {
    expect(describeError(null, true)).toEqual({ kind: 'unexpected', detail: undefined });
    expect(describeError('chuỗi', true)).toEqual({ kind: 'unexpected', detail: undefined });
  });

  it('`logAppError` ghi console với tiền tố chung rồi tới chi tiết', () => {
    const cause = new Error('gốc');

    logAppError('Trang lỗi:', cause);

    expect(consoleError).toHaveBeenCalledWith(`${APP_ERROR_LOG_PREFIX} Trang lỗi:`, cause);
  });
});

describe('reloadOnceOnChunkError', () => {
  it('lỗi chunk lần đầu → ghi thời điểm vào cờ rồi tải lại trang', () => {
    expect(reloadOnceOnChunkError(CHUNK_ERROR, 1_000)).toBe(true);

    expect(reload).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)).toBe('1000');
  });

  it('⛔ vẫn lỗi chunk ngay sau lần tự tải lại → KHÔNG tải lại nữa (chống lặp)', () => {
    reloadOnceOnChunkError(CHUNK_ERROR, 1_000);

    expect(reloadOnceOnChunkError(CHUNK_ERROR, 1_000 + CHUNK_RELOAD_WINDOW_MS - 1)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('quá khoảng chống lặp (lần triển khai sau) → tự tải lại được lần nữa', () => {
    reloadOnceOnChunkError(CHUNK_ERROR, 1_000);

    expect(reloadOnceOnChunkError(CHUNK_ERROR, 1_000 + CHUNK_RELOAD_WINDOW_MS)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('cờ hỏng (chuỗi rác) coi như chưa từng tự tải lại', () => {
    localStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, 'abc');

    expect(reloadOnceOnChunkError(CHUNK_ERROR, 5_000)).toBe(true);
  });

  it.each([new Error('x is not a function'), null, 'chuỗi'])(
    'lỗi không phải chunk (%s) → không đụng tới trang',
    (error) => {
      expect(reloadOnceOnChunkError(error)).toBe(false);
      expect(reload).not.toHaveBeenCalled();
      expect(localStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)).toBeNull();
    },
  );

  it('⛔ không ghi được cờ (storage bị chặn) → không tự tải lại, tránh lặp vô hạn', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bị chặn', 'SecurityError');
    });

    expect(reloadOnceOnChunkError(CHUNK_ERROR)).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('lỗi CSS đi kèm chunk (`Unable to preload CSS`) cũng là lỗi chunk', () => {
    expect(
      isChunkLoadError(new Error('Unable to preload CSS for /assets/ReportPage-a1b2.css')),
    ).toBe(true);
  });
});

describe('RouteErrorScreen', () => {
  const reset = vi.fn();

  beforeEach(() => reset.mockClear());

  const renderScreen = (error: Error & { digest?: string }, locale: 'vi' | 'en' = 'vi') =>
    renderWithIntl(<RouteErrorScreen error={error} label="page" level="content" reset={reset} />, {
      locale,
    });

  it('ghi log ĐÚNG MỘT lần kèm tên nhánh; render lại cùng lỗi không ghi thêm', () => {
    const error = new Error('hỏng');
    const view = renderScreen(error);

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining(`${APP_ERROR_LOG_PREFIX} page`),
      error,
    );

    view.rerender(<RouteErrorScreen error={error} label="page" level="content" reset={reset} />);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('lỗi thường: hiện chữ đã dịch, nút "Thử lại" gọi `reset`, "Về trang chủ" điều hướng cứng', async () => {
    renderScreen(new Error('hỏng'));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(viMessages.errors.screens.error.title)).toBeInTheDocument();
    expect(screen.getByText(viMessages.errors.screens.error.description)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(reset).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Về trang chủ' }));
    expect(assign).toHaveBeenCalledWith('/');
    expect(reload).not.toHaveBeenCalled();
  });

  it('lỗi thường bằng tiếng Anh → chữ tiếng Anh và "Back to home" về /en', async () => {
    renderScreen(new Error('hỏng'), 'en');

    expect(screen.getByText(enMessages.errors.screens.error.title)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Back to home' }));
    expect(assign).toHaveBeenCalledWith('/en');
  });

  it('có `digest` → hiện mã tham chiếu cho đội kỹ thuật tra log server', () => {
    renderScreen(Object.assign(new Error('hỏng'), { digest: 'abc123' }));

    expect(screen.getByText('Mã tham chiếu: abc123')).toBeInTheDocument();
  });

  it('không có `digest` → không có dòng tham chiếu', () => {
    renderScreen(new Error('hỏng'));

    expect(screen.queryByText(/Mã tham chiếu/)).not.toBeInTheDocument();
  });

  it('lỗi chunk lần đầu → tự tải lại MỘT lần; nút chính là "Tải lại trang", không có "Về trang chủ"', async () => {
    renderScreen(CHUNK_ERROR);

    expect(reload).toHaveBeenCalledTimes(1);
    expect(screen.getByText(viMessages.errors.screens.chunk.title)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Về trang chủ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thử lại' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Tải lại trang' }));
    expect(reload).toHaveBeenCalledTimes(2);
    expect(reset).not.toHaveBeenCalled();
  });

  it('⛔ đã tự tải lại mà vẫn lỗi chunk → chỉ hiện màn lỗi, không tải lại lần nữa', () => {
    localStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));

    renderScreen(CHUNK_ERROR);

    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
  });

  it('lỗi chunk bằng tiếng Anh', () => {
    localStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));

    renderScreen(CHUNK_ERROR, 'en');

    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
  });
});

describe('ErrorScreen', () => {
  it('nút phụ chỉ hiện khi có CẢ nhãn lẫn handler', async () => {
    const onPrimary = vi.fn();
    const onSecondary = vi.fn();
    const view = render(
      <ErrorScreen
        description="Mô tả"
        primaryLabel="Chính"
        title="Tiêu đề"
        onPrimary={onPrimary}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Phụ' })).not.toBeInTheDocument();

    view.rerender(
      <ErrorScreen
        description="Mô tả"
        primaryLabel="Chính"
        secondaryLabel="Phụ"
        title="Tiêu đề"
        onPrimary={onPrimary}
        onSecondary={onSecondary}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Phụ' }));
    await userEvent.click(screen.getByRole('button', { name: 'Chính' }));

    expect(onSecondary).toHaveBeenCalledTimes(1);
    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Tiêu đề');
  });
});

describe('LoadingScreen', () => {
  it.each([
    ['vi', 'Đang tải…'],
    ['en', 'Loading…'],
  ] as const)('hiện nhãn đang tải theo ngôn ngữ (%s)', (locale, label) => {
    renderWithIntl(<LoadingScreen />, { locale });

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('cả hai cỡ (`app`, `content`) đều có vùng trạng thái cho trình đọc màn hình', () => {
    const view = renderWithIntl(<LoadingScreen level="app" />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
    view.unmount();

    renderWithIntl(<LoadingScreen level="content" />);
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
});

describe('LocaleSwitcher', () => {
  const link = (name: string) => screen.getByRole('link', { name });

  /**
   * next-intl LUÔN gắn tiền tố khi `<Link locale>` được truyền — kể cả ngôn ngữ mặc định (`/vi/about`): đó là cách ghi đè
   * cookie `NEXT_LOCALE` của người đã chọn tiếng Anh; `proxy.ts` rồi chuyển `/vi/about` về `/about` (xem tests/app/proxy.test.ts).
   */
  it('mỗi ngôn ngữ là `<a>` thật có hreflang; tiếng Anh trỏ `/en/about`, tiếng Việt có tiền tố tường minh `/vi/about`', () => {
    renderInRouter(<LocaleSwitcher />, { pathname: '/about' });

    expect(link('VI')).toHaveAttribute('href', '/vi/about');
    expect(link('VI')).toHaveAttribute('hreflang', 'vi');
    expect(link('EN')).toHaveAttribute('href', '/en/about');
    expect(link('EN')).toHaveAttribute('hreflang', 'en');
    expect(link('EN')).toHaveAttribute('title', 'English');
  });

  it('đang ở trang tiếng Anh (`/en/about`) → hai liên kết vẫn trỏ về CÙNG trang', () => {
    renderInRouter(<LocaleSwitcher />, { pathname: '/en/about', locale: 'en' });

    expect(link('VI')).toHaveAttribute('href', '/vi/about');
    expect(link('EN')).toHaveAttribute('href', '/en/about');
  });

  it('đánh dấu ngôn ngữ hiện tại bằng `aria-current`', () => {
    renderInRouter(<LocaleSwitcher />, { pathname: '/en/about', locale: 'en' });

    expect(link('EN')).toHaveAttribute('aria-current', 'true');
    expect(link('VI')).not.toHaveAttribute('aria-current');
  });

  it('trang chủ: `/` ↔ `/en`', () => {
    renderInRouter(<LocaleSwitcher />, { pathname: '/' });

    expect(link('VI')).toHaveAttribute('href', '/vi');
    expect(link('EN')).toHaveAttribute('href', '/en');
  });

  it('chỉ giữ `pathname`, bỏ query string', () => {
    renderInRouter(<LocaleSwitcher />, { pathname: '/about', search: '?tab=2' });

    expect(link('EN')).toHaveAttribute('href', '/en/about');
  });

  it('khung là `<nav>` có nhãn theo ngôn ngữ', () => {
    const view = renderInRouter(<LocaleSwitcher />, { pathname: '/about' });
    expect(
      screen.getByRole('navigation', { name: viMessages.common.language.label }),
    ).toBeInTheDocument();
    view.unmount();

    renderInRouter(<LocaleSwitcher />, { pathname: '/en/about', locale: 'en' });
    expect(
      screen.getByRole('navigation', { name: enMessages.common.language.label }),
    ).toBeInTheDocument();
  });
});

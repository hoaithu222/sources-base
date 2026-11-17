/**
 * Lỗi tải chunk sau khi triển khai bản mới — `reloadOnceOnChunkError` (`app/components/chunk-reload.utils.ts`).
 *
 * `index.html` cũ trỏ tới chunk đã bị xoá: tải lại trang MỘT lần là lấy được bản mới. Tải lại lặp vô
 * hạn còn tệ hơn màn lỗi, nên cờ chống lặp (thời điểm tự tải lại, qua `safeStorage`) chặn lần thứ hai
 * trong `CHUNK_RELOAD_WINDOW_MS`, và không ghi được cờ thì không tự tải lại.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary, isChunkLoadError, reloadOnceOnChunkError } from '@/app/components';
import {
  CHUNK_RELOAD_STORAGE_KEY,
  CHUNK_RELOAD_WINDOW_MS,
} from '@/app/components/chunk-reload.utils';

const CHUNK_ERROR = new TypeError(
  'Failed to fetch dynamically imported module: https://app.example/assets/ReportPage-a1b2.js',
);

const reload = vi.fn();
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  localStorage.clear();
  reload.mockClear();
  vi.stubGlobal('location', { ...window.location, reload });
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.clear();
  consoleError.mockRestore();
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

  it('lỗi CSS đi kèm chunk của Vite (`Unable to preload CSS`) cũng là lỗi chunk', () => {
    expect(
      isChunkLoadError(new Error('Unable to preload CSS for /assets/ReportPage-a1b2.css')),
    ).toBe(true);
  });
});

describe('ErrorBoundary gặp lỗi chunk', () => {
  function ChunkFailure(): React.ReactElement {
    throw CHUNK_ERROR;
  }

  const renderFailure = () =>
    render(
      <ErrorBoundary label="Trang" level="content" resetKey="/bao-cao">
        <ChunkFailure />
      </ErrorBoundary>,
    );

  it('lần đầu → tự tải lại trang MỘT lần; màn lỗi vẫn hiện phòng khi việc tải lại bị chặn', () => {
    renderFailure();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent('Không tải được trang');
  });

  it('sau khi đã tự tải lại mà vẫn lỗi → chỉ hiện màn lỗi với nút "Tải lại trang"', () => {
    localStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));

    renderFailure();

    expect(reload).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
  });
});

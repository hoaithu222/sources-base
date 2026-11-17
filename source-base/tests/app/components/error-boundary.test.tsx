/**
 * `ErrorBoundary` — ranh giới lỗi duy nhất của app (bọc cả cây ở `App`, bọc từng trang ở `LazyLoad`).
 *
 * React cho phép ném BẤT KỲ giá trị nào, kể cả `null` / `undefined`. Ranh giới phải nhận biết "đã có
 * lỗi" bằng cờ riêng, không bằng `error !== null`; nếu không, giá trị `null` làm trạng thái trông như
 * khoẻ và ranh giới dựng lại đúng con vừa ném.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '@/app/components';

let thrown: unknown;
let broken: boolean;

function Page(): React.ReactElement {
  if (broken) throw thrown;
  return <p>Nội dung trang</p>;
}

function renderBoundary(resetKey?: string, level: 'app' | 'content' = 'content') {
  return (
    <ErrorBoundary label="Trang" level={level} resetKey={resetKey}>
      <Page />
    </ErrorBoundary>
  );
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  broken = true;
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => consoleError.mockRestore());

const THROWN_VALUES: [string, unknown][] = [
  ['null', null],
  ['undefined', undefined],
  ['Error', new Error('hỏng thật')],
  ['chuỗi rỗng', ''],
  ['số 0', 0],
  ['false', false],
];

describe('ErrorBoundary — mọi giá trị bị ném đều ra màn lỗi', () => {
  it.each(THROWN_VALUES)(
    'con ném %s → hiện màn lỗi, lỗi không lọt ra ngoài ranh giới',
    (_name, value) => {
      thrown = value;
      render(renderBoundary('a'));

      expect(screen.getByRole('alert')).toHaveTextContent('Có lỗi xảy ra');
      expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
      expect(screen.queryByText('Nội dung trang')).not.toBeInTheDocument();
    },
  );

  it.each(THROWN_VALUES)(
    'con ném %s → lỗi được ghi vào console với tiền tố [giao diện] và tên nhánh',
    (_name, value) => {
      thrown = value;
      render(renderBoundary('a'));

      expect(consoleError).toHaveBeenCalledWith(
        expect.stringMatching(/^\[giao diện\] Trang /),
        value,
        expect.anything(),
      );
    },
  );

  it('truyền `level` xuống màn lỗi: app chiếm trọn màn hình', () => {
    thrown = null;
    render(renderBoundary('a', 'app'));

    expect(screen.getByRole('alert')).toHaveClass('h-dvh', 'overflow-y-auto');
  });

  it('bọc cả cây (không `resetKey`): lỗi provider ngoài router vẫn có màn khôi phục', () => {
    thrown = new Error('provider failed');
    render(
      <ErrorBoundary label="Ứng dụng" level="app">
        <Page />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
  });
});

describe('ErrorBoundary — resetKey xoá lỗi', () => {
  it.each(THROWN_VALUES)(
    'con ném %s; đổi resetKey → trang kế tiếp hiện bình thường',
    (_name, value) => {
      thrown = value;
      const { rerender } = render(renderBoundary('a'));
      expect(screen.getByRole('alert')).toBeInTheDocument();

      broken = false;
      rerender(renderBoundary('b'));

      expect(screen.getByText('Nội dung trang')).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    },
  );

  it('resetKey giữ nguyên → vẫn ở màn lỗi dù con đã hết hỏng', () => {
    thrown = null;
    const { rerender } = render(renderBoundary('a'));
    broken = false;

    rerender(renderBoundary('a'));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung trang')).not.toBeInTheDocument();
  });

  it('không truyền resetKey → màn lỗi giữ tới khi tải lại trang', () => {
    thrown = null;
    const { rerender } = render(renderBoundary());
    broken = false;

    rerender(renderBoundary());

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('sau khi phục hồi, trang kế tiếp ném null vẫn bị bắt lần nữa', () => {
    thrown = null;
    const { rerender } = render(renderBoundary('a'));
    broken = false;
    rerender(renderBoundary('b'));
    expect(screen.getByText('Nội dung trang')).toBeInTheDocument();

    broken = true;
    rerender(renderBoundary('c'));

    expect(screen.getByRole('alert')).toHaveTextContent('Có lỗi xảy ra');
  });
});

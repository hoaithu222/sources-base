/**
 * Màn dùng chung của `app` (chờ tải · lỗi) — ghim DOM, class và hành vi.
 *
 * Các khẳng định ghi từ chính component TRƯỚC khi chuyển sang `app/components`; chuyển file không
 * được làm đổi một chữ nào ở đây.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import App from '@/app/App';
import { ErrorScreen, LoadingScreen } from '@/app/components';
import { SystemIcon } from '@/shared/ui/icons/Icons';

vi.mock('@/app/providers', async () => {
  const { lazy } = await import('react');
  return { AppProvider: lazy(() => new Promise<never>(() => undefined)) };
});
vi.mock('@/app/router', () => ({ AppRouter: () => null }));

const classSet = (element: Element) => [...element.classList].sort();

const CHUNK_ERROR = {
  kind: 'chunk',
  title: 'Không tải được trang',
  description: 'Mô tả chunk',
} as const;
const GENERIC_ERROR = {
  kind: 'unexpected',
  title: 'Có lỗi xảy ra',
  description: 'Mô tả chung',
} as const;

const ERROR_ROOT_CLASSES = {
  app: [
    'bg-bg-page',
    'flex',
    'h-dvh',
    'items-center-safe',
    'justify-center',
    'overflow-y-auto',
    'overscroll-y-contain',
    'px-4',
  ],
  content: ['flex', 'h-full', 'items-center', 'justify-center', 'min-h-60', 'px-4', 'py-6'],
};

describe('màn chờ tải', () => {
  it('cấp app: chiếm trọn màn hình, spinner lớn, nhãn "Đang tải…"', () => {
    const { container } = render(<LoadingScreen level="app" />);

    expect(classSet(container.firstElementChild!)).toEqual([
      'bg-bg-page',
      'flex',
      'flex-col',
      'gap-3',
      'items-center',
      'justify-center',
      'min-h-dvh',
    ]);
    const spinner = screen.getByRole('status', { name: 'Đang tải' });
    expect(classSet(spinner)).toEqual(expect.arrayContaining(['h-12', 'w-12', 'text-primary-6']));
    expect(screen.getByText('Đang tải…')).toHaveClass('text-body-14', 'text-fg-muted');
  });

  it('mặc định là cấp content: chỉ lấp vùng nội dung, spinner vừa, không nền riêng', () => {
    const { container } = render(<LoadingScreen />);

    expect(classSet(container.firstElementChild!)).toEqual([
      'flex',
      'flex-col',
      'gap-3',
      'h-full',
      'items-center',
      'justify-center',
      'min-h-60',
    ]);
    const spinner = screen.getByRole('status', { name: 'Đang tải' });
    expect(classSet(spinner)).toEqual(expect.arrayContaining(['h-8', 'w-8', 'text-primary-6']));
    expect(screen.getByText('Đang tải…')).toBeInTheDocument();
  });
});

describe('màn lỗi', () => {
  it.each(['app', 'content'] as const)('cấp %s: khung ngoài role=alert đúng bộ class', (level) => {
    render(<ErrorScreen error={GENERIC_ERROR} level={level} />);

    expect(classSet(screen.getByRole('alert'))).toEqual(ERROR_ROOT_CLASSES[level]);
  });

  it('mặc định là cấp content', () => {
    render(<ErrorScreen error={GENERIC_ERROR} />);

    expect(classSet(screen.getByRole('alert'))).toEqual(ERROR_ROOT_CLASSES.content);
  });

  it('thẻ nội dung giữ bộ class (bo 2xl + squircle); tiêu đề là h4, mô tả là chữ muted', () => {
    render(<ErrorScreen error={GENERIC_ERROR} />);

    const card = screen.getByRole('alert').firstElementChild!;
    expect(classSet(card)).toEqual([
      'bg-bg-surface',
      'border',
      'border-border-default',
      'flex',
      'flex-col',
      'gap-3',
      'items-center',
      'max-w-md',
      'p-6',
      'rounded-2xl',
      'shadow-[0_4px_20px_var(--color-shadow-popup)]',
      'squircle',
      'text-center',
      'w-full',
    ]);
    expect(screen.getByRole('heading', { level: 4, name: 'Có lỗi xảy ra' })).toBeInTheDocument();
    expect(screen.getByText('Mô tả chung')).toHaveClass('text-body-14', 'text-fg-muted');
  });

  it('ô icon bo `lg` có viền, không còn ngoặc góc (cùng khuôn ô icon của EmptyState)', () => {
    render(<ErrorScreen error={GENERIC_ERROR} />);

    const iconBox = screen.getByRole('alert').querySelector('svg')!.parentElement!;
    expect(iconBox).toHaveClass('rounded-lg', 'border');
    expect(iconBox.className).not.toMatch(/(before|after):/);
  });

  it('lỗi tải chunk: icon xoay màu warning, chỉ có nút "Tải lại trang"', () => {
    const { container } = render(<ErrorScreen error={CHUNK_ERROR} level="app" />);

    const icon = container.querySelector('svg')!;
    const expectedIcon = render(
      <SystemIcon aria-hidden className="text-warning" name="arrows-rotate-bold" size={40} />,
    ).container.querySelector('svg')!;
    expect(icon.outerHTML).toBe(expectedIcon.outerHTML);
    expect(icon).toHaveAttribute('aria-hidden', 'true');

    expect(screen.getByRole('heading', { name: 'Không tải được trang' })).toBeInTheDocument();
    expect(screen.getByText('Mô tả chunk')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tải lại trang' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Về trang chủ' })).not.toBeInTheDocument();
  });

  it.each(['unexpected', 'response'] as const)(
    'lỗi %s: icon cảnh báo màu error, có cả "Tải lại trang" lẫn "Về trang chủ"',
    (kind) => {
      const { container } = render(<ErrorScreen error={{ ...GENERIC_ERROR, kind }} />);

      const icon = container.querySelector('svg')!;
      const expectedIcon = render(
        <SystemIcon
          aria-hidden
          className="text-error"
          name="triangle-exclamation-bold"
          size={40}
        />,
      ).container.querySelector('svg')!;
      expect(icon.outerHTML).toBe(expectedIcon.outerHTML);

      const buttons = screen.getAllByRole('button').map((button) => button.textContent);
      expect(buttons).toEqual(['Tải lại trang', 'Về trang chủ']);
    },
  );
});

describe('App — ranh giới Suspense ngoài cùng', () => {
  it('chờ provider → hiện đúng màn chờ cấp app (cùng màn với guard đang khôi phục phiên)', () => {
    const { container } = render(<App />);

    expect(within(container).getByText('Đang tải…')).toBeInTheDocument();
    const reference = render(<LoadingScreen level="app" />).container.firstElementChild!;
    expect(container.firstElementChild!.outerHTML).toBe(reference.outerHTML);
  });
});

describe('màn lỗi — điều hướng CỨNG', () => {
  const reload = vi.fn();
  const assign = vi.fn();

  afterEach(() => {
    vi.unstubAllGlobals();
    reload.mockClear();
    assign.mockClear();
  });

  it('"Tải lại trang" gọi location.reload, "Về trang chủ" gọi location.assign("/")', () => {
    vi.stubGlobal('location', { ...window.location, reload, assign });
    render(<ErrorScreen error={GENERIC_ERROR} />);

    fireEvent.click(screen.getByRole('button', { name: 'Tải lại trang' }));
    expect(reload).toHaveBeenCalledTimes(1);
    expect(assign).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Về trang chủ' }));
    expect(assign).toHaveBeenCalledExactlyOnceWith('/');
  });
});

/**
 * Khu vực "Responsive lab" của trang `/demo`: dựng được, chip biến thể đọc đúng `matchMedia` và đổi theo
 * `change`, số đo bám `innerWidth × innerHeight`, bảng thiết bị dựng đúng khung xem thử, và trong khung thì
 * không lồng khung (xem `notes/code/demo.md`, mục ResponsiveLabSection).
 *
 * jsdom không nạp trang trong `<iframe>` nên bài kiểm chỉ hỏi thuộc tính `src` / cỡ của khung.
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BELOW_WIDE_QUERY,
  PHONE_MEDIA_QUERY,
  TOUCH_MEDIA_QUERY,
} from '@/shared/constants/media-query.constants';
import { DEMO_DEVICE_GROUPS } from '@/features/demo/library/constants/foundations/responsive-lab.constants';
import ResponsiveLabSection from '@/features/demo/library/sections/foundations/ResponsiveLabSection';
import { DEMO_SECTIONS } from '@/features/demo/library/sections.constants';

type Listener = (event: MediaQueryListEvent) => void;

const originalMatchMedia = window.matchMedia;
const originalSize = { width: window.innerWidth, height: window.innerHeight };

/** `matchMedia` giả: query nằm trong `matching` thì khớp; `setMatching` bắn `change` cho listener đã đăng ký. */
function installMatchMedia(initial: string[]) {
  let matching = new Set(initial);
  const listeners = new Map<string, Set<Listener>>();

  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return matching.has(query);
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, fn: Listener) => {
      listeners.set(query, (listeners.get(query) ?? new Set()).add(fn));
    },
    removeEventListener: (_: string, fn: Listener) => listeners.get(query)?.delete(fn),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;

  return (next: string[]) => {
    matching = new Set(next);
    act(() => {
      for (const [query, fns] of listeners) {
        fns.forEach((fn) =>
          fn({ matches: matching.has(query), media: query } as MediaQueryListEvent),
        );
      }
    });
  };
}

function setViewport(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true });
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
    writable: true,
  });
  act(() => {
    window.dispatchEvent(new Event('resize'));
  });
}

/** Giá trị in trong ô số đo có nhãn `caption`. */
const tileValue = (caption: string) => screen.getByText(caption).nextElementSibling?.textContent;

/** Chip `label` → chữ trạng thái trong cùng Badge ("khớp" | "không"). */
const chipState = (label: string) => screen.getByText(label).parentElement?.textContent ?? '';

beforeEach(() => {
  window.matchMedia = originalMatchMedia;
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  setViewport(originalSize.width, originalSize.height);
  vi.restoreAllMocks();
});

describe('Responsive lab — có mặt trong mục lục', () => {
  it('DEMO_SECTIONS có `responsive-lab` thuộc nhóm nền tảng', () => {
    const entry = DEMO_SECTIONS.find((s) => s.id === 'responsive-lab');
    expect(entry?.group).toBe('foundations');
    expect(entry?.Section).toBe(ResponsiveLabSection);
  });
});

describe('Responsive lab — số đo và chip biến thể', () => {
  it('in viewport, hướng và nhóm màn của khung nhìn hiện tại', () => {
    installMatchMedia([]);
    setViewport(1366, 768);
    render(<ResponsiveLabSection />);

    expect(tileValue('viewport CSS (rộng × cao)')).toBe('1366×768');
    expect(screen.getByText('Ngang')).toBeInTheDocument();
    expect(tileValue('nhóm màn theo thang chuẩn')).toBe('Laptop 14"');
  });

  it('đổi cỡ cửa sổ thì số đo đổi theo, không cần tải lại', async () => {
    installMatchMedia([]);
    setViewport(1280, 720);
    render(<ResponsiveLabSection />);
    expect(tileValue('viewport CSS (rộng × cao)')).toBe('1280×720');

    setViewport(390, 844);
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
    });

    expect(tileValue('viewport CSS (rộng × cao)')).toBe('390×844');
    expect(screen.getByText('Dọc')).toBeInTheDocument();
  });

  it('chip chỉ "khớp" khi media query tương ứng khớp, và đổi khi `change` bắn', () => {
    const setMatching = installMatchMedia([PHONE_MEDIA_QUERY, TOUCH_MEDIA_QUERY, BELOW_WIDE_QUERY]);
    render(<ResponsiveLabSection />);

    expect(chipState('phone:')).toContain('khớp');
    expect(chipState('touch:')).toContain('khớp');
    expect(chipState('max-wide:')).toContain('khớp');
    expect(chipState('lg:')).toContain('không');
    expect(chipState('tv:')).toContain('không');

    setMatching(['(min-width: 1024px)']);

    expect(chipState('phone:')).toContain('không');
    expect(chipState('touch:')).toContain('không');
    expect(chipState('lg:')).toContain('khớp');
  });
});

describe('Responsive lab — bảng thiết bị và khung xem thử', () => {
  const allViewportCount = DEMO_DEVICE_GROUPS.reduce((n, g) => n + g.viewports.length, 0);

  it('mỗi viewport của bảng có một nút "Xem ở khung này"', () => {
    installMatchMedia([]);
    render(<ResponsiveLabSection />);

    expect(screen.getAllByRole('button', { name: /^Xem ở khung / })).toHaveLength(allViewportCount);
    expect(screen.getByRole('button', { name: /Xem ở khung 390 × 844/ })).toBeInTheDocument();
  });

  it('chưa chọn cỡ thì chưa dựng iframe (khỏi nạp cả app ngay khi mở trang)', () => {
    installMatchMedia([]);
    const { container } = render(<ResponsiveLabSection />);

    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Chưa chọn cỡ khung')).toBeInTheDocument();
  });

  it('bấm một cỡ dựng iframe đúng cỡ + nạp màn ghép; xoay đổi rộng ↔ cao; đổi trang đổi src', () => {
    installMatchMedia([]);
    const { container } = render(<ResponsiveLabSection />);

    fireEvent.click(screen.getByRole('button', { name: /Xem ở khung 390 × 844/ }));
    const frame = () => container.querySelector('iframe') as HTMLIFrameElement;
    expect(frame().getAttribute('src')).toBe('/demo/ghep');
    expect(frame().style.width).toBe('390px');
    expect(frame().style.height).toBe('844px');

    fireEvent.click(screen.getByRole('button', { name: 'Xoay' }));
    expect(frame().style.width).toBe('844px');
    expect(frame().style.height).toBe('390px');

    fireEvent.click(screen.getByRole('button', { name: 'Tổng quan' }));
    expect(frame().getAttribute('src')).toBe('/demo/tong-quan');
  });

  it('chọn nhanh một cỡ ở thanh công cụ cũng dựng khung', () => {
    installMatchMedia([]);
    const { container } = render(<ResponsiveLabSection />);

    fireEvent.click(screen.getByRole('button', { name: '768' }));

    expect((container.querySelector('iframe') as HTMLIFrameElement).style.width).toBe('768px');
  });

  it('mở trang ở tab mới là liên kết thật tới đúng trang đang chọn', () => {
    installMatchMedia([]);
    render(<ResponsiveLabSection />);

    const link = screen.getByRole('link', { name: 'Mở tab mới' });

    expect(link).toHaveAttribute('href', '/demo/ghep');
    expect(link).toHaveAttribute('target', '_blank');
  });
});

describe('Responsive lab — chạy TRONG khung xem thử', () => {
  it('không dựng bảng thiết bị / khung lồng khung, chỉ còn số đo + chip và lời báo', () => {
    installMatchMedia([]);
    const original = Object.getOwnPropertyDescriptor(window, 'self');
    Object.defineProperty(window, 'self', { value: {}, configurable: true });

    try {
      const { container } = render(<ResponsiveLabSection />);

      expect(screen.getByText('Đang chạy trong khung xem thử')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Xem ở khung / })).toBeNull();
      expect(container.querySelector('iframe')).toBeNull();
      expect(within(container).getByText('viewport CSS (rộng × cao)')).toBeInTheDocument();
    } finally {
      if (original) Object.defineProperty(window, 'self', original);
    }
  });
});

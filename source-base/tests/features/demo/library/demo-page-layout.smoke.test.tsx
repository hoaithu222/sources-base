/**
 * `DemoPage` chọn dạng mục lục + chỗ đặt header theo `matchMedia`: từ `lg` mục lục là cột dọc và header nằm
 * NGOÀI vùng cuộn; dưới `lg` mục lục là dải chip và header trôi theo vùng cuộn. Liên kết sang màn ghép /
 * dashboard luôn ở header, đúng một bản.
 *
 * Là smoke vì mỗi ca dựng CẢ trang (mọi nhóm UI kit + biểu đồ) — thời gian chủ yếu là nạp module, đổi theo số
 * worker chạy song song; ở nhóm `unit` (5 giây) chúng đỏ ngẫu nhiên khi máy bận (`testing.md`).
 * Phần LOGIC của riêng hai dạng mục lục nằm ở `demo-side-nav.test.tsx`.
 */

import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DemoPage from '@/features/demo/library/pages/DemoPage';
import { DEMO_SECTIONS } from '@/features/demo/library/sections.constants';

const BELOW_LG = '(max-width: 1023.98px)';
const original = window.matchMedia;

function stubMatchMedia(matching: string[]) {
  window.matchMedia = vi.fn((query: string) => ({
    matches: matching.includes(query),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function renderDemoPage() {
  const router = createMemoryRouter([{ path: '/', element: <DemoPage /> }]);
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  window.matchMedia = original;
});

describe('DemoPage chọn dạng mục lục theo cỡ màn', () => {
  it.each([
    { name: 'từ lg', matching: [] as string[] },
    { name: 'dưới lg', matching: [BELOW_LG] },
  ])(
    '$name: liên kết màn ghép + dashboard ở header, đúng một bản, trỏ đúng route',
    ({ matching }) => {
      stubMatchMedia(matching);
      renderDemoPage();

      const composed = screen.getAllByRole('link', { name: /ví dụ ghép thực tế/i });
      const dashboard = screen.getAllByRole('link', { name: /dashboard dự án/i });
      expect(composed).toHaveLength(1);
      expect(composed[0]).toHaveAttribute('href', '/demo/ghep');
      expect(dashboard).toHaveLength(1);
      expect(dashboard[0]).toHaveAttribute('href', '/demo/tong-quan');
    },
  );

  it('từ lg: mục lục là cột dọc; dưới lg: dải chip — mỗi bên đủ mọi khu vực', () => {
    stubMatchMedia([]);
    const wide = renderDemoPage();
    const countLinks = () =>
      within(screen.getByRole('navigation', { name: /Mục lục thư viện giao diện/i })).getAllByRole(
        'link',
      ).length;
    expect(countLinks()).toBe(DEMO_SECTIONS.length);
    wide.unmount();

    stubMatchMedia([BELOW_LG]);
    renderDemoPage();
    expect(countLinks()).toBe(DEMO_SECTIONS.length);
  });

  it('header trang nằm NGOÀI vùng cuộn từ lg, nhưng TRONG vùng cuộn (trôi đi) khi hẹp hơn', () => {
    const scroller = () =>
      screen
        .getByRole('heading', { level: 1, name: 'Thư viện giao diện' })
        .closest('.overflow-y-auto');

    stubMatchMedia([]);
    const wide = renderDemoPage();
    expect(scroller()).toBeNull();
    wide.unmount();

    stubMatchMedia([BELOW_LG]);
    renderDemoPage();
    expect(scroller()).not.toBeNull();
  });
});

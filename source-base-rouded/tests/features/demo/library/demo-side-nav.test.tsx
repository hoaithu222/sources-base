/**
 * Mục lục `/demo` dùng được ở mọi cỡ: cột dọc `DemoSideNav` (từ `lg`) và dải chip ngang `DemoSectionChips`
 * (dưới `lg`) cùng liệt kê ĐỦ mọi khu vực, tô mục đang xem; liên kết sang các màn mẫu khác luôn ở header của
 * trang (kit tự xuống hàng khi hẹp). Việc `DemoPage` chọn dạng mục lục theo `matchMedia` dựng cả trang nên
 * nằm ở `demo-page-layout.smoke.test.tsx`.
 *
 * jsdom không có CSS nên bài kiểm không đo bố cục (cuộn ngang, vùng chạm — đã chụp ảnh ở nhiều cỡ): nó giữ
 * phần LOGIC — danh sách mục, `aria-current`.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import DemoSectionChips from '@/features/demo/library/components/shell/DemoSectionChips';
import DemoSideNav from '@/features/demo/library/components/shell/DemoSideNav';
import { DEMO_SECTIONS } from '@/features/demo/library/sections.constants';

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter([{ path: '/', element: ui }]);
  return render(<RouterProvider router={router} />);
}

describe.each([
  { name: 'DemoSideNav (cột dọc, từ lg)', Nav: DemoSideNav },
  { name: 'DemoSectionChips (dải chip, dưới lg)', Nav: DemoSectionChips },
])('$name', ({ Nav }) => {
  const renderNav = () =>
    renderWithRouter(<Nav scrollRef={{ current: document.createElement('div') }} />);

  it('mỗi khu vực của DEMO_SECTIONS có đúng một liên kết #id trong mục lục', () => {
    renderNav();
    const nav = screen.getByRole('navigation', { name: /Mục lục thư viện giao diện/i });

    for (const { id, label } of DEMO_SECTIONS) {
      const links = within(nav)
        .getAllByRole('link', { name: label })
        .filter((a) => a.getAttribute('href') === `#${id}`);
      expect(links, `thiếu liên kết #${id}`).toHaveLength(1);
    }
  });

  it('có mục "Responsive lab" trong mục lục', () => {
    renderNav();
    expect(screen.getByRole('link', { name: 'Responsive lab' })).toHaveAttribute(
      'href',
      '#responsive-lab',
    );
  });

  it('bấm một mục thì mục đó được tô (`aria-current="location"`), mục khác bỏ tô', () => {
    renderNav();
    const first = screen.getByRole('link', { name: DEMO_SECTIONS[0].label });
    const lab = screen.getByRole('link', { name: 'Responsive lab' });
    expect(first).toHaveAttribute('aria-current', 'location');

    fireEvent.click(lab);

    expect(lab).toHaveAttribute('aria-current', 'location');
    expect(first).not.toHaveAttribute('aria-current');
  });
});

describe('liên kết sang các màn mẫu khác', () => {
  it.each([
    { name: 'DemoSideNav (cột dọc)', Nav: DemoSideNav },
    { name: 'DemoSectionChips (dải chip)', Nav: DemoSectionChips },
  ])('$name chỉ liệt kê khu vực — liên kết màn mẫu thuộc header trang', ({ Nav }) => {
    renderWithRouter(<Nav scrollRef={{ current: document.createElement('div') }} />);
    expect(screen.queryByRole('link', { name: /ví dụ ghép thực tế/i })).toBeNull();
  });
});

/**
 * Khung của các trang NGOÀI khung ứng dụng (đăng nhập, đăng ký, 403, 404): vùng cuộn + landmark.
 *
 * `body` khoá cuộn (`styles/base/document.css`) để khung ứng dụng tự cuộn trong `<main>`. Thiếu vùng cuộn
 * ở gốc thì trang đăng ký cao hơn màn hình (máy tính bảng dọc, cửa sổ hẹp) bị cắt mất nút "Đăng ký" —
 * cuộn chuột không làm gì (đo trên Chrome 768×800: nút ở y=830). jsdom không dựng layout nên bài này
 * ghim hợp đồng class của `RootLayout`; con không được co (`*:shrink-0`): co về `min-h-dvh` thì
 * `overflow-hidden` của con cắt phần thừa.
 *
 * Mỗi trang có đúng MỘT landmark `<main>` và tiêu đề `<h1>` — trình đọc màn hình nhảy theo đó.
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthLayout, RootLayout } from '@/app/layouts';
import NotFoundPage from '@/app/pages/status/NotFoundPage';

function renderFrame(element: React.ReactElement, page: React.ReactElement) {
  const router = createMemoryRouter([{ element, children: [{ path: '/', element: page }] }]);
  render(<RouterProvider router={router} />);
}

describe('RootLayout', () => {
  it('cao đúng một màn hình và tự cuộn dọc; con không co lại', () => {
    renderFrame(<RootLayout />, <p>Trang đăng ký</p>);

    const root = screen.getByText('Trang đăng ký').parentElement!;
    expect(root).toHaveClass('h-dvh', 'overflow-y-auto', 'bg-bg-page', '*:shrink-0');
    expect(root).not.toHaveClass('min-h-dvh');
  });

  it('khung gốc không dựng lại khi đổi trang → sang trang khác về đầu (`useRouteScrollRestoration`)', async () => {
    const router = createMemoryRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { path: '/register', element: <p>Trang đăng ký</p> },
            { path: '/login', element: <p>Trang đăng nhập</p> },
          ],
        },
      ],
      { initialEntries: ['/register'] },
    );
    render(<RouterProvider router={router} />);
    const root = screen.getByText('Trang đăng ký').parentElement!;
    root.scrollTop = 135;
    fireEvent.scroll(root);

    await act(() => router.navigate('/login'));

    expect(screen.getByText('Trang đăng nhập').parentElement).toBe(root);
    expect(root.scrollTop).toBe(0);
  });
});

describe('landmark của trang ngoài khung ứng dụng', () => {
  it('AuthLayout: khoang form là `<main>` duy nhất, khoang thương hiệu nằm ngoài', () => {
    renderFrame(<AuthLayout />, <p>Form đăng nhập</p>);

    const main = screen.getByRole('main');
    expect(main).toContainElement(screen.getByText('Form đăng nhập'));
    expect(main).not.toHaveTextContent('Vận hành trên một hệ');
  });

  it('AuthLayout trên điện thoại: một cột, khoang thương hiệu chỉ giữ logo + tên app (form lên đầu màn)', () => {
    renderFrame(<AuthLayout />, <p>Form đăng nhập</p>);

    expect(screen.getByText('Vận hành trên một hệ').closest('.phone\\:hidden')).not.toBeNull();
    expect(screen.getAllByText('Base App').length).toBeGreaterThan(0);
  });

  it('trang trạng thái (404): khung là `<main>`, tiêu đề là `<h1>`', () => {
    renderFrame(<RootLayout />, <NotFoundPage />);

    const heading = screen.getByRole('heading', { level: 1, name: 'Không tìm thấy trang' });
    expect(screen.getByRole('main')).toContainElement(heading);
  });
});

describe('trang ngoài khung ứng dụng luôn bo góc (cả hai theme)', () => {
  it('AuthLayout: thẻ hai khoang bo `2xl` + squircle (điện thoại `xl`), `overflow-hidden` để hai khoang ăn theo góc bo', () => {
    const { container } = render(
      <RouterProvider
        router={createMemoryRouter([
          { element: <AuthLayout />, children: [{ path: '/', element: <p>Form đăng nhập</p> }] },
        ])}
      />,
    );

    const card = container.querySelector('.auth-card');
    expect(card).toHaveClass('rounded-2xl', 'phone:rounded-xl', 'squircle', 'overflow-hidden');
  });

  it('AuthLayout: ô logo của khoang thương hiệu bo góc, không còn vát `clip-path`', () => {
    const { container } = render(
      <RouterProvider
        router={createMemoryRouter([
          { element: <AuthLayout />, children: [{ path: '/', element: <p>Form đăng nhập</p> }] },
        ])}
      />,
    );

    const mark = container.querySelector('.auth-card section span[aria-hidden]');
    expect(mark).toHaveClass('rounded-xl', 'squircle');
    expect(mark?.className).not.toContain('clip-path');
  });

  it('trang trạng thái (404): ô logo và từng ô số bo góc, không còn vát', () => {
    const { container } = render(
      <RouterProvider
        router={createMemoryRouter([
          { element: <RootLayout />, children: [{ path: '/', element: <NotFoundPage /> }] },
        ])}
      />,
    );

    const tiles = [...container.querySelectorAll('main span[aria-hidden]')].filter((el) =>
      el.className.includes('squircle'),
    );
    expect(tiles.length).toBe(4); // 1 ô logo + 3 ô số của "404"
    for (const tile of tiles) {
      expect(tile.className).toMatch(/rounded-(md|lg)/);
      expect(tile.className).not.toContain('clip-path');
    }
  });
});

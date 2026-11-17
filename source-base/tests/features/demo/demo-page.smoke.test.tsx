/**
 * Trang thư viện giao diện phải dựng được.
 *
 * Vì sao đáng một bài kiểm riêng: trang này mount MỌI nhóm của UI kit cùng lúc,
 * nên nó là cái bẫy rẻ nhất cho những lỗi mà `tsc` không thấy — barrel trỏ nhầm
 * file, bảng `*_CLASSES` thiếu ô, component ném ngay lượt render đầu, hoặc một
 * đường import vòng chỉ lộ ra lúc chạy.
 *
 * Cố ý NÔNG: chỉ hỏi "có dựng ra DOM mà không ném không" và các khu vực có mặt
 * đủ. Hành vi từng component là việc của bài kiểm riêng.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import DemoPage from '@/features/demo/library/pages/DemoPage';
import { DEMO_SECTIONS } from '@/features/demo/library/sections.constants';

/**
 * jsdom không có `ResizeObserver`, mà `useChartMetrics` (qua `useElementSize`)
 * và `Tree` đều cần. Bản giả tối thiểu: đăng ký được, không bao giờ bắn.
 */
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function renderDemoPage() {
  const router = createMemoryRouter([{ path: '/', element: <DemoPage /> }], {
    initialEntries: ['/'],
  });
  return render(<RouterProvider router={router} />);
}

describe('trang thư viện giao diện', () => {
  it('dựng được toàn bộ trang và đủ mọi khu vực trong mục lục', async () => {
    globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;

    const { container } = renderDemoPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Thư viện giao diện/i })).toBeInTheDocument();
    });

    // Mỗi mục trong mục lục PHẢI có đúng một khu vực mang `id` tương ứng —
    // thêm mục mà quên mount (hoặc ngược lại) là lỗi im lặng: thanh điều hướng
    // trỏ tới một neo không tồn tại, bấm vào không đi đâu cả.
    for (const section of DEMO_SECTIONS) {
      expect(
        container.querySelector(`#${section.id}`),
        `thiếu khu vực #${section.id}`,
      ).not.toBeNull();
    }
  });

  it('khu vực nào cũng có RUỘT, không chỉ có cái khung rỗng', async () => {
    globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;

    const { container } = renderDemoPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Thư viện giao diện/i })).toBeInTheDocument();
    });

    /*
     * Vì sao cần bài kiểm riêng: neo `<section id>` do `DemoPage` dựng từ
     * `DEMO_SECTIONS`, nên bài kiểm trên vẫn XANH khi một section render rỗng
     * (hoặc ai đó thêm cơ chế hoãn gắn ruột theo tầm nhìn — `notes/code/demo.md`
     * giải thích vì sao KHÔNG làm vậy). Đây là chỗ bắt đúng ca đó.
     */
    await waitFor(() => {
      const thin = DEMO_SECTIONS.filter((s) => {
        const el = container.querySelector(`#${s.id}`);
        return (el?.textContent?.trim().length ?? 0) < 40;
      }).map((s) => s.id);

      expect(
        thin,
        `Khu vực gần như rỗng — section có render ruột không?\n  ${thin.join('\n  ')}`,
      ).toEqual([]);
    });
  });
});

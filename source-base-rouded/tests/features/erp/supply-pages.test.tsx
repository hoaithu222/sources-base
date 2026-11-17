/**
 * Hai màn chuỗi cung ứng — "Đơn mua" (`/mua-hang/don-mua`) và "Tồn kho" (`/kho-van/ton-kho`) — dựng được dưới router
 * cùng thanh header, đủ khối, và bộ lọc thật sự lọc: luồng trạng thái + ô tìm của đơn mua, bộ chọn kho + ô tìm +
 * công tắc "chỉ hiện cảnh báo" của tồn kho.
 *
 * Cố ý NÔNG: jsdom không có layout nên không kiểm kích thước — phần đó do ảnh chụp màn hình lo. Số liệu mẫu tĩnh với
 * "hôm nay" cố định (`PURCHASE_TODAY`, `STOCK_TODAY`) nên các con số ghim được.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import PurchaseOrdersPage from '@/features/erp/supply/pages/PurchaseOrdersPage';
import StockPage from '@/features/erp/supply/pages/StockPage';
import { Header, HeaderSlotsProvider } from '@/shared/widgets/header';

function renderWithHeader(page: ReactElement) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <HeaderSlotsProvider>
            <Header user={{ displayName: 'An', role: 'Quản trị' }} />
            {page}
          </HeaderSlotsProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

const searchInto = (label: string, text: string) =>
  fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value: text } });

describe('màn Đơn mua', () => {
  it('có tên màn trên header, bốn KPI và ba khối có tiêu đề h2', () => {
    renderWithHeader(<PurchaseOrdersPage />);

    expect(
      within(screen.getByRole('banner')).getByRole('heading', { level: 1, name: 'Đơn mua' }),
    ).toBeInTheDocument();

    const kpi = screen.getByRole('region', { name: 'Chỉ số đơn mua' });
    ['Đơn đang mở', 'Giá trị đơn mở', 'Trễ hạn giao', 'Tỉ lệ giao đúng hạn'].forEach((label) =>
      expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );
    expect(within(kpi).getByText('5/6 đơn hoàn tất đúng hạn')).toBeInTheDocument();

    ['Danh sách', 'Top 5 nhà cung cấp', 'Đặt mua theo tháng'].forEach((title) =>
      expect(
        screen.getByRole('heading', { level: 2, name: new RegExp(title) }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole('img', { name: /Top 5 nhà cung cấp/ })).toBeInTheDocument();
  });

  it('lọc trạng thái trên cột dọc mép phải có số đơn từng trạng thái; chọn "Chờ duyệt" chỉ còn đơn chờ duyệt', () => {
    renderWithHeader(<PurchaseOrdersPage />);

    fireEvent.click(screen.getByRole('button', { name: /^Trạng thái đơn · Tất cả trạng thái/ }));
    const all = screen.getByRole('radio', { name: /^Tất cả trạng thái/ });
    expect(all).toHaveAttribute('aria-checked', 'true');
    expect(all).toHaveTextContent('30 đơn');

    fireEvent.click(screen.getByRole('radio', { name: /^Chờ duyệt/ }));

    expect(
      screen.getByRole('button', { name: /^Trạng thái đơn · Chờ duyệt \(đang áp dụng\)/ }),
    ).toBeInTheDocument();
    expect(screen.getByText('Trạng thái: Chờ duyệt')).toBeInTheDocument();
    expect(screen.getByText('PO-2610-033')).toBeInTheDocument();
    expect(screen.queryByText('PO-2609-021')).not.toBeInTheDocument();
    expect(screen.getByText('5 đơn')).toBeInTheDocument();
  });

  it('ô tìm lọc theo nhà cung cấp (bỏ dấu); không khớp thì hiện trạng thái rỗng và xoá bộ lọc được', () => {
    renderWithHeader(<PurchaseOrdersPage />);

    searchInto('Tìm đơn mua', 'dai phong');
    expect(screen.getByText('6 đơn')).toBeInTheDocument();
    expect(screen.queryByText('PO-2610-030')).not.toBeInTheDocument();

    searchInto('Tìm đơn mua', 'khong co nha cung cap nay');
    expect(screen.getByText('Không có đơn mua nào khớp bộ lọc')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));
    expect(screen.getByText('30 đơn')).toBeInTheDocument();
  });

  it('đơn quá hạn giao in "Trễ n ngày"; đơn đang giao mà trễ cũng được đánh dấu', () => {
    renderWithHeader(<PurchaseOrdersPage />);

    expect(screen.getByText('Trễ 2 ngày')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Trạng thái đơn/ }));
    fireEvent.click(screen.getByRole('radio', { name: /^Đang giao/ }));
    expect(screen.getByText('Trễ 9 ngày')).toBeInTheDocument();
    expect(screen.getByText('Trễ 4 ngày')).toBeInTheDocument();
    expect(screen.queryByText('Trễ 2 ngày')).not.toBeInTheDocument();
  });
});

describe('màn Tồn kho', () => {
  it('có tên màn trên header, bốn KPI và ba khối có tiêu đề h2', () => {
    renderWithHeader(<StockPage />);

    expect(
      within(screen.getByRole('banner')).getByRole('heading', { level: 1, name: 'Tồn kho' }),
    ).toBeInTheDocument();

    const kpi = screen.getByRole('region', { name: 'Chỉ số tồn kho' });
    ['Giá trị tồn', 'Số mã hàng', 'Dưới tồn tối thiểu', 'Sắp hết hạn ≤ 30 ngày'].forEach((label) =>
      expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );

    ['Tồn kho theo lô', 'Cơ cấu tồn theo nhóm', 'Top 5 mã giá trị lớn'].forEach((title) =>
      expect(
        screen.getByRole('heading', { level: 2, name: new RegExp(title) }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('36 lô')).toBeInTheDocument();
  });

  it('công tắc "Chỉ hiện cảnh báo" chỉ giữ lô có cảnh báo', () => {
    renderWithHeader(<StockPage />);

    const toggle = screen.getByRole('switch', { name: 'Chỉ hiện cảnh báo' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('L2609-018')).toBeInTheDocument();

    fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('16 lô')).toBeInTheDocument();
    expect(screen.queryByText('L2609-018')).not.toBeInTheDocument();
    expect(screen.getByText('L2603-011')).toBeInTheDocument();
  });

  it('ô tìm lọc theo tên vật tư (bỏ dấu)', () => {
    renderWithHeader(<StockPage />);

    searchInto('Tìm vật tư', 'xi mang');
    expect(screen.getByText('6 lô')).toBeInTheDocument();
    expect(screen.queryByText('L2609-018')).not.toBeInTheDocument();
  });

  it('chọn kho chỉ giữ lô của kho đó (bảng + KPI)', () => {
    renderWithHeader(<StockPage />);

    fireEvent.click(screen.getByRole('button', { name: /^Kho · Tất cả kho/ }));
    fireEvent.click(screen.getByRole('radio', { name: /^Kho xưởng Long An/ }));

    expect(screen.getByText('10 lô')).toBeInTheDocument();
    expect(screen.queryByText('L2609-018')).not.toBeInTheDocument();
    expect(screen.getByText('L2603-011')).toBeInTheDocument();
  });
});

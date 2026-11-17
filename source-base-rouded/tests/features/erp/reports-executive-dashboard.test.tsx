/**
 * Màn `/bao-cao/dieu-hanh` ("Dashboard điều hành") phải dựng được dưới router và giữ ba hợp đồng:
 *   1. Có tầng tên (h1 trên header) + mỗi khối là heading thật (h2) + mỗi biểu đồ có văn bản thay thế.
 *   2. Bộ chọn kỳ (Tháng · Quý · Năm) trên thanh header đổi SỐ thật của KPI, donut và bảng khách hàng.
 *   3. "Điểm cần chú ý" là liên kết thật (`<a href>`) sang đúng màn xử lý.
 *
 * Cố ý nông: jsdom không có layout nên không kiểm kích thước — phần đó do ảnh chụp màn hình lo.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ExecutiveDashboardPage from '@/features/erp/reports/pages/ExecutiveDashboardPage';
import { Header, HeaderSlotsProvider } from '@/shared/widgets/header';

const PANEL_TITLES = [
  'Doanh thu theo tháng so với kế hoạch',
  'Cơ cấu doanh thu theo mảng',
  'Top khách hàng',
  'Điểm cần chú ý',
  'Dòng tiền thu – chi 12 tuần',
];

const KPI_LABELS = [
  'Doanh thu',
  'Lợi nhuận gộp',
  'Sản lượng gia công',
  'Tồn kho',
  'Công nợ phải thu',
];

const ATTENTION_LINKS: readonly [RegExp, string][] = [
  [/Công nợ quá hạn/, '/tai-chinh/cong-no'],
  [/Vật tư dưới tồn tối thiểu/, '/kho-van/ton-kho'],
  [/Đơn mua trễ hạn/, '/mua-hang/don-mua'],
  [/Lệnh sản xuất chậm/, '/san-xuat/tien-do'],
  [/Chấm công tháng 10/, '/nhan-su/cham-cong'],
  [/Bút toán chờ duyệt/, '/tai-chinh/so-cai'],
];

function renderDashboard() {
  const router = createMemoryRouter(
    [
      {
        path: '/bao-cao/dieu-hanh',
        element: (
          <HeaderSlotsProvider>
            <Header user={{ displayName: 'An', role: 'Quản trị' }} />
            <ExecutiveDashboardPage />
          </HeaderSlotsProvider>
        ),
      },
    ],
    { initialEntries: ['/bao-cao/dieu-hanh'] },
  );
  return render(<RouterProvider router={router} />);
}

const kpiTile = (label: string) =>
  within(screen.getByRole('region', { name: 'Chỉ số chính toàn công ty' })).getByRole('article', {
    name: label,
  });

describe('màn Dashboard điều hành', () => {
  it('có tên trang trên header, đủ năm khối h2 và năm ô KPI', () => {
    renderDashboard();

    expect(
      within(screen.getByRole('banner')).getByRole('heading', {
        level: 1,
        name: 'Dashboard điều hành',
      }),
    ).toBeInTheDocument();
    PANEL_TITLES.forEach((title) => {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    });
    KPI_LABELS.forEach((label) => expect(kpiTile(label)).toBeInTheDocument());
  });

  it('mỗi biểu đồ có văn bản thay thế cho trình đọc màn hình', () => {
    renderDashboard();

    expect(
      screen.getByRole('img', { name: /Doanh thu thực hiện và kế hoạch theo tháng/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Cơ cấu doanh thu Tháng 10\/2026/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Dòng tiền thu và chi theo tuần/ })).toBeInTheDocument();
  });

  it('đổi kỳ Tháng → Quý → Năm (cột lọc dọc mép phải) đổi số KPI, donut và bảng khách hàng', () => {
    renderDashboard();
    const pickPeriod = (label: RegExp) => {
      fireEvent.click(screen.getByRole('button', { name: /^Kỳ xem/ }));
      fireEvent.click(screen.getByRole('radio', { name: label }));
    };

    fireEvent.click(screen.getByRole('button', { name: /^Kỳ xem · Tháng 10\/2026/ }));
    expect(screen.getByRole('radio', { name: /^Tháng/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(within(kpiTile('Doanh thu')).getByText('78,9')).toBeInTheDocument();
    expect(within(kpiTile('Sản lượng gia công')).getByText('4.860')).toBeInTheDocument();
    expect(screen.getByText('Tháng 10/2026 · xếp theo doanh thu')).toBeInTheDocument();

    pickPeriod(/^Quý/);
    expect(
      screen.getByRole('button', { name: /^Kỳ xem · Quý III\/2026 \(đang áp dụng\)/ }),
    ).toBeInTheDocument();
    expect(within(kpiTile('Doanh thu')).getByText('384,9')).toBeInTheDocument();
    expect(within(kpiTile('Doanh thu')).queryByText('78,9')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Cơ cấu doanh thu Quý III\/2026/ })).toBeInTheDocument();

    pickPeriod(/^Năm/);
    expect(within(kpiTile('Doanh thu')).getByText('1.103,0')).toBeInTheDocument();
    expect(within(kpiTile('Sản lượng gia công')).getByText('68.420')).toBeInTheDocument();
    expect(screen.getByText('148,6 tỷ')).toBeInTheDocument();
    expect(screen.getByText('Năm 2026 · xếp theo doanh thu')).toBeInTheDocument();
  });

  it('"Điểm cần chú ý" là liên kết thật sang đúng màn xử lý', () => {
    renderDashboard();

    ATTENTION_LINKS.forEach(([name, href]) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
    });
    expect(screen.getByRole('link', { name: /Kết quả kinh doanh/ })).toHaveAttribute(
      'href',
      '/tai-chinh/bao-cao/ket-qua',
    );
  });
});

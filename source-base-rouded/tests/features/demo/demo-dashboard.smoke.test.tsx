/**
 * Màn `/demo/tong-quan` phải dựng được dưới router và đủ mọi khối.
 *
 * Màn này ghép PageShell + PageHeader (tên dự án trên thanh header) + 6 thẻ KPI + 6 panel (ba biểu đồ Recharts, ba bảng) nên là
 * chỗ rẻ nhất để bắt lỗi chỉ lộ ở tầng ghép: panel thiếu tiêu đề thật, chart ném lỗi ngay lượt render
 * đầu, đồng hồ không chạy, nút lọc thời gian không đổi biểu đồ.
 *
 * Cố ý NÔNG và nhanh: jsdom không có layout nên không kiểm kích thước — phần đó do ảnh chụp màn hình lo.
 * Chỉ giả `Date` + `setInterval` (đồng hồ); `setTimeout` thật để RTL còn chờ được.
 */

import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Header, HeaderSlotsProvider } from '@/shared/widgets/header';
import DashboardDemoPage from '@/features/demo/dashboard/pages/DashboardDemoPage';
import {
  DASHBOARD_ALERTS,
  DASHBOARD_EQUIPMENT,
} from '@/features/demo/dashboard/constants/operations.constants';
import { DEMO_PROJECT_NAME } from '@/features/demo/shared/constants/packages.constants';
import { useToastStore } from '@/shared/ui/overlays/toast/toast.store';

const KPI_LABELS = [
  'Tổng mức đầu tư',
  'Đã giải ngân',
  'Tiến độ tổng thể',
  'Gói thầu',
  'Nhân lực công trường',
  'An toàn',
];

const PANEL_TITLES = [
  'Đường S tiến độ lũy kế',
  'Khối lượng theo hạng mục',
  'Cơ cấu gói thầu theo trạng thái',
  'Xếp hạng nhà thầu theo tiến độ',
  'Thiết bị thi công',
  'Cảnh báo & nhật ký thi công',
];

function renderDashboard() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: (
          <HeaderSlotsProvider>
            <Header user={{ displayName: 'An', role: 'Quản trị' }} />
            <DashboardDemoPage />
          </HeaderSlotsProvider>
        ),
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('màn tổng quan dự án', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date(2026, 9, 2, 8, 30, 15));
    useToastStore.setState({ toasts: [] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('có tiêu đề trang (tên dự án ở khối giữa header, dòng phụ là tooltip) và đủ sáu thẻ KPI trong một vùng có nhãn', () => {
    renderDashboard();

    expect(
      within(screen.getByRole('banner')).getByRole('heading', {
        level: 1,
        name: DEMO_PROJECT_NAME,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute(
      'title',
      `${DEMO_PROJECT_NAME} — Tổng quan dự án`,
    );
    expect(screen.queryByText('PROJECT OVERVIEW')).not.toBeInTheDocument();

    const kpi = screen.getByRole('region', { name: 'Chỉ số chính của dự án' });
    KPI_LABELS.forEach((label) => expect(within(kpi).getByText(label)).toBeInTheDocument());
    expect(within(kpi).getByText('119,7 tỷ')).toBeInTheDocument();
    expect(within(kpi).getByText('71,8 tỷ')).toBeInTheDocument();
    expect(within(kpi).getByText('62,4%')).toBeInTheDocument();
    expect(within(kpi).getByText('428 người')).toBeInTheDocument();
    expect(within(kpi).getByText('126 ngày')).toBeInTheDocument();
  });

  it('mỗi panel có tiêu đề là heading thật (h2)', () => {
    renderDashboard();

    PANEL_TITLES.forEach((title) => {
      expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
    });
  });

  it('mỗi biểu đồ có văn bản thay thế cho trình đọc màn hình', () => {
    renderDashboard();

    expect(screen.getByRole('img', { name: /Đường S lũy kế theo tháng/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Khối lượng theo hạng mục/ })).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Cơ cấu gói thầu theo trạng thái/ }),
    ).toBeInTheDocument();
  });

  it('chọn Tuần / Quý trên cột lọc dọc mép phải đổi lát cắt của đường S (văn bản thay thế đổi theo)', () => {
    renderDashboard();
    const pickRange = (label: RegExp) => {
      fireEvent.click(screen.getByRole('button', { name: /^Khoảng thời gian/ }));
      fireEvent.click(screen.getByRole('radio', { name: label }));
    };

    fireEvent.click(screen.getByRole('button', { name: /^Khoảng thời gian · Tháng/ }));
    expect(screen.getByRole('radio', { name: /^Tháng/ })).toHaveAttribute('aria-checked', 'true');
    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });

    pickRange(/^Tuần/);
    expect(
      screen.getByRole('button', { name: /^Khoảng thời gian · Tuần \(đang áp dụng\)/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Đường S lũy kế theo tuần/ })).toBeInTheDocument();

    pickRange(/^Quý/);
    expect(screen.getByRole('img', { name: /Đường S lũy kế theo quý/ })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /theo tuần/ })).not.toBeInTheDocument();
  });

  it('giờ cập nhật nằm trong tooltip của nút làm mới (trên thanh header), chạy theo đồng hồ mỗi giây', () => {
    renderDashboard();

    fireEvent.focus(screen.getByRole('button', { name: 'Làm mới số liệu' }));
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.getAllByText(/cập nhật lúc 08:30:1\d/).length).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getAllByText(/cập nhật lúc 08:30:1\d/).length).toBeGreaterThan(0);
  });

  it('nút làm mới báo toast và dựng lại số liệu', () => {
    renderDashboard();

    fireEvent.click(screen.getByRole('button', { name: 'Làm mới số liệu' }));

    expect(useToastStore.getState().toasts.map((toast) => toast.title)).toContain(
      'Đã làm mới số liệu dự án',
    );
    expect(screen.getByRole('region', { name: 'Chỉ số chính của dự án' })).toBeInTheDocument();
  });

  it('bảng thiết bị liệt kê đủ loại máy; bảng cảnh báo có dòng đầu', () => {
    renderDashboard();

    DASHBOARD_EQUIPMENT.forEach((row) => {
      expect(screen.getAllByText(row.name).length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText(DASHBOARD_ALERTS[0].message).length).toBeGreaterThan(0);
  });
});

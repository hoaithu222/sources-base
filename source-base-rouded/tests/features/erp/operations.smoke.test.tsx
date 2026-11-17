/**
 * Hai màn vận hành `src/features/erp/operations` phải dựng được dưới router + header thật và đủ khối.
 *
 * Tiến độ sản xuất: tên trang trên header, bốn KPI, bộ lọc xưởng (nằm ở mép phải header) lọc được bảng lệnh, chú giải
 * dải Gantt, ba panel có heading thật. Chấm công: tên trang, bốn KPI, chú giải ký hiệu, bốn cột tổng + dòng có mặt,
 * đủ 20 nhân viên; bảng công sinh ỔN ĐỊNH theo tháng (cùng tháng → cùng kết quả) và tháng hiện tại chỉ chấm tới hôm nay.
 *
 * Cố ý NÔNG: jsdom không có layout — vừa một màn hình, ghim cột, dòng tổng dính đáy do ảnh chụp màn hình lo.
 */

import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { OPS_TODAY } from '@/features/erp/operations/constants/operations.constants';
import { PRODUCTION_ORDERS } from '@/features/erp/operations/constants/production-orders.constants';
import {
  EMPLOYEES,
  TIMESHEET_CODES,
} from '@/features/erp/operations/constants/timesheet.constants';
import ProductionProgressPage from '@/features/erp/operations/pages/ProductionProgressPage';
import TimesheetPage from '@/features/erp/operations/pages/TimesheetPage';
import { buildOrderViews } from '@/features/erp/operations/utils/production.utils';
import {
  buildTimesheet,
  filterTimesheetRows,
} from '@/features/erp/operations/utils/timesheet.utils';
import { Header, HeaderSlotsProvider } from '@/shared/widgets/header';

function renderPage(page: ReactElement) {
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

const ordersTable = () => within(screen.getByRole('table'));

const STATUS_RANK = { late: 0, onTrack: 1, done: 2 } as const;

describe('màn tiến độ sản xuất', () => {
  it('có tên trang trên header, bốn KPI và ba panel là heading thật', () => {
    renderPage(<ProductionProgressPage />);

    expect(
      within(screen.getByRole('banner')).getByRole('heading', {
        level: 1,
        name: 'Tiến độ sản xuất',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    const kpi = screen.getByRole('region', { name: 'Chỉ số sản xuất' });
    ['Lệnh đang chạy', 'Hoàn thành đúng hạn', 'OEE', 'Lệnh trễ'].forEach((label) =>
      expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );

    expect(screen.getByRole('heading', { level: 2, name: /Lệnh sản xuất/ })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Sản lượng theo ngày (t)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Hiệu suất theo xưởng' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Chú giải dải Gantt')).toHaveTextContent(
      /Kế hoạch.*Thực tế.*Hôm nay/,
    );
  });

  it('bảng liệt kê đủ 13 lệnh, mỗi lệnh có dải Gantt mô tả kế hoạch / thực tế', () => {
    renderPage(<ProductionProgressPage />);

    PRODUCTION_ORDERS.forEach((order) => expect(screen.getByText(order.code)).toBeInTheDocument());
    expect(screen.getAllByRole('img', { name: /^Kế hoạch \d{2}\/\d{2}/ })).toHaveLength(
      PRODUCTION_ORDERS.length,
    );
    expect(screen.getByRole('img', { name: /Sản lượng 14 ngày/ })).toBeInTheDocument();
  });

  it('bộ lọc xưởng trên cột lọc dọc mép phải (KHÔNG trên thanh header) lọc bảng lệnh theo xưởng', () => {
    renderPage(<ProductionProgressPage />);

    expect(
      within(screen.getByRole('banner')).queryByRole('button', { name: /Tất cả xưởng/ }),
    ).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /^Xưởng · Tất cả xưởng/ }));
    ['Tất cả xưởng', 'Xưởng cắt uốn', 'Xưởng lồng thép', 'Xưởng hoàn thiện'].forEach((label) =>
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument(),
    );
    expect(screen.getByRole('radio', { name: 'Tất cả xưởng' })).toHaveAttribute(
      'aria-checked',
      'true',
    );

    fireEvent.click(screen.getByRole('radio', { name: 'Xưởng cắt uốn' }));

    expect(
      screen.getByRole('button', { name: /^Xưởng · Xưởng cắt uốn \(đang áp dụng\)/ }),
    ).toBeInTheDocument();
    const cutCodes = PRODUCTION_ORDERS.filter((o) => o.workshop === 'cut').map((o) => o.code);
    cutCodes.forEach((code) => expect(ordersTable().getByText(code)).toBeInTheDocument());
    expect(ordersTable().queryByText('LSX-2610-003')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Lệnh sản xuất/ })).toHaveTextContent(
      `${cutCodes.length} lệnh`,
    );
  });

  it('trạng thái lệnh tính theo hôm nay: lệnh chậm lên đầu, lệnh xong xuống cuối', () => {
    const views = buildOrderViews(PRODUCTION_ORDERS, OPS_TODAY);

    const ranks = views.map((v) => STATUS_RANK[v.status]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(views.filter((v) => v.status === 'late').map((v) => v.code)).toContain('LSX-2610-003');
    expect(views.find((v) => v.code === 'LSX-2610-002')?.status).toBe('done');
  });
});

describe('màn chấm công', () => {
  it('có tên trang trên header, bốn KPI, bộ lọc tháng + phòng ban ở cột icon bên phải', () => {
    renderPage(<TimesheetPage />);

    expect(
      within(screen.getByRole('banner')).getByRole('heading', { level: 1, name: 'Chấm công' }),
    ).toBeInTheDocument();

    const kpi = screen.getByRole('region', { name: 'Chỉ số chấm công' });
    ['Tỉ lệ đi làm', 'Giờ tăng ca', 'Đi muộn', 'Nghỉ không phép'].forEach((label) =>
      expect(within(kpi).getByText(label)).toBeInTheDocument(),
    );

    const rail = within(screen.getByRole('toolbar', { name: 'Bộ lọc' }));
    expect(
      rail.getByRole('button', { name: 'Tháng chấm công · Tháng 10/2026' }),
    ).toBeInTheDocument();
    expect(rail.getByRole('button', { name: 'Phòng ban · Tất cả phòng ban' })).toBeInTheDocument();
  });

  it('chú giải đủ ký hiệu công + đi muộn', () => {
    renderPage(<TimesheetPage />);

    const [legend] = screen.getAllByRole('list', { name: 'Chú giải ký hiệu chấm công' });
    TIMESHEET_CODES.forEach((meta) =>
      expect(within(legend).getByText(meta.label)).toBeInTheDocument(),
    );
    expect(within(legend).getByText('Đi muộn')).toBeInTheDocument();
  });

  it('lưới có đủ 20 nhân viên, cột ngày của tháng, bốn cột tổng và dòng có mặt', () => {
    renderPage(<TimesheetPage />);

    expect(
      screen.getByRole('heading', { level: 2, name: /Bảng công tháng 10\/2026/ }),
    ).toHaveTextContent('20 nhân viên');
    EMPLOYEES.forEach((employee) => expect(screen.getByText(employee.name)).toBeInTheDocument());

    const headers = screen.getAllByRole('columnheader').map((th) => th.textContent ?? '');
    ['Côngngày', 'Phépngày', 'Tăng cagiờ', 'Đi muộnlần'].forEach((total) =>
      expect(headers).toContain(total),
    );
    expect(headers).toContain('31T7');
    expect(screen.getByText('Có mặt / tổng')).toBeInTheDocument();
    expect(screen.getAllByTitle(/^Nguyễn Văn Hùng · Thứ Hai 19\/10/)).toHaveLength(1);
  });

  it('bảng công sinh ổn định theo tháng, tháng hiện tại chỉ chấm tới hôm nay, tháng 9 có nghỉ lễ', () => {
    const first = buildTimesheet('2026-10', OPS_TODAY);
    expect(buildTimesheet('2026-10', OPS_TODAY)).toEqual(first);

    expect(first.closed).toBe(false);
    expect(first.rows.every((row) => row.entries.slice(19).every((e) => e.code === null))).toBe(
      true,
    );
    expect(first.rows.every((row) => row.entries[18].code !== null)).toBe(true);

    const september = buildTimesheet('2026-09', OPS_TODAY);
    expect(september.closed).toBe(true);
    expect(
      september.rows.every((row) => row.entries[0].code === 'L' && row.entries[1].code === 'L'),
    ).toBe(true);

    expect(filterTimesheetRows(first.rows, 'cage')).toHaveLength(
      EMPLOYEES.filter((e) => e.department === 'cage').length,
    );
  });
});

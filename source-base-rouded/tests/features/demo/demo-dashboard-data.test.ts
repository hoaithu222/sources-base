/**
 * Màn `/demo/tong-quan` — số liệu tĩnh và hàm dẫn xuất phải KHỚP NHAU.
 *
 * Màn này có sáu thẻ KPI, ba biểu đồ và ba bảng cùng nói về MỘT dự án. Số nằm rải ở nhiều file nên
 * lệch một chỗ là hai panel kể hai câu chuyện khác nhau mà `tsc` không thấy. Bài kiểm này ghim:
 *   1. Số dẫn xuất từ `DEMO_PACKAGE_ROWS` (đếm gói, tổng giá trị, xếp hạng nhà thầu).
 *   2. Đường S ở cả ba mức thời gian kết thúc đúng ở con số của thẻ "Tiến độ tổng thể".
 *   3. Dữ liệu thiết bị / cảnh báo đủ để panel không rỗng.
 *   4. Route đã đăng ký đúng path và đúng tên tab.
 */

import { matchRoutes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { appRoutes } from '@/app/router';
import { getRoutePath } from '@/app/router/modules';
import { resolveDocumentTitle } from '@/app/router/sync';
import { DEMO_PACKAGE_ROWS } from '@/features/demo/shared/constants/packages.constants';
import {
  DASHBOARD_KPI,
  DASHBOARD_RANGE_OPTIONS,
  DASHBOARD_S_CURVE,
  DASHBOARD_STATUS_ORDER,
  DASHBOARD_STATUS_TOKENS,
  DASHBOARD_WORK_VOLUME,
  type DashboardRange,
} from '@/features/demo/dashboard/constants/metrics.constants';
import {
  DASHBOARD_ALERT_META,
  DASHBOARD_ALERTS,
  DASHBOARD_EQUIPMENT,
  DASHBOARD_EQUIPMENT_TOKENS,
} from '@/features/demo/dashboard/constants/operations.constants';
import {
  formatMoneyKpi,
  rankContractors,
  shortContractorName,
  summarizePackages,
} from '@/features/demo/dashboard/utils/packages.utils';
import { sCurveAxis } from '@/features/demo/shared/charts/chart-data.utils';

const RANGES = DASHBOARD_RANGE_OPTIONS.map((option) => option.key);

describe('dashboard — số dẫn xuất từ danh sách gói thầu', () => {
  it('đếm gói và cộng giá trị hợp đồng', () => {
    const summary = summarizePackages(DEMO_PACKAGE_ROWS);

    expect(summary.count).toBe(6);
    expect(summary.totalValue).toBe(119_710_000_000);
    expect(summary.byStatus).toEqual({ draft: 1, running: 2, review: 1, done: 1, late: 1 });
  });

  it('danh sách rỗng → toàn số 0, không NaN', () => {
    expect(summarizePackages([])).toEqual({
      count: 0,
      totalValue: 0,
      byStatus: { draft: 0, running: 0, review: 0, done: 0, late: 0 },
    });
    expect(rankContractors([])).toEqual([]);
  });

  it('số tiền KPI: một số lẻ, đơn vị tự chọn, 0 không in "NaN"', () => {
    expect(formatMoneyKpi(119_710_000_000)).toBe('119,7 tỷ');
    expect(formatMoneyKpi(71_800_000_000)).toBe('71,8 tỷ');
    expect(formatMoneyKpi(0)).toBe('0');
    expect(formatMoneyKpi(Number.NaN)).toBe('0');
  });

  it('bỏ tiền tố pháp nhân khỏi tên nhà thầu', () => {
    expect(shortContractorName('Công ty CP Xây dựng Trường Sơn')).toBe('Xây dựng Trường Sơn');
    expect(shortContractorName('Công ty TNHH Cơ điện Hoà Bình')).toBe('Cơ điện Hoà Bình');
    expect(shortContractorName('Tổng thầu Đông Đô')).toBe('Tổng thầu Đông Đô');
  });

  it('xếp hạng nhà thầu theo tiến độ BÌNH QUÂN GIA QUYỀN theo giá trị hợp đồng', () => {
    const ranking = rankContractors(DEMO_PACKAGE_ROWS);

    expect(ranking.map((item) => [item.label, item.value])).toEqual([
      ['Nhôm kính Nam Việt', 92],
      ['Xây dựng Trường Sơn', 74.8],
      ['Cơ điện Hoà Bình', 38],
      ['Hạ tầng Đông Đô', 21],
      ['Cảnh quan Xanh', 0],
    ]);
    expect(ranking.find((item) => item.label === 'Xây dựng Trường Sơn')?.packageCount).toBe(2);
    expect(new Set(ranking.map((item) => item.id)).size).toBe(ranking.length);
  });

  it('hai nhà thầu cùng tiến độ → nhà thầu giá trị lớn hơn đứng trước', () => {
    const base = DEMO_PACKAGE_ROWS[1];
    const ranking = rankContractors([
      { ...base, id: 'a', contractor: 'Công ty CP A', progress: 50, value: 10 },
      { ...base, id: 'b', contractor: 'Công ty CP B', progress: 50, value: 30 },
    ]);

    expect(ranking.map((item) => item.label)).toEqual(['B', 'A']);
  });
});

describe('dashboard — thẻ KPI', () => {
  it('giải ngân 71,8 tỷ ≈ 60% tổng mức đầu tư', () => {
    const { totalValue } = summarizePackages(DEMO_PACKAGE_ROWS);

    expect(Math.round((DASHBOARD_KPI.disbursed / totalValue) * 100)).toBe(60);
  });

  it('tiến độ thực tế chậm hơn kế hoạch 3,6 điểm %', () => {
    expect(DASHBOARD_KPI.planProgress - DASHBOARD_KPI.progress).toBeCloseTo(3.6, 5);
  });
});

describe.each(RANGES)('dashboard — đường S theo mức "%s"', (range: DashboardRange) => {
  const { points, nowLabel } = DASHBOARD_S_CURVE[range];
  const lastActual = points.map((point) => point.actual !== null).lastIndexOf(true);

  it('đủ điểm để vẽ và nhãn không trùng nhau', () => {
    expect(points.length).toBeGreaterThanOrEqual(7);
    expect(new Set(points.map((point) => point.label)).size).toBe(points.length);
  });

  it('kế hoạch và thực tế đều không giảm, thực tế không vượt kế hoạch', () => {
    points.forEach((point, index) => {
      if (index > 0) expect(point.plan).toBeGreaterThanOrEqual(points[index - 1].plan);
      if (point.actual !== null) {
        expect(point.actual).toBeLessThanOrEqual(point.plan);
        if (index > 0 && points[index - 1].actual !== null) {
          expect(point.actual).toBeGreaterThanOrEqual(points[index - 1].actual ?? 0);
        }
      }
    });
  });

  it('thực tế liền mạch rồi dừng ở "hiện tại"; phần sau chỉ còn kế hoạch', () => {
    expect(lastActual).toBeGreaterThan(2);
    expect(lastActual).toBeLessThan(points.length - 1);
    points.slice(lastActual + 1).forEach((point) => expect(point.actual).toBeNull());
    points.slice(0, lastActual + 1).forEach((point) => expect(point.actual).not.toBeNull());
  });

  it('điểm "hiện tại" khớp thẻ Tiến độ tổng thể (62,4% / kế hoạch 66,0%)', () => {
    expect(points[lastActual].label).toBe(nowLabel);
    expect(points[lastActual].actual).toBe(DASHBOARD_KPI.progress);
    expect(points[lastActual].plan).toBe(DASHBOARD_KPI.planProgress);
  });
});

describe('dashboard — khối lượng, trạng thái, thiết bị, cảnh báo', () => {
  it('cột chồng: tổng và cột neo đã tính sẵn', () => {
    expect(DASHBOARD_WORK_VOLUME.length).toBeGreaterThanOrEqual(5);
    DASHBOARD_WORK_VOLUME.forEach((point) => {
      expect(point.__total).toBe(point.done + point.doing + point.late);
      expect(point.__anchor).toBe(0);
      expect(point.__total).toBeGreaterThan(0);
    });
  });

  it('mỗi trạng thái gói thầu có đúng một token màu, thứ tự đủ năm trạng thái', () => {
    expect(new Set(DASHBOARD_STATUS_ORDER).size).toBe(5);
    DASHBOARD_STATUS_ORDER.forEach((status) => {
      expect(DASHBOARD_STATUS_TOKENS[status]).toMatch(/^(?:[a-z]+-\d+|chart-other)$/);
    });
  });

  it('thiết bị: chạy + nghỉ + bảo trì không âm và có ít nhất một máy', () => {
    expect(DASHBOARD_EQUIPMENT.length).toBe(4);
    DASHBOARD_EQUIPMENT.forEach((row) => {
      expect(Math.min(row.running, row.idle, row.maintenance)).toBeGreaterThanOrEqual(0);
      expect(row.running + row.idle + row.maintenance).toBeGreaterThan(0);
    });
    expect(new Set(DASHBOARD_EQUIPMENT.map((row) => row.id)).size).toBe(4);
    expect(Object.keys(DASHBOARD_EQUIPMENT_TOKENS)).toEqual(['running', 'idle', 'maintenance']);
  });

  it('cảnh báo: đủ dòng để bảng tự cuộn, giờ đúng HH:mm, mức nghiêm trọng có meta', () => {
    expect(DASHBOARD_ALERTS.length).toBeGreaterThanOrEqual(10);
    expect(new Set(DASHBOARD_ALERTS.map((alert) => alert.id)).size).toBe(DASHBOARD_ALERTS.length);
    DASHBOARD_ALERTS.forEach((alert) => {
      expect(alert.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
      expect(DASHBOARD_ALERT_META[alert.severity].label).not.toBe('');
    });
    const codes = new Set(DEMO_PACKAGE_ROWS.map((row) => row.code));
    DASHBOARD_ALERTS.forEach((alert) => {
      if (alert.packageCode) expect(codes.has(alert.packageCode)).toBe(true);
    });
  });
});

describe('dashboard — route', () => {
  it('`demo.dashboard` mount ở /demo/tong-quan', () => {
    expect(getRoutePath('demo.dashboard')).toBe('/demo/tong-quan');
    expect(matchRoutes(appRoutes, '/demo/tong-quan')).not.toBeNull();
  });

  it('tên tab: tabTitle của màn đứng sau tên phân hệ', () => {
    const matches = (matchRoutes(appRoutes, '/demo/tong-quan') ?? []).map((match) => ({
      pathname: match.pathname,
      params: match.params,
      handle: match.route.handle as unknown,
    }));

    expect(resolveDocumentTitle(matches, '')).toContain(
      'Thư viện giao diện · Tổng quan dự án — màn hình mẫu',
    );
  });
});

describe('dashboard — trục Y của đường S theo lát cắt', () => {
  it('lát hẹp (tuần) thu trục lại quanh dữ liệu, vạch mỗi 5 điểm %', () => {
    const { domain, ticks } = sCurveAxis(DASHBOARD_S_CURVE.week.points);

    expect(domain).toEqual([50, 70]);
    expect(ticks).toEqual([50, 55, 60, 65, 70]);
  });

  it('lát vừa (tháng) vạch mỗi 10 điểm %', () => {
    const { domain, ticks } = sCurveAxis(DASHBOARD_S_CURVE.month.points);

    expect(domain).toEqual([30, 80]);
    expect(ticks).toEqual([30, 40, 50, 60, 70, 80]);
  });

  it('lát rộng (quý, chạm 100%) neo về 0 và chia tư', () => {
    const { domain, ticks } = sCurveAxis(DASHBOARD_S_CURVE.quarter.points);

    expect(domain).toEqual([0, 100]);
    expect(ticks).toEqual([0, 25, 50, 75, 100]);
  });

  it('mọi điểm của mọi lát nằm trong trục; không có điểm → 0–100', () => {
    RANGES.forEach((range) => {
      const { points } = DASHBOARD_S_CURVE[range];
      const [lo, hi] = sCurveAxis(points).domain;
      points.forEach((point) => {
        expect(point.plan).toBeGreaterThanOrEqual(lo);
        expect(point.plan).toBeLessThanOrEqual(hi);
      });
    });
    expect(sCurveAxis([]).domain).toEqual([0, 100]);
  });
});

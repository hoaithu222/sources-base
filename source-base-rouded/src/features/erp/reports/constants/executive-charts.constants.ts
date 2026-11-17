import { CHART_SERIES_TOKENS } from '@/shared/charts';

import type { ExecPeriod } from './executive-period.constants';

/**
 * Dữ liệu mẫu ba biểu đồ của màn "Dashboard điều hành" (tỷ đồng, năm 2026).
 *
 * Dùng:   `EXEC_MONTHLY_REVENUE` → cột thực hiện + đường kế hoạch · `EXEC_SEGMENTS` + `EXEC_REVENUE_MIX[period]` → donut
 *         cơ cấu (cùng thứ tự) · `EXEC_CASHFLOW_WEEKS` + `EXEC_CASHFLOW_SERIES` → vùng thu / chi 12 tuần.
 * Lưu ý:  `actual` của T10 là lũy kế đến 19/10, T11–T12 chưa có (`null` — cột trống, đường kế hoạch vẫn vẽ). Màu series
 *         lấy theo slot cố định của `CHART_SERIES_TOKENS`, không tự chọn bậc.
 */

export interface ExecMonthPoint {
  label: string;
  /** Doanh thu thực hiện (tỷ); `null` = tháng chưa tới. */
  actual: number | null;
  plan: number;
}

export interface ExecSegment {
  key: string;
  name: string;
  token: string;
}

export interface ExecCashflowWeek {
  /** Ngày đầu tuần (thứ Hai), dạng `d/M`. */
  label: string;
  inflow: number;
  outflow: number;
}

export interface ExecSeries {
  name: string;
  token: string;
}

export const EXEC_MONTHLY_REVENUE: readonly ExecMonthPoint[] = [
  { label: 'T1', actual: 92.4, plan: 95 },
  { label: 'T2', actual: 71.8, plan: 80 },
  { label: 'T3', actual: 108.5, plan: 110 },
  { label: 'T4', actual: 116.2, plan: 115 },
  { label: 'T5', actual: 121.9, plan: 120 },
  { label: 'T6', actual: 128.4, plan: 125 },
  { label: 'T7', actual: 124.7, plan: 125 },
  { label: 'T8', actual: 133.9, plan: 128 },
  { label: 'T9', actual: 126.3, plan: 130 },
  { label: 'T10', actual: 78.9, plan: 132 },
  { label: 'T11', actual: null, plan: 135 },
  { label: 'T12', actual: null, plan: 125 },
];

export const EXEC_YEAR_PLAN = 1420;

export const EXEC_SEGMENTS: readonly ExecSegment[] = [
  { key: 'structure', name: 'Kết cấu thép', token: CHART_SERIES_TOKENS[0] },
  { key: 'rebar', name: 'Cốt thép công trình', token: CHART_SERIES_TOKENS[1] },
  { key: 'pile-cage', name: 'Lồng thép cọc', token: CHART_SERIES_TOKENS[2] },
  { key: 'service', name: 'Dịch vụ gia công', token: CHART_SERIES_TOKENS[3] },
];

export const EXEC_REVENUE_MIX = {
  month: [31.6, 25.2, 14.8, 7.3],
  quarter: [148.2, 129.6, 70.4, 36.7],
  year: [432.5, 362.8, 203.9, 103.8],
} satisfies Record<ExecPeriod, readonly number[]>;

export const EXEC_CASHFLOW_SERIES = {
  inflow: { name: 'Thu', token: CHART_SERIES_TOKENS[0] },
  outflow: { name: 'Chi', token: CHART_SERIES_TOKENS[1] },
} satisfies Record<'inflow' | 'outflow', ExecSeries>;

export const EXEC_CASHFLOW_WEEKS: readonly ExecCashflowWeek[] = [
  { label: '27/7', inflow: 26.4, outflow: 24.8 },
  { label: '3/8', inflow: 28.9, outflow: 27.3 },
  { label: '10/8', inflow: 24.7, outflow: 26.9 },
  { label: '17/8', inflow: 31.2, outflow: 28.4 },
  { label: '24/8', inflow: 29.8, outflow: 30.6 },
  { label: '31/8', inflow: 33.5, outflow: 29.2 },
  { label: '7/9', inflow: 27.6, outflow: 28.8 },
  { label: '14/9', inflow: 30.9, outflow: 27.5 },
  { label: '21/9', inflow: 34.2, outflow: 31.6 },
  { label: '28/9', inflow: 28.4, outflow: 29.9 },
  { label: '5/10', inflow: 32.7, outflow: 30.4 },
  { label: '12/10', inflow: 35.1, outflow: 31.2 },
];

import { CHART_OTHER_TOKEN, CHART_STATUS } from '@/shared/charts';

import {
  toWorkVolume,
  type SCurvePoint,
  type WorkVolumePoint,
} from '../../shared/charts/chart-data.utils';
import type { PackageStatus } from '../../shared/constants/packages.constants';

/**
 * Số liệu tĩnh của màn "Tổng quan dự án" (`/demo/tong-quan`), cùng dự án với `/demo/ghep`.
 * Lưu ý: số đếm gói / tổng giá trị / xếp hạng nhà thầu KHÔNG khai ở đây — dẫn xuất từ `DEMO_PACKAGE_ROWS`
 * (`utils/packages.utils.ts`) để hai màn không lệch nhau. Điểm "hiện tại" của đường S phải khớp
 * `DASHBOARD_KPI` (bài kiểm `demo-dashboard-data` giữ). Không `Date.now()` / random ở đây.
 */

export type DashboardRange = 'week' | 'month' | 'quarter';

export const DASHBOARD_RANGE_OPTIONS: { key: DashboardRange; label: string }[] = [
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
  { key: 'quarter', label: 'Quý' },
];

export const DASHBOARD_DEFAULT_RANGE: DashboardRange = 'month';

/** Số KPI không suy ra được từ danh sách gói thầu: tiền giải ngân (đồng), % tiến độ, nhân lực, ngày an toàn. */
export const DASHBOARD_KPI = {
  disbursed: 71_800_000_000,
  progress: 62.4,
  planProgress: 66.0,
  workforce: 428,
  workforceDelta: 12,
  safeDays: 126,
} as const;

interface DashboardSCurve {
  points: readonly SCurvePoint[];
  /** Nhãn của điểm thực tế cuối cùng — vẽ vạch "hiện tại". */
  nowLabel: string;
}

const WEEK_POINTS: SCurvePoint[] = [
  { label: '3/8', plan: 57.2, actual: 53.9 },
  { label: '10/8', plan: 58.4, actual: 55.0 },
  { label: '17/8', plan: 59.6, actual: 56.1 },
  { label: '24/8', plan: 60.8, actual: 57.2 },
  { label: '31/8', plan: 62.0, actual: 58.3 },
  { label: '7/9', plan: 63.1, actual: 59.4 },
  { label: '14/9', plan: 64.2, actual: 60.4 },
  { label: '21/9', plan: 65.1, actual: 61.4 },
  { label: '28/9', plan: 66.0, actual: 62.4 },
  { label: '5/10', plan: 66.9, actual: null },
  { label: '12/10', plan: 67.8, actual: null },
  { label: '19/10', plan: 68.6, actual: null },
];

const MONTH_POINTS: SCurvePoint[] = [
  { label: 'T3/26', plan: 33.5, actual: 30.8 },
  { label: 'T4/26', plan: 39.5, actual: 36.4 },
  { label: 'T5/26', plan: 45.5, actual: 42.2 },
  { label: 'T6/26', plan: 51.5, actual: 48.0 },
  { label: 'T7/26', plan: 56.5, actual: 53.0 },
  { label: 'T8/26', plan: 61.5, actual: 58.0 },
  { label: 'T9/26', plan: 66.0, actual: 62.4 },
  { label: 'T10/26', plan: 70.0, actual: null },
  { label: 'T11/26', plan: 73.5, actual: null },
  { label: 'T12/26', plan: 76.5, actual: null },
];

const QUARTER_POINTS: SCurvePoint[] = [
  { label: 'Q4/25', plan: 16.0, actual: 14.5 },
  { label: 'Q1/26', plan: 33.5, actual: 30.8 },
  { label: 'Q2/26', plan: 51.5, actual: 48.0 },
  { label: 'Q3/26', plan: 66.0, actual: 62.4 },
  { label: 'Q4/26', plan: 76.5, actual: null },
  { label: 'Q1/27', plan: 88.0, actual: null },
  { label: 'Q2/27', plan: 100.0, actual: null },
];

/** Đường S lũy kế theo mức thời gian — nút Tuần / Tháng / Quý chỉ chọn khoá, không tính lại. */
export const DASHBOARD_S_CURVE: Record<DashboardRange, DashboardSCurve> = {
  week: { points: WEEK_POINTS, nowLabel: '28/9' },
  month: { points: MONTH_POINTS, nowLabel: 'T9/26' },
  quarter: { points: QUARTER_POINTS, nowLabel: 'Q3/26' },
};

/** Số đầu việc theo hạng mục và trạng thái. */
export const DASHBOARD_WORK_VOLUME: readonly WorkVolumePoint[] = toWorkVolume([
  { name: 'Móng hầm', done: 48, doing: 0, late: 0 },
  { name: 'Kết cấu', done: 62, doing: 28, late: 4 },
  { name: 'Cơ điện', done: 31, doing: 36, late: 6 },
  { name: 'Mặt đứng', done: 44, doing: 3, late: 0 },
  { name: 'Hạ tầng', done: 9, doing: 17, late: 14 },
  { name: 'Cảnh quan', done: 2, doing: 5, late: 0 },
]);

/** Thứ tự lát donut và dòng chú giải: xong → đang làm → chờ → chậm → nháp. */
export const DASHBOARD_STATUS_ORDER: readonly PackageStatus[] = [
  'done',
  'running',
  'review',
  'late',
  'draft',
];

/** Cùng tông với badge của `PACKAGE_STATUS_META`: success · info · warning · error · neutral. */
export const DASHBOARD_STATUS_TOKENS: Record<PackageStatus, string> = {
  done: CHART_STATUS.done,
  running: CHART_STATUS.running,
  review: CHART_STATUS.slow,
  late: CHART_STATUS.late,
  draft: CHART_OTHER_TOKEN,
};

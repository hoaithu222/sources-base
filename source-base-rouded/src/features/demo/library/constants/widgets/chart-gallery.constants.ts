import { CHART_OTHER_TOKEN, seriesTokenAt } from '@/shared/charts';

import type { ChartRow, ChartSeries, ShareSlice } from '../../../shared/charts/chart-data.utils';

/**
 * Số liệu mẫu cho thư viện biểu đồ (`ChartGallerySection`, `ChartPhoneSection`) — hàm thuần, không random:
 * kết quả phải ổn định để ảnh chụp so được. Màu theo THỰC THỂ: khai `token` một lần ở đây, lọc bớt series
 * không làm đổi màu series còn lại.
 */

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'] as const;

function toRows(columns: Record<string, readonly number[]>, labels: readonly string[]): ChartRow[] {
  return labels.map((label, i) => ({
    label,
    ...Object.fromEntries(Object.entries(columns).map(([key, values]) => [key, values[i]])),
  }));
}

/** 4 series lũy kế theo tháng — điểm cuối cách nhau ≥ 13 đơn vị nên nhãn trực tiếp không đè nhau. */
export const DEMO_TREND_SERIES: readonly ChartSeries[] = [
  { key: 'structure', name: 'Kết cấu', token: seriesTokenAt(0) },
  { key: 'mep', name: 'Cơ điện', token: seriesTokenAt(1) },
  { key: 'finish', name: 'Hoàn thiện', token: seriesTokenAt(2) },
  { key: 'infra', name: 'Hạ tầng', token: seriesTokenAt(3) },
];

export const DEMO_TREND_ROWS: readonly ChartRow[] = toRows(
  {
    structure: [4, 9, 15, 22, 30, 38, 45, 52, 58, 63, 67, 70],
    mep: [1, 2, 4, 7, 11, 16, 22, 29, 36, 43, 50, 57],
    finish: [0, 0, 1, 2, 3, 5, 8, 12, 17, 23, 30, 37],
    infra: [2, 3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18],
  },
  MONTHS,
);

/** 5 series chi phí theo tháng (vùng chồng) — dùng cả "Khác" để thấy lát xám đứng cuối. */
export const DEMO_AREA_SERIES: readonly ChartSeries[] = [
  { key: 'labor', name: 'Nhân công', token: seriesTokenAt(0) },
  { key: 'material', name: 'Vật liệu', token: seriesTokenAt(1) },
  { key: 'machine', name: 'Máy thi công', token: seriesTokenAt(2) },
  { key: 'sub', name: 'Thầu phụ', token: seriesTokenAt(3) },
  { key: 'other', name: 'Khác', token: CHART_OTHER_TOKEN },
];

export const DEMO_AREA_ROWS: readonly ChartRow[] = toRows(
  {
    labor: [6, 7, 7, 8, 8, 9, 9, 10],
    material: [9, 12, 14, 13, 16, 15, 18, 17],
    machine: [3, 4, 6, 6, 5, 7, 6, 8],
    sub: [2, 3, 3, 5, 7, 8, 8, 9],
    other: [1, 1, 2, 1, 2, 2, 3, 2],
  },
  MONTHS.slice(0, 8),
);

/** Cột nhóm: doanh thu 3 khu vực × 6 quý (tỷ đồng). */
export const DEMO_GROUP_SERIES: readonly ChartSeries[] = [
  { key: 'north', name: 'Miền Bắc', token: seriesTokenAt(0) },
  { key: 'central', name: 'Miền Trung', token: seriesTokenAt(1) },
  { key: 'south', name: 'Miền Nam', token: seriesTokenAt(2) },
];

export const DEMO_GROUP_ROWS: readonly ChartRow[] = toRows(
  {
    north: [42, 48, 51, 57, 63, 68],
    central: [18, 21, 20, 26, 29, 31],
    south: [55, 52, 60, 66, 71, 79],
  },
  ['Q1/25', 'Q2/25', 'Q3/25', 'Q4/25', 'Q1/26', 'Q2/26'],
);

/** Cột chồng: 4 hạng mục × 5 gói thầu — nhãn tổng treo trên cột neo trong suốt. */
export const DEMO_STACK_ROWS: readonly ChartRow[] = toRows(
  {
    labor: [12, 18, 9, 22, 7],
    material: [31, 26, 17, 28, 11],
    machine: [8, 14, 6, 10, 4],
    sub: [5, 9, 12, 6, 3],
  },
  ['XL-01', 'XL-02', 'XL-03', 'XL-04', 'XL-05'],
);

export const DEMO_STACK_SERIES: readonly ChartSeries[] = DEMO_AREA_SERIES.slice(0, 4);

/** Donut cơ cấu 6 lát: 5 hạng mục + "Khác" (xám, luôn cuối). */
export const DEMO_SHARE_SLICES: readonly ShareSlice[] = [
  { key: 'structure', name: 'Kết cấu', value: 186.4, token: seriesTokenAt(0) },
  { key: 'mep', name: 'Cơ điện', value: 142.8, token: seriesTokenAt(1) },
  { key: 'finish', name: 'Hoàn thiện', value: 96.5, token: seriesTokenAt(2) },
  { key: 'facade', name: 'Mặt đứng', value: 61.2, token: seriesTokenAt(3) },
  { key: 'infra', name: 'Hạ tầng', value: 38.9, token: seriesTokenAt(4) },
  { key: 'other', name: 'Khác', value: 24.2, token: CHART_OTHER_TOKEN },
];

export interface DemoSparkTile {
  key: string;
  label: string;
  value: string;
  /** Chênh so với kỳ trước, đã định dạng kèm đơn vị — dòng phụ của thẻ. */
  delta: string;
  token: string;
  values: readonly number[];
}

/** 4 thẻ KPI có sparkline — mỗi thẻ một slot series, số hiện tại in cạnh (sparkline chỉ cho hình dạng). */
export const DEMO_SPARK_TILES: readonly DemoSparkTile[] = [
  {
    key: 'progress',
    label: 'Tiến độ',
    value: '62,4%',
    delta: '+4,4 điểm',
    token: seriesTokenAt(0),
    values: [31, 34, 38, 41, 47, 52, 58, 62],
  },
  {
    key: 'workforce',
    label: 'Nhân lực',
    value: '428',
    delta: '+9 người',
    token: seriesTokenAt(1),
    values: [392, 401, 398, 410, 415, 421, 419, 428],
  },
  {
    key: 'disbursed',
    label: 'Giải ngân',
    value: '71,8 tỷ',
    delta: '+11 tỷ',
    token: seriesTokenAt(2),
    values: [12, 19, 24, 33, 41, 52, 61, 72],
  },
  {
    key: 'safe',
    label: 'Ngày an toàn',
    value: '126',
    delta: '+8 ngày',
    token: seriesTokenAt(3),
    values: [70, 78, 85, 92, 101, 109, 118, 126],
  },
];

import {
  toWorkVolume,
  type SCurvePoint,
  type WorkVolumePoint,
} from '../../../shared/charts/chart-data.utils';

const MONTHS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'] as const;
const PLAN = [8, 18, 30, 44, 58, 71, 84, 96];
const ACTUAL = [7, 16, 27, 39, 52, 66, 76, 88];

/** Đường S 8 tháng cho mục "Biểu đồ" — đủ cả hai đường, không có mốc "hiện tại". */
export const DEMO_S_CURVE: readonly SCurvePoint[] = MONTHS.map((label, i) => ({
  label,
  plan: PLAN[i],
  actual: ACTUAL[i],
}));

/** Cột chồng 5 hạng mục; "Kiến trúc" CỐ Ý `late: 0` để thấy nhãn tổng vẫn đứng nhờ cột neo. */
export const DEMO_WORK_VOLUME: readonly WorkVolumePoint[] = toWorkVolume([
  { name: 'Kết cấu', done: 42, doing: 12, late: 3 },
  { name: 'Cơ điện', done: 28, doing: 19, late: 7 },
  { name: 'Kiến trúc', done: 35, doing: 8, late: 0 },
  { name: 'Hạ tầng', done: 12, doing: 21, late: 4 },
  { name: 'Cảnh quan', done: 6, doing: 4, late: 1 },
]);

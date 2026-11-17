import { CHART_SEMANTIC } from '@/shared/charts';
import type { PageHeaderFilterOption } from '@/shared/widgets/header';

/**
 * Số liệu mẫu màn "Tiến độ sản xuất" — xưởng gia công cốt thép, lồng thép (cùng từ vựng màn `/demo/xuong`). Hằng
 * tĩnh, không random; tiến độ kế hoạch tính theo `OPS_TODAY`. Khối lượng: tấn (t).
 */

export type WorkshopKey = 'cut' | 'cage' | 'finish';

export type WorkshopFilter = WorkshopKey | 'all';

export interface Workshop {
  key: WorkshopKey;
  label: string;
  short: string;
}

export const WORKSHOPS: readonly Workshop[] = [
  { key: 'cut', label: 'Xưởng cắt uốn', short: 'Cắt uốn' },
  { key: 'cage', label: 'Xưởng lồng thép', short: 'Lồng thép' },
  { key: 'finish', label: 'Xưởng hoàn thiện', short: 'Hoàn thiện' },
];

/** Bộ lọc "Xưởng" trên cột lọc dọc mép phải — danh sách chọn, tên đầy đủ (bảng nổi đủ chỗ). */
export const WORKSHOP_FILTER_OPTIONS: PageHeaderFilterOption[] = [
  { value: 'all', label: 'Tất cả xưởng' },
  ...WORKSHOPS.map((w) => ({ value: w.key, label: w.label })),
];

/** Cửa sổ dải Gantt: 3 tuần từ thứ Hai tuần trước tới Chủ nhật tuần sau của `OPS_TODAY`. */
export const GANTT_WINDOW = { start: '2026-10-12', days: 21 } as const;

/** Lệnh "Chậm" khi % thực tế thấp hơn % kế hoạch quá ngưỡng này (điểm %). */
export const ORDER_LATE_TOLERANCE = 5;

export interface WorkshopPerformance {
  /** Ba thành phần OEE, tỉ lệ 0..1. */
  availability: number;
  performance: number;
  quality: number;
  /** Lệnh hoàn thành trong 30 ngày: đúng hạn / tổng. */
  doneOnTime: number;
  doneTotal: number;
}

export const WORKSHOP_PERFORMANCE: Record<WorkshopKey, WorkshopPerformance> = {
  cut: { availability: 0.93, performance: 0.91, quality: 0.985, doneOnTime: 14, doneTotal: 15 },
  cage: { availability: 0.88, performance: 0.86, quality: 0.97, doneOnTime: 9, doneTotal: 12 },
  finish: { availability: 0.95, performance: 0.92, quality: 0.99, doneOnTime: 12, doneTotal: 13 },
};

/** Mục tiêu OEE của nhà máy (%) — dưới mức này thẻ KPI chuyển vàng. */
export const OEE_TARGET = 85;

/** Ngày đầu của chuỗi sản lượng 14 ngày (kết thúc hôm qua so với `OPS_TODAY`). */
export const OUTPUT_FIRST_DAY = '2026-10-05';

/** Sản lượng theo ngày (tấn) của từng xưởng, 14 ngày từ `OUTPUT_FIRST_DAY`; Chủ nhật kế hoạch 0. */
export const DAILY_OUTPUT: Record<WorkshopKey, { plan: number[]; actual: number[] }> = {
  cut: {
    plan: [14, 14, 14, 14, 14, 14, 0, 14, 14, 14, 14, 14, 14, 0],
    actual: [13.2, 14.6, 12.8, 15.1, 13.9, 14.2, 0, 13.5, 14.8, 13.1, 12.4, 14.9, 13.7, 0],
  },
  cage: {
    plan: [12, 12, 12, 12, 12, 12, 0, 12, 12, 12, 12, 12, 12, 0],
    actual: [11, 10.4, 11.8, 9.6, 10.9, 11.2, 0, 10.1, 9.4, 10.8, 11.3, 9.9, 10.6, 6.4],
  },
  finish: {
    plan: [8, 8, 8, 8, 8, 8, 0, 8, 8, 8, 8, 8, 8, 0],
    actual: [7.8, 8.4, 7.1, 8, 8.6, 7.4, 0, 8.2, 7.6, 8.9, 7.9, 8.1, 8.3, 0],
  },
};

/** Màu series biểu đồ sản lượng — nghĩa cố định kế hoạch / thực tế của `@/shared/charts`. */
export const OUTPUT_SERIES_TOKENS = {
  plan: CHART_SEMANTIC.plan,
  actual: CHART_SEMANTIC.actual,
} as const;

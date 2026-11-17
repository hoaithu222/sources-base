import type { TrendDirection } from '@/shared/ui';
import type { PageHeaderFilterOption } from '@/shared/widgets/header';

/**
 * Kỳ xem và số liệu KPI mẫu của màn "Dashboard điều hành" — công ty kết cấu thép · gia công cốt thép, năm 2026.
 *
 * Dùng:   `EXEC_PERIOD_OPTIONS` cho bộ lọc "Kỳ xem" (cột lọc dọc mép phải) · `EXEC_PERIOD_META[period]` cho hàng kỳ báo cáo
 *         · `EXEC_KPI_FIGURES[period][kpi]` + `EXEC_KPI_META[kpi]` → `buildKpiTiles` (utils) dựng ô KPI.
 * Lưu ý:  tiền tính bằng TỶ đồng, sản lượng bằng TẤN. "Quý" là quý gần nhất đã khóa sổ (quý III/2026); tháng và năm
 *         là lũy kế đến 19/10/2026.
 */

export type ExecPeriod = 'month' | 'quarter' | 'year';

export type ExecKpiKey = 'revenue' | 'grossProfit' | 'output' | 'inventory' | 'receivable';

export interface ExecPeriodMeta {
  /** Tên kỳ in đậm ở hàng công cụ, vd "Tháng 10/2026". */
  title: string;
  /** Phạm vi số liệu (dòng phụ cạnh tên kỳ). */
  scope: string;
  /** Mốc so sánh của huy hiệu biến động — hiện ở tooltip, vd "cùng kỳ tháng 9/2026". */
  versus: string;
  /** Chỉ số tháng thuộc kỳ (0 = T1) — các cột đậm trên biểu đồ doanh thu theo tháng. */
  months: readonly number[];
}

export interface ExecKpiMeta {
  label: string;
  unit: string;
  /** Số chữ số lẻ của con số lớn. */
  decimals: number;
  /** Chiều TỐT của chỉ tiêu: `down` cho tồn kho, công nợ. */
  positive: TrendDirection;
}

export interface ExecKpiFigure {
  value: number;
  previous: number;
  /** Số phụ của dòng dưới: kế hoạch (doanh thu, sản lượng) · số ngày tồn (tồn kho) · quá hạn (công nợ) · 0 nếu không có. */
  aside: number;
  /** Xu hướng gần đây cho sparkline (cũ → mới), cùng đơn vị với `value`. */
  spark: readonly number[];
}

export const EXEC_DEFAULT_PERIOD: ExecPeriod = 'month';

export const EXEC_PERIOD_OPTIONS: PageHeaderFilterOption[] = [
  { value: 'month', label: 'Tháng', description: 'Tháng 10/2026 · lũy kế đến 19/10/2026' },
  { value: 'quarter', label: 'Quý', description: 'Quý III/2026 · quý gần nhất đã khóa sổ' },
  { value: 'year', label: 'Năm', description: 'Năm 2026 · lũy kế đến 19/10/2026' },
];

export const EXEC_PERIOD_META = {
  month: {
    title: 'Tháng 10/2026',
    scope: 'Lũy kế đến 19/10/2026',
    versus: 'cùng kỳ tháng 9/2026',
    months: [9],
  },
  quarter: {
    title: 'Quý III/2026',
    scope: 'Quý gần nhất đã khóa sổ',
    versus: 'quý II/2026',
    months: [6, 7, 8],
  },
  year: {
    title: 'Năm 2026',
    scope: 'Lũy kế đến 19/10/2026',
    versus: 'cùng kỳ 2025',
    months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
} satisfies Record<ExecPeriod, ExecPeriodMeta>;

export const EXEC_KPI_ORDER: readonly ExecKpiKey[] = [
  'revenue',
  'grossProfit',
  'output',
  'inventory',
  'receivable',
];

export const EXEC_KPI_META = {
  revenue: { label: 'Doanh thu', unit: 'tỷ', decimals: 1, positive: 'up' },
  grossProfit: { label: 'Lợi nhuận gộp', unit: 'tỷ', decimals: 1, positive: 'up' },
  output: { label: 'Sản lượng gia công', unit: 'tấn', decimals: 0, positive: 'up' },
  inventory: { label: 'Tồn kho', unit: 'tỷ', decimals: 1, positive: 'down' },
  receivable: { label: 'Công nợ phải thu', unit: 'tỷ', decimals: 1, positive: 'down' },
} satisfies Record<ExecKpiKey, ExecKpiMeta>;

export const EXEC_KPI_FIGURES = {
  month: {
    revenue: {
      value: 78.9,
      previous: 74.2,
      aside: 80.9,
      spark: [27.4, 29.1, 28.3, 30.6, 31.2, 29.8, 32.4, 33.1],
    },
    grossProfit: {
      value: 11.9,
      previous: 10.8,
      aside: 0,
      spark: [3.9, 4.2, 4.1, 4.5, 4.6, 4.3, 4.9, 5.0],
    },
    output: {
      value: 4860,
      previous: 4520,
      aside: 5000,
      spark: [1690, 1780, 1720, 1850, 1810, 1760, 1880, 1920],
    },
    inventory: {
      value: 186.4,
      previous: 179.2,
      aside: 41,
      spark: [176.8, 178.4, 181.2, 179.9, 179.2, 182.6, 184.1, 186.4],
    },
    receivable: {
      value: 312.6,
      previous: 298.4,
      aside: 48.3,
      spark: [291.2, 294.8, 296.1, 298.4, 301.7, 305.2, 309.8, 312.6],
    },
  },
  quarter: {
    revenue: {
      value: 384.9,
      previous: 366.5,
      aside: 383,
      spark: [318.2, 341.6, 356.4, 272.7, 366.5, 384.9],
    },
    grossProfit: {
      value: 59.4,
      previous: 54.1,
      aside: 0,
      spark: [44.9, 49.2, 52.8, 39.4, 54.1, 59.4],
    },
    output: {
      value: 22940,
      previous: 21380,
      aside: 23500,
      spark: [19120, 20460, 21050, 16380, 21380, 22940],
    },
    inventory: {
      value: 179.2,
      previous: 192.5,
      aside: 43,
      spark: [171.4, 176.9, 168.0, 184.3, 192.5, 179.2],
    },
    receivable: {
      value: 298.4,
      previous: 305.9,
      aside: 41.7,
      spark: [262.5, 271.8, 276.0, 289.4, 305.9, 298.4],
    },
  },
  year: {
    revenue: {
      value: 1103.0,
      previous: 978.6,
      aside: 1108.9,
      spark: [742.5, 818.3, 893.7, 978.6, 1103.0],
    },
    grossProfit: {
      value: 164.8,
      previous: 141.9,
      aside: 0,
      spark: [101.2, 113.6, 127.4, 141.9, 164.8],
    },
    output: {
      value: 68420,
      previous: 61850,
      aside: 70200,
      spark: [48600, 53900, 57800, 61850, 68420],
    },
    inventory: {
      value: 186.4,
      previous: 171.3,
      aside: 41,
      spark: [148.6, 157.3, 162.9, 171.3, 186.4],
    },
    receivable: {
      value: 312.6,
      previous: 276.0,
      aside: 48.3,
      spark: [231.4, 248.9, 259.7, 276.0, 312.6],
    },
  },
} satisfies Record<ExecPeriod, Record<ExecKpiKey, ExecKpiFigure>>;

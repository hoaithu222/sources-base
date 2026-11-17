import { seriesTokenAt } from '@/shared/charts';

/**
 * Hằng của màn Kết quả kinh doanh: chỉ tiêu Mẫu B02-DN (mã số, cách tính), kỳ báo cáo + kỳ so sánh, tham số sinh số
 * liệu tháng (doanh thu gốc, mùa vụ) và màu series của biểu đồ 12 tháng. Số liệu tính ở `income-statement.utils.ts`.
 */

export type StatementCode =
  | '01'
  | '02'
  | '10'
  | '11'
  | '20'
  | '21'
  | '22'
  | '23'
  | '25'
  | '26'
  | '30'
  | '31'
  | '32'
  | '40'
  | '50'
  | '51'
  | '52'
  | '60';

/** `key` — dòng kết quả cuối · `total` — dòng tổng có công thức · `normal` — chỉ tiêu thường · `sub` — "Trong đó". */
export type StatementTone = 'key' | 'total' | 'normal' | 'sub';

export interface StatementLine {
  code: StatementCode;
  label: string;
  tone: StatementTone;
  /** `true` → chỉ tiêu chi phí / giảm trừ: tăng là XẤU (huy hiệu % đổi chiều màu). */
  cost: boolean;
  /** Cách tính của dòng tổng, vd `10 = 01 − 02`. */
  formula?: string;
}

export const STATEMENT_LINES: readonly StatementLine[] = [
  { code: '01', label: 'Doanh thu bán hàng và cung cấp dịch vụ', tone: 'normal', cost: false },
  { code: '02', label: 'Các khoản giảm trừ doanh thu', tone: 'normal', cost: true },
  {
    code: '10',
    label: 'Doanh thu thuần về bán hàng và cung cấp dịch vụ',
    tone: 'total',
    cost: false,
    formula: '10 = 01 − 02',
  },
  { code: '11', label: 'Giá vốn hàng bán', tone: 'normal', cost: true },
  {
    code: '20',
    label: 'Lợi nhuận gộp về bán hàng và cung cấp dịch vụ',
    tone: 'total',
    cost: false,
    formula: '20 = 10 − 11',
  },
  { code: '21', label: 'Doanh thu hoạt động tài chính', tone: 'normal', cost: false },
  { code: '22', label: 'Chi phí tài chính', tone: 'normal', cost: true },
  { code: '23', label: 'Trong đó: Chi phí lãi vay', tone: 'sub', cost: true },
  { code: '25', label: 'Chi phí bán hàng', tone: 'normal', cost: true },
  { code: '26', label: 'Chi phí quản lý doanh nghiệp', tone: 'normal', cost: true },
  {
    code: '30',
    label: 'Lợi nhuận thuần từ hoạt động kinh doanh',
    tone: 'total',
    cost: false,
    formula: '30 = 20 + (21 − 22) − (25 + 26)',
  },
  { code: '31', label: 'Thu nhập khác', tone: 'normal', cost: false },
  { code: '32', label: 'Chi phí khác', tone: 'normal', cost: true },
  { code: '40', label: 'Lợi nhuận khác', tone: 'total', cost: false, formula: '40 = 31 − 32' },
  {
    code: '50',
    label: 'Tổng lợi nhuận kế toán trước thuế',
    tone: 'total',
    cost: false,
    formula: '50 = 30 + 40',
  },
  { code: '51', label: 'Chi phí thuế TNDN hiện hành', tone: 'normal', cost: true },
  { code: '52', label: 'Chi phí thuế TNDN hoãn lại', tone: 'normal', cost: true },
  {
    code: '60',
    label: 'Lợi nhuận sau thuế thu nhập doanh nghiệp',
    tone: 'key',
    cost: false,
    formula: '60 = 50 − 51 − 52',
  },
];

export type StatementGranularity = 'month' | 'quarter' | 'ytd';

export const STATEMENT_GRANULARITY_OPTIONS = [
  { value: 'month', label: 'Tháng 09/2026' },
  { value: 'quarter', label: 'Quý III/2026' },
  { value: 'ytd', label: '9 tháng 2026' },
] satisfies { value: StatementGranularity; label: string }[];

/** `prev` — kỳ liền trước · `yoy` — cùng kỳ năm trước (lũy kế năm chỉ so được cùng kỳ). */
export type StatementCompare = 'prev' | 'yoy';

export const STATEMENT_COMPARE_OPTIONS = [
  { key: 'prev', label: 'Kỳ trước' },
  { key: 'yoy', label: 'Cùng kỳ' },
] satisfies { key: StatementCompare; label: string }[];

/** Tháng cuối đã khoá sổ — kỳ báo cáo và biểu đồ 12 tháng tính tới tháng này. */
export const INCOME_LAST_CLOSED = { year: 2026, month: 9 } as const;

/** Doanh thu gộp tháng 01/2025 (đồng) — mốc sinh số liệu; mỗi tháng sau tăng ~1,1%. */
export const INCOME_BASE_REVENUE = 12_400_000_000;

/** Hệ số mùa vụ theo tháng 1 → 12 (tháng Tết thấp, cuối năm cao). */
export const INCOME_SEASONALITY = [
  0.95, 0.72, 1.0, 1.02, 1.04, 1.06, 0.98, 1.0, 1.05, 1.08, 1.12, 1.22,
] as const;

/** Series biểu đồ 12 tháng — màu theo thực thể (doanh thu · chi phí · lợi nhuận). */
export const INCOME_CHART_SERIES = {
  revenue: { name: 'Tổng doanh thu', token: seriesTokenAt(0) },
  cost: { name: 'Tổng chi phí', token: seriesTokenAt(4) },
  profit: { name: 'LN trước thuế', token: seriesTokenAt(3) },
} as const;

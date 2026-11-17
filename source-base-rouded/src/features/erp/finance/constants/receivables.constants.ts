import { CHART_STATUS, seriesTokenAt } from '@/shared/charts';
import type { BadgeColor } from '@/shared/ui';

/**
 * Hằng của màn Công nợ: hai chế độ (phải thu khách hàng · phải trả nhà cung cấp), bốn nhóm tuổi nợ và màu của chúng,
 * trạng thái đối tác, mốc ngày dữ liệu và doanh số 90 ngày dùng tính DSO / DPO. Số liệu từng đối tác sinh ở
 * `receivables.utils.ts` từ danh mục `partners.constants.ts` — hằng tĩnh, không random.
 */

export type DebtMode = 'receivable' | 'payable';

export const DEBT_MODE_OPTIONS = [
  { key: 'receivable', label: 'Phải thu' },
  { key: 'payable', label: 'Phải trả' },
] satisfies { key: DebtMode; label: string }[];

export type AgingBucket = 'b0' | 'b1' | 'b2' | 'b3';

export interface AgingBucketMeta {
  key: AgingBucket;
  label: string;
  /** Tuổi nợ nhỏ nhất của nhóm (ngày). */
  from: number;
  /** Token màu chart — nhóm càng già càng nóng (xanh lá → vàng kim → cam → đỏ). */
  token: string;
}

export const AGING_BUCKETS: readonly AgingBucketMeta[] = [
  { key: 'b0', label: '0–30 ngày', from: 0, token: seriesTokenAt(0) },
  { key: 'b1', label: '31–60 ngày', from: 31, token: seriesTokenAt(4) },
  { key: 'b2', label: '61–90 ngày', from: 61, token: seriesTokenAt(6) },
  { key: 'b3', label: '> 90 ngày', from: 91, token: CHART_STATUS.late },
];

export type DebtStatus = 'limit' | 'overdue' | 'ok';

export const DEBT_STATUS_META = {
  limit: { label: 'Vượt hạn mức', color: 'error' },
  overdue: { label: 'Quá hạn', color: 'warning' },
  ok: { label: 'Trong hạn', color: 'success' },
} satisfies Record<DebtStatus, { label: string; color: BadgeColor }>;

export const DEBT_STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Mọi trạng thái' },
  ...Object.entries(DEBT_STATUS_META).map(([value, meta]) => ({ value, label: meta.label })),
];

/** Chữ theo chế độ — nhãn KPI, tiêu đề panel, cột bảng. */
export const DEBT_MODE_COPY = {
  receivable: {
    partner: 'Khách hàng',
    partnerPlural: 'khách hàng',
    total: 'Tổng phải thu',
    overdue: 'Nợ quá hạn',
    days: 'DSO',
    daysHint: 'Số ngày thu tiền bình quân',
    daysTarget: 60,
    overLimit: 'KH vượt hạn mức',
    search: 'Tìm mã, tên khách hàng…',
  },
  payable: {
    partner: 'Nhà cung cấp',
    partnerPlural: 'nhà cung cấp',
    total: 'Tổng phải trả',
    overdue: 'Quá hạn thanh toán',
    days: 'DPO',
    daysHint: 'Số ngày trả tiền bình quân',
    daysTarget: 45,
    overLimit: 'NCC vượt hạn mức',
    search: 'Tìm mã, tên nhà cung cấp…',
  },
} as const satisfies Record<DebtMode, Record<string, string | number>>;

/** Ngày chốt số liệu công nợ. */
export const DEBT_AS_OF = '19/10/2026';

/** Doanh thu (gồm VAT) · giá vốn mua vào 90 ngày gần nhất (đồng) — mẫu số của DSO / DPO. */
export const DEBT_TURNOVER_90D = {
  receivable: 47_860_000_000,
  payable: 31_420_000_000,
} satisfies Record<DebtMode, number>;

/** Số đối tác dư nợ lớn nhất đưa lên biểu đồ tuổi nợ. */
export const AGING_TOP_PARTNERS = 8;

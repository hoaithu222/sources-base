import type { TrendDirection } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';
import { percentOf } from '@/shared/utils/format/number.utils';

import {
  EXEC_CASHFLOW_WEEKS,
  EXEC_MONTHLY_REVENUE,
  EXEC_REVENUE_MIX,
  EXEC_SEGMENTS,
  EXEC_YEAR_PLAN,
  type ExecMonthPoint,
  type ExecSegment,
} from '../constants/executive-charts.constants';
import {
  EXEC_ATTENTION_ITEMS,
  EXEC_TOP_CUSTOMERS,
  type ExecCustomer,
} from '../constants/executive-lists.constants';
import {
  EXEC_KPI_FIGURES,
  EXEC_KPI_META,
  EXEC_KPI_ORDER,
  EXEC_PERIOD_META,
  type ExecKpiKey,
  type ExecPeriod,
} from '../constants/executive-period.constants';

/**
 * Dựng dữ liệu hiển thị của màn "Dashboard điều hành" từ số liệu mẫu theo kỳ — tỷ trọng, biên gộp, % kế hoạch tính ở
 * đây để component chỉ vẽ.
 *
 * Dùng:   buildKpiTiles(period) · buildMonthlyRevenue(period) · buildRevenueMix(period) · buildCustomerRows(period)
 *         · buildPanelSummaries() · attentionCaption() · formatBillion(78.9) → "78,9".
 */

export interface ExecKpiTileModel {
  key: ExecKpiKey;
  label: string;
  valueText: string;
  unit: string;
  current: number;
  previous: number;
  positive: TrendDirection;
  spark: readonly number[];
  note: string;
  /** `true` → dòng phụ là cảnh báo (chữ màu lỗi). */
  noteAlert: boolean;
}

export type ExecSummaryKey = 'revenue' | 'cashflow';

export interface ExecSummaryItem {
  label: string;
  /** Số đã định dạng kèm đơn vị, vd "1.103,0 tỷ" — in đậm `tabular-nums`. */
  value: string;
}

export interface ExecMonthBar extends ExecMonthPoint {
  /** Tháng thuộc kỳ đang xem → cột đậm. */
  inPeriod: boolean;
}

export interface ExecMixSlice extends ExecSegment {
  value: number;
  percent: number;
}

export interface ExecCustomerRow extends Omit<ExecCustomer, 'revenue' | 'previous'> {
  revenue: number;
  previous: number;
  /** Tỷ trọng trong doanh thu của kỳ (thang 100). */
  share: number;
}

const sum = (values: readonly number[]) => values.reduce((total, value) => total + value, 0);

/** Số tỷ đồng, đúng một chữ số lẻ: `formatBillion(1103)` → "1.103,0". */
export const formatBillion = (value: number) => formatNumber(value, 1, 1);

/** `part / whole` dạng "97,5%"; mẫu số 0 → "—". */
export const formatShare = (part: number, whole: number) => {
  const pct = percentOf(part, whole, 1);
  return pct === null ? '—' : formatPercent(pct);
};

function kpiNote(key: ExecKpiKey, period: ExecPeriod): string {
  const figures = EXEC_KPI_FIGURES[period];
  const { value, aside } = figures[key];
  switch (key) {
    case 'revenue':
      return `Đạt ${formatShare(value, aside)} kế hoạch ${formatBillion(aside)} tỷ`;
    case 'grossProfit':
      return `Biên lợi nhuận gộp ${formatShare(value, figures.revenue.value)}`;
    case 'output':
      return `Đạt ${formatShare(value, aside)} kế hoạch ${formatNumber(aside)} tấn`;
    case 'inventory':
      return `≈ ${formatNumber(aside)} ngày tồn kho bình quân`;
    case 'receivable':
      return `Quá hạn ${formatBillion(aside)} tỷ · ${formatShare(aside, value)}`;
  }
}

/** Năm ô KPI của kỳ, theo `EXEC_KPI_ORDER`. */
export function buildKpiTiles(period: ExecPeriod): ExecKpiTileModel[] {
  return EXEC_KPI_ORDER.map((key) => {
    const meta = EXEC_KPI_META[key];
    const figure = EXEC_KPI_FIGURES[period][key];
    return {
      key,
      label: meta.label,
      valueText: formatNumber(figure.value, meta.decimals, meta.decimals),
      unit: meta.unit,
      current: figure.value,
      previous: figure.previous,
      positive: meta.positive,
      spark: figure.spark,
      note: kpiNote(key, period),
      noteAlert: key === 'receivable' && figure.aside > 0,
    };
  });
}

/** 12 tháng doanh thu, đánh dấu các tháng thuộc kỳ đang xem. */
export function buildMonthlyRevenue(period: ExecPeriod): ExecMonthBar[] {
  const months = EXEC_PERIOD_META[period].months;
  return EXEC_MONTHLY_REVENUE.map((point, index) => ({
    ...point,
    inPeriod: months.includes(index),
  }));
}

/** Cơ cấu doanh thu theo mảng của kỳ (lát theo thứ tự `EXEC_SEGMENTS`). */
export function buildRevenueMix(period: ExecPeriod) {
  const values = EXEC_REVENUE_MIX[period];
  const total = sum(values);
  const slices: ExecMixSlice[] = EXEC_SEGMENTS.map((segment, index) => {
    const value = values[index] ?? 0;
    return { ...segment, value, percent: total > 0 ? (value / total) * 100 : 0 };
  });
  return { total, slices };
}

/** Top khách hàng của kỳ, tỷ trọng tính trên doanh thu toàn công ty cùng kỳ. */
export function buildCustomerRows(period: ExecPeriod): ExecCustomerRow[] {
  const total = EXEC_KPI_FIGURES[period].revenue.value;
  return EXEC_TOP_CUSTOMERS.map(({ revenue, previous, ...customer }) => ({
    ...customer,
    revenue: revenue[period],
    previous: previous[period],
    share: total > 0 ? (revenue[period] / total) * 100 : 0,
  }));
}

/** Cặp "nhãn · số" góc phải tiêu đề khối: lũy kế doanh thu năm · thu / chi / ròng 12 tuần. */
export function buildPanelSummaries(): Record<ExecSummaryKey, ExecSummaryItem[]> {
  const yearActual = sum(EXEC_MONTHLY_REVENUE.map((point) => point.actual ?? 0));
  const inflow = sum(EXEC_CASHFLOW_WEEKS.map((week) => week.inflow));
  const outflow = sum(EXEC_CASHFLOW_WEEKS.map((week) => week.outflow));
  const net = inflow - outflow;
  return {
    revenue: [
      { label: 'Lũy kế', value: `${formatBillion(yearActual)} tỷ` },
      { label: 'Đạt', value: `${formatShare(yearActual, EXEC_YEAR_PLAN)} KH năm` },
    ],
    cashflow: [
      { label: 'Thu', value: formatBillion(inflow) },
      { label: 'Chi', value: formatBillion(outflow) },
      { label: 'Ròng', value: `${net >= 0 ? '+' : ''}${formatBillion(net)} tỷ` },
    ],
  };
}

/** Dòng phụ của khối "Điểm cần chú ý": "6 việc cần xử lý · 2 khẩn". */
export function attentionCaption(): string {
  const urgent = EXEC_ATTENTION_ITEMS.filter((item) => item.level === 'high').length;
  return `${EXEC_ATTENTION_ITEMS.length} việc cần xử lý · ${urgent} khẩn`;
}

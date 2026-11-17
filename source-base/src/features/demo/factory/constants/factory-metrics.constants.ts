import { CHART_SEMANTIC, seriesTokenAt } from '@/shared/charts';
import type {
  BoldSystemIconName,
  CapsuleChartItem,
  GemColor,
  NoticeBoardItem,
  StatusBoardItem,
} from '@/shared/ui';
import type { SystemIconName } from '@/shared/ui/icons/Icons';

import type { ChartRow, ChartSeries, ShareSlice } from '../../shared/charts/chart-data.utils';

/**
 * Số liệu mẫu của màn `/demo/xuong` ("Gia công" — điều hành xưởng gia công cốt thép). Hằng tĩnh, không random: bài
 * kiểm và ảnh chụp so sánh phải ổn định. Đơn vị khối lượng: tấn (t).
 */

/** Tab của phân hệ — 4 tab bên trái bảng tên, 2 tab danh mục bên phải (`FACTORY_TABS_SPLIT`). */
export const FACTORY_TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'plan', label: 'Kế hoạch' },
  { key: 'report', label: 'Báo cáo' },
  { key: 'execution', label: 'Thực hiện' },
  { key: 'steel', label: 'Loại thép' },
  { key: 'cable', label: 'Bó cáp' },
] as const;

export type FactoryTab = (typeof FACTORY_TABS)[number]['key'];

export const FACTORY_TABS_SPLIT = 4;

export interface FactoryKpi {
  key: string;
  label: string;
  value: number;
  unit: string;
  icon: BoldSystemIconName;
  color: GemColor;
  caption?: string;
  detailIcon: SystemIconName;
  detailLabel: string;
}

export const FACTORY_KPIS: readonly FactoryKpi[] = [
  {
    key: 'required',
    label: 'Tổng KL phải gia công',
    value: 442.92,
    unit: 't',
    icon: 'boxes-stacked-bold',
    color: 'blue',
    caption: '4 loại thép · 12 tháng',
    detailIcon: 'list-outline',
    detailLabel: 'Xem danh sách khối lượng',
  },
  {
    key: 'done',
    label: 'Tổng KL đã gia công',
    value: 9.79,
    unit: 't',
    icon: 'gear-bold',
    color: 'green',
    caption: 'T10: 0,00 / 600,00 t KH',
    detailIcon: 'history-outline',
    detailLabel: 'Xem nhật ký gia công',
  },
  {
    key: 'remain',
    label: 'Còn lại',
    value: 433.13,
    unit: 't',
    icon: 'cube-bold',
    color: 'yellow',
    caption: 'Chưa gia công',
    detailIcon: 'cube-outline',
    detailLabel: 'Xem khối lượng còn lại',
  },
  {
    key: 'percent',
    label: '% hoàn thành',
    value: 2.2,
    unit: '%',
    icon: 'bullseye-bold',
    color: 'red',
    caption: 'Mục tiêu năm 100%',
    detailIcon: 'bullseye-outline',
    detailLabel: 'Xem mục tiêu',
  },
];

/** Kế hoạch ↔ thực hiện theo tháng (tấn) — màu theo `CHART_SEMANTIC` (kế hoạch lam, thực hiện xanh). */
export const FACTORY_PLAN_SERIES: readonly ChartSeries[] = [
  { key: 'plan', name: 'Kế hoạch (t)', token: CHART_SEMANTIC.plan },
  { key: 'actual', name: 'Thực hiện (t)', token: CHART_SEMANTIC.actual },
];

const PLAN = [59, 46, 30, 90, 60, 50, 20, 34, 15, 20, 18, 16];
const ACTUAL = [14.94, 13.61, 15.16, 14.97, 14.94, 14.58, 15.33, 15.11, 14.63, 16.65, 14.19, 15.37];

export const FACTORY_PLAN_ROWS: readonly ChartRow[] = PLAN.map((plan, i) => ({
  label: `T${i + 1}`,
  plan,
  actual: ACTUAL[i],
}));

/** Lũy kế đến từng tháng — cùng series với theo tháng. */
export const FACTORY_PLAN_CUMULATIVE_ROWS: readonly ChartRow[] = PLAN.map((_, i) => ({
  label: `T${i + 1}`,
  plan: PLAN.slice(0, i + 1).reduce((sum, v) => sum + v, 0),
  actual: Math.round(ACTUAL.slice(0, i + 1).reduce((sum, v) => sum + v, 0) * 100) / 100,
}));

export const FACTORY_PLAN_MODES = [
  { key: 'month', label: 'Theo tháng' },
  { key: 'cumulative', label: 'Lũy kế' },
] as const;

export type FactoryPlanMode = (typeof FACTORY_PLAN_MODES)[number]['key'];

export const FACTORY_SHARE_SLICES: readonly ShareSlice[] = [
  { key: 'cut', name: 'Cắt thép', value: 3.45, token: seriesTokenAt(0) },
  { key: 'bend', name: 'Uốn thép', value: 2.75, token: seriesTokenAt(6) },
  { key: 'cage', name: 'Lắp lồng thép', value: 2.42, token: seriesTokenAt(2) },
  { key: 'finish', name: 'Hoàn thiện', value: 1.17, token: seriesTokenAt(7) },
];

export const FACTORY_NOTICES: readonly NoticeBoardItem[] = [
  {
    id: 'd25',
    title: 'D25 còn khối lượng lớn',
    description: 'Còn 150,18 t chưa gia công',
    value: '150,18 t',
    tone: 'warning',
  },
  {
    id: 'd32',
    title: 'D32 còn khối lượng lớn',
    description: 'Còn 136,94 t chưa gia công',
    value: '136,94 t',
    tone: 'warning',
  },
  {
    id: 'd16',
    title: 'D16 còn khối lượng lớn',
    description: 'Còn 100,94 t chưa gia công',
    value: '100,94 t',
    tone: 'warning',
  },
  {
    id: 't10',
    title: 'T10 chưa đạt kế hoạch',
    description: 'Đạt 0,0% so với kế hoạch tháng',
    value: '0 / 600 t',
    tone: 'error',
  },
];

export const FACTORY_EQUIPMENT: readonly StatusBoardItem[] = [
  { id: 'cut-01', label: 'Máy cắt thép 01', icon: 'gear-outline', state: 'running', value: 85 },
  { id: 'bend-01', label: 'Máy uốn thép 01', icon: 'gear-outline', state: 'running', value: 72 },
  { id: 'bend-02', label: 'Máy uốn thép 02', icon: 'gear-outline', state: 'running', value: 68 },
  {
    id: 'cage-01',
    label: 'Dây chuyền lắp lồng 01',
    icon: 'bolt-outline',
    state: 'running',
    value: 81,
  },
  {
    id: 'crane-10',
    label: 'Cầu trục 10T',
    icon: 'boxes-stacked-outline',
    state: 'warning',
    stateLabel: 'Bảo trì định kỳ',
    value: 60,
  },
];

export interface FactorySteelRow {
  id: string;
  code: string;
  name: string;
  done: number;
  plan: number;
}

export const FACTORY_STEEL_ROWS: readonly FactorySteelRow[] = [
  { id: 'd16', code: 'D16', name: 'Thép D16', done: 0.43, plan: 101.36 },
  { id: 'd25', code: 'D25', name: 'Thép D25', done: 2.53, plan: 152.71 },
  { id: 'd12', code: 'D12', name: 'Thép D12', done: 0.93, plan: 46 },
  { id: 'd32', code: 'D32', name: 'Thép D32', done: 5.91, plan: 142.85 },
];

export const FACTORY_REMAIN: readonly CapsuleChartItem[] = [
  { id: 'd25', label: 'D25', value: 150.18 },
  { id: 'd32', label: 'D32', value: 136.94 },
  { id: 'd16', label: 'D16', value: 100.94 },
  { id: 'd12', label: 'D12', value: 45.07 },
];

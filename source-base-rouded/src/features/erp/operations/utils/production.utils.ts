import type { ProductionOrder } from '../constants/production-orders.constants';
import {
  DAILY_OUTPUT,
  OEE_TARGET,
  ORDER_LATE_TOLERANCE,
  OUTPUT_FIRST_DAY,
  WORKSHOP_PERFORMANCE,
  WORKSHOPS,
  type WorkshopFilter,
  type WorkshopKey,
} from '../constants/production.constants';
import { dayIndex, formatDayMonth, weekdayShort } from './ops-date.utils';

/**
 * Tính toán màn "Tiến độ sản xuất": trạng thái lệnh (kế hoạch ↔ thực tế tới hôm nay), số KPI theo xưởng, hiệu suất
 * từng xưởng và chuỗi sản lượng theo ngày. Hình học dải Gantt ở `gantt.utils.ts`. Hàm thuần — gọi trong `useMemo`.
 */

export type OrderStatus = 'onTrack' | 'late' | 'done';

export interface OrderView extends ProductionOrder {
  status: OrderStatus;
  /** % khối lượng đã làm (0..100). */
  actualPct: number;
  /** % lẽ ra phải đạt tới đầu ngày hôm nay theo kế hoạch tuyến tính (0..100). */
  planPct: number;
  planDays: number;
  workshopLabel: string;
  workshopShort: string;
}

export interface ProductionSummary {
  running: number;
  late: number;
  remainingTons: number;
  onTimePct: number;
  doneOnTime: number;
  doneTotal: number;
  oee: number;
  oeeParts: { availability: number; performance: number; quality: number };
  oeeOnTarget: boolean;
}

export interface OutputRow {
  label: string;
  weekday: string;
  /** Tấn kế hoạch; `null` ở ngày nghỉ (đường kế hoạch đứt quãng thay vì cắm xuống 0). */
  plan: number | null;
  actual: number;
}

const STATUS_ORDER: Record<OrderStatus, number> = { late: 0, onTrack: 1, done: 2 };

const clampPct = (value: number) => Math.max(0, Math.min(100, value));

const round1 = (value: number) => Math.round(value * 10) / 10;

function statusOf(order: ProductionOrder, actualPct: number, planPct: number): OrderStatus {
  if (order.finishedOn !== undefined || actualPct >= 100) return 'done';
  return actualPct + ORDER_LATE_TOLERANCE < planPct ? 'late' : 'onTrack';
}

/** Gắn trạng thái + % kế hoạch / thực tế cho một lệnh tại ngày `today` (ISO). */
function toOrderView(order: ProductionOrder, today: string): OrderView {
  const start = dayIndex(order.planStart);
  const planDays = dayIndex(order.planEnd) - start + 1;
  const planPct = clampPct(((dayIndex(today) - start) / planDays) * 100);
  const actualPct = clampPct((order.actualTons / order.planTons) * 100);
  const status = statusOf(order, actualPct, planPct);
  const workshop = WORKSHOPS.find((w) => w.key === order.workshop);
  return {
    ...order,
    status,
    actualPct,
    planPct,
    planDays,
    workshopLabel: workshop?.label ?? '',
    workshopShort: workshop?.short ?? '',
  };
}

/** Mọi lệnh đã gắn trạng thái, sắp: Chậm → Đúng tiến độ → Hoàn thành, trong nhóm theo hạn kết thúc. */
export function buildOrderViews(orders: readonly ProductionOrder[], today: string): OrderView[] {
  return orders
    .map((order) => toOrderView(order, today))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        dayIndex(a.planEnd) - dayIndex(b.planEnd),
    );
}

const workshopKeys = (workshop: WorkshopFilter): WorkshopKey[] =>
  workshop === 'all' ? WORKSHOPS.map((w) => w.key) : [workshop];

const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** OEE (%) của một xưởng = khả dụng × hiệu suất × chất lượng. */
function workshopOee(key: WorkshopKey): number {
  const p = WORKSHOP_PERFORMANCE[key];
  return p.availability * p.performance * p.quality * 100;
}

/** Bốn số KPI đầu trang cho xưởng đang lọc. */
export function summarizeProduction(
  views: readonly OrderView[],
  workshop: WorkshopFilter,
): ProductionSummary {
  const keys = workshopKeys(workshop);
  const perf = keys.map((key) => WORKSHOP_PERFORMANCE[key]);
  const active = views.filter((v) => v.status !== 'done');
  const doneOnTime = perf.reduce((sum, p) => sum + p.doneOnTime, 0);
  const doneTotal = perf.reduce((sum, p) => sum + p.doneTotal, 0);
  const oee = average(keys.map(workshopOee));
  return {
    running: active.length,
    late: active.filter((v) => v.status === 'late').length,
    remainingTons: round1(active.reduce((sum, v) => sum + v.planTons - v.actualTons, 0)),
    onTimePct: doneTotal > 0 ? (doneOnTime / doneTotal) * 100 : 0,
    doneOnTime,
    doneTotal,
    oee,
    oeeParts: {
      availability: average(perf.map((p) => p.availability)) * 100,
      performance: average(perf.map((p) => p.performance)) * 100,
      quality: average(perf.map((p) => p.quality)) * 100,
    },
    oeeOnTarget: oee >= OEE_TARGET,
  };
}

export interface WorkshopSummary {
  key: WorkshopKey;
  label: string;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  running: number;
  late: number;
}

/** Một dòng cho mỗi xưởng (không phụ thuộc bộ lọc): OEE + ba thành phần (%) và số lệnh đang chạy / chậm. */
export function summarizeWorkshops(views: readonly OrderView[]): WorkshopSummary[] {
  return WORKSHOPS.map(({ key, label }) => {
    const p = WORKSHOP_PERFORMANCE[key];
    const active = views.filter((v) => v.workshop === key && v.status !== 'done');
    return {
      key,
      label,
      oee: workshopOee(key),
      availability: p.availability * 100,
      performance: p.performance * 100,
      quality: p.quality * 100,
      running: active.length,
      late: active.filter((v) => v.status === 'late').length,
    };
  });
}

/** Chuỗi sản lượng 14 ngày (tấn) của xưởng đang lọc — cộng dồn các xưởng khi "Tất cả". */
export function buildOutputRows(workshop: WorkshopFilter): OutputRow[] {
  const keys = workshopKeys(workshop);
  const first = dayIndex(OUTPUT_FIRST_DAY);
  return DAILY_OUTPUT.cut.plan.map((_, i) => {
    const plan = round1(keys.reduce((sum, key) => sum + DAILY_OUTPUT[key].plan[i], 0));
    return {
      label: formatDayMonth(first + i),
      weekday: weekdayShort(first + i),
      plan: plan > 0 ? plan : null,
      actual: round1(keys.reduce((sum, key) => sum + DAILY_OUTPUT[key].actual[i], 0)),
    };
  });
}

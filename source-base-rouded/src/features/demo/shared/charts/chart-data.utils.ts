/**
 * Kiểu dữ liệu + hàm dựng số cho hai biểu đồ dùng chung của demo (`SCurveChart`, `WorkVolumeChart`):
 * trang `/demo` dùng làm bản mẫu `chart-conventions.md`, màn `/demo/tong-quan` dùng thật.
 * Hàm thuần, không đọc `Date.now()` / random — số liệu mẫu phải ổn định để bài kiểm ghim được.
 */

/** Một mốc của đường S, đơn vị %; `actual = null` sau mốc "hiện tại" (chưa có số liệu). */
export interface SCurvePoint {
  label: string;
  plan: number;
  actual: number | null;
}

interface SCurveAxis {
  domain: [number, number];
  ticks: number[];
}

/** Số đầu việc của một hạng mục theo trạng thái — đầu vào của `toWorkVolume`. */
interface WorkVolumeCounts {
  name: string;
  done: number;
  doing: number;
  late: number;
}

/** `__total` đã cộng sẵn (formatter của Recharts không đọc sang series khác); `__anchor` luôn 0. */
export interface WorkVolumePoint extends WorkVolumeCounts {
  __total: number;
  __anchor: number;
}

/**
 * Thêm tổng + cột NEO trong suốt cho cột chồng: nhãn tổng treo lên cột neo chứ không lên series trên
 * cùng, vì Recharts bỏ rect cao 0 (`chart-conventions.md §3.4.1`).
 */
export function toWorkVolume(rows: readonly WorkVolumeCounts[]): WorkVolumePoint[] {
  return rows.map((row) => ({ ...row, __total: row.done + row.doing + row.late, __anchor: 0 }));
}

const AXIS_ROUND = 10;
const AXIS_MIN_SPAN = 20;
const AXIS_ANCHOR_SPAN = 50;

function axisTickStep(span: number): number {
  if (span <= AXIS_MIN_SPAN) return 5;
  if (span <= AXIS_ANCHOR_SPAN) return 10;
  return 25;
}

/**
 * Trục Y của đường S cho MỘT lát cắt: lát hẹp thu trục quanh dữ liệu (tuần: 50–70%) để độ dốc còn nhìn thấy,
 * lát rộng neo về 0 (quý: 0–100%). Mốc làm tròn 10 điểm %, bề rộng tối thiểu 20; vạch mỗi 5 · 10 · 25 điểm %.
 */
export function sCurveAxis(points: readonly { plan: number; actual: number | null }[]): SCurveAxis {
  const values = points.flatMap((p) => (p.actual === null ? [p.plan] : [p.plan, p.actual]));
  if (values.length === 0) return { domain: [0, 100], ticks: [0, 25, 50, 75, 100] };

  const hi = Math.min(100, Math.ceil(Math.max(...values) / AXIS_ROUND) * AXIS_ROUND);
  let lo = Math.floor(Math.min(...values) / AXIS_ROUND) * AXIS_ROUND;
  if (hi - lo < AXIS_MIN_SPAN) lo = Math.max(0, hi - AXIS_MIN_SPAN);
  if (hi - lo > AXIS_ANCHOR_SPAN) lo = 0;

  const span = hi - lo;
  const step = axisTickStep(span);
  const ticks = Array.from({ length: Math.floor(span / step) + 1 }, (_, i) => lo + i * step);

  return { domain: [lo, hi], ticks };
}

/** Một series của chart nhiều đường / cột / lát: `key` là khoá trong hàng dữ liệu, `token` màu CỐ ĐỊNH theo thực thể. */
export interface ChartSeries {
  key: string;
  name: string;
  token: string;
}

/** Hàng dữ liệu của chart nhiều series: `label` trên trục X + giá trị từng series theo `key`. */
export type ChartRow = { label: string } & Record<string, number | string>;

/** Một lát của donut cơ cấu. */
export interface ShareSlice extends ChartSeries {
  value: number;
}

/** Lát kèm tỉ lệ % (làm tròn 1 số lẻ, tổng các lát có thể lệch ±0,1). */
export interface ShareRow extends ShareSlice {
  percent: number;
}

/** Tổng và tỉ lệ từng lát; tổng = 0 thì mọi tỉ lệ = 0 (không chia cho 0). */
export function toShares(slices: readonly ShareSlice[]): { total: number; rows: ShareRow[] } {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  return {
    total,
    rows: slices.map((slice) => ({
      ...slice,
      percent: total > 0 ? Math.round((slice.value / total) * 1000) / 10 : 0,
    })),
  };
}

/** Giá trị lớn nhất của các series trong mọi hàng — đầu vào của `niceAxisMax`. */
export function maxOfSeries(rows: readonly ChartRow[], series: readonly ChartSeries[]): number {
  return Math.max(0, ...rows.flatMap((row) => series.map((s) => Number(row[s.key]) || 0)));
}

/** Tổng các series của một hàng — đầu vào của cột chồng / vùng chồng. */
export function stackTotal(row: ChartRow, series: readonly ChartSeries[]): number {
  return series.reduce((sum, s) => sum + (Number(row[s.key]) || 0), 0);
}

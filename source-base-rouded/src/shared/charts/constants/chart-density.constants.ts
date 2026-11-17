export type ChartDensity = 'compact' | 'base' | 'large' | 'xlarge';

/**
 * Mọi số là px. Cỡ chữ: `axis` · `legend` · `tooltipTitle` · `tooltipItem` · `barLabel` · `pieLabel`.
 * Nét `lineWidth` · `gridWidth` · `leaderWidth` phải là SỐ NGUYÊN; `*Radius` = bán kính chấm.
 * `yAxisWidth` = bề rộng trục Y, vừa nhãn ≤ 3 ký tự; nhãn dài hơn (`100%`, `12.500`) → `yAxisWidthFor`.
 */
export interface ChartDensityScale {
  axis: number;
  legend: number;
  tooltipTitle: number;
  tooltipItem: number;
  barLabel: number;
  pieLabel: number;
  lineWidth: number;
  dotRadius: number;
  activeDotRadius: number;
  gridWidth: number;
  yAxisWidth: number;
  leaderWidth: number;
}

/** Chiều cao vùng vẽ THỰC (px, đã trừ header + padding) mở đầu mỗi bậc; dưới `base` → `compact`. */
export const CHART_DENSITY_BREAKPOINTS = {
  base: 200,
  large: 360,
  xlarge: 520,
} as const;

/** Cỡ chữ/nét theo bậc — đọc qua `useChartMetrics().scale`; đọc thẳng bảng này là bỏ qua `uiScale` của TV. */
export const CHART_DENSITY_SCALE: Record<ChartDensity, ChartDensityScale> = {
  compact: {
    axis: 11,
    legend: 11,
    tooltipTitle: 12,
    tooltipItem: 11,
    barLabel: 11,
    pieLabel: 11,
    lineWidth: 2,
    dotRadius: 2.5,
    activeDotRadius: 5,
    gridWidth: 1,
    yAxisWidth: 36,
    leaderWidth: 1,
  },
  base: {
    axis: 12,
    legend: 12,
    tooltipTitle: 13,
    tooltipItem: 12,
    barLabel: 13,
    pieLabel: 12,
    lineWidth: 2,
    dotRadius: 3,
    activeDotRadius: 6,
    gridWidth: 1,
    yAxisWidth: 42,
    leaderWidth: 1,
  },
  large: {
    axis: 14,
    legend: 13,
    tooltipTitle: 14,
    tooltipItem: 13,
    barLabel: 15,
    pieLabel: 14,
    lineWidth: 3,
    dotRadius: 4,
    activeDotRadius: 7,
    gridWidth: 1,
    yAxisWidth: 50,
    leaderWidth: 2,
  },
  xlarge: {
    axis: 16,
    legend: 15,
    tooltipTitle: 16,
    tooltipItem: 15,
    barLabel: 18,
    pieLabel: 16,
    lineWidth: 4,
    dotRadius: 5,
    activeDotRadius: 9,
    gridWidth: 1,
    yAxisWidth: 58,
    leaderWidth: 2,
  },
};

/** Bậc mặc định khi chưa đo được kích thước (frame đầu tiên). */
export const CHART_DENSITY_FALLBACK: ChartDensity = 'base';

/**
 * Bề rộng vùng vẽ THỰC (px) chia 3 dải: `narrow` (< 420) = khung chart trên điện thoại dọc (viewport − lề 32 − đệm thẻ),
 * `wide` (≥ 720) = chart trải rộng. Chỉ đổi MẬT ĐỘ NHÃN (trục, legend), KHÔNG đổi cỡ chữ — cỡ chữ theo chiều cao.
 */
export const CHART_WIDTH_BREAKPOINTS = {
  narrow: 420,
  wide: 720,
} as const;

/**
 * Sàn khung chart (px): lưới an toàn khi cha chưa có chiều cao — khung không về 0 (Recharts bỏ vẽ + cảnh báo `width(0)
 * height(0)`). Cố ý thấp (sparkline cao 40px vẫn vừa): chart có trục vẫn phải được cha cấp chiều cao thật (`h-56`).
 */
export const CHART_MIN_SIZE = {
  width: 0,
  height: 32,
} as const;

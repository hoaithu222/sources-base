/**
 * `@/shared/charts` — hạ tầng chart dùng chung (Recharts + SVG). Dùng: `const [boxRef, m] = useChartMetrics()`
 * rồi truyền `m.grid` / `m.axisTick` / `m.axisLine` / `m.scale.*` vào Recharts; không viết `fontSize` bằng số trong
 * file chart. Hệ số TV đến từ `ChartScaleProvider` (gắn ở `AppProvider`).
 */

export {
  CHART_DENSITY_BREAKPOINTS,
  CHART_DENSITY_FALLBACK,
  CHART_DENSITY_SCALE,
  CHART_MIN_SIZE,
  CHART_WIDTH_BREAKPOINTS,
} from './constants/chart-density.constants';
export type { ChartDensity, ChartDensityScale } from './constants/chart-density.constants';

export * from './constants/chart-palette.constants';

export {
  divergingTokenAt,
  divergingTokenFor,
  kpiHealthToken,
  sequentialScale,
  sequentialTokenAt,
  sequentialTokenForRatio,
  seriesTokenAt,
  tokenAtStep,
  tokenDarker,
  tokenStep,
  tokenVar,
  tokenVarAlpha,
  tokenVarOver,
} from './utils/chart-color.utils';

export {
  contrastRatio,
  deltaE,
  oklchOf,
  worstCvdDeltaE,
  worstDeltaE,
} from './utils/chart-color-distance.utils';
export type { ColorVision } from './utils/chart-color-distance.utils';

export { fmt3, labelInt } from './utils/chart-format.utils';

export {
  CHART_CONTAINER_PROPS,
  CHART_INTERACTION_PROPS,
  CHART_TOOLTIP_SURFACE,
  barSizeByCount,
  buildChartStyles,
  chartDensityFor,
  isNarrowChart,
} from './utils/chart-style.utils';
export type { ChartStyles } from './utils/chart-style.utils';

export {
  arcGradientId,
  arcGradientStops,
  arcGradientVectors,
  arcSpectrumStops,
  barGradient,
  columnGradientStops,
} from './utils/chart-gradient.utils';
export type {
  ArcGradientStop,
  ArcGradientVector,
  ArcStop,
  DonutGeometry,
} from './utils/chart-gradient.utils';

export * from './utils/chart-axis.utils';

export {
  ARC_LABEL_FILL,
  ARC_LABEL_MAX,
  ARC_LABEL_STYLE,
  arcLabelFits,
  arcLabelFontSize,
  arcLabelPoint,
} from './utils/chart-arc-label.utils';
export type { ArcLabelPoint } from './utils/chart-arc-label.utils';

export {
  PERCENT_LABEL_CHARS,
  centerCaptionFits,
  centerLabelFont,
  centerLabelMaxWidth,
} from './utils/chart-center-label.utils';
export type { CenterLabelFitOptions, CenterLabelFont } from './utils/chart-center-label.utils';

export { useChartMetrics } from './useChartMetrics';
export type { ChartMetrics } from './useChartMetrics';

export { default as ChartScaleProvider } from './ChartScaleProvider';
export { default as ProgressDonutChart } from './ProgressDonutChart';
export type { ProgressDonutChartProps } from './ProgressDonutChart';

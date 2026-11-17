import type { CSSProperties } from 'react';

import {
  CHART_DENSITY_BREAKPOINTS,
  CHART_DENSITY_SCALE,
  CHART_MIN_SIZE,
  CHART_WIDTH_BREAKPOINTS,
  type ChartDensity,
  type ChartDensityScale,
} from '../constants/chart-density.constants';
import { CHART_CHROME, CHART_CHROME_TV } from '../constants/chart-palette.constants';
import { tokenVar, tokenVarAlpha } from './chart-color.utils';

/**
 * Chọn bậc mật độ theo chiều cao ĐO ĐƯỢC (px) của vùng vẽ.
 * Truyền thẳng, KHÔNG chia cho `uiScale`: TV chỉ nhân cỡ chữ, khung chart giữ nguyên kích thước.
 */
export function chartDensityFor(height: number): ChartDensity {
  if (height >= CHART_DENSITY_BREAKPOINTS.xlarge) return 'xlarge';
  if (height >= CHART_DENSITY_BREAKPOINTS.large) return 'large';
  if (height >= CHART_DENSITY_BREAKPOINTS.base) return 'base';
  return 'compact';
}

/** Khung chart HẸP (điện thoại dọc)? Chưa đo được (`width ≤ 0`) → coi là KHÔNG hẹp, đợi lần đo sau. */
export function isNarrowChart(width: number): boolean {
  return width > 0 && width < CHART_WIDTH_BREAKPOINTS.narrow;
}

/**
 * Props chung cho `<LineChart>` / `<BarChart>` / `<AreaChart>` / `<PieChart>`: `throttledEvents: []` tắt rAF-throttle của
 * Recharts 3 — chạm ĐẦU TIÊN trên màn cảm ứng mới hiện tooltip / bắn `onClick` (mặc định nó trễ 1 frame rồi bị chạm
 * kế huỷ). `useChartMetrics` trả bản này ở `m.chartProps`.
 */
export const CHART_INTERACTION_PROPS = { throttledEvents: [] } as const;

/** Props cho `<ResponsiveContainer>`: lấp khung cha nhưng có SÀN chiều cao — cha không có chiều cao thì khung không về 0. */
export const CHART_CONTAINER_PROPS = {
  width: '100%',
  height: '100%',
  minWidth: CHART_MIN_SIZE.width,
  minHeight: CHART_MIN_SIZE.height,
} as const;

function scaleFont(value: number, uiScale: number): number {
  return Math.round(value * uiScale);
}

function scaleStroke(value: number, uiScale: number): number {
  return Math.max(1, Math.round(value * uiScale));
}

export interface ChartStyles {
  scale: ChartDensityScale;
  /** `tick` của XAxis/YAxis. */
  axisTick: { fill: string; fontSize: number; fontWeight: number };
  /** `axisLine` của trục hiển thị — đậm hơn lưới một bậc (`CHART_CHROME.axis`). */
  axisLine: { stroke: string; strokeWidth: number };
  /** Props của `<CartesianGrid>` — nét LIỀN 1px. */
  grid: { stroke: string; strokeWidth: number };
  /** `wrapperStyle` của `<Legend>`. */
  legend: CSSProperties;
  /** `labelStyle` của `<Legend>`: Recharts mặc định tô chữ chú giải bằng màu series — ghi đè về màu chữ. */
  legendLabel: CSSProperties;
  /** `contentStyle` của `<Tooltip>` — cùng bề mặt với `<Tooltip variant="data">` của kit. */
  tooltip: CSSProperties;
  /** `itemStyle` của `<Tooltip>`. */
  tooltipItem: CSSProperties;
  /** `labelStyle` của `<Tooltip>` — dòng tiêu đề, có vạch ngăn với các dòng số liệu. */
  tooltipLabel: CSSProperties;
  /** `cursor` của `<Tooltip>` trên biểu đồ đường / vùng: vạch dọc đứt màu chrome. */
  lineCursor: { stroke: string; strokeWidth: number; strokeDasharray: string };
  /** `cursor` của `<Tooltip>` trên biểu đồ cột: dải nền nhạt. */
  barCursor: { fill: string };
  /** `dot` của `<Line>` / `<Area>`: chấm RỖNG (ruột màu nền), viền lấy màu series. */
  dot: { r: number; fill: string };
  /** `activeDot`: chấm đặc màu series + vành màu nền tách khỏi đường (thay vành trắng mặc định). */
  activeDot: { r: number; stroke: string; strokeWidth: number };
  /**
   * Spread vào `<LabelList {...m.barLabel} />` trên đỉnh cột.
   * Cố ý KHÔNG có `fontFamily` / `stroke`: số dùng font sans + `tabular-nums` (chart-conventions.md §1.8).
   */
  barLabel: {
    fontSize: number;
    fontWeight: number;
    letterSpacing: string;
  };
}

const BAR_LABEL_WEIGHT = 600;
const BAR_LABEL_WEIGHT_TV = 700;
const CURSOR_DASH = '4 4';
const BAR_CURSOR_ALPHA = 0.08;

/**
 * Mặt nổi của tooltip chart (nền, viền, bóng) — `buildChartStyles` trải vào `m.tooltip`; tooltip tự vẽ
 * (`<Tooltip content={…}>`) trải hằng này để cùng mặt với tooltip mặc định. Bo góc đọc biến `--radius-md`
 * (8px ở cả hai theme, như `<Tooltip variant="data">`).
 */
export const CHART_TOOLTIP_SURFACE = {
  backgroundColor: tokenVar('bg-popup'),
  border: `1px solid ${tokenVar('border-strong')}`,
  borderRadius: 'var(--radius-md)',
  padding: '8px 10px',
  maxWidth: 'min(18rem, calc(100vw - 2rem))',
  color: tokenVar('fg-heading'),
  boxShadow: '0 8px 24px var(--color-shadow-popup)',
} as const satisfies CSSProperties;

/**
 * Dựng toàn bộ style chart cho một bậc mật độ; thường gọi qua `useChartMetrics`. `uiScale` PHẢI là scale HIỆU LỰC
 * (`selectEffectiveUiScale`), không phải `state.uiScale` (store vẫn nhớ hệ số TV khi đã tắt). `narrow` (khung hẹp,
 * `isNarrowChart`): legend dãn dòng, quá 5 dòng thì cuộn dọc thay vì lấn vùng vẽ.
 */
export function buildChartStyles(density: ChartDensity, uiScale = 1, narrow = false): ChartStyles {
  const base = CHART_DENSITY_SCALE[density];
  const isTv = uiScale > 1;
  const chrome = isTv ? CHART_CHROME_TV : CHART_CHROME;
  const axisColor = tokenVar(chrome.axis);
  const surface = tokenVar('bg-surface');

  const scale: ChartDensityScale = isTv
    ? {
        axis: scaleFont(base.axis, uiScale),
        legend: scaleFont(base.legend, uiScale),
        tooltipTitle: scaleFont(base.tooltipTitle, uiScale),
        tooltipItem: scaleFont(base.tooltipItem, uiScale),
        barLabel: scaleFont(base.barLabel, uiScale),
        pieLabel: scaleFont(base.pieLabel, uiScale),
        lineWidth: scaleStroke(base.lineWidth, uiScale),
        dotRadius: base.dotRadius * uiScale,
        activeDotRadius: base.activeDotRadius * uiScale,
        gridWidth: scaleStroke(base.gridWidth, uiScale),
        yAxisWidth: Math.round(base.yAxisWidth * uiScale),
        leaderWidth: scaleStroke(base.leaderWidth, uiScale),
      }
    : base;

  return {
    scale,

    axisTick: {
      fill: tokenVar(chrome.axisLabel),
      fontSize: scale.axis,
      fontWeight: isTv ? 600 : 500,
    },

    axisLine: { stroke: axisColor, strokeWidth: scale.gridWidth },

    grid: { stroke: tokenVar(chrome.grid), strokeWidth: scale.gridWidth },

    legend: {
      fontSize: scale.legend,
      paddingTop: 4,
      ...(narrow
        ? { lineHeight: 1.3, maxHeight: scale.legend * 5, overflowY: 'auto' as const }
        : null),
    },

    legendLabel: {
      color: tokenVar(isTv ? 'fg-heading' : 'fg-body'),
    },

    tooltip: {
      ...CHART_TOOLTIP_SURFACE,
      fontSize: scale.tooltipItem,
      fontVariantNumeric: 'tabular-nums',
    },

    tooltipItem: {
      color: tokenVar('fg-subheading'),
      fontSize: scale.tooltipItem,
      padding: '2px 0',
    },

    tooltipLabel: {
      color: tokenVar('fg-heading'),
      fontSize: scale.tooltipTitle,
      fontWeight: 600,
      marginBottom: 4,
      paddingBottom: 4,
      borderBottom: `1px solid ${tokenVar('divider-default')}`,
    },

    lineCursor: { stroke: axisColor, strokeWidth: scale.gridWidth, strokeDasharray: CURSOR_DASH },

    barCursor: { fill: tokenVarAlpha('primary-5', BAR_CURSOR_ALPHA) },

    dot: { r: scale.dotRadius, fill: surface },

    activeDot: { r: scale.activeDotRadius, stroke: surface, strokeWidth: scale.lineWidth },

    barLabel: {
      fontSize: scale.barLabel,
      fontWeight: isTv ? BAR_LABEL_WEIGHT_TV : BAR_LABEL_WEIGHT,
      letterSpacing: '-0.01em',
    },
  };
}

/** Bề rộng cột (px) theo SỐ NHÓM trên trục — ít nhóm cột to, nhiều nhóm cột mảnh; `scale` = `m.uiScale`. */
export function barSizeByCount(groupCount: number, scale = 1): number {
  const base =
    groupCount <= 2 ? 34 : groupCount <= 4 ? 22 : groupCount <= 6 ? 16 : groupCount <= 10 ? 12 : 9;
  return Math.round(base * scale);
}

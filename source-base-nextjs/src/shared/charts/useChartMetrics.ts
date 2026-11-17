'use client';

import { useContext, useMemo } from 'react';

import { useElementSize } from '@/shared/hooks';

import { ChartScaleContext } from './chart-scale.context';
import { CHART_DENSITY_FALLBACK } from './constants/chart-density.constants';
import type { ChartDensity } from './constants/chart-density.constants';
import {
  CHART_CONTAINER_PROPS,
  CHART_INTERACTION_PROPS,
  buildChartStyles,
  chartDensityFor,
  isNarrowChart,
  type ChartStyles,
} from './utils/chart-style.utils';

export interface ChartMetrics extends ChartStyles {
  density: ChartDensity;
  /** Bề rộng ĐO ĐƯỢC của vùng vẽ (px). */
  width: number;
  /** Chiều cao ĐO ĐƯỢC của vùng vẽ (px). */
  height: number;
  /** Hệ số TV đang có hiệu lực — `1` ở chế độ standard. */
  uiScale: number;
  /** Khung hẹp (< 420px, điện thoại dọc): legend gọn, nhãn trục thưa hơn. `false` khi chưa đo được. */
  narrow: boolean;
  /** Bề rộng vùng vẽ trừ trục Y (px) — đầu vào của `xAxisLayout`. */
  plotWidth: number;
  /** Props cho `<ResponsiveContainer {...m.container}>` — lấp khung cha, có sàn chiều cao. */
  container: typeof CHART_CONTAINER_PROPS;
  /** Props cho `<LineChart {...m.chartProps}>` — tooltip / `onClick` ăn ngay lần chạm đầu trên màn cảm ứng. */
  chartProps: typeof CHART_INTERACTION_PROPS;
}

/**
 * useChartMetrics — đo vùng vẽ của chart rồi trả bộ style đúng bậc mật độ: slot bẹt lấy `compact`, bấm xem toàn
 * màn hình thì vùng vẽ cao lên và chart tự nhảy sang `large` / `xlarge` (chữ, nét, chấm, bề rộng trục to theo).
 * Bề rộng quyết định MẬT ĐỘ NHÃN (`narrow`, `plotWidth` → `xAxisLayout`), không đổi cỡ chữ.
 *
 * Hệ số TV đọc từ `ChartScaleProvider` (gắn sẵn ở `AppProviders`) — chart KHÔNG tự đọc store.
 * Lưu ý: quên gắn `boxRef` thì chart kẹt ở bậc mặc định.
 *
 * @param uiScaleOverride - Chỉ để ghi đè trong test / showcase; bỏ trống thì lấy từ `ChartScaleProvider`.
 * @returns `[boxRef, m]` — gắn `boxRef` lên khung bọc chart, truyền `m.grid` / `m.axisTick` / `m.scale.*` vào Recharts.
 *
 * @example
 * const [boxRef, m] = useChartMetrics<HTMLDivElement>();
 * <div ref={boxRef} className="h-full w-full">
 *   <ResponsiveContainer {...m.container}>
 *     <LineChart {...m.chartProps} data={data}>
 *       <XAxis tick={m.axisTick} axisLine={m.axisLine} /> <YAxis width={m.scale.yAxisWidth} tick={m.axisTick} />
 *     </LineChart>
 *   </ResponsiveContainer>
 * </div>
 */
export function useChartMetrics<T extends HTMLElement>(uiScaleOverride?: number) {
  const contextScale = useContext(ChartScaleContext);
  const uiScale = uiScaleOverride ?? contextScale;
  const [ref, size] = useElementSize<T>();

  const metrics = useMemo<ChartMetrics>(() => {
    const density = size.height > 0 ? chartDensityFor(size.height) : CHART_DENSITY_FALLBACK;
    const narrow = isNarrowChart(size.width);
    const styles = buildChartStyles(density, uiScale, narrow);
    return {
      ...styles,
      density,
      width: size.width,
      height: size.height,
      uiScale,
      narrow,
      plotWidth: Math.max(0, size.width - styles.scale.yAxisWidth),
      container: CHART_CONTAINER_PROPS,
      chartProps: CHART_INTERACTION_PROPS,
    };
  }, [size.height, size.width, uiScale]);

  return [ref, metrics] as const;
}

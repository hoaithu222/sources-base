import type { ReactNode } from 'react';

import { ChartScaleContext } from './chart-scale.context';

interface ChartScaleProviderProps {
  uiScale: number;
  children: ReactNode;
}

/**
 * ChartScaleProvider — cấp hệ số TV cho MỌI chart bên dưới; `useChartMetrics()` tự đọc, chart không phải truyền tay.
 *
 * Gắn MỘT lần ở gốc app (`AppProvider`), giá trị là scale HIỆU LỰC (`selectEffectiveUiScale`), không phải
 * `state.uiScale` (store vẫn nhớ hệ số TV khi đang ở chế độ thường). Thiếu provider → `1` (lờ chế độ TV).
 *
 * @param props.uiScale - Hệ số cỡ chữ đang có hiệu lực: `1` ở chế độ thường, `> 1` ở chế độ TV.
 * @param props.children - Cây giao diện chứa chart.
 *
 * @example
 * const uiScale = useDisplayStore(selectEffectiveUiScale);
 * <ChartScaleProvider uiScale={uiScale}>{children}</ChartScaleProvider>
 */
function ChartScaleProvider({ uiScale, children }: ChartScaleProviderProps) {
  return <ChartScaleContext value={uiScale}>{children}</ChartScaleContext>;
}

export default ChartScaleProvider;

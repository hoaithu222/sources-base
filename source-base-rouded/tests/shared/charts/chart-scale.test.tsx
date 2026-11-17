/**
 * Hệ số TV của chart — trước đây `useChartMetrics(uiScale = 1)` nhận tham số: chart nào quên truyền thì IM LẶNG
 * bỏ chế độ TV. Nay hook đọc `ChartScaleProvider` (gắn sẵn ở `AppProvider`); tham số chỉ còn để ghi đè.
 */

import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { ChartScaleProvider, useChartMetrics } from '@/shared/charts';

const tvScale =
  (uiScale: number) =>
  ({ children }: { children: ReactNode }) => (
    <ChartScaleProvider uiScale={uiScale}>{children}</ChartScaleProvider>
  );

describe('useChartMetrics đọc hệ số TV từ ChartScaleProvider', () => {
  it('không có provider → 1 (chế độ thường)', () => {
    const { result } = renderHook(() => useChartMetrics());
    expect(result.current[1].uiScale).toBe(1);
  });

  it('có provider → dùng hệ số của provider, chữ phóng theo', () => {
    const plain = renderHook(() => useChartMetrics()).result.current[1];
    const { result } = renderHook(() => useChartMetrics(), { wrapper: tvScale(1.2) });
    expect(result.current[1].uiScale).toBe(1.2);
    expect(result.current[1].scale.axis).toBe(Math.round(plain.scale.axis * 1.2));
  });

  it('tham số ghi đè provider (test / showcase)', () => {
    const { result } = renderHook(() => useChartMetrics(1.3), { wrapper: tvScale(1.2) });
    expect(result.current[1].uiScale).toBe(1.3);
  });
});

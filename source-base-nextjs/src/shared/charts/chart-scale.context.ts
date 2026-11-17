'use client';

import { createContext } from 'react';

/**
 * Hệ số TV ĐANG HIỆU LỰC cho mọi chart (`1` = chế độ thường). Đặt giá trị qua `<ChartScaleProvider>` ở gốc app;
 * đọc qua `useChartMetrics()` — không `useContext` trực tiếp trong file chart.
 */
export const ChartScaleContext = createContext(1);

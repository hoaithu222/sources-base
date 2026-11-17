/**
 * 8 slot series, thứ tự CỐ ĐỊNH (không xáo): cyan · cam · tím · hồng · lục · chàm · mòng két · vàng đất. Lấy qua
 * `seriesTokenAt(i)`; quá 8 → `CHART_OTHER_TOKEN`. Mỗi bậc đã qua validator (chart-conventions.md §1.2.1).
 */
export const CHART_SERIES_TOKENS = [
  'secondary-6',
  'orange-6',
  'purple-5',
  'pink-6',
  'primary-7',
  'indigo-6',
  'teal-6',
  'yellow-7',
] as const;

/** Lát "Khác" / series phụ — xám một hex cho cả hai theme (`shared` trong `colors-theme.json`), ≥ 3:1 trên mọi nền chart. */
export const CHART_OTHER_TOKEN = 'chart-other';

/** Thang SEQUENTIAL (độ lớn, 1 hue sky): bậc 1 = THẤP nhất → bậc 6 = CAO nhất; bản dark chọn riêng (đảo neo). */
export const CHART_SEQUENTIAL_TOKENS = [
  'chart-seq-1',
  'chart-seq-2',
  'chart-seq-3',
  'chart-seq-4',
  'chart-seq-5',
  'chart-seq-6',
] as const;

/** Thang DIVERGING (hai phía quanh mốc): bậc 1 = cực lạnh (âm) … bậc 4 = xám trung tính … bậc 7 = cực nóng (dương). */
export const CHART_DIVERGING_TOKENS = [
  'chart-div-1',
  'chart-div-2',
  'chart-div-3',
  'chart-div-4',
  'chart-div-5',
  'chart-div-6',
  'chart-div-7',
] as const;

/** Chỉ số (từ 0) của điểm giữa trung tính trong `CHART_DIVERGING_TOKENS`. */
export const CHART_DIVERGING_MID_INDEX = 3;

/** Cặp Kế hoạch / Thực tế BẮT BUỘC dùng các token này (`plan` nét đứt, `actual` nét liền dày hơn). */
export const CHART_SEMANTIC = {
  plan: 'info-5',
  actual: 'success-6',
  forecast: 'warning-5',
} as const;

/** Trạng thái tiến độ: `done` xong · `running` đang làm · `slow` chậm so với kế hoạch · `late` quá hạn. LUÔN kèm chữ / icon. */
export const CHART_STATUS = {
  done: 'success-6',
  running: 'info-5',
  slow: 'warning-5',
  late: 'error-6',
} as const;

/** Ngưỡng % sức khoẻ CHỈ TIÊU → token trạng thái, dò từ trên xuống; dùng qua `kpiHealthToken()`. */
export const KPI_HEALTH_THRESHOLDS = [
  { min: 90, token: CHART_STATUS.done },
  { min: 60, token: CHART_STATUS.running },
  { min: 30, token: CHART_STATUS.slow },
  { min: 0, token: CHART_STATUS.late },
] as const;

/**
 * Chrome (lưới, đường trục + con trỏ tooltip, nhãn trục, `track` = vành nền phần CHƯA đạt của vòng tiến độ) — được
 * dùng scale ngoài `-5`. Trục đậm hơn lưới một bậc: đường gốc là mốc đọc, lưới chỉ là vạch phụ.
 * Mọi khoá đều có nơi đọc (`buildChartStyles`, `ProgressDonutChart`); thêm khoá thì thêm nơi đọc.
 */
export const CHART_CHROME = {
  grid: 'border-default',
  axis: 'border-strong',
  track: 'divider-default',
  axisLabel: 'fg-muted',
} as const;

/** Chrome ở chế độ TV (`uiScale > 1`) — chỉ nâng tương phản lưới / trục / nhãn; `track` dùng chung `CHART_CHROME`. */
export const CHART_CHROME_TV = {
  grid: 'border-strong',
  axis: 'border-strong',
  axisLabel: 'fg-subheading',
} as const;

/** `strokeDasharray` cho đường Kế hoạch (`plan`) / Dự báo (`forecast`). */
export const CHART_DASH = {
  plan: '6 4',
  forecast: '4 4',
} as const;

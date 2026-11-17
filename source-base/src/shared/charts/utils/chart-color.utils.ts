import { THEME_COLOR_KEYS } from '@/shared/theme';
import { colorMix } from '@/shared/utils/style/color-mix.utils';

import {
  CHART_DIVERGING_MID_INDEX,
  CHART_DIVERGING_TOKENS,
  CHART_OTHER_TOKEN,
  CHART_SEQUENTIAL_TOKENS,
  CHART_SERIES_TOKENS,
  CHART_STATUS,
  KPI_HEALTH_THRESHOLDS,
} from '../constants/chart-palette.constants';

/**
 * chart-color.utils — từ TÊN token (`'info-5'`, `'bg-surface'`) ra giá trị màu CSS cho prop của Recharts / SVG,
 * và chọn token theo vai trò (series · sequential · diverging · sức khoẻ chỉ tiêu).
 *
 * Dùng:   fill={tokenVar(CHART_STATUS.done)} · cursor={{ fill: tokenVarAlpha('primary-5', 0.08) }}
 *         heatmap → `sequentialTokenForRatio(v / max)` · lệch so với kế hoạch → `divergingTokenFor(delta, extent)`
 * Lưu ý:  ⛔ `alpha` thang 0–1 (đi qua `colorMix`); đổi bậc cho gradient CHỈ qua `tokenAtStep` / `tokenDarker`.
 */

const TOKEN_KEYS: ReadonlySet<string> = new Set(THEME_COLOR_KEYS);

const SEQUENTIAL_LAST = CHART_SEQUENTIAL_TOKENS.length - 1;
const DIVERGING_ARM = CHART_DIVERGING_MID_INDEX;

/** `'info-5'` → `'var(--color-info-5)'`. */
export function tokenVar(token: string): string {
  return `var(--color-${token})`;
}

/** Token pha trong suốt (`alpha` 0–1) — nền hover, con trỏ cột, quầng sáng. */
export function tokenVarAlpha(token: string, alpha: number): string {
  return colorMix(tokenVar(token), alpha);
}

/** Tint ĐỤC (`alpha` 0–1): trộn với token NỀN thay vì `transparent` — cho ruột khối "viền 2 lớp". */
export function tokenVarOver(token: string, alpha: number, baseToken = 'bg-surface'): string {
  return colorMix(tokenVar(token), alpha, tokenVar(baseToken));
}

/** Đổi BẬC, giữ hue: `tokenAtStep('info-5', 6)` → `'info-6'`. Không kiểm bậc có tồn tại — cần kiểm thì `tokenDarker`. */
export function tokenAtStep(token: string, step: number): string {
  return `${token.replace(/-\d+$/, '')}-${step}`;
}

/** Bậc của token thang số (`'teal-6'` → 6); token không có hậu tố bậc (`'chart-other'`, `'fg-muted'`) → `null`. */
export function tokenStep(token: string): number | null {
  const step = /-(\d+)$/.exec(token)?.[1];
  return step === undefined ? null : Number(step);
}

/**
 * Hạ `by` bậc (tối hơn) cùng hue, KẸP ở bậc cuối còn tồn tại: `tokenDarker('teal-7', 2)` → `'teal-8'` (teal không có
 * bậc 9). Token không có bậc hoặc thang CHỈ SỐ (`chart-seq-*`, `chart-div-*`) trả nguyên. Dùng cho gradient — bậc
 * nhảy ra ngoài thang sẽ tô trong suốt.
 */
export function tokenDarker(token: string, by = 1): string {
  const step = tokenStep(token);
  if (step === null || token.startsWith('chart-')) return token;
  for (let next = step + by; next > step; next -= 1) {
    const candidate = tokenAtStep(token, next);
    if (TOKEN_KEYS.has(candidate)) return candidate;
  }
  return token;
}

/** Màu series thứ `index` (từ 0); quá 8 → `CHART_OTHER_TOKEN`, KHÔNG quay vòng (series 9 trùng series 1). */
export function seriesTokenAt(index: number): string {
  return CHART_SERIES_TOKENS[index] ?? CHART_OTHER_TOKEN;
}

/** Sức khoẻ một CHỈ TIÊU theo % (≥ 90 tốt · ≥ 60 đang chạy · ≥ 30 chậm · còn lại trễ) → token trạng thái. */
export function kpiHealthToken(percent: number): string {
  const tier = KPI_HEALTH_THRESHOLDS.find((t) => percent >= t.min);
  return tier?.token ?? CHART_STATUS.late;
}

function clampIndex(index: number, last: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.max(0, Math.min(last, Math.round(index)));
}

/** Bậc sequential thứ `index` (0 = thấp nhất … 5 = cao nhất); ngoài khoảng kẹp về biên. */
export function sequentialTokenAt(index: number): string {
  return CHART_SEQUENTIAL_TOKENS[clampIndex(index, SEQUENTIAL_LAST)];
}

/** `count` lớp màu sequential cách đều, thấp → cao (heatmap 3–5 lớp); `count` kẹp trong 0…6. */
export function sequentialScale(count: number): string[] {
  const n = Math.max(0, Math.min(CHART_SEQUENTIAL_TOKENS.length, Math.floor(count)));
  if (n === 1) return [sequentialTokenAt(SEQUENTIAL_LAST)];
  return Array.from({ length: n }, (_, i) => sequentialTokenAt((i * SEQUENTIAL_LAST) / (n - 1)));
}

/** Tỉ lệ 0–1 (giá trị / giá trị lớn nhất) → bậc sequential; ngoài khoảng kẹp về biên. */
export function sequentialTokenForRatio(ratio: number): string {
  return sequentialTokenAt(ratio * CHART_SEQUENTIAL_TOKENS.length - 0.5);
}

/** Bậc diverging thứ `index` (0 = cực âm … 3 = trung tính … 6 = cực dương); ngoài khoảng kẹp về biên. */
export function divergingTokenAt(index: number): string {
  return CHART_DIVERGING_TOKENS[clampIndex(index, CHART_DIVERGING_TOKENS.length - 1)];
}

/**
 * Giá trị có dấu → bậc diverging, 3 bậc mỗi phía: `extent` là độ lệch ứng với màu cực (`±extent` trở ra kẹp
 * về cực); lệch nhỏ hơn nửa bậc rơi vào trung tính. `extent ≤ 0` → luôn trung tính.
 */
export function divergingTokenFor(value: number, extent: number): string {
  if (!(extent > 0) || !Number.isFinite(value)) return divergingTokenAt(CHART_DIVERGING_MID_INDEX);
  const ratio = Math.max(-1, Math.min(1, value / extent));
  return divergingTokenAt(CHART_DIVERGING_MID_INDEX + Math.round(ratio * DIVERGING_ARM));
}

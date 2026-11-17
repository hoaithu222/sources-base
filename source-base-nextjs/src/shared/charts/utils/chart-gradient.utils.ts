import { colorMix } from '@/shared/utils/style/color-mix.utils';

import { tokenDarker, tokenVar } from './chart-color.utils';

/**
 * chart-gradient — công thức gradient cho MẢNG LỚN trong chart (cung donut, thân bar, area fill);
 * chuẩn hoá theo `chart-conventions.md §1.3`. `color` nhận token trần · `var(--color-*)` · hex.
 *
 * Dùng:   thanh chữ nhật → `barGradient(color)` · cột dọc → `columnGradientStops(color)` · đĩa đặc →
 *         `arcGradientStops(color)` · vành donut nhiều lát → `arcGradientVectors` + `arcSpectrumStops` + `arcGradientId`
 * Lưu ý:  ⛔ gradient CHỈ đổi BẬC, KHÔNG đổi hue — tương đối so với bậc của token (`depth` 1 = tối hơn 1 bậc, qua
 *         `tokenDarker`); mép ngoài LUÔN là token series. Màu chrome / thang chỉ số (`chart-seq-*`) / token không hạ bậc
 *         được → tô PHẲNG. Lý do từng quy tắc: docs/notes/code/charts.md.
 */

const ARC_GRADIENT_STOPS = [
  { offset: '62%', depth: 1 },
  { offset: '100%', depth: 0 },
] as const;

export interface ArcGradientStop {
  /** Vị trí điểm dừng, truyền thẳng vào `<stop offset>`. */
  offset: string;
  /** Giá trị màu CSS, truyền thẳng vào `<stop stopColor>`. */
  color: string;
}

const HEX_INNER_MIX = 0.82;

const HEX_DEEP_BASE = 'var(--color-neutral-10)';

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim());
}

function tokenFromCssVar(value: string): string | null {
  return value.trim().match(/^var\(\s*--color-([a-zA-Z0-9-]+)\s*\)$/)?.[1] ?? null;
}

const CHROME_FAMILIES = new Set([
  'bg',
  'fg',
  'border',
  'divider',
  'neutral',
  'disabled',
  'cell',
  'header',
  'footer',
  'button',
  'chart-seq',
  'chart-div',
]);

function canStepDown(token: string): boolean {
  const family = /^(.+)-\d+$/.exec(token)?.[1];
  return family !== undefined && !CHROME_FAMILIES.has(family);
}

/**
 * 2 điểm dừng cùng hue (`token+1 → token`: tối hơn 1 bậc ở lõi, token series ở mép) cho MẢNG LỚN mà phần tử tham chiếu
 * là hình chữ nhật hoặc đĩa đặc (thân bar, area fill, `<Pie>` 360°); màu chrome / không hạ bậc được → 2 stop CÙNG màu.
 * ⛔ KHÔNG dùng cho vành donut nhiều lát (loang lổ do bbox từng `<path>`) — dùng `arcGradientVectors`.
 */
export function arcGradientStops(color: string): ArcGradientStop[] {
  if (isHexColor(color)) {
    return ARC_GRADIENT_STOPS.map(({ offset, depth }) => ({
      offset,
      color: depth > 0 ? colorMix(color, HEX_INNER_MIX, HEX_DEEP_BASE) : color,
    }));
  }

  const token = tokenFromCssVar(color) ?? color;

  if (!canStepDown(token)) {
    return ARC_GRADIENT_STOPS.map(({ offset }) => ({ offset, color: tokenVar(token) }));
  }

  return ARC_GRADIENT_STOPS.map(({ offset, depth }) => ({
    offset,
    color: tokenVar(tokenDarker(token, depth)),
  }));
}

const COLUMN_GRADIENT_STOPS = [
  { offset: '0%', depth: 2 },
  { offset: '55%', depth: 1 },
  { offset: '100%', depth: 0 },
] as const;

const HEX_MIX_BY_DEPTH: Record<number, number> = { 1: HEX_INNER_MIX, 2: 0.68 };

/**
 * 3 điểm dừng `token+2 → token+1 → token` (stop 0% = chân cột) cho CỘT DỌC CAO; `color` như `arcGradientStops`.
 * Dùng với `<linearGradient gradientUnits="userSpaceOnUse" x1={x} y1={baseY} x2={x} y2={topY}>`
 * — vector đi từ ĐÁY lên ĐỈNH.
 */
export function columnGradientStops(color: string): ArcGradientStop[] {
  if (isHexColor(color)) {
    return COLUMN_GRADIENT_STOPS.map(({ offset, depth }) => ({
      offset,
      color: depth === 0 ? color : colorMix(color, HEX_MIX_BY_DEPTH[depth], HEX_DEEP_BASE),
    }));
  }

  const token = tokenFromCssVar(color) ?? color;

  if (!canStepDown(token)) {
    return COLUMN_GRADIENT_STOPS.map(({ offset }) => ({ offset, color: tokenVar(token) }));
  }

  return COLUMN_GRADIENT_STOPS.map(({ offset, depth }) => ({
    offset,
    color: tokenVar(tokenDarker(token, depth)),
  }));
}

/**
 * Nền CSS `linear-gradient(...)` cho MẢNG CHỮ NHẬT (thanh ngang/dọc, thanh tiến độ, chip đặc):
 * mép trên = token series → mép dưới tối hơn 1 bậc. Gán thẳng vào `style.background`; `angleDeg` mặc định 180 (DỌC).
 * Màu không hạ bậc được → tô phẳng.
 */
export function barGradient(color: string, angleDeg = 180): string {
  const [inner, outer] = arcGradientStops(color);
  return `linear-gradient(${angleDeg}deg, ${outer.color} 0%, ${inner.color} 100%)`;
}

/**
 * Hình học vành donut, px trong user space của SVG. Truyền CÙNG bộ số này cho `<Pie>` — truyền %
 * cho `<Pie>` rồi đoán px ở đây thì gradient lệch khỏi cung.
 */
export interface DonutGeometry {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  /** Góc bắt đầu theo hệ Recharts (90 = 12h). Default 90. */
  startAngle?: number;
  /** Góc kết thúc. Default -270 = trọn vòng theo chiều kim đồng hồ. */
  endAngle?: number;
}

/** Vector gradient của 1 cung — bơm thẳng vào `<linearGradient>`. */
export interface ArcGradientVector {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Cung rộng (> 120°) — truyền cho `arcSpectrumStops`. */
  wide: boolean;
  /** 2 mép trùng nhau (1 lát chiếm trọn vòng) → PHẢI tô phẳng. */
  degenerate: boolean;
}

/**
 * Vector `<linearGradient gradientUnits="userSpaceOnUse">` cho từng cung, theo thứ tự `values` được vẽ:
 * từ mép đầu tới mép cuối ở bán kính GIỮA vành. Cung RỘNG (> 120°) dùng trục vuông góc phân giác
 * (`wide`, cặp với `arcSpectrumStops`); cung `degenerate` phải tô phẳng.
 */
export function arcGradientVectors(
  values: readonly number[],
  geometry: DonutGeometry,
): ArcGradientVector[] {
  const { cx, cy, innerRadius, outerRadius, startAngle = 90, endAngle = -270 } = geometry;
  const positive = values.map((v) => (v > 0 ? v : 0));
  const total = positive.reduce((acc, v) => acc + v, 0) || 1;
  const sweep = startAngle - endAngle;
  const midR = (innerRadius + outerRadius) / 2;

  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + midR * Math.cos(rad), y: cy - midR * Math.sin(rad) };
  };

  const out: ArcGradientVector[] = [];
  let acc = 0;
  for (const v of positive) {
    const a0 = startAngle - (acc / total) * sweep;
    acc += v;
    const a1 = startAngle - (acc / total) * sweep;
    const mid = (a0 + a1) / 2;
    const wide = Math.abs(a0 - a1) > 120;
    const from = wide ? pt(mid + 90) : pt(a0);
    const to = wide ? pt(mid - 90) : pt(a1);
    out.push({
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      wide,
      degenerate: Math.hypot(to.x - from.x, to.y - from.y) < 1,
    });
  }
  return out;
}

export interface ArcStop {
  offset: string;
  color: string;
  opacity: number;
}

/**
 * Điểm dừng (`opacity` → `stopOpacity`) cho gradient DỌC CUNG: cung hẹp giữ màu gốc tới 70% rồi pha 12%
 * sang màu lát KẾ TIẾP; cung rộng (`wide`) cùng hue, chỉ hạ độ đậm. Độ sâu bằng `stopOpacity` nên dùng
 * được cả cho hex legacy ngoài palette.
 */
export function arcSpectrumStops(color: string, nextColor: string, wide: boolean): ArcStop[] {
  if (wide) {
    return [
      { offset: '0%', color, opacity: 1 },
      { offset: '100%', color, opacity: 0.74 },
    ];
  }
  return [
    { offset: '0%', color, opacity: 1 },
    { offset: '70%', color, opacity: 0.94 },
    { offset: '100%', color: colorMix(color, 0.88, nextColor, 'oklab'), opacity: 0.88 },
  ];
}

/**
 * Id `<radialGradient>` an toàn cho `url(#...)`. Truyền `useId()` làm `uid` — nhiều donut trùng id thì mọi
 * cung ăn gradient của donut render đầu; ký tự `:` của `useId()` phá cú pháp `url(#...)` nên bị strip.
 */
export function arcGradientId(uid: string, key: string | number): string {
  const safeUid = uid.replace(/[^a-zA-Z0-9_-]/g, '');
  const safeKey = String(key).replace(/[^a-zA-Z0-9_-]/g, '');
  return `${safeUid}-arc-${safeKey}`;
}

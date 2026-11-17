export interface ArcLabelPoint {
  x: number;
  y: number;
}

/** Đổi `midAngle` của Recharts (truyền nguyên giá trị) sang toạ độ tâm nhãn — giữa bề dày vành. */
export function arcLabelPoint(
  cx: number,
  cy: number,
  midAngle: number,
  innerRadius: number,
  outerRadius: number,
): ArcLabelPoint {
  const rad = -midAngle * (Math.PI / 180);
  const r = (innerRadius + outerRadius) / 2;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const ARC_LABEL_MIN = 11;
export const ARC_LABEL_MAX = 18;

const ARC_LABEL_RATIO_DEFAULT = 0.46;

/** Cỡ chữ nhãn (px) theo bề dày vành, kẹp trong [11, `max`] × `uiScale`; `ratio` = chữ / bề dày vành. */
export function arcLabelFontSize(
  innerRadius: number,
  outerRadius: number,
  uiScale = 1,
  max = ARC_LABEL_MAX,
  ratio = ARC_LABEL_RATIO_DEFAULT,
): number {
  const thickness = Math.max(0, outerRadius - innerRadius);
  return Math.max(ARC_LABEL_MIN * uiScale, Math.min(max * uiScale, Math.round(thickness * ratio)));
}

/** `false` khi vành mỏng hơn `fontSize + 2` — bỏ nhãn thay vì để chữ tràn ra ngoài vành. */
export function arcLabelFits(innerRadius: number, outerRadius: number, fontSize: number): boolean {
  return outerRadius - innerRadius >= fontSize + 2;
}

/** Chữ trắng phẳng, không phụ thuộc theme — KHÔNG tô theo màu lát. */
export const ARC_LABEL_FILL = 'var(--color-neutral-0)';

/** Style cho `<text>` nhãn cung — đừng thêm `stroke` / `paintOrder` (viền cứng làm chữ nhoè). */
export const ARC_LABEL_STYLE = {
  fontWeight: 700,
  letterSpacing: '-0.01em',
  paintOrder: 'normal',
  filter: 'drop-shadow(0 1px 1.5px color-mix(in srgb, var(--color-neutral-10) 70%, transparent))',
} as const;

/** Cặp class token cho cụm nhãn ở tâm; `valuePx` / `captionPx` là cỡ px TRƯỚC `--ui-scale`. */
export interface CenterLabelFont {
  value: string;
  caption: string;
  valuePx: number;
  captionPx: number;
}

export interface CenterLabelFitOptions {
  /** Hệ số TV đang có hiệu lực (`useChartMetrics().uiScale`). Mặc định 1. */
  uiScale?: number;
  /** Số ký tự chừa cho con số (mặc định 4) — truyền bề rộng LỚN NHẤT, không phải `label.length`. */
  valueChars?: number;
  captionLines?: number;
}

/** Bề rộng chừa cho nhãn % ở tâm, luôn đo theo `'100%'` để mọi donut % cùng hàng ra CÙNG bậc chữ. */
export const PERCENT_LABEL_CHARS = 4;

const CENTER_LABEL_STEPS: readonly CenterLabelFont[] = [
  { value: 'text-h1-bold', valuePx: 40, caption: 'text-body-16', captionPx: 16 },
  { value: 'text-h2-bold', valuePx: 32, caption: 'text-body-14', captionPx: 14 },
  { value: 'text-h3-bold', valuePx: 24, caption: 'text-caption-12', captionPx: 12 },
  { value: 'text-h4-bold', valuePx: 20, caption: 'text-caption-12', captionPx: 12 },
  { value: 'text-body-18-bold', valuePx: 18, caption: 'text-caption-10', captionPx: 10 },
  { value: 'text-body-16-bold', valuePx: 16, caption: 'text-caption-10', captionPx: 10 },
  { value: 'text-body-14-bold', valuePx: 14, caption: 'text-caption-10', captionPx: 10 },
];

const MONO_ADVANCE_EM = 0.6;
const LINE_GAP = 4;
const WIDTH_SAFE = 0.82;
const HEIGHT_SAFE = 0.9;

/** Bậc token chữ lớn nhất còn lọt lỗ donut (`holeDiameter` = 2 × innerRadius, px); trả token, không px. */
export function centerLabelFont(
  holeDiameter: number,
  options: CenterLabelFitOptions = {},
): CenterLabelFont {
  const { uiScale = 1, valueChars = 4, captionLines = 0 } = options;
  const floor = CENTER_LABEL_STEPS[CENTER_LABEL_STEPS.length - 1];
  if (!(holeDiameter > 0)) return floor;

  const widthBudget = holeDiameter * WIDTH_SAFE;
  const heightBudget = holeDiameter * HEIGHT_SAFE;

  const fitted = CENTER_LABEL_STEPS.find((step) => {
    const valueWidth = step.valuePx * uiScale * MONO_ADVANCE_EM * valueChars;
    const stackHeight =
      step.valuePx * uiScale + captionLines * (step.captionPx * uiScale + LINE_GAP);
    return valueWidth <= widthBudget && stackHeight <= heightBudget;
  });

  return fitted ?? floor;
}

/** `maxWidth` (px) cho dòng phụ ở tâm để `truncate` cắt đúng chỗ; `offsetFromCenter` = cách tâm (px). */
export function centerLabelMaxWidth(holeDiameter: number, offsetFromCenter = 0): number {
  const radius = holeDiameter / 2;
  if (!(radius > 0)) return 0;
  const half = Math.max(0, radius ** 2 - offsetFromCenter ** 2);
  return Math.round(2 * Math.sqrt(half) * WIDTH_SAFE);
}

const TEXT_ADVANCE_EM = 0.7;

/** `false` khi dòng phụ không vừa `maxWidth` — bỏ hẳn dòng đó thay vì để `truncate` cắt còn `"11 đ…"`. */
export function centerCaptionFits(
  maxWidth: number,
  captionPx: number,
  chars: number,
  uiScale = 1,
): boolean {
  if (chars <= 0) return false;
  return captionPx * uiScale * TEXT_ADVANCE_EM * chars <= maxWidth;
}

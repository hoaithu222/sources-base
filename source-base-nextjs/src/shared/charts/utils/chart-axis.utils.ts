const NICE_STEPS = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;

/** Số vạch mặc định (không kể vạch 0). */
export const CHART_AXIS_TICK_COUNT = 4;

const AXIS_HEADROOM = 1.05;

/** Ước bề rộng 1 ký tự nhãn trục = `0.6 × cỡ chữ` (chữ số sans + `tabular-nums`); cố ý ước rộng để thà thưa còn hơn đè nhau. */
const TICK_CHAR_EM = 0.6;
/** Khoảng thở giữa hai nhãn trục kề nhau (px). */
const TICK_GAP = 8;
/** Góc nghiêng khi nhãn dài mà còn đủ chỗ nếu nghiêng (độ, âm = ngả lên phải). */
const TICK_ROTATION = -35;

function roundTo(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/** Trần trục tròn ≥ `maxValue`, chia hết cho `tickCount` vạch; dữ liệu rỗng/không hợp lệ → `tickCount`. */
export function niceAxisMax(maxValue: number, tickCount = CHART_AXIS_TICK_COUNT): number {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return tickCount;

  const rawStep = (maxValue * AXIS_HEADROOM) / tickCount;
  const pow = 10 ** Math.floor(Math.log10(rawStep));
  const norm = rawStep / pow;
  const step = (NICE_STEPS.find((s) => norm <= s + 1e-9) ?? 10) * pow;

  return roundTo(step * tickCount);
}

/** Bộ vạch đều từ 0 đến `max` — `<YAxis domain={[0, max]} ticks={axisTicks(max)} />`. */
export function axisTicks(max: number, tickCount = CHART_AXIS_TICK_COUNT): number[] {
  return Array.from({ length: tickCount + 1 }, (_, i) => roundTo((max * i) / tickCount));
}

export interface XAxisLayout {
  /** `interval` của `<XAxis>`: số nhãn bỏ qua giữa hai nhãn hiện (`0` = hiện hết). */
  interval: number;
  /** `angle` của `<XAxis>` (0 hoặc nghiêng). */
  angle: number;
  /** `textAnchor` đi cùng `angle`: nhãn nghiêng phải neo ĐUÔI vào vạch. */
  textAnchor: 'middle' | 'end';
  /** `height` của dải trục X — nhãn nghiêng cần cao hơn mặc định 30. */
  height: number;
}

interface XAxisLayoutInput {
  /** Số điểm / nhóm trên trục X. */
  count: number;
  /** Bề rộng vùng vẽ trừ trục Y (px) — `m.plotWidth`. */
  plotWidth: number;
  /** Cỡ chữ nhãn trục (px) — `m.scale.axis`. */
  fontSize: number;
  /** Số ký tự của nhãn DÀI NHẤT (`'T10/26'` = 6). */
  labelChars: number;
}

const X_AXIS_BAND = 30;

/**
 * Mật độ nhãn trục X theo bề rộng THỰC: đủ chỗ → hiện hết; nhãn dài mà nghiêng thì vừa → nghiêng `-35°`; vẫn không
 * vừa → THƯA ĐỀU (`interval`), luôn chừa chỗ cho ≥ 2 nhãn. Dùng thay `interval={4}` số cứng — 8 tháng ở 360px và ở
 * 1366px cần hai mật độ khác nhau. Chưa đo được (`plotWidth ≤ 0`) → hiện hết, đợi lần đo sau.
 */
export function xAxisLayout({
  count,
  plotWidth,
  fontSize,
  labelChars,
}: XAxisLayoutInput): XAxisLayout {
  const flat: XAxisLayout = { interval: 0, angle: 0, textAnchor: 'middle', height: X_AXIS_BAND };
  if (count <= 1 || plotWidth <= 0) return flat;

  const flatSlot = labelChars * fontSize * TICK_CHAR_EM + TICK_GAP;
  if (count * flatSlot <= plotWidth) return flat;

  const rotatedSlot = fontSize * 1.3 + TICK_GAP / 2;
  if (labelChars >= 5 && count * rotatedSlot <= plotWidth) {
    const rise =
      Math.sin((Math.abs(TICK_ROTATION) * Math.PI) / 180) * labelChars * fontSize * TICK_CHAR_EM;
    return {
      interval: 0,
      angle: TICK_ROTATION,
      textAnchor: 'end',
      height: Math.ceil(rise + fontSize + TICK_GAP),
    };
  }

  const fit = Math.max(2, Math.floor(plotWidth / flatSlot));
  return { ...flat, interval: Math.max(0, Math.ceil(count / fit) - 1) };
}

/** Ước bề rộng 1 ký tự nhãn trục Y = `0.7 × cỡ chữ` — rộng hơn nhãn X vì có `%` / dấu chấm nghìn; cộng lề tick + đệm. */
const Y_TICK_CHAR_EM = 0.7;
const Y_TICK_PADDING = 10;

/**
 * Bề rộng trục Y đủ chỗ cho nhãn dài nhất `labelChars` ký tự (vd `'100%'` = 4): không nhỏ hơn `minWidth`
 * (`m.scale.yAxisWidth`). Bảng mật độ chỉ vừa số ≤ 3 ký tự — nhãn `100%` / `12.500` bị cắt vài px ở mép trái nếu dùng thẳng.
 */
export function yAxisWidthFor(labelChars: number, fontSize: number, minWidth: number): number {
  return Math.max(minWidth, Math.ceil(labelChars * fontSize * Y_TICK_CHAR_EM) + Y_TICK_PADDING);
}

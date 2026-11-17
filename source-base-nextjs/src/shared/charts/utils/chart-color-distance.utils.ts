/**
 * chart-color-distance — đo bảng màu chart bằng máy: ΔE trong OKLab ×100 (mắt thường · mô phỏng mù màu), tỉ lệ
 * tương phản WCAG, L / C của OKLCH. Cùng công thức với `validate_palette.js` của skill dataviz nên kết quả khớp
 * từng chữ số (test `chart-palette-validator` ghim số của validator).
 *
 * Dùng:   deltaE('#0F88A6', '#D66900', 'deutan') · contrastRatio(hex, '#FFFFFF') · worstDeltaE(hexes, 'protan')
 * Lưu ý:  ΔE là khoảng cách Euclid trong OKLab ×100; mô phỏng CVD theo Machado–Oliveira–Fernandes 2009, mức 1.0 —
 *         ngưỡng của quy chuẩn (≥ 8 mù màu · ≥ 15 mắt thường) chỉ có nghĩa với đúng mô hình này. Chỉ nhận hex `#rrggbb`.
 */

export type ColorVision = 'normal' | 'protan' | 'deutan' | 'tritan';

type Rgb = readonly [number, number, number];
type Matrix = readonly [Rgb, Rgb, Rgb];

const CVD_MATRIX: Record<Exclude<ColorVision, 'normal'>, Matrix> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1.255528, -0.076749, -0.178779],
    [-0.078411, 0.930809, 0.147602],
    [0.004733, 0.691367, 0.3039],
  ],
};

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** `'#0F88A6'` → kênh sRGB tuyến tính 0–1. Ném lỗi nếu không phải `#rrggbb` — màu chart luôn là hex đã sinh. */
function toLinear(hex: string): Rgb {
  if (!HEX_PATTERN.test(hex))
    throw new Error(`chart-color-distance: không phải hex #rrggbb: ${hex}`);
  const channel = (offset: number) => {
    const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return [channel(1), channel(3), channel(5)];
}

function simulate(rgb: Rgb, vision: ColorVision): Rgb {
  if (vision === 'normal') return rgb;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const [row0, row1, row2] = CVD_MATRIX[vision];
  const mix = (row: Rgb) => clamp(row[0] * rgb[0] + row[1] * rgb[1] + row[2] * rgb[2]);
  return [mix(row0), mix(row1), mix(row2)];
}

function toOklab([r, g, b]: Rgb): Rgb {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** ΔE (OKLab ×100) giữa hai màu hex dưới một kiểu thị giác; `vision` mặc định = mắt thường. */
export function deltaE(a: string, b: string, vision: ColorVision = 'normal'): number {
  const [l1, a1, b1] = toOklab(simulate(toLinear(a), vision));
  const [l2, a2, b2] = toOklab(simulate(toLinear(b), vision));
  return 100 * Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = toLinear(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Tỉ lệ tương phản WCAG 1–21 giữa hai màu hex (không phân biệt thứ tự). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Độ sáng L (0–1), độ bão hoà C và góc hue (độ) trong OKLCH — dải L / ngưỡng C của validator. */
export function oklchOf(hex: string): { l: number; c: number; h: number } {
  const [l, a, b] = toOklab(toLinear(hex));
  return { l, c: Math.hypot(a, b), h: ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360 };
}

/**
 * ΔE nhỏ nhất trong dãy màu: `'adjacent'` = các cặp kề nhau (cột chồng, đường, donut), `'all'` = mọi cặp (scatter,
 * bubble, bản đồ, small multiples). Dãy < 2 màu → `Infinity`.
 */
export function worstDeltaE(
  hexes: readonly string[],
  vision: ColorVision = 'normal',
  pairs: 'adjacent' | 'all' = 'adjacent',
): number {
  let worst = Infinity;
  hexes.forEach((hex, i) => {
    const partners = pairs === 'all' ? hexes.slice(i + 1) : hexes.slice(i + 1, i + 2);
    partners.forEach((other) => {
      worst = Math.min(worst, deltaE(hex, other, vision));
    });
  });
  return worst;
}

/** ΔE nhỏ nhất giữa hai màu theo MỌI kiểu mù màu đỏ–lục (protan, deutan) — số mà validator gọi là "CVD separation". */
export function worstCvdDeltaE(
  hexes: readonly string[],
  pairs: 'adjacent' | 'all' = 'adjacent',
): number {
  return Math.min(worstDeltaE(hexes, 'protan', pairs), worstDeltaE(hexes, 'deutan', pairs));
}

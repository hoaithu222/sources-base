/**
 * color-mix.utils — hàm `color-mix()` DUY NHẤT của app; mọi helper pha màu khác (`tokenVarAlpha`…) gọi lại nó.
 *
 * Dùng:   colorMix('var(--color-teal-5)', 0.3)                    // nền / quầng sáng (pha trong suốt)
 *         colorMix(tone, 0.55, 'var(--color-border-strong)')       // viền đặc · chữ ăn màu tone: 'var(--color-fg-heading)'
 *         colorMix(a, 0.88, b, 'oklab')                            // bắc cầu 2 hue xa nhau
 * Lưu ý:  ⛔ `alpha` thang 0–1 (KHÔNG 0–100); `color` / `base` là MÀU CSS — tên token đi qua `tokenVar()` trước.
 */

/** Không gian trộn của `color-mix()`; `oklab` cho cầu nối 2 hue xa nhau (`srgb` dễ ra tông xám bùn). */
export type ColorMixSpace = 'srgb' | 'oklab';

/** `color-mix(in <space>, <color> <alpha×100>%, <base>)` — `alpha` kẹp về [0, 1], phần trăm làm tròn nguyên. */
export function colorMix(
  color: string,
  alpha: number,
  base = 'transparent',
  space: ColorMixSpace = 'srgb',
): string {
  const pct = Math.round(Math.max(0, Math.min(1, alpha)) * 100);
  return `color-mix(in ${space}, ${color} ${pct}%, ${base})`;
}

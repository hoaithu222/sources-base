/** px → rem (gốc 16px): `pxToRem(24)` → `1.5`. */
export function pxToRem(px: number): number {
  return px / 16;
}

/** px → chuỗi rem: `pxToRemString(24)` → `'1.5rem'`. */
export function pxToRemString(px: number): string {
  return `${pxToRem(px)}rem`;
}

/** Bậc spacing của Tailwind → px (× 4): `tailwindSpacingToPx(3)` → `12`. */
export function tailwindSpacingToPx(space: number): number {
  return space * 4;
}

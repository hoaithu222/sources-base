/** Giá trị đã tính của CSS variable trên `:root` (vd `'--color-primary-5'`); `''` khi không có `window`. */
export function getCssVariable(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/** Giá trị màu của token, vd `getThemeColor('primary-5')` — cho canvas / chart cần giá trị chứ không phải class. */
export function getThemeColor(tokenName: string): string {
  return getCssVariable(`--color-${tokenName}`);
}

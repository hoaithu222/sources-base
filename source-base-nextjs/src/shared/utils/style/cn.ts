import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import fontTokens from '@/styles/font/font.json';

const FONT_TOKEN_BASES = new Set(Object.keys(fontTokens));
const FONT_WEIGHT_SUFFIXES = new Set(['medium', 'semibold', 'bold']);

function isFontToken(value: string): boolean {
  if (FONT_TOKEN_BASES.has(value)) return true;
  const cut = value.lastIndexOf('-');
  return (
    cut !== -1 &&
    FONT_WEIGHT_SUFFIXES.has(value.slice(cut + 1)) &&
    FONT_TOKEN_BASES.has(value.slice(0, cut))
  );
}

/**
 * `bg-gradient-to-*` (tên cũ của `bg-linear-to-*`) khai vào nhóm `bg-image`: mặc định tailwind-merge 3 coi
 * nó là MÀU nền nên `cn('bg-bg-surface', 'bg-gradient-to-r')` lặng lẽ bỏ mất `bg-bg-surface`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [isFontToken] }],
      'bg-image': [{ 'bg-gradient-to': ['t', 'tr', 'r', 'br', 'b', 'bl', 'l', 'tl'] }],
    },
  },
});

/**
 * Gộp class Tailwind (clsx + tailwind-merge): class sau đè class trước, dùng thay template literal.
 * `cn("px-4 py-2", isActive && "bg-primary-5", className)`. Token chữ (`text-h3`, `text-body-14-medium`…)
 * được nhận là `font-size`, không bị coi là màu chữ.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

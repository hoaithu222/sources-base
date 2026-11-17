/** Trục biến thể của mục "Nguyên tố" (Badge · Avatar · Divider · GemIcon). */

export const BADGE_COLORS = [
  'primary',
  'secondary',
  'accent',
  'info',
  'indigo',
  'success',
  'warning',
  'error',
  'neutral',
] as const;

export const BADGE_VARIANTS = ['tinted', 'solid', 'outline', 'disabled'] as const;
export const BADGE_SIZES = ['xs', 'sm', 'md', 'lg'] as const;
export const AVATAR_SIZES = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
export const DIVIDER_VARIANTS = ['solid', 'dashed', 'dotted'] as const;
export const GEM_COLORS = ['blue', 'green', 'yellow', 'red', 'gray'] as const;
export const GEM_SIZES = ['xs', 'sm', 'md'] as const;

/** Cỡ icon bên trong GemIcon theo từng size — khớp `ICON_PX` nội bộ của GemIcon.tsx. */
export const GEM_ICON_PX: Record<(typeof GEM_SIZES)[number], number> = {
  xs: 16,
  sm: 20,
  md: 24,
};

const AVATAR_PLACEHOLDER_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
  '<rect width="64" height="64" fill="#64748b"/>' +
  '<circle cx="32" cy="25" r="12" fill="#e2e8f0"/>' +
  '<rect x="10" y="44" width="44" height="20" rx="10" fill="#e2e8f0"/>' +
  '</svg>';
/** Avatar mẫu — data URI dựng tay, KHÔNG gọi mạng. */
export const DEMO_AVATAR_SRC = `data:image/svg+xml,${encodeURIComponent(AVATAR_PLACEHOLDER_SVG)}`;

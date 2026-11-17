/**
 * Họ màu / token hiện trên trang Demo — chỉ để TRÌNH BÀY. Nguồn thật là `colors-theme.json`
 * (`src/styles/theme/`) → `npm run generate:colors`.
 */

/**
 * Họ có thang số hiện trên trang Demo. Bậc nào họ không có trong JSON thì để trống ô (xem
 * `ColorTokensSection`). `blue` / `green` / `yellow` / `red` không liệt kê vì trùng 100% giá trị với
 * `info` / `success` / `accent` / `error` (alias trong JSON).
 */
export const DEMO_SCALE_FAMILIES = [
  'primary',
  'secondary',
  'accent',
  'info',
  'success',
  'warning',
  'error',
  'neutral',
  'sky',
  'azure',
  'teal',
  'indigo',
  'purple',
  'fuchsia',
  'pink',
  'orange',
] as const;

/** Bậc hiện cho mỗi họ — mỗi họ chỉ có một phần các bậc này (neutral còn có thêm `-0` và `-10`). */
export const DEMO_SCALE_STEPS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export const DEMO_SURFACE_TOKENS = [
  'bg-page',
  'bg-surface',
  'bg-subtle',
  'bg-pressed',
  'bg-track',
  'bg-popup',
  'bg-dialog',
  'bg-dialog-raised',
  'bg-input',
  'bg-input-hover',
] as const;

export const DEMO_FOREGROUND_TOKENS = [
  'fg-heading',
  'fg-subheading',
  'fg-body',
  'fg-muted',
  'fg-faint',
] as const;

export const DEMO_LINE_TOKENS = [
  'border-default',
  'border-strong',
  'divider-default',
  'divider-strong',
  'ring-focus',
] as const;

export const DEMO_SEMANTIC_TOKENS = [
  'primary-5',
  'link',
  'success',
  'warning',
  'error',
  'info',
] as const;

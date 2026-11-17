import type { ProgressVariant } from '@/shared/ui';

/**
 * task-progress.utils — % hoàn thành của MỘT việc → màu của `<Progress>` / `<ProgressCircle>`: mọi chỗ hiện tiến độ
 * việc đọc CÙNG một thang (100 → xong · ≥ 70 · ≥ 30 · còn lại), không màn nào tự đặt ngưỡng riêng.
 *
 * Dùng:   <Progress variant={taskProgressVariant(pct)} /> · className={taskProgressTextClass(pct)}
 *         · SVG / canvas: `var(--color-${taskProgressColorToken(pct)})`
 * Lưu ý:  ⛔ KHÁC `kpiHealthToken` của `@/shared/charts` (90 / 60 / 30 — sức khoẻ CHỈ TIÊU trên chart): một việc chỉ
 *         "xong" ở 100%. Đừng gộp hai thang (lý do: docs/notes/code/utils.md).
 */

const THRESHOLDS: { min: number; variant: ProgressVariant }[] = [
  { min: 100, variant: 'success' },
  { min: 70, variant: 'primary' },
  { min: 30, variant: 'warning' },
];

/** 100 → `success` · ≥ 70 → `primary` · ≥ 30 → `warning` · còn lại → `error`; ngoài [0, 100] kẹp về biên trước khi so. */
export function taskProgressVariant(percent: number): ProgressVariant {
  const value = Math.max(0, Math.min(100, percent));
  return THRESHOLDS.find((item) => value >= item.min)?.variant ?? 'error';
}

const TASK_PROGRESS_TEXT_CLASS: Record<ProgressVariant, string> = {
  primary: 'text-primary-5',
  success: 'text-success-5',
  warning: 'text-warning-5',
  error: 'text-error-5',
  neutral: 'text-fg-subheading',
};

/** Class màu CHỮ của số % — trùng màu thanh tiến độ cùng mức. */
export function taskProgressTextClass(percent: number): string {
  return TASK_PROGRESS_TEXT_CLASS[taskProgressVariant(percent)];
}

const TASK_PROGRESS_COLOR_TOKEN: Record<ProgressVariant, string> = {
  primary: 'primary-5',
  success: 'success-5',
  warning: 'warning-5',
  error: 'error-5',
  neutral: 'fg-muted',
};

/** Token màu (không phải class) theo mức hoàn thành — cho vòng donut, cung SVG, gradient… cần `var(--color-…)`. */
export function taskProgressColorToken(percent: number): string {
  return TASK_PROGRESS_COLOR_TOKEN[taskProgressVariant(percent)];
}

import type {
  CalloutIntent,
  CalloutVariant,
  EmptyStateIconColor,
  EmptyStateSize,
  IllustrationAccentColor,
  ProgressCircleSize,
  ProgressCircleVariant,
  ProgressSize,
  ProgressVariant,
  SkeletonRounded,
  SkeletonVariant,
  SpinnerColor,
  SpinnerSize,
  ToastType,
} from '@/shared/ui';

/**
 * Trục biến thể của mục "Phản hồi" và "Chỉ báo tiến độ"
 * (Toast · Callout · Progress · Spinner · Skeleton · EmptyState).
 */

export const TOAST_TYPES: readonly ToastType[] = ['success', 'error', 'warning', 'info'];
export const TOAST_MESSAGE: Record<ToastType, string> = {
  success: 'Đã lưu thay đổi',
  error: 'Không lưu được — thử lại sau',
  warning: 'Còn 2 ô chưa điền',
  info: 'Bản nháp tự lưu lúc 09:41',
};

export const CALLOUT_INTENTS: readonly CalloutIntent[] = [
  'info',
  'success',
  'warning',
  'error',
  'neutral',
];

export const CALLOUT_VARIANTS: readonly CalloutVariant[] = ['tinted', 'ghost'];

export const PROGRESS_VARIANTS: readonly ProgressVariant[] = [
  'primary',
  'success',
  'warning',
  'error',
  'neutral',
];
export const PROGRESS_SIZES: readonly ProgressSize[] = ['xs', 'sm', 'md', 'lg'];

export const PROGRESS_CIRCLE_VARIANTS: readonly ProgressCircleVariant[] = [
  'primary',
  'success',
  'warning',
  'error',
  'info',
  'neutral',
];
export const PROGRESS_CIRCLE_SIZES: readonly ProgressCircleSize[] = ['xs', 'sm', 'md', 'lg'];

export const SPINNER_SIZES: readonly SpinnerSize[] = ['sm', 'md', 'lg'];
export const SPINNER_COLORS: readonly SpinnerColor[] = [
  'primary',
  'brand',
  'info',
  'success',
  'warning',
  'danger',
  'neutral',
  'inherit',
];

export const SKELETON_VARIANTS: readonly SkeletonVariant[] = ['text', 'rectangle', 'circle'];
export const SKELETON_ROUNDED: readonly SkeletonRounded[] = ['none', 'sm', 'md', 'lg', 'full'];

export const EMPTY_STATE_SIZES: readonly EmptyStateSize[] = ['sm', 'md', 'lg'];
export const EMPTY_STATE_ICON_COLORS: readonly EmptyStateIconColor[] = [
  'neutral',
  'primary',
  'sky',
  'yellow',
  'red',
  'green',
];

export const ILLUSTRATION_ACCENTS: readonly IllustrationAccentColor[] = [
  'neutral',
  'primary',
  'sky',
  'green',
  'yellow',
  'red',
];

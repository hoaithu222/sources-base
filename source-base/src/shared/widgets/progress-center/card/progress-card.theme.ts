import type { ProgressCircleVariant, SystemIconName } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import type { ProgressCardStatus } from '../progress-center.types';

/**
 * progress-card.theme.ts — bảng class của `ProgressCard` và chỉ báo trạng thái của nó; cùng ngôn ngữ với
 * Toast của UI kit: vạch trái 3px, nền loang màu trạng thái (đục), quầng màu CHỈ ở theme tối.
 *
 * Dùng:   cn(PROGRESS_CARD_ROOT_CLASSES, PROGRESS_CARD_STATUS_CLASSES[status]) · PROGRESS_CARD_SLOT_CLASSES.title …
 * Sửa:    viền + nền loang + bóng / quầng → _STATUS_CLASSES · vạch trái → _ACCENT_CLASSES
 *         · vạch đáy → _EDGE_CLASSES · icon / đĩa màu / vòng % → PROGRESS_CARD_ICON_*
 * Lưu ý:  mỗi trạng thái tự mang đủ viền · nền · bóng · màu icon — sửa một trạng thái không lan sang
 *         trạng thái khác. `running` dùng token `info`, không `primary` (docs/notes/code/widgets.md).
 */

type ProgressCardSlot =
  | 'accent'
  | 'body'
  | 'head'
  | 'text'
  | 'titleRow'
  | 'title'
  | 'meta'
  | 'subtitle'
  | 'message'
  | 'messageError'
  | 'tools'
  | 'tool'
  | 'details'
  | 'actions'
  | 'edgeTrack'
  | 'edgeFill';

export const PROGRESS_CARD_ROOT_CLASSES = cn(
  'group/toast relative overflow-hidden border backdrop-blur-md',
  'motion-safe:animate-slide-in-bottom',
);

export const PROGRESS_CARD_STATUS_CLASSES = {
  running: cn(
    'border-border-popup dark:border-info/35',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-info)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'shadow-[0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:shadow-[0_0_24px_-8px_color-mix(in_srgb,var(--color-info)_40%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
  ),
  success: cn(
    'border-border-popup dark:border-success/35',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-success)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'shadow-[0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:shadow-[0_0_24px_-8px_color-mix(in_srgb,var(--color-success)_40%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
  ),
  error: cn(
    'border-border-popup dark:border-error/35',
    'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-error)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
    'shadow-[0_12px_32px_-8px_var(--color-shadow-popup)]',
    'dark:shadow-[0_0_24px_-8px_color-mix(in_srgb,var(--color-error)_40%,transparent),0_12px_32px_-8px_var(--color-shadow-popup)]',
  ),
} satisfies Record<ProgressCardStatus, string>;

export const PROGRESS_CARD_ACCENT_CLASSES = {
  running: cn(
    'bg-info',
    'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-info)_60%,transparent)]',
  ),
  success: cn(
    'bg-success',
    'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-success)_60%,transparent)]',
  ),
  error: cn(
    'bg-error',
    'dark:shadow-[0_0_8px_color-mix(in_srgb,var(--color-error)_60%,transparent)]',
  ),
} satisfies Record<ProgressCardStatus, string>;

export const PROGRESS_CARD_EDGE_CLASSES = {
  running: 'bg-info',
  success: 'bg-success',
  error: 'bg-error',
} satisfies Record<ProgressCardStatus, string>;

export const PROGRESS_CARD_SLOT_CLASSES = {
  accent: 'pointer-events-none absolute inset-y-0 left-0 w-[3px]',
  body: 'relative flex flex-col gap-2 p-3',
  head: 'flex items-start gap-3',
  text: 'flex min-w-0 flex-1 flex-col gap-0.5',
  titleRow: 'flex min-w-0 items-baseline gap-2',
  title: 'min-w-0 truncate text-body-14-semibold text-fg-heading',
  meta: 'shrink-0 text-caption-12-medium tabular-nums text-fg-muted',
  subtitle: 'truncate text-caption-12 text-fg-muted',
  message: 'text-caption-12 text-fg-body break-words',
  messageError: 'text-caption-12 text-error break-words',
  tools: 'flex shrink-0 items-center gap-1',
  tool: 'size-7 px-0 py-0 text-fg-muted',
  details: 'border-t border-divider-default pt-2',
  actions: 'flex items-center justify-end gap-2',
  edgeTrack: 'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-bg-track',
  edgeFill: cn(
    'block h-full origin-left',
    'transition-[width] duration-300 ease-out motion-reduce:transition-none',
  ),
} satisfies Record<ProgressCardSlot, string>;

export const PROGRESS_CARD_ICON_NAMES = {
  running: 'loader-outline',
  success: 'circle-check-bold',
  error: 'circle-xmark-bold',
} satisfies Record<ProgressCardStatus, SystemIconName>;

export const PROGRESS_CARD_ICON_BASE_CLASSES =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-full';

export const PROGRESS_CARD_ICON_WRAP_CLASSES = {
  running: 'bg-info/15 text-info',
  success: cn(
    'bg-success/15 text-success',
    'dark:shadow-[0_0_12px_color-mix(in_srgb,var(--color-success)_35%,transparent)]',
  ),
  error: cn(
    'bg-error/15 text-error',
    'dark:shadow-[0_0_12px_color-mix(in_srgb,var(--color-error)_35%,transparent)]',
  ),
} satisfies Record<ProgressCardStatus, string>;

export const PROGRESS_CARD_RING_VARIANTS = {
  running: 'info',
  success: 'success',
  error: 'error',
} satisfies Record<ProgressCardStatus, ProgressCircleVariant>;

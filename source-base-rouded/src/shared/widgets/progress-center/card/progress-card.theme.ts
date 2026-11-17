import type { ProgressCircleVariant, SystemIconName } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import type { ProgressCardStatus } from '../progress-center.types';

/**
 * progress-card.theme.ts — bảng class của `ProgressCard` và chỉ báo trạng thái của nó; cùng ngôn ngữ với
 * Toast của UI kit: vạch trái 3px, nền loang màu trạng thái (đục) — cùng hình ở cả hai theme, không quầng màu.
 *
 * Dùng:   cn(PROGRESS_CARD_ROOT_CLASSES, PROGRESS_CARD_STATUS_CLASSES[status]) · PROGRESS_CARD_SLOT_CLASSES.title …
 * Sửa:    màu theo trạng thái → _STATUS_CLASSES (biến `--pc-tone`) · viền + nền loang + bóng → _ROOT_CLASSES
 *         · vạch đáy → _EDGE_CLASSES · icon / đĩa màu / vòng % → PROGRESS_CARD_ICON_*
 * Lưu ý:  trạng thái chỉ đổi biến tông; khung (viền · nền · bóng) dùng chung một bộ class cho mọi trạng thái.
 *         `running` dùng token `info`, không `primary` (docs/notes/code/widgets.md).
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
  'border-border-popup',
  'bg-[linear-gradient(90deg,color-mix(in_srgb,var(--pc-tone)_14%,var(--color-bg-popup)),var(--color-bg-popup)_65%)]',
  'shadow-[0_12px_32px_-8px_var(--color-shadow-popup)]',
);

/** Tông theo trạng thái = MỘT biến `--pc-tone` trên gốc thẻ — nền loang, vạch trái, vạch đáy đều đọc biến. */
export const PROGRESS_CARD_STATUS_CLASSES = {
  running: '[--pc-tone:var(--color-info)]',
  success: '[--pc-tone:var(--color-success)]',
  error: '[--pc-tone:var(--color-error)]',
} satisfies Record<ProgressCardStatus, string>;

const PROGRESS_CARD_ACCENT = 'bg-(--pc-tone)';

export const PROGRESS_CARD_ACCENT_CLASSES = {
  running: PROGRESS_CARD_ACCENT,
  success: PROGRESS_CARD_ACCENT,
  error: PROGRESS_CARD_ACCENT,
} satisfies Record<ProgressCardStatus, string>;

export const PROGRESS_CARD_EDGE_CLASSES = {
  running: 'bg-(--pc-tone)',
  success: 'bg-(--pc-tone)',
  error: 'bg-(--pc-tone)',
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
  success: 'bg-success/15 text-success',
  error: 'bg-error/15 text-error',
} satisfies Record<ProgressCardStatus, string>;

export const PROGRESS_CARD_RING_VARIANTS = {
  running: 'info',
  success: 'success',
  error: 'error',
} satisfies Record<ProgressCardStatus, ProgressCircleVariant>;

import { cn } from '@/shared/utils/style/cn';
import type { SplitterOrientation } from './splitter.types';

/**
 * splitter.theme — bảng class của Splitter theo từng phần (slot).
 *
 * Dùng:   cn(SPLITTER_SLOT_CLASSES.handle, SPLITTER_ORIENTATION_CLASSES[orientation].handle, SPLITTER_HANDLE_STATE_CLASSES[state])
 * Trục:   orientation horizontal | vertical (root · handle · ghost) · tay nắm idle | dragging
 * Sửa:    tay nắm (hover · kéo · focus; quầng theme tối) → handle / handleGrip · đường xem trước (`deferResize`) → ghost
 *         · pane → paneFirst / paneSecond
 */

type SplitterOrientedSlot = 'root' | 'handle' | 'ghost';
type SplitterHandleState = 'idle' | 'dragging';

export const SPLITTER_SLOT_CLASSES = {
  root: 'relative flex h-full w-full',
  paneFirst: 'min-w-0 min-h-0 overflow-hidden',
  paneSecond: 'min-w-0 min-h-0 overflow-hidden flex-1',
  handle: cn(
    'group/splitter relative z-10 shrink-0 select-none touch-none',
    'transition-[background-color,box-shadow] duration-150 ease-out',
    'hover:bg-primary-5/70 active:bg-primary-5',
    'focus-visible:bg-primary-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
    'dark:hover:bg-primary-4/80 dark:hover:shadow-[0_0_10px_color-mix(in_srgb,var(--color-primary-5)_65%,transparent)]',
    'dark:active:bg-primary-4 dark:active:shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary-5)_80%,transparent)]',
  ),
  handleGrip: cn(
    'pointer-events-none absolute inset-0 flex items-center justify-center text-fg-muted',
    'transition-[color] duration-150 ease-out',
    'group-hover/splitter:text-link group-active/splitter:text-link group-focus-visible/splitter:text-link',
    'dark:group-hover/splitter:text-neutral-0 dark:group-active/splitter:text-neutral-0',
    'dark:group-hover/splitter:drop-shadow-[0_0_4px_var(--color-primary-4)]',
  ),
  ghost: cn(
    'absolute z-20 bg-primary-5 pointer-events-none',
    'dark:bg-primary-4 dark:shadow-[0_0_12px_color-mix(in_srgb,var(--color-primary-5)_80%,transparent)]',
  ),
};

export const SPLITTER_ORIENTATION_CLASSES = {
  horizontal: {
    root: 'flex-row',
    handle: cn(
      'w-1 h-full cursor-col-resize',
      "touch:relative touch:after:absolute touch:after:-inset-x-2.5 touch:after:inset-y-0 touch:after:content-['']",
    ),
    ghost: 'top-0 bottom-0 w-0.5 -translate-x-1/2',
  },
  vertical: {
    root: 'flex-col',
    handle: cn(
      'h-1 w-full cursor-row-resize',
      "touch:relative touch:after:absolute touch:after:-inset-y-2.5 touch:after:inset-x-0 touch:after:content-['']",
    ),
    ghost: 'left-0 right-0 h-0.5 -translate-y-1/2',
  },
} satisfies Record<SplitterOrientation, Record<SplitterOrientedSlot, string>>;

/** Theme tối: lúc kéo tay nắm sáng hẳn + quầng (như rê nhưng giữ suốt lúc kéo). */
export const SPLITTER_HANDLE_STATE_CLASSES = {
  idle: 'bg-divider-default dark:bg-divider-strong',
  dragging: cn(
    'bg-primary-5',
    'dark:bg-primary-4 dark:shadow-[0_0_14px_color-mix(in_srgb,var(--color-primary-5)_80%,transparent)]',
  ),
} satisfies Record<SplitterHandleState, string>;

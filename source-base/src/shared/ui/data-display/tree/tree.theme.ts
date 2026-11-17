import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type { TreeIconTone, TreeLabelState, TreeRowState } from './tree.types';

/**
 * tree.theme — bảng class của Tree (khung · dòng · chevron · icon · nhãn · chữ khớp tìm kiếm · trạng thái).
 *
 * Sửa:    nền / vạch trái / màu chữ của dòng → TREE_ROW_*_CLASSES · nét nhãn → TREE_LABEL_STATE_CLASSES
 *         · màu icon → TREE_ICON_TONE_CLASSES · chữ khớp tìm kiếm → TREE_MATCH_CLASSES
 *         · đường dẫn thụt lề → treeIndentGuideStyle (tree.utils.ts)
 * Lưu ý:  ⛔ dòng giữ `h-full`, KHÔNG thêm `py-*` / `h-*`: chiều cao do `rowHeight` của arborist cấp.
 *         Vòng focus bám `:focus-visible` của `[role=treeitem]` — cha TRỰC TIẾP của dòng.
 *         HUD tối: dốc `HUD_ROW_HIGHLIGHT` vẽ ở `::after` (`-z-10` trong `isolate`) vì nền dòng con đã là vạch dẫn inline.
 */

export const TREE_CONTAINER_CLASSES = cn(
  'text-body-14 text-fg-body',
  'dark:[--tree-guide:color-mix(in_srgb,var(--color-primary-5)_30%,var(--color-divider-default))]',
  '[&_*]:outline-none',
  'overflow-hidden',
);

export const TREE_ROW_BASE_CLASSES = cn(
  'group relative isolate flex h-full w-full cursor-pointer select-none items-center gap-1 pr-2 text-fg-body',
  'transition-[background-color,color] duration-150 ease-out',
  'hover:bg-bg-nav-hover hover:text-fg-heading',
  '[:focus-visible>&]:ring-2 [:focus-visible>&]:ring-inset [:focus-visible>&]:ring-ring-focus',
  "dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:-z-10 dark:after:content-['']",
  'dark:after:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-5)_20%,transparent),color-mix(in_srgb,var(--color-primary-5)_4%,transparent)_85%)]',
  'dark:after:opacity-0 dark:after:transition-opacity dark:after:duration-150 dark:hover:after:opacity-50',
);

export const TREE_ROW_STATE_CLASSES = {
  selected: cn(
    'bg-bg-nav-active text-fg-heading hover:bg-bg-nav-active',
    'shadow-[inset_2px_0_0_var(--color-primary-5)]',
    'dark:after:opacity-100 dark:hover:after:opacity-100',
    'dark:shadow-[inset_2px_0_0_var(--color-primary-4),inset_14px_0_12px_-12px_color-mix(in_srgb,var(--color-primary-4)_60%,transparent)]',
  ),
  disabled: cn(
    'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-fg-body',
    'dark:hover:after:opacity-0',
  ),
} satisfies Record<TreeRowState, string>;

export const TREE_CHEVRON_CLASSES = cn(
  'inline-flex size-4 shrink-0 items-center justify-center text-fg-muted',
  'transition-transform duration-150 ease-out motion-reduce:transition-none',
  'hover:text-fg-heading',
);

export const TREE_CHEVRON_PLACEHOLDER_CLASSES = 'inline-flex size-4 shrink-0';

export const TREE_FOLDER_ICON_CLASSES =
  'mr-1 inline-flex size-4 shrink-0 items-center justify-center';

export const TREE_ICON_CLASSES = cn(
  'mr-1 inline-flex size-4 shrink-0 items-center justify-center',
  'transition-colors duration-150 ease-out',
);

export const TREE_ICON_TONE_CLASSES = {
  leaf: 'text-fg-muted',
  branch: 'text-action-accent',
  selected:
    'text-action-base dark:drop-shadow-[0_0_4px_color-mix(in_srgb,var(--color-primary-4)_70%,transparent)]',
} satisfies Record<TreeIconTone, string>;

export const TREE_LABEL_CLASSES = cn(TEXT_ELLIPSIS_CLASSES, 'flex-1');

export const TREE_LABEL_STATE_CLASSES = {
  idle: 'text-body-13-medium',
  selected: 'text-body-13-semibold',
} satisfies Record<TreeLabelState, string>;

export const TREE_MATCH_CLASSES = 'bg-accent-5/25 text-fg-heading';

export const TREE_TRAILING_CLASSES =
  'ml-auto shrink-0 text-caption-12-medium tabular-nums text-fg-muted';

export const TREE_STATE_CLASSES =
  'flex h-full w-full flex-col items-center justify-center gap-2 px-4';

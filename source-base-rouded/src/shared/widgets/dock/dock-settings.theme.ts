import { cn } from '@/shared/utils/style/cn';

import type { DockPosition } from './dock.types';

/**
 * dock-settings.theme.ts — bảng class của nút bánh răng + panel cấu hình Dock (`dock-settings-*.tsx`, `dock-option-tile.tsx`).
 *
 * Dùng:   cn(DOCK_SETTINGS_SLOT_CLASSES.option, selected && DOCK_SETTINGS_SELECTED_CLASSES.option)
 *         · ô chọn vị trí: cn(DOCK_POSITION_PICKER_CLASSES.tile, selected && DOCK_POSITION_PICKER_CLASSES.tileSelected)
 * Lưu ý:  ⛔ Class là chuỗi LITERAL. Hàng đang chọn nhuộm `bg-nav-active` + chữ `link` (L1 — visual-hierarchy.md §4).
 */

type DockSettingsSlot =
  | 'trigger'
  | 'panel'
  | 'panelHeader'
  | 'panelHeaderIcon'
  | 'panelTitle'
  | 'sectionLabel'
  | 'optionList'
  | 'option'
  | 'optionIcon'
  | 'optionBody'
  | 'optionState';

type DockSettingsSelectedSlot = 'option' | 'optionIcon' | 'optionState';

type DockPositionPickerSlot =
  'grid' | 'tile' | 'tileSelected' | 'screen' | 'screenSelected' | 'bar' | 'label';

export const DOCK_SETTINGS_SLOT_CLASSES = {
  trigger: cn(
    'group relative flex shrink-0 cursor-pointer items-center justify-center rounded-lg outline-none',
    'transition-[translate,scale,filter] duration-200 ease-out active:brightness-90',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  panel: 'w-72 p-1.5',
  panelHeader: 'flex items-center gap-2 px-1.5 pt-1 pb-2',
  panelHeaderIcon: cn(
    'flex size-6 shrink-0 items-center justify-center rounded-sm',
    'bg-bg-nav-active text-link [&>svg]:size-3.5!',
  ),
  panelTitle: 'text-caption-12-semibold text-fg-on-chrome',
  sectionLabel: cn(
    'block px-2 pt-2 pb-1',
    'text-caption-10-semibold uppercase tracking-[0.12em] text-fg-on-chrome-muted',
  ),
  optionList: 'flex flex-col gap-0.5',
  option: cn(
    'group/option flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left outline-none',
    'transition-colors duration-150 ease-out',
    'hover:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  optionIcon: cn(
    'flex size-7 shrink-0 items-center justify-center rounded-sm',
    'bg-bg-nav-hover text-fg-on-chrome-muted transition-colors duration-150',
    '[&>svg]:size-3.5!',
  ),
  optionBody: 'flex min-w-0 flex-1 flex-col',
  optionState: cn(
    'flex size-4 shrink-0 items-center justify-center rounded-full border',
    'border-fg-on-chrome-muted/50 transition-colors duration-150',
    '[&>svg]:size-2.5!',
  ),
} satisfies Record<DockSettingsSlot, string>;

/** Hàng đang được chọn: nhuộm cả hàng, ô icon và chấm tròn. */
export const DOCK_SETTINGS_SELECTED_CLASSES = {
  option: 'bg-bg-nav-active hover:bg-bg-nav-active',
  optionIcon: 'bg-bg-nav-active text-link',
  optionState: 'border-primary-6 bg-primary-6 text-neutral-0',
} satisfies Record<DockSettingsSelectedSlot, string>;

/** Công tắc đang bật: chỉ nhuộm ô icon, không nhuộm nền hàng. */
export const DOCK_SETTINGS_ACCENT_ICON_CLASSES = 'bg-bg-nav-active text-link';

/** Hàng còn thấy nhưng không bấm được. */
export const DOCK_SETTINGS_LOCKED_CLASSES = 'cursor-not-allowed opacity-50 hover:bg-transparent';

/** Nút bánh răng khi panel đang mở: vòng ngọc quanh ô (cùng ngôn ngữ L1 với hàng đang chọn). */
export const DOCK_SETTINGS_TRIGGER_OPEN_CLASSES = 'shadow-[0_0_0_2px_var(--color-primary-5)]';

/** Ba ô chọn cạnh neo — mỗi ô là một "màn hình" thu nhỏ có vạch Dock ở đúng cạnh (như System Settings của macOS). */
export const DOCK_POSITION_PICKER_CLASSES = {
  grid: 'grid grid-cols-3 gap-1.5 px-1.5 pb-1',
  tile: cn(
    'group/pos flex cursor-pointer flex-col items-center gap-1 rounded-md p-1.5 outline-none',
    'transition-colors duration-150 hover:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  tileSelected: 'bg-bg-nav-active hover:bg-bg-nav-active',
  screen: cn(
    'relative h-10 w-full rounded-sm border border-border-strong',
    'bg-linear-to-b from-bg-subtle to-bg-pressed',
  ),
  screenSelected: 'border-primary-6 dark:border-primary-4',
  bar: 'absolute rounded-full bg-fg-muted transition-colors duration-150',
  label: 'text-caption-12-medium text-fg-on-chrome-muted',
} satisfies Record<DockPositionPickerSlot, string>;

/** Vạch Dock trong "màn hình" thu nhỏ — vị trí theo cạnh; ô đang chọn tô ngọc. */
export const DOCK_POSITION_BAR_CLASSES = {
  bottom: 'bottom-1 left-1/2 h-1 w-7 -translate-x-1/2',
  left: 'left-1 top-1/2 h-6 w-1 -translate-y-1/2',
  right: 'right-1 top-1/2 h-6 w-1 -translate-y-1/2',
} satisfies Record<DockPosition, string>;

import { HUD_ACTIVE_FILL, HUD_LIT_FILL, HUD_TOP_RAIL_AFTER } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

/**
 * tab-bar.theme.ts — bảng class của thanh tab đáy điện thoại và sheet "Thêm".
 *
 * Dùng:   cn(TAB_BAR_SLOT_CLASSES.cell, active && TAB_BAR_ACTIVE_CLASSES.cell)
 *         sheet: TAB_BAR_SHEET_CLASSES · ô lưới: TAB_BAR_TILE_SPAN_CLASSES (qua `tileSpanClass`)
 * Sửa:    chiều cao thanh → `tab-bar.css` (MỘT chỗ) · màu / cỡ ô → TAB_BAR_SLOT_CLASSES
 *         · trạng thái đang mở → TAB_BAR_ACTIVE_CLASSES
 * Lưu ý:  ⛔ Class là chuỗi LITERAL. Mốc `[@media(max-height:540px)]` (xoay ngang thấp) KHỚP `tab-bar.css`
 *         và biến thể `phone:`. Ô cao ≥ 48px ở chế độ dọc; nhãn 1 dòng, KHÔNG `truncate` (gọt dấu tiếng Việt).
 *         Sáng = nền surface + một vạch bóng; trang trí HUD (viền teal, quầng sáng) CHỈ ở `dark:`.
 */

type TabBarSlot = 'root' | 'list' | 'cell' | 'glyph' | 'label' | 'indicator' | 'moreMark';

type TabBarActiveSlot = 'cell' | 'label' | 'indicator';

type TabBarSheetSlot = 'grid' | 'tile' | 'tileIcon' | 'tileLabel' | 'tileMark';

type TabBarSheetActiveSlot = 'tile' | 'tileIcon';

export const TAB_BAR_SLOT_CLASSES = {
  root: cn(
    'relative z-30 shrink-0 select-none',
    'border-t border-border-default bg-bg-surface shadow-[0_-1px_4px_var(--color-shadow-popup)]',
    'dark:border-hud-5/30 dark:bg-linear-to-b dark:from-bg-header-from dark:to-bg-header-to',
    HUD_TOP_RAIL_AFTER,
    'dark:shadow-[0_-4px_16px_var(--color-shadow-popup)]',
    'pr-[var(--safe-r,0px)] pb-[var(--safe-b,0px)] pl-[var(--safe-l,0px)]',
  ),
  list: 'flex h-[var(--tab-bar-h)] items-stretch',
  cell: cn(
    'group relative flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 px-0.5',
    'touch-manipulation text-fg-on-nav-muted outline-none [-webkit-tap-highlight-color:transparent]',
    'transition-colors duration-150',
    'active:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
    '[@media(max-height:540px)]:flex-row [@media(max-height:540px)]:gap-1.5',
  ),
  glyph: cn(
    'relative flex shrink-0 items-center justify-center',
    'transition-transform duration-150 group-active:scale-90 motion-reduce:transition-none',
    '[&_svg]:size-6! [@media(max-height:540px)]:[&_svg]:size-5!',
  ),
  label: cn(
    'max-w-full overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap leading-4',
    'text-caption-12-medium max-[359px]:text-caption-10-medium',
  ),
  indicator: cn(
    'pointer-events-none absolute inset-x-3 top-0 h-[3px] bg-primary-6 opacity-0 dark:bg-primary-5',
    'transition-opacity duration-200 dark:shadow-[0_0_10px_var(--color-primary-5)]',
    '[@media(max-height:540px)]:h-0.5',
  ),
  moreMark: 'pointer-events-none absolute top-1 right-1 text-fg-on-nav-subtle [&_svg]:size-3!',
} satisfies Record<TabBarSlot, string>;

export const TAB_BAR_ACTIVE_CLASSES = {
  cell: cn(
    'bg-bg-nav-active text-link dark:text-primary-3',
    'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,color-mix(in_srgb,var(--color-primary-5)_72%,var(--color-teal-5))_32%,transparent),transparent_90%)]',
    'dark:[&_svg]:drop-shadow-[0_0_6px_var(--color-primary-4)]',
  ),
  label: 'text-caption-12-semibold max-[359px]:text-caption-10-semibold text-fg-on-chrome',
  indicator: 'opacity-100',
} satisfies Record<TabBarActiveSlot, string>;

export const TAB_BAR_SHEET_CLASSES = {
  grid: 'grid grid-cols-12 gap-2',
  tile: cn(
    'group relative flex min-h-20 min-w-0 flex-col items-center justify-center gap-1.5 px-1.5 py-2.5',
    'border border-border-default bg-bg-surface text-fg-body outline-none',
    'dark:border-hud-5/25',
    HUD_LIT_FILL,
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
    'transition-colors duration-150',
    'active:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
    '[@media(max-height:540px)]:min-h-16 [@media(max-height:540px)]:gap-1 [@media(max-height:540px)]:py-1.5',
  ),
  tileIcon: cn(
    'flex size-10 shrink-0 items-center justify-center border border-hud-6/30 bg-bg-nav-hover text-link',
    'dark:border-hud-5/40 dark:text-primary-3 [&_svg]:size-5!',
    'dark:shadow-[inset_0_0_10px_color-mix(in_srgb,var(--color-primary-5)_25%,transparent)]',
    '[@media(max-height:540px)]:size-8',
  ),
  tileLabel: 'line-clamp-2 min-w-0 text-center text-caption-12-medium leading-4',
  tileMark: cn(
    'pointer-events-none absolute inset-x-2 top-0 h-0.5 bg-primary-6 dark:bg-primary-5',
    'dark:shadow-[0_0_8px_var(--color-primary-5)]',
  ),
} satisfies Record<TabBarSheetSlot, string>;

export const TAB_BAR_SHEET_ACTIVE_CLASSES = {
  tile: cn(
    'border-primary-6/50 bg-bg-nav-active text-fg-heading dark:border-primary-4/70',
    HUD_ACTIVE_FILL,
  ),
  tileIcon: 'bg-bg-nav-active',
} satisfies Record<TabBarSheetActiveSlot, string>;

/** Bề rộng ô theo số cột của lưới 12: ô lẻ cuối hàng dãn ra để hàng cuối không hở một bên. */
export const TAB_BAR_TILE_SPAN_CLASSES = {
  portrait: {
    4: 'col-span-4',
    6: 'col-span-6',
    12: 'col-span-12 flex-row justify-center',
  },
  landscape: {
    3: 'landscape:col-span-3',
    4: 'landscape:col-span-4',
    6: 'landscape:col-span-6',
    12: 'landscape:col-span-12 landscape:flex-row landscape:justify-center',
  },
  revert: 'landscape:flex-col landscape:justify-start',
} as const;

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
 *         Cả hai theme CÙNG hình: thanh kính mờ kiểu iOS, mục đang mở chỉ đổi MÀU (icon VCI bản duo + nhãn ngọc), không khối
 *         nền, không vạch; tối chỉ khác bảng màu (token tự lật).
 */

type TabBarSlot = 'root' | 'list' | 'cell' | 'glyph' | 'label' | 'moreMark';

type TabBarActiveSlot = 'cell' | 'label';

type TabBarSheetSlot = 'grid' | 'tile' | 'tileIcon' | 'tileLabel' | 'tileMark';

type TabBarSheetActiveSlot = 'tile' | 'tileIcon';

export const TAB_BAR_SLOT_CLASSES = {
  root: cn(
    'relative z-30 shrink-0 select-none',
    'border-t border-border-default/70 bg-bg-glass shadow-[0_-1px_4px_var(--color-shadow-popup)] backdrop-blur-xl backdrop-saturate-150',
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
  moreMark: 'pointer-events-none absolute top-1 right-1 text-fg-on-nav-subtle [&_svg]:size-3!',
} satisfies Record<TabBarSlot, string>;

export const TAB_BAR_ACTIVE_CLASSES = {
  cell: 'text-link',
  label: 'text-caption-12-semibold max-[359px]:text-caption-10-semibold text-link',
} satisfies Record<TabBarActiveSlot, string>;

export const TAB_BAR_SHEET_CLASSES = {
  grid: 'grid grid-cols-12 gap-2',
  tile: cn(
    'group relative flex min-h-20 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5',
    'border border-border-default bg-bg-surface text-fg-body outline-none',
    'touch-manipulation [-webkit-tap-highlight-color:transparent]',
    'transition-colors duration-150',
    'active:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
    '[@media(max-height:540px)]:min-h-16 [@media(max-height:540px)]:gap-1 [@media(max-height:540px)]:py-1.5',
  ),
  tileIcon: cn(
    'flex size-10 shrink-0 items-center justify-center border border-sky-6/30 bg-bg-nav-hover text-link',
    'dark:border-border-strong [&_svg]:size-5!',
    '[@media(max-height:540px)]:size-8',
  ),
  tileLabel: 'line-clamp-2 min-w-0 text-center text-caption-12-medium leading-4',
  tileMark: 'pointer-events-none absolute inset-x-2 top-0 h-0.5 bg-primary-6',
} satisfies Record<TabBarSheetSlot, string>;

export const TAB_BAR_SHEET_ACTIVE_CLASSES = {
  tile: 'border-primary-6/50 bg-bg-nav-active text-fg-heading',
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

import { cn } from '@/shared/utils/style/cn';

/**
 * work-tabs-panel.theme.ts — bảng "Tất cả thẻ đã mở" bung SANG PHẢI từ nút "+N / ⋯" của thanh dọc: đầu bảng · ô lọc ·
 * nhóm "Gần đây" / "Đã ghim" / "Trước đó" · chân bảng ("Trang chủ" + "Đóng các thẻ khác").
 *
 * Dùng:   className={WORK_TABS_PANEL_CLASSES.surface} của `Popover variant="solid"` · cn(WORK_TABS_PANEL_ROW_CLASSES.row)
 * Lưu ý:  bề mặt trắng ĐỤC `rim-soft` (`Popover solid` + `squircle`; nền 97% của kit vẫn lộ chữ dashboard phía sau nên
 *         ép `bg-surface`) — không kính. Dòng đang trỏ (rê / ↑↓) = nền ĐẶC `primary-6` chữ trắng như menu macOS; dòng của
 *         màn đang mở chỉ đậm chữ + "Đang mở". Dòng bay vào lần lượt (`animate-chip-in` + `animationDelay`). Cỡ bảng theo
 *         chỗ trống Radix đo (`--radix-popover-content-available-*`, đã trừ `collisionPadding`) — không chui dưới Dock đáy,
 *         không tràn màn. Mọi chuyển động tắt khi giảm chuyển động.
 */

type WorkTabsPanelSlot =
  | 'surface'
  | 'panel'
  | 'head'
  | 'headTitle'
  | 'count'
  | 'hint'
  | 'kbd'
  | 'filter'
  | 'scroll'
  | 'section'
  | 'sectionLabel'
  | 'empty'
  | 'footer'
  | 'home';

type WorkTabsPanelRowSlot =
  | 'row'
  | 'link'
  | 'tile'
  | 'text'
  | 'titleLine'
  | 'title'
  | 'titleActive'
  | 'pinMark'
  | 'meta'
  | 'trail'
  | 'time'
  | 'timeActive'
  | 'actions'
  | 'action'
  | 'actionOn';

const ROW_HIGHLIGHT_TEXT =
  'group-hover/row:text-neutral-0 group-has-[[data-row-link]:focus-visible]/row:text-neutral-0';
const ROW_HIGHLIGHT_MUTED =
  'group-hover/row:text-neutral-0/80 group-has-[[data-row-link]:focus-visible]/row:text-neutral-0/80';
const SECTION_LABEL =
  'text-caption-10-semibold uppercase tracking-[0.12em] text-fg-on-chrome-muted';

export const WORK_TABS_PANEL_CLASSES = {
  surface: 'squircle rounded-xl',
  panel: cn(
    'flex w-[min(320px,var(--radix-popover-content-available-width,92vw))] flex-col outline-none',
    'max-h-[min(640px,var(--radix-popover-content-available-height,70dvh))]',
  ),
  head: 'flex shrink-0 items-center justify-between gap-2 px-3 pt-2.5 pb-2',
  headTitle: 'flex items-baseline gap-1.5 text-body-13-semibold text-fg-on-chrome',
  count: 'text-caption-12 text-fg-on-chrome-muted tabular-nums',
  hint: 'flex items-center gap-1',
  kbd: cn(
    'rounded-xs border border-border-default bg-bg-subtle px-1 py-px',
    'text-caption-10-medium whitespace-nowrap text-fg-on-chrome-muted',
  ),
  scroll: 'min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-border-default p-1',
  section: 'flex flex-col gap-px',
  sectionLabel: cn('px-2 pt-2 pb-1', SECTION_LABEL),
  filter: 'shrink-0 px-2 pb-2',
  empty: 'px-3 py-5 text-center text-body-13 text-fg-on-chrome-muted',
  footer: 'flex shrink-0 items-center justify-between gap-2 border-t border-border-default p-1',
  home: cn(
    'flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none',
    'text-caption-12-medium text-fg-on-chrome transition-colors duration-150',
    'hover:bg-bg-nav-hover focus-visible:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-inset',
    'aria-[current=page]:text-link',
  ),
} satisfies Record<WorkTabsPanelSlot, string>;

export const WORK_TABS_PANEL_ROW_CLASSES = {
  row: cn(
    'group/row flex min-w-0 items-center gap-1 rounded-lg py-1 pr-1 pl-2 text-fg-on-chrome',
    'transition-colors duration-150 animate-chip-in motion-reduce:animate-none',
    'hover:bg-primary-6 hover:text-neutral-0',
    'has-[[data-row-link]:focus-visible]:bg-primary-6 has-[[data-row-link]:focus-visible]:text-neutral-0',
  ),
  link: 'flex min-w-0 flex-1 items-center gap-2.5 py-0.5 outline-none',
  tile: 'shrink-0',
  text: 'flex min-w-0 flex-col',
  titleLine: 'flex min-w-0 items-center gap-1',
  title: 'min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap text-body-13-medium',
  titleActive: 'text-body-13-semibold',
  pinMark: cn('size-3! shrink-0 text-fg-on-chrome-muted', ROW_HIGHLIGHT_MUTED),
  meta: cn(
    'min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap text-caption-12 text-fg-on-chrome-muted',
    'transition-colors duration-150',
    ROW_HIGHLIGHT_MUTED,
  ),
  trail: 'grid shrink-0 items-center justify-items-end *:col-start-1 *:row-start-1',
  time: cn(
    'px-1 text-caption-12 whitespace-nowrap text-fg-on-chrome-muted tabular-nums transition-opacity duration-150',
    'group-focus-within/row:opacity-0 group-hover/row:opacity-0 touch:hidden',
    ROW_HIGHLIGHT_MUTED,
  ),
  timeActive: cn('text-caption-12-semibold text-link', ROW_HIGHLIGHT_TEXT),
  actions: cn(
    'flex items-center opacity-0 transition-opacity duration-150',
    'group-focus-within/row:opacity-100 group-hover/row:opacity-100 touch:opacity-100',
  ),
  action: cn(
    'inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none',
    'text-fg-on-chrome-muted transition-[background-color,color] duration-150',
    'hover:bg-neutral-0/20 focus-visible:ring-2 focus-visible:ring-ring-focus',
    ROW_HIGHLIGHT_TEXT,
  ),
  actionOn: 'text-link',
} satisfies Record<WorkTabsPanelRowSlot, string>;

/** Độ trễ giữa hai dòng khi bay vào (ms) — dòng thứ 10 trở đi vào cùng lúc. */
export const WORK_TABS_PANEL_STAGGER_MS = 18;

import { cn } from '@/shared/utils/style/cn';

import { HEADER_ICON_BUTTON_CLASS, HEADER_SIDE_TAB_CLASSES } from '../header.theme';

/**
 * module-nav.theme.ts — bảng class của nút "Tất cả phân hệ" (⊞ + bảng chọn toàn bộ phân hệ / màn hình), vệt phân hệ và dải
 * màn hình trên header.
 *
 * Dùng:   cn(MODULE_NAV_CLASSES.link, active && MODULE_NAV_CLASSES.linkActive) · MODULE_LAUNCHER_CLASSES.tile …
 * Lưu ý:  ⛔ Chữ / nền rê / mục đang mở đọc biến `--hdr-*` của `<header>` (đúng ở cả `brand` lẫn `glass`). Bảng chọn nằm
 *         trong popover (bề mặt sáng) nên dùng token thường `fg-*` / `bg-nav-*`, KHÔNG dùng `--hdr-*`.
 *         ⛔ GỌN: mục trên thanh là CHỮ TRƠN (không rãnh, không viền, không icon); đúng MỘT thứ được nhấn — mục đang mở =
 *         viên `--hdr-pill`. Icon chỉ ở menu / bảng chọn, nơi có chỗ cho nó.
 */

type ModuleSwitcherSlot = 'trigger';

type ModuleNavSlot =
  | 'fit'
  | 'root'
  | 'measure'
  | 'item'
  | 'link'
  | 'linkActive'
  | 'caret'
  | 'menu'
  | 'menuLabel'
  | 'menuLink'
  | 'menuLinkActive';

type ModuleLauncherSlot =
  | 'panel'
  | 'search'
  | 'recent'
  | 'recentLabel'
  | 'recentChip'
  | 'body'
  | 'group'
  | 'groupLabel'
  | 'card'
  | 'cardHead'
  | 'cardHeadActive'
  | 'cardText'
  | 'cardTitle'
  | 'cardSubtitle'
  | 'screens'
  | 'screen'
  | 'screenActive'
  | 'screenGroup'
  | 'empty'
  | 'footer'
  | 'kbd';

/** Nút ⊞ đầu thanh — cùng khung nút icon của thanh; mở thì giữ nền rê. */
export const MODULE_SWITCHER_CLASSES = {
  trigger: cn(
    HEADER_ICON_BUTTON_CLASS,
    'data-[state=open]:bg-[var(--hdr-active)] data-[state=open]:text-[var(--hdr-fg)]',
  ),
} satisfies Record<ModuleSwitcherSlot, string>;

export const MODULE_NAV_CLASSES = {
  /** Khối bọc dải — `useFitCount` đo bề rộng của nó; co được (`min-w-0`) khi thanh chật. */
  fit: 'relative flex min-w-0 items-stretch self-stretch',
  root: 'flex min-w-0 items-end gap-1 self-stretch',
  /** Hàng ẨN dựng đủ mục với class thật để đo bề rộng từng mục (`inert`, không chiếm chỗ). */
  measure:
    'pointer-events-none invisible absolute top-0 left-0 flex items-center gap-1 whitespace-nowrap',
  item: 'relative flex shrink-0 items-end self-stretch',
  /** Cùng kiểu tab hai bên khối tiêu đề (`HEADER_SIDE_TAB_CLASSES`): tab cong, đang mở = tab đặc. */
  link: HEADER_SIDE_TAB_CLASSES.tab,
  linkActive: HEADER_SIDE_TAB_CLASSES.tabActive,
  caret: 'size-3! opacity-70',
  menu: 'flex min-w-56 flex-col gap-0.5 p-1.5',
  menuLabel:
    'px-2.5 pt-1 pb-1.5 text-caption-10-semibold uppercase tracking-[0.12em] text-fg-on-chrome-muted',
  menuLink: cn(
    'flex items-center gap-2 rounded-md px-2.5 py-2 outline-none',
    'text-body-14 text-fg-on-chrome transition-colors duration-150',
    'hover:bg-bg-nav-hover focus-visible:bg-bg-nav-hover',
  ),
  menuLinkActive:
    'bg-primary-6 text-body-14-semibold text-neutral-0 hover:bg-primary-6 focus-visible:bg-primary-6',
} satisfies Record<ModuleNavSlot, string>;

/**
 * Bảng "Tất cả phân hệ" (全部菜单): ô tìm · hàng "Gần đây" · lưới THẺ phân hệ (masonry 2 → 3 cột), mỗi thẻ = đầu thẻ (ô
 * phân hệ + tên, về trang chủ phân hệ) + danh sách MÀN HÌNH có icon — mọi màn của mọi phân hệ cách hai chạm.
 */
export const MODULE_LAUNCHER_CLASSES = {
  panel: 'flex max-h-[min(78dvh,680px)] w-[min(94vw,940px)] flex-col',
  search: 'shrink-0 border-b border-border-default p-2.5',
  recent: 'flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border-default px-3 py-2',
  recentLabel: 'mr-1 text-caption-10-semibold uppercase tracking-[0.12em] text-fg-on-chrome-muted',
  recentChip: cn(
    'rim-soft inline-flex h-8 items-center gap-2 rounded-full border border-border-default bg-bg-surface pl-1 pr-3 outline-none',
    'text-caption-12-medium text-fg-on-chrome transition-[background-color,border-color,transform] duration-150',
    'hover:border-primary-5/60 hover:bg-bg-nav-hover active:scale-[0.97]',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  body: 'min-h-0 flex-1 gap-3 overflow-y-auto p-3 sm:columns-2 lg:columns-3',
  group: 'mb-3 flex break-inside-avoid flex-col gap-2',
  groupLabel: 'px-1 text-caption-10-semibold uppercase tracking-[0.12em] text-fg-on-chrome-muted',
  card: 'rim-soft flex flex-col rounded-xl border border-border-default bg-bg-surface p-1 shadow-(--elev-1)',
  cardHead: cn(
    'flex min-w-0 items-center gap-2.5 rounded-lg p-1.5 outline-none',
    'transition-colors duration-150 hover:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  cardHeadActive: 'bg-bg-nav-active hover:bg-bg-nav-active',
  cardText: 'flex min-w-0 flex-col',
  cardTitle: 'truncate text-body-14-semibold text-fg-on-chrome',
  cardSubtitle: 'truncate text-caption-12 text-fg-on-chrome-muted',
  screens: 'flex flex-col gap-px px-0.5 pt-0.5 pb-0.5',
  screen: cn(
    'flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 outline-none',
    'text-body-13 text-fg-on-chrome transition-colors duration-150 [&>svg]:text-fg-on-chrome-muted',
    'hover:bg-bg-nav-hover focus-visible:bg-bg-nav-hover',
  ),
  screenActive:
    'bg-primary-6 text-body-13-semibold text-neutral-0 [&>svg]:text-neutral-0 hover:bg-primary-6 focus-visible:bg-primary-6',
  screenGroup:
    'px-2 pt-1.5 pb-0.5 text-caption-10-semibold uppercase tracking-[0.1em] text-fg-on-chrome-muted',
  empty: 'px-2 py-6 text-center text-body-13 text-fg-on-chrome-muted',
  footer: cn(
    'flex shrink-0 items-center justify-between gap-2 border-t border-border-default px-3 py-2',
    'text-caption-12 text-fg-on-chrome-muted',
  ),
  kbd: 'rounded-xs border border-border-default bg-bg-subtle px-1.5 py-px font-mono text-caption-10-medium',
} satisfies Record<ModuleLauncherSlot, string>;

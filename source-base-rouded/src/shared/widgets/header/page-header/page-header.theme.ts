import { cn } from '@/shared/utils/style/cn';

import {
  HEADER_FRAME_TRANSITION,
  HEADER_ICON_BUTTON_CLASS,
  HEADER_PHONE_BUTTON_CLASS,
  HEADER_SIDE_TAB_CLASSES,
} from '../header.theme';
import { MODULE_NAV_CLASSES } from '../modules/module-nav.theme';

/**
 * page-header.theme.ts — bảng class của `PageHeader` máy tính: nút quay lại (ô `start`) + TAB của trang (`bar`: chia đôi
 * hai bên khối tiêu đề giữa thanh, từ `xl` 1280px) · dải tab gạch chân dự phòng (`page`: trong luồng trang, dưới `xl`).
 *
 * Dùng:   cn(PAGE_HEADER_TAB_CLASSES[placement].tab, active && PAGE_HEADER_TAB_CLASSES[placement].tabActive)
 * Lưu ý:  ⛔ Tab `bar` dùng CHUNG kiểu `HEADER_SIDE_TAB_CLASSES` với dải màn hình phân hệ (tab cong, đang mở = tab đặc) —
 *         đọc biến `--hdr-*`; dải `page` nằm trên nền trang nên dùng token thường `fg-*` / `primary-*`.
 *         ⛔ Hai bản tab chia nhau đúng MỘT mốc: `bar` có `max-xl:hidden`, `page` có `xl:hidden` — đổi mốc thì đổi CẢ HAI.
 *         Tên KHÔNG `truncate` dấu chữ hoa: dùng `overflow-x-clip text-ellipsis` (gọt chữ HOA tiếng Việt là lỗi thật).
 */

type PageHeaderSlot = 'back';

export type PageHeaderTabsPlacement = 'bar' | 'page';

type PageHeaderTabSlot = 'fit' | 'measure' | 'root' | 'track' | 'tab' | 'tabActive' | 'action';

export const PAGE_HEADER_CLASSES = {
  back: HEADER_ICON_BUTTON_CLASS,
} satisfies Record<PageHeaderSlot, string>;

export const PAGE_HEADER_TAB_CLASSES = {
  bar: {
    /** Khối bọc nhóm tab — `useFitCount` đo chỗ; hàng `measure` ẩn dựng đủ tab để đo. */
    fit: 'relative flex min-w-0 items-stretch self-stretch max-xl:hidden',
    measure:
      'pointer-events-none invisible absolute top-0 left-0 flex items-center gap-1 whitespace-nowrap',
    root: 'flex min-w-0 items-end gap-1 self-stretch max-xl:hidden',
    track: 'contents',
    tab: HEADER_SIDE_TAB_CLASSES.tab,
    tabActive: HEADER_SIDE_TAB_CLASSES.tabActive,
    action: cn(HEADER_ICON_BUTTON_CLASS, 'self-center'),
  },
  page: {
    fit: '',
    measure: '',
    track: 'contents',
    root: cn(
      'flex min-h-10 shrink-0 items-end gap-1 overflow-x-auto border-b border-border-default scrollbar-hidden',
      'phone:hidden xl:hidden',
    ),
    tab: cn(
      'relative inline-flex h-10 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-t-md px-3 outline-none',
      'text-body-14-medium text-fg-muted transition-colors duration-150 ease-out',
      'hover:bg-bg-nav-hover hover:text-fg-heading disabled:cursor-not-allowed disabled:opacity-50',
      'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
    ),
    tabActive: cn(
      'text-body-14-semibold text-link hover:text-link',
      "after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary-6 after:content-['']",
      'dark:after:bg-primary-4',
    ),
    action: cn(
      'ml-auto inline-flex size-8 shrink-0 cursor-pointer items-center justify-center self-center rounded-md outline-none',
      'text-fg-muted transition-colors duration-150 hover:bg-bg-nav-hover hover:text-fg-heading [&>svg]:size-4!',
      'focus-visible:ring-2 focus-visible:ring-ring-focus',
    ),
  },
} satisfies Record<PageHeaderTabsPlacement, Record<PageHeaderTabSlot, string>>;

/** Nút hành động của trang (`PageHeaderActions`): icon tròn theo `--hdr-*` · `primary` = viên đặc `--hdr-pill` có chữ · điện thoại. */
export const PAGE_HEADER_ACTION_CLASSES = {
  icon: HEADER_ICON_BUTTON_CLASS,
  phone: HEADER_PHONE_BUTTON_CLASS,
  primary: cn(
    'inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 outline-none wide:h-9 wide:px-4',
    'text-body-13-semibold wide:text-body-14-semibold bg-[var(--hdr-pill)] text-[var(--hdr-pill-fg)]',
    HEADER_FRAME_TRANSITION,
    'hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50',
    'focus-visible:ring-2 focus-visible:ring-[var(--hdr-ring)]',
  ),
} satisfies Record<'icon' | 'phone' | 'primary', string>;

/**
 * BỘ LỌC của trang (`PageHeader filters`). Máy tính: CỘT DỌC nổi sát mép PHẢI dưới header (cùng ngôn ngữ thanh lịch sử thẻ
 * bên trái — kính, icon 24px, đè lên nội dung, không chiếm bề ngang); mỗi bộ lọc một icon, chấm = đang khác mặc định, bấm
 * mở bảng nổi sang trái. Điện thoại: MỘT nút phễu trên top bar (`trigger` + `badge`) mở bảng xếp dọc mọi bộ lọc.
 */
export const PAGE_HEADER_FILTER_CLASSES = {
  rail: cn(
    'fixed top-[3.875rem] right-[max(0.375rem,var(--safe-r,0px))] z-30 flex w-8 flex-col items-center gap-1 p-1 wide:top-[4.375rem]',
    'rim-glass glass-island glass-island-sm squircle rounded-xl bg-bg-glass backdrop-blur-xl backdrop-saturate-150',
  ),
  railHead: 'flex size-6 items-center justify-center text-fg-faint',
  railDivider: 'h-px w-4 shrink-0 bg-divider-strong',
  item: cn(
    'relative inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none',
    'text-fg-muted transition-colors duration-150 ease-out',
    'hover:bg-bg-nav-hover hover:text-fg-heading',
    'data-[state=open]:bg-primary-6 data-[state=open]:text-neutral-0',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  dot: 'pointer-events-none absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary-6 ring-2 ring-bg-surface',
  panel: 'w-72 max-w-[calc(100vw-4rem)]',
  body: 'flex flex-col gap-2 p-1 [&>*:not(p)]:w-full',
  title: 'px-0.5 text-caption-12-semibold text-fg-muted',
  /** Danh sách chọn dọc (`options`): dòng như menu của thanh, dòng đang chọn = nền đặc `primary-6` chữ trắng (§7). */
  options: 'flex flex-col gap-0.5',
  option: cn(MODULE_NAV_CLASSES.menuLink, 'w-full cursor-pointer text-left'),
  optionActive: MODULE_NAV_CLASSES.menuLinkActive,
  optionText: 'flex min-w-0 flex-1 flex-col',
  optionNote: 'text-caption-12 text-fg-muted',
  optionNoteActive: 'text-neutral-0/80',
  optionMeta: 'shrink-0 text-caption-12 tabular-nums text-fg-muted',
  trigger: cn(HEADER_ICON_BUTTON_CLASS, 'data-[state=open]:bg-[var(--hdr-active)]'),
  badge: cn(
    'absolute -top-0.5 -right-0.5 inline-grid h-4 min-w-4 place-items-center rounded-full px-1',
    'bg-[var(--hdr-pill)] text-caption-10-bold tabular-nums text-[var(--hdr-pill-fg)]',
  ),
} satisfies Record<string, string>;

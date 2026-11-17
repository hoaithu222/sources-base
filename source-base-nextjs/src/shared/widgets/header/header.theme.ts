import { SHELL_GUTTER_X } from '@/shared/constants/layout.constants';
import { cn } from '@/shared/utils/style/cn';

import type { HeaderAppearance } from './chrome/header-appearance.store';

/**
 * header.theme.ts — vùng header + THANH NỔI (island) theo kiểu (`brand` gradient VCI · `glass` kính mờ), các ô, nút toàn cục.
 *
 * Dùng:   cn(HEADER_SLOT_CLASSES.bar, HEADER_APPEARANCE_CLASSES[appearance]) · nút icon: HEADER_ICON_BUTTON_CLASS
 *         · ô tìm kiếm ⌘K: HEADER_SEARCH_FIELD_CLASS · control cao HEADER_CONTROL_HEIGHT (32 → `wide:` 36px)
 * Cơ chế: mỗi kiểu chỉ khai BIẾN `--hdr-*` (chữ, chữ mờ, nền rê, nền chọn, viên đang mở, ô nhập, vạch ngăn, vòng focus);
 *         mọi phần con đọc biến → thêm kiểu mới = thêm MỘT dòng ở `HEADER_APPEARANCE_CLASSES`.
 * Lưu ý:  ⛔ Hai theme CÙNG hình: thanh NỔI bo `2xl` cách mép trên 8px (đường cong macOS), mọi control dạng VIÊN
 *         (`rounded-full`), mục đang mở = viên `--hdr-pill` nổi lên. Tối chỉ khác BẢNG MÀU — các biến `--hdr-*` đọc token
 *         tự lật (`fg-on-chrome`, `bg-glass`, `bg-nav-*`, `bg-brand-*`) nên không có lớp `dark:` hình học.
 *         ⛔ `tv:[--ui-scale:1]` ở `root`. Màu chỉ qua token (`color-system.md`). Luật: light-theme.md §6.1.
 */

type HeaderSlot =
  | 'root'
  | 'bar'
  | 'aurora'
  | 'left'
  | 'right'
  | 'side'
  | 'sideLeft'
  | 'sideRight'
  | 'sideTarget'
  | 'divider'
  | 'pageSlot';

/** Hai bên khối tiêu đề giữa thanh. */
export type HeaderSide = 'left' | 'right';

/** Ô hai bên khối tiêu đề — dải co giãn (`useFitCount`) đo chỗ trống còn dư trong ô bên mình. */
export const HEADER_SIDE_SELECTOR = {
  left: '[data-header-side="left"]',
  right: '[data-header-side="right"]',
} satisfies Record<HeaderSide, string>;

/** Cao chung của logo · bộ chọn phân hệ · nút icon · khối người dùng (32 → `wide:` 36px). */
export const HEADER_CONTROL_HEIGHT = 'h-8 wide:h-9';

/** Chuyển động chung của control trên thanh. */
export const HEADER_FRAME_TRANSITION =
  'transition-[color,border-color,background-color,box-shadow,transform] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]';

/**
 * Biến màu theo kiểu. `brand`: gradient ngọc BIDV `bg-brand-from → via → to` (sáng trái → sâu phải như app SmartBanking),
 * chữ trắng, viên đang mở TRẮNG chữ ngọc sâu. `glass`: kính trắng mờ, chữ mực, viên đang mở NGỌC đặc chữ trắng.
 */
export const HEADER_APPEARANCE_CLASSES = {
  brand: cn(
    'bg-linear-to-r from-bg-brand-from via-bg-brand-via to-bg-brand-to rim-tile',
    'shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_16%,transparent),0_10px_28px_-14px_color-mix(in_srgb,var(--color-primary-8)_70%,transparent)]',
    '[--hdr-fg:var(--color-neutral-0)]',
    '[--hdr-fg-muted:color-mix(in_srgb,var(--color-neutral-0)_80%,transparent)]',
    '[--hdr-hover:color-mix(in_srgb,var(--color-neutral-0)_13%,transparent)]',
    '[--hdr-active:color-mix(in_srgb,var(--color-neutral-0)_20%,transparent)]',
    '[--hdr-bar:var(--color-accent-5)]',
    '[--hdr-divider:color-mix(in_srgb,var(--color-neutral-0)_24%,transparent)]',
    '[--hdr-field:color-mix(in_srgb,var(--color-neutral-0)_12%,transparent)]',
    '[--hdr-field-border:color-mix(in_srgb,var(--color-neutral-0)_22%,transparent)]',
    '[--hdr-pill:var(--color-neutral-0)]',
    '[--hdr-pill-fg:var(--color-primary-8)]',
    '[--hdr-ring:var(--color-accent-5)]',
  ),
  glass: cn(
    'rim-glass glass-island bg-bg-glass backdrop-blur-xl backdrop-saturate-150',
    '[--hdr-fg:var(--color-fg-on-chrome)]',
    '[--hdr-fg-muted:var(--color-fg-on-nav-muted)]',
    '[--hdr-hover:var(--color-bg-nav-hover)]',
    '[--hdr-active:var(--color-bg-nav-active)]',
    '[--hdr-bar:var(--color-primary-6)]',
    '[--hdr-divider:var(--color-divider-strong)]',
    '[--hdr-field:color-mix(in_srgb,var(--color-bg-surface)_70%,transparent)]',
    '[--hdr-field-border:var(--color-border-default)]',
    '[--hdr-pill:var(--color-primary-6)]',
    '[--hdr-pill-fg:var(--color-neutral-0)]',
    '[--hdr-ring:var(--color-ring-focus)]',
  ),
} satisfies Record<HeaderAppearance, string>;

/** Nút icon CHUẨN của thanh (đổi theme, thông báo…): tròn, khớp `HEADER_CONTROL_HEIGHT`, màu từ biến `--hdr-*`. */
export const HEADER_ICON_BUTTON_CLASS = cn(
  'relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none wide:size-9',
  "touch:after:absolute touch:after:inset-x-0 touch:after:-inset-y-2 touch:after:content-['']",
  '[&>svg]:size-4.5!',
  'bg-transparent text-[var(--hdr-fg-muted)]',
  HEADER_FRAME_TRANSITION,
  'hover:bg-[var(--hdr-hover)] hover:text-[var(--hdr-fg)] active:scale-95 active:bg-[var(--hdr-active)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--hdr-ring)]',
);

/** Chấm báo trên nút icon (chuông có tin mới…) — viền 2px cùng màu thanh để chấm "khoét" gọn. */
export const HEADER_ICON_DOT_CLASS = cn(
  'pointer-events-none absolute right-1.5 top-1.5 size-2 rounded-full bg-error',
  'ring-2 ring-bg-brand-via group-data-[appearance=glass]/header:ring-bg-surface',
);

/** Ô "Tìm kiếm… Ctrl K" (dạng field của `CommandPaletteTrigger`) — viên tròn, nền / viền / chữ theo biến `--hdr-*`. */
export const HEADER_SEARCH_FIELD_CLASS = cn(
  'h-8 w-40 rounded-full border border-transparent px-3 xl:w-52 wide:h-9 wide:w-64',
  'bg-[var(--hdr-field)] text-[var(--hdr-fg-muted)] group-data-[appearance=glass]/header:border-[var(--hdr-field-border)]',
  HEADER_FRAME_TRANSITION,
  'hover:bg-[var(--hdr-hover)] hover:text-[var(--hdr-fg)]',
  'focus-visible:ring-2 focus-visible:ring-[var(--hdr-ring)]',
);

/**
 * Nút icon của top bar ĐIỆN THOẠI (`phone/PhoneTopBar`): hình 36px (32px máy < 360px hoặc xoay ngang thấp), vùng chạm
 * nới thành 44 / 40px bằng `::after`; khe giữa hai nút 8px nên hai vùng chạm không chồng nhau.
 */
export const HEADER_PHONE_BUTTON_CLASS = cn(
  'relative inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full outline-none',
  'max-[359px]:size-8 [@media(max-height:540px)]:size-8',
  "after:absolute after:-inset-1 after:content-['']",
  'border border-transparent bg-transparent text-fg-on-nav-muted',
  'transition-colors duration-150',
  'hover:bg-bg-nav-hover hover:text-link',
  'active:bg-bg-nav-active',
  'data-[state=open]:bg-bg-nav-active',
  'focus-visible:ring-2 focus-visible:ring-ring-focus',
  '[&>svg]:size-5!',
);

export const HEADER_SLOT_CLASSES = {
  root: cn('group/header relative z-30 shrink-0 pt-2', SHELL_GUTTER_X, 'tv:[--ui-scale:1]'),
  /** Lưới 3 cột `1fr · auto · 1fr` → khối tiêu đề luôn ĐÚNG GIỮA; KHÔNG `overflow-hidden` (vùng chạm / focus ring tràn mép). */
  bar: cn(
    'relative isolate grid h-12 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 rounded-2xl squircle pl-2 pr-1.5 wide:h-14',
    'text-[var(--hdr-fg)]',
  ),
  /** Đường cong đồng tâm mảnh góc phải + quầng ngọc / vàng kim rất nhạt (thanh `brand`) — vẽ ở `header-curves.css`. */
  aurora: cn(
    'hdr-aurora pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden rounded-[inherit] group-data-[appearance=brand]/header:block',
  ),
  left: 'relative flex min-w-0 items-center gap-1 self-stretch',
  /** Ghim CỘT 3: trang không có khối tiêu đề (vd Hồ sơ cá nhân) thì ô phải vẫn sát mép phải, không trôi vào cột giữa. */
  right:
    'relative col-start-3 flex min-w-0 items-center justify-end gap-1 self-stretch wide:gap-1.5',
  /** Ô hai bên: chừa `--hdr-tray-s` (28px) phía tiêu đề cho đoạn cong chữ S của khay (`header-tray.css`). */
  side: 'flex min-w-0 flex-1 items-stretch self-stretch max-xl:hidden',
  sideLeft: 'justify-end pr-7',
  sideRight: 'justify-start pl-7',
  /** Đích portal tab của trang trong ô bên — khối thường (không `contents`) để `useFitCount` đo được. */
  sideTarget: 'flex min-w-0 items-stretch self-stretch empty:hidden',
  divider: 'mx-1 h-5 w-px shrink-0 bg-[var(--hdr-divider)]',
  pageSlot: 'flex min-w-0 shrink items-center gap-1 self-stretch empty:hidden',
} satisfies Record<HeaderSlot, string>;

/**
 * Tab HAI BÊN khối tiêu đề (dải màn hình phân hệ · tab của trang — cùng một kiểu): TAB CONG đứng trên mép đáy thanh — góc
 * trên bo, hai chân loe lõm (`.hdr-tab` ở `header-tray.css`, màu `--tab-fill`) chảy vào mép đáy; rê = thân mờ `--hdr-hover`,
 * đang mở = thân ĐẶC `--hdr-pill` chữ `--hdr-pill-fg` (`!` thắng `hover:`). Cùng hình ở cả hai theme.
 */
export const HEADER_SIDE_TAB_CLASSES = {
  tab: cn(
    'hdr-tab relative inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 self-end whitespace-nowrap rounded-t-[0.625rem] px-3 outline-none wide:h-9 wide:px-3.5',
    'text-body-13-medium tracking-[0.01em] wide:text-body-14-medium',
    '[--tab-fg:var(--hdr-fg-muted)] [--tab-fill:transparent] hover:[--tab-fg:var(--hdr-fg)] hover:[--tab-fill:var(--hdr-hover)]',
    'data-[state=open]:[--tab-fill:var(--hdr-hover)] bg-(--tab-fill) text-(--tab-fg)',
    'active:opacity-80',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--hdr-ring)] disabled:cursor-not-allowed disabled:opacity-50',
  ),
  tabActive: cn(
    'text-body-13-semibold wide:text-body-14-semibold [--tab-fg:var(--hdr-pill-fg)]! [--tab-fill:var(--hdr-pill)]!',
  ),
} satisfies Record<'tab' | 'tabActive', string>;

/** KHAY uốn lượn trên đầu mỗi nửa tab (gốc dải): viền trên mờ dần ra ngoài, cong chữ S đổ xuống mép đáy cạnh tiêu đề. */
export const HEADER_SIDE_TRAY_CLASSES = {
  left: 'hdr-tray-left',
  right: 'hdr-tray-right',
} satisfies Record<HeaderSide, string>;

/** Nút ‹ quay lại (cấp ≥ 2) — bên TRÁI thanh ngay sau logo; nhích trái khi rê như nút Back của Finder. */
export const HEADER_BACK_CLASS = cn(
  HEADER_ICON_BUTTON_CLASS,
  'hover:-translate-x-0.5 [&>svg]:size-4!',
);

/**
 * KHỐI TIÊU ĐỀ giữa thanh: CHỈ tên trang, nằm trong "thung lũng" giữa hai khay cong; quầng sáng mờ từ đáy (`glow`) + vạch
 * vàng kim (`--hdr-bar`) mờ dần hai đầu ở mép đáy làm điểm nhấn — cùng mép đáy mà tab đang mở đứng lên.
 */
export const HEADER_PLATE_CLASSES = {
  root: 'relative z-10 flex max-w-[24rem] min-w-0 items-center justify-center self-stretch px-3',
  glow: cn(
    'pointer-events-none absolute inset-0 -z-10',
    'bg-[radial-gradient(70%_80%_at_50%_100%,var(--hdr-hover),transparent)]',
  ),
  accent: cn(
    'pointer-events-none absolute inset-x-4 bottom-0 h-0.5 rounded-full',
    'bg-linear-to-r from-transparent via-(--hdr-bar) to-transparent',
  ),
  title: cn(
    'min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap',
    'text-body-18-bold tracking-[0.015em] text-[var(--hdr-fg)]',
    '[text-shadow:0_1px_1px_color-mix(in_srgb,var(--color-neutral-10)_22%,transparent)]',
  ),
} satisfies Record<string, string>;

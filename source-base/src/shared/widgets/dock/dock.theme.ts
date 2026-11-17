import type { CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';

/**
 * dock.theme.ts — hằng số + bảng class của `Dock` và các phần trong `parts/`.
 *
 * Dùng:   cn(DOCK_SLOT_CLASSES.item, active && DOCK_ACTIVE_CLASSES.item)   // bảng khoá theo tên slot
 *         cn(DOCK_SETTINGS_SLOT_CLASSES.option, selected && DOCK_SETTINGS_SELECTED_CLASSES.option)
 * Sửa:    từng phần → DOCK_SLOT_CLASSES · DOCK_SETTINGS_SLOT_CLASSES (nền, cỡ, chữ)
 *         · trạng thái → DOCK_ACTIVE_CLASSES · DOCK_ROOT_STATE_CLASSES · DOCK_SETTINGS_*_CLASSES
 *         · mốc thời gian → DOCK_DURATION (phải khớp dock-magnify.css)
 * Lưu ý:  ⛔ Class là chuỗi LITERAL (không nội suy `${…}`); `max-xl:` = hết chỗ, `touch:` = khó bấm
 *         và chỉ SIẾT — `ipad-responsive.md §8.1`. Lý do thiết kế: notes/code/widgets.md.
 */

type DockSlot =
  'root' | 'item' | 'glyph' | 'indicator' | 'divider' | 'tooltip' | 'handle' | 'handleDot';

type DockActiveSlot = 'item' | 'glyph';

type DockRootState = 'collapsed' | 'concealed';

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

/** Khoảng hở đáy ĐÃ cộng `--safe-b`; neo đáy PHẢI dùng hằng này (`ipad-responsive.md §6`). */
const DOCK_BOTTOM_CLASS = 'bottom-[calc(1rem+var(--safe-b,0px))]';

const DOCK_BOTTOM_COLLAPSED_CLASS = 'bottom-[calc(0.25rem+var(--safe-b,0px))]';

/**
 * Vừa màn hẹp: giới hạn bề ngang + CUỘN NGANG thay vì ẩn icon (`ipad-responsive.md §4`).
 * `scrollbar-hidden` để TRẦN — `max-xl:scrollbar-hidden` không sinh rule nào, lỗi im lặng.
 */
const DOCK_NARROW_FIT_CLASS = cn(
  'max-xl:max-w-[calc(100vw-1rem)] max-xl:overflow-x-auto max-xl:overscroll-x-contain',
  'scrollbar-hidden',
);

/** Vỏ khay HUD (CHỈ tối): nền navy, quầng + vệt sáng đáy, ray đỉnh `::before`, ngoặc 4 góc `::after` — notes/code/widgets.md. */
const DOCK_HUD_SHELL_CLASS = cn(
  'dark:border-hud-5/30',
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-bg-header-from)_90%,transparent),color-mix(in_srgb,var(--color-bg-header-to)_94%,transparent))]',
  'dark:shadow-[inset_0_-1px_0_color-mix(in_srgb,var(--color-hud-4)_55%,transparent),inset_0_-14px_22px_-16px_color-mix(in_srgb,var(--color-hud-4)_45%,transparent),0_0_22px_color-mix(in_srgb,var(--color-hud-5)_18%,transparent),0_10px_28px_var(--color-shadow-popup)]',
  "dark:before:pointer-events-none dark:before:absolute dark:before:inset-x-5 dark:before:top-0 dark:before:h-0.5 dark:before:content-['']",
  'dark:before:bg-linear-to-r dark:before:from-transparent dark:before:via-hud-4 dark:before:to-transparent',
  'dark:before:drop-shadow-[0_0_4px_var(--color-hud-5)]',
  "dark:after:pointer-events-none dark:after:absolute dark:after:inset-0 dark:after:content-['']",
  'dark:after:[background:linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_left_top/12px_2px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_left_top/2px_12px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_right_top/12px_2px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_right_top/2px_12px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_left_bottom/12px_2px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_left_bottom/2px_12px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_right_bottom/12px_2px,linear-gradient(var(--color-hud-4),var(--color-hud-4))_no-repeat_right_bottom/2px_12px]',
);

/** Ô icon kiểu tile HUD (chỉ tối): viền mảnh + nền nhạt dần xuống; rê chuột sáng viền + quầng trong. */
const DOCK_HUD_TILE_CLASS = cn(
  'dark:border-hud-5/20',
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-hud-5)_10%,transparent),transparent_75%)]',
  'dark:hover:border-primary-4/60',
  'dark:hover:shadow-[inset_0_0_12px_color-mix(in_srgb,var(--color-primary-5)_32%,transparent)]',
);

/** Class móc gắn lên `<nav>` để bật phóng lân cận (rule thật ở `dock-magnify.css`). */
export const DOCK_MAGNIFY_CONTAINER_CLASS = 'dock-magnify';

/** Class móc gắn lên từng ô tham gia phóng lân cận — KHÔNG gắn lên vạch ngăn (đứt chuỗi anh em). */
export const DOCK_MAGNIFY_ITEM_CLASS = 'dock-magnify-item';

/** Class móc hiệu ứng BAY VÀO khi thanh vừa được gọi ra; gắn lên phần tử BỌC glyph, không phải ô bấm. */
export const DOCK_ENTER_CLASS = 'dock-icon-enter';

export const DOCK_HINT_CLASS = 'dock-hint';

/**
 * Vùng kích hoạt (px) giữa mép dưới màn hình: `height` từ mép dưới, `halfWidth` từ tâm màn hình.
 * PHẢI khớp kích thước `.dock-hint` trong `dock-magnify.css`.
 */
export const DOCK_TRIGGER_ZONE = {
  height: 22,
  halfWidth: 60,
} as const;

/**
 * Mốc thời gian (ms): `armDelay` chờ xác nhận ý định trước khi bung · `shellOpen` thanh trồi xong ·
 * `iconEnter` icon bay vào · `iconStagger` lệch pha hai icon liền kề · `closeDelay` giữ thanh sau khi
 * con trỏ rời. `shell*` / `icon*` phải KHỚP `dock-magnify.css`.
 */
export const DOCK_DURATION = {
  armDelay: 80,
  shellOpen: 300,
  iconStagger: 25,
  iconEnter: 300,
  closeDelay: 500,
} as const;

export const DOCK_SLOT_CLASSES = {
  root: cn(
    'fixed left-1/2 z-40 -translate-x-1/2',
    'flex items-end gap-2',
    DOCK_BOTTOM_CLASS,
    'border border-border-default bg-bg-surface/85 backdrop-blur-md',
    'shadow-[0_8px_24px_var(--color-shadow-popup)]',
    DOCK_HUD_SHELL_CLASS,
    'px-3 py-2',
    DOCK_NARROW_FIT_CLASS,
    'transition-[translate,opacity,padding,bottom] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'touch:gap-1 touch:px-2',
  ),
  item: cn(
    'group relative flex size-11 shrink-0 items-center justify-center outline-none',
    'border border-transparent bg-transparent',
    'origin-bottom transition-[translate,scale,background-color,border-color,box-shadow] duration-200 ease-out',
    'hover:bg-bg-nav-hover',
    DOCK_HUD_TILE_CLASS,
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
    'touch:size-10',
  ),
  glyph: cn(
    'flex items-center justify-center text-fg-body transition-colors duration-200',
    '[&>svg]:size-5.5! touch:[&>svg]:size-5!',
    'group-hover:text-fg-heading',
  ),
  indicator: cn(
    'pointer-events-none absolute -bottom-1.5 left-1/2 h-[3px] w-5 -translate-x-1/2',
    'bg-primary-6 dark:bg-primary-3',
    'dark:shadow-[0_0_8px_var(--color-primary-4),0_0_2px_var(--color-primary-3)]',
  ),
  divider: 'mx-1 h-7 w-px shrink-0 self-center bg-divider-nav touch:mx-0.5',
  tooltip: cn(
    'px-2.5 py-1.5',
    'border border-border-popup bg-bg-popup backdrop-blur-md dark:ring-0',
    'text-caption-12-medium text-fg-on-chrome',
    'shadow-[0_8px_24px_var(--color-shadow-popup)]',
  ),
  handle: cn(
    'flex shrink-0 cursor-pointer items-center gap-1 px-1.5 py-0.5 outline-none',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  handleDot: 'size-1 rounded-full bg-fg-muted',
} satisfies Record<DockSlot, string>;

/** Tile đang bật (chỉ tối): viền sáng + nền xanh lá pha ngọc dâng từ đáy + quầng — cùng sắc chip tab header. */
const DOCK_HUD_TILE_ACTIVE_CLASS = cn(
  'dark:border-primary-4/75',
  'dark:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-primary-5)_12%,transparent),color-mix(in_srgb,color-mix(in_srgb,var(--color-primary-5)_72%,var(--color-teal-5))_42%,transparent))]',
  'dark:shadow-[inset_0_0_14px_color-mix(in_srgb,var(--color-primary-4)_35%,transparent),0_0_12px_color-mix(in_srgb,var(--color-primary-5)_35%,transparent)]',
);

/** Ô đang mở trang hiện tại (cùng bộ với nút bánh răng đang mở — `DOCK_SETTINGS_TRIGGER_OPEN_CLASSES`). */
export const DOCK_ACTIVE_CLASSES = {
  item: cn('border-primary-5/50 bg-bg-nav-active', DOCK_HUD_TILE_ACTIVE_CLASS),
  glyph: 'text-link dark:text-primary-2 dark:drop-shadow-[0_0_6px_var(--color-primary-4)]',
} satisfies Record<DockActiveSlot, string>;

/** Hover nảy nhẹ của ô; CHỈ dùng khi tắt phóng lân cận (`!magnify`) — hai transform sẽ cộng dồn. */
export const DOCK_SOFT_HOVER_CLASSES = 'hover:-translate-y-0.5 hover:scale-[1.12]';

export const DOCK_ROOT_STATE_CLASSES = {
  collapsed: cn('px-2 py-0.5 touch:px-1.5', DOCK_BOTTOM_COLLAPSED_CLASS),
  concealed: 'pointer-events-none translate-y-[160%] opacity-0',
} satisfies Record<DockRootState, string>;

export const DOCK_SETTINGS_SLOT_CLASSES = {
  trigger: cn(
    'group relative flex size-11 shrink-0 cursor-pointer items-center justify-center outline-none',
    'border border-transparent bg-transparent text-fg-body',
    'origin-bottom transition-[translate,scale,color,background-color,border-color,box-shadow] duration-200 ease-out',
    'hover:-translate-y-0.5 hover:scale-[1.12] hover:bg-bg-nav-hover hover:text-fg-heading',
    DOCK_HUD_TILE_CLASS,
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
    'touch:size-10',
  ),
  panel: 'w-64 p-1.5',
  panelHeader: 'flex items-center gap-2 px-1.5 pt-1 pb-2',
  panelHeaderIcon: cn(
    'flex size-6 shrink-0 items-center justify-center',
    'bg-bg-nav-active text-link [&>svg]:size-3.5!',
  ),
  panelTitle: 'text-caption-12-semibold text-fg-on-chrome',
  sectionLabel: cn(
    'block px-2 pt-2 pb-1',
    'text-caption-10-semibold uppercase tracking-[0.12em] text-fg-on-chrome-muted',
  ),
  optionList: 'flex flex-col gap-0.5',
  option: cn(
    'group/option flex w-full cursor-pointer items-center gap-2.5 px-2 py-1.5 text-left outline-none',
    'transition-colors duration-150 ease-out',
    'hover:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  optionIcon: cn(
    'flex size-7 shrink-0 items-center justify-center',
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
  optionState: cn(
    'border-primary-6 bg-primary-6 text-neutral-0',
    'dark:border-primary-5 dark:bg-primary-5 dark:text-fg-inverse',
  ),
} satisfies Record<DockSettingsSelectedSlot, string>;

/** Công tắc đang bật: chỉ nhuộm ô icon, không nhuộm nền hàng. */
export const DOCK_SETTINGS_ACCENT_ICON_CLASSES = 'bg-bg-nav-active text-link';

/** Hàng còn thấy nhưng không bấm được. */
export const DOCK_SETTINGS_LOCKED_CLASSES = 'cursor-not-allowed opacity-50 hover:bg-transparent';

/** Nút bánh răng khi panel đang mở — cùng bộ với ô đang mở (`DOCK_ACTIVE_CLASSES`). */
export const DOCK_SETTINGS_TRIGGER_OPEN_CLASSES = cn(
  'border-primary-5/50 bg-bg-nav-active text-link dark:text-primary-2',
  DOCK_HUD_TILE_ACTIVE_CLASS,
);

/** Style nội tuyến đưa độ trễ (ms) vào hiệu ứng bay vào của `dock-magnify.css` (`--dock-icon-delay`). */
export function dockEnterStyle(delayMs: number): CSSProperties {
  return { ['--dock-icon-delay' as string]: `${delayMs}ms` } as CSSProperties;
}

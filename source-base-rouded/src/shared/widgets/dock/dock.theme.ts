import type { CSSProperties } from 'react';

import { cn } from '@/shared/utils/style/cn';

import type { DockPosition } from './dock.types';

/**
 * dock.theme.ts — hằng số + bảng class của vỏ `Dock`, ô mục và các biến thể theo CẠNH NEO.
 *
 * Dùng:   cn(DOCK_SLOT_CLASSES.root, DOCK_POSITION_CLASSES[position].root, concealed && DOCK_POSITION_CLASSES[position].concealed)
 * Sửa:    chất liệu kính · bóng → DOCK_SLOT_CLASSES.root · theo cạnh (neo, chiều xếp, vạch ngăn, chấm đang mở, tay nắm)
 *         → DOCK_POSITION_CLASSES · chừa chỗ cho `<main>` → DOCK_RESERVE_CLASSES · mốc thời gian → DOCK_DURATION
 *         (phải khớp dock-magnify.css) · panel bánh răng → `dock-settings.theme.ts`
 * Lưu ý:  ⛔ Class là chuỗi LITERAL. Cả hai theme CÙNG một vỏ kính mờ kiểu macOS (nền `bg-glass` + blur + viền bắt sáng
 *         `rim-glass` + bóng mềm); tối chỉ khác màu — token tự lật, không có lớp `dark:`. Neo PHẢI cộng `--safe-*`
 *         (`ipad-responsive.md §6`). Lý do: notes/code/widgets.md.
 */

type DockSlot = 'root' | 'item' | 'indicator' | 'tooltip' | 'handleDot';

type DockPositionSlot =
  'root' | 'concealed' | 'collapsed' | 'divider' | 'indicator' | 'handle' | 'softHover';

/** Class móc gắn lên `<nav>` để bật phóng lân cận (JS: `hooks/useDockMagnify.ts` · transform: `dock-magnify.css` §1). */
export const DOCK_MAGNIFY_CONTAINER_CLASS = 'dock-magnify';

/** Class móc của ô PHÓNG (mục + nút cài đặt) — `useDockMagnify` chỉ phóng con mang class này; con khác chỉ dời theo. */
export const DOCK_MAGNIFY_ITEM_CLASS = 'dock-magnify-item';

/** Class móc hiệu ứng BAY VÀO khi thanh vừa được gọi ra; gắn lên phần tử BỌC glyph, không phải ô bấm. */
export const DOCK_ENTER_CLASS = 'dock-icon-enter';

export const DOCK_HINT_CLASS = 'dock-hint';

/** Class móc trên `<nav>` cho rule `prefers-reduced-transparency` (kính mờ → mặt đặc) ở `dock-magnify.css` §4. */
const DOCK_SHELL_CLASS = 'dock-shell';

/**
 * Vùng kích hoạt (px) ở giữa MÉP NEO: `height` = độ sâu tính từ mép, `halfWidth` = nửa bề dài dọc theo mép tính từ
 * tâm. PHẢI khớp kích thước `.dock-hint` trong `dock-magnify.css`.
 */
export const DOCK_TRIGGER_ZONE = {
  height: 22,
  halfWidth: 72,
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
    DOCK_SHELL_CLASS,
    'fixed z-40 flex gap-1.5 p-1.5',
    'rim-glass glass-island squircle rounded-2xl bg-bg-glass backdrop-blur-2xl backdrop-saturate-150',
    'transition-[translate,opacity,padding,bottom,left,right] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'touch:gap-1',
  ),
  item: cn(
    'group relative flex shrink-0 items-center justify-center rounded-lg outline-none',
    'transition-[translate,scale,filter] duration-200 ease-out active:brightness-90',
    'focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-0',
  ),
  indicator: 'pointer-events-none absolute size-1 rounded-full bg-fg-subheading',
  tooltip: cn(
    'rounded-md px-2.5 py-1.5',
    'border border-border-popup bg-bg-popup backdrop-blur-md',
    'text-caption-12-medium text-fg-on-chrome',
    'shadow-[0_8px_24px_var(--color-shadow-popup)]',
  ),
  handleDot: 'size-1 rounded-full bg-fg-muted',
} satisfies Record<DockSlot, string>;

/**
 * Mọi khác biệt theo CẠNH NEO gom một bảng: thêm cạnh mới = thêm một khoá, `tsc` báo ô còn thiếu. Dock TRÁI chung cột với
 * thanh lịch sử thẻ (`--work-tabs-rail-bottom` trên `:root`), Dock PHẢI chung cột với cột bộ lọc của trang
 * (`--page-filter-rail-bottom`) → canh giữa phần còn lại DƯỚI thanh, không chồng lên nó.
 */
export const DOCK_POSITION_CLASSES = {
  bottom: {
    root: cn(
      'bottom-[calc(0.75rem+var(--safe-b,0px))] left-1/2 -translate-x-1/2 flex-row items-end',
      'max-xl:max-w-[calc(100vw-1rem)] max-xl:overflow-x-auto max-xl:overscroll-x-contain scrollbar-hidden',
    ),
    concealed: 'pointer-events-none translate-y-[160%] opacity-0',
    collapsed: 'bottom-[calc(0.25rem+var(--safe-b,0px))] px-2 py-1',
    divider: 'mx-0.5 h-8 w-px self-center',
    indicator: '-bottom-1.25 left-1/2 -translate-x-1/2',
    handle: 'flex-row',
    softHover: 'hover:-translate-y-1 hover:scale-110',
  },
  left: {
    root: cn(
      'top-[calc(50%+(var(--work-tabs-rail-bottom,-0.75rem)+0.75rem)/2)] left-[calc(0.75rem+var(--safe-l,0px))] -translate-y-1/2 flex-col items-start',
      '[@media(max-height:720px)]:max-h-[calc(100dvh-5rem)] [@media(max-height:720px)]:overflow-y-auto scrollbar-hidden',
    ),
    concealed: 'pointer-events-none -translate-x-[160%] opacity-0',
    collapsed: 'left-[calc(0.25rem+var(--safe-l,0px))] px-1 py-2',
    divider: 'my-0.5 h-px w-8 self-center',
    indicator: '-left-1.25 top-1/2 -translate-y-1/2',
    handle: 'flex-col',
    softHover: 'hover:translate-x-1 hover:scale-110',
  },
  right: {
    root: cn(
      'top-[calc(50%+(var(--page-filter-rail-bottom,-0.75rem)+0.75rem)/2)] right-[calc(0.75rem+var(--safe-r,0px))] -translate-y-1/2 flex-col items-end',
      '[@media(max-height:720px)]:max-h-[calc(100dvh-5rem)] [@media(max-height:720px)]:overflow-y-auto scrollbar-hidden',
    ),
    concealed: 'pointer-events-none translate-x-[160%] opacity-0',
    collapsed: 'right-[calc(0.25rem+var(--safe-r,0px))] px-1 py-2',
    divider: 'my-0.5 h-px w-8 self-center',
    indicator: '-right-1.25 top-1/2 -translate-y-1/2',
    handle: 'flex-col',
    softHover: 'hover:-translate-x-1 hover:scale-110',
  },
} satisfies Record<DockPosition, Record<DockPositionSlot, string>>;

/** Màu vạch ngăn (chung mọi cạnh) — ghép với `DOCK_POSITION_CLASSES[position].divider`. */
export const DOCK_DIVIDER_CLASS = 'shrink-0 bg-divider-strong';

/** Tooltip / panel bung về phía TRONG màn hình. */
export const DOCK_POPUP_SIDE = {
  bottom: 'top',
  left: 'right',
  right: 'left',
} as const satisfies Record<DockPosition, 'top' | 'right' | 'left'>;

/**
 * Chỗ cho Dock GHIM trên `<main>` (ghép SAU `SHELL_*`). Trái / phải: KHÔNG chừa — Dock dọc (cùng thanh lịch sử thẻ) nổi đè,
 * nội dung dùng trọn bề ngang. Đáy: trang trôi đệm 80px, trang KHOÁ CAO (`data-page-shell="scroll"`) cao trọn màn, Dock kính
 * nổi đè; vùng cuộn bị lấn do `useDockOverlap` (vỏ app) ghi `--dock-overlap`. Lý do: notes/code/app.md.
 */
export const DOCK_RESERVE_CLASSES = {
  bottom: cn(
    'pb-[calc(5rem+var(--safe-b,0px))] [--dock-inset-b:calc(4rem+var(--safe-b,0px))]',
    'has-[>[data-page-shell=scroll]]:pb-4',
  ),
  left: '',
  right: '',
} satisfies Record<DockPosition, string>;

/** Style nội tuyến đưa độ trễ (ms) vào hiệu ứng bay vào của `dock-magnify.css` (`--dock-icon-delay`). */
export function dockEnterStyle(delayMs: number): CSSProperties {
  return { ['--dock-icon-delay' as string]: `${delayMs}ms` } as CSSProperties;
}

import { HEADER_HEIGHT_CLASS } from '@/shared/constants/layout.constants';
import { cn } from '@/shared/utils/style/cn';

/**
 * work-tabs.theme.ts — THANH DỌC lịch sử thẻ sát mép trái cửa sổ (cách 6px, ngay dưới header): ô phân hệ 24px của 3 màn
 * mở gần nhất xếp dọc + nút "+N" mở bảng đầy đủ sang phải.
 *
 * Dùng:   className={WORK_TABS_RAIL_CLASSES.root} · ô: WORK_TABS_RAIL_CLASSES.item · mép dưới: `--work-tabs-rail-bottom`
 * Lưu ý:  viên KÍNH như Dock ở CẢ HAI theme (`rim-glass` + `squircle` + blur + gờ sáng đỉnh + bóng mềm; tối chỉ khác màu —
 *         token tự lật). Rộng đúng `WORK_TABS_RAIL_WIDTH` — layout chừa mép trái cho `<main>` theo hằng này. Vị trí KHÔNG đổi
 *         theo Dock (Dock trái xếp bên dưới thanh). Chỉ báo màn đang mở = vạch 2px trong lớp đệm mép trái, không thêm bề rộng.
 *         `z-30`: trên nội dung trang, dưới lớp nổi (`z-50`). Chuyển động tắt khi giảm chuyển động.
 */

/** Bề rộng thanh dọc (px) = đệm 4 + ô 24 + đệm 4 — khớp `w-8` của `WORK_TABS_RAIL_CLASSES.root`. */
export const WORK_TABS_RAIL_WIDTH = 32;

type WorkTabsRailSlot =
  'root' | 'item' | 'tile' | 'indicator' | 'divider' | 'more' | 'tipTitle' | 'tipMeta';

export const WORK_TABS_RAIL_CLASSES = {
  root: cn(
    'fixed left-[max(0.375rem,var(--safe-l,0px))] z-30 mt-1.5 flex w-8 flex-col items-center gap-1 p-1',
    HEADER_HEIGHT_CLASS.belowHeader,
    'rim-glass glass-island glass-island-sm squircle rounded-xl bg-bg-glass backdrop-blur-2xl backdrop-saturate-150',
    'origin-top-left animate-pop-in motion-reduce:animate-none',
  ),
  item: cn(
    'relative flex size-6 shrink-0 items-center justify-center rounded-md outline-none',
    'animate-chip-in transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
    'hover:scale-110 active:scale-95 motion-reduce:animate-none motion-reduce:transition-none',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
  ),
  tile: 'rounded-md',
  indicator:
    'pointer-events-none absolute top-1/2 -left-1 h-3 w-0.5 -translate-y-1/2 rounded-full bg-primary-5',
  divider: 'h-px w-4 shrink-0 rounded-full bg-border-strong',
  more: cn(
    'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none',
    'text-caption-10-bold text-fg-muted tabular-nums transition-[background-color,color] duration-150',
    'hover:bg-bg-surface/70 hover:text-fg-heading',
    'data-[state=open]:bg-bg-surface data-[state=open]:text-fg-heading data-[state=open]:shadow-(--elev-1)',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
    'dark:hover:bg-bg-nav-hover dark:data-[state=open]:bg-bg-nav-active',
  ),
  tipTitle: 'block text-caption-12-semibold',
  tipMeta: 'block text-caption-10-medium opacity-80',
} satisfies Record<WorkTabsRailSlot, string>;

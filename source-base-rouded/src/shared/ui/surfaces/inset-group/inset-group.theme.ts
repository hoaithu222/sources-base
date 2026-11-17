import { cn } from '@/shared/utils/style/cn';

/**
 * inset-group.theme.ts — bảng class của `InsetGroup` / `InsetGroupRow`: hộp nhóm kiểu System Settings của macOS.
 *
 * Dùng:   cn(INSET_GROUP_BOX_CLASSES[surface]) · cn(INSET_GROUP_ROW_CLASSES.row, interactive && INSET_GROUP_ROW_CLASSES.interactive)
 * Lưu ý:  ⛔ Vạch ngăn dòng THỤT VÀO (bắt đầu sau ô icon / lề trái, dừng trước lề phải) — không kẻ mép tới mép; dòng
 *         đầu không có vạch. Hộp `raised` (trắng + viền mảnh) đặt trên nền trang; `sunken` (xám rất nhạt, không viền)
 *         đặt trong một bề mặt trắng — giống hộp nhóm nằm trong cửa sổ macOS. `glass` (kính mờ, thấy màu phía sau) CHỈ đặt
 *         trên nền có màu / ảnh (dải gradient, hero) — trên nền trơn kính trông như hộp xám bẩn.
 */

export type InsetGroupSurface = 'raised' | 'sunken' | 'glass';

export const INSET_GROUP_CLASSES = {
  root: 'flex min-w-0 flex-col gap-2',
  head: 'flex flex-col gap-0.5 px-1',
  title: 'text-body-14-semibold text-fg-heading',
  description: 'text-caption-12 text-fg-muted',
  footer: 'px-1 text-caption-12 text-fg-muted',
} satisfies Record<string, string>;

export const INSET_GROUP_BOX_CLASSES = {
  raised:
    'rim-soft squircle flex flex-col overflow-hidden rounded-xl border border-border-default bg-bg-surface shadow-(--elev-1)',
  sunken: 'squircle flex flex-col overflow-hidden rounded-xl bg-bg-subtle',
  glass: cn(
    'rim-glass squircle relative flex flex-col overflow-hidden rounded-xl bg-bg-glass backdrop-blur-xl backdrop-saturate-150',
    'shadow-[inset_0_1px_0_color-mix(in_srgb,var(--color-neutral-0)_60%,transparent),0_10px_28px_-14px_var(--color-shadow-glass)]',
  ),
} satisfies Record<InsetGroupSurface, string>;

export const INSET_GROUP_ROW_CLASSES = {
  row: cn(
    'relative flex min-h-11 items-center gap-3 px-3 py-2 text-left outline-none',
    "before:pointer-events-none before:absolute before:top-0 before:right-3 before:left-(--inset-group-divider) before:h-px before:bg-border-default before:content-['']",
    'first:before:hidden',
  ),
  interactive: cn(
    'w-full cursor-pointer transition-colors duration-150 ease-out',
    'hover:bg-bg-nav-hover active:bg-bg-nav-active',
    'focus-visible:bg-bg-nav-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  text: 'flex min-w-0 flex-1 flex-col gap-0.5',
  title: 'overflow-x-clip text-ellipsis whitespace-nowrap text-body-14 text-fg-heading',
  description: 'text-caption-12 text-fg-muted',
  trailing: 'ml-auto flex shrink-0 items-center gap-2 pl-2',
  /** `wideControl`: dưới `sm` điều khiển xuống dòng riêng, thẳng mép chữ tên (có ô icon: thụt 24 + 12px). */
  wide: 'max-sm:flex-wrap max-sm:gap-y-2',
  trailingWide: 'max-sm:ml-0 max-sm:basis-full max-sm:pb-1',
  trailingWideIcon: 'max-sm:pl-9',
  trailingWidePlain: 'max-sm:pl-0',
  value:
    'max-w-56 overflow-x-clip text-ellipsis whitespace-nowrap text-body-14 text-fg-muted tabular-nums',
  chevron: 'shrink-0 text-fg-faint',
} satisfies Record<string, string>;

/** Vạch ngăn bắt đầu: có ô icon (24px + khe 12px + lề 12px) → 48px, không icon → thẳng lề trái 12px. */
export const INSET_GROUP_DIVIDER_INSET = {
  icon: '[--inset-group-divider:3rem]',
  plain: '[--inset-group-divider:0.75rem]',
};

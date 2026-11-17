import { cn } from '@/shared/utils/style/cn';

/**
 * page-header-phone.theme.ts — bảng class của `PageHeader` khi chạy trên top bar ĐIỆN THOẠI: tên + dòng phụ
 * phẳng, dải tab cuộn ngang, chip tab.
 *
 * Dùng:   cn(PAGE_HEADER_PHONE_SLOT_CLASSES.chip, active && PAGE_HEADER_PHONE_ACTIVE_CLASSES.chip)
 * Lưu ý:  ⛔ Tên KHÔNG `truncate` (gọt dấu chữ HOA tiếng Việt): `overflow-x-clip overflow-y-visible text-ellipsis`.
 *         Chip cao 32px, vùng chạm 44px bằng `::after` dọc; dải tab CUỘN ngang, không ẩn tab. Sáng: viên chữ thường,
 *         mục đang mở = viên ngọc ĐẶC chữ trắng (chọn kiểu iOS); chấm tông trước tên. Cùng hình ở cả hai theme.
 *         Mốc `[@media(max-height:540px)]` = xoay ngang thấp, khớp biến thể `phone:`.
 */

type PageHeaderPhoneSlot =
  'title' | 'accent' | 'text' | 'name' | 'subtitle' | 'nav' | 'chip' | 'chipLabel';

type PageHeaderPhoneActiveSlot = 'chip';

export const PAGE_HEADER_PHONE_SLOT_CLASSES = {
  title: cn('flex min-w-0 items-center gap-2', '[@media(max-height:540px)]:gap-3'),
  accent: 'size-2 shrink-0 rounded-full',
  text: cn(
    'flex min-w-0 flex-col justify-center gap-0.5',
    '[@media(max-height:540px)]:flex-row [@media(max-height:540px)]:items-baseline [@media(max-height:540px)]:gap-3',
  ),
  name: cn(
    'min-w-0 overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap',
    'text-body-16-bold leading-5! text-fg-on-chrome',
  ),
  subtitle: cn(
    'flex min-w-0 items-center overflow-x-clip text-ellipsis whitespace-nowrap',
    'text-caption-12 leading-4! text-fg-on-nav-subtle',
  ),
  nav: cn(
    'flex min-w-0 items-center gap-1 overflow-x-auto overscroll-x-contain scrollbar-hidden',
    '[@media(max-height:540px)]:gap-1',
  ),
  chip: cn(
    'relative inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full px-3 outline-none',
    "select-none whitespace-nowrap after:absolute after:inset-x-0 after:-inset-y-1 after:content-['']",
    'border border-transparent text-fg-on-nav-muted',
    'text-body-13-medium',
    'transition-colors duration-150 active:bg-bg-nav-hover',
    'focus-visible:ring-2 focus-visible:ring-ring-focus',
    '[&>svg]:size-4!',
  ),
  chipLabel: 'overflow-x-clip overflow-y-visible text-ellipsis whitespace-nowrap',
} satisfies Record<PageHeaderPhoneSlot, string>;

export const PAGE_HEADER_PHONE_ACTIVE_CLASSES = {
  chip: 'bg-primary-6 text-body-13-semibold text-neutral-0 active:bg-primary-7',
} satisfies Record<PageHeaderPhoneActiveSlot, string>;

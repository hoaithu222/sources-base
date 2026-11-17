import { cn } from '@/shared/utils/style/cn';

/**
 * range-date-picker.theme — class panel, cột chọn nhanh, dòng tóm tắt của RangeDatePicker.
 *
 * Lưu ý:  nút chọn nhanh cùng nhịp dòng menu (`POPUP_ITEM_CLASS`): vạch trái `before:` co giãn `scale-y` khi rê;
 *         tối thêm dải sáng loang từ trái + quầng vạch (chỉ `dark:`).
 */

type RangePanelWidth = 'default' | 'quickSelect';

export const RANGE_DATE_PICKER_PANEL_CLASSES = {
  default: 'w-72 max-w-[calc(100vw-1.5rem)]',
  quickSelect: 'w-[540px] max-w-[calc(100vw-1.5rem)]',
} satisfies Record<RangePanelWidth, string>;

export const RANGE_DATE_PICKER_CLASSES = {
  quickList: cn(
    'flex w-28 shrink-0 flex-col gap-0.5 border-r border-divider-nav px-2 py-3',
    'dark:bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--color-primary-5)_6%,transparent))]',
  ),
  quickButton: cn(
    'relative cursor-pointer whitespace-nowrap px-2 py-1.5 text-left text-body-13 text-fg-on-chrome',
    'transition-colors duration-150 ease-out hover:bg-primary-5/10 hover:text-link',
    "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:content-['']",
    'before:scale-y-0 before:bg-primary-5 before:transition-transform before:duration-150 hover:before:scale-y-100',
    'dark:hover:text-fg-heading',
    'dark:hover:bg-[linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-5)_22%,transparent),color-mix(in_srgb,var(--color-primary-5)_4%,transparent)_85%)]',
    'dark:before:bg-primary-4 dark:before:shadow-[0_0_8px_color-mix(in_srgb,var(--color-primary-4)_80%,transparent)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  calendar: 'flex min-w-0 flex-1 flex-col',
  summary: 'text-caption-12 tabular-nums text-fg-on-chrome-muted',
  actions: 'ml-auto flex gap-2',
};

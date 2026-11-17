import { cn } from '@/shared/utils/style/cn';

/**
 * range-date-picker.theme — class panel, cột chọn nhanh, dòng tóm tắt của RangeDatePicker.
 *
 * Lưu ý:  nút chọn nhanh cùng nhịp dòng menu (`POPUP_ITEM_CLASS`): bo `rounded-sm`, rê = nền `primary-5` 10% +
 *         chữ `link`, KHÔNG vạch trái.
 */

type RangePanelWidth = 'default' | 'quickSelect';

export const RANGE_DATE_PICKER_PANEL_CLASSES = {
  default: 'w-72 max-w-[calc(100vw-1.5rem)]',
  quickSelect: 'w-[540px] max-w-[calc(100vw-1.5rem)]',
} satisfies Record<RangePanelWidth, string>;

export const RANGE_DATE_PICKER_CLASSES = {
  quickList: 'flex w-28 shrink-0 flex-col gap-0.5 border-r border-divider-nav px-2 py-3',
  quickButton: cn(
    'relative cursor-pointer whitespace-nowrap rounded-sm px-2 py-1.5 text-left text-body-13 text-fg-on-chrome',
    'transition-colors duration-150 ease-out hover:bg-primary-5/10 hover:text-link',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
  ),
  calendar: 'flex min-w-0 flex-1 flex-col',
  summary: 'text-caption-12 tabular-nums text-fg-on-chrome-muted',
  actions: 'ml-auto flex gap-2',
};

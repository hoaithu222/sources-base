import { cn } from '@/shared/utils/style/cn';

/**
 * date-picker.theme — class dùng chung của Single / Range / DateTime picker: ô ngày và chân panel.
 *
 * Dùng:   dayCellClassName({ isCurrentMonth, selected, off, isToday, inRange })
 * Trục:   ô ngày idle | inRange | selected (+ ngoài tháng · hôm nay · khoá) — mỗi ô tự mang hover
 * Sửa:    ô ngày → DAY_CELL_*_CLASSES · chân panel → DATE_PICKER_FOOTER_CLASSES (nút là `<Button>` của UI kit)
 * Lưu ý:  "hôm nay" = viền trong 1px `primary-5` + chữ `link`, nhường cho `selected` khi trùng ngày.
 *         Ô chọn = nền đặc `primary-6` chữ trắng như dòng được chọn của menu macOS, ở cả hai theme (màu qua
 *         token tự lật, KHÔNG `dark:`) — test khoá `bg-primary-6` / `bg-primary-5/15`.
 */

type DayCellState = 'idle' | 'inRange' | 'selected';

interface DayCellFlags {
  isCurrentMonth: boolean;
  selected: boolean;
  off: boolean;
  isToday: boolean;
  inRange?: boolean;
}

/** Ô ngày bo `rounded-sm`; ô `inRange` trả về vuông để các ô liền nhau ghép thành MỘT dải. */
const DAY_CELL_BASE_CLASSES = cn(
  'flex h-9 w-full cursor-pointer items-center justify-center rounded-sm text-body-14 tabular-nums',
  'transition-[color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const DAY_CELL_STATE_CLASSES = {
  idle: 'text-fg-on-chrome hover:bg-primary-5/10',
  inRange: 'rounded-none bg-primary-5/15 text-fg-on-chrome hover:bg-primary-5/25',
  selected: 'bg-primary-6 text-body-14-semibold text-neutral-0 hover:bg-primary-7',
} satisfies Record<DayCellState, string>;

const DAY_CELL_OUTSIDE_CLASSES = 'text-fg-faint';

const DAY_CELL_TODAY_CLASSES =
  'text-body-14-semibold text-link shadow-[inset_0_0_0_1px_var(--color-primary-5)]';

const DAY_CELL_OFF_CLASSES = 'cursor-not-allowed opacity-50 hover:bg-transparent';

/** Chân panel: vạch đỉnh `divider-nav`, các phần tử căn hai đầu, xuống dòng khi hẹp. */
export const DATE_PICKER_FOOTER_CLASSES =
  'flex flex-wrap items-center justify-between gap-2 border-t border-divider-nav px-3 py-2';

export function dayCellClassName({
  isCurrentMonth,
  selected,
  off,
  isToday,
  inRange = false,
}: DayCellFlags): string {
  const state: DayCellState = selected ? 'selected' : inRange ? 'inRange' : 'idle';
  return cn(
    DAY_CELL_BASE_CLASSES,
    DAY_CELL_STATE_CLASSES[state],
    !isCurrentMonth && !selected && DAY_CELL_OUTSIDE_CLASSES,
    isToday && !selected && DAY_CELL_TODAY_CLASSES,
    off && DAY_CELL_OFF_CLASSES,
  );
}

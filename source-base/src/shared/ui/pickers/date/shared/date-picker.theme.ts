import { cn } from '@/shared/utils/style/cn';
import { PICKER_CELL_HUD_CLASSES } from '../../picker-cell.theme';

/**
 * date-picker.theme — class dùng chung của Single / Range / DateTime picker: ô ngày và chân panel.
 *
 * Dùng:   dayCellClassName({ isCurrentMonth, selected, off, isToday, inRange })
 * Trục:   ô ngày idle | inRange | selected (+ ngoài tháng · hôm nay · khoá) — mỗi ô tự mang hover
 * Sửa:    ô ngày → DAY_CELL_*_CLASSES · chân panel → DATE_PICKER_FOOTER_CLASSES (nút là `<Button>` của UI kit)
 *         · mảnh HUD tối của ô → `pickers/picker-cell.theme.ts`
 * Lưu ý:  "hôm nay" = viền trong 1px `primary-5` + chữ `link`, nhường cho `selected` khi trùng ngày.
 *         Tối = ngôn ngữ HUD (`HUD_ACTIVE_FILL` cho ô chọn); sáng giữ nền đặc — test khoá `bg-primary-6` / `bg-primary-5/15`.
 */

type DayCellState = 'idle' | 'inRange' | 'selected';

interface DayCellFlags {
  isCurrentMonth: boolean;
  selected: boolean;
  off: boolean;
  isToday: boolean;
  inRange?: boolean;
}

const DAY_CELL_BASE_CLASSES = cn(
  'flex h-9 w-full cursor-pointer items-center justify-center text-body-14 tabular-nums',
  'transition-[color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const DAY_CELL_STATE_CLASSES = {
  idle: cn('text-fg-on-chrome hover:bg-primary-5/10', PICKER_CELL_HUD_CLASSES.hover),
  inRange: cn(
    'bg-primary-5/15 text-fg-on-chrome hover:bg-primary-5/25',
    PICKER_CELL_HUD_CLASSES.inRange,
    PICKER_CELL_HUD_CLASSES.hover,
  ),
  selected: cn(
    'bg-primary-6 text-body-14-semibold text-neutral-0 hover:bg-primary-7',
    PICKER_CELL_HUD_CLASSES.selected,
  ),
} satisfies Record<DayCellState, string>;

const DAY_CELL_OUTSIDE_CLASSES = 'text-fg-faint';

const DAY_CELL_TODAY_CLASSES = cn(
  'text-body-14-semibold text-fg-heading shadow-[inset_0_0_0_1px_var(--color-hud-6)]',
  PICKER_CELL_HUD_CLASSES.current,
);

const DAY_CELL_OFF_CLASSES =
  'cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:shadow-none';

/** Chân panel: tối thêm vạch đỉnh xanh + dốc sáng nhẹ từ đáy (cùng nhịp chân Modal). */
export const DATE_PICKER_FOOTER_CLASSES = cn(
  'flex flex-wrap items-center justify-between gap-2 border-t border-divider-nav px-3 py-2',
  'dark:border-hud-5/30',
  'dark:bg-[linear-gradient(0deg,color-mix(in_srgb,var(--color-primary-5)_8%,transparent),transparent)]',
);

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

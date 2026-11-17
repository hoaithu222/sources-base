import { memo, useMemo } from 'react';
import dayjs from 'dayjs';
import { cn } from '@/shared/utils/style/cn';
import { MONTH_LABELS } from '../month-labels.constants';
import { PICKER_CELL_HUD_CLASSES } from '../picker-cell.theme';
import { slotKey } from './month-window.utils';

interface MonthGridProps {
  year: number;
  startKey: number;
  endKey: number;
  onPick: (monthIdx: number) => void;
  onHover?: (monthIdx: number | null) => void;
  className?: string;
}

type MonthCellState = 'idle' | 'current' | 'inRange' | 'edge';

const MONTH_GRID_ROOT_CLASSES = 'grid grid-cols-3 gap-1';

const MONTH_GRID_CELL_BASE_CLASSES = cn(
  'h-8 w-full cursor-pointer tabular-nums touch:h-10',
  'transition-[color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const MONTH_GRID_CELL_STATE_CLASSES = {
  idle: cn(
    'text-caption-12-medium text-fg-on-chrome hover:bg-primary-5/10',
    PICKER_CELL_HUD_CLASSES.hover,
  ),
  current: cn(
    'text-caption-12-semibold text-link hover:bg-primary-5/10',
    'shadow-[inset_0_0_0_1px_var(--color-primary-5)]',
    PICKER_CELL_HUD_CLASSES.current,
    PICKER_CELL_HUD_CLASSES.hover,
  ),
  inRange: cn(
    'bg-primary-5/15 text-caption-12-medium text-fg-on-chrome hover:bg-primary-5/25',
    PICKER_CELL_HUD_CLASSES.inRange,
    PICKER_CELL_HUD_CLASSES.hover,
  ),
  edge: cn(
    'bg-primary-6 text-caption-12-semibold text-neutral-0 hover:bg-primary-7',
    PICKER_CELL_HUD_CLASSES.selected,
  ),
} satisfies Record<MonthCellState, string>;

function monthCellStateOf(
  key: number,
  startKey: number,
  endKey: number,
  currentKey: number,
): MonthCellState {
  if (key === startKey || key === endKey) return 'edge';
  if (key > startKey && key < endKey) return 'inRange';
  return key === currentKey ? 'current' : 'idle';
}

/**
 * MonthGrid — lưới 12 tháng (3 cột × 4 hàng) của một năm, tô mốc đầu / cuối và các tháng nằm giữa; dùng
 * chung cho 3 picker THÁNG.
 *
 * Helper NỘI BỘ của `pickers/month`: chỉ lo phần HÌNH, caller tự tính `startKey` / `endKey` vì mỗi picker
 * hiểu "khoảng" một kiểu (khoá = `slotKey(monthIdx, year)` trong `month-window.utils.ts`).
 * Sửa giao diện: ô → `MONTH_GRID_CELL_BASE_CLASSES` · trạng thái → `MONTH_GRID_CELL_STATE_CLASSES` (`idle` ·
 * `current` = tháng này, viền trong 1px · `inRange` · `edge` = hai mốc, mang `aria-pressed`).
 *
 * @param props.year - Năm của lưới đang hiện.
 * @param props.startKey - Khoá tháng đầu khoảng (`slotKey`), tô như mốc.
 * @param props.endKey - Khoá tháng cuối khoảng (`slotKey`), tô như mốc; bằng `startKey` = khoảng 1 tháng.
 * @param props.onPick - Gọi với chỉ số tháng 0..11 được bấm.
 * @param props.onHover - Rê chuột vào ô (chỉ số 0..11) để xem trước khoảng; `null` khi rời ô.
 * @param props.className - Class thêm cho lưới.
 *
 * @example
 * <MonthGrid year={2026} startKey={slotKey(2, 2026)} endKey={slotKey(6, 2026)} onPick={pick} />
 */
export const MonthGrid = memo(function MonthGrid({
  year,
  startKey,
  endKey,
  onPick,
  onHover,
  className,
}: MonthGridProps) {
  const currentKey = useMemo(() => {
    const now = dayjs();
    return slotKey(now.month(), now.year());
  }, []);

  return (
    <div className={cn(MONTH_GRID_ROOT_CLASSES, className)}>
      {MONTH_LABELS.map(({ short: label }, i) => {
        const key = slotKey(i, year);
        const state = monthCellStateOf(key, startKey, endKey, currentKey);
        return (
          <button
            key={label}
            aria-pressed={state === 'edge'}
            className={cn(MONTH_GRID_CELL_BASE_CLASSES, MONTH_GRID_CELL_STATE_CLASSES[state])}
            type="button"
            onClick={() => onPick(i)}
            onMouseEnter={() => onHover?.(i)}
            onMouseLeave={() => onHover?.(null)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
});

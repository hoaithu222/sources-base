import { memo, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/style/cn';

interface TimeColumnProps {
  label: string;
  items: number[];
  value: number | null;
  onPick: (n: number) => void;
  className?: string;
}

type TimeCellState = 'selected' | 'idle';

const CELL_H = 36;

const TIME_COLUMN_CLASSES = {
  root: 'flex min-w-0 flex-1 flex-col',
  label:
    'border-b border-divider-nav px-3 py-2 text-center text-caption-12-medium text-fg-on-chrome-muted',
  list: 'max-h-[200px] overflow-y-auto px-1 py-1',
};

const TIME_COLUMN_CELL_BASE_CLASSES = cn(
  'flex h-9 w-full cursor-pointer items-center justify-center rounded-sm tabular-nums',
  'transition-[color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const TIME_COLUMN_CELL_STATE_CLASSES = {
  selected: 'bg-primary-6 text-body-14-semibold text-neutral-0 hover:bg-primary-7',
  idle: 'text-body-14 text-fg-on-chrome hover:bg-primary-5/10',
} satisfies Record<TimeCellState, string>;

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * TimeColumn — một cột số cuộn được (Giờ hoặc Phút) trong panel của `TimePicker`; ô đang chọn tự cuộn
 * vào giữa mỗi lần panel mở.
 *
 * Helper NỘI BỘ của `pickers/time`. Cột của `DateTimePicker` là thiết kế khác (`date-time-picker-column.tsx`).
 * Sửa giao diện: khung / tiêu đề / vùng cuộn → `TIME_COLUMN_CLASSES` · ô → `TIME_COLUMN_CELL_*`.
 * Lưu ý: `CELL_H` (36) PHẢI khớp `h-9` của ô (dùng tính `scrollTop`); cuộn bằng `scrollTop`, KHÔNG
 * `scrollIntoView`; lăn chuột do listener `wheel` non-passive tự cuộn. Lý do: notes/components/pickers.md.
 *
 * @param props.label - Tiêu đề cột (vd `'Giờ'`, `'Phút'`).
 * @param props.items - Các số trong cột (vd `0..23`, hoặc phút theo `minuteStep`).
 * @param props.value - Số đang chọn; `null` khi chưa có giá trị.
 * @param props.onPick - Gọi với số được bấm.
 * @param props.className - Class thêm cho khung cột (vd viền ngăn hai cột).
 *
 * @example
 * <TimeColumn items={hours} label="Giờ" value={selHour} onPick={pickHour} />
 */
export const TimeColumn = memo(function TimeColumn({
  label,
  items,
  value,
  onPick,
  className,
}: TimeColumnProps) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const attachList = useCallback((node: HTMLDivElement | null) => {
    listRef.current = node;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      node.scrollTop += event.deltaY;
      event.preventDefault();
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      node.removeEventListener('wheel', onWheel);
      listRef.current = null;
    };
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || value == null) return;
    const idx = items.indexOf(value);
    if (idx < 0) return;
    list.scrollTop = Math.max(0, idx * CELL_H - (list.clientHeight - CELL_H) / 2);
  }, [items, value]);

  return (
    <div className={cn(TIME_COLUMN_CLASSES.root, className)}>
      <span className={TIME_COLUMN_CLASSES.label}>{label}</span>
      <div ref={attachList} className={TIME_COLUMN_CLASSES.list}>
        {items.map((n) => (
          <button
            key={n}
            aria-pressed={n === value}
            className={cn(
              TIME_COLUMN_CELL_BASE_CLASSES,
              TIME_COLUMN_CELL_STATE_CLASSES[n === value ? 'selected' : 'idle'],
            )}
            type="button"
            onClick={() => onPick(n)}
          >
            {pad2(n)}
          </button>
        ))}
      </div>
    </div>
  );
});

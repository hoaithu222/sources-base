import { memo, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/shared/utils/style/cn';

interface DateTimePickerColumnProps {
  label: string;
  items: number[];
  value: number;
  onPick: (n: number) => void;
}

type ColumnCellState = 'selected' | 'idle';

const DATE_TIME_PICKER_COLUMN_CLASSES = {
  root: 'scrollbar-hidden relative flex h-full min-w-0 flex-col overflow-y-auto bg-bg-input',
  label: cn(
    'sticky top-0 z-10 py-1 text-center',
    'text-caption-10-bold uppercase tracking-widest text-fg-on-chrome-muted',
    'border-b border-divider-nav bg-bg-subtle',
  ),
};

const DATE_TIME_PICKER_COLUMN_CELL_BASE_CLASSES = cn(
  'w-full shrink-0 cursor-pointer border-l-2 py-2 text-center tabular-nums',
  'transition-[color,border-color,background-color,box-shadow] duration-150 ease-out',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring-focus',
);

const DATE_TIME_PICKER_COLUMN_CELL_STATE_CLASSES = {
  selected: cn(
    'border-primary-6 bg-primary-6 text-caption-12-semibold text-neutral-0',
    'hover:bg-primary-7',
  ),
  idle: cn(
    'border-transparent text-caption-12 text-fg-on-chrome',
    'hover:border-primary-5/60 hover:bg-primary-5/10',
  ),
} satisfies Record<ColumnCellState, string>;

const pad2 = (n: number) => n.toString().padStart(2, '0');

/**
 * DateTimePickerColumn — cột Giờ hoặc Phút của `DateTimePicker`: cao hết vùng cột, tiêu đề dính khi cuộn,
 * ô đang chọn tự cuộn vào giữa.
 *
 * Helper NỘI BỘ, KHÔNG dùng chung với `time/time-column.tsx` (cột rời của TimePicker — thiết kế khác).
 * Sửa giao diện: khung / tiêu đề → `DATE_TIME_PICKER_COLUMN_CLASSES` · ô → `DATE_TIME_PICKER_COLUMN_CELL_*`.
 * Lưu ý: cuộn bằng `scrollTop` (không `scrollIntoView`) và tự cuộn khi lăn chuột bằng listener `wheel`
 * non-passive có `preventDefault` — giữ GIỐNG `time-column.tsx`. Lý do: notes/components/pickers.md.
 *
 * @param props.label - Tiêu đề dính đầu cột (vd `'Giờ'`, `'Phút'`).
 * @param props.items - Các số trong cột (vd `0..23`, hoặc phút theo `minuteStep`).
 * @param props.value - Số đang chọn (tô nền, cuộn vào giữa).
 * @param props.onPick - Gọi với số được bấm.
 *
 * @example
 * <DateTimePickerColumn items={HOURS} label="Giờ" value={draft.hour()} onPick={handleHour} />
 */
export const DateTimePickerColumn = memo(function DateTimePickerColumn({
  label,
  items,
  value,
  onPick,
}: DateTimePickerColumnProps) {
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
    const el = list?.querySelector<HTMLElement>(`[data-val="${value}"]`);
    if (!list || !el) return;
    list.scrollTop = Math.max(0, el.offsetTop - (list.clientHeight - el.offsetHeight) / 2);
  }, [value]);

  return (
    <div ref={attachList} className={DATE_TIME_PICKER_COLUMN_CLASSES.root}>
      <div className={DATE_TIME_PICKER_COLUMN_CLASSES.label}>{label}</div>
      {items.map((n) => (
        <button
          key={n}
          aria-pressed={n === value}
          className={cn(
            DATE_TIME_PICKER_COLUMN_CELL_BASE_CLASSES,
            DATE_TIME_PICKER_COLUMN_CELL_STATE_CLASSES[n === value ? 'selected' : 'idle'],
          )}
          data-val={n}
          type="button"
          onClick={() => onPick(n)}
        >
          {pad2(n)}
        </button>
      ))}
    </div>
  );
});

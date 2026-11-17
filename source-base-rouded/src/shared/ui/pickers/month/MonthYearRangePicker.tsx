import { memo, useCallback, useMemo, useState } from 'react';
import Popover from '@/shared/ui/overlays/Popover';
import Text from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';
import { PickerTrigger } from '../picker-trigger';
import { MonthGrid } from './month-grid';
import { MONTH_PICKER_CLASSES } from './month-picker.theme';
import { slotKey } from './month-window.utils';
import { YearNav } from './year-nav';

export interface MonthYearRangeValue {
  /** `month`: 1..12 */
  from: { month: number; year: number };
  to: { month: number; year: number };
}

export interface MonthYearRangePickerProps {
  value: MonthYearRangeValue;
  onChange: (next: MonthYearRangeValue) => void;
  error?: string;
  triggerWidth?: number;
  fullWidth?: boolean;
}

const fmt = (m: number, y: number) => `T${m}/${y}`;

/**
 * MonthYearRangePicker — chọn khoảng tháng / năm (từ → đến) VẮT NHIỀU NĂM, năm điều hướng tự do.
 *
 * Khoảng gọn trong một năm với danh sách năm cố định → `MonthRangeFilter`; cửa sổ N tháng từ một mốc →
 * `MonthYearStartPicker`.
 * Sửa giao diện: trigger → `pickers/picker-trigger.tsx` · popover → `month-picker.theme.ts` · ô tháng →
 * `month-grid.tsx` · ◀ năm ▶ → `year-nav.tsx`.
 * Lưu ý: `month` là 1..12. Chọn 2 nhịp: tháng đầu (năm A) → đổi năm bằng ◀ ▶ → tháng cuối (năm B) thì chốt
 * + đóng (chỉ gọi `onChange` ở nhịp hai); bấm tháng NHỎ HƠN mốc đang chờ = bắt đầu lại.
 *
 * @param props.value - Khoảng đang chọn `{ from: { month, year }, to: { month, year } }`, `month` 1..12.
 * @param props.onChange - Gọi với khoảng mới khi đủ 2 mốc.
 * @param props.error - Thông báo lỗi: có → viền đỏ + chữ lỗi dưới trigger.
 * @param props.triggerWidth - Bề rộng trigger (px); bỏ qua khi `fullWidth`. Mặc định `240`.
 * @param props.fullWidth - `true` → trigger rộng 100% khung chứa. Mặc định `false`.
 *
 * @example
 * <MonthYearRangePicker
 *   value={{ from: { month: 11, year: 2025 }, to: { month: 3, year: 2026 } }}
 *   onChange={setPeriod}
 * />
 */
const MonthYearRangePicker = memo(function MonthYearRangePicker({
  value,
  onChange,
  error,
  triggerWidth = 240,
  fullWidth = false,
}: MonthYearRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(value.from.year);
  const [hover, setHover] = useState<{ monthIdx: number; year: number } | null>(null);
  const [pendingFrom, setPendingFrom] = useState<{
    monthIdx: number;
    year: number;
  } | null>(null);

  const triggerLabel = `${fmt(value.from.month, value.from.year)} – ${fmt(value.to.month, value.to.year)}`;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) setDisplayYear(value.from.year);
      if (!next) {
        setHover(null);
        setPendingFrom(null);
      }
    },
    [value.from.year],
  );

  const handleYearStep = useCallback((dir: -1 | 1) => setDisplayYear((y) => y + dir), []);

  const handleMonthClick = useCallback(
    (monthIdx: number) => {
      const clicked = { monthIdx, year: displayYear };
      const clickedKey = slotKey(clicked.monthIdx, clicked.year);

      if (pendingFrom === null) {
        setPendingFrom(clicked);
        return;
      }

      const fromKey = slotKey(pendingFrom.monthIdx, pendingFrom.year);
      if (clickedKey < fromKey) {
        setPendingFrom(clicked);
        return;
      }

      onChange({
        from: { month: pendingFrom.monthIdx + 1, year: pendingFrom.year },
        to: { month: clicked.monthIdx + 1, year: clicked.year },
      });
      setPendingFrom(null);
      setHover(null);
      setOpen(false);
    },
    [displayYear, pendingFrom, onChange],
  );

  const { startKey, endKey } = useMemo(() => {
    if (pendingFrom !== null) {
      const fromKey = slotKey(pendingFrom.monthIdx, pendingFrom.year);
      const hoverKey = hover !== null ? slotKey(hover.monthIdx, hover.year) : fromKey;
      return { startKey: fromKey, endKey: Math.max(fromKey, hoverKey) };
    }
    return {
      startKey: slotKey(value.from.month - 1, value.from.year),
      endKey: slotKey(value.to.month - 1, value.to.year),
    };
  }, [pendingFrom, hover, value]);

  const triggerClassName = cn(MONTH_PICKER_CLASSES.trigger, fullWidth && 'w-full');

  return (
    <div className={cn(MONTH_PICKER_CLASSES.root, fullWidth && 'w-full')}>
      <Popover
        align="end"
        content={
          <div className={MONTH_PICKER_CLASSES.content}>
            <YearNav className="mb-3" year={displayYear} onStep={handleYearStep} />

            <MonthGrid
              endKey={endKey}
              startKey={startKey}
              year={displayYear}
              onHover={(i) => setHover(i === null ? null : { monthIdx: i, year: displayYear })}
              onPick={handleMonthClick}
            />

            <p className={MONTH_PICKER_CLASSES.hint}>
              {pendingFrom ? 'Chọn tháng kết thúc — điều hướng năm nếu cần' : 'Chọn tháng bắt đầu'}
            </p>
          </div>
        }
        open={open}
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onOpenChange={handleOpenChange}
      >
        <PickerTrigger
          className={triggerClassName}
          disabled={false}
          displayText={triggerLabel}
          iconSide="end"
          invalid={Boolean(error)}
          open={open}
          style={fullWidth ? undefined : { width: triggerWidth }}
        />
      </Popover>

      {error && (
        <Text size="extraTiny" skin="error">
          {error}
        </Text>
      )}
    </div>
  );
});

export default MonthYearRangePicker;

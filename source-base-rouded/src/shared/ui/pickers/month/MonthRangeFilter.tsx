import { memo, useCallback, useMemo, useState } from 'react';
import Popover from '@/shared/ui/overlays/Popover';
import Text from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';
import { PickerTrigger } from '../picker-trigger';
import { MonthGrid } from './month-grid';
import { MONTH_PICKER_CLASSES } from './month-picker.theme';
import { slotKey } from './month-window.utils';
import { YearNav } from './year-nav';

export interface MonthRangeFilterValue {
  /** 0..11 */
  monthFrom: number;
  /** 0..11 */
  monthTo: number;
  year: number;
}

export interface MonthRangeFilterProps extends MonthRangeFilterValue {
  years: number[];
  onChange: (next: MonthRangeFilterValue) => void;
  triggerWidth?: number;
  fullWidth?: boolean;
  error?: string;
  className?: string;
}

/**
 * MonthRangeFilter — bộ lọc khoảng tháng TRONG MỘT NĂM ("T3/2026 - T7/2026"); năm đi theo DANH SÁCH `years`.
 *
 * Khoảng vắt nhiều năm → `MonthYearRangePicker`; cửa sổ N tháng từ một mốc → `MonthYearStartPicker`;
 * khoảng ngày → `RangeDatePicker`.
 * Sửa giao diện: trigger → `pickers/picker-trigger.tsx` · popover → `month-picker.theme.ts` · ô tháng →
 * `month-grid.tsx` · ◀ năm ▶ → `year-nav.tsx`.
 * Lưu ý: `monthFrom` / `monthTo` là 0..11 (khác hai anh em dùng 1..12). Chọn 2 nhịp: nhịp đầu gọi ngay
 * `onChange` với khoảng 1 tháng, nhịp hai chốt + đóng; bấm tháng NHỎ HƠN mốc đang chờ = bắt đầu lại.
 * Đổi năm GIỮ khoảng tháng; ◀ ▶ tắt ở đầu / cuối `years`.
 * Lý do thiết kế: docs/notes/components/pickers.md (## MonthRangeFilter).
 *
 * @param props.monthFrom - Tháng đầu khoảng, 0..11 (0 = tháng 1).
 * @param props.monthTo - Tháng cuối khoảng, 0..11, không nhỏ hơn `monthFrom`.
 * @param props.year - Năm đang lọc; nên nằm trong `years` để ◀ ▶ hoạt động.
 * @param props.years - Các năm có dữ liệu, tăng dần (vd `[2025, 2026, 2027]`).
 * @param props.onChange - Gọi với `{ monthFrom, monthTo, year }` mới (bấm tháng, đổi năm).
 * @param props.triggerWidth - Bề rộng trigger (px); bỏ qua khi `fullWidth`. Mặc định `240`.
 * @param props.fullWidth - `true` → trigger chiếm trọn bề ngang khung chứa. Mặc định `false`.
 * @param props.error - Thông báo lỗi: có → viền đỏ + chữ lỗi dưới trigger.
 * @param props.className - Class thêm cho khối bọc ngoài (trigger + chữ lỗi).
 *
 * @example
 * <MonthRangeFilter monthFrom={2} monthTo={6} year={2026} years={[2025, 2026]} onChange={setFilter} />
 */
const MonthRangeFilter = memo(function MonthRangeFilter({
  monthFrom,
  monthTo,
  year,
  years,
  onChange,
  triggerWidth = 240,
  fullWidth = false,
  error,
  className,
}: MonthRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [pendingFrom, setPendingFrom] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const yearIdx = useMemo(() => years.indexOf(year), [years, year]);
  const canPrev = yearIdx > 0;
  const canNext = yearIdx >= 0 && yearIdx < years.length - 1;

  const display = `T${monthFrom + 1}/${year} - T${monthTo + 1}/${year}`;

  const handleYearStep = useCallback(
    (dir: -1 | 1) => {
      const next = years[yearIdx + dir];
      if (next === undefined) return;
      onChange({ monthFrom, monthTo, year: next });
    },
    [monthFrom, monthTo, onChange, yearIdx, years],
  );

  const handlePick = useCallback(
    (idx: number) => {
      if (pendingFrom === null || idx < pendingFrom) {
        setPendingFrom(idx);
        onChange({ monthFrom: idx, monthTo: idx, year });
        return;
      }
      onChange({ monthFrom: pendingFrom, monthTo: idx, year });
      setPendingFrom(null);
      setHoverIdx(null);
      setOpen(false);
    },
    [pendingFrom, year, onChange],
  );

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setPendingFrom(null);
      setHoverIdx(null);
    }
  }, []);

  const { startKey, endKey } = useMemo(() => {
    if (pendingFrom !== null) {
      const to = hoverIdx !== null && hoverIdx > pendingFrom ? hoverIdx : pendingFrom;
      return { startKey: slotKey(pendingFrom, year), endKey: slotKey(to, year) };
    }
    return { startKey: slotKey(monthFrom, year), endKey: slotKey(monthTo, year) };
  }, [pendingFrom, hoverIdx, monthFrom, monthTo, year]);

  const triggerClassName = cn(MONTH_PICKER_CLASSES.trigger, fullWidth && 'w-full');

  return (
    <div className={cn(MONTH_PICKER_CLASSES.root, fullWidth && 'w-full', className)}>
      <Popover
        align="end"
        content={
          <div className={MONTH_PICKER_CLASSES.content}>
            <YearNav
              canNext={canNext}
              canPrev={canPrev}
              className="mb-3"
              year={year}
              onStep={handleYearStep}
            />

            <MonthGrid
              endKey={endKey}
              startKey={startKey}
              year={year}
              onHover={setHoverIdx}
              onPick={handlePick}
            />

            <p className={MONTH_PICKER_CLASSES.hint}>
              {pendingFrom === null ? 'Chọn tháng bắt đầu' : 'Chọn tháng kết thúc'}
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
          displayText={display}
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

export default MonthRangeFilter;

'use client';

import { memo, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import Popover from '@/shared/ui/overlays/Popover';
import Text from '@/shared/ui/primitives/Text';
import { cn } from '@/shared/utils/style/cn';
import { PickerTrigger } from '../picker-trigger';
import { useCalendarLabels } from '../useCalendarLabels';
import { MonthGrid } from './month-grid';
import { MONTH_PICKER_CLASSES } from './month-picker.theme';
import { buildMonthWindow, slotKey } from './month-window.utils';
import { YearNav } from './year-nav';

export interface MonthYearStartValue {
  /** 1..12 */
  month: number;
  year: number;
}

export interface MonthYearStartPickerProps {
  value: MonthYearStartValue;
  onChange: (next: MonthYearStartValue) => void;
  span?: number;
  error?: string;
  triggerWidth?: number;
  fullWidth?: boolean;
}

/**
 * MonthYearStartPicker — chọn tháng BẮT ĐẦU của cửa sổ N tháng liên tiếp (mặc định 12 tháng cuốn chiếu).
 *
 * Khoảng tuỳ ý vắt năm → `MonthYearRangePicker`; khoảng trong một năm → `MonthRangeFilter`.
 * Sửa giao diện: trigger → `pickers/picker-trigger.tsx` · popover → `month-picker.theme.ts` · ô tháng →
 * `month-grid.tsx` · ◀ năm ▶ → `year-nav.tsx` · tính cửa sổ → `month-window.utils.ts`.
 * Lưu ý: bấm 1 tháng là chốt + đóng; rê chuột tô trước N ô liền nhau (vắt năm). Trigger
 * "T{m}/{Y} – T{m'}/{Y'}" chỉ để đọc, không gõ được. `span` bị kẹp trong 1..36.
 *
 * @param props.value - Tháng bắt đầu `{ month, year }`, `month` 1..12.
 * @param props.onChange - Gọi với tháng bắt đầu mới khi bấm một ô tháng.
 * @param props.span - Số tháng của cửa sổ (1..36). Mặc định `12`.
 * @param props.error - Thông báo lỗi: có → viền đỏ + chữ lỗi dưới trigger.
 * @param props.triggerWidth - Bề rộng trigger (px); bỏ qua khi `fullWidth`. Mặc định `240`.
 * @param props.fullWidth - `true` → trigger rộng 100% khung chứa. Mặc định `false`.
 *
 * @example
 * <MonthYearStartPicker value={{ month: 7, year: 2025 }} onChange={setStart} span={6} />
 */
const MonthYearStartPicker = memo(function MonthYearStartPicker({
  value,
  onChange,
  span = 12,
  error,
  triggerWidth = 240,
  fullWidth = false,
}: MonthYearStartPickerProps) {
  const t = useTranslations('ui.pickers');
  const { monthYear } = useCalendarLabels();
  const [open, setOpen] = useState(false);
  const [displayYear, setDisplayYear] = useState(value.year);
  const [hover, setHover] = useState<number | null>(null);

  const monthWindow = buildMonthWindow(value.month, value.year, span);
  const lastSlot = monthWindow.slots[monthWindow.slots.length - 1];
  const firstSlot = monthWindow.slots[0];
  const triggerLabel = `${monthYear(firstSlot.monthIdx + 1, firstSlot.year)} – ${monthYear(lastSlot.monthIdx + 1, lastSlot.year)}`;

  const previewMonth = hover !== null ? hover + 1 : value.month;
  const previewYear = hover !== null ? displayYear : value.year;
  const previewWindow = buildMonthWindow(previewMonth, previewYear, span);
  const startKey = slotKey(previewWindow.slots[0].monthIdx, previewWindow.slots[0].year);
  const endKey = slotKey(
    previewWindow.slots[previewWindow.slots.length - 1].monthIdx,
    previewWindow.slots[previewWindow.slots.length - 1].year,
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) setDisplayYear(value.year);
      if (!next) setHover(null);
    },
    [value.year],
  );

  const handleYearStep = useCallback((dir: -1 | 1) => setDisplayYear((y) => y + dir), []);

  const handleMonthClick = useCallback(
    (monthIdx: number) => {
      onChange({ month: monthIdx + 1, year: displayYear });
      setHover(null);
      setOpen(false);
    },
    [displayYear, onChange],
  );

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
              onHover={setHover}
              onPick={handleMonthClick}
            />

            <p className={MONTH_PICKER_CLASSES.hint}>{t('month.pickStartWindow', { span })}</p>
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

export default MonthYearStartPicker;

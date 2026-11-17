import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { TIMESHEET_CODES } from '../../constants/timesheet.constants';
import { formatDayMonth, weekdayLong } from '../../utils/ops-date.utils';
import type { DayEntry, DayInfo } from '../../utils/timesheet.utils';
import { TIMESHEET_CELL_CLASSES, TIMESHEET_CODE_CLASSES } from './timesheet.theme';

interface TimesheetDayCellProps {
  entry: DayEntry;
  day: DayInfo;
  employeeName: string;
}

const CODE_META = new Map(TIMESHEET_CODES.map((meta) => [meta.code, meta]));

function describe(entry: DayEntry, day: DayInfo, employeeName: string): string {
  const date = `${weekdayLong(day.index)} ${formatDayMonth(day.index)}`;
  if (entry.code === null) return `${employeeName} · ${date}: chưa chấm công`;
  const parts = [CODE_META.get(entry.code)?.label ?? entry.code];
  if (entry.otHours > 0) parts.push(`tăng ca ${entry.otHours} giờ`);
  if (entry.lateMinutes > 0) parts.push(`đi muộn ${entry.lateMinutes} phút`);
  return `${employeeName} · ${date}: ${parts.join(' · ')}`;
}

/**
 * TimesheetDayCell — ô công một người × một ngày: viên ký hiệu (X · T · ½ · P · KP · L) tô theo loại, chấm cam góc phải
 * khi đi muộn, Chủ nhật nghỉ để trống (nền cột đã tô), ngày chưa tới hiện "·" mờ. `title` đọc đủ: tên · thứ ngày · loại
 * công · giờ tăng ca · phút đi muộn.
 *
 * @param props.entry - Công của ngày (`DayEntry`).
 * @param props.day - Thông tin ngày (thứ, Chủ nhật, tương lai…).
 * @param props.employeeName - Tên nhân viên — ghép vào `title` của ô.
 *
 * @example
 * <TimesheetDayCell day={days[4]} employeeName={row.employee.name} entry={row.entries[4]} />
 */
const TimesheetDayCell = memo(function TimesheetDayCell({
  entry,
  day,
  employeeName,
}: TimesheetDayCellProps) {
  const title = describe(entry, day, employeeName);

  if (entry.code === null) {
    return (
      <span className={TIMESHEET_CELL_CLASSES.root} title={title}>
        <span className={TIMESHEET_CELL_CLASSES.pending}>·</span>
      </span>
    );
  }

  return (
    <span aria-label={title} className={TIMESHEET_CELL_CLASSES.root} title={title}>
      {entry.code !== 'CN' && (
        <span className={cn(TIMESHEET_CELL_CLASSES.chip, TIMESHEET_CODE_CLASSES[entry.code])}>
          {CODE_META.get(entry.code)?.glyph}
          {entry.lateMinutes > 0 && <span className={TIMESHEET_CELL_CLASSES.late} />}
        </span>
      )}
    </span>
  );
});

export default TimesheetDayCell;

import { memo } from 'react';

import { cn } from '@/shared/utils/style/cn';

import { formatDayMonth, weekdayLong } from '../../utils/ops-date.utils';
import type { DayInfo } from '../../utils/timesheet.utils';
import { TIMESHEET_HEAD_CLASSES } from './timesheet.theme';

interface TimesheetDayHeaderProps {
  day: DayInfo;
}

/**
 * TimesheetDayHeader — header một cột ngày của bảng công: số ngày (hôm nay nằm trong chấm đặc màu nhấn) và thứ viết tắt
 * bên dưới (Chủ nhật chữ đỏ như lịch). `title` là thứ + ngày đầy đủ.
 *
 * @param props.day - Thông tin ngày (`DayInfo`).
 *
 * @example
 * { key: 'd5', header: <TimesheetDayHeader day={days[4]} /> }
 */
const TimesheetDayHeader = memo(function TimesheetDayHeader({ day }: TimesheetDayHeaderProps) {
  return (
    <span
      className={TIMESHEET_HEAD_CLASSES.root}
      title={`${weekdayLong(day.index)} ${formatDayMonth(day.index)}${day.today ? ' (hôm nay)' : ''}`}
    >
      <span
        className={cn(
          TIMESHEET_HEAD_CLASSES.day,
          day.sunday && TIMESHEET_HEAD_CLASSES.sunday,
          day.today && TIMESHEET_HEAD_CLASSES.today,
        )}
      >
        {day.day}
      </span>
      <span
        className={cn(TIMESHEET_HEAD_CLASSES.weekday, day.sunday && TIMESHEET_HEAD_CLASSES.sunday)}
      >
        {day.weekday}
      </span>
    </span>
  );
});

export default TimesheetDayHeader;

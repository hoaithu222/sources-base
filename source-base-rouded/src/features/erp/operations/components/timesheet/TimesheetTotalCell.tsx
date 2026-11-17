import { memo } from 'react';

import { formatNumber } from '@/shared/utils/format/format.utils';

import type { TimesheetTotals } from '../../utils/timesheet.utils';
import { TIMESHEET_COLUMN_CLASSES } from './timesheet.theme';

interface TimesheetTotalCellProps {
  field: keyof TimesheetTotals;
  value: number;
}

const LATE_ALERT = 3;

function toneOf(field: keyof TimesheetTotals, value: number): string {
  if (value === 0) return TIMESHEET_COLUMN_CLASSES.totalZero;
  if (field === 'lateCount' && value >= LATE_ALERT) return TIMESHEET_COLUMN_CLASSES.totalAlert;
  return field === 'workdays'
    ? TIMESHEET_COLUMN_CLASSES.totalMain
    : TIMESHEET_COLUMN_CLASSES.totalValue;
}

/**
 * TimesheetTotalCell — số trong cột tổng của bảng công (công · phép · tăng ca · đi muộn), dùng cho cả dòng nhân viên lẫn
 * dòng tổng: 0 hiện "–" mờ, cột công đậm, đi muộn từ 3 lần chữ cam; số lẻ vi-VN ("16,5").
 *
 * @param props.field - Trường tổng (`workdays` | `leave` | `absent` | `otHours` | `lateCount`).
 * @param props.value - Giá trị của trường.
 *
 * @example
 * <TimesheetTotalCell field="otHours" value={row.totals.otHours} />
 */
const TimesheetTotalCell = memo(function TimesheetTotalCell({
  field,
  value,
}: TimesheetTotalCellProps) {
  return (
    <span className={toneOf(field, value)}>{value === 0 ? '–' : formatNumber(value, 1, 0)}</span>
  );
});

export default TimesheetTotalCell;

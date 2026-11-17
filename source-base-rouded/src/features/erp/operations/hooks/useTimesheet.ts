import { useCallback, useMemo, useState } from 'react';

import { OPS_TODAY } from '../constants/operations.constants';
import { TIMESHEET_MONTH_OPTIONS, type DepartmentKey } from '../constants/timesheet.constants';
import { buildTimesheet, filterTimesheetRows, summarizeTimesheet } from '../utils/timesheet.utils';

/**
 * useTimesheet — tháng + phòng ban đang chọn của màn "Chấm công" và số liệu dẫn xuất: bảng công cả tháng (sinh ổn định
 * theo tháng), dòng của phòng ban đang lọc, bốn số KPI. Mặc định tháng đầu danh sách (tháng hiện tại), tất cả phòng ban.
 *
 * @example
 * const { month, selectMonth, department, selectDepartment, sheet, rows, summary } = useTimesheet();
 */
export function useTimesheet() {
  const [month, setMonth] = useState(String(TIMESHEET_MONTH_OPTIONS[0].value));
  const [department, setDepartment] = useState<DepartmentKey | 'all'>('all');

  const selectMonth = useCallback((value: string) => {
    if (value) setMonth(value);
  }, []);
  const selectDepartment = useCallback(
    (value: string) => setDepartment((value || 'all') as DepartmentKey | 'all'),
    [],
  );

  const sheet = useMemo(() => buildTimesheet(month, OPS_TODAY), [month]);
  const rows = useMemo(() => filterTimesheetRows(sheet.rows, department), [sheet, department]);
  const summary = useMemo(() => summarizeTimesheet(rows), [rows]);

  return { month, selectMonth, department, selectDepartment, sheet, rows, summary };
}

import {
  DEPARTMENTS,
  EMPLOYEES,
  SUNDAY_OT_HOURS,
  TIMESHEET_HOLIDAYS,
  type DepartmentKey,
  type Employee,
  type TimesheetCode,
} from '../constants/timesheet.constants';
import { dayIndex, daysInMonth, monthDayIndex, weekdayOf, weekdayShort } from './ops-date.utils';

/**
 * Bảng công tháng của màn "Chấm công": sinh ô công cho 20 nhân viên bằng bộ sinh số giả ngẫu nhiên GIEO theo tháng +
 * nhân viên (cùng tháng → cùng kết quả), cộng tổng từng người, đếm có mặt theo ngày và bốn số KPI. Hàm thuần.
 */

export interface DayInfo {
  day: number;
  index: number;
  weekday: string;
  sunday: boolean;
  holiday: boolean;
  today: boolean;
  /** Ngày sau hôm nay — chưa chấm. */
  future: boolean;
}

export interface DayEntry {
  /** `null` = chưa chấm (ngày tương lai). */
  code: TimesheetCode | null;
  otHours: number;
  lateMinutes: number;
}

export interface TimesheetTotals {
  workdays: number;
  leave: number;
  absent: number;
  otHours: number;
  lateCount: number;
}

export interface TimesheetRow {
  employee: Employee;
  departmentLabel: string;
  entries: DayEntry[];
  totals: TimesheetTotals;
}

export interface TimesheetSheet {
  monthLabel: string;
  days: DayInfo[];
  rows: TimesheetRow[];
  /** Tháng đã qua hết (đã chốt công). */
  closed: boolean;
}

export interface TimesheetSummary {
  headcount: number;
  attendancePct: number;
  otHours: number;
  lateCount: number;
  latePeople: number;
  absentCount: number;
  absentPeople: number;
}

const HALF_DAY_RATE = 0.015;
const HOLIDAYS = new Set(TIMESHEET_HOLIDAYS.map(dayIndex));
const WORKSHOP_DEPARTMENTS = new Set(DEPARTMENTS.filter((d) => d.workshop).map((d) => d.key));
const DEPARTMENT_LABEL = new Map(DEPARTMENTS.map((d) => [d.key, d.label]));

/** Bộ sinh số giả ngẫu nhiên 32-bit (mulberry32) — trả hàm sinh số trong [0, 1). */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const isPresent = (code: TimesheetCode | null) => code === 'X' || code === 'T' || code === 'H';

function entryOf(employee: Employee, day: DayInfo, draws: number[]): DayEntry {
  const [kind, overtime, hours, late, minutes] = draws;
  const blank = { otHours: 0, lateMinutes: 0 };
  if (day.future) return { code: null, ...blank };
  if (day.holiday) return { code: 'L', ...blank };
  if (day.sunday) {
    return kind < employee.sunday
      ? { code: 'T', otHours: SUNDAY_OT_HOURS, lateMinutes: 0 }
      : { code: 'CN', ...blank };
  }
  let code: TimesheetCode = 'X';
  if (day.weekday === 'T7' && !WORKSHOP_DEPARTMENTS.has(employee.department)) code = 'H';
  else if (kind < employee.absent) code = 'KP';
  else if (kind < employee.absent + employee.leave) code = 'P';
  else if (kind < employee.absent + employee.leave + HALF_DAY_RATE) code = 'H';
  else if (overtime < employee.ot) code = 'T';
  return {
    code,
    otHours: code === 'T' ? 2 + Math.floor(hours * 3) : 0,
    lateMinutes: isPresent(code) && late < employee.late ? 5 + Math.floor(minutes * 36) : 0,
  };
}

function totalsOf(entries: DayEntry[], days: DayInfo[]): TimesheetTotals {
  const totals: TimesheetTotals = { workdays: 0, leave: 0, absent: 0, otHours: 0, lateCount: 0 };
  entries.forEach((entry, i) => {
    if (entry.code === 'X' || (entry.code === 'T' && !days[i].sunday)) totals.workdays += 1;
    if (entry.code === 'H') totals.workdays += 0.5;
    if (entry.code === 'P') totals.leave += 1;
    if (entry.code === 'KP') totals.absent += 1;
    totals.otHours += entry.otHours;
    if (entry.lateMinutes > 0) totals.lateCount += 1;
  });
  return totals;
}

/** Bảng công của tháng `monthKey` (`YYYY-MM`) cho toàn bộ nhân viên, chấm tới ngày `today` (ISO). */
export function buildTimesheet(monthKey: string, today: string): TimesheetSheet {
  const [year, month] = monthKey.split('-').map(Number);
  const todayIndex = dayIndex(today);
  const days: DayInfo[] = Array.from({ length: daysInMonth(year, month) }, (_, i) => {
    const index = monthDayIndex(year, month, i + 1);
    return {
      day: i + 1,
      index,
      weekday: weekdayShort(index),
      sunday: weekdayOf(index) === 0,
      holiday: HOLIDAYS.has(index),
      today: index === todayIndex,
      future: index > todayIndex,
    };
  });
  const rows = EMPLOYEES.map((employee, e) => {
    const random = seededRandom(year * 1000 + month * 37 + e * 7919);
    const entries = days.map((day) =>
      entryOf(employee, day, [random(), random(), random(), random(), random()]),
    );
    return {
      employee,
      departmentLabel: DEPARTMENT_LABEL.get(employee.department) ?? '',
      entries,
      totals: totalsOf(entries, days),
    };
  });
  return {
    monthLabel: `${month}/${year}`,
    days,
    rows,
    closed: days[days.length - 1].index < todayIndex,
  };
}

/** Dòng của phòng ban đang lọc (`all` = tất cả). */
export function filterTimesheetRows(
  rows: readonly TimesheetRow[],
  department: DepartmentKey | 'all',
): TimesheetRow[] {
  return rows.filter((row) => department === 'all' || row.employee.department === department);
}

/** Số người có mặt (đi làm · tăng ca · nửa công) từng ngày. */
export function dailyPresence(rows: readonly TimesheetRow[], dayCount: number): number[] {
  return Array.from(
    { length: dayCount },
    (_, i) => rows.filter((row) => isPresent(row.entries[i].code)).length,
  );
}

/** Bốn số KPI: tỉ lệ đi làm · giờ tăng ca · lượt đi muộn · nghỉ không phép (kèm số người). */
export function summarizeTimesheet(rows: readonly TimesheetRow[]): TimesheetSummary {
  let present = 0;
  let away = 0;
  rows.forEach((row) =>
    row.entries.forEach((entry) => {
      if (isPresent(entry.code)) present += 1;
      if (entry.code === 'P' || entry.code === 'KP') away += 1;
    }),
  );
  return {
    headcount: rows.length,
    attendancePct: present + away > 0 ? (present / (present + away)) * 100 : 0,
    otHours: rows.reduce((sum, row) => sum + row.totals.otHours, 0),
    lateCount: rows.reduce((sum, row) => sum + row.totals.lateCount, 0),
    latePeople: rows.filter((row) => row.totals.lateCount > 0).length,
    absentCount: rows.reduce((sum, row) => sum + row.totals.absent, 0),
    absentPeople: rows.filter((row) => row.totals.absent > 0).length,
  };
}

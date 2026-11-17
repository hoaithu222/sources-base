import { memo, useCallback, useMemo } from 'react';

import { BoxPanel, Table, type TableColumn } from '@/shared/ui';
import { cn } from '@/shared/utils/style/cn';

import { dailyPresence, type DayInfo, type TimesheetRow } from '../../utils/timesheet.utils';
import TimesheetDayCell from './TimesheetDayCell';
import TimesheetDayHeader from './TimesheetDayHeader';
import TimesheetLegend from './TimesheetLegend';
import TimesheetTotalCell from './TimesheetTotalCell';
import {
  TIMESHEET_COLUMN_CLASSES,
  TIMESHEET_EMPLOYEE_CLASSES,
  TIMESHEET_HEAD_CLASSES,
  TIMESHEET_LAYOUT_CLASSES,
  TIMESHEET_TOTAL_HEAD_PIN_CLASSES,
  TIMESHEET_TOTAL_PIN_CLASSES,
  type TimesheetTotalKey,
} from './timesheet.theme';

interface TimesheetGridProps {
  monthLabel: string;
  closed: boolean;
  days: readonly DayInfo[];
  rows: readonly TimesheetRow[];
}

interface TotalColumn {
  key: TimesheetTotalKey;
  label: string;
  unit: string;
  width: number;
  hint: string;
}

const TOTALS: readonly TotalColumn[] = [
  { key: 'workdays', label: 'Công', unit: 'ngày', width: 60, hint: 'Công = X + T + ½ × 0,5' },
  { key: 'leave', label: 'Phép', unit: 'ngày', width: 56, hint: 'Số ngày nghỉ phép (P)' },
  { key: 'otHours', label: 'Tăng ca', unit: 'giờ', width: 64, hint: 'Chủ nhật đi làm tính 8 giờ' },
  { key: 'lateCount', label: 'Đi muộn', unit: 'lần', width: 64, hint: 'Từ 3 lần chữ cam' },
];

const ROW_HEIGHT = 40;
const EMPLOYEE_WIDTH = 208;
const DAY_MIN_WIDTH = 28;
const TOTALS_WIDTH = TOTALS.reduce((sum, t) => sum + t.width, 0);
const rowKey = (row: TimesheetRow) => row.employee.id;

const employeeColumn: TableColumn<TimesheetRow> = {
  key: 'employee',
  header: 'Nhân viên',
  width: EMPLOYEE_WIDTH,
  frozen: true,
  cell: (row) => (
    <span className={TIMESHEET_EMPLOYEE_CLASSES.root} title={row.departmentLabel}>
      <span className={TIMESHEET_EMPLOYEE_CLASSES.name}>{row.employee.name}</span>
      <span className={TIMESHEET_EMPLOYEE_CLASSES.meta}>
        {`${row.employee.code} · ${row.employee.title}`}
      </span>
    </span>
  ),
};

const totalColumns = TOTALS.map<TableColumn<TimesheetRow>>((t, i) => ({
  key: t.key,
  header: (
    <span className={TIMESHEET_HEAD_CLASSES.root} title={t.hint}>
      <span className={TIMESHEET_HEAD_CLASSES.label}>{t.label}</span>
      <span className={TIMESHEET_HEAD_CLASSES.weekday}>{t.unit}</span>
    </span>
  ),
  width: t.width,
  align: 'center',
  headerCellClassName: cn(
    TIMESHEET_COLUMN_CLASSES.totalHead,
    TIMESHEET_TOTAL_HEAD_PIN_CLASSES[t.key],
    i === 0 && TIMESHEET_COLUMN_CLASSES.totalFirst,
  ),
  cellClassName: cn(
    TIMESHEET_COLUMN_CLASSES.total,
    TIMESHEET_TOTAL_PIN_CLASSES[t.key],
    i === 0 && TIMESHEET_COLUMN_CLASSES.totalFirst,
  ),
  cell: (row) => <TimesheetTotalCell field={t.key} value={row.totals[t.key]} />,
}));

const dayColumn = (day: DayInfo, i: number): TableColumn<TimesheetRow> => ({
  key: `d${day.day}`,
  header: <TimesheetDayHeader day={day} />,
  align: 'center',
  headerCellClassName: TIMESHEET_COLUMN_CLASSES.day,
  cellClassName: cn(
    TIMESHEET_COLUMN_CLASSES.day,
    day.sunday && TIMESHEET_COLUMN_CLASSES.sunday,
    day.today && TIMESHEET_COLUMN_CLASSES.today,
  ),
  cell: (row) => (
    <TimesheetDayCell day={day} employeeName={row.employee.name} entry={row.entries[i]} />
  ),
});

/**
 * TimesheetGrid — panel "Bảng công tháng": lưới nhân viên × ngày (cột tên + mã NV ghim trái, header ngày dính trên, Chủ
 * nhật tô nền, cột hôm nay nhuộm nhạt), bốn cột tổng bên phải (công · phép · tăng ca giờ · đi muộn) và dòng tổng dính đáy
 * đếm số người có mặt từng ngày. Chú giải ở header panel; hẹp thì lưới cuộn ngang.
 *
 * @param props.monthLabel - Tháng đang xem ("10/2026").
 * @param props.closed - Tháng đã chốt công (đã qua hết).
 * @param props.days - Các ngày của tháng (`DayInfo`).
 * @param props.rows - Dòng nhân viên của phòng ban đang lọc.
 *
 * @example
 * <TimesheetGrid closed={sheet.closed} days={sheet.days} monthLabel={sheet.monthLabel} rows={rows} />
 */
const TimesheetGrid = memo(function TimesheetGrid({
  monthLabel,
  closed,
  days,
  rows,
}: TimesheetGridProps) {
  const data = useMemo(() => [...rows], [rows]);
  const presence = useMemo(() => dailyPresence(rows, days.length), [rows, days.length]);
  const columns = useMemo(() => [employeeColumn, ...days.map(dayColumn), ...totalColumns], [days]);

  const footerCell = useCallback(
    (column: TableColumn<TimesheetRow>) => {
      if (column.key === 'employee') {
        return <span className={TIMESHEET_COLUMN_CLASSES.footLabel}>Có mặt / tổng</span>;
      }
      const total = TOTALS.find((t) => t.key === column.key);
      if (total) {
        const sum = rows.reduce((acc, row) => acc + row.totals[total.key], 0);
        return <TimesheetTotalCell field={total.key} value={sum} />;
      }
      const count = presence[days.findIndex((day) => `d${day.day}` === column.key)] ?? 0;
      return count > 0 ? <span className={TIMESHEET_COLUMN_CLASSES.presence}>{count}</span> : null;
    },
    [days, presence, rows],
  );

  return (
    <BoxPanel
      bodyOverflow="hidden"
      border="hairline"
      className={TIMESHEET_LAYOUT_CLASSES.panel}
      headerDivider
      headerRight={<TimesheetLegend placement="header" />}
      title={
        <h2 className={TIMESHEET_LAYOUT_CLASSES.title}>
          {`Bảng công tháng ${monthLabel} `}
          <span className={TIMESHEET_LAYOUT_CLASSES.note}>
            {`· ${rows.length} nhân viên · ${closed ? 'đã chốt' : 'đang chấm'}`}
          </span>
        </h2>
      }
    >
      <TimesheetLegend placement="strip" />
      <Table
        columnDividers
        columns={columns}
        data={data}
        emptyMessage="Phòng ban này chưa có nhân viên"
        fill
        footerCell={footerCell}
        layout="fixed"
        minWidth={EMPLOYEE_WIDTH + days.length * DAY_MIN_WIDTH + TOTALS_WIDTH}
        pagination={false}
        resizable={false}
        rowHeight={ROW_HEIGHT}
        rowKey={rowKey}
      />
    </BoxPanel>
  );
});

export default TimesheetGrid;

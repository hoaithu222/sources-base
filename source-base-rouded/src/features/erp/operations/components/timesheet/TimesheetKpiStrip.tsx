import { memo } from 'react';

import { SummaryCard } from '@/shared/ui';
import { formatNumber, formatPercent } from '@/shared/utils/format/format.utils';

import type { TimesheetSummary } from '../../utils/timesheet.utils';
import { TIMESHEET_LAYOUT_CLASSES } from './timesheet.theme';

interface TimesheetKpiStripProps {
  summary: TimesheetSummary;
}

const formatPct = (n: number) => formatPercent(n, 1);
const formatHours = (n: number) => `${formatNumber(n)} giờ`;
const formatTimes = (n: number) => `${formatNumber(n)} lượt`;
const formatDays = (n: number) => `${formatNumber(n)} ngày`;

/**
 * TimesheetKpiStrip — bốn thẻ KPI đầu màn "Chấm công" cho tháng + phòng ban đang chọn: tỉ lệ đi làm · giờ tăng ca · lượt
 * đi muộn · nghỉ không phép. Dòng phụ ngắn, số đứng đầu.
 *
 * @param props.summary - Số KPI đã tính (`summarizeTimesheet`).
 *
 * @example
 * <TimesheetKpiStrip summary={summary} />
 */
const TimesheetKpiStrip = memo(function TimesheetKpiStrip({ summary }: TimesheetKpiStripProps) {
  const otPerHead = summary.headcount > 0 ? summary.otHours / summary.headcount : 0;

  return (
    <section aria-label="Chỉ số chấm công" className={TIMESHEET_LAYOUT_CLASSES.kpis}>
      <SummaryCard
        color="green"
        description={`${summary.headcount} nhân viên, trừ phép và không phép`}
        gemSize="xs"
        icon="user-check-bold"
        label="Tỉ lệ đi làm"
        value={summary.attendancePct}
        valueFormat={formatPct}
      />
      <SummaryCard
        color="blue"
        description={`${formatNumber(otPerHead, 1)} giờ / người`}
        gemSize="xs"
        icon="clock-bold"
        label="Giờ tăng ca"
        value={summary.otHours}
        valueFormat={formatHours}
      />
      <SummaryCard
        color="yellow"
        description={`${summary.latePeople} người có đi muộn`}
        gemSize="xs"
        icon="calendar-clock-bold"
        label="Đi muộn"
        value={summary.lateCount}
        valueFormat={formatTimes}
      />
      <SummaryCard
        color={summary.absentCount > 0 ? 'red' : 'gray'}
        description={
          summary.absentCount > 0
            ? `${summary.absentPeople} người cần nhắc nhở`
            : 'Không có trường hợp nào'
        }
        gemSize="xs"
        icon="ban-bold"
        label="Nghỉ không phép"
        value={summary.absentCount}
        valueFormat={formatDays}
      />
    </section>
  );
});

export default TimesheetKpiStrip;

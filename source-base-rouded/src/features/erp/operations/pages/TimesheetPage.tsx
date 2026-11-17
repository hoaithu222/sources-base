import { Dropdown, PageBody, PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import TimesheetGrid from '../components/timesheet/TimesheetGrid';
import TimesheetKpiStrip from '../components/timesheet/TimesheetKpiStrip';
import { OPS_UPDATED_LABEL } from '../constants/operations.constants';
import { DEPARTMENT_OPTIONS, TIMESHEET_MONTH_OPTIONS } from '../constants/timesheet.constants';
import { useTimesheet } from '../hooks/useTimesheet';

/**
 * TimesheetPage — màn `/nhan-su/cham-cong` ("Chấm công"): chọn tháng + phòng ban là `PageHeader filters` (cột icon
 * dọc nổi sát mép phải; điện thoại gom vào nút phễu — không hàng riêng), một hàng bốn KPI (tỉ lệ đi làm · giờ tăng ca · đi muộn · nghỉ không phép), bảng
 * công nhân viên × ngày lấp phần chiều cao còn lại (chú giải ở header panel, cột tổng ghim phải, dòng có mặt theo
 * ngày dính đáy).
 * Lưu ý: số liệu mẫu sinh ổn định theo tháng, tháng hiện tại chỉ chấm tới `OPS_TODAY` (không gọi API); bảng tự
 * cuộn hai chiều, trang không cuộn từ laptop trở lên.
 */
export default function TimesheetPage() {
  const { month, selectMonth, department, selectDepartment, sheet, rows, summary } = useTimesheet();
  const labelOf = (options: readonly { value: string | number; label: string }[], value: string) =>
    options.find((option) => String(option.value) === value)?.label;

  return (
    <PageShell>
      <PageHeader
        filters={[
          {
            key: 'month',
            label: 'Tháng chấm công',
            icon: 'calendar-outline',
            value: labelOf(TIMESHEET_MONTH_OPTIONS, month),
            active: month !== String(TIMESHEET_MONTH_OPTIONS[0].value),
            content: (
              <Dropdown
                aria-label="Tháng chấm công"
                options={TIMESHEET_MONTH_OPTIONS}
                size="sm"
                value={month}
                onValueChange={selectMonth}
              />
            ),
          },
          {
            key: 'department',
            label: 'Phòng ban',
            icon: 'building-user-outline',
            value: labelOf(DEPARTMENT_OPTIONS, department),
            active: department !== 'all',
            content: (
              <Dropdown
                aria-label="Phòng ban"
                options={DEPARTMENT_OPTIONS}
                size="sm"
                value={department}
                onValueChange={selectDepartment}
              />
            ),
          },
        ]}
        subtitle={OPS_UPDATED_LABEL}
        title="Chấm công"
        tone="pink"
      />

      <PageBody>
        <TimesheetKpiStrip summary={summary} />
        <TimesheetGrid
          closed={sheet.closed}
          days={sheet.days}
          monthLabel={sheet.monthLabel}
          rows={rows}
        />
      </PageBody>
    </PageShell>
  );
}

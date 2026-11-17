import { memo, useState } from 'react';

import {
  DatePicker,
  DateTimePicker,
  MonthYearRangePicker,
  MonthYearStartPicker,
  RangeDatePicker,
  SingleDatePicker,
  TimePicker,
} from '@/shared/ui';
import type { DateRange, MonthYearRangeValue, MonthYearStartValue } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const TODAY = new Date();
const IN_A_WEEK = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate() + 7);
const PICKER_SIZES = ['sm', 'md', 'lg'] as const;

/**
 * PickersSection — mục "Ngày & giờ" của trang `/demo`: mọi picker ngày / khoảng ngày / ngày giờ / giờ / tháng năm.
 */
const PickersSection = memo(function PickersSection() {
  const [day, setDay] = useState<Date | null>(TODAY);
  const [range, setRange] = useState<DateRange>({ from: TODAY, to: IN_A_WEEK });
  const [at, setAt] = useState<Date | null>(TODAY);
  const [time, setTime] = useState<string | null>('08:30');
  const [monthStart, setMonthStart] = useState<MonthYearStartValue>({
    month: TODAY.getMonth() + 1,
    year: TODAY.getFullYear(),
  });
  const [monthRange, setMonthRange] = useState<MonthYearRangeValue>({
    from: { month: 1, year: TODAY.getFullYear() },
    to: { month: 12, year: TODAY.getFullYear() },
  });

  return (
    <DemoSection
      description="Ngày · khoảng ngày · ngày+giờ · giờ · tháng/năm. Định dạng hiển thị dd/MM/yyyy, gõ tay được."
      importPath="@/shared/ui"
      title="Ngày & giờ"
    >
      <DemoRow
        label="DatePicker · mode"
        note="wrapper hợp nhất — 1 prop `mode` chuyển single/range"
        stacked
      >
        <DemoGrid min="lg">
          <DatePicker mode="single" value={day} onChange={setDay} />
          <DatePicker mode="range" range={range} onRangeChange={setRange} />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="SingleDatePicker · size / minDate / invalid / disabled / allowManualInput"
        stacked
      >
        <DemoGrid min="md">
          {PICKER_SIZES.map((size) => (
            <SingleDatePicker key={size} placeholder={`size="${size}"`} size={size} />
          ))}
        </DemoGrid>
        <DemoGrid min="md">
          <SingleDatePicker minDate={TODAY} placeholder="Chỉ từ hôm nay" />
          <SingleDatePicker invalid placeholder="invalid" />
          <SingleDatePicker disabled placeholder="disabled" />
          <SingleDatePicker allowManualInput={false} placeholder="Chỉ chọn — Tab + Enter mở lịch" />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="RangeDatePicker · invalid / disabled"
        note="showQuickSelect thêm các mốc 7/30/90 ngày"
        stacked
      >
        <DemoGrid min="lg">
          <RangeDatePicker range={range} onRangeChange={setRange} />
          <RangeDatePicker showQuickSelect />
        </DemoGrid>
        <DemoGrid min="lg">
          <RangeDatePicker invalid placeholder="invalid" />
          <RangeDatePicker disabled placeholder="disabled" />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="DateTimePicker · TimePicker · invalid / disabled" stacked>
        <DemoGrid min="md">
          <DateTimePicker minuteStep={15} value={at} onChange={setAt} />
          <TimePicker value={time} onChange={setTime} />
          <TimePicker minuteStep={30} placeholder="Bước 30 phút" />
        </DemoGrid>
        <DemoGrid min="md">
          <DateTimePicker invalid placeholder="invalid" />
          <DateTimePicker disabled placeholder="disabled" />
          <TimePicker invalid placeholder="invalid" />
          <TimePicker disabled placeholder="disabled" />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="MonthYear · mốc bắt đầu / khoảng / error" stacked>
        <DemoGrid min="lg">
          <MonthYearStartPicker fullWidth value={monthStart} onChange={setMonthStart} />
          <MonthYearRangePicker fullWidth value={monthRange} onChange={setMonthRange} />
        </DemoGrid>
        <DemoGrid min="lg">
          <MonthYearStartPicker
            error="Chỉ chọn trong 6 tháng gần đây (span=6)"
            fullWidth
            span={6}
            value={monthStart}
            onChange={setMonthStart}
          />
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default PickersSection;

import { Fragment, memo, useState } from 'react';

import {
  Badge,
  DEFAULT_QUICK_OPTIONS,
  MonthRangeFilter,
  MonthYearRangePicker,
  RangeDatePicker,
  SingleDatePicker,
  TIME_PARSE_MESSAGES,
  Text,
  TimePicker,
} from '@/shared/ui';
import type { DateRange, MonthRangeFilterValue, MonthYearRangeValue } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const TODAY = new Date();
const YEARS = [TODAY.getFullYear() - 1, TODAY.getFullYear(), TODAY.getFullYear() + 1];

/**
 * PickersAdvancedSection — mục "Ngày & giờ nâng cao" của trang `/demo`: lựa chọn nhanh, chặn ngày, popover và các bảng thông điệp của picker.
 */
const PickersAdvancedSection = memo(function PickersAdvancedSection() {
  const [range, setRange] = useState<DateRange>({ from: null, to: null });
  const [time, setTime] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [monthRange, setMonthRange] = useState<MonthYearRangeValue>({
    from: { month: 1, year: TODAY.getFullYear() },
    to: { month: 12, year: TODAY.getFullYear() },
  });
  const [monthFilter, setMonthFilter] = useState<MonthRangeFilterValue>({
    monthFrom: 2,
    monthTo: 6,
    year: TODAY.getFullYear(),
  });

  return (
    <DemoSection
      description="DEFAULT_QUICK_OPTIONS · TIME_PARSE_MESSAGES · isDateDisabled · popoverVariant/align/hideFooter."
      importPath="@/shared/ui"
      title="Ngày & giờ (nâng cao)"
    >
      <DemoRow
        label="DEFAULT_QUICK_OPTIONS"
        note="6 mốc dựng sẵn — truyền thẳng qua quickSelectOptions, giống showQuickSelect mặc định"
        stacked
      >
        <DemoGrid min="lg">
          <RangeDatePicker
            quickSelectOptions={DEFAULT_QUICK_OPTIONS}
            range={range}
            showQuickSelect
            onRangeChange={setRange}
          />
        </DemoGrid>
        <div className="flex flex-wrap gap-1.5">
          {DEFAULT_QUICK_OPTIONS.map((opt) => (
            <Badge key={opt.label} color="neutral" size="sm" variant="tinted">
              {opt.label}
            </Badge>
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="TimePicker · onParseError → TIME_PARSE_MESSAGES"
        note='thử gõ "99:99" hoặc "12:5:6" — 8 mã lỗi bên dưới'
        stacked
      >
        <DemoGrid min="md">
          <TimePicker value={time} onChange={setTime} onParseError={setParseError} />
        </DemoGrid>
        {parseError && (
          <Text size="tiny" skin="error">
            {parseError}
          </Text>
        )}
        <div className="grid grid-cols-[168px_1fr] gap-x-3 gap-y-1">
          {Object.entries(TIME_PARSE_MESSAGES).map(([code, message]) => (
            <Fragment key={code}>
              <Text className="font-mono" size="extraTiny" skin="muted">
                {code}
              </Text>
              <Text size="extraTiny" skin="muted">
                {message}
              </Text>
            </Fragment>
          ))}
        </div>
      </DemoRow>

      <DemoRow
        label="SingleDatePicker · isDateDisabled"
        note="khoá Thứ 7 / Chủ nhật — predicate nhận Date, trả true = không chọn được"
        stacked
      >
        <DemoGrid min="md">
          <SingleDatePicker
            isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
            placeholder="Chỉ chọn ngày trong tuần"
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="RangeDatePicker · popoverVariant / align / hideFooter"
        note="popoverVariant=solid khi lịch nổi trên nền sáng / ảnh 3D"
        stacked
      >
        <DemoGrid min="lg">
          <RangeDatePicker align="end" hideFooter placeholder="hideFooter — tự đóng khi đủ 2 mốc" />
          <RangeDatePicker placeholder="popoverVariant=solid" popoverVariant="solid" />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="MonthYearRangePicker · error / triggerWidth" stacked>
        <MonthYearRangePicker
          error="Khoảng không được vượt quá 1 năm"
          triggerWidth={320}
          value={monthRange}
          onChange={setMonthRange}
        />
      </DemoRow>
      <DemoRow
        label="MonthRangeFilter · khoảng tháng trong 1 năm"
        note="năm lấy từ danh sách years — ◀ ▶ tự tắt ở đầu/cuối; bấm tháng đầu rồi tháng cuối"
        stacked
      >
        <MonthRangeFilter
          monthFrom={monthFilter.monthFrom}
          monthTo={monthFilter.monthTo}
          year={monthFilter.year}
          years={YEARS}
          onChange={setMonthFilter}
        />
        <Text size="extraTiny" skin="muted">
          Đang chọn: T{monthFilter.monthFrom + 1} – T{monthFilter.monthTo + 1}/{monthFilter.year}
        </Text>
        <MonthRangeFilter
          error="Năm này mới có dữ liệu tới tháng 9"
          monthFrom={monthFilter.monthFrom}
          monthTo={monthFilter.monthTo}
          year={monthFilter.year}
          years={YEARS}
          onChange={setMonthFilter}
        />
      </DemoRow>
    </DemoSection>
  );
});

export default PickersAdvancedSection;

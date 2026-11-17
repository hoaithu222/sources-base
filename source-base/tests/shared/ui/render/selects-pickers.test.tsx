/**
 * Render nông — nhóm `selects` · `pickers` (`tests/helpers/render-suite.tsx`).
 */

import {
  DatePicker,
  DateTimePicker,
  Dropdown,
  DropdownTreeSelect,
  MonthRangeFilter,
  MonthYearRangePicker,
  MonthYearStartPicker,
  MultiSelect,
  RangeDatePicker,
  SingleDatePicker,
  TimePicker,
} from '@/shared/ui';
import { describeRenderSuite, type RenderCase } from '@tests/helpers/render-suite';

const OPTIONS = [
  { value: 'a', label: 'Mục A' },
  { value: 'b', label: 'Mục B' },
];
const noop = () => {};

const CASES: RenderCase[] = [
  // selects
  ['Dropdown', <Dropdown options={OPTIONS} value="a" />],
  ['MultiSelect', <MultiSelect options={OPTIONS} value={['a']} />],
  ['DropdownTreeSelect', <DropdownTreeSelect data={[]} value={[]} onChange={noop} />],

  // pickers
  ['DatePicker', <DatePicker mode="single" onChange={noop} />],
  ['SingleDatePicker', <SingleDatePicker onChange={noop} />],
  ['RangeDatePicker', <RangeDatePicker range={{ from: null, to: null }} onRangeChange={noop} />],
  ['DateTimePicker', <DateTimePicker onChange={noop} />],
  [
    'MonthYearStartPicker',
    <MonthYearStartPicker value={{ month: 1, year: 2026 }} onChange={noop} />,
  ],
  [
    'MonthYearRangePicker',
    <MonthYearRangePicker
      value={{ from: { month: 1, year: 2026 }, to: { month: 12, year: 2026 } }}
      onChange={noop}
    />,
  ],
  [
    'MonthRangeFilter',
    <MonthRangeFilter monthFrom={2} monthTo={6} year={2026} years={[2025, 2026]} onChange={noop} />,
  ],
  ['TimePicker', <TimePicker value="" onChange={noop} />],
];

describeRenderSuite('selects-pickers', CASES);

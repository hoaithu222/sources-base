/**
 * Render nông — nhóm `selects` · `pickers` (`tests/helpers/render-suite.tsx`).
 */

import {
  ChoiceTiles,
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
import { describeRenderSuite, renderCase, type RenderCase } from '@tests/helpers/render-suite';

const OPTIONS = [
  { value: 'a', label: 'Mục A' },
  { value: 'b', label: 'Mục B' },
];
const noop = () => {};

const CASES: RenderCase[] = [
  // selects
  renderCase(
    'ChoiceTiles',
    <ChoiceTiles aria-label="Kiểu" options={OPTIONS} value="a" onValueChange={noop} />,
  ),
  renderCase(
    'ChoiceTiles · swatch',
    <ChoiceTiles
      aria-label="Màu"
      options={[{ value: 'a', label: 'Xanh', fill: 'bg-blue-6' }]}
      value="a"
      variant="swatch"
      onValueChange={noop}
    />,
  ),
  renderCase('Dropdown', <Dropdown options={OPTIONS} value="a" />),
  renderCase('MultiSelect', <MultiSelect options={OPTIONS} value={['a']} />),
  renderCase('DropdownTreeSelect', <DropdownTreeSelect data={[]} value={[]} onChange={noop} />),

  // pickers
  renderCase('DatePicker', <DatePicker mode="single" onChange={noop} />),
  renderCase('SingleDatePicker', <SingleDatePicker onChange={noop} />),
  renderCase(
    'RangeDatePicker',
    <RangeDatePicker range={{ from: null, to: null }} onRangeChange={noop} />,
  ),
  renderCase('DateTimePicker', <DateTimePicker onChange={noop} />),
  renderCase(
    'MonthYearStartPicker',
    <MonthYearStartPicker value={{ month: 1, year: 2026 }} onChange={noop} />,
  ),
  renderCase(
    'MonthYearRangePicker',
    <MonthYearRangePicker
      value={{ from: { month: 1, year: 2026 }, to: { month: 12, year: 2026 } }}
      onChange={noop}
    />,
  ),
  renderCase(
    'MonthRangeFilter',
    <MonthRangeFilter monthFrom={2} monthTo={6} year={2026} years={[2025, 2026]} onChange={noop} />,
  ),
  renderCase('TimePicker', <TimePicker value="" onChange={noop} />),
];

describeRenderSuite('selects-pickers', CASES);

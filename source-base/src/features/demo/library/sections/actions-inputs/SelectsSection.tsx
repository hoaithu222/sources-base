import { memo, useState } from 'react';

import { Dropdown, DropdownTreeSelect, MultiSelect } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_CONTRACTOR_OPTIONS,
  DEMO_SEVERITY_OPTIONS,
} from '../../constants/actions-inputs/inputs.constants';
import {
  DEMO_DROPDOWN_OPTIONS,
  DEMO_MULTISELECT_OPTIONS,
  DEMO_TREE_DATA,
} from '../../constants/samples.constants';

/**
 * SelectsSection — mục "Chọn danh sách" của trang `/demo`: `Dropdown` · `MultiSelect` · `DropdownTreeSelect`.
 */
const SelectsSection = memo(function SelectsSection() {
  const [unit, setUnit] = useState('m2');
  const [trades, setTrades] = useState<string[]>(['civil', 'mep']);
  const [folder, setFolder] = useState<string[]>(['p1-1']);
  const [severity, setSeverity] = useState('low');
  const [contractor, setContractor] = useState('c1');

  return (
    <DemoSection
      description="Dropdown · MultiSelect · DropdownTreeSelect. Tìm kiếm bên trong đã bỏ dấu và an toàn với bộ gõ tiếng Việt."
      importPath="@/shared/ui"
      title="Chọn danh sách"
    >
      <DemoRow
        label="Dropdown"
        note="badge = mã ngắn, meta = chữ phụ căn phải; cả hai đều tìm được"
        stacked
      >
        <DemoGrid min="md">
          <Dropdown
            options={DEMO_DROPDOWN_OPTIONS}
            searchable
            value={unit}
            onValueChange={setUnit}
          />
          <Dropdown
            clearable
            options={DEMO_DROPDOWN_OPTIONS}
            triggerDisplay="badge"
            value={unit}
            onValueChange={setUnit}
          />
          <Dropdown invalid options={DEMO_DROPDOWN_OPTIONS} placeholder="invalid — chưa chọn" />
          <Dropdown disabled options={DEMO_DROPDOWN_OPTIONS} value={unit} />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Dropdown · size / variant (tick · radio)" stacked>
        <DemoGrid min="md">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Dropdown
              key={size}
              options={DEMO_DROPDOWN_OPTIONS}
              placeholder={`size="${size}"`}
              size={size}
            />
          ))}
        </DemoGrid>
        <DemoGrid min="lg">
          <Dropdown
            options={DEMO_DROPDOWN_OPTIONS}
            value={unit}
            variant="tick"
            onValueChange={setUnit}
          />
          <Dropdown
            options={DEMO_DROPDOWN_OPTIONS}
            value={unit}
            variant="radio"
            onValueChange={setUnit}
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="Dropdown · tone (6 giá trị) / icon / badge / dotColor"
        note="tone tô màu chữ+check+nền chọn; dotColor là màu DỮ LIỆU (vd màu nhà thầu, '' = chưa đặt)"
        stacked
      >
        <DemoGrid min="lg">
          <Dropdown
            options={DEMO_SEVERITY_OPTIONS}
            placeholder="Mức độ"
            value={severity}
            onValueChange={setSeverity}
          />
          <Dropdown
            options={DEMO_CONTRACTOR_OPTIONS}
            placeholder="Nhà thầu"
            value={contractor}
            onValueChange={setContractor}
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="Dropdown · creatable / clearInList" stacked>
        <DemoGrid min="lg">
          <Dropdown
            creatable
            options={DEMO_DROPDOWN_OPTIONS}
            placeholder="Gõ để tạo mới"
            value={unit}
            onValueChange={setUnit}
          />
          <Dropdown
            clearInList
            options={DEMO_DROPDOWN_OPTIONS}
            placeholder="✕ nằm trong danh sách, không ở trigger"
            value={unit}
            onValueChange={setUnit}
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="MultiSelect" note="quá maxDisplay thì gộp thành +N" stacked>
        <DemoGrid min="md">
          <MultiSelect
            options={DEMO_MULTISELECT_OPTIONS}
            searchable
            value={trades}
            onValueChange={setTrades}
          />
          <MultiSelect
            maxDisplay={1}
            options={DEMO_MULTISELECT_OPTIONS}
            value={trades}
            onValueChange={setTrades}
          />
          <MultiSelect
            invalid
            options={DEMO_MULTISELECT_OPTIONS}
            placeholder="selectAll + invalid"
            selectAll
          />
          <MultiSelect disabled options={DEMO_MULTISELECT_OPTIONS} value={trades} />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="MultiSelect · size" stacked>
        <DemoGrid min="md">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <MultiSelect
              key={size}
              options={DEMO_MULTISELECT_OPTIONS}
              placeholder={`size="${size}"`}
              size={size}
            />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="DropdownTreeSelect · mode / invalid / disabled / size"
        note="chọn một nhánh trong cây thư mục"
        stacked
      >
        <DemoGrid min="md">
          <DropdownTreeSelect
            data={DEMO_TREE_DATA}
            placeholder="Chọn thư mục"
            value={folder}
            onChange={setFolder}
          />
          <DropdownTreeSelect data={DEMO_TREE_DATA} mode="multi" placeholder="Chọn nhiều thư mục" />
          <DropdownTreeSelect data={DEMO_TREE_DATA} invalid placeholder="invalid" />
          <DropdownTreeSelect data={DEMO_TREE_DATA} disabled value={folder} />
        </DemoGrid>
        <DemoGrid min="md">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <DropdownTreeSelect
              key={size}
              data={DEMO_TREE_DATA}
              placeholder={`size="${size}"`}
              size={size}
            />
          ))}
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default SelectsSection;

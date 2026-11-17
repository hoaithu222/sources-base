/**
 * Render nông — nhóm `actions` · `inputs` (`tests/helpers/render-suite.tsx`).
 */

import { expect } from 'vitest';

import {
  Button,
  Checkbox,
  ColorPalettePanel,
  ContextMenu,
  Input,
  Menu,
  NumberInput,
  Radio,
  RadioGroup,
  SegmentToggle,
  Textarea,
  ThemeToggle,
  Toggle,
} from '@/shared/ui';
import { describeRenderSuite, renderCase, type RenderCase } from '@tests/helpers/render-suite';

const noop = () => {};

const CASES: RenderCase[] = [
  // actions
  renderCase('Button', <Button variant="primary">Lưu</Button>, {
    check: ({ getByRole }) => expect(getByRole('button', { name: 'Lưu' })).toBeInTheDocument(),
  }),
  renderCase('Menu', <Menu options={[{ key: 'a', label: 'A' }]} trigger={<Button>menu</Button>} />),
  renderCase('ContextMenu', <ContextMenu options={[{ key: 'a', label: 'A' }]}>vùng</ContextMenu>),
  renderCase('SegmentToggle', <SegmentToggle options={[{ key: 'a', label: 'A' }]} value="a" />),
  renderCase('ThemeToggle', <ThemeToggle theme="dark" onToggle={noop} />),

  // inputs
  renderCase('Input', <Input placeholder="nhập" />),
  renderCase('Textarea', <Textarea placeholder="nhập dài" />),
  renderCase('NumberInput', <NumberInput value={1} onChange={noop} />),
  renderCase('Checkbox', <Checkbox label="chọn" />),
  // Radio chỉ sống trong RadioGroup (Radix ném lỗi nếu đứng một mình).
  renderCase(
    'Radio',
    <RadioGroup defaultValue="a">
      <Radio label="Theo ngày" value="a" />
    </RadioGroup>,
  ),
  renderCase(
    'RadioGroup',
    <RadioGroup defaultValue="a">
      <Radio value="a" />
      <Radio value="b" />
    </RadioGroup>,
    { check: ({ getAllByRole }) => expect(getAllByRole('radio')).toHaveLength(2) },
  ),
  renderCase('Toggle', <Toggle />),
  renderCase('ColorPalettePanel', <ColorPalettePanel value="#22C55E" onChange={noop} />, {
    check: ({ container }) => expect(container.firstChild).toBeTruthy(),
  }),
];

describeRenderSuite('actions-inputs', CASES);

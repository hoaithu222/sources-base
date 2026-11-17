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
import { describeRenderSuite, type RenderCase } from '@tests/helpers/render-suite';

const noop = () => {};

const CASES: RenderCase[] = [
  // actions
  [
    'Button',
    <Button variant="primary">Lưu</Button>,
    { check: ({ getByRole }) => expect(getByRole('button', { name: 'Lưu' })).toBeInTheDocument() },
  ],
  ['Menu', <Menu options={[{ key: 'a', label: 'A' }]} trigger={<Button>menu</Button>} />],
  ['ContextMenu', <ContextMenu options={[{ key: 'a', label: 'A' }]}>vùng</ContextMenu>],
  ['SegmentToggle', <SegmentToggle options={[{ key: 'a', label: 'A' }]} value="a" />],
  ['ThemeToggle', <ThemeToggle theme="dark" onToggle={noop} />],

  // inputs
  ['Input', <Input placeholder="nhập" />],
  ['Textarea', <Textarea placeholder="nhập dài" />],
  ['NumberInput', <NumberInput value={1} onChange={noop} />],
  ['Checkbox', <Checkbox label="chọn" />],
  // Radio chỉ sống trong RadioGroup (Radix ném lỗi nếu đứng một mình).
  [
    'Radio',
    <RadioGroup defaultValue="a">
      <Radio label="Theo ngày" value="a" />
    </RadioGroup>,
  ],
  [
    'RadioGroup',
    <RadioGroup defaultValue="a">
      <Radio value="a" />
      <Radio value="b" />
    </RadioGroup>,
    { check: ({ getAllByRole }) => expect(getAllByRole('radio')).toHaveLength(2) },
  ],
  ['Toggle', <Toggle />],
  [
    'ColorPalettePanel',
    <ColorPalettePanel value="#22C55E" onChange={noop} />,
    { check: ({ container }) => expect(container.firstChild).toBeTruthy() },
  ],
];

describeRenderSuite('actions-inputs', CASES);

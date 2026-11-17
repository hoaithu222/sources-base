import { memo, useCallback, useState } from 'react';

import {
  Checkbox,
  ChoiceTiles,
  ColorPalettePanel,
  Radio,
  RadioGroup,
  Toggle,
  type ChoiceTileOption,
} from '@/shared/ui';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { CHECKBOX_SIZES } from '../../constants/actions-inputs/inputs.constants';
import { DEMO_COLOR_PRESET, DEMO_USED_COLORS } from '../../constants/samples.constants';

const DENSITY_TILES: readonly ChoiceTileOption[] = [
  {
    value: 'compact',
    label: 'Gọn',
    preview: (
      <span className="absolute inset-0 bg-[repeating-linear-gradient(var(--color-bg-surface)_0_5px,var(--color-border-strong)_5px_6px)]" />
    ),
  },
  {
    value: 'regular',
    label: 'Vừa',
    preview: (
      <span className="absolute inset-0 bg-[repeating-linear-gradient(var(--color-bg-surface)_0_8px,var(--color-border-strong)_8px_9px)]" />
    ),
  },
  {
    value: 'cozy',
    label: 'Thoáng',
    preview: (
      <span className="absolute inset-0 bg-[repeating-linear-gradient(var(--color-bg-surface)_0_12px,var(--color-border-strong)_12px_13px)]" />
    ),
    disabled: true,
  },
];

const SWATCHES: readonly ChoiceTileOption[] = [
  { value: 'vci', label: 'VCI', fill: 'bg-linear-to-br from-green-6 via-teal-7 to-secondary-7' },
  { value: 'blue', label: 'Xanh dương', fill: 'bg-blue-6' },
  { value: 'purple', label: 'Tím', fill: 'bg-purple-6' },
  { value: 'orange', label: 'Cam', fill: 'bg-orange-6' },
  { value: 'graphite', label: 'Than chì', fill: 'bg-neutral-6' },
];

/**
 * ChoiceControlsSection — mục "Ô chọn" của trang `/demo`: `Checkbox` · `Radio` · `ChoiceTiles` · `Toggle` ·
 * `ColorPalettePanel`.
 */
const ChoiceControlsSection = memo(function ChoiceControlsSection() {
  const [agreed, setAgreed] = useState(false);
  const [notify, setNotify] = useState(true);
  const [plan, setPlan] = useState('week');
  const [color, setColor] = useState('#22C55E');
  const [density, setDensity] = useState('compact');
  const [swatch, setSwatch] = useState('vci');

  const handleAgreed = useCallback((v: boolean) => setAgreed(v), []);
  const handleNotify = useCallback((v: boolean) => setNotify(v), []);

  return (
    <DemoSection
      description="Checkbox · Radio · ChoiceTiles · Toggle · ColorPalettePanel — chọn trong tập cho sẵn."
      importPath="@/shared/ui"
      title="Ô chọn"
    >
      <DemoRow label="Checkbox · size">
        {CHECKBOX_SIZES.map((size) => (
          <Checkbox key={size} defaultChecked label={size} size={size} />
        ))}
      </DemoRow>

      <DemoRow label="Checkbox · trạng thái" note="rê nhãn = rê ô; lỗi giữ viền đỏ cả khi hover">
        <Checkbox checked={agreed} label="Đồng ý điều khoản" onCheckedChange={handleAgreed} />
        <Checkbox checked="indeterminate" label="Chọn một phần" readOnly />
        <Checkbox disabled label="Không đổi được" />
        <Checkbox defaultChecked disabled label="Đã tích + khoá" />
        <Checkbox error="Bắt buộc tích ô này" label="Có lỗi" />
      </DemoRow>

      <DemoRow label="Radio · ngang / dọc" stacked width="narrow">
        <RadioGroup className="flex gap-4" value={plan} onValueChange={setPlan}>
          <Radio label="Theo ngày" value="day" />
          <Radio label="Theo tuần" value="week" />
          <Radio disabled label="Theo quý" value="quarter" />
        </RadioGroup>
        <RadioGroup className="flex flex-col gap-2" defaultValue="quarter">
          <Radio label="Theo ngày" value="day" />
          <Radio label="Theo tuần" value="week" />
          <Radio disabled label="Theo quý (đang chọn + khoá)" value="quarter" />
        </RadioGroup>
      </DemoRow>

      <DemoRow
        label="ChoiceTiles · tile / swatch"
        note="chọn bằng hình kiểu macOS — ← → đi giữa các ô"
      >
        <ChoiceTiles
          aria-label="Mật độ"
          options={DENSITY_TILES}
          value={density}
          onValueChange={setDensity}
        />
        <ChoiceTiles
          aria-label="Màu nhấn"
          options={SWATCHES}
          value={swatch}
          variant="swatch"
          onValueChange={setSwatch}
        />
      </DemoRow>

      <DemoRow label="Toggle · size / labelPosition / disabled">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <Toggle
            key={size}
            aria-label={`Bật thông báo cỡ ${size}`}
            checked={notify}
            size={size}
            onCheckedChange={handleNotify}
          />
        ))}
        <Toggle defaultChecked label="Nhãn trái" labelPosition="left" />
        <Toggle defaultChecked label="Nhãn phải" labelPosition="right" />
        <Toggle disabled label="Khoá" />
        <Toggle defaultChecked disabled label="Bật + khoá" />
      </DemoRow>

      <DemoRow
        label="ColorPalettePanel"
        note="preset + màu tuỳ chỉnh + gợi ý ngẫu nhiên — 2 hex đã bị chiếm bởi bản ghi khác"
        stacked
        width="narrow"
      >
        <ColorPalettePanel
          preset={DEMO_COLOR_PRESET}
          showRandomSuggest
          usedColors={DEMO_USED_COLORS}
          value={color}
          onChange={setColor}
        />
      </DemoRow>
    </DemoSection>
  );
});

export default ChoiceControlsSection;

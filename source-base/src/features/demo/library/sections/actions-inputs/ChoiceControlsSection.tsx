import { memo, useCallback, useState } from 'react';

import { Checkbox, ColorPalettePanel, Radio, RadioGroup, Toggle } from '@/shared/ui';

import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { CHECKBOX_SIZES } from '../../constants/actions-inputs/inputs.constants';
import { DEMO_COLOR_PRESET, DEMO_USED_COLORS } from '../../constants/samples.constants';

/**
 * ChoiceControlsSection — mục "Ô chọn" của trang `/demo`: `Checkbox` · `Radio` · `Toggle` · `ColorPalettePanel`.
 */
const ChoiceControlsSection = memo(function ChoiceControlsSection() {
  const [agreed, setAgreed] = useState(false);
  const [notify, setNotify] = useState(true);
  const [plan, setPlan] = useState('week');
  const [color, setColor] = useState('#22C55E');

  const handleAgreed = useCallback((v: boolean) => setAgreed(v), []);
  const handleNotify = useCallback((v: boolean) => setNotify(v), []);

  return (
    <DemoSection
      description="Checkbox · Radio · Toggle · ColorPalettePanel — chọn trong tập cho sẵn."
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

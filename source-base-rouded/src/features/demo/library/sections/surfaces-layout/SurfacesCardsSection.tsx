import { memo, useCallback, useState } from 'react';

import {
  Badge,
  CompactKpiCard,
  Progress,
  SummaryCard,
  SummaryPill,
  type CompactKpiCardColor,
  type GemColor,
  type SummaryPillColor,
} from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const GEM_COLORS: GemColor[] = ['blue', 'green', 'yellow', 'red', 'gray'];
const KPI_COLORS: CompactKpiCardColor[] = ['blue', 'green', 'yellow', 'red', 'gray'];
const PILL_COLORS: SummaryPillColor[] = [
  'sky',
  'green',
  'yellow',
  'orange',
  'indigo',
  'pink',
  'fuchsia',
  'purple',
  'blue',
  'red',
  'teal',
];

/**
 * SurfacesCardsSection — mục "Thẻ số liệu" của trang `/demo`: `SummaryCard` · `CompactKpiCard` · `SummaryPill`.
 */
const SurfacesCardsSection = memo(function SurfacesCardsSection() {
  const [kpiSelected, setKpiSelected] = useState(false);
  const toggleKpiSelected = useCallback(() => setKpiSelected((s) => !s), []);

  return (
    <DemoSection
      description="SummaryCard · CompactKpiCard · SummaryPill."
      importPath="@/shared/ui"
      title="Thẻ số liệu"
    >
      <DemoRow
        label="SummaryCard · color (5 GemColor)"
        note="icon BẮT BUỘC biến thể -bold · nền nhạt, icon trên viên ngọc lấy bậc tươi cùng họ"
        stacked
      >
        <DemoGrid min="sm">
          {GEM_COLORS.map((color) => (
            <SummaryCard key={color} color={color} icon="buildings-bold" label={color} value={42} />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="SummaryCard · size + description + gemSize override" stacked>
        <DemoGrid min="md">
          <SummaryCard
            color="green"
            icon="circle-check-bold"
            label="size=sm"
            size="sm"
            value={28}
          />
          <SummaryCard
            color="green"
            description="+3 tuần này"
            icon="circle-check-bold"
            label="size=md (mặc định)"
            value={28}
          />
          <SummaryCard
            color="green"
            gemSize="xs"
            icon="circle-check-bold"
            label="size=lg, gemSize=xs (ghi đè)"
            size="lg"
            value={28}
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="CompactKpiCard · color (5 GemColor)" stacked>
        <DemoGrid min="sm">
          {KPI_COLORS.map((color) => (
            <CompactKpiCard key={color} color={color} icon="file-bold" label={color} value={128} />
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow label="CompactKpiCard · size (xs·sm·md·lg)" stacked>
        <DemoGrid min="sm">
          <CompactKpiCard color="blue" icon="file-bold" label="size=xs" size="xs" value={128} />
          <CompactKpiCard color="blue" icon="file-bold" label="size=sm" size="sm" value={128} />
          <CompactKpiCard color="blue" icon="file-bold" label="size=md" value={128} />
          <CompactKpiCard color="blue" icon="file-bold" label="size=lg" size="lg" value={128} />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="CompactKpiCard · trailing / footer / unit / unitSize / emphasis" stacked>
        <DemoGrid min="sm">
          <CompactKpiCard
            color="blue"
            icon="file-bold"
            label="Công văn đến"
            trailing={
              <Badge color="success" variant="tinted">
                +12%
              </Badge>
            }
            unit="văn bản"
            value={1284}
          />
          <CompactKpiCard
            color="green"
            emphasis="strong"
            footer={<Progress size="xs" value={72} />}
            icon="chart-simple-bold"
            label="Sản lượng (emphasis=strong)"
            unit="tỷ"
            value="18,4"
          />
          <CompactKpiCard
            color="red"
            icon="triangle-exclamation-bold"
            label="unitSize ghi đè"
            unit="hồ sơ quá hạn"
            unitSize="small"
            value={8}
          />
          <CompactKpiCard
            color="gray"
            icon="cube-bold"
            label={kpiSelected ? 'selected=true (bấm để bỏ)' : 'onClick + selected (bấm để chọn)'}
            selected={kpiSelected}
            value={356}
            onClick={toggleKpiSelected}
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="SummaryPill · color (11 giá trị)" stacked>
        <div className="flex flex-wrap gap-2">
          {PILL_COLORS.map((color) => (
            <SummaryPill key={color} color={color} icon="cube-bold" label={color} value={128} />
          ))}
        </div>
      </DemoRow>

      <DemoRow label="SummaryPill · size + hint">
        <SummaryPill color="sky" icon="cube-bold" label="size=sm" size="sm" value={128} />
        <SummaryPill
          color="green"
          hint="(8 chờ duyệt)"
          icon="circle-check-bold"
          label="size=md + hint"
          value={96}
        />
      </DemoRow>
    </DemoSection>
  );
});

export default SurfacesCardsSection;

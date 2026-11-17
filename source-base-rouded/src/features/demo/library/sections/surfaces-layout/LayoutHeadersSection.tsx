import { memo } from 'react';

import {
  Badge,
  Button,
  DetailPanelHeader,
  SectionHeader,
  SummaryPill,
  Surface,
  TitleScreen,
} from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_TITLE_TONES } from '../../constants/surfaces-layout/surfaces.constants';

/**
 * LayoutHeadersSection — mục "Tiêu đề & header" của trang `/demo`: `TitleScreen` · `SectionHeader` · `DetailPanelHeader`.
 */
const LayoutHeadersSection = memo(function LayoutHeadersSection() {
  return (
    <DemoSection
      description="TitleScreen · SectionHeader · DetailPanelHeader."
      importPath="@/shared/ui"
      title="Tiêu đề & panel header"
    >
      <DemoRow label="TitleScreen · iconColor (12 giá trị TitleIconColor)" stacked>
        {DEMO_TITLE_TONES.map((tone) => (
          <TitleScreen key={tone} icon="buildings-bold" iconColor={tone} title={tone} />
        ))}
      </DemoRow>

      <DemoRow label="TitleScreen · subtitle + titleTrailing + summary + right + onBack" stacked>
        <TitleScreen
          icon="buildings-bold"
          iconColor="sky"
          right={
            <Button size="sm" startIcon={<SystemIcon name="plus-outline" size={14} />}>
              Thêm
            </Button>
          }
          subtitle="PROJECTS"
          summary={
            <div className="flex gap-2">
              <SummaryPill color="sky" icon="cube-bold" label="Hạng mục" value={128} />
              <SummaryPill color="green" icon="circle-check-bold" label="Đã duyệt" value={96} />
            </div>
          }
          title="Danh sách dự án"
          titleTrailing={
            <Badge color="neutral" variant="tinted">
              Beta
            </Badge>
          }
          onBack={() => {}}
        />
      </DemoRow>

      <DemoRow label="SectionHeader · iconColor (12 giá trị, accent=true)" stacked>
        {DEMO_TITLE_TONES.map((tone) => (
          <SectionHeader key={tone} accent icon="chart-simple-bold" iconColor={tone} title={tone} />
        ))}
      </DemoRow>

      <DemoRow label="SectionHeader · description + accent off/on + right" stacked>
        <SectionHeader
          description="accent=false (mặc định) — không có vạch dọc theo tone."
          title="Thông tin chung"
        />
        <SectionHeader
          accent
          icon="chart-simple-bold"
          iconColor="teal"
          right={
            <Badge color="info" variant="tinted">
              8 mục
            </Badge>
          }
          title="accent=true + icon + slot phải"
        />
      </DemoRow>

      <DemoRow label="DetailPanelHeader · tone (12 giá trị, size=sm)" stacked>
        <div className="flex flex-col gap-1">
          {DEMO_TITLE_TONES.map((tone) => (
            <div
              key={tone}
              className="overflow-hidden rounded-lg border border-border-default bg-bg-surface"
            >
              <DetailPanelHeader className="border-b-0" size="sm" title={tone} tone={tone} />
            </div>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="DetailPanelHeader · size + action" stacked>
        <DemoGrid min="lg">
          <Surface>
            <DetailPanelHeader className="border-b-0" title="size=md (mặc định)" tone="sky" />
          </Surface>
          <Surface>
            <DetailPanelHeader className="border-b-0" size="sm" title="size=sm" tone="sky" />
          </Surface>
          <Surface>
            <DetailPanelHeader
              action={
                <Button aria-label="Đóng panel" size="sm" variant="ghost">
                  <SystemIcon name="xmark-outline" size={14} />
                </Button>
              }
              className="border-b-0"
              title="action slot"
              tone="teal"
            />
          </Surface>
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default LayoutHeadersSection;

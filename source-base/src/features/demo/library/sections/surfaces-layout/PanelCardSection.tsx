import { memo } from 'react';

import { PanelCard, SegmentToggle, Text } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_PANEL_CARD_LINES } from '../../constants/surfaces-layout/surfaces.constants';

/**
 * PanelCardSection — mục "Card dashboard" của trang `/demo`: `PanelCard` đủ frame, mật độ, trạng thái tải / rỗng.
 */
const PanelCardSection = memo(function PanelCardSection() {
  const body = (
    <div className="flex h-full flex-col justify-center gap-1">
      {DEMO_PANEL_CARD_LINES.map((line) => (
        <div key={line.label} className="flex items-baseline justify-between gap-2">
          <Text size="extraTiny" skin="muted">
            {line.label}
          </Text>
          <Text className="tabular-nums" size="tiny" weight="medium">
            {line.value}
          </Text>
        </div>
      ))}
    </div>
  );

  return (
    <DemoSection
      description="Card dashboard: frame (default · cyber · prime) · density · variant · trạng thái tải/rỗng · nút phóng to."
      importPath="@/shared/ui"
      title="Card dashboard"
    >
      <DemoRow
        label="PanelCard · frame"
        note="prime = khung xịn nhất (nẹp trong + thước chia + quầng rọi góc + ray đáy)"
        stacked
      >
        <DemoGrid min="lg">
          <div className="h-40">
            <PanelCard frame="default" title="Khung default" titleNote="nhẹ" tone="sky">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard frame="cyber" title="Khung cyber" titleNote="đậm nét" tone="sky">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard frame="prime" title="Khung prime" titleNote="mặc định" tone="azure">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard
              frame="prime"
              sweep
              title="Prime + sweep"
              titleNote="panel hero"
              tone="azure"
            >
              {body}
            </PanelCard>
          </div>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="PanelCard · density"
        note="compact = header 28px cho ô lưới chật · relaxed = panel hero / toàn màn hình"
        stacked
      >
        <DemoGrid min="lg">
          <div className="h-40">
            <PanelCard density="compact" title="Compact" titleNote="1.453 máy" tone="teal">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard density="default" title="Default" titleNote="5.531 người" tone="teal">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard density="relaxed" title="Relaxed" titleNote="234/853" tone="teal">
              {body}
            </PanelCard>
          </div>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="PanelCard · variant"
        note="overlay = tấm đè lên viewer 3D/ảnh · plain = card đã nằm trong khung khác"
        stacked
      >
        <DemoGrid min="lg">
          <div className="h-40">
            <PanelCard title="HUD" tone="indigo" variant="hud">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard title="Plain" tone="indigo" variant="plain">
              {body}
            </PanelCard>
          </div>
          <div className="h-40 bg-[linear-gradient(135deg,var(--color-bg-pressed),var(--color-bg-page))] p-3">
            <PanelCard title="Overlay" tone="indigo" variant="overlay">
              {body}
            </PanelCard>
          </div>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="PanelCard · trạng thái + slot"
        note="loading/empty thay THÂN, header giữ nguyên — card không nhảy chiều cao"
        stacked
      >
        <DemoGrid min="lg">
          <div className="h-40">
            <PanelCard loading title="Đang tải" tone="purple">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard empty emptyText="Chưa có số liệu ngày này" title="Rỗng" tone="purple">
              {body}
            </PanelCard>
          </div>
          <div className="h-40">
            <PanelCard
              footer={
                <Text size="extraTiny" skin="muted">
                  Cập nhật 14:52 · 04/09
                </Text>
              }
              right={
                <SegmentToggle
                  fitContent
                  options={[
                    { key: 'actual', label: 'Thực tế' },
                    { key: 'plan', label: 'Kế hoạch' },
                  ]}
                  size="sm"
                  value="actual"
                  onValueChange={() => {}}
                />
              }
              title="Slot phải + chân"
              titleNote="tỷ"
              tone="purple"
              onExpand={() => {}}
            >
              {body}
            </PanelCard>
          </div>
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default PanelCardSection;

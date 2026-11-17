import { memo } from 'react';

import { PanelCard, SegmentToggle, Text } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_PANEL_CARD_LINES } from '../../constants/surfaces-layout/surfaces.constants';

/**
 * Thân mẫu: dòng "nhãn trái · giá trị phải" kiểu System Settings — vạch mảnh giữa các dòng (lùi theo đệm thân, không
 * chạm mép thẻ), nhãn đậm, giá trị mờ thẳng cột. Mật độ là hằng số — không đổi đệm theo theme.
 */
const PANEL_CARD_ROWS_CLASSES = {
  list: 'flex h-full flex-col justify-center divide-y divide-divider-default',
  row: 'flex items-baseline justify-between gap-2 py-1',
  label: 'truncate text-body-13 text-fg-heading',
  value: 'text-body-13 tabular-nums text-fg-muted',
} satisfies Record<'list' | 'row' | 'label' | 'value', string>;

/**
 * PanelCardSection — mục "Card dashboard" của trang `/demo`: `PanelCard` đủ frame, mật độ, trạng thái tải / rỗng.
 */
const PanelCardSection = memo(function PanelCardSection() {
  const body = (
    <div className={PANEL_CARD_ROWS_CLASSES.list}>
      {DEMO_PANEL_CARD_LINES.map((line) => (
        <div key={line.label} className={PANEL_CARD_ROWS_CLASSES.row}>
          <span className={PANEL_CARD_ROWS_CLASSES.label}>{line.label}</span>
          <span className={PANEL_CARD_ROWS_CLASSES.value}>{line.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <DemoSection
      description="Card dashboard: density · variant · trạng thái tải/rỗng · nút phóng to."
      importPath="@/shared/ui"
      title="Card dashboard"
    >
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
        note="hud = khung thẻ mặc định (viền mảnh + bóng nghỉ) · overlay = tấm đè lên viewer 3D/ảnh · plain = card đã nằm trong khung khác"
        stacked
      >
        <DemoGrid min="lg">
          <div className="h-40">
            <PanelCard title="hud · mặc định" tone="indigo" variant="hud">
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

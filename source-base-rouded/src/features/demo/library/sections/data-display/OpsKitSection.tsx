import { memo, useMemo, useState } from 'react';

import {
  Badge,
  HudCallout,
  NoticeBoard,
  StatusBoard,
  Surface,
  Tabs,
  TabsPanel,
  Text,
  showToast,
} from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_OPS_CALLOUTS,
  DEMO_OPS_EQUIPMENT,
  DEMO_OPS_NOTICES,
  DEMO_OPS_STATUS_BADGES,
  DEMO_OPS_TAB_NOTES,
  DEMO_OPS_TABS,
} from '../../constants/data-display/ops-kit.constants';

/** Khung sàn kẻ ô cho mẫu `HudCallout` — nền chìm kẻ ô mảnh (token tự đổi theo theme). */
const OPS_SCENE_CLASSES = [
  'relative h-64 overflow-hidden rounded-lg border border-border-default bg-bg-subtle',
  'bg-[linear-gradient(var(--color-divider-default)_1px,transparent_1px),linear-gradient(90deg,var(--color-divider-default)_1px,transparent_1px)]',
  '[background-size:32px_32px]',
].join(' ');

/**
 * OpsKitSection — mục "Bộ điều hành" của trang `/demo`: những mảnh ghép của màn điều hành xưởng (`/demo/xuong`) —
 * `Badge shape="tag"` · `Tabs variant="folder"` · `NoticeBoard` · `StatusBoard` · `HudCallout`.
 */
const OpsKitSection = memo(function OpsKitSection() {
  const [tab, setTab] = useState(DEMO_OPS_TABS[0].key);

  const notices = useMemo(
    () =>
      DEMO_OPS_NOTICES.map((item) =>
        item.id === 'qr'
          ? { ...item, onSelect: () => showToast('info', 'Mở danh sách tem QR') }
          : item,
      ),
    [],
  );

  return (
    <DemoSection
      description="Mảnh ghép của bảng điều hành: nhãn trạng thái dạng thẻ, tab hồ sơ, danh sách điểm cần chú ý, trạng thái thiết bị, nhãn ghim lên sơ đồ."
      importPath="@/shared/ui"
      title="Bộ điều hành"
    >
      <DemoRow label='Badge · shape="tag"' note="trạng thái trong ô bảng — so với pill mặc định">
        {DEMO_OPS_STATUS_BADGES.map((badge) => (
          <Badge key={badge.label} color={badge.color} shape="tag" size="sm">
            {badge.label}
          </Badge>
        ))}
        {DEMO_OPS_STATUS_BADGES.slice(0, 2).map((badge) => (
          <Badge key={`pill-${badge.label}`} color={badge.color} size="sm">
            {badge.label}
          </Badge>
        ))}
      </DemoRow>

      <DemoRow
        label='Tabs · variant="folder"'
        note="tab hình thang trên vạch đáy — đầu khung chi tiết"
        stacked
      >
        <Tabs options={DEMO_OPS_TABS} value={tab} variant="folder" onValueChange={setTab}>
          {DEMO_OPS_TABS.map((option) => (
            <TabsPanel key={option.key} className="pt-3" value={option.key}>
              <Text size="small" skin="muted">
                {DEMO_OPS_TAB_NOTES[option.key]}
              </Text>
            </TabsPanel>
          ))}
        </Tabs>
      </DemoRow>

      <DemoRow label="NoticeBoard · StatusBoard" stacked>
        <DemoGrid min="lg">
          <Surface padding="md">
            <NoticeBoard items={notices} />
          </Surface>
          <Surface padding="md">
            <StatusBoard items={DEMO_OPS_EQUIPMENT} tone="primary" />
          </Surface>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HudCallout · x / y theo % khung"
        note="điểm neo nằm đúng toạ độ, thẻ nổi phía trên"
        stacked
      >
        <div className={OPS_SCENE_CLASSES}>
          {DEMO_OPS_CALLOUTS.map((callout) => (
            <HudCallout
              key={callout.key}
              status={callout.status}
              statusLabel={callout.statusLabel}
              title={callout.title}
              tone={callout.tone}
              x={callout.x}
              y={callout.y}
            />
          ))}
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default OpsKitSection;

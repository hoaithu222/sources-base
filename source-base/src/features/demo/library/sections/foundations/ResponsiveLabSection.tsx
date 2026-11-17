import { memo, useCallback, useState } from 'react';

import { Callout } from '@/shared/ui';

import DeviceViewportTable from '../../components/responsive-lab/DeviceViewportTable';
import LiveMetricsPanel from '../../components/responsive-lab/LiveMetricsPanel';
import type { DemoViewport } from '../../components/responsive-lab/responsive-lab.types';
import VariantMatchChips from '../../components/responsive-lab/VariantMatchChips';
import ViewportFramePanel from '../../components/responsive-lab/ViewportFramePanel';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import {
  DEMO_DEVICE_GROUPS,
  DEMO_FRAME_TARGETS,
  DEMO_QUICK_VIEWPORTS,
  DEMO_VARIANT_PROBE_GROUPS,
} from '../../constants/foundations/responsive-lab.constants';
import { useIsEmbeddedFrame } from '../../hooks/useIsEmbeddedFrame';

/**
 * ResponsiveLabSection — mục "Responsive lab" của trang `/demo`: số đo trực tiếp của khung nhìn, chip biến thể
 * (`touch:` · `phone:` · `max-wide:` · bậc bề rộng) đang khớp hay không, bảng thiết bị → viewport và khung xem
 * thử dựng đúng cỡ đã chọn để soi bố cục ở mọi cỡ màn mà không cần đổi thiết bị.
 *
 * Trong khung xem thử (trang tự nạp lại chính nó) khu vực này chỉ còn số đo + chip — không lồng khung.
 */
const ResponsiveLabSection = memo(function ResponsiveLabSection() {
  const embedded = useIsEmbeddedFrame();
  const [viewport, setViewport] = useState<DemoViewport | null>(null);
  const [targetKey, setTargetKey] = useState(DEMO_FRAME_TARGETS[0].key);

  const handleRotate = useCallback(
    () =>
      setViewport((prev) => (prev ? { ...prev, width: prev.height, height: prev.width } : prev)),
    [],
  );

  return (
    <DemoSection
      description="Đo trực tiếp khung nhìn, đối chiếu biến thể đang khớp và xem bố cục ở từng cỡ máy chuẩn."
      importPath="docs/rules/display/responsive-screens.md"
      title="Responsive lab"
    >
      <DemoRow label="Số đo trực tiếp" note="đổi ngay khi kéo cỡ cửa sổ, xoay máy, bật TV" stacked>
        <LiveMetricsPanel />
      </DemoRow>

      <VariantMatchChips groups={DEMO_VARIANT_PROBE_GROUPS} />

      {embedded ? (
        <Callout
          description="Số đo và chip ở trên là của CHÍNH khung này (bề rộng / cao mô phỏng)."
          intent="info"
          title="Đang chạy trong khung xem thử"
        />
      ) : (
        <>
          <DemoRow label="Thiết bị → viewport" note="bấm một cỡ để xem ở khung đó" stacked>
            <DeviceViewportTable
              active={viewport}
              groups={DEMO_DEVICE_GROUPS}
              onPick={setViewport}
            />
          </DemoRow>

          <DemoRow label="Khung xem thử" note="trang thật nạp trong iframe đúng cỡ đã chọn" stacked>
            <ViewportFramePanel
              presets={DEMO_QUICK_VIEWPORTS}
              targetKey={targetKey}
              targets={DEMO_FRAME_TARGETS}
              viewport={viewport}
              onPickViewport={setViewport}
              onRotate={handleRotate}
              onTargetChange={setTargetKey}
            />
          </DemoRow>
        </>
      )}
    </DemoSection>
  );
});

export default ResponsiveLabSection;

import { memo, useCallback, useState } from 'react';

import { Badge, HudCorners, HudFrame, HudInfoBox, Text, type HudCornerVariant } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_TITLE_TONES } from '../../constants/surfaces-layout/surfaces.constants';

const CORNER_VARIANTS: readonly HudCornerVariant[] = ['bracket', 'dot', 'chamfer', 'none'];

/**
 * HudSection — mục "Khung HUD" của trang `/demo`: `HudFrame` · `HudCorners` · `HudInfoBox`.
 */
const HudSection = memo(function HudSection() {
  const [boxSelected, setBoxSelected] = useState(true);
  const toggleBoxSelected = useCallback(() => setBoxSelected((value) => !value), []);

  return (
    <DemoSection
      description="HudFrame (tone · intensity · weight · notch/corners/glow/scanlines) · HudCorners · HudInfoBox."
      importPath="@/shared/ui"
      title="Khung HUD"
    >
      <DemoRow
        label="HudFrame · tone (12 giá trị TitleIconColor)"
        note="theme sáng: viền + ngoặc sắc nét, bóng đổ mềm · theme tối: thêm quầng tone"
        stacked
      >
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {DEMO_TITLE_TONES.map((tone) => (
            <HudFrame key={tone} tone={tone}>
              <div className="p-2">
                <Text className="font-mono" size="extraTiny">
                  {tone}
                </Text>
              </div>
            </HudFrame>
          ))}
        </div>
      </DemoRow>

      <DemoRow label="HudFrame · intensity" note="default nhẹ nhàng · cyber cho panel hero" stacked>
        <DemoGrid min="lg">
          <HudFrame intensity="default" tone="sky">
            <div className="p-3">
              <Text size="tiny" weight="medium">
                intensity=&quot;default&quot;
              </Text>
            </div>
          </HudFrame>
          <HudFrame intensity="cyber" scanlines tone="sky">
            <div className="p-3">
              <Text size="tiny" weight="medium">
                intensity=&quot;cyber&quot; scanlines
              </Text>
            </div>
          </HudFrame>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HudFrame · weight"
        note="hairline cho lưới card dày (20+) — bracket 1px, quầng ôm sát"
        stacked
      >
        <DemoGrid min="lg">
          <HudFrame tone="purple" weight="regular">
            <div className="p-3">
              <Text size="tiny" weight="medium">
                weight=&quot;regular&quot;
              </Text>
            </div>
          </HudFrame>
          <HudFrame tone="purple" weight="hairline">
            <div className="p-3">
              <Text size="tiny" weight="medium">
                weight=&quot;hairline&quot;
              </Text>
            </div>
          </HudFrame>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HudFrame · notch / corners / glow / notchSize"
        note="tắt riêng từng lớp trang trí — hoặc phóng notchSize cho cạnh vát rõ hơn"
        stacked
      >
        <DemoGrid min="sm">
          <HudFrame notch={false} tone="teal">
            <div className="p-2">
              <Text size="extraTiny">notch=false</Text>
            </div>
          </HudFrame>
          <HudFrame corners={false} tone="teal">
            <div className="p-2">
              <Text size="extraTiny">corners=false</Text>
            </div>
          </HudFrame>
          <HudFrame glow={false} tone="teal">
            <div className="p-2">
              <Text size="extraTiny">glow=false</Text>
            </div>
          </HudFrame>
          <HudFrame notchSize={22} tone="teal">
            <div className="p-2">
              <Text size="extraTiny">notchSize=22</Text>
            </div>
          </HudFrame>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HudCorners · variant"
        note="lớp góc trang trí tự đặt trong khung relative; màu theo biến --hud-c"
        stacked
      >
        <DemoGrid min="xs">
          {CORNER_VARIANTS.map((variant) => (
            <div
              key={variant}
              className="relative flex h-16 items-center justify-center [--hud-c:var(--color-sky-5)]"
            >
              <HudCorners frame={variant === 'none'} size={10} thickness={2} variant={variant} />
              <Text className="font-mono" size="extraTiny" skin="muted">
                {variant}
              </Text>
            </div>
          ))}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="HudInfoBox"
        note="header tuỳ chọn (icon+title+headerRight) · onClick+selected → card chọn được"
        stacked
      >
        <DemoGrid min="md">
          <HudInfoBox
            headerRight={
              <Badge color="info" variant="tinted">
                12
              </Badge>
            }
            icon="shield-outline"
            title="An toàn lao động"
            tone="sky"
          >
            <Text size="extraTiny" skin="muted">
              title là chuỗi → tiêu đề đậm chuẩn; headerRight cho số đếm.
            </Text>
          </HudInfoBox>
          <HudInfoBox
            icon="bolt-lightning-outline"
            selected={boxSelected}
            title={boxSelected ? 'Đang chọn' : 'Bấm để chọn'}
            tone="warning"
            onClick={toggleBoxSelected}
          >
            <Text size="extraTiny" skin="muted">
              onClick + selected → role=&quot;button&quot; (Tab + Enter / Space), viền / nền sáng
              hơn khi chọn.
            </Text>
          </HudInfoBox>
          <HudInfoBox tone="error">
            <Text size="extraTiny" skin="muted">
              Không truyền icon/title/headerRight → ẩn hẳn header.
            </Text>
          </HudInfoBox>
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default HudSection;

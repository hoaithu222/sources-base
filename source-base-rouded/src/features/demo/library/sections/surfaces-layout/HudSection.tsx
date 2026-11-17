import { memo, useCallback, useState } from 'react';

import { Badge, HudFrame, HudInfoBox, Text } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * HudSection — mục "Khung thẻ" của trang `/demo`: `HudFrame` · `HudInfoBox` — khung thẻ / panel bo `lg`, viền mảnh, cùng
 * một hình ở cả hai theme.
 */
const HudSection = memo(function HudSection() {
  const [boxSelected, setBoxSelected] = useState(true);
  const toggleBoxSelected = useCallback(() => setBoxSelected((value) => !value), []);

  return (
    <DemoSection
      description="HudFrame · HudInfoBox — khung thẻ / panel bo lg, viền mảnh bắt sáng từ trên, bóng nghỉ mảnh; cùng một hình ở sáng và tối."
      importPath="@/shared/ui"
      title="Khung thẻ"
    >
      <DemoRow
        label="HudFrame"
        note="chỉ là khung: không header, không đệm thân (nơi dùng tự đệm) · glow=false bỏ bóng nghỉ — cho lưới thẻ dày"
        stacked
      >
        <DemoGrid min="lg">
          <HudFrame>
            <div className="p-3">
              <Text size="tiny" weight="medium">
                mặc định
              </Text>
            </div>
          </HudFrame>
          <HudFrame glow={false}>
            <div className="p-3">
              <Text size="tiny" weight="medium">
                glow=false
              </Text>
            </div>
          </HudFrame>
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

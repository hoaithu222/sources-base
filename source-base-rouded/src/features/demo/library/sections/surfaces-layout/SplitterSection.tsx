import { memo } from 'react';

import { Splitter, Surface, Text } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * SplitterSection — mục "Chia khung" của trang `/demo`: `Splitter` đủ hướng, phía giữ cỡ và giới hạn px / %.
 */
const SplitterSection = memo(function SplitterSection() {
  return (
    <DemoSection
      description="Splitter — hai vùng kéo đổi kích thước, giới hạn bằng px hoặc %."
      importPath="@/shared/ui"
      title="Chia khung"
    >
      <DemoRow
        label="Splitter · orientation + sizedSide + initialSize/minSize/maxSize (px & %)"
        note="kéo tay nắm, hoặc Tab tới tay nắm rồi bấm ← → / ↑ ↓ (giữ Shift để bước dài)"
        stacked
      >
        <DemoGrid min="lg">
          <Surface className="h-56">
            <Splitter initialSize={240} maxSize="60%" minSize={160} orientation="horizontal">
              <div className="flex h-full flex-col gap-1 p-3">
                <Text size="tiny" weight="medium">
                  sizedSide=&quot;first&quot; (mặc định)
                </Text>
                <Text size="extraTiny" skin="muted">
                  initialSize=240px · minSize=160px · maxSize=&quot;60%&quot;
                </Text>
              </div>
              <div className="h-full bg-bg-subtle p-3">
                <Text size="extraTiny" skin="muted">
                  Pane còn lại — flex-1.
                </Text>
              </div>
            </Splitter>
          </Surface>
          <Surface className="h-56">
            <Splitter initialSize={160} sizedSide="second">
              <div className="h-full bg-bg-subtle p-3">
                <Text size="extraTiny" skin="muted">
                  Pane còn lại — flex-1.
                </Text>
              </div>
              <div className="flex h-full flex-col gap-1 p-3">
                <Text size="tiny" weight="medium">
                  sizedSide=&quot;second&quot;
                </Text>
                <Text size="extraTiny" skin="muted">
                  Pane THỨ HAI giữ kích thước cố định (160px).
                </Text>
              </div>
            </Splitter>
          </Surface>
          <Surface className="h-56 lg:col-span-2">
            <Splitter initialSize="30%" maxSize="70%" minSize="20%" orientation="vertical">
              <div className="flex h-full flex-col gap-1 p-3">
                <Text size="tiny" weight="medium">
                  orientation=&quot;vertical&quot;
                </Text>
                <Text size="extraTiny" skin="muted">
                  Pane trên — initialSize=&quot;30%&quot; · minSize=&quot;20%&quot; ·
                  maxSize=&quot;70%&quot;.
                </Text>
              </div>
              <div className="h-full bg-bg-subtle p-3">
                <Text size="extraTiny" skin="muted">
                  Pane dưới — flex-1.
                </Text>
              </div>
            </Splitter>
          </Surface>
        </DemoGrid>
      </DemoRow>
    </DemoSection>
  );
});

export default SplitterSection;

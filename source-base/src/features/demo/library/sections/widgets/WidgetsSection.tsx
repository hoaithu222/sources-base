import { memo, useState } from 'react';

import { Badge, Button, CardScreenshot, Text } from '@/shared/ui';
import { images } from '@/assets/image';
import { CHART_STATUS, ProgressDonutChart } from '@/shared/charts';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { useProgressCenterDemo } from '../../hooks/useProgressCenterDemo';

const SHOT_SRC = images['folder-fill'];

/**
 * WidgetsSection — mục "Widget dựng sẵn" của trang `/demo`: `CardScreenshot` · `ProgressDonutChart` · `ProgressCenter` (tải lên + tác vụ dài).
 */
const WidgetsSection = memo(function WidgetsSection() {
  const progressDemo = useProgressCenterDemo(SHOT_SRC);
  const [shotCount, setShotCount] = useState(0);

  return (
    <DemoSection
      description="CardScreenshot · ProgressDonutChart · ProgressCenter (tải lên + tác vụ dài)."
      importPath="@/shared/widgets/progress-center · @/shared/charts · @/shared/ui"
      title="Widget dựng sẵn"
    >
      <DemoRow
        label="CardScreenshot · variant + aspect"
        note="rounded/aspect/size là 3 trục độc lập — xem docblock"
        stacked
      >
        <DemoGrid min="sm">
          <CardScreenshot
            description="variant=default · aspect=4:3"
            src={SHOT_SRC}
            title="Mặt bằng tầng 3"
          />
          <CardScreenshot
            aspect="16:9"
            description="variant=ghost · aspect=16:9 · rounded=lg"
            rounded="lg"
            src={SHOT_SRC}
            title="Phối cảnh tổng thể"
            variant="ghost"
          />
          <CardScreenshot
            aspect="square"
            description="variant=solid · rounded=none"
            rounded="none"
            src={SHOT_SRC}
            title="Ảnh hiện trường"
            variant="solid"
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="CardScreenshot · overlay + captionPos + badge + actionIcons + footer"
        note="captionPos=overlay ⇒ chữ chốt sáng cố định, không lật theo theme"
        stacked
      >
        <DemoGrid min="sm">
          <CardScreenshot
            actionIcons={[
              { name: 'eye-bold', label: 'Xem' },
              { name: 'trash-bold', label: 'Xóa', onClick: () => setShotCount((n) => n + 1) },
            ]}
            badge={
              <Badge color="success" variant="tinted">
                Đã duyệt
              </Badge>
            }
            captionPos="overlay"
            description={`overlay + gradient · đã bấm xóa ${shotCount} lần`}
            overlay="gradient"
            src={SHOT_SRC}
            title="Nghiệm thu đợt 2"
          />
          <CardScreenshot
            footer={
              <Text size="extraTiny" skin="muted">
                Slot footer — meta, tag, tiến độ…
              </Text>
            }
            preview
            src={SHOT_SRC}
            title="preview ⇒ bấm ảnh mở lightbox"
          />
          <CardScreenshot
            description="Không có src ⇒ khung placeholder"
            title="Chưa có ảnh"
            variant="ghost"
          />
        </DemoGrid>
      </DemoRow>

      <DemoRow label="ProgressDonutChart · pct / donePct / centerLabel" stacked>
        <div className="flex flex-wrap items-center gap-4">
          <ProgressDonutChart className="aspect-square h-24" color={CHART_STATUS.done} pct={82} />
          <ProgressDonutChart
            className="aspect-square h-24"
            color={CHART_STATUS.slow}
            donePct={30}
            pct={64}
          />
          <ProgressDonutChart
            centerLabel="4/10"
            className="aspect-square h-24"
            color="fg-muted"
            pct={40}
          />
        </div>
      </DemoRow>

      <DemoRow
        label="ProgressCenter · hàng đợi tải lên + tác vụ chạy dài"
        note="rail đã mount sẵn ở AppOverlays — bấm nút rồi nhìn xuống góc dưới phải. Thẻ xong tự đóng (rê chuột vào thì dừng đếm); thẻ lỗi ở lại và mở sẵn danh sách tệp"
        stacked
        width="narrow"
      >
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="stroke" onClick={progressDemo.uploadOk}>
            Tải lên 2 tệp giả
          </Button>
          <Button size="sm" variant="stroke" onClick={progressDemo.uploadWithError}>
            Tải lên 3 tệp, 1 tệp lỗi
          </Button>
          <Button size="sm" variant="stroke" onClick={progressDemo.importOk}>
            Chạy một lần nhập Excel giả
          </Button>
          <Button size="sm" variant="stroke" onClick={progressDemo.importFail}>
            Nhập Excel bị hỏng giữa chừng
          </Button>
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default WidgetsSection;

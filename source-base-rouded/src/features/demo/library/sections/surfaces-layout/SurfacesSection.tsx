import { memo, useCallback, useState } from 'react';

import { Badge, BoxInfo, BoxPanel, Button, Text } from '@/shared/ui';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';
import { DEMO_BOX_INFO_ITEMS_FULL } from '../../constants/surfaces-layout/surfaces.constants';

/**
 * SurfacesSection — mục "Mặt nền" của trang `/demo`: `BoxPanel` · `BoxInfo`.
 */
const SurfacesSection = memo(function SurfacesSection() {
  const [boxInfoOpen, setBoxInfoOpen] = useState(true);
  const openBoxInfo = useCallback(() => setBoxInfoOpen(true), []);
  const closeBoxInfo = useCallback(() => setBoxInfoOpen(false), []);

  return (
    <DemoSection description="BoxPanel · BoxInfo." importPath="@/shared/ui" title="Mặt nền">
      <DemoRow
        label="BoxPanel · variant + border + headerDivider + headerRight + footer + description"
        note="default = vạch nhấn + tiêu đề đậm · cyber = header kiểu DetailPanelHeader"
        stacked
      >
        <DemoGrid min="lg">
          <BoxPanel
            border="hairline"
            description="description — dòng phụ dưới tiêu đề, chỉ có ở variant default"
            headerRight={
              <Button size="xs" variant="stroke">
                Thêm
              </Button>
            }
            title="Panel mặc định · hairline"
          >
            <div className="p-2">
              <Text size="small" skin="muted">
                Thân panel trần — nội dung chữ tự đệm p-2, bảng / cây thì tràn mép.
              </Text>
            </div>
          </BoxPanel>
          <BoxPanel
            border="hairline"
            footer={
              <Text size="extraTiny" skin="muted">
                Cập nhật 5 phút trước
              </Text>
            }
            headerDivider
            headerRight={
              <Badge color="info" variant="tinted">
                12
              </Badge>
            }
            title="Cyber + vạch ngăn + footer"
            variant="cyber"
          >
            <div className="p-2">
              <Text size="small" skin="muted">
                Biến thể cyber dùng cho panel chi tiết.
              </Text>
            </div>
          </BoxPanel>
          <BoxPanel border="strong" headerDivider title="Panel đứng riêng · strong">
            <div className="p-2">
              <Text size="small" skin="muted">
                Viền 2px cho khối ngoài cùng của trang.
              </Text>
            </div>
          </BoxPanel>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="BoxInfo · total + 8 màu BoxInfoItemColor + onClose + children"
        note="đóng rồi bấm nút dưới để mở lại — chứng minh onClose là control thật"
        stacked
      >
        {boxInfoOpen ? (
          <BoxInfo
            className="max-w-sm"
            items={DEMO_BOX_INFO_ITEMS_FULL}
            title="Nghiệm thu theo trạng thái"
            total={{ label: 'Tổng hồ sơ', value: 135 }}
            onClose={closeBoxInfo}
          >
            <Text size="extraTiny" skin="muted">
              Nội dung tuỳ ý sau danh sách items (slot children).
            </Text>
          </BoxInfo>
        ) : (
          <Button size="sm" variant="stroke" onClick={openBoxInfo}>
            Mở lại BoxInfo
          </Button>
        )}
      </DemoRow>
    </DemoSection>
  );
});

export default SurfacesSection;

import { memo, useState } from 'react';

import {
  Button,
  Drawer,
  FilterDisclosure,
  Modal,
  ModalCloseButton,
  Popover,
  SegmentToggle,
  Text,
  Toggle,
  showToast,
} from '@/shared/ui';

import {
  FILTER_VIEW_OPTIONS,
  LONG_MODAL_TITLE,
  PHONE_MODAL_DEMO_LABELS,
  PHONE_OVERLAY_DEMO_LABELS,
  type PhoneOverlayDemo,
} from '../../constants/feedback-overlays/overlays-phone.constants';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * OverlaysPhoneSection — mục "Lớp nổi trên điện thoại" của trang `/demo`: bottom-sheet chuẩn (`Drawer
 * side="bottom"`) · `Modal` tiêu đề / thân dài · `Popover` → ngăn kéo (`sheetOnPhone`) · `FilterDisclosure`.
 */
const OverlaysPhoneSection = memo(function OverlaysPhoneSection() {
  const [demo, setDemo] = useState<PhoneOverlayDemo | null>(null);
  const [view, setView] = useState('month');
  const [archived, setArchived] = useState(false);
  const [compare, setCompare] = useState(false);

  const fillerLines = (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 30 }, (_, index) => (
        <Text key={index} size="small" skin="muted">
          {`Dòng nội dung số ${index + 1}`}
        </Text>
      ))}
    </div>
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) setDemo(null);
  };
  const activeCount = [view !== 'month', archived, compare].filter(Boolean).length;
  const viewLabel = FILTER_VIEW_OPTIONS.find((option) => option.key === view)?.label ?? '';
  const summary = [viewLabel, archived ? 'Cả lưu trữ' : null, compare ? 'So sánh' : null]
    .filter(Boolean)
    .join(' · ');
  const resetFilters = () => {
    setView('month');
    setArchived(false);
    setCompare(false);
  };

  return (
    <DemoSection
      description="Bottom-sheet chuẩn · Modal tiêu đề / thân dài · Popover → ngăn kéo · FilterDisclosure — thu cửa sổ < 768px hoặc mở trên điện thoại để thấy."
      importPath="@/shared/ui"
      title="Lớp nổi trên điện thoại"
    >
      <DemoRow
        label="Drawer · side=bottom"
        note="tay nắm kéo-xuống-đóng · cao theo nội dung · header canh giữa theo ✕ · đáy cộng --safe-b"
      >
        {PHONE_OVERLAY_DEMO_LABELS.map((item) => (
          <Button key={item.key} size="sm" variant="stroke" onClick={() => setDemo(item.key)}>
            {item.label}
          </Button>
        ))}
      </DemoRow>

      <DemoRow
        label="Modal · tiêu đề dài / thân dài"
        note="tiêu đề xuống dòng · thân cuộn · footer đứng yên"
      >
        {PHONE_MODAL_DEMO_LABELS.map((item) => (
          <Button key={item.key} size="sm" variant="stroke" onClick={() => setDemo(item.key)}>
            {item.label}
          </Button>
        ))}
      </DemoRow>

      <DemoRow
        label="ModalCloseButton"
        note="✕ chung của mọi lớp nổi: 32px (tablet / điện thoại 40px) · vùng chạm 44px · aria-label Đóng"
      >
        <ModalCloseButton onClick={() => showToast('info', 'ModalCloseButton.onClick đã gọi')} />
      </DemoRow>

      <DemoRow
        label="Popover · sheetOnPhone"
        note="điện thoại: hiện thành ngăn kéo đáy có ✕; laptop / tablet: panel nổi như thường"
      >
        <Popover
          content={
            <div className="flex w-64 flex-col gap-2 p-3">
              <Text size="small" skin="muted">
                Nội dung chi tiết dài / nhiều điều khiển.
              </Text>
              <Toggle checked={archived} label="Cả lưu trữ" onCheckedChange={setArchived} />
              <Toggle checked={compare} label="So sánh kỳ trước" onCheckedChange={setCompare} />
            </div>
          }
          sheetOnPhone="Bộ lọc nhanh"
        >
          <Button size="sm" variant="stroke">
            Mở chi tiết
          </Button>
        </Popover>
      </DemoRow>

      <DemoRow
        label="FilterDisclosure"
        note="điện thoại: một thanh 44px bung tại chỗ + Đặt lại; ≥ 768px: điều khiển vẽ nguyên tại chỗ"
        stacked
      >
        <div className="flex flex-wrap items-center gap-2">
          <FilterDisclosure
            activeCount={activeCount}
            className="w-full"
            summary={summary}
            onReset={resetFilters}
          >
            <SegmentToggle options={FILTER_VIEW_OPTIONS} value={view} onValueChange={setView} />
            <Toggle checked={archived} label="Cả lưu trữ" onCheckedChange={setArchived} />
            <Toggle checked={compare} label="So sánh kỳ trước" onCheckedChange={setCompare} />
          </FilterDisclosure>
        </div>
      </DemoRow>

      <Drawer
        open={demo === 'sheet-short'}
        side="bottom"
        title="Bộ lọc"
        onOpenChange={handleOpenChange}
      >
        <Text size="small" skin="muted">
          Sheet cao theo nội dung — không khoảng trống thừa bên dưới.
        </Text>
      </Drawer>

      <Drawer
        open={demo === 'sheet-long'}
        side="bottom"
        title="Danh sách dài"
        onOpenChange={handleOpenChange}
      >
        {fillerLines}
      </Drawer>

      <Drawer
        footer={
          <Button size="sm" variant="primary" onClick={() => setDemo(null)}>
            Áp dụng
          </Button>
        }
        open={demo === 'sheet-footer'}
        side="bottom"
        title="Sheet có footer"
        onOpenChange={handleOpenChange}
      >
        <Text size="small" skin="muted">
          Footer cộng vùng an toàn đáy; thân p-4.
        </Text>
      </Drawer>

      <Modal
        open={demo === 'modal-long-title'}
        title={LONG_MODAL_TITLE}
        onCancel={() => setDemo(null)}
        onConfirm={() => setDemo(null)}
        onOpenChange={handleOpenChange}
      >
        <Text size="small" skin="muted">
          Tiêu đề dài xuống dòng đủ câu ở tablet / điện thoại, X canh giữa theo khối tiêu đề.
        </Text>
      </Modal>

      <Modal
        open={demo === 'modal-long-body'}
        title="Thân dài"
        onCancel={() => setDemo(null)}
        onConfirm={() => setDemo(null)}
        onOpenChange={handleOpenChange}
      >
        {fillerLines}
      </Modal>
    </DemoSection>
  );
});

export default OverlaysPhoneSection;

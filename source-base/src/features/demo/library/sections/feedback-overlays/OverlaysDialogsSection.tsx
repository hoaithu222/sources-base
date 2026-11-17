import { memo, useCallback, useState } from 'react';

import {
  Button,
  CustomModalLayout,
  Drawer,
  DrawerSection,
  type DrawerSide,
  type DrawerSize,
  Modal,
  Progress,
  SegmentToggle,
  Text,
  Toggle,
  showToast,
} from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';

import {
  DRAWER_SIDE_OPTIONS,
  DRAWER_SIZE_OPTIONS,
  MODAL_AXIS_DEMOS,
  type ModalDemoPreset,
  MODAL_SIZE_DEMOS,
} from '../../constants/feedback-overlays/overlays.constants';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

/**
 * OverlaysDialogsSection — mục "Hộp thoại & ngăn kéo" của trang `/demo`: `Modal` · `CustomModalLayout` · `Drawer`.
 */
const OverlaysDialogsSection = memo(function OverlaysDialogsSection() {
  const [modalPreset, setModalPreset] = useState<ModalDemoPreset | null>(null);

  const drawer = useDisclosure();
  const [drawerSide, setDrawerSide] = useState<DrawerSide>('right');
  const [drawerSize, setDrawerSize] = useState<DrawerSize>('md');
  const [drawerShowClose, setDrawerShowClose] = useState(true);

  const notifyLayoutClosed = useCallback(() => {
    showToast('info', 'CustomModalLayout.onClose() đã gọi');
  }, []);

  return (
    <DemoSection
      description="Modal · CustomModalLayout · Drawer — lớp nổi chặn thao tác nền."
      importPath="@/shared/ui · useDisclosure"
      title="Hộp thoại"
    >
      <DemoRow label="Modal · size">
        {MODAL_SIZE_DEMOS.map((preset) => (
          <Button
            key={preset.key}
            size="sm"
            variant="stroke"
            onClick={() => setModalPreset(preset)}
          >
            {preset.key}
          </Button>
        ))}
      </DemoRow>

      <DemoRow label="Modal · frame / showClose / loading / noPadding / footer">
        {MODAL_AXIS_DEMOS.map((preset) => (
          <Button
            key={preset.key}
            size="sm"
            variant="stroke"
            onClick={() => setModalPreset(preset)}
          >
            {preset.label}
          </Button>
        ))}
      </DemoRow>

      {modalPreset && (
        <Modal
          description="Mô tả ngắn dưới tiêu đề — thẳng cột với chữ tiêu đề."
          footer={
            modalPreset.customFooter ? (
              <div className="flex w-full items-center justify-between gap-3">
                <Text size="tiny" skin="muted">
                  Footer tuỳ biến — không phải cặp Huỷ/Xác nhận mặc định.
                </Text>
                <Button size="sm" variant="primary" onClick={() => setModalPreset(null)}>
                  Đã hiểu
                </Button>
              </div>
            ) : undefined
          }
          frame={modalPreset.frame ?? 'default'}
          loading={modalPreset.loading ?? false}
          noPadding={modalPreset.noPadding ?? false}
          open
          showClose={modalPreset.showClose ?? true}
          size={modalPreset.size ?? 'md'}
          title={modalPreset.label}
          onCancel={modalPreset.customFooter ? undefined : () => setModalPreset(null)}
          onConfirm={modalPreset.customFooter ? undefined : () => setModalPreset(null)}
          onOpenChange={(next) => !next && setModalPreset(null)}
        >
          <Text size="small" skin="muted">
            Thân hộp thoại minh hoạ {modalPreset.label}.
          </Text>
        </Modal>
      )}

      <DemoRow
        label="CustomModalLayout"
        note="border/bg thêm tay — bản gốc trông cậy panel cha (Modal) cấp nền"
        stacked
      >
        <CustomModalLayout
          className="w-full max-w-md border border-border-default bg-bg-surface"
          footer={
            <Button size="sm" variant="secondary" onClick={notifyLayoutClosed}>
              Đóng
            </Button>
          }
          title="Khung panel thuần"
          onClose={notifyLayoutClosed}
        >
          <Text size="small" skin="muted">
            Header (title + close) · body cuộn riêng · footer + divider — cùng token với Modal.
          </Text>
        </CustomModalLayout>
      </DemoRow>

      <DemoRow label="Drawer · side / size / showClose / footer" stacked>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentToggle
            options={DRAWER_SIDE_OPTIONS}
            value={drawerSide}
            onValueChange={(v) => setDrawerSide(v as DrawerSide)}
          />
          <SegmentToggle
            options={DRAWER_SIZE_OPTIONS}
            value={drawerSize}
            onValueChange={(v) => setDrawerSize(v as DrawerSize)}
          />
          <Toggle
            checked={drawerShowClose}
            label="showClose"
            onCheckedChange={setDrawerShowClose}
          />
          <Button size="sm" variant="secondary" onClick={drawer.open}>
            Mở ngăn kéo
          </Button>
        </div>
        <Drawer
          description={`side="${drawerSide}" · size="${drawerSize}"`}
          footer={
            <Button size="sm" variant="primary" onClick={drawer.close}>
              Đóng
            </Button>
          }
          open={drawer.isOpen}
          showClose={drawerShowClose}
          side={drawerSide}
          size={drawerSize}
          title="Ngăn kéo"
          onOpenChange={drawer.onOpenChange}
        >
          <div className="flex flex-col gap-3">
            <Text size="small" skin="muted">
              Bảng chi tiết bên cạnh danh sách — không mất ngữ cảnh như hộp thoại che kín màn.
            </Text>
            <DrawerSection
              icon="chart-line-bold"
              title="DrawerSection · tone primary"
              tone="primary"
            >
              <Progress showValue value={64} />
            </DrawerSection>
            <DrawerSection icon="clipboard-bold" title="tone info (mặc định)">
              <Text size="small">Mỗi vùng thông tin một tông để mắt tách vùng ngay.</Text>
            </DrawerSection>
            <DrawerSection icon="triangle-exclamation-bold" title="tone warning" tone="warning">
              <Text size="small">Có 2 hạng mục chậm tiến độ cần xử lý.</Text>
            </DrawerSection>
          </div>
        </Drawer>
      </DemoRow>
    </DemoSection>
  );
});

export default OverlaysDialogsSection;

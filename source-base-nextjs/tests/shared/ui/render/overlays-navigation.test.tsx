/**
 * Render nông — nhóm `overlays` · `navigation` (`tests/helpers/render-suite.tsx`).
 */

import { createRef } from 'react';

import {
  ConfirmDialog,
  CustomModalLayout,
  Drawer,
  DrawerSection,
  FormModal,
  Modal,
  ModalCloseButton,
  Pagination,
  Popover,
  ScrollEdgeNav,
  Stepper,
  Tabs,
  TabsPanel,
  Toast,
  ToastContainer,
  ToastProvider,
  ToastViewport,
  Tooltip,
} from '@/shared/ui';
import { describeRenderSuite, renderCase, type RenderCase } from '@tests/helpers/render-suite';

const noop = () => {};

const CASES: RenderCase[] = [
  // overlays
  // Nút mở là phần tử con DUY NHẤT (Radix `asChild`) — chữ trần làm Popover ném lỗi.
  renderCase(
    'Popover',
    <Popover content={<span>nội dung</span>}>
      <button type="button">mở</button>
    </Popover>,
  ),
  renderCase(
    'Tooltip',
    <Tooltip content="chú thích">
      <span>hover</span>
    </Tooltip>,
  ),
  renderCase(
    'Modal',
    <Modal open title="Hộp thoại" onOpenChange={noop}>
      nội dung
    </Modal>,
  ),
  renderCase(
    'ConfirmDialog',
    <ConfirmDialog open title="Xoá?" onConfirm={noop} onOpenChange={noop} />,
  ),
  renderCase(
    'FormModal',
    <FormModal open title="Thêm mục" onOpenChange={noop}>
      nội dung
    </FormModal>,
  ),
  renderCase(
    'Drawer',
    <Drawer open title="Ngăn kéo" onOpenChange={noop}>
      nội dung
    </Drawer>,
  ),
  renderCase(
    'DrawerSection',
    <DrawerSection icon="clipboard-bold" title="Thông tin" tone="warning">
      nội dung
    </DrawerSection>,
  ),
  renderCase('CustomModalLayout', <CustomModalLayout>nội dung</CustomModalLayout>),
  renderCase('ModalCloseButton', <ModalCloseButton onClick={noop} />),
  renderCase(
    'ToastProvider',
    <ToastProvider>
      <span>app</span>
    </ToastProvider>,
  ),
  renderCase(
    'Toast',
    <ToastProvider>
      <Toast open title="Đã lưu" type="success" onOpenChange={noop} />
      <ToastViewport />
    </ToastProvider>,
  ),
  renderCase(
    'ToastViewport',
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>,
  ),
  renderCase('ToastContainer', <ToastContainer />),

  // navigation
  renderCase('Tabs', <Tabs options={[{ key: 'a', label: 'A' }]} value="a" />),
  renderCase(
    'TabsPanel',
    <Tabs options={[{ key: 'a', label: 'A' }]} value="a">
      <TabsPanel value="a">nội dung</TabsPanel>
    </Tabs>,
  ),
  renderCase('Stepper', <Stepper activeStep={0} steps={[{ key: 'a', label: 'Bước A' }]} />),
  renderCase(
    'Pagination',
    <Pagination
      pageCount={3}
      pageIndex={1}
      pageSize={10}
      total={30}
      onPageChange={noop}
      onPageSizeChange={noop}
    />,
  ),
  // `ScrollEdgeNav` đo `scrollWidth` của vùng cuộn SỐNG để quyết hiện mũi tên — ở đây chỉ kiểm
  // dựng được khi vùng cuộn chưa gắn; hành vi thật đã phủ qua `Table` (data-display).
  renderCase(
    'ScrollEdgeNav',
    <div className="group/scroll-edge relative">
      <ScrollEdgeNav targetRef={createRef<HTMLElement>()} />
    </div>,
  ),
];

describeRenderSuite('overlays-navigation', CASES);

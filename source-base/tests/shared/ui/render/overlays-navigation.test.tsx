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
import { describeRenderSuite, type RenderCase } from '@tests/helpers/render-suite';

const noop = () => {};

const CASES: RenderCase[] = [
  // overlays
  // Nút mở là phần tử con DUY NHẤT (Radix `asChild`) — chữ trần làm Popover ném lỗi.
  [
    'Popover',
    <Popover content={<span>nội dung</span>}>
      <button type="button">mở</button>
    </Popover>,
  ],
  [
    'Tooltip',
    <Tooltip content="chú thích">
      <span>hover</span>
    </Tooltip>,
  ],
  [
    'Modal',
    <Modal open title="Hộp thoại" onOpenChange={noop}>
      nội dung
    </Modal>,
  ],
  ['ConfirmDialog', <ConfirmDialog open title="Xoá?" onConfirm={noop} onOpenChange={noop} />],
  [
    'FormModal',
    <FormModal open title="Thêm mục" onOpenChange={noop}>
      nội dung
    </FormModal>,
  ],
  [
    'Drawer',
    <Drawer open title="Ngăn kéo" onOpenChange={noop}>
      nội dung
    </Drawer>,
  ],
  [
    'DrawerSection',
    <DrawerSection icon="clipboard-bold" title="Thông tin" tone="warning">
      nội dung
    </DrawerSection>,
  ],
  ['CustomModalLayout', <CustomModalLayout>nội dung</CustomModalLayout>],
  ['ModalCloseButton', <ModalCloseButton onClick={noop} />],
  [
    'ToastProvider',
    <ToastProvider>
      <span>app</span>
    </ToastProvider>,
  ],
  [
    'Toast',
    <ToastProvider>
      <Toast open title="Đã lưu" type="success" onOpenChange={noop} />
      <ToastViewport />
    </ToastProvider>,
  ],
  [
    'ToastViewport',
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>,
  ],
  ['ToastContainer', <ToastContainer />],

  // navigation
  ['Tabs', <Tabs options={[{ key: 'a', label: 'A' }]} value="a" />],
  [
    'TabsPanel',
    <Tabs options={[{ key: 'a', label: 'A' }]} value="a">
      <TabsPanel value="a">nội dung</TabsPanel>
    </Tabs>,
  ],
  ['Stepper', <Stepper activeStep={0} steps={[{ key: 'a', label: 'Bước A' }]} />],
  [
    'Pagination',
    <Pagination
      pageCount={3}
      pageIndex={1}
      pageSize={10}
      total={30}
      onPageChange={noop}
      onPageSizeChange={noop}
    />,
  ],
  // `ScrollEdgeNav` đo `scrollWidth` của vùng cuộn SỐNG để quyết hiện mũi tên — ở đây chỉ kiểm
  // dựng được khi vùng cuộn chưa gắn; hành vi thật đã phủ qua `Table` (data-display).
  [
    'ScrollEdgeNav',
    <div className="group/scroll-edge relative">
      <ScrollEdgeNav targetRef={createRef<HTMLElement>()} />
    </div>,
  ],
];

describeRenderSuite('overlays-navigation', CASES);

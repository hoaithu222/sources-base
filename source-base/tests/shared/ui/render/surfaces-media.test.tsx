/**
 * Render nông — nhóm `surfaces` · `media` (`tests/helpers/render-suite.tsx`).
 */

import { screen } from '@testing-library/react';
import { expect } from 'vitest';

import {
  BoxInfo,
  BoxPanel,
  CardScreenshot,
  CompactKpiCard,
  Dropzone,
  FileBadge,
  FileCard,
  FileList,
  HudCallout,
  HudCorners,
  HudFrame,
  HudInfoBox,
  HudKpiCard,
  Image,
  ImageLightbox,
  ImagePreview,
  LightboxToolButton,
  PanelCard,
  Splitter,
  SummaryCard,
  SummaryPill,
  Surface,
  Upload,
} from '@/shared/ui';
import type { UploadFile } from '@/shared/ui';
import { describeRenderSuite, type RenderCase } from '@tests/helpers/render-suite';

const noop = () => {};

const FILE: UploadFile = {
  id: 'f1',
  name: 'bao-cao.pdf',
  size: 1024,
  type: 'application/pdf',
  progress: 40,
  status: 'uploading',
};

const CASES: RenderCase[] = [
  // surfaces
  ['BoxPanel', <BoxPanel title="PANEL">nội dung</BoxPanel>],
  [
    'BoxInfo',
    <BoxInfo items={[{ color: 'accent', label: 'A', percent: 50, value: 1 }]} title="Thông tin" />,
  ],
  ['HudFrame', <HudFrame>nội dung</HudFrame>],
  ['HudInfoBox', <HudInfoBox title="Nhãn">nội dung</HudInfoBox>],
  ['HudCallout', <HudCallout statusLabel="Đang hoạt động" title="Khu cắt thép" x={40} y={50} />],
  [
    'HudCorners',
    <div className="relative">
      <HudCorners frame variant="bracket" />
    </div>,
  ],
  // `frame="prime"` là mặc định của PanelCard — render mặc định là đã kéo theo
  // cả `hud-frame-decor`, không cần một ca riêng cho lớp trang trí.
  ['PanelCard', <PanelCard title="CARD">nội dung</PanelCard>],
  [
    'PanelCard · overlay',
    <PanelCard title="CARD" variant="overlay">
      nội dung
    </PanelCard>,
  ],
  ['Surface', <Surface padding="md">nội dung</Surface>],
  ['SummaryCard', <SummaryCard icon="cube-bold" label="Nhãn" value={1} />],
  ['CompactKpiCard', <CompactKpiCard icon="cube-bold" label="Nhãn" value={1} />],
  ['SummaryPill', <SummaryPill icon="cube-bold" label="Nhãn" value={1} />],
  [
    'HudKpiCard',
    <HudKpiCard
      color="green"
      icon="arrow-down-to-line-bold"
      label="Tổng nhập"
      unit="máy"
      value={73}
    />,
  ],
  ['CardScreenshot', <CardScreenshot alt="Mặt bằng" src="/x.png" title="Tầng 3" />],
  [
    'Splitter',
    <Splitter>
      <div>trái</div>
      <div>phải</div>
    </Splitter>,
  ],

  // media
  ['Image', <Image alt="ảnh" name="folder-empty" />],
  ['ImagePreview', <ImagePreview alt="ảnh" src="/x.png" />],
  ['ImageLightbox', <ImageLightbox alt="ảnh" open={false} src="/x.png" onOpenChange={noop} />],
  [
    'LightboxToolButton',
    <LightboxToolButton icon={<span>↗</span>} label="Chia sẻ" onClick={noop} />,
  ],
  ['Upload', <Upload />],
  [
    'Dropzone',
    <Dropzone onDrop={noop}>
      <p>Vùng nhận tệp</p>
    </Dropzone>,
    { check: () => expect(screen.getByText('Vùng nhận tệp')).toBeInTheDocument() },
  ],
  ['FileBadge', <FileBadge name="tep.pdf" />],
  ['FileCard', <FileCard file={FILE} />],
  ['FileList', <FileList files={[FILE]} title="Tệp đã tải" />],
];

describeRenderSuite('surfaces-media', CASES);

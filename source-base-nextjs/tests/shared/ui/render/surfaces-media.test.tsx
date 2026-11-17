/**
 * Render nông — nhóm `surfaces` · `media` (`tests/helpers/render-suite.tsx`).
 */

import { screen } from '@testing-library/react';
import { expect } from 'vitest';

import {
  InsetGroup,
  InsetGroupRow,
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
import { describeRenderSuite, renderCase, type RenderCase } from '@tests/helpers/render-suite';

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
  renderCase('BoxPanel', <BoxPanel title="PANEL">nội dung</BoxPanel>),
  renderCase(
    'BoxInfo',
    <BoxInfo items={[{ color: 'accent', label: 'A', percent: 50, value: 1 }]} title="Thông tin" />,
  ),
  renderCase('HudFrame', <HudFrame>nội dung</HudFrame>),
  renderCase('HudInfoBox', <HudInfoBox title="Nhãn">nội dung</HudInfoBox>),
  renderCase(
    'HudCallout',
    <HudCallout statusLabel="Đang hoạt động" title="Khu cắt thép" x={40} y={50} />,
  ),
  renderCase(
    'HudCorners',
    <div className="relative">
      <HudCorners frame variant="bracket" />
    </div>,
  ),
  // Prop trang trí của khung (`frame`, `sweep`, `notch`) đã vô hiệu — một ca mặc định là đủ.
  renderCase('PanelCard', <PanelCard title="CARD">nội dung</PanelCard>),
  renderCase(
    'InsetGroup',
    <InsetGroup title="Nhóm">
      <InsetGroupRow title="Dòng" value="4" />
    </InsetGroup>,
  ),
  renderCase(
    'InsetGroupRow',
    <InsetGroupRow href="/a" icon="finance" title="Tài chính" value="4" />,
  ),
  renderCase(
    'PanelCard · overlay',
    <PanelCard title="CARD" variant="overlay">
      nội dung
    </PanelCard>,
  ),
  renderCase('Surface', <Surface padding="md">nội dung</Surface>),
  renderCase('SummaryCard', <SummaryCard icon="cube-bold" label="Nhãn" value={1} />),
  renderCase('CompactKpiCard', <CompactKpiCard icon="cube-bold" label="Nhãn" value={1} />),
  renderCase('SummaryPill', <SummaryPill icon="cube-bold" label="Nhãn" value={1} />),
  renderCase(
    'HudKpiCard',
    <HudKpiCard
      color="green"
      icon="arrow-down-to-line-bold"
      label="Tổng nhập"
      unit="máy"
      value={73}
    />,
  ),
  renderCase('CardScreenshot', <CardScreenshot alt="Mặt bằng" src="/x.png" title="Tầng 3" />),
  renderCase(
    'Splitter',
    <Splitter>
      <div>trái</div>
      <div>phải</div>
    </Splitter>,
  ),

  // media
  renderCase('Image', <Image alt="ảnh" name="folder-empty" />),
  renderCase('ImagePreview', <ImagePreview alt="ảnh" src="/x.png" />),
  renderCase(
    'ImageLightbox',
    <ImageLightbox alt="ảnh" open={false} src="/x.png" onOpenChange={noop} />,
  ),
  renderCase(
    'LightboxToolButton',
    <LightboxToolButton icon={<span>↗</span>} label="Chia sẻ" onClick={noop} />,
  ),
  renderCase('Upload', <Upload />),
  renderCase(
    'Dropzone',
    <Dropzone onDrop={noop}>
      <p>Vùng nhận tệp</p>
    </Dropzone>,
    { check: () => expect(screen.getByText('Vùng nhận tệp')).toBeInTheDocument() },
  ),
  renderCase('FileBadge', <FileBadge name="tep.pdf" />),
  renderCase('FileCard', <FileCard file={FILE} />),
  renderCase('FileList', <FileList files={[FILE]} title="Tệp đã tải" />),
];

describeRenderSuite('surfaces-media', CASES);

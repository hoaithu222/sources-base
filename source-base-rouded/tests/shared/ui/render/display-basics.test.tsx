/**
 * Render nông — nhóm `primitives` · `feedback` · `layout` · `icons` (`tests/helpers/render-suite.tsx`).
 */

import { expect } from 'vitest';

import {
  Avatar,
  Badge,
  BoxGrid,
  Callout,
  DetailPanelHeader,
  Divider,
  EmptyState,
  FilterDisclosure,
  GemIcon,
  AppTile,
  AppIcon,
  VciIcon,
  Heading,
  LiquidGauge,
  PageBody,
  PageShell,
  Progress,
  ProgressCircle,
  SectionHeader,
  Skeleton,
  Spinner,
  TableEmptyIllustration,
  Text,
  TitleScreen,
  Toolbar,
} from '@/shared/ui';
import { describeRenderSuite, type RenderCase } from '@tests/helpers/render-suite';

const CASES: RenderCase[] = [
  // primitives
  [
    'Text',
    <Text size="small">nội dung</Text>,
    { check: ({ getByText }) => expect(getByText('nội dung')).toBeInTheDocument() },
  ],
  ['Heading', <Heading size="small">tiêu đề</Heading>],
  ['Badge', <Badge color="info">nhãn</Badge>],
  [
    'Badge · success',
    <Badge color="success">Hoạt động</Badge>,
    { check: ({ getByText }) => expect(getByText('Hoạt động')).toBeInTheDocument() },
  ],
  ['Avatar', <Avatar name="Nguyễn Văn A" />],
  ['Divider', <Divider />],

  // feedback
  ['Spinner', <Spinner />],
  ['Skeleton', <Skeleton />],
  ['Callout', <Callout intent="warning">cảnh báo</Callout>],
  ['Progress', <Progress value={42} />],
  ['ProgressCircle', <ProgressCircle value={42} />],
  ['EmptyState', <EmptyState icon="cube-bold" title="Trống" />],
  [
    'TableEmptyIllustration',
    <TableEmptyIllustration />,
    { check: ({ container }) => expect(container.querySelector('svg')).toBeTruthy() },
  ],
  ['LiquidGauge', <LiquidGauge label="Bể số 2" value={63} />],

  // layout
  ['SectionHeader', <SectionHeader title="Mục" />],
  ['TitleScreen', <TitleScreen icon="cube-bold" title="Màn hình" />],
  ['DetailPanelHeader', <DetailPanelHeader title="Sơ đồ tổ chức" tone="sky" />],
  [
    'PageShell',
    <PageShell>
      <PageBody>nội dung</PageBody>
    </PageShell>,
  ],
  ['PageBody', <PageBody overflow="hidden">nội dung</PageBody>],
  ['Toolbar', <Toolbar left={<span>trái</span>} right={<span>phải</span>} />],
  [
    'FilterDisclosure',
    <FilterDisclosure label="Bộ lọc" summary="T10/2026">
      <span>ô lọc</span>
    </FilterDisclosure>,
  ],
  [
    'BoxGrid',
    <BoxGrid gap="md" min="lg">
      <div>ô 1</div>
      <div>ô 2</div>
    </BoxGrid>,
  ],

  // icons
  ['GemIcon', <GemIcon color="green" />],
  ['AppTile', <AppTile icon="wallet-bold" tone="primary" />],
  ['VciIcon', <VciIcon name="finance" variant="duo" />],
  ['AppIcon', <AppIcon name="warehouse" />],
];

describeRenderSuite('display-basics', CASES);

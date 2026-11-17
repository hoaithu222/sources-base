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
import { describeRenderSuite, renderCase, type RenderCase } from '@tests/helpers/render-suite';

const CASES: RenderCase[] = [
  // primitives
  renderCase('Text', <Text size="small">nội dung</Text>, {
    check: ({ getByText }) => expect(getByText('nội dung')).toBeInTheDocument(),
  }),
  renderCase('Heading', <Heading size="small">tiêu đề</Heading>),
  renderCase('Badge', <Badge color="info">nhãn</Badge>),
  renderCase('Badge · success', <Badge color="success">Hoạt động</Badge>, {
    check: ({ getByText }) => expect(getByText('Hoạt động')).toBeInTheDocument(),
  }),
  renderCase('Avatar', <Avatar name="Nguyễn Văn A" />),
  renderCase('Divider', <Divider />),

  // feedback
  renderCase('Spinner', <Spinner />),
  renderCase('Skeleton', <Skeleton />),
  renderCase('Callout', <Callout intent="warning">cảnh báo</Callout>),
  renderCase('Progress', <Progress value={42} />),
  renderCase('ProgressCircle', <ProgressCircle value={42} />),
  renderCase('EmptyState', <EmptyState icon="cube-bold" title="Trống" />),
  renderCase('TableEmptyIllustration', <TableEmptyIllustration />, {
    check: ({ container }) => expect(container.querySelector('svg')).toBeTruthy(),
  }),
  renderCase('LiquidGauge', <LiquidGauge label="Bể số 2" value={63} />),

  // layout
  renderCase('SectionHeader', <SectionHeader title="Mục" />),
  renderCase('TitleScreen', <TitleScreen icon="cube-bold" title="Màn hình" />),
  renderCase('DetailPanelHeader', <DetailPanelHeader title="Sơ đồ tổ chức" tone="sky" />),
  renderCase(
    'PageShell',
    <PageShell>
      <PageBody>nội dung</PageBody>
    </PageShell>,
  ),
  renderCase('PageBody', <PageBody overflow="hidden">nội dung</PageBody>),
  renderCase('Toolbar', <Toolbar left={<span>trái</span>} right={<span>phải</span>} />),
  renderCase(
    'FilterDisclosure',
    <FilterDisclosure label="Bộ lọc" summary="T10/2026">
      <span>ô lọc</span>
    </FilterDisclosure>,
  ),
  renderCase(
    'BoxGrid',
    <BoxGrid gap="md" min="lg">
      <div>ô 1</div>
      <div>ô 2</div>
    </BoxGrid>,
  ),

  // icons
  renderCase('GemIcon', <GemIcon color="green" />),
  renderCase('AppTile', <AppTile icon="wallet-bold" tone="primary" />),
  renderCase('VciIcon', <VciIcon name="finance" variant="duo" />),
  renderCase('AppIcon', <AppIcon name="warehouse" />),
];

describeRenderSuite('display-basics', CASES);

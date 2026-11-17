import { memo, useCallback, useRef, useState } from 'react';

import { Badge, Pagination, ScrollEdgeNav, Stepper, Tabs, TabsPanel, Text } from '@/shared/ui';
import type { StepItem, TabOption } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';

import DemoGrid from '../../components/shell/DemoGrid';
import DemoRow from '../../components/shell/DemoRow';
import DemoSection from '../../components/shell/DemoSection';

const TAB_OPTIONS: TabOption[] = [
  { key: 'overview', label: 'Tổng quan', icon: <SystemIcon name="grid-2-outline" size={14} /> },
  { key: 'tasks', label: 'Công việc', trailing: <Badge size="xs">12</Badge> },
  { key: 'files', label: 'Hồ sơ' },
  { key: 'audit', label: 'Nhật ký', disabled: true },
];

const TABS_SIZES = ['sm', 'md', 'lg'] as const;
const TABS_INDICATORS = ['top', 'bottom'] as const;

const STEPS: StepItem[] = [
  { key: 'draft', label: 'Soạn thảo', description: 'Chuyên viên nhập nội dung' },
  { key: 'review', label: 'Kiểm tra', description: 'Phòng pháp chế rà soát' },
  { key: 'approve', label: 'Phê duyệt', description: 'Lãnh đạo ký số' },
  { key: 'publish', label: 'Ban hành', description: 'Gửi đơn vị nhận' },
];

const STEPS_WITH_ERROR: StepItem[] = [
  { key: 'draft', label: 'Soạn thảo', status: 'done', description: 'Xong lúc 09:12' },
  { key: 'review', label: 'Kiểm tra', status: 'error', description: 'Thiếu chữ ký trưởng phòng' },
  { key: 'approve', label: 'Phê duyệt', status: 'pending', description: 'Chờ bước trước' },
];

const STEPPER_SAMPLE_CLASSES =
  'flex flex-col gap-2 rounded-lg border border-border-default bg-bg-surface p-4';

const WIDE_COLUMNS = Array.from({ length: 16 }, (_, i) => `Cột ${String(i + 1).padStart(2, '0')}`);

/**
 * NavigationSection — mục "Điều hướng" của trang `/demo`: `Tabs` · `Stepper` · `Pagination` · `ScrollEdgeNav`.
 */
const NavigationSection = memo(function NavigationSection() {
  const [tab, setTab] = useState('overview');
  const [sweepTab, setSweepTab] = useState('overview');
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePageSize = useCallback((next: number) => {
    setPageSize(next);
    setPageIndex(0);
  }, []);

  return (
    <DemoSection
      description="Tabs · Stepper · Pagination · ScrollEdgeNav. Tab đổi dữ liệu thì đẩy lên URL, đừng giữ trong useState."
      importPath="@/shared/ui"
      title="Điều hướng"
    >
      <DemoRow label="Tabs · icon + trailing badge + disabled + TabsPanel" stacked>
        <Tabs options={TAB_OPTIONS} value={tab} onValueChange={setTab}>
          <TabsPanel value="overview">
            <Text size="small" skin="muted">
              Nội dung tab Tổng quan.
            </Text>
          </TabsPanel>
          <TabsPanel value="tasks">
            <Text size="small" skin="muted">
              Nội dung tab Công việc.
            </Text>
          </TabsPanel>
          <TabsPanel value="files">
            <Text size="small" skin="muted">
              Nội dung tab Hồ sơ.
            </Text>
          </TabsPanel>
        </Tabs>
      </DemoRow>

      <DemoRow label="Tabs · size × indicator (3 × 2)" stacked>
        <DemoGrid min="md">
          {TABS_SIZES.flatMap((size) =>
            TABS_INDICATORS.map((indicator) => (
              <div key={`${size}-${indicator}`} className="flex flex-col gap-1">
                <Text className="font-mono" size="extraTiny" skin="muted">
                  size=&quot;{size}&quot; indicator=&quot;{indicator}&quot;
                </Text>
                <Tabs
                  indicator={indicator}
                  options={TAB_OPTIONS.slice(0, 3)}
                  size={size}
                  value={sweepTab}
                  onValueChange={setSweepTab}
                />
              </div>
            )),
          )}
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="Stepper · layout (horizontal-center · horizontal-inline · vertical)"
        note="done = tick · active = chấm đặc · error = dấu x · pending = vòng số; đoạn nối sau bước xong tô primary"
        stacked
      >
        <div className={STEPPER_SAMPLE_CLASSES}>
          <Text className="font-mono" size="extraTiny" skin="muted">
            {'layout="horizontal-center" size="md" activeStep={1}'}
          </Text>
          <Stepper activeStep={1} layout="horizontal-center" size="md" steps={STEPS} />
        </div>
        <div className={STEPPER_SAMPLE_CLASSES}>
          <Text className="font-mono" size="extraTiny" skin="muted">
            {'layout="horizontal-inline" activeStep={2} · có bước error'}
          </Text>
          <Stepper activeStep={2} layout="horizontal-inline" steps={STEPS} />
          <Stepper layout="horizontal-inline" steps={STEPS_WITH_ERROR} />
        </div>
        <DemoGrid min="sm">
          <div className={STEPPER_SAMPLE_CLASSES}>
            <Text className="font-mono" size="extraTiny" skin="muted">
              {'layout="vertical" size="md" activeStep={2}'}
            </Text>
            <Stepper activeStep={2} layout="vertical" size="md" steps={STEPS} />
          </div>
          <div className={STEPPER_SAMPLE_CLASSES}>
            <Text className="font-mono" size="extraTiny" skin="muted">
              {'layout="vertical" · có bước error'}
            </Text>
            <Stepper layout="vertical" steps={STEPS_WITH_ERROR} />
          </div>
        </DemoGrid>
      </DemoRow>

      <DemoRow
        label="Pagination · pageSizeOptions + maxPageButtons + countLabel + pageSizeSuffix"
        note="pageIndex 0-based; đổi số dòng/trang phải reset về trang 1"
        stacked
      >
        <Pagination
          countLabel="Kết quả:"
          maxPageButtons={5}
          pageCount={Math.ceil(137 / pageSize)}
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageSizeOptions={[10, 20, 50, 100]}
          pageSizeSuffix="/trang"
          total={137}
          onPageChange={setPageIndex}
          onPageSizeChange={handlePageSize}
        />
      </DemoRow>

      <DemoRow
        label="ScrollEdgeNav"
        note="rê chuột vào dải cuộn — nút mờ/hiện ở 2 mép, hết đường thì tự ẩn. Máy chạm hiện thường trực."
        stacked
      >
        <div className="group/scroll-edge relative flex flex-col">
          <div
            ref={scrollRef}
            className="scrollbar-hidden flex gap-2 overflow-x-auto overscroll-x-contain"
          >
            {WIDE_COLUMNS.map((label) => (
              <div
                key={label}
                className="shrink-0 rounded-md border border-border-default bg-bg-surface px-3 py-2"
              >
                <Text className="font-mono" size="tiny">
                  {label}
                </Text>
              </div>
            ))}
          </div>
          <ScrollEdgeNav className="inset-x-0" targetRef={scrollRef} />
        </div>
      </DemoRow>
    </DemoSection>
  );
});

export default NavigationSection;

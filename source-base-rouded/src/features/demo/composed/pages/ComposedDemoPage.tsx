import { memo, useCallback, useMemo, useState } from 'react';

import { BoxPanel, Button, EmptyState, PageBody, PageShell, showToast } from '@/shared/ui';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { matchesSearch } from '@/shared/utils/format/string.utils';
import { PageHeader } from '@/shared/widgets/header';

import KpiActionRow from '../../shared/components/KpiActionRow';
import ComposedDetailDrawer from '../components/ComposedDetailDrawer';
import ComposedFilterBar from '../components/ComposedFilterBar';
import ComposedKpiStrip from '../components/ComposedKpiStrip';
import ComposedPackageTable from '../components/ComposedPackageTable';
import {
  DEMO_PACKAGE_ROWS,
  DEMO_PROJECT_NAME,
  type DemoPackageRow,
  type PackageStatus,
} from '../../shared/constants/packages.constants';
import { DEMO_COMPOSED_TABS, type DemoComposedTab } from '../constants/tabs.constants';

/**
 * ComposedDemoPage — màn `/demo/ghep` ("Ghép thực tế"): danh sách gói thầu dựng HOÀN TOÀN bằng component
 * của base, để soi lỗi chỉ lộ ở tầng ghép (cùng lưới với header, nhịp khe dọc, bảng lấp hết chiều cao còn lại).
 * Lưu ý: tên dự án + tên màn hình + tab đã nằm trên thanh header nên KHÔNG có `TitleScreen` (quy tắc `page-structure.md` §3b);
 * hành động của trang ở CÙNG HÀNG với dải KPI, căn giữa. Số đếm chỉ ở dải KPI, lọc nằm trong panel bảng.
 */
const ComposedDemoPage = memo(function ComposedDemoPage() {
  const [tab, setTab] = useState<DemoComposedTab>('packages');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<DemoPackageRow | null>(null);

  const rows = useMemo(
    () =>
      DEMO_PACKAGE_ROWS.filter((r) => {
        if (status !== 'all' && r.status !== (status as PackageStatus)) return false;
        return matchesSearch([r.code, r.name, r.contractor], keyword);
      }),
    [keyword, status],
  );

  const handleTab = useCallback((k: string) => setTab(k as DemoComposedTab), []);
  const resetFilters = useCallback(() => {
    setKeyword('');
    setStatus('all');
  }, []);
  const closeDrawer = useCallback(() => setSelected(null), []);
  const handleExport = useCallback(() => showToast('info', 'Đang dựng tệp Excel…'), []);

  return (
    <PageShell>
      <PageHeader
        nav={{ items: DEMO_COMPOSED_TABS, active: tab, onSelect: handleTab }}
        subtitle="Danh sách gói thầu"
        title={DEMO_PROJECT_NAME}
        tone="sky"
      />

      <KpiActionRow
        actions={
          <>
            <Button
              size="sm"
              skin="neutral"
              startIcon={<SystemIcon name="download-bold" size={14} />}
              variant="stroke"
              onClick={handleExport}
            >
              Xuất Excel
            </Button>
            <Button size="sm" startIcon={<SystemIcon name="plus-outline" size={14} />}>
              Thêm gói thầu
            </Button>
          </>
        }
        kpis={<ComposedKpiStrip rows={rows} />}
      />

      <PageBody overflow="hidden" stack={false}>
        <BoxPanel bodyOverflow="hidden" border="hairline" headerDivider title="Gói thầu">
          <ComposedFilterBar
            keyword={keyword}
            resultCount={rows.length}
            status={status}
            totalCount={DEMO_PACKAGE_ROWS.length}
            onKeywordChange={setKeyword}
            onStatusChange={setStatus}
          />
          {rows.length === 0 ? (
            <EmptyState
              action={
                <Button size="sm" variant="stroke" onClick={resetFilters}>
                  Xoá bộ lọc
                </Button>
              }
              className="min-h-0 flex-1"
              description="Thử bỏ bớt từ khoá hoặc chọn lại trạng thái."
              icon="folder-bold"
              iconColor="sky"
              title="Không có gói thầu nào khớp bộ lọc"
            />
          ) : (
            <ComposedPackageTable rows={rows} onOpenRow={setSelected} />
          )}
        </BoxPanel>
      </PageBody>

      <ComposedDetailDrawer row={selected} onClose={closeDrawer} />
    </PageShell>
  );
});

export default ComposedDemoPage;

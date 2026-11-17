import { useCallback, useMemo, useState } from 'react';

import { BoxPanel, Button, EmptyState, PageBody, PageShell, showToast, Text } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import AgingBucketSummary from '../components/receivables/AgingBucketSummary';
import AgingPartnerChart from '../components/receivables/AgingPartnerChart';
import DebtFilterBar from '../components/receivables/DebtFilterBar';
import DebtKpiStrip from '../components/receivables/DebtKpiStrip';
import DebtPartnerTable from '../components/receivables/DebtPartnerTable';
import {
  AGING_TOP_PARTNERS,
  DEBT_AS_OF,
  DEBT_MODE_COPY,
  DEBT_MODE_OPTIONS,
  type DebtMode,
} from '../constants/receivables.constants';
import {
  FINANCE_PANEL_HEADER_CLASSES,
  FINANCE_PANEL_SLOT_CLASSES,
  FINANCE_PANEL_TITLE_CLASSES,
  RECEIVABLES_GRID_CLASSES,
} from '../finance.theme';
import {
  agingChartRows,
  buildDebtRows,
  filterDebtRows,
  summarizeDebt,
} from '../utils/receivables.utils';

const panelTitle = (text: string) => <h2 className={FINANCE_PANEL_TITLE_CLASSES}>{text}</h2>;

/**
 * ReceivablesPage — màn `/tai-chinh/cong-no` ("Công nợ"): đổi Phải thu / Phải trả trên thanh header, bốn thẻ KPI (tổng
 * dư nợ, quá hạn, DSO / DPO, vượt hạn mức), bảng đối tác (tìm / lọc trạng thái / sắp xếp trên header panel) cạnh panel
 * Tuổi nợ (cơ cấu bốn nhóm + cột chồng các đối tác dư nợ lớn nhất).
 * Lưu ý: số liệu mẫu sinh có hạt giống từ danh mục đối tác (`buildDebtRows`); KPI và panel Tuổi nợ tính trên toàn bộ
 * đối tác, ô tìm và bộ lọc chỉ áp lên bảng. Từ `xl` trang vừa một màn hình, bảng cuộn bên trong.
 */
export default function ReceivablesPage() {
  const [mode, setMode] = useState<DebtMode>('receivable');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');

  const copy = DEBT_MODE_COPY[mode];
  const allRows = useMemo(() => buildDebtRows(mode), [mode]);
  const summary = useMemo(() => summarizeDebt(allRows, mode), [allRows, mode]);
  const chartRows = useMemo(() => agingChartRows(allRows, AGING_TOP_PARTNERS), [allRows]);
  const rows = useMemo(() => filterDebtRows(allRows, keyword, status), [allRows, keyword, status]);

  const handleMode = useCallback((key: string) => setMode(key as DebtMode), []);
  const resetFilters = useCallback(() => {
    setKeyword('');
    setStatus('all');
  }, []);
  const handleExport = useCallback(
    () => showToast('info', `Đang xuất bảng ${copy.total.toLowerCase()} đến ${DEBT_AS_OF}…`),
    [copy],
  );

  return (
    <PageShell>
      <PageHeader
        nav={{ items: DEBT_MODE_OPTIONS, active: mode, onSelect: handleMode }}
        subtitle={`Số liệu đến ${DEBT_AS_OF}`}
        title="Công nợ"
        tone="green"
      />

      <PageBody>
        <DebtKpiStrip mode={mode} summary={summary} />

        <div className={RECEIVABLES_GRID_CLASSES}>
          <BoxPanel
            bodyOverflow="hidden"
            border="hairline"
            className={FINANCE_PANEL_SLOT_CLASSES.debts}
            headerClassName={FINANCE_PANEL_HEADER_CLASSES}
            headerDivider
            headerRight={
              <DebtFilterBar
                keyword={keyword}
                placeholder={copy.search}
                resultCount={rows.length}
                status={status}
                totalCount={allRows.length}
                onExport={handleExport}
                onKeywordChange={setKeyword}
                onStatusChange={setStatus}
              />
            }
            title={panelTitle(`Công nợ theo ${copy.partnerPlural}`)}
          >
            {rows.length === 0 ? (
              <EmptyState
                action={
                  <Button size="sm" variant="stroke" onClick={resetFilters}>
                    Xoá bộ lọc
                  </Button>
                }
                className="min-h-0 flex-1"
                description="Thử bỏ bớt từ khoá hoặc chọn lại trạng thái."
                icon="magnifying-glass-bold"
                iconColor="sky"
                title={`Không có ${copy.partnerPlural} nào khớp bộ lọc`}
              />
            ) : (
              <DebtPartnerTable partnerHeader={copy.partner} rows={rows} />
            )}
          </BoxPanel>

          <BoxPanel
            bodyOverflow="hidden"
            border="hairline"
            className={FINANCE_PANEL_SLOT_CLASSES.aging}
            headerClassName={FINANCE_PANEL_HEADER_CLASSES}
            headerDivider
            headerRight={
              <Text className="tabular-nums" size="tiny" skin="muted">
                {`Top ${AGING_TOP_PARTNERS} · tỷ đồng`}
              </Text>
            }
            title={panelTitle('Tuổi nợ')}
          >
            <AgingBucketSummary summary={summary} />
            <AgingPartnerChart
              ariaLabel={`Dư nợ theo nhóm tuổi nợ của ${AGING_TOP_PARTNERS} ${copy.partnerPlural} lớn nhất, tỷ đồng`}
              className="h-72 min-h-0 p-2 xl:h-auto xl:flex-1"
              rows={chartRows}
            />
          </BoxPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}

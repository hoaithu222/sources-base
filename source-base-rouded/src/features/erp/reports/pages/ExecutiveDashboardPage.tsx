import { useCallback, useMemo, useState } from 'react';

import { PageBody, PageShell } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import AttentionList from '../components/AttentionList';
import ExecKpiTile from '../components/ExecKpiTile';
import ExecPanel from '../components/ExecPanel';
import PanelSummary from '../components/PanelSummary';
import TopCustomersTable from '../components/TopCustomersTable';
import CashflowAreaChart from '../components/charts/CashflowAreaChart';
import RevenueMixDonut from '../components/charts/RevenueMixDonut';
import RevenuePlanChart from '../components/charts/RevenuePlanChart';
import { EXEC_CASHFLOW_SERIES, EXEC_CASHFLOW_WEEKS } from '../constants/executive-charts.constants';
import { EXEC_ATTENTION_ITEMS } from '../constants/executive-lists.constants';
import {
  EXEC_DEFAULT_PERIOD,
  EXEC_PERIOD_META,
  EXEC_PERIOD_OPTIONS,
  type ExecPeriod,
} from '../constants/executive-period.constants';
import {
  EXEC_KPI_SPAN_CLASSES,
  EXEC_LAYOUT_CLASSES,
  EXEC_PANEL_SLOT_CLASSES,
} from '../executive.theme';
import {
  attentionCaption,
  buildCustomerRows,
  buildKpiTiles,
  buildMonthlyRevenue,
  buildPanelSummaries,
  buildRevenueMix,
  formatBillion,
} from '../utils/executive.utils';

const SUMMARIES = buildPanelSummaries();
const ATTENTION_CAPTION = attentionCaption();

const PAGE_CLASSES = {
  chart: 'min-h-72 flex-1',
  cashflow: 'h-64',
} satisfies Record<string, string>;

const REVENUE_ACTIONS = (
  <PanelSummary
    items={SUMMARIES.revenue}
    link={{ to: '/tai-chinh/bao-cao/ket-qua', label: 'Kết quả kinh doanh' }}
  />
);
const CUSTOMER_ACTIONS = <PanelSummary link={{ to: '/tai-chinh/cong-no', label: 'Công nợ' }} />;
const CASHFLOW_ACTIONS = <PanelSummary items={SUMMARIES.cashflow} />;

/**
 * ExecutiveDashboardPage — màn `/bao-cao/dieu-hanh` ("Dashboard điều hành"): bức tranh toàn công ty kết cấu thép · gia
 * công cốt thép năm 2026 — 5 ô KPI kiểu widget, doanh thu theo tháng so với kế hoạch, cơ cấu doanh thu theo mảng, top
 * khách hàng, điểm cần chú ý (liên kết sang màn xử lý) và dòng tiền thu – chi 12 tuần.
 * Kỳ xem (Tháng · Quý · Năm — icon lịch trên cột lọc dọc mép phải) đổi số của KPI, donut, bảng khách hàng và cột đậm trên biểu đồ doanh thu; dòng tiền
 * luôn là 12 tuần gần nhất. Dữ liệu mẫu tĩnh ở `constants/`, phép tính ở `utils/executive.utils.ts`.
 */
export default function ExecutiveDashboardPage() {
  const [period, setPeriod] = useState<ExecPeriod>(EXEC_DEFAULT_PERIOD);

  const meta = EXEC_PERIOD_META[period];
  const tiles = useMemo(() => buildKpiTiles(period), [period]);
  const months = useMemo(() => buildMonthlyRevenue(period), [period]);
  const mix = useMemo(() => buildRevenueMix(period), [period]);
  const customers = useMemo(() => buildCustomerRows(period), [period]);

  const handlePeriod = useCallback((key: string) => setPeriod(key as ExecPeriod), []);

  return (
    <PageShell variant="flow">
      <PageHeader
        filters={[
          {
            key: 'period',
            label: 'Kỳ xem',
            icon: 'calendar-outline',
            value: meta.title,
            active: period !== EXEC_DEFAULT_PERIOD,
            options: EXEC_PERIOD_OPTIONS,
            selected: period,
            onSelect: handlePeriod,
          },
        ]}
        subtitle={meta.title}
        title="Dashboard điều hành"
        tone="blue"
      />

      <PageBody className={EXEC_LAYOUT_CLASSES.body}>
        <section aria-label="Chỉ số chính toàn công ty" className={EXEC_LAYOUT_CLASSES.kpis}>
          {tiles.map((tile) => (
            <ExecKpiTile
              key={tile.key}
              className={EXEC_KPI_SPAN_CLASSES[tile.key]}
              tile={tile}
              versus={meta.versus}
            />
          ))}
        </section>

        <div className={EXEC_LAYOUT_CLASSES.grid}>
          <ExecPanel
            actions={REVENUE_ACTIONS}
            className={EXEC_PANEL_SLOT_CLASSES.revenue}
            description={`Tỷ đồng · cột đậm: ${meta.title} · T10 lũy kế đến 19/10`}
            title="Doanh thu theo tháng so với kế hoạch"
          >
            <RevenuePlanChart
              ariaLabel={`Doanh thu thực hiện và kế hoạch theo tháng năm 2026, làm nổi bật ${meta.title}`}
              className={PAGE_CLASSES.chart}
              points={months}
            />
          </ExecPanel>

          <ExecPanel
            className={EXEC_PANEL_SLOT_CLASSES.mix}
            description={`${meta.title} · tỷ đồng`}
            title="Cơ cấu doanh thu theo mảng"
          >
            <RevenueMixDonut
              ariaLabel={`Cơ cấu doanh thu ${meta.title}: tổng ${formatBillion(mix.total)} tỷ đồng`}
              className="min-h-0 flex-1"
              slices={mix.slices}
              total={mix.total}
            />
          </ExecPanel>

          <ExecPanel
            actions={CUSTOMER_ACTIONS}
            bodyClassName="px-0 pb-2"
            className={EXEC_PANEL_SLOT_CLASSES.customers}
            description={`${meta.title} · xếp theo doanh thu`}
            title="Top khách hàng"
          >
            <TopCustomersTable rows={customers} versus={meta.versus} />
          </ExecPanel>

          <ExecPanel
            bodyClassName="px-2 pb-2"
            className={EXEC_PANEL_SLOT_CLASSES.attention}
            description={ATTENTION_CAPTION}
            title="Điểm cần chú ý"
          >
            <AttentionList items={EXEC_ATTENTION_ITEMS} />
          </ExecPanel>

          <ExecPanel
            actions={CASHFLOW_ACTIONS}
            className={EXEC_PANEL_SLOT_CLASSES.cashflow}
            description="Tỷ đồng · 12 tuần gần nhất, không theo kỳ đang chọn"
            title="Dòng tiền thu – chi 12 tuần"
          >
            <CashflowAreaChart
              ariaLabel="Dòng tiền thu và chi theo tuần, 12 tuần gần nhất"
              className={PAGE_CLASSES.cashflow}
              inflow={EXEC_CASHFLOW_SERIES.inflow}
              outflow={EXEC_CASHFLOW_SERIES.outflow}
              weeks={EXEC_CASHFLOW_WEEKS}
            />
          </ExecPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}

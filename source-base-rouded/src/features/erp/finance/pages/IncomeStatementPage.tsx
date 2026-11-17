import { useCallback, useMemo, useState } from 'react';

import { BoxPanel, Dropdown, PageBody, PageShell, SegmentToggle, Text } from '@/shared/ui';
import { PageHeader } from '@/shared/widgets/header';

import IncomeComboChart from '../components/income/IncomeComboChart';
import IncomeKpiStrip from '../components/income/IncomeKpiStrip';
import IncomeStatementTable from '../components/income/IncomeStatementTable';
import {
  STATEMENT_COMPARE_OPTIONS,
  STATEMENT_GRANULARITY_OPTIONS,
  type StatementCompare,
  type StatementGranularity,
} from '../constants/income-statement.constants';
import {
  FINANCE_PANEL_HEADER_CLASSES,
  FINANCE_PANEL_SLOT_CLASSES,
  FINANCE_PANEL_TITLE_CLASSES,
  INCOME_GRID_CLASSES,
} from '../finance.theme';
import {
  incomeChartRows,
  statementPeriods,
  statementValues,
} from '../utils/income-statement.utils';

const CHART_ROWS = incomeChartRows();

/** Nhãn trục X của biểu đồ ("T7/26") cho một tháng của kỳ. */
const chartLabel = ({ year, month }: { year: number; month: number }) =>
  `T${month}/${String(year).slice(2)}`;

const panelTitle = (text: string) => <h2 className={FINANCE_PANEL_TITLE_CLASSES}>{text}</h2>;

/**
 * IncomeStatementPage — màn `/tai-chinh/bao-cao/ket-qua` ("Kết quả kinh doanh"): chọn kỳ (tháng · quý · lũy kế năm) và
 * kỳ so sánh (kỳ trước · cùng kỳ) ở bộ lọc thanh header, bốn thẻ KPI, biểu đồ 12 tháng (doanh thu · chi phí · LN trước
 * thuế, tô nền các tháng của kỳ đang xem) cạnh báo cáo Mẫu B02-DN.
 * Lưu ý: lũy kế năm luôn so cùng kỳ năm trước (nút "Kỳ trước" khoá). Kỳ + kỳ so sánh là `PageHeader filters` (dưới
 * `2xl` gom vào nút phễu). Từ `xl` trang vừa một màn hình, bảng B02-DN cuộn bên trong; số liệu mẫu sinh có hạt giống.
 */
export default function IncomeStatementPage() {
  const [granularity, setGranularity] = useState<StatementGranularity>('month');
  const [compare, setCompare] = useState<StatementCompare>('prev');

  const { periods, current, previous, highlight } = useMemo(() => {
    const next = statementPeriods(granularity, compare);
    const months = next.current.months;
    return {
      periods: next,
      current: statementValues(months),
      previous: statementValues(next.previous.months),
      highlight: [chartLabel(months[0]), chartLabel(months[months.length - 1])] as const,
    };
  }, [granularity, compare]);
  const compareOptions = useMemo(
    () =>
      STATEMENT_COMPARE_OPTIONS.map((option) => ({
        ...option,
        disabled: granularity === 'ytd' && option.key === 'prev',
      })),
    [granularity],
  );

  const effectiveCompare: StatementCompare = granularity === 'ytd' ? 'yoy' : compare;

  const handleGranularity = useCallback(
    (value: string) => setGranularity(value as StatementGranularity),
    [],
  );
  const handleCompare = useCallback((key: string) => setCompare(key as StatementCompare), []);

  return (
    <PageShell>
      <PageHeader
        filters={[
          {
            key: 'period',
            label: 'Kỳ báo cáo',
            icon: 'calendar-outline',
            value: periods.current.label,
            active: granularity !== 'month',
            content: (
              <Dropdown
                aria-label="Kỳ báo cáo"
                options={STATEMENT_GRANULARITY_OPTIONS}
                size="sm"
                value={granularity}
                onValueChange={handleGranularity}
              />
            ),
          },
          {
            key: 'compare',
            label: 'So sánh với',
            icon: 'chart-mixed-outline',
            value: periods.previous.label,
            active: effectiveCompare !== 'prev',
            content: (
              <SegmentToggle
                fullWidth
                options={compareOptions}
                size="sm"
                value={effectiveCompare}
                onValueChange={handleCompare}
              />
            ),
          },
        ]}
        subtitle={`${periods.current.label} so với ${periods.previous.label}`}
        title="Kết quả kinh doanh"
        tone="green"
      />

      <PageBody>
        <IncomeKpiStrip current={current} previous={previous} versus={periods.previous.label} />

        <div className={INCOME_GRID_CLASSES}>
          <BoxPanel
            bodyClassName="p-2"
            bodyOverflow="hidden"
            border="hairline"
            className={FINANCE_PANEL_SLOT_CLASSES.trend}
            headerClassName={FINANCE_PANEL_HEADER_CLASSES}
            headerDivider
            headerRight={
              <Text size="tiny" skin="muted">
                12 tháng · tỷ đồng
              </Text>
            }
            title={panelTitle('Doanh thu, chi phí và lợi nhuận')}
          >
            <IncomeComboChart
              ariaLabel={`Tổng doanh thu, tổng chi phí và lợi nhuận trước thuế 12 tháng, nền nhấn ${periods.current.label}`}
              className="min-h-0 flex-1"
              highlight={highlight}
              rows={CHART_ROWS}
            />
          </BoxPanel>

          <BoxPanel
            bodyOverflow="hidden"
            border="hairline"
            className={FINANCE_PANEL_SLOT_CLASSES.statement}
            headerClassName={FINANCE_PANEL_HEADER_CLASSES}
            headerDivider
            headerRight={
              <Text size="tiny" skin="muted">
                Mẫu B02-DN · đồng
              </Text>
            }
            title={panelTitle('Báo cáo kết quả hoạt động kinh doanh')}
          >
            <IncomeStatementTable
              current={current}
              currentPeriod={periods.current}
              previous={previous}
              previousPeriod={periods.previous}
            />
          </BoxPanel>
        </div>
      </PageBody>
    </PageShell>
  );
}

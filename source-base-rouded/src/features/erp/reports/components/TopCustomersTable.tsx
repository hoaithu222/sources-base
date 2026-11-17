import { memo, useCallback, useMemo } from 'react';

import { CHART_SERIES_TOKENS } from '@/shared/charts';
import { Progress, Table, TrendBadge } from '@/shared/ui';
import type { TableColumn } from '@/shared/ui';
import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import { formatBillion, type ExecCustomerRow } from '../utils/executive.utils';
import TrendSparkline from './charts/TrendSparkline';

interface TopCustomersTableProps {
  rows: readonly ExecCustomerRow[];
  versus: string;
}

const SPARK_TOKEN = CHART_SERIES_TOKENS[0];
const TABLE_MIN_WIDTH = 720;

const TOP_CUSTOMERS_CLASSES = {
  stack: 'flex min-w-0 flex-col gap-0.5',
  name: 'truncate text-body-14-medium text-fg-heading',
  sub: 'truncate text-caption-12 text-fg-muted',
  money: 'text-body-14-semibold text-fg-heading tabular-nums',
  share: 'flex items-center gap-2',
  sharePct: 'w-12 shrink-0 text-right text-caption-12-medium text-fg-subheading tabular-nums',
  overdue: 'text-error',
  trend: 'flex items-center justify-end gap-2',
  spark: 'h-7 w-16 shrink-0',
} satisfies Record<string, string>;

/**
 * TopCustomersTable — bảng "Top khách hàng" theo doanh thu của kỳ: tên + mảng hàng · doanh thu · tỷ trọng (thanh so với
 * khách lớn nhất + % trên doanh thu toàn công ty) · công nợ (dòng phụ đỏ khi có quá hạn) · xu hướng 8 tháng + biến
 * động so kỳ trước. Số canh phải `tabular-nums`; điện thoại cuộn ngang (bảng giữ bề ngang tối thiểu).
 *
 * @param props.rows - Các dòng của kỳ (`buildCustomerRows(period)`), đã sắp theo doanh thu.
 * @param props.versus - Tên mốc so sánh cho tooltip của huy hiệu biến động.
 *
 * @example
 * <TopCustomersTable rows={buildCustomerRows('month')} versus="cùng kỳ tháng 9/2026" />
 */
const TopCustomersTable = memo(function TopCustomersTable({
  rows,
  versus,
}: TopCustomersTableProps) {
  const maxShare = Math.max(0, ...rows.map((row) => row.share));

  const columns = useMemo<TableColumn<ExecCustomerRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Khách hàng',
        cell: (row) => (
          <div className={TOP_CUSTOMERS_CLASSES.stack}>
            <span className={TOP_CUSTOMERS_CLASSES.name}>{row.name}</span>
            <span className={TOP_CUSTOMERS_CLASSES.sub}>{row.segment}</span>
          </div>
        ),
      },
      {
        key: 'revenue',
        header: 'Doanh thu',
        align: 'right',
        width: 112,
        cell: (row) => (
          <span className={TOP_CUSTOMERS_CLASSES.money}>{`${formatBillion(row.revenue)} tỷ`}</span>
        ),
      },
      {
        key: 'share',
        header: '% tỷ trọng',
        width: 168,
        cell: (row) => (
          <div className={TOP_CUSTOMERS_CLASSES.share}>
            <Progress
              className="flex-1"
              label={`Tỷ trọng ${formatPercent(row.share)}`}
              max={maxShare}
              size="sm"
              value={row.share}
            />
            <span className={TOP_CUSTOMERS_CLASSES.sharePct}>{formatPercent(row.share)}</span>
          </div>
        ),
      },
      {
        key: 'receivable',
        header: 'Công nợ',
        align: 'right',
        width: 128,
        cell: (row) => (
          <div className={TOP_CUSTOMERS_CLASSES.stack}>
            <span className={TOP_CUSTOMERS_CLASSES.money}>
              {`${formatBillion(row.receivable)} tỷ`}
            </span>
            <span
              className={cn(
                TOP_CUSTOMERS_CLASSES.sub,
                row.overdue > 0 && TOP_CUSTOMERS_CLASSES.overdue,
              )}
            >
              {row.overdue > 0 ? `Quá hạn ${formatBillion(row.overdue)} tỷ` : 'Trong hạn'}
            </span>
          </div>
        ),
      },
      {
        key: 'trend',
        header: 'Xu hướng',
        align: 'right',
        width: 152,
        cell: (row) => (
          <div className={TOP_CUSTOMERS_CLASSES.trend}>
            <TrendSparkline
              ariaLabel={`Doanh thu 8 tháng của ${row.name}`}
              className={TOP_CUSTOMERS_CLASSES.spark}
              token={SPARK_TOKEN}
              unit="tỷ"
              values={row.spark}
            />
            <TrendBadge current={row.revenue} previous={row.previous} versus={versus} />
          </div>
        ),
      },
    ],
    [maxShare, versus],
  );

  const rowKey = useCallback((row: ExecCustomerRow) => row.id, []);

  return (
    <Table
      columns={columns}
      data={[...rows]}
      minWidth={TABLE_MIN_WIDTH}
      pagination={false}
      rowKey={rowKey}
    />
  );
});

export default TopCustomersTable;

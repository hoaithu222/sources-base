import { memo, useMemo } from 'react';

import { useIsPhone } from '@/shared/hooks';
import { Badge, BoxPanel, Table, type TableColumn } from '@/shared/ui';
import { formatNumber } from '@/shared/utils/format/format.utils';

import { dayIndex, formatDayMonth } from '../../utils/ops-date.utils';
import type { OrderView } from '../../utils/production.utils';
import GanttScaleHeader from './GanttScaleHeader';
import OrderGanttCell from './OrderGanttCell';
import OrderProgressCell from './OrderProgressCell';
import {
  GANTT_LEGEND_CLASSES,
  ORDER_CELL_CLASSES,
  ORDER_STATUS_META,
  PRODUCTION_LAYOUT_CLASSES,
} from './production.theme';

interface ProductionOrderTableProps {
  orders: readonly OrderView[];
}

const ROW_HEIGHT = 44;
const MIN_TABLE_WIDTH = 1240;
const rowKey = (row: OrderView) => row.id;

const LEGEND = (
  <div aria-label="Chú giải dải Gantt" className={GANTT_LEGEND_CLASSES.root}>
    <span className={GANTT_LEGEND_CLASSES.item}>
      <span className={GANTT_LEGEND_CLASSES.plan} /> Kế hoạch
    </span>
    <span className={GANTT_LEGEND_CLASSES.item}>
      <span className={GANTT_LEGEND_CLASSES.actual} /> Thực tế
    </span>
    <span className={GANTT_LEGEND_CLASSES.item}>
      <span className={GANTT_LEGEND_CLASSES.today} /> Hôm nay
    </span>
  </div>
);

const COLUMNS: TableColumn<OrderView>[] = [
  {
    key: 'code',
    header: 'Mã LSX',
    width: 128,
    frozen: true,
    cell: (row) => <span className={ORDER_CELL_CLASSES.code}>{row.code}</span>,
  },
  {
    key: 'product',
    header: 'Sản phẩm / hạng mục',
    width: 272,
    frozen: true,
    cell: (row) => (
      <span className={ORDER_CELL_CLASSES.twoLine} title={`${row.product} — ${row.project}`}>
        <span className={ORDER_CELL_CLASSES.main}>{row.product}</span>
        <span className={ORDER_CELL_CLASSES.sub}>{row.project}</span>
      </span>
    ),
  },
  {
    key: 'workshop',
    header: 'Xưởng',
    width: 104,
    cell: (row) => (
      <span className={ORDER_CELL_CLASSES.body} title={row.workshopLabel}>
        {row.workshopShort}
      </span>
    ),
  },
  {
    key: 'plan',
    header: 'Kế hoạch',
    width: 120,
    cell: (row) => (
      <span className={ORDER_CELL_CLASSES.twoLine}>
        <span className={ORDER_CELL_CLASSES.dates}>
          {`${formatDayMonth(dayIndex(row.planStart))} – ${formatDayMonth(dayIndex(row.planEnd))}`}
        </span>
        <span className={ORDER_CELL_CLASSES.sub}>{`${row.planDays} ngày`}</span>
      </span>
    ),
  },
  {
    key: 'tons',
    header: 'TT / KH (t)',
    width: 104,
    align: 'right',
    cell: (row) => (
      <span className={ORDER_CELL_CLASSES.twoLine}>
        <span className={ORDER_CELL_CLASSES.actual}>{formatNumber(row.actualTons, 1)}</span>
        <span className={ORDER_CELL_CLASSES.planned}>{`/ ${formatNumber(row.planTons, 1)}`}</span>
      </span>
    ),
  },
  {
    key: 'progress',
    header: 'Tiến độ',
    width: 168,
    cell: (row) => <OrderProgressCell order={row} />,
  },
  {
    key: 'status',
    header: 'Trạng thái',
    width: 124,
    cell: (row) => (
      <Badge color={ORDER_STATUS_META[row.status].badge} dot shape="tag" size="sm">
        {ORDER_STATUS_META[row.status].label}
      </Badge>
    ),
  },
  {
    key: 'gantt',
    header: <GanttScaleHeader />,
    cellClassName: 'px-2',
    headerCellClassName: 'px-2',
    cell: (row) => <OrderGanttCell order={row} />,
  },
];

/**
 * ProductionOrderTable — panel "Lệnh sản xuất": mỗi lệnh một dòng (mã · sản phẩm · xưởng · kế hoạch · khối lượng thực
 * tế / kế hoạch · tiến độ có vạch kế hoạch · trạng thái) và cột cuối là dải Gantt 3 tuần cùng dòng. Panel lấp phần
 * chiều cao còn lại của trang, bảng tự cuộn (header dính); mã + sản phẩm ghim trái khi cuộn ngang (điện thoại chỉ ghim
 * mã — hai cột đã rộng hơn màn); không phân trang.
 *
 * @param props.orders - Lệnh của xưởng đang lọc, đã sắp (`buildOrderViews`).
 *
 * @example
 * <ProductionOrderTable orders={views} />
 */
const ProductionOrderTable = memo(function ProductionOrderTable({
  orders,
}: ProductionOrderTableProps) {
  const isPhone = useIsPhone();
  const data = useMemo(() => [...orders], [orders]);
  const columns = useMemo(
    () => (isPhone ? COLUMNS.map((col) => ({ ...col, frozen: col.key === 'code' })) : COLUMNS),
    [isPhone],
  );

  return (
    <BoxPanel
      bodyOverflow="hidden"
      border="hairline"
      className={PRODUCTION_LAYOUT_CLASSES.orders}
      headerDivider
      headerRight={LEGEND}
      title={
        <h2 className={PRODUCTION_LAYOUT_CLASSES.title}>
          Lệnh sản xuất{' '}
          <span className={PRODUCTION_LAYOUT_CLASSES.note}>· {orders.length} lệnh</span>
        </h2>
      }
    >
      <Table
        columns={columns}
        data={data}
        emptyMessage="Xưởng này chưa có lệnh sản xuất"
        fill
        layout="fixed"
        minWidth={MIN_TABLE_WIDTH}
        pagination={false}
        resizable={false}
        rowHeight={ROW_HEIGHT}
        rowKey={rowKey}
      />
    </BoxPanel>
  );
});

export default ProductionOrderTable;

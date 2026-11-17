import { memo } from 'react';

import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import { GANTT_WINDOW } from '../../constants/production.constants';
import { OPS_TODAY } from '../../constants/operations.constants';
import {
  actualSpan,
  ganttSundayOffsets,
  ganttWeekOffsets,
  planSpan,
  todayOffset,
  type GanttSpan,
} from '../../utils/gantt.utils';
import { dayIndex, formatDayMonth } from '../../utils/ops-date.utils';
import type { OrderView } from '../../utils/production.utils';
import { GANTT_CLASSES, ORDER_STATUS_META } from './production.theme';

interface OrderGanttCellProps {
  order: OrderView;
}

const DAY_WIDTH = 100 / GANTT_WINDOW.days;
const SUNDAY_OFFSETS = ganttSundayOffsets();
const WEEK_OFFSETS = ganttWeekOffsets();
const TODAY_OFFSET = todayOffset(OPS_TODAY);

const spanStyle = (span: GanttSpan) => ({ left: `${span.left}%`, width: `${span.width}%` });
const clipClasses = (span: GanttSpan) => [
  span.clipStart && GANTT_CLASSES.clipStart,
  span.clipEnd && GANTT_CLASSES.clipEnd,
];
const dm = (iso: string) => formatDayMonth(dayIndex(iso));

/**
 * OrderGanttCell — dải Gantt 3 tuần của MỘT lệnh trong bảng: nền kẻ tuần + tô Chủ nhật, thanh kế hoạch (rỗng, viền),
 * thanh thực tế mảnh tô theo trạng thái, vạch hôm nay. Vị trí tính theo % cửa sổ `GANTT_WINDOW`; thanh vượt mép bị cắt
 * phẳng ở mép đó.
 *
 * @param props.order - Lệnh đã gắn trạng thái (`OrderView`).
 *
 * @example
 * <OrderGanttCell order={view} />
 */
const OrderGanttCell = memo(function OrderGanttCell({ order }: OrderGanttCellProps) {
  const plan = planSpan(order);
  const actual = actualSpan(order);
  const planTitle = `Kế hoạch ${dm(order.planStart)} – ${dm(order.planEnd)} (${order.planDays} ngày)`;
  const actualTitle = order.finishedOn
    ? `Thực tế ${dm(order.actualStart)} – ${dm(order.finishedOn)} · hoàn thành`
    : `Thực tế từ ${dm(order.actualStart)} · đạt ${formatPercent(order.actualPct, 1)} khối lượng`;

  return (
    <div aria-label={`${planTitle}. ${actualTitle}.`} className={GANTT_CLASSES.root} role="img">
      {SUNDAY_OFFSETS.map((left) => (
        <span
          key={left}
          className={GANTT_CLASSES.sunday}
          style={{ left: `${left}%`, width: `${DAY_WIDTH}%` }}
        />
      ))}
      {WEEK_OFFSETS.map((left) => (
        <span key={left} className={GANTT_CLASSES.week} style={{ left: `${left}%` }} />
      ))}
      {plan && (
        <span
          className={cn(GANTT_CLASSES.plan, ...clipClasses(plan))}
          style={spanStyle(plan)}
          title={planTitle}
        />
      )}
      {actual && (
        <span
          className={cn(
            GANTT_CLASSES.actual,
            ORDER_STATUS_META[order.status].fill,
            ...clipClasses(actual),
          )}
          style={spanStyle(actual)}
          title={actualTitle}
        />
      )}
      <span className={GANTT_CLASSES.today} style={{ left: `${TODAY_OFFSET}%` }} />
    </div>
  );
});

export default OrderGanttCell;

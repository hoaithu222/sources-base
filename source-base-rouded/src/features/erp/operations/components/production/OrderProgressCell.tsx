import { memo } from 'react';

import { formatPercent } from '@/shared/utils/format/format.utils';
import { cn } from '@/shared/utils/style/cn';

import type { OrderView } from '../../utils/production.utils';
import { ORDER_PROGRESS_CLASSES, ORDER_STATUS_META } from './production.theme';

interface OrderProgressCellProps {
  order: OrderView;
}

/**
 * OrderProgressCell — ô "Tiến độ" của bảng lệnh: thanh % khối lượng thực tế tô theo trạng thái, vạch đậm đánh dấu % kế
 * hoạch tới hôm nay, bên phải là số thực tế + "KH x%". Thanh hụt sau vạch = đang chậm.
 *
 * @param props.order - Lệnh đã gắn trạng thái (`OrderView`).
 *
 * @example
 * <OrderProgressCell order={view} />
 */
const OrderProgressCell = memo(function OrderProgressCell({ order }: OrderProgressCellProps) {
  const planLabel = `KH ${formatPercent(order.planPct, 0)}`;
  const label = `Thực tế ${formatPercent(order.actualPct, 1)}, kế hoạch tới hôm nay ${formatPercent(order.planPct, 1)}`;

  return (
    <div className={ORDER_PROGRESS_CLASSES.root} title={label}>
      <div aria-label={label} className={ORDER_PROGRESS_CLASSES.bar} role="img">
        <div className={ORDER_PROGRESS_CLASSES.track}>
          <div
            className={cn(ORDER_PROGRESS_CLASSES.fill, ORDER_STATUS_META[order.status].fill)}
            style={{ width: `${order.actualPct}%` }}
          />
        </div>
        {order.status !== 'done' && (
          <span className={ORDER_PROGRESS_CLASSES.marker} style={{ left: `${order.planPct}%` }} />
        )}
      </div>
      <span className={ORDER_PROGRESS_CLASSES.numbers}>
        <span className={ORDER_PROGRESS_CLASSES.value}>{formatPercent(order.actualPct, 1)}</span>
        {order.status !== 'done' && (
          <span className={ORDER_PROGRESS_CLASSES.plan}>{planLabel}</span>
        )}
      </span>
    </div>
  );
});

export default OrderProgressCell;

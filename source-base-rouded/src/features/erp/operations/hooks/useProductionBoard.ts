import { useCallback, useMemo, useState } from 'react';

import { OPS_TODAY } from '../constants/operations.constants';
import { PRODUCTION_ORDERS } from '../constants/production-orders.constants';
import type { WorkshopFilter } from '../constants/production.constants';
import {
  buildOrderViews,
  buildOutputRows,
  summarizeProduction,
  summarizeWorkshops,
} from '../utils/production.utils';

/**
 * useProductionBoard — trạng thái + số liệu dẫn xuất của màn "Tiến độ sản xuất" theo xưởng đang lọc: lệnh đã gắn trạng
 * thái, bốn số KPI, chuỗi sản lượng 14 ngày và dòng hiệu suất từng xưởng (luôn đủ ba xưởng).
 *
 * @example
 * const { workshop, selectWorkshop, orders, summary, output, workshops } = useProductionBoard();
 */
export function useProductionBoard() {
  const [workshop, setWorkshop] = useState<WorkshopFilter>('all');

  const selectWorkshop = useCallback((key: string) => setWorkshop(key as WorkshopFilter), []);

  const allOrders = useMemo(() => buildOrderViews(PRODUCTION_ORDERS, OPS_TODAY), []);
  const orders = useMemo(
    () => (workshop === 'all' ? allOrders : allOrders.filter((o) => o.workshop === workshop)),
    [allOrders, workshop],
  );
  const summary = useMemo(() => summarizeProduction(orders, workshop), [orders, workshop]);
  const output = useMemo(() => buildOutputRows(workshop), [workshop]);
  const workshops = useMemo(() => summarizeWorkshops(allOrders), [allOrders]);

  return { workshop, selectWorkshop, orders, summary, output, workshops };
}

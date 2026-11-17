import { useCallback, useMemo, useState } from 'react';

import { PURCHASE_ORDERS, PURCHASE_TODAY } from '../constants/purchase-orders.constants';
import type { PurchaseStatusFilter } from '../types/supply.types';
import {
  countPurchaseStatuses,
  filterPurchaseRows,
  summarizePurchases,
  toPurchaseRows,
} from '../utils/purchase.utils';

const ALL_ROWS = toPurchaseRows(PURCHASE_ORDERS, PURCHASE_TODAY);
const DEFAULT_PAGE_SIZE = 12;

/** Trạng thái màn "Đơn mua" mà các khối dùng chung — kết quả của `usePurchaseOrders()`. */
export type PurchaseOrdersState = ReturnType<typeof usePurchaseOrders>;

/**
 * usePurchaseOrders — dữ liệu + bộ lọc của màn "Đơn mua": đoạn trạng thái, từ khoá, trang của bảng; đếm theo trạng
 * thái và KPI tính trên TOÀN BỘ đơn (bộ lọc chỉ đổi bảng). Đổi trạng thái / từ khoá thì về trang 1.
 *
 * @returns `allRows` · `rows` (đã lọc) · `pageRows` · `counts` · `summary` · `status` / `keyword` / `page` /
 *   `pageSize` cùng hàm đổi của chúng · `resetFilters`.
 *
 * @example
 * const orders = usePurchaseOrders();
 * <PurchaseOrderPanel orders={orders} />
 */
export function usePurchaseOrders() {
  const [status, setStatusState] = useState<PurchaseStatusFilter>('all');
  const [keyword, setKeywordState] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const counts = useMemo(() => countPurchaseStatuses(ALL_ROWS), []);
  const summary = useMemo(() => summarizePurchases(ALL_ROWS), []);
  const rows = useMemo(() => filterPurchaseRows(ALL_ROWS, status, keyword), [status, keyword]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [rows, currentPage, pageSize],
  );

  const setStatus = useCallback((next: string) => {
    setStatusState(next as PurchaseStatusFilter);
    setPage(1);
  }, []);
  const setKeyword = useCallback((next: string) => {
    setKeywordState(next);
    setPage(1);
  }, []);
  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setPage(1);
  }, []);
  const resetFilters = useCallback(() => {
    setStatusState('all');
    setKeywordState('');
    setPage(1);
  }, []);

  return {
    allRows: ALL_ROWS,
    rows,
    pageRows,
    counts,
    summary,
    status,
    setStatus,
    keyword,
    setKeyword,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  };
}

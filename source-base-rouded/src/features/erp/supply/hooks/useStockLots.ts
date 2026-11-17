import { useCallback, useMemo, useState } from 'react';

import { STOCK_LOTS, STOCK_TODAY } from '../constants/stock.constants';
import type { WarehouseFilter } from '../types/supply.types';
import {
  filterStockRows,
  scopeStockRows,
  stockByGroup,
  summarizeStock,
  toStockRows,
  topStockItems,
} from '../utils/stock.utils';

const ALL_ROWS = toStockRows(STOCK_LOTS, STOCK_TODAY);
const DEFAULT_PAGE_SIZE = 12;

/** Trạng thái màn "Tồn kho" mà các khối dùng chung — kết quả của `useStockLots()`. */
export type StockLotsState = ReturnType<typeof useStockLots>;

/**
 * useStockLots — dữ liệu + bộ lọc của màn "Tồn kho": kho đang xem (đổi MỌI khối: KPI, bảng, donut, top mã), từ khoá
 * và "chỉ hiện cảnh báo" (chỉ đổi bảng), trang của bảng. Đổi bộ lọc thì về trang 1.
 *
 * @returns `scopeRows` (lô của kho đang xem) · `rows` (sau từ khoá / cảnh báo) · `pageRows` · `summary` ·
 *   `warningCount` · `groups` · `topItems` · `warehouse` / `keyword` / `warningsOnly` / `page` / `pageSize` cùng
 *   hàm đổi của chúng · `resetFilters`.
 *
 * @example
 * const stock = useStockLots();
 * <StockLotPanel stock={stock} />
 */
export function useStockLots() {
  const [warehouse, setWarehouseState] = useState<WarehouseFilter>('all');
  const [keyword, setKeywordState] = useState('');
  const [warningsOnly, setWarningsOnlyState] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const scopeRows = useMemo(() => scopeStockRows(ALL_ROWS, warehouse), [warehouse]);
  const rows = useMemo(
    () => filterStockRows(scopeRows, keyword, warningsOnly),
    [scopeRows, keyword, warningsOnly],
  );
  const summary = useMemo(() => summarizeStock(scopeRows), [scopeRows]);
  const groups = useMemo(() => stockByGroup(scopeRows), [scopeRows]);
  const topItems = useMemo(() => topStockItems(scopeRows), [scopeRows]);
  const warningCount = useMemo(
    () => scopeRows.filter((row) => row.warnings.length > 0).length,
    [scopeRows],
  );

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = useMemo(
    () => rows.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [rows, currentPage, pageSize],
  );

  const setWarehouse = useCallback((next: string) => {
    setWarehouseState((next || 'all') as WarehouseFilter);
    setPage(1);
  }, []);
  const setKeyword = useCallback((next: string) => {
    setKeywordState(next);
    setPage(1);
  }, []);
  const setWarningsOnly = useCallback((next: boolean) => {
    setWarningsOnlyState(next);
    setPage(1);
  }, []);
  const setPageSize = useCallback((next: number) => {
    setPageSizeState(next);
    setPage(1);
  }, []);
  const resetFilters = useCallback(() => {
    setKeywordState('');
    setWarningsOnlyState(false);
    setPage(1);
  }, []);

  return {
    scopeRows,
    rows,
    pageRows,
    summary,
    groups,
    topItems,
    warningCount,
    warehouse,
    setWarehouse,
    keyword,
    setKeyword,
    warningsOnly,
    setWarningsOnly,
    page: currentPage,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  };
}

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/shared/constants/pagination.constants';

import { useEventCallback } from '../state/useEventCallback';
import { applyParamUpdates, readIntInRange, type QueryParamValue } from './query-params.utils';

export interface QueryParamsConfig {
  pageKey?: string;
  pageSizeKey?: string;
  searchKey?: string;
  tabKey?: string;
  defaultPageSize?: number;
  /** Trần `pageSize` đọc từ URL; ngoài `[1, maxPageSize]` → `defaultPageSize`. Mặc định `MAX_PAGE_SIZE`. */
  maxPageSize?: number;
  /** Key param của hook ngoài page/pageSize/search/tab (vd `['status']`) — `clearParams()` xoá thêm các key này. */
  paramKeys?: string[];
  /** Tự reset page về 1 khi `setSearch` / `setParam` đổi param không phải page/pageSize. */
  resetPageOnChange?: boolean;
}

export interface UseQueryParamsReturn {
  page: number;
  pageSize: number;
  search: string;
  tab: string;
  getParam: (key: string, defaultValue?: string) => string;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearch: (value: string) => void;
  setTab: (value: string) => void;
  setParam: (key: string, value: QueryParamValue) => void;
  updateParams: (updates: Record<string, QueryParamValue>) => void;
  clearParams: () => void;
  searchParams: URLSearchParams;
}

const DEFAULT_PAGE = 1;

/**
 * Filter / phân trang / tab sống trên URL — BẮT BUỘC cho mọi màn hình có filter, phân trang hoặc tab.
 * `setSearch` / `setParam` (key ≠ page/pageSize) đưa `page` về 1 (tắt: `resetPageOnChange: false`); rỗng/`null` xoá key.
 * Ghi bằng `{ replace: true }`; `page`/`pageSize` đọc chặt (số nguyên không dấu, sai → mặc định); `clearParams` chỉ xoá param của hook.
 */
export function useQueryParams(config?: QueryParamsConfig): UseQueryParamsReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageKey = config?.pageKey ?? 'page';
  const pageSizeKey = config?.pageSizeKey ?? 'pageSize';
  const searchKey = config?.searchKey ?? 'search';
  const tabKey = config?.tabKey ?? 'tab';
  const defaultPageSize = config?.defaultPageSize ?? DEFAULT_PAGE_SIZE;
  const maxPageSize = config?.maxPageSize ?? MAX_PAGE_SIZE;
  const resetPageOnChange = config?.resetPageOnChange ?? true;

  const page = useMemo(
    () => readIntInRange(searchParams.get(pageKey), 1, Number.MAX_SAFE_INTEGER, DEFAULT_PAGE),
    [searchParams, pageKey],
  );

  const pageSize = useMemo(
    () => readIntInRange(searchParams.get(pageSizeKey), 1, maxPageSize, defaultPageSize),
    [searchParams, pageSizeKey, defaultPageSize, maxPageSize],
  );

  const search = useMemo(() => searchParams.get(searchKey) ?? '', [searchParams, searchKey]);

  const tab = useMemo(() => searchParams.get(tabKey) ?? '', [searchParams, tabKey]);

  const getParam = useCallback(
    (key: string, defaultValue = '') => searchParams.get(key) ?? defaultValue,
    [searchParams],
  );

  const updateParams = useCallback(
    (updates: Record<string, QueryParamValue>) => {
      setSearchParams((prev) => applyParamUpdates(prev, updates), { replace: true });
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (newPage: number) => updateParams({ [pageKey]: newPage }),
    [updateParams, pageKey],
  );

  const setPageSize = useCallback(
    (size: number) => updateParams({ [pageSizeKey]: size, [pageKey]: 1 }),
    [updateParams, pageSizeKey, pageKey],
  );

  const setSearch = useCallback(
    (value: string) =>
      updateParams({
        [searchKey]: value || null,
        ...(resetPageOnChange ? { [pageKey]: 1 } : {}),
      }),
    [updateParams, searchKey, pageKey, resetPageOnChange],
  );

  const setTab = useCallback(
    (value: string) => updateParams({ [tabKey]: value || null }),
    [updateParams, tabKey],
  );

  const setParam = useCallback(
    (key: string, value: QueryParamValue) =>
      updateParams({
        [key]: value,
        ...(resetPageOnChange && key !== pageKey && key !== pageSizeKey ? { [pageKey]: 1 } : {}),
      }),
    [updateParams, pageKey, pageSizeKey, resetPageOnChange],
  );

  const clearParams = useEventCallback(() =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        [pageKey, pageSizeKey, searchKey, tabKey, ...(config?.paramKeys ?? [])].forEach((key) =>
          next.delete(key),
        );
        return next;
      },
      { replace: true },
    ),
  );

  return {
    page,
    pageSize,
    search,
    tab,
    getParam,
    setPage,
    setPageSize,
    setSearch,
    setTab,
    setParam,
    updateParams,
    clearParams,
    searchParams,
  };
}

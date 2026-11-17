'use client';

import { useEffect } from 'react';

import { useDebounce, useQueryParams } from '@/shared/hooks';

import type { CustomerStatus } from '../api/customers.types';
import { CUSTOMER_SEARCH_DEBOUNCE_MS } from '../constants/customers.constants';
import { useCustomerListQuery } from '../service/customers.queries';
import { parseCustomerStatus } from '../utils/customer-url.utils';

/**
 * useCustomerList — danh sách khách hàng theo bộ lọc nằm trên URL (`?search=&status=&page=&pageSize=`).
 *
 * Từ khoá đi qua `useDebounce` TRƯỚC khi vào query key (gõ không bắn request mỗi phím); `status` đọc từ URL được kiểm
 * (giá trị rác = không lọc). Đổi bộ lọc tự đưa `page` về 1 (`useQueryParams`); `page` vượt quá trang cuối (xoá dòng cuối của
 * trang cuối, URL gõ tay) tự lùi về trang cuối. Trang dùng hook này PHẢI nằm trong `<Suspense>`.
 *
 * @returns `query` (React Query) + giá trị lọc / phân trang đang hiện + hàm đổi chúng; `clearFilters` xoá cả bộ lọc lẫn phân trang.
 *
 * @example
 * const { query, search, setSearch, status, setStatus } = useCustomerList();
 */
export function useCustomerList() {
  const {
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    getParam,
    setParam,
    clearParams,
  } = useQueryParams({ paramKeys: ['status'] });
  const status = parseCustomerStatus(getParam('status'));
  const keyword = useDebounce(search.trim(), CUSTOMER_SEARCH_DEBOUNCE_MS);
  const query = useCustomerListQuery({ keyword, status, page, pageSize });

  const { data, isPlaceholderData } = query;
  const lastPage = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;
  const beyondLastPage = data !== undefined && !isPlaceholderData && page > lastPage;
  useEffect(() => {
    if (beyondLastPage) setPage(lastPage);
  }, [beyondLastPage, lastPage, setPage]);

  return {
    query,
    search,
    status,
    page,
    pageSize,
    hasFilter: search.trim() !== '' || status !== undefined,
    setSearch,
    setStatus: (next?: CustomerStatus) => setParam('status', next ?? null),
    setPage,
    setPageSize,
    clearFilters: clearParams,
  };
}

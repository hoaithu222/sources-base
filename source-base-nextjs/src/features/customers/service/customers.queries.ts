'use client';

import {
  keepPreviousData,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { customersApi } from '../api/customers.api';
import type { CustomerInput, CustomerListParams } from '../api/customers.types';

/**
 * Query key + `queryOptions` + hook của `customers` — MỘT chỗ cho đọc, prefetch và invalidate sau mutation.
 *
 *   customerKeys.lists()        → mọi danh sách (mọi bộ lọc)   — invalidate sau tạo / sửa / xoá
 *   customerKeys.list(params)   → một danh sách theo bộ lọc    · customerKeys.detail(id) → một bản ghi
 *   customerQueries.list(p) · .detail(id)   → dùng cho `useQuery`, `queryClient.prefetchQuery`, `ensureQueryData`
 *
 * Lưu ý: query đọc khai `silentError` vì view tự vẽ lỗi (nút "Thử lại"); mutation tạo / sửa cũng vậy (lỗi hiện trên form).
 *        Xoá không khai nên lỗi do bộ báo lỗi tập trung toast. Hook KHÔNG toast thành công — view quyết.
 */

const SILENT = { silentError: true } as const;

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params: CustomerListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

export const customerQueries = {
  list: (params: CustomerListParams) =>
    queryOptions({
      queryKey: customerKeys.list(params),
      queryFn: ({ signal }) => customersApi.getList(params, signal),
      placeholderData: keepPreviousData,
      meta: SILENT,
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: customerKeys.detail(id),
      queryFn: ({ signal }) => customersApi.getById(id, signal),
      meta: SILENT,
    }),
};

export const useCustomerListQuery = (params: CustomerListParams) =>
  useQuery(customerQueries.list(params));

export const useCustomerQuery = (id: number | null) =>
  useQuery({ ...customerQueries.detail(id ?? 0), enabled: id !== null });

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CustomerInput) => customersApi.create(input),
    meta: SILENT,
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CustomerInput }) =>
      customersApi.update(id, input),
    meta: SILENT,
    onSuccess: (customer) => {
      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customersApi.remove(id),
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
  });
};

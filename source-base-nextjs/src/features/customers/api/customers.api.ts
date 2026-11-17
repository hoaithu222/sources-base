import { appConfig } from '@/core/config';
import { apiClient, readData } from '@/core/http';

import {
  toCustomer,
  toCustomerListPage,
  toListQueryDto,
  toWriteDto,
} from '../utils/customer-mapping.utils';
import { customerDtoSchema, customerListDtoSchema } from './customer-dto.schema';
import { customersDemoAdapter } from './customers-demo-adapter';
import type {
  Customer,
  CustomerInput,
  CustomerListPage,
  CustomerListParams,
} from './customers.types';

/**
 * Hàm gọi API của `customers` — async thuần, trả MODEL giao diện (`Customer`), không lộ DTO của BE.
 *
 * Dùng:   const page = await customersApi.getList({ keyword: '', page: 1, pageSize: 12 }, signal);
 * Lưu ý:  đọc có `signal` để huỷ request thật; payload qua `readData(response, schema)` rồi mapping (`customer-mapping.utils.ts`).
 *         `transport()` chỉ trả adapter demo khi `appConfig.isDemo` — dự án thật xoá hàm này và các `...transport()`.
 */

const ENDPOINTS = {
  list: '/customers',
  byId: (id: number) => `/customers/${id}`,
} as const;

const transport = () => (appConfig.isDemo ? { adapter: customersDemoAdapter } : {});

export const customersApi = {
  getList: async (params: CustomerListParams, signal?: AbortSignal): Promise<CustomerListPage> =>
    toCustomerListPage(
      readData(
        await apiClient.get(ENDPOINTS.list, {
          params: toListQueryDto(params),
          signal,
          ...transport(),
        }),
        customerListDtoSchema,
      ),
    ),

  getById: async (id: number, signal?: AbortSignal): Promise<Customer> =>
    toCustomer(
      readData(
        await apiClient.get(ENDPOINTS.byId(id), { signal, ...transport() }),
        customerDtoSchema,
      ),
    ),

  create: async (input: CustomerInput): Promise<Customer> =>
    toCustomer(
      readData(
        await apiClient.post(ENDPOINTS.list, toWriteDto(input), transport()),
        customerDtoSchema,
      ),
    ),

  update: async (id: number, input: CustomerInput): Promise<Customer> =>
    toCustomer(
      readData(
        await apiClient.put(ENDPOINTS.byId(id), toWriteDto(input), transport()),
        customerDtoSchema,
      ),
    ),

  remove: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.byId(id), transport());
  },
};

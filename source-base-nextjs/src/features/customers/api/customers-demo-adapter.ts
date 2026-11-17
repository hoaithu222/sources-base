import { AxiosError, CanceledError } from 'axios';
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { z } from 'zod';

import { emailField } from '@/shared/utils/validation/validators.utils';
import { matchesSearch } from '@/shared/utils/format/string.utils';

import { CUSTOMER_CODE_TAKEN } from '../constants/customers.constants';
import { customerDtoSchema } from './customer-dto.schema';
import type { CustomerDto } from './customer-dto.schema';
import { CUSTOMERS_DEMO_SEED } from './customers-demo-seed';

/**
 * "Máy chủ demo" của `customers` — adapter axios giữ dữ liệu trong BỘ NHỚ, nói đúng hợp đồng REST của BE thật
 * (`GET/POST /customers`, `GET/PUT/DELETE /customers/:id`, lỗi 404 / 409 / 422) nên hàm API, interceptor, `readData` và
 * React Query chạy y như khi có backend. Chỉ `customers.api.ts` gắn nó, và chỉ khi `appConfig.isDemo`.
 *
 * Dùng:   gắn theo từng request: `apiClient.get(url, { adapter: customersDemoAdapter })`.
 * Lưu ý:  dữ liệu mất khi tải lại trang; test gọi `resetCustomersDemo({ latencyMs: 0 })` trước mỗi ca. Dựng dự án thật:
 *         xoá file này + `customers-demo-seed.ts` và dòng `transport()` ở `customers.api.ts`.
 */

interface DemoReply {
  status: number;
  data?: unknown;
}

const DEFAULT_LATENCY_MS = 150;

const writeSchema = customerDtoSchema
  .pick({ phone: true, status: true, credit_limit: true })
  .extend({
    code: z.string().trim().min(1),
    name: z.string().trim().min(1),
    email: emailField(),
  });

const BY_ID_PATH = /^\/customers\/(\d+)$/;

let rows: CustomerDto[] = [];
let nextId = 1;
let latencyMs = DEFAULT_LATENCY_MS;

export function resetCustomersDemo({ latencyMs: latency = DEFAULT_LATENCY_MS } = {}): void {
  rows = CUSTOMERS_DEMO_SEED.map((row) => ({ ...row }));
  nextId = rows.length + 1;
  latencyMs = latency;
}

resetCustomersDemo();

const ok = (data: unknown, status = 200): DemoReply => ({ status, data: { data } });

const fail = (status: number, code: string, errors?: Record<string, string[]>): DemoReply => ({
  status,
  data: { error: { code }, ...(errors ? { errors } : {}) },
});

const newestFirst = (a: CustomerDto, b: CustomerDto): number =>
  b.updated_at.localeCompare(a.updated_at) || b.id - a.id;

const isCodeTaken = (code: string, exceptId?: number): boolean =>
  rows.some((row) => row.id !== exceptId && row.code.toUpperCase() === code.trim().toUpperCase());

function listCustomers(params: Record<string, unknown> = {}): DemoReply {
  const keyword = typeof params.keyword === 'string' ? params.keyword : '';
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.page_size ?? 12);
  const matched = rows
    .filter((row) => !params.status || row.status === params.status)
    .filter((row) => matchesSearch([row.code, row.name, row.email], keyword))
    .sort(newestFirst);

  return ok({
    items: matched.slice((page - 1) * pageSize, page * pageSize),
    total: matched.length,
  });
}

function writeCustomer(body: unknown, id?: number): DemoReply {
  const parsed = writeSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues)
      (errors[String(issue.path[0])] ??= []).push(issue.message);
    return fail(422, 'VAL_001', errors);
  }
  if (isCodeTaken(parsed.data.code, id)) return fail(409, CUSTOMER_CODE_TAKEN);

  const now = new Date().toISOString();
  if (id === undefined) {
    const created: CustomerDto = { ...parsed.data, id: nextId++, created_at: now, updated_at: now };
    rows = [created, ...rows];
    return ok(created, 201);
  }
  const current = rows.find((row) => row.id === id);
  if (!current) return fail(404, 'RES_001');
  const updated: CustomerDto = { ...current, ...parsed.data, updated_at: now };
  rows = rows.map((row) => (row.id === id ? updated : row));
  return ok(updated);
}

function route(config: InternalAxiosRequestConfig): DemoReply {
  const method = (config.method ?? 'get').toLowerCase();
  const path = (config.url ?? '').split('?')[0];
  const body: unknown = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

  if (path === '/customers') {
    if (method === 'get') return listCustomers(config.params as Record<string, unknown>);
    if (method === 'post') return writeCustomer(body);
  }

  const id = Number(BY_ID_PATH.exec(path)?.[1]);
  const current = rows.find((row) => row.id === id);
  if (Number.isNaN(id) || !current) return fail(404, 'RES_001');
  if (method === 'get') return ok(current);
  if (method === 'put') return writeCustomer(body, id);
  if (method === 'delete') {
    rows = rows.filter((row) => row.id !== id);
    return { status: 204 };
  }
  return fail(404, 'RES_001');
}

function wait(config: InternalAxiosRequestConfig): Promise<void> {
  const { signal } = config;
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new CanceledError(undefined, config));
      return;
    }
    const timer = setTimeout(resolve, latencyMs);
    signal?.addEventListener?.(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new CanceledError(undefined, config));
      },
      { once: true },
    );
  });
}

export const customersDemoAdapter: AxiosAdapter = async (config) => {
  await wait(config);
  const reply = route(config);
  const response: AxiosResponse = {
    status: reply.status,
    statusText: String(reply.status),
    data: reply.data,
    headers: {},
    config,
  };
  if (reply.status < 300) return response;

  throw new AxiosError(
    `Request failed with status code ${reply.status}`,
    AxiosError.ERR_BAD_REQUEST,
    config,
    null,
    response,
  );
};

import type { CustomerStatus } from '../api/customers.types';

/**
 * Hằng của feature `customers` — dùng chung cho schema, API, view và adapter demo.
 *
 * Lưu ý: `CUSTOMER_CODE_TAKEN` là mã lỗi BE trả kèm HTTP 409 khi mã khách hàng đã tồn tại; view rẽ nhánh theo mã này
 *        (gắn lỗi vào ô `code`) thay vì so câu chữ.
 */

export const CUSTOMER_STATUSES = [
  'active',
  'inactive',
] as const satisfies readonly CustomerStatus[];

export const CUSTOMER_CODE_MAX = 20;
export const CUSTOMER_NAME_MAX = 200;

export const CUSTOMER_SEARCH_DEBOUNCE_MS = 300;

export const CUSTOMER_CODE_TAKEN = 'CUSTOMER_001';

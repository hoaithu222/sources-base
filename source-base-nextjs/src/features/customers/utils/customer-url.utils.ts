import { PATHS } from '@/shared/constants/paths.constants';

import type { CustomerStatus } from '../api/customers.types';
import { CUSTOMER_STATUSES } from '../constants/customers.constants';

/**
 * Đọc / ghi `customers` trên URL: trang sửa là route TĨNH `/demo/customers/edit?id=…` (không dùng `[id]` để giữ SSG).
 *
 * Dùng:   <Link href={customerEditPath(row.id)}>   ·   parseCustomerId(getParam('id'))   ·   parseCustomerStatus(getParam('status'))
 * Lưu ý:  dữ liệu đọc từ URL là dữ liệu NGOÀI — hàm `parse*` trả `null` / `undefined` với giá trị rác, nơi gọi tự xử lý nhánh đó.
 */

export const customerEditPath = (id: number): string =>
  `${PATHS.DEMO_CUSTOMER_EDIT}?id=${encodeURIComponent(String(id))}`;

export function parseCustomerId(raw: string): number | null {
  if (!/^[1-9]\d{0,14}$/.test(raw)) return null;
  return Number(raw);
}

export function parseCustomerStatus(raw: string): CustomerStatus | undefined {
  return CUSTOMER_STATUSES.find((status) => status === raw);
}

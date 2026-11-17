import { z } from 'zod';

import { CUSTOMER_STATUSES } from '../constants/customers.constants';

/**
 * Hợp đồng dữ liệu BE của `customers` — kiểm bằng Zod ở `readData(response, schema)` nên BE trả sai hình dạng
 * (thiếu trường, tiền không phải số thập phân) là `AppError('contract')` ngay chỗ gọi API, không nổ xa ở giao diện.
 *
 * Lưu ý: tiền (`credit_limit`) là CHUỖI thập phân để không mất độ chính xác khi truyền; `toCustomer` đổi sang `number`.
 */

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/;

export const customerDtoSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  status: z.enum(CUSTOMER_STATUSES),
  credit_limit: z.string().regex(MONEY_PATTERN),
  created_at: z.string(),
  updated_at: z.string(),
});

export const customerListDtoSchema = z.object({
  items: z.array(customerDtoSchema),
  total: z.number().int().nonnegative(),
});

export type CustomerDto = z.output<typeof customerDtoSchema>;
export type CustomerListDto = z.output<typeof customerListDtoSchema>;

/** Thân request tạo / sửa — mọi trường ghi được của `CustomerDto`. */
export type CustomerWriteDto = Pick<
  CustomerDto,
  'code' | 'name' | 'email' | 'phone' | 'status' | 'credit_limit'
>;

/** Query của `GET /customers`: BE đặt tên `page_size`, bỏ trống thì không lọc. */
export interface CustomerListQueryDto {
  keyword?: string;
  status?: CustomerDto['status'];
  page: number;
  page_size: number;
}

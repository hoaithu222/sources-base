/** Model phía giao diện của feature `customers` — camelCase, tiền là `number`; hợp đồng BE (snake_case, tiền dạng chuỗi) ở `customer-dto.schema.ts`. */

export type CustomerStatus = 'active' | 'inactive';

export interface Customer {
  id: number;
  code: string;
  name: string;
  email: string;
  /** `''` khi chưa có số điện thoại. */
  phone: string;
  status: CustomerStatus;
  /** Hạn mức công nợ, đơn vị đồng. */
  creditLimit: number;
  createdAt: string;
  updatedAt: string;
}

/** Phần người dùng nhập được — cũng là giá trị của form (`CustomerFormValues`). */
export type CustomerInput = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

export interface CustomerListParams {
  /** `''` = không lọc theo từ khoá. */
  keyword: string;
  status?: CustomerStatus;
  /** Đếm từ 1. */
  page: number;
  pageSize: number;
}

export interface CustomerListPage {
  items: Customer[];
  total: number;
}

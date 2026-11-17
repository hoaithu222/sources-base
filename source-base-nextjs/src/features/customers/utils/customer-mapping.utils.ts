import type {
  CustomerDto,
  CustomerListDto,
  CustomerListQueryDto,
  CustomerWriteDto,
} from '../api/customer-dto.schema';
import type {
  Customer,
  CustomerInput,
  CustomerListPage,
  CustomerListParams,
} from '../api/customers.types';

/**
 * Chuyển qua lại giữa hợp đồng BE (DTO: snake_case, tiền dạng chuỗi, `phone: null`) và model giao diện
 * (camelCase, `number`, `phone: ''`). Hàm THUẦN — mọi chỗ khác chỉ thấy `Customer`.
 *
 * Dùng:   toCustomer(dto) · toCustomerListPage(dto) · toCustomerInput(customer) (giá trị đầu của form)
 *         toWriteDto(input) · toListQueryDto(params)   (chiều đi: giao diện → BE)
 * Lưu ý:  `toWriteDto` cắt khoảng trắng và dựng payload TƯỜNG MINH — không gửi nguyên giá trị form.
 */

export function toCustomer(dto: CustomerDto): Customer {
  return {
    id: dto.id,
    code: dto.code,
    name: dto.name,
    email: dto.email,
    phone: dto.phone ?? '',
    status: dto.status,
    creditLimit: Number(dto.credit_limit),
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function toCustomerListPage(dto: CustomerListDto): CustomerListPage {
  return { items: dto.items.map(toCustomer), total: dto.total };
}

export function toCustomerInput(customer: Customer): CustomerInput {
  return {
    code: customer.code,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    creditLimit: customer.creditLimit,
  };
}

export function toWriteDto(input: CustomerInput): CustomerWriteDto {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim() === '' ? null : input.phone.trim(),
    status: input.status,
    credit_limit: input.creditLimit.toFixed(2),
  };
}

export function toListQueryDto(params: CustomerListParams): CustomerListQueryDto {
  const keyword = params.keyword.trim();
  return {
    keyword: keyword === '' ? undefined : keyword,
    status: params.status,
    page: params.page,
    page_size: params.pageSize,
  };
}

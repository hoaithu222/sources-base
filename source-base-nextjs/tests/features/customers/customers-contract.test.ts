/**
 * Hợp đồng dữ liệu của `src/features/customers` — phần THUẦN, không dựng giao diện.
 *
 *  1. DTO ↔ model: BE nói snake_case + tiền dạng chuỗi + `phone: null`, giao diện chỉ thấy camelCase + `number` + `''`;
 *     chiều đi (`toWriteDto`) dựng payload tường minh, cắt khoảng trắng, không rò trường của form.
 *  2. Schema DTO: BE trả tiền không phải số thập phân là lỗi hợp đồng ngay ở `readData`, không nổ xa ở giao diện.
 *  3. Query key: mọi danh sách nằm dưới `lists()` (invalidate một lệnh) và tách khỏi `detail(id)`; `queryOptions` dùng đúng key đó.
 *  4. Đọc URL: `?id=` / `?status=` rác không bao giờ thành id / trạng thái.
 */

import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import {
  customerDtoSchema,
  customerListDtoSchema,
} from '@/features/customers/api/customer-dto.schema';
import type { CustomerDto } from '@/features/customers/api/customer-dto.schema';
import { CUSTOMERS_DEMO_SEED } from '@/features/customers/api/customers-demo-seed';
import { customerKeys, customerQueries } from '@/features/customers/service/customers.queries';
import {
  toCustomer,
  toCustomerInput,
  toCustomerListPage,
  toListQueryDto,
  toWriteDto,
} from '@/features/customers/utils/customer-mapping.utils';
import {
  customerEditPath,
  parseCustomerId,
  parseCustomerStatus,
} from '@/features/customers/utils/customer-url.utils';

const DTO: CustomerDto = {
  id: 7,
  code: 'KH007',
  name: 'Cửa hàng Vật tư Minh Tâm',
  email: 'minhtam@example.com',
  phone: null,
  status: 'inactive',
  credit_limit: '15000000.50',
  created_at: '2026-09-07T08:30:00.000Z',
  updated_at: '2026-10-01T09:00:00.000Z',
};

describe('mapping DTO → model', () => {
  it('snake_case → camelCase, tiền chuỗi → number, phone null → chuỗi rỗng', () => {
    expect(toCustomer(DTO)).toEqual({
      id: 7,
      code: 'KH007',
      name: 'Cửa hàng Vật tư Minh Tâm',
      email: 'minhtam@example.com',
      phone: '',
      status: 'inactive',
      creditLimit: 15000000.5,
      createdAt: '2026-09-07T08:30:00.000Z',
      updatedAt: '2026-10-01T09:00:00.000Z',
    });
  });

  it('trang danh sách giữ nguyên `total`, từng dòng đi qua `toCustomer`', () => {
    const page = toCustomerListPage({
      items: [DTO, { ...DTO, id: 8, phone: '0912345678' }],
      total: 41,
    });

    expect(page.total).toBe(41);
    expect(page.items.map((item) => [item.id, item.phone])).toEqual([
      [7, ''],
      [8, '0912345678'],
    ]);
  });

  it('dữ liệu mẫu của máy chủ demo đều đúng schema DTO (demo nói đúng hợp đồng thật)', () => {
    const parsed = customerListDtoSchema.safeParse({ items: CUSTOMERS_DEMO_SEED, total: 15 });

    expect(parsed.success).toBe(true);
    expect(CUSTOMERS_DEMO_SEED.length).toBeGreaterThan(12);
  });
});

describe('mapping model → DTO', () => {
  const input = {
    code: '  KH100 ',
    name: ' Công ty Mới  ',
    email: ' moi@example.com ',
    phone: '   ',
    status: 'active' as const,
    creditLimit: 1500000,
  };

  it('payload tường minh: cắt khoảng trắng, phone trống → null, tiền → chuỗi 2 chữ số lẻ', () => {
    expect(toWriteDto(input)).toEqual({
      code: 'KH100',
      name: 'Công ty Mới',
      email: 'moi@example.com',
      phone: null,
      status: 'active',
      credit_limit: '1500000.00',
    });
  });

  it('không rò trường lạ của form vào payload', () => {
    const dto = toWriteDto({ ...input, confirmed: true } as typeof input);

    expect(Object.keys(dto).sort()).toEqual(
      ['code', 'credit_limit', 'email', 'name', 'phone', 'status'].sort(),
    );
  });

  it('query danh sách: từ khoá rỗng bỏ khỏi query, `pageSize` → `page_size`', () => {
    expect(toListQueryDto({ keyword: '  ', status: undefined, page: 2, pageSize: 24 })).toEqual({
      keyword: undefined,
      status: undefined,
      page: 2,
      page_size: 24,
    });
    expect(
      toListQueryDto({ keyword: ' thép ', status: 'active', page: 1, pageSize: 12 }),
    ).toMatchObject({
      keyword: 'thép',
      status: 'active',
    });
  });

  it('giá trị đầu của form sửa lấy đúng phần người dùng nhập được', () => {
    expect(toCustomerInput(toCustomer(DTO))).toEqual({
      code: 'KH007',
      name: 'Cửa hàng Vật tư Minh Tâm',
      email: 'minhtam@example.com',
      phone: '',
      status: 'inactive',
      creditLimit: 15000000.5,
    });
  });
});

describe('schema DTO', () => {
  it.each(['12.345', 'abc', '', '-5.00', '1,000'])(
    'tiền `%s` KHÔNG phải số thập phân hợp lệ',
    (money) => {
      expect(customerDtoSchema.safeParse({ ...DTO, credit_limit: money }).success).toBe(false);
    },
  );

  it.each(['0', '15000000', '15000000.5', '15000000.50'])('tiền `%s` hợp lệ', (money) => {
    expect(customerDtoSchema.safeParse({ ...DTO, credit_limit: money }).success).toBe(true);
  });

  it('thiếu trường hoặc trạng thái lạ là sai hợp đồng', () => {
    expect(customerDtoSchema.safeParse({ ...DTO, email: undefined }).success).toBe(false);
    expect(customerDtoSchema.safeParse({ ...DTO, status: 'archived' }).success).toBe(false);
  });
});

describe('query key', () => {
  const params = { keyword: 'thép', status: 'active' as const, page: 2, pageSize: 12 };

  it('mọi danh sách nằm dưới `lists()`, mọi chi tiết dưới `details()`, hai nhánh tách nhau', () => {
    expect(customerKeys.list(params).slice(0, 2)).toEqual(customerKeys.lists());
    expect(customerKeys.detail(7).slice(0, 2)).toEqual(customerKeys.details());
    expect(customerKeys.lists()).not.toEqual(customerKeys.details());
  });

  it('khác bộ lọc / trang → khác key (đổi lọc là refetch); cùng giá trị → cùng key', () => {
    expect(customerKeys.list(params)).toEqual(customerKeys.list({ ...params }));
    expect(customerKeys.list(params)).not.toEqual(customerKeys.list({ ...params, page: 3 }));
    expect(customerKeys.list(params)).not.toEqual(customerKeys.list({ ...params, keyword: '' }));
  });

  it('`queryOptions` dùng đúng key của `customerKeys` và khai `silentError` (trang tự vẽ lỗi)', () => {
    expect(customerQueries.list(params).queryKey).toEqual(customerKeys.list(params));
    expect(customerQueries.detail(7).queryKey).toEqual(customerKeys.detail(7));
    expect(customerQueries.list(params).meta).toEqual({ silentError: true });
    expect(customerQueries.detail(7).meta).toEqual({ silentError: true });
  });

  it('invalidate `lists()` làm cũ MỌI danh sách nhưng không đụng chi tiết', async () => {
    const client = new QueryClient();
    client.setQueryData(customerKeys.list(params), { items: [], total: 0 });
    client.setQueryData(customerKeys.list({ ...params, page: 1 }), { items: [], total: 0 });
    client.setQueryData(customerKeys.detail(7), toCustomer(DTO));

    await client.invalidateQueries({ queryKey: customerKeys.lists(), refetchType: 'none' });

    expect(client.getQueryState(customerKeys.list(params))?.isInvalidated).toBe(true);
    expect(client.getQueryState(customerKeys.list({ ...params, page: 1 }))?.isInvalidated).toBe(
      true,
    );
    expect(client.getQueryState(customerKeys.detail(7))?.isInvalidated).toBe(false);
  });
});

describe('đọc / ghi URL', () => {
  it('`parseCustomerId` chỉ nhận số nguyên dương viết thẳng', () => {
    expect(parseCustomerId('12')).toBe(12);
    for (const raw of [
      '',
      '0',
      '-3',
      '12abc',
      '1e3',
      '10.5',
      ' 7',
      '007',
      '99999999999999999999',
    ]) {
      expect(parseCustomerId(raw), raw).toBeNull();
    }
  });

  it('`parseCustomerStatus` chỉ nhận trạng thái có thật', () => {
    expect(parseCustomerStatus('active')).toBe('active');
    expect(parseCustomerStatus('inactive')).toBe('inactive');
    expect(parseCustomerStatus('ACTIVE')).toBeUndefined();
    expect(parseCustomerStatus('')).toBeUndefined();
  });

  it('đường sửa là route tĩnh + `?id=`', () => {
    expect(customerEditPath(7)).toBe('/demo/customers/edit?id=7');
  });
});

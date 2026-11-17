import type { CustomerDto } from './customer-dto.schema';

/**
 * Dữ liệu mẫu của "máy chủ demo" (`customers-demo-adapter.ts`) — đúng hình dạng DTO của BE (snake_case, tiền là chuỗi).
 *
 * Lưu ý: 15 dòng để danh sách có trang thứ hai ở cỡ trang mặc định (12); `updated_at` tăng theo `id` nên dòng mới nhất đứng đầu.
 */

type SeedRow = readonly [
  code: string,
  name: string,
  email: string,
  phone: string | null,
  status: CustomerDto['status'],
  creditLimit: string,
];

const ROWS: readonly SeedRow[] = [
  [
    'KH001',
    'Công ty TNHH Thép Việt Nhật',
    'mua-hang@thepvietnhat.vn',
    '0912345601',
    'active',
    '500000000.00',
  ],
  [
    'KH002',
    'Công ty CP Vận tải Sông Hồng',
    'ketoan@songhongtrans.vn',
    '0912345602',
    'active',
    '250000000.00',
  ],
  ['KH003', 'Nhà máy Nhựa Đông Á', 'kinhdoanh@nhuadonga.vn', null, 'inactive', '0.00'],
  [
    'KH004',
    'Công ty TNHH Điện lạnh Hải Phòng',
    'info@dienlanhhp.vn',
    '0912345604',
    'active',
    '120000000.50',
  ],
  [
    'KH005',
    'Tập đoàn Xây dựng Phương Nam',
    'dautu@xdphuongnam.vn',
    '0912345605',
    'active',
    '2000000000.00',
  ],
  [
    'KH006',
    'Công ty CP Thực phẩm Sạch Việt',
    'order@sachviet.vn',
    '0912345606',
    'active',
    '75000000.00',
  ],
  [
    'KH007',
    'Cửa hàng Vật tư Minh Tâm',
    'minhtam.vattu@gmail.com',
    '0912345607',
    'inactive',
    '15000000.00',
  ],
  [
    'KH008',
    'Công ty TNHH In bao bì Tân Phát',
    'sales@baobitanphat.vn',
    null,
    'active',
    '90000000.00',
  ],
  [
    'KH009',
    'Công ty CP Cơ khí Đà Nẵng',
    'cokhi@cokhidanang.vn',
    '0912345609',
    'active',
    '320000000.00',
  ],
  [
    'KH010',
    'Công ty TNHH Dược phẩm Hoàng Long',
    'mua@duochoanglong.vn',
    '0912345610',
    'active',
    '410000000.00',
  ],
  [
    'KH011',
    'Siêu thị Điện máy Thành Công',
    'thanhcong@dienmay.vn',
    '0912345611',
    'active',
    '60000000.00',
  ],
  [
    'KH012',
    'Công ty CP Logistics Bắc Nam',
    'cskh@logisticsbacnam.vn',
    '0912345612',
    'inactive',
    '0.00',
  ],
  [
    'KH013',
    'Công ty TNHH Gỗ Tây Nguyên',
    'xuatkhau@gotaynguyen.vn',
    '0912345613',
    'active',
    '180000000.00',
  ],
  ['KH014', 'Hợp tác xã Nông sản Mê Kông', 'htx@nongsanmekong.vn', null, 'active', '35000000.00'],
  [
    'KH015',
    'Công ty CP Phần mềm Sao Mai',
    'contact@saomaisoft.vn',
    '0912345615',
    'active',
    '45000000.00',
  ],
];

const at = (index: number): string => new Date(Date.UTC(2026, 8, 1 + index, 8, 30)).toISOString();

export const CUSTOMERS_DEMO_SEED: readonly CustomerDto[] = ROWS.map(
  ([code, name, email, phone, status, creditLimit], index) => ({
    id: index + 1,
    code,
    name,
    email,
    phone,
    status,
    credit_limit: creditLimit,
    created_at: at(index),
    updated_at: at(index),
  }),
);

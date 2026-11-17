/**
 * Danh mục đối tác mẫu của phân hệ Tài chính (tên hư cấu): khách hàng, nhà cung cấp, nhân viên, vật tư, dịch vụ.
 * Sổ cái lấy tên để ghép diễn giải bút toán; màn Công nợ lấy làm danh sách đối tác.
 */

export interface FinancePartner {
  code: string;
  name: string;
  /** Tên gọi tắt cho trục biểu đồ, ≤ 18 ký tự. */
  short: string;
  /** Hạn mức công nợ (đồng). */
  limit: number;
  /** Số ngày được nợ theo hợp đồng. */
  termDays: 30 | 45 | 60;
}

/** [mã, tên, tên tắt, hạn mức (triệu đồng), số ngày được nợ]. */
type PartnerRow = readonly [string, string, string, number, FinancePartner['termDays']];

const CUSTOMER_ROWS: readonly PartnerRow[] = [
  ['KH001', 'Công ty CP Xây dựng Trường Sơn', 'Trường Sơn', 6_000, 45],
  ['KH002', 'Công ty TNHH Thương mại Minh Phát', 'Minh Phát', 2_500, 30],
  ['KH003', 'Công ty CP Kỹ thuật Đông Á', 'Kỹ thuật Đông Á', 3_000, 45],
  ['KH004', 'Công ty TNHH Nội thất Gia Khang', 'Gia Khang', 1_200, 30],
  ['KH005', 'Công ty CP Phát triển Đô thị Sông Hồng', 'Đô thị Sông Hồng', 8_000, 60],
  ['KH006', 'Công ty TNHH Vật liệu Xanh Bắc Ninh', 'Vật liệu Xanh', 1_500, 30],
  ['KH007', 'Công ty CP Cơ điện Hòa Bình', 'Cơ điện Hòa Bình', 2_000, 45],
  ['KH008', 'Công ty TNHH Kết cấu Thép Tân Long', 'Thép Tân Long', 3_500, 45],
  ['KH009', 'Công ty CP Đầu tư Hạ tầng Đông Đô', 'Hạ tầng Đông Đô', 5_000, 60],
  ['KH010', 'Công ty TNHH Bao bì An Phú', 'Bao bì An Phú', 800, 30],
  ['KH011', 'Công ty CP Thương mại Hoàng Gia', 'Hoàng Gia', 1_800, 30],
  ['KH012', 'Công ty TNHH Kính An toàn Nam Việt', 'Kính Nam Việt', 1_000, 30],
  ['KH013', 'Công ty CP Xây lắp Điện Miền Bắc', 'Điện Miền Bắc', 4_000, 60],
  ['KH014', 'Công ty TNHH Sản xuất Phúc Lâm', 'Phúc Lâm', 1_200, 45],
  ['KH015', 'Công ty CP Logistics Hải Đăng', 'Hải Đăng', 900, 30],
  ['KH016', 'Công ty TNHH Dịch vụ Kỹ thuật Thành Công', 'Thành Công', 700, 30],
  ['KH017', 'Công ty CP Năng lượng Mặt Trời Việt', 'Mặt Trời Việt', 2_200, 45],
  ['KH018', 'Công ty TNHH Thiết bị Y tế Bình An', 'Y tế Bình An', 600, 30],
];

const SUPPLIER_ROWS: readonly PartnerRow[] = [
  ['NCC001', 'Công ty CP Thép Kim Sơn', 'Thép Kim Sơn', 5_000, 45],
  ['NCC002', 'Công ty TNHH Xi măng Lam Hồng', 'Xi măng Lam Hồng', 2_000, 30],
  ['NCC003', 'Công ty CP Dây cáp điện Hưng Long', 'Cáp điện Hưng Long', 2_500, 45],
  ['NCC004', 'Công ty TNHH Hóa chất Đức Minh', 'Hóa chất Đức Minh', 800, 30],
  ['NCC005', 'Công ty CP Vận tải Sao Việt', 'Vận tải Sao Việt', 600, 30],
  ['NCC006', 'Công ty TNHH Gỗ ván ép Phương Nam', 'Gỗ Phương Nam', 1_000, 45],
  ['NCC007', 'Công ty CP Sơn Mỹ Thuận', 'Sơn Mỹ Thuận', 700, 30],
  ['NCC008', 'Công ty TNHH Phụ kiện Nhôm Tiến Đạt', 'Nhôm Tiến Đạt', 900, 30],
  ['NCC009', 'Công ty CP Bê tông Đúc sẵn Thăng Long', 'Bê tông Thăng Long', 3_000, 60],
  ['NCC010', 'Công ty TNHH Bu lông Ốc vít Hải Nam', 'Bu lông Hải Nam', 400, 30],
  ['NCC011', 'Công ty TNHH Thiết bị điện Quang Minh', 'Điện Quang Minh', 1_500, 45],
  ['NCC012', 'Công ty TNHH In ấn Bao bì Sài Gòn Xanh', 'Bao bì Sài Gòn Xanh', 500, 30],
  ['NCC013', 'Công ty CP Phần mềm Thái Bình Dương', 'Phần mềm TBD', 300, 30],
  ['NCC014', 'Công ty TNHH Khí công nghiệp Bắc Sơn', 'Khí Bắc Sơn', 600, 30],
  ['NCC015', 'Công ty TNHH Đá Granite Bình Định', 'Granite Bình Định', 1_200, 45],
  ['NCC016', 'Công ty TNHH Văn phòng phẩm Ngọc Lan', 'VPP Ngọc Lan', 200, 30],
];

const toPartner = ([code, name, short, limitMillion, termDays]: PartnerRow): FinancePartner => ({
  code,
  name,
  short,
  limit: limitMillion * 1_000_000,
  termDays,
});

export const FINANCE_CUSTOMERS: readonly FinancePartner[] = CUSTOMER_ROWS.map(toPartner);

export const FINANCE_SUPPLIERS: readonly FinancePartner[] = SUPPLIER_ROWS.map(toPartner);

export const FINANCE_EMPLOYEES = [
  'Nguyễn Văn Hùng',
  'Trần Thị Mai',
  'Lê Quang Huy',
  'Phạm Thu Trang',
  'Đỗ Minh Tuấn',
  'Vũ Thị Hạnh',
] as const;

export const FINANCE_MATERIALS = [
  'thép cuộn CB240',
  'thép thanh vằn D16',
  'xi măng PCB40',
  'cát vàng xây dựng',
  'đá dăm 1x2',
  'cáp điện CXV 3x50',
  'sơn chống gỉ',
  'tôn mạ kẽm 0,45 mm',
  'bu lông neo M24',
] as const;

export const FINANCE_SERVICES = [
  'vận chuyển hàng hóa',
  'bảo trì máy phát điện',
  'kiểm định thiết bị nâng',
  'thuê xe cẩu 25 tấn',
  'tư vấn thuế',
] as const;

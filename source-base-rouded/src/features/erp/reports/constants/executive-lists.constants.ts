import type { AppIconName, AppTileTone, BadgeColor } from '@/shared/ui';

import type { ExecPeriod } from './executive-period.constants';

/**
 * Bảng "Top khách hàng" và danh sách "Điểm cần chú ý" của màn "Dashboard điều hành" (tỷ đồng).
 *
 * Dùng:   `EXEC_TOP_CUSTOMERS` → `buildCustomerRows(period)` (utils) tính tỷ trọng theo doanh thu của kỳ
 *         · `EXEC_ATTENTION_ITEMS` → danh sách liên kết sang màn nghiệp vụ, màu huy hiệu theo `EXEC_ATTENTION_LEVEL`.
 * Lưu ý:  `href` phải là route có thật trong `erp-sample.routes.ts`; tên khách hàng là tên giả lập.
 */

export type ExecAttentionLevel = 'high' | 'medium' | 'low';

export interface ExecCustomer {
  id: string;
  name: string;
  /** Mảng hàng chính của khách. */
  segment: string;
  revenue: Record<ExecPeriod, number>;
  /** Doanh thu kỳ so sánh (cùng mốc với `EXEC_PERIOD_META[period].versus`). */
  previous: Record<ExecPeriod, number>;
  receivable: number;
  overdue: number;
  /** Doanh thu 8 tháng gần nhất (T3 → T10) cho sparkline. */
  spark: readonly number[];
}

export interface ExecAttentionItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: AppIconName;
  tone: AppTileTone;
  level: ExecAttentionLevel;
  /** Con số chính trên huy hiệu, vd "30,0 tỷ" · "4 đơn". */
  badge: string;
}

export const EXEC_ATTENTION_LEVEL = {
  high: { color: 'error', label: 'Khẩn' },
  medium: { color: 'warning', label: 'Cần xử lý' },
  low: { color: 'neutral', label: 'Theo dõi' },
} satisfies Record<ExecAttentionLevel, { color: BadgeColor; label: string }>;

export const EXEC_TOP_CUSTOMERS: readonly ExecCustomer[] = [
  {
    id: 'kh-hung-thinh-phat',
    name: 'CTCP Xây dựng Hưng Thịnh Phát',
    segment: 'Kết cấu thép',
    revenue: { month: 10.6, quarter: 52.8, year: 148.6 },
    previous: { month: 9.4, quarter: 48.1, year: 128.4 },
    receivable: 38.6,
    overdue: 6.2,
    spark: [11.2, 12.4, 13.1, 14.8, 15.6, 17.2, 18.4, 17.9],
  },
  {
    id: 'kh-ha-tang-bac-son',
    name: 'Tổng công ty Hạ tầng Bắc Sơn',
    segment: 'Cốt thép công trình',
    revenue: { month: 9.1, quarter: 44.3, year: 131.9 },
    previous: { month: 9.8, quarter: 39.6, year: 142.5 },
    receivable: 52.4,
    overdue: 18.6,
    spark: [16.8, 15.9, 14.2, 15.1, 13.6, 14.8, 15.9, 14.1],
  },
  {
    id: 'kh-ket-cau-dai-viet',
    name: 'CTCP Kết cấu Đại Việt',
    segment: 'Kết cấu thép',
    revenue: { month: 7.4, quarter: 36.2, year: 102.7 },
    previous: { month: 6.2, quarter: 39.8, year: 84.1 },
    receivable: 21.3,
    overdue: 0,
    spark: [8.2, 9.4, 10.6, 11.8, 13.9, 12.1, 11.6, 12.8],
  },
  {
    id: 'kh-cang-an-hai',
    name: 'CTCP Cảng biển An Hải',
    segment: 'Lồng thép cọc',
    revenue: { month: 5.9, quarter: 29.7, year: 84.6 },
    previous: { month: 4.3, quarter: 24.1, year: 55.2 },
    receivable: 18.9,
    overdue: 2.4,
    spark: [4.6, 5.8, 7.2, 8.9, 10.4, 11.2, 12.3, 12.9],
  },
  {
    id: 'kh-nha-xuong-tan-phu',
    name: 'Công ty TNHH Nhà xưởng Tân Phú',
    segment: 'Dịch vụ gia công',
    revenue: { month: 4.8, quarter: 23.5, year: 66.8 },
    previous: { month: 4.9, quarter: 23.1, year: 64.9 },
    receivable: 9.7,
    overdue: 0,
    spark: [7.1, 6.8, 7.4, 7.2, 7.9, 7.6, 8.1, 7.8],
  },
  {
    id: 'kh-sao-mai-xanh',
    name: 'CTCP Địa ốc Sao Mai Xanh',
    segment: 'Cốt thép công trình',
    revenue: { month: 4.1, quarter: 20.6, year: 59.2 },
    previous: { month: 5.6, quarter: 26.4, year: 71.3 },
    receivable: 26.8,
    overdue: 11.4,
    spark: [9.8, 9.1, 8.6, 8.9, 8.2, 7.9, 7.4, 6.9],
  },
];

export const EXEC_ATTENTION_ITEMS: readonly ExecAttentionItem[] = [
  {
    id: 'cong-no-qua-han',
    title: 'Công nợ quá hạn trên 90 ngày',
    description: 'Bắc Sơn 18,6 tỷ · Sao Mai Xanh 11,4 tỷ',
    href: '/tai-chinh/cong-no',
    icon: 'invoice',
    tone: 'red',
    level: 'high',
    badge: '30,0 tỷ',
  },
  {
    id: 'don-mua-tre',
    title: 'Đơn mua trễ hạn giao',
    description: '2.150 tấn phôi thép, chậm 3–9 ngày',
    href: '/mua-hang/don-mua',
    icon: 'purchase',
    tone: 'orange',
    level: 'high',
    badge: '4 đơn',
  },
  {
    id: 'vat-tu-duoi-ton',
    title: 'Vật tư dưới tồn tối thiểu',
    description: 'Thép tấm SS400, que hàn, bu lông M24',
    href: '/kho-van/ton-kho',
    icon: 'lot',
    tone: 'yellow',
    level: 'medium',
    badge: '7 mã',
  },
  {
    id: 'lenh-sx-cham',
    title: 'Lệnh sản xuất chậm tiến độ',
    description: 'Xưởng Kết cấu 2 chậm TB 3,2 ngày',
    href: '/san-xuat/tien-do',
    icon: 'production',
    tone: 'indigo',
    level: 'medium',
    badge: '5 lệnh',
  },
  {
    id: 'cham-cong-chua-chot',
    title: 'Chấm công tháng 10 chưa chốt',
    description: '12 người tăng ca vượt 40 giờ/tháng',
    href: '/nhan-su/cham-cong',
    icon: 'timesheet',
    tone: 'pink',
    level: 'low',
    badge: '38 người',
  },
  {
    id: 'but-toan-cho-duyet',
    title: 'Bút toán chờ duyệt khóa sổ',
    description: 'Kỳ tháng 9/2026 · hạn khóa sổ 25/10',
    href: '/tai-chinh/so-cai',
    icon: 'ledger',
    tone: 'primary',
    level: 'low',
    badge: '14 phiếu',
  },
];

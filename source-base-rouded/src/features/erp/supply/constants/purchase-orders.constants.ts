import type { BadgeColor } from '@/shared/ui';

import type {
  PurchaseOrder,
  PurchaseStatus,
  PurchaseStatusFilter,
  Supplier,
} from '../types/supply.types';

/**
 * Số liệu mẫu của màn "Đơn mua" (`/mua-hang/don-mua`) — công ty kết cấu thép, năm 2026. Tiền là số ĐỒNG.
 * Lưu ý: "hôm nay" cố định ở `PURCHASE_TODAY` (không `Date.now()`) để trễ hạn / KPI ổn định cho bài kiểm.
 * Đơn mở = chờ duyệt + đã duyệt + đang giao; trễ hạn = đơn đã duyệt / đang giao quá hạn giao.
 */

export const PURCHASE_TODAY = '2026-10-19';

export const PURCHASE_SUPPLIERS: Record<string, Supplier> = {
  dp: { name: 'CTCP Thép Đại Phong', short: 'Thép Đại Phong' },
  tc: { name: 'Công ty TNHH Thép Tân Cường', short: 'Thép Tân Cường' },
  hl: { name: 'CTCP Xi măng Hoàng Long', short: 'XM Hoàng Long' },
  kl: { name: 'Công ty TNHH Vật liệu hàn Kim Long', short: 'VL hàn Kim Long' },
  ac: { name: 'CTCP Sơn công nghiệp Á Châu', short: 'Sơn Á Châu' },
  mt: { name: 'Công ty TNHH Bulông Minh Trí', short: 'Bulông Minh Trí' },
  pd: { name: 'CTCP Khí công nghiệp Phương Đông', short: 'Khí CN Phương Đông' },
  td: { name: 'Công ty TNHH VLXD Thành Đạt', short: 'VLXD Thành Đạt' },
};

export const PURCHASE_STATUS_META: Record<PurchaseStatus, { label: string; color: BadgeColor }> = {
  draft: { label: 'Nháp', color: 'neutral' },
  pending: { label: 'Chờ duyệt', color: 'warning' },
  approved: { label: 'Đã duyệt', color: 'info' },
  delivering: { label: 'Đang giao', color: 'indigo' },
  done: { label: 'Hoàn tất', color: 'success' },
  cancelled: { label: 'Huỷ', color: 'error' },
};

/** Thứ tự đoạn của bộ lọc luồng trạng thái: Tất cả → Nháp → … → Hoàn tất / Huỷ. */
export const PURCHASE_STATUS_STEPS: readonly PurchaseStatusFilter[] = [
  'all',
  'draft',
  'pending',
  'approved',
  'delivering',
  'done',
  'cancelled',
];

/** Trạng thái tính là "đơn đang mở". */
export const PURCHASE_OPEN_STATUSES: readonly PurchaseStatus[] = [
  'pending',
  'approved',
  'delivering',
];

/** Trạng thái đã cam kết với nhà cung cấp — tính hạn giao, trễ hạn, giá trị mua theo NCC. */
export const PURCHASE_COMMITTED_STATUSES: readonly PurchaseStatus[] = [
  'approved',
  'delivering',
  'done',
];

type PurchaseTuple = [
  code: string,
  supplierId: string,
  items: string,
  orderDate: string,
  dueDate: string,
  value: number,
  receivedPct: number,
  status: PurchaseStatus,
  owner: string,
  deliveredDate?: string,
];

// prettier-ignore
const PURCHASE_TUPLES: PurchaseTuple[] = [
  ['PO-2608-014', 'dp', 'Thép cây D16–D25 CB400-V · 118 tấn', '2026-08-05', '2026-08-25', 1_793_600_000, 100, 'done', 'Nguyễn Thị Lan', '2026-08-23'],
  ['PO-2608-019', 'hl', 'Xi măng PCB40 bao 50 kg · 4.200 bao', '2026-08-12', '2026-08-20', 369_600_000, 100, 'done', 'Trần Văn Hùng', '2026-08-19'],
  ['PO-2608-027', 'kl', 'Que hàn E7018 Φ3,2 · 640 hộp', '2026-08-20', '2026-09-05', 134_400_000, 100, 'done', 'Lê Minh Tuấn', '2026-09-09'],
  ['PO-2609-003', 'tc', 'Thép hình H300×150 · 42 tấn', '2026-09-02', '2026-09-22', 747_600_000, 100, 'done', 'Nguyễn Thị Lan', '2026-09-20'],
  ['PO-2609-008', 'ac', 'Sơn chống gỉ epoxy 18 L · 96 thùng', '2026-09-04', '2026-09-18', 225_600_000, 100, 'done', 'Phạm Thu Hà', '2026-09-17'],
  ['PO-2609-012', 'td', 'Đá mi bụi · 600 m³', '2026-09-08', '2026-09-25', 189_000_000, 0, 'cancelled', 'Phạm Thu Hà'],
  ['PO-2609-015', 'mt', 'Bulông M20 cấp bền 8.8 · 8.000 bộ', '2026-09-10', '2026-09-30', 144_000_000, 100, 'done', 'Võ Quốc Bảo', '2026-09-28'],
  ['PO-2609-021', 'dp', 'Thép cuộn CB240-T Φ8 · 64 tấn', '2026-09-15', '2026-10-10', 928_000_000, 72, 'delivering', 'Nguyễn Thị Lan'],
  ['PO-2609-026', 'dp', 'Thép cây D10–D14 CB300-V · 86 tấn', '2026-09-22', '2026-10-25', 1_272_800_000, 45, 'delivering', 'Trần Văn Hùng'],
  ['PO-2609-030', 'hl', 'Xi măng PCB40 bao 50 kg · 6.000 bao', '2026-09-25', '2026-10-20', 528_000_000, 60, 'delivering', 'Trần Văn Hùng'],
  ['PO-2610-002', 'tc', 'Thép tấm SS400 dày 10–20 ly · 36 tấn', '2026-10-01', '2026-10-15', 594_000_000, 30, 'delivering', 'Lê Minh Tuấn'],
  ['PO-2610-005', 'pd', 'Khí CO₂ chai 25 kg · 320 chai', '2026-10-02', '2026-10-22', 121_600_000, 50, 'delivering', 'Võ Quốc Bảo'],
  ['PO-2610-007', 'td', 'Cát vàng, đá 1×2 · 1.200 m³', '2026-10-03', '2026-10-31', 522_000_000, 38, 'delivering', 'Phạm Thu Hà'],
  ['PO-2610-009', 'kl', 'Que hàn inox E308L · 120 hộp', '2026-10-05', '2026-10-20', 78_000_000, 0, 'cancelled', 'Lê Minh Tuấn'],
  ['PO-2610-011', 'kl', 'Dây hàn CO₂ ER70S-6 Φ1,2 · 420 cuộn', '2026-10-06', '2026-10-24', 218_400_000, 65, 'delivering', 'Lê Minh Tuấn'],
  ['PO-2610-013', 'dp', 'Thép cây D28–D32 CB500-V · 74 tấn', '2026-10-07', '2026-11-05', 1_176_600_000, 20, 'delivering', 'Nguyễn Thị Lan'],
  ['PO-2610-016', 'mt', 'Bulông neo M24×800 · 1.600 bộ', '2026-10-08', '2026-10-16', 228_800_000, 0, 'approved', 'Võ Quốc Bảo'],
  ['PO-2610-018', 'ac', 'Sơn lót kẽm, sơn phủ PU · 140 thùng', '2026-10-09', '2026-10-28', 389_200_000, 0, 'approved', 'Phạm Thu Hà'],
  ['PO-2610-020', 'tc', 'Thép hình I200, U160 · 28 tấn', '2026-10-10', '2026-10-17', 495_600_000, 0, 'approved', 'Lê Minh Tuấn'],
  ['PO-2610-022', 'hl', 'Vữa khô trộn sẵn M75 · 2.400 bao', '2026-10-12', '2026-10-30', 168_000_000, 0, 'approved', 'Trần Văn Hùng'],
  ['PO-2610-024', 'pd', 'Khí oxy, argon chai 40 L · 260 chai', '2026-10-13', '2026-11-02', 67_600_000, 0, 'approved', 'Võ Quốc Bảo'],
  ['PO-2610-025', 'dp', 'Thép cuộn CB240-T Φ6 · 52 tấn', '2026-10-14', '2026-11-10', 754_000_000, 0, 'approved', 'Nguyễn Thị Lan'],
  ['PO-2610-027', 'kl', 'Que hàn E6013 Φ2,6 · 500 hộp', '2026-10-15', '2026-11-04', 92_500_000, 0, 'pending', 'Lê Minh Tuấn'],
  ['PO-2610-028', 'tc', 'Thép tấm gân 6 ly · 18 tấn', '2026-10-15', '2026-11-12', 302_400_000, 0, 'pending', 'Lê Minh Tuấn'],
  ['PO-2610-030', 'td', 'Gạch block 390×190 · 24.000 viên', '2026-10-16', '2026-11-06', 199_200_000, 0, 'pending', 'Phạm Thu Hà'],
  ['PO-2610-031', 'mt', 'Bulông M16, long đền, ê-cu · 12.000 bộ', '2026-10-16', '2026-11-09', 138_000_000, 0, 'pending', 'Võ Quốc Bảo'],
  ['PO-2610-033', 'dp', 'Thép cây D18–D22 CB400-V · 95 tấn', '2026-10-17', '2026-11-18', 1_444_000_000, 0, 'pending', 'Nguyễn Thị Lan'],
  ['PO-2610-035', 'ac', 'Sơn chống gỉ alkyd 18 L · 80 thùng', '2026-10-18', '2026-11-15', 152_000_000, 0, 'draft', 'Phạm Thu Hà'],
  ['PO-2610-036', 'hl', 'Xi măng PCB50 bao 50 kg · 3.000 bao', '2026-10-18', '2026-11-08', 291_000_000, 0, 'draft', 'Trần Văn Hùng'],
  ['PO-2610-037', 'pd', 'Khí CO₂ lỏng bồn · 8 tấn', '2026-10-19', '2026-11-20', 46_400_000, 0, 'draft', 'Võ Quốc Bảo'],
];

/** 30 đơn mua gần nhất, mới nhất trước. */
export const PURCHASE_ORDERS: readonly PurchaseOrder[] = PURCHASE_TUPLES.map(
  ([
    code,
    supplierId,
    items,
    orderDate,
    dueDate,
    value,
    receivedPct,
    status,
    owner,
    deliveredDate,
  ]) => ({
    id: code,
    code,
    supplierId,
    items,
    orderDate,
    dueDate,
    value,
    receivedPct,
    status,
    owner,
    deliveredDate,
  }),
).reverse();

/** Giá trị đặt mua theo tháng năm 2026 (tỷ đồng); T10 tính tới `PURCHASE_TODAY`. */
export const PURCHASE_MONTHLY: readonly { label: string; value: number }[] = [
  { label: 'T1', value: 5.6 },
  { label: 'T2', value: 4.2 },
  { label: 'T3', value: 6.9 },
  { label: 'T4', value: 7.8 },
  { label: 'T5', value: 8.4 },
  { label: 'T6', value: 7.1 },
  { label: 'T7', value: 9.2 },
  { label: 'T8', value: 10.6 },
  { label: 'T9', value: 9.8 },
  { label: 'T10', value: 6.3 },
];

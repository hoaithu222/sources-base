import { seriesTokenAt } from '@/shared/charts';

import type {
  StockGroupId,
  StockItem,
  StockLot,
  StockWarning,
  WarehouseFilter,
  WarehouseId,
} from '../types/supply.types';

/**
 * Số liệu mẫu của màn "Tồn kho" (`/kho-van/ton-kho`) — vật tư kết cấu thép tại 4 kho, năm 2026. Tiền là số ĐỒNG.
 * Lưu ý: "hôm nay" cố định ở `STOCK_TODAY`; "sắp hết hạn" = còn ≤ `STOCK_EXPIRY_WINDOW_DAYS` ngày. Tồn tối thiểu là
 * của MÃ tại kho — so với TỔNG các lô cùng mã cùng kho, không so từng lô.
 */

export const STOCK_TODAY = '2026-10-19';

export const STOCK_EXPIRY_WINDOW_DAYS = 30;

export const STOCK_WAREHOUSES: Record<WarehouseId, { name: string; short: string }> = {
  bd: { name: 'Kho tổng Bình Dương', short: 'Bình Dương' },
  la: { name: 'Kho xưởng Long An', short: 'Long An' },
  td: { name: 'Kho công trường Thủ Đức', short: 'Thủ Đức' },
  nt: { name: 'Kho công trường Nhơn Trạch', short: 'Nhơn Trạch' },
};

/** Thứ tự lựa chọn của bộ chọn kho (`all` đứng đầu). */
export const STOCK_WAREHOUSE_ORDER: readonly WarehouseFilter[] = ['all', 'bd', 'la', 'td', 'nt'];

/** Nhóm vật tư → tên + token màu series (gán theo NHÓM, lọc kho không tô lại màu). */
export const STOCK_GROUPS: Record<StockGroupId, { name: string; token: string }> = {
  'steel-bar': { name: 'Thép cuộn, thép cây', token: seriesTokenAt(0) },
  'steel-shape': { name: 'Thép hình, thép tấm', token: seriesTokenAt(1) },
  cement: { name: 'Xi măng, vữa', token: seriesTokenAt(2) },
  welding: { name: 'Vật tư hàn, khí', token: seriesTokenAt(3) },
  paint: { name: 'Sơn, hoá chất', token: seriesTokenAt(4) },
  fastener: { name: 'Bulông, phụ kiện', token: seriesTokenAt(5) },
};

export const STOCK_WARNING_META: Record<
  StockWarning,
  { label: string; color: 'error' | 'warning' }
> = {
  expired: { label: 'Quá hạn', color: 'error' },
  'below-min': { label: 'Dưới tối thiểu', color: 'error' },
  expiring: { label: 'Sắp hết hạn', color: 'warning' },
};

// prettier-ignore
export const STOCK_ITEMS: Record<string, StockItem> = {
  'TC-CB240-06': { name: 'Thép cuộn CB240-T Φ6', unit: 'tấn', group: 'steel-bar', unitPrice: 14_450_000, decimals: 2 },
  'TC-CB240-08': { name: 'Thép cuộn CB240-T Φ8', unit: 'tấn', group: 'steel-bar', unitPrice: 14_500_000, decimals: 2 },
  'TV-CB300-10': { name: 'Thép cây D10 CB300-V', unit: 'tấn', group: 'steel-bar', unitPrice: 14_800_000, decimals: 2 },
  'TV-CB400-16': { name: 'Thép cây D16 CB400-V', unit: 'tấn', group: 'steel-bar', unitPrice: 15_200_000, decimals: 2 },
  'TV-CB400-20': { name: 'Thép cây D20 CB400-V', unit: 'tấn', group: 'steel-bar', unitPrice: 15_150_000, decimals: 2 },
  'TV-CB400-25': { name: 'Thép cây D25 CB400-V', unit: 'tấn', group: 'steel-bar', unitPrice: 15_250_000, decimals: 2 },
  'TV-CB500-32': { name: 'Thép cây D32 CB500-V', unit: 'tấn', group: 'steel-bar', unitPrice: 15_900_000, decimals: 2 },
  'TH-H300': { name: 'Thép hình H300×150×6,5×9', unit: 'tấn', group: 'steel-shape', unitPrice: 17_800_000, decimals: 2 },
  'TH-I200': { name: 'Thép hình I200×100×5,5', unit: 'tấn', group: 'steel-shape', unitPrice: 17_700_000, decimals: 2 },
  'TT-SS400-10': { name: 'Thép tấm SS400 dày 10 ly', unit: 'tấn', group: 'steel-shape', unitPrice: 16_500_000, decimals: 2 },
  'XM-PCB40': { name: 'Xi măng PCB40 bao 50 kg', unit: 'bao', group: 'cement', unitPrice: 88_000, decimals: 0 },
  'XM-PCB50': { name: 'Xi măng PCB50 bao 50 kg', unit: 'bao', group: 'cement', unitPrice: 97_000, decimals: 0 },
  'VU-M75': { name: 'Vữa khô trộn sẵn M75', unit: 'bao', group: 'cement', unitPrice: 70_000, decimals: 0 },
  'QH-E7018-32': { name: 'Que hàn E7018 Φ3,2 (hộp 5 kg)', unit: 'hộp', group: 'welding', unitPrice: 210_000, decimals: 0 },
  'DH-ER70S-12': { name: 'Dây hàn CO₂ ER70S-6 Φ1,2', unit: 'cuộn', group: 'welding', unitPrice: 520_000, decimals: 0 },
  'KH-CO2-25': { name: 'Khí CO₂ chai 25 kg', unit: 'chai', group: 'welding', unitPrice: 380_000, decimals: 0 },
  'SO-EP-18': { name: 'Sơn chống gỉ epoxy 2 TP 18 L', unit: 'thùng', group: 'paint', unitPrice: 2_350_000, decimals: 0 },
  'SO-AK-18': { name: 'Sơn chống gỉ alkyd 18 L', unit: 'thùng', group: 'paint', unitPrice: 1_900_000, decimals: 0 },
  'HC-TG-20': { name: 'Dung dịch tẩy gỉ phốt-phát 20 L', unit: 'can', group: 'paint', unitPrice: 640_000, decimals: 0 },
  'BL-M20-88': { name: 'Bulông M20×80 cấp bền 8.8', unit: 'bộ', group: 'fastener', unitPrice: 18_000, decimals: 0 },
  'BL-NEO-M24': { name: 'Bulông neo M24×800', unit: 'bộ', group: 'fastener', unitPrice: 143_000, decimals: 0 },
  'PK-ECU-M16': { name: 'Ê-cu, long đền M16', unit: 'bộ', group: 'fastener', unitPrice: 4_500, decimals: 0 },
};

type StockTuple = [
  warehouse: WarehouseId,
  code: string,
  lot: string,
  importDate: string,
  expiry: string | null,
  qty: number,
  min: number,
];

// prettier-ignore
const STOCK_TUPLES: StockTuple[] = [
  ['bd', 'TC-CB240-08', 'L2609-021', '2026-09-28', null, 48.6, 30],
  ['bd', 'TC-CB240-06', 'L2610-004', '2026-10-05', null, 22.4, 25],
  ['bd', 'TV-CB400-16', 'L2609-018', '2026-09-20', null, 64.2, 40],
  ['bd', 'TV-CB400-20', 'L2609-024', '2026-09-30', null, 38.5, 30],
  ['bd', 'TV-CB400-25', 'L2608-031', '2026-08-26', null, 26.8, 30],
  ['bd', 'TV-CB500-32', 'L2610-009', '2026-10-10', null, 41, 20],
  ['bd', 'TH-H300', 'L2609-006', '2026-09-08', null, 18.4, 10],
  ['bd', 'TT-SS400-10', 'L2610-002', '2026-10-03', null, 12.6, 15],
  ['bd', 'XM-PCB40', 'L2609-027', '2026-09-15', '2026-11-14', 1_850, 1_000],
  ['bd', 'XM-PCB40', 'L2610-011', '2026-10-12', '2027-01-10', 3_200, 1_000],
  ['bd', 'QH-E7018-32', 'L2607-015', '2026-07-20', '2028-07-20', 186, 200],
  ['bd', 'SO-EP-18', 'L2605-008', '2026-05-12', '2026-11-12', 34, 20],
  ['bd', 'BL-M20-88', 'L2609-012', '2026-09-12', null, 6_400, 3_000],
  ['bd', 'BL-NEO-M24', 'L2608-020', '2026-08-18', null, 96, 200],
  ['la', 'TC-CB240-08', 'L2610-006', '2026-10-07', null, 31.2, 20],
  ['la', 'TV-CB300-10', 'L2609-016', '2026-09-18', null, 27.5, 15],
  ['la', 'TH-I200', 'L2609-029', '2026-09-29', null, 9.6, 12],
  ['la', 'TT-SS400-10', 'L2609-010', '2026-09-10', null, 21.3, 10],
  ['la', 'QH-E7018-32', 'L2609-003', '2026-09-04', '2028-09-04', 412, 150],
  ['la', 'DH-ER70S-12', 'L2610-007', '2026-10-08', null, 138, 120],
  ['la', 'KH-CO2-25', 'L2610-013', '2026-10-14', null, 46, 60],
  ['la', 'SO-AK-18', 'L2604-019', '2026-04-22', '2026-10-22', 18, 10],
  ['la', 'HC-TG-20', 'L2603-011', '2026-03-15', '2026-10-15', 7, 5],
  ['la', 'BL-M20-88', 'L2608-025', '2026-08-28', null, 2_150, 2_500],
  ['td', 'TV-CB400-16', 'L2610-012', '2026-10-13', null, 18.7, 10],
  ['td', 'TV-CB400-25', 'L2610-014', '2026-10-15', null, 14.2, 8],
  ['td', 'XM-PCB40', 'L2609-030', '2026-09-26', '2026-11-25', 920, 600],
  ['td', 'VU-M75', 'L2608-022', '2026-08-20', '2026-11-08', 640, 300],
  ['td', 'BL-NEO-M24', 'L2610-010', '2026-10-11', null, 320, 150],
  ['td', 'PK-ECU-M16', 'L2609-019', '2026-09-21', null, 4_800, 5_000],
  ['nt', 'TV-CB400-20', 'L2610-015', '2026-10-16', null, 22, 12],
  ['nt', 'TV-CB300-10', 'L2609-025', '2026-09-27', null, 6.4, 8],
  ['nt', 'XM-PCB50', 'L2609-022', '2026-09-22', '2026-12-21', 1_400, 800],
  ['nt', 'XM-PCB40', 'L2608-028', '2026-08-24', '2026-10-23', 260, 500],
  ['nt', 'SO-EP-18', 'L2609-014', '2026-09-16', '2027-03-16', 22, 12],
  ['nt', 'KH-CO2-25', 'L2610-016', '2026-10-17', null, 30, 20],
];

/** 36 lô tồn của 4 kho, theo kho rồi theo nhóm vật tư. */
export const STOCK_LOTS: readonly StockLot[] = STOCK_TUPLES.map(
  ([warehouse, code, lot, importDate, expiry, qty, min]) => ({
    id: `${warehouse}-${lot}`,
    warehouse,
    code,
    lot,
    importDate,
    expiry,
    qty,
    min,
  }),
);

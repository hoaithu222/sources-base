import type { WorkshopKey } from './production.constants';

/**
 * Lệnh sản xuất mẫu của màn "Tiến độ sản xuất" — 13 lệnh của ba xưởng, ba dự án (cầu, khu đô thị, trạm biến áp). Hằng
 * tĩnh; trạng thái (đúng tiến độ / chậm / hoàn thành) tính theo `OPS_TODAY` ở `production.utils.ts`.
 */

export interface ProductionOrder {
  id: string;
  code: string;
  product: string;
  project: string;
  workshop: WorkshopKey;
  /** Ngày ISO bắt đầu / kết thúc theo kế hoạch (tính cả hai đầu). */
  planStart: string;
  planEnd: string;
  actualStart: string;
  /** Ngày ISO hoàn thành thật — chỉ lệnh đã xong. */
  finishedOn?: string;
  planTons: number;
  actualTons: number;
}

const BRIDGE = 'Cầu Rạch Miễu 2 · gói XL-03';
const TOWER = 'KĐT Đông Đô · Tháp B';
const SUBSTATION = 'TBA 110kV Long Hậu';

export const PRODUCTION_ORDERS: readonly ProductionOrder[] = [
  {
    id: 'o01',
    code: 'LSX-2610-001',
    product: 'Lồng thép cọc khoan nhồi D1200, L=24 m (32 lồng)',
    project: BRIDGE,
    workshop: 'cage',
    planStart: '2026-10-05',
    planEnd: '2026-10-20',
    actualStart: '2026-10-05',
    planTons: 86.4,
    actualTons: 74.8,
  },
  {
    id: 'o02',
    code: 'LSX-2610-002',
    product: 'Thép chủ D32 cắt uốn dầm Super-T',
    project: BRIDGE,
    workshop: 'cut',
    planStart: '2026-10-08',
    planEnd: '2026-10-17',
    actualStart: '2026-10-08',
    finishedOn: '2026-10-16',
    planTons: 54,
    actualTons: 54,
  },
  {
    id: 'o03',
    code: 'LSX-2610-003',
    product: 'Lồng thép cọc khoan nhồi D1500, L=30 m (18 lồng)',
    project: TOWER,
    workshop: 'cage',
    planStart: '2026-10-12',
    planEnd: '2026-10-30',
    actualStart: '2026-10-13',
    planTons: 120.6,
    actualTons: 28.4,
  },
  {
    id: 'o04',
    code: 'LSX-2610-004',
    product: 'Thép đai xoắn D10–D12 cho lồng cọc',
    project: TOWER,
    workshop: 'cut',
    planStart: '2026-10-12',
    planEnd: '2026-10-22',
    actualStart: '2026-10-12',
    planTons: 18.5,
    actualTons: 12.2,
  },
  {
    id: 'o05',
    code: 'LSX-2610-005',
    product: 'Khung cốt thép dầm chuyển tầng 3 (DC-01…DC-08)',
    project: TOWER,
    workshop: 'cage',
    planStart: '2026-10-14',
    planEnd: '2026-10-28',
    actualStart: '2026-10-15',
    planTons: 42.8,
    actualTons: 10.2,
  },
  {
    id: 'o06',
    code: 'LSX-2610-006',
    product: 'Bản mã, bu lông neo M30 mạ kẽm',
    project: SUBSTATION,
    workshop: 'finish',
    planStart: '2026-10-09',
    planEnd: '2026-10-19',
    actualStart: '2026-10-09',
    finishedOn: '2026-10-18',
    planTons: 6.2,
    actualTons: 6.2,
  },
  {
    id: 'o07',
    code: 'LSX-2610-007',
    product: 'Lưới thép hàn sàn D8a150',
    project: TOWER,
    workshop: 'finish',
    planStart: '2026-10-13',
    planEnd: '2026-10-24',
    actualStart: '2026-10-13',
    planTons: 9.8,
    actualTons: 5.1,
  },
  {
    id: 'o08',
    code: 'LSX-2610-008',
    product: 'Thép chủ D25–D28 cột C1–C12',
    project: TOWER,
    workshop: 'cut',
    planStart: '2026-10-15',
    planEnd: '2026-10-26',
    actualStart: '2026-10-16',
    planTons: 36,
    actualTons: 9.6,
  },
  {
    id: 'o09',
    code: 'LSX-2610-009',
    product: 'Sơn chống gỉ, đóng kiện lồng thép D1200',
    project: BRIDGE,
    workshop: 'finish',
    planStart: '2026-10-16',
    planEnd: '2026-10-27',
    actualStart: '2026-10-16',
    planTons: 48,
    actualTons: 13.4,
  },
  {
    id: 'o10',
    code: 'LSX-2610-010',
    product: 'Thép chờ vách lõi thang V1–V4',
    project: TOWER,
    workshop: 'cut',
    planStart: '2026-10-19',
    planEnd: '2026-10-29',
    actualStart: '2026-10-19',
    planTons: 22.4,
    actualTons: 0.6,
  },
  {
    id: 'o11',
    code: 'LSX-2610-011',
    product: 'Lồng thép cọc barrette 2800×1000 (6 lồng)',
    project: TOWER,
    workshop: 'cage',
    planStart: '2026-10-17',
    planEnd: '2026-11-05',
    actualStart: '2026-10-17',
    planTons: 64,
    actualTons: 6.9,
  },
  {
    id: 'o12',
    code: 'LSX-2610-012',
    product: 'Mạ kẽm nhúng nóng lan can cầu',
    project: BRIDGE,
    workshop: 'finish',
    planStart: '2026-10-06',
    planEnd: '2026-10-16',
    actualStart: '2026-10-07',
    planTons: 12.6,
    actualTons: 11.3,
  },
  {
    id: 'o13',
    code: 'LSX-2609-031',
    product: 'Lồng thép cọc khoan nhồi D1000 móng trạm',
    project: SUBSTATION,
    workshop: 'cage',
    planStart: '2026-09-28',
    planEnd: '2026-10-14',
    actualStart: '2026-09-28',
    finishedOn: '2026-10-13',
    planTons: 38.4,
    actualTons: 38.4,
  },
];

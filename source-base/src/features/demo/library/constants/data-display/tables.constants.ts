/**
 * Dữ liệu giả cho mục "Bảng" và "Bảng nâng cao".
 * Lưu ý: mảng CỐ Ý không `readonly` — cùng lý do ở `constants/samples.constants.ts`.
 */

export interface DemoTaskRow {
  id: string;
  code: string;
  name: string;
  owner: string;
  progress: number;
  status: 'done' | 'doing' | 'late' | 'draft';
  budget: number;
}

export const DEMO_TASK_ROWS: DemoTaskRow[] = [
  {
    id: '1',
    code: 'HM-001',
    name: 'Móng cọc khoan nhồi',
    owner: 'Nguyễn Văn An',
    progress: 100,
    status: 'done',
    budget: 12_400_000_000,
  },
  {
    id: '2',
    code: 'HM-002',
    name: 'Kết cấu thân tầng 1-5',
    owner: 'Trần Thị Bình',
    progress: 68,
    status: 'doing',
    budget: 28_900_000_000,
  },
  {
    id: '3',
    code: 'HM-003',
    name: 'Hệ thống cơ điện tầng hầm',
    owner: 'Lê Minh Cường',
    progress: 41,
    status: 'late',
    budget: 9_150_000_000,
  },
  {
    id: '4',
    code: 'HM-004',
    name: 'Hoàn thiện mặt dựng',
    owner: 'Phạm Thu Dung',
    progress: 0,
    status: 'draft',
    budget: 17_600_000_000,
  },
  {
    id: '5',
    code: 'HM-005',
    name: 'Cảnh quan sân vườn',
    owner: 'Vũ Quốc Đạt',
    progress: 12,
    status: 'doing',
    budget: 3_200_000_000,
  },
];

/** Nhãn + màu badge cho từng trạng thái — tra bảng thay vì if/else rải rác. */
export const DEMO_STATUS_META = {
  done: { label: 'Hoàn thành', color: 'success' },
  doing: { label: 'Đang làm', color: 'info' },
  late: { label: 'Chậm tiến độ', color: 'error' },
  draft: { label: 'Nháp', color: 'neutral' },
} as const;

/** Ngân sách theo nhà thầu × 2 tháng — cho demo cột ghim + header 2 tầng + tổng dính đáy. */
export interface DemoBudgetRow {
  id: string;
  contractor: string;
  planned07: number;
  actual07: number;
  planned08: number;
  actual08: number;
}

export const DEMO_BUDGET_ROWS: DemoBudgetRow[] = [
  {
    id: 'bg1',
    contractor: 'Sông Đà 9',
    planned07: 420,
    actual07: 398,
    planned08: 460,
    actual08: 431,
  },
  {
    id: 'bg2',
    contractor: 'Coteccons',
    planned07: 360,
    actual07: 372,
    planned08: 380,
    actual08: 355,
  },
  {
    id: 'bg3',
    contractor: 'REE M&E',
    planned07: 210,
    actual07: 189,
    planned08: 240,
    actual08: 252,
  },
  {
    id: 'bg4',
    contractor: 'Searefico',
    planned07: 150,
    actual07: 161,
    planned08: 165,
    actual08: 158,
  },
];

/** Danh sách hạng mục — cho demo kéo-thả sắp xếp dòng + headerSize + fullRowCell. */
export interface DemoRankRow {
  id: string;
  label: string;
}

export const DEMO_RANK_ROWS: DemoRankRow[] = [
  { id: 'rk1', label: 'Nền móng' },
  { id: 'rk2', label: 'Kết cấu thân' },
  { id: 'rk3', label: 'Hoàn thiện' },
  { id: 'rk4', label: 'Nghiệm thu' },
];

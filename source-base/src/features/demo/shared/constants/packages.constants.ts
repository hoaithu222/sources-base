/**
 * Danh sách gói thầu mẫu — MỘT dự án dùng chung cho `/demo/ghep` (bảng) và `/demo/tong-quan` (KPI, xếp hạng).
 * Lưu ý: giữ MỘT nghiệp vụ thật (gói thầu xây lắp), đừng đổi thành `foo/bar` — nhãn quá ngắn giấu lỗi
 * tràn, số quá tròn giấu lỗi canh cột số.
 */

export type PackageStatus = 'draft' | 'running' | 'review' | 'done' | 'late';

export interface DemoPackageRow {
  id: string;
  code: string;
  name: string;
  contractor: string;
  status: PackageStatus;
  /** Tiến độ %, 0–100. */
  progress: number;
  /** Giá trị hợp đồng, đơn vị đồng. */
  value: number;
  dueDate: string;
}

/** Nhãn + màu badge theo trạng thái — MỘT nguồn cho cả bảng lẫn bộ lọc. */
export const PACKAGE_STATUS_META: Record<
  PackageStatus,
  { label: string; color: 'neutral' | 'info' | 'warning' | 'success' | 'error' }
> = {
  draft: { label: 'Nháp', color: 'neutral' },
  running: { label: 'Đang thi công', color: 'info' },
  review: { label: 'Chờ nghiệm thu', color: 'warning' },
  done: { label: 'Đã nghiệm thu', color: 'success' },
  late: { label: 'Chậm tiến độ', color: 'error' },
};

export const DEMO_PACKAGE_ROWS: readonly DemoPackageRow[] = [
  {
    id: 'p1',
    code: 'XL-01',
    name: 'Móng và tầng hầm khối A',
    contractor: 'Công ty CP Xây dựng Trường Sơn',
    status: 'done',
    progress: 100,
    value: 18_420_000_000,
    dueDate: '12/03/2026',
  },
  {
    id: 'p2',
    code: 'XL-02',
    name: 'Kết cấu thân khối A (tầng 1–12)',
    contractor: 'Công ty CP Xây dựng Trường Sơn',
    status: 'running',
    progress: 64,
    value: 42_950_000_000,
    dueDate: '30/09/2026',
  },
  {
    id: 'p3',
    code: 'XL-03',
    name: 'Hệ thống cơ điện khối A',
    contractor: 'Công ty TNHH Cơ điện Hoà Bình',
    status: 'running',
    progress: 38,
    value: 27_100_000_000,
    dueDate: '15/11/2026',
  },
  {
    id: 'p4',
    code: 'XL-04',
    name: 'Hoàn thiện mặt đứng và vách kính',
    contractor: 'Công ty CP Nhôm kính Nam Việt',
    status: 'review',
    progress: 92,
    value: 15_780_000_000,
    dueDate: '08/08/2026',
  },
  {
    id: 'p5',
    code: 'XL-05',
    name: 'Hạ tầng kỹ thuật ngoài nhà',
    contractor: 'Công ty CP Hạ tầng Đông Đô',
    status: 'late',
    progress: 21,
    value: 9_340_000_000,
    dueDate: '20/06/2026',
  },
  {
    id: 'p6',
    code: 'XL-06',
    name: 'Cảnh quan, cây xanh và sân đường',
    contractor: 'Công ty TNHH Cảnh quan Xanh',
    status: 'draft',
    progress: 0,
    value: 6_120_000_000,
    dueDate: '28/02/2027',
  },
];

/** Tên dự án trên "bảng tên" của header (`<PageHeader title>`) — chung cho `/demo/ghep` và `/demo/tong-quan`. */
export const DEMO_PROJECT_NAME = 'Khu đô thị Đông Đô';

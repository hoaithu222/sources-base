import type { DropdownOption } from '@/shared/ui';

/**
 * Danh mục màn "Chấm công": ký hiệu công, phòng ban, 20 nhân viên mẫu (kèm hồ sơ xác suất để sinh bảng công ỔN ĐỊNH theo
 * tháng — `buildTimesheet`), tháng được chọn và ngày lễ. Tháng của `OPS_TODAY` chỉ có số liệu tới hôm nay.
 */

export type TimesheetCode = 'X' | 'P' | 'KP' | 'T' | 'L' | 'H' | 'CN';

export interface TimesheetCodeMeta {
  code: TimesheetCode;
  /** Chữ hiện trong ô (`H` hiện "½"). */
  glyph: string;
  label: string;
}

/** Thứ tự = thứ tự chú giải. */
export const TIMESHEET_CODES: readonly TimesheetCodeMeta[] = [
  { code: 'X', glyph: 'X', label: 'Đi làm' },
  { code: 'T', glyph: 'T', label: 'Tăng ca' },
  { code: 'H', glyph: '½', label: 'Nửa công' },
  { code: 'P', glyph: 'P', label: 'Nghỉ phép' },
  { code: 'KP', glyph: 'KP', label: 'Không phép' },
  { code: 'L', glyph: 'L', label: 'Nghỉ lễ' },
  { code: 'CN', glyph: '', label: 'Chủ nhật' },
];

export type DepartmentKey = 'cut' | 'cage' | 'finish' | 'tech' | 'office';

export const DEPARTMENTS: readonly { key: DepartmentKey; label: string; workshop: boolean }[] = [
  { key: 'cut', label: 'Xưởng cắt uốn', workshop: true },
  { key: 'cage', label: 'Xưởng lồng thép', workshop: true },
  { key: 'finish', label: 'Xưởng hoàn thiện', workshop: true },
  { key: 'tech', label: 'Phòng Kỹ thuật – QC', workshop: false },
  { key: 'office', label: 'Phòng Hành chính – Nhân sự', workshop: false },
];

export const DEPARTMENT_OPTIONS: DropdownOption[] = [
  { value: 'all', label: 'Tất cả phòng ban' },
  ...DEPARTMENTS.map((d) => ({ value: d.key, label: d.label })),
];

export interface Employee {
  id: string;
  code: string;
  name: string;
  title: string;
  department: DepartmentKey;
  /** Xác suất mỗi ngày làm việc (0..1): tăng ca · đi muộn · nghỉ phép · nghỉ không phép · làm Chủ nhật. */
  ot: number;
  late: number;
  leave: number;
  absent: number;
  sunday: number;
}

type EmployeeRates = Pick<Employee, 'ot' | 'late' | 'leave' | 'absent' | 'sunday'>;

const WORKER: EmployeeRates = { ot: 0.24, late: 0.05, leave: 0.03, absent: 0.012, sunday: 0 };
const STAFF: EmployeeRates = { ot: 0.04, late: 0.03, leave: 0.035, absent: 0, sunday: 0 };
const CAGE: Partial<EmployeeRates> = { sunday: 0.5 };

type EmployeeRow = [string, string, string, DepartmentKey, Partial<EmployeeRates>?];

const EMPLOYEE_ROWS: readonly EmployeeRow[] = [
  ['VCI-0108', 'Nguyễn Văn Hùng', 'Tổ trưởng cắt uốn', 'cut', { late: 0.01 }],
  ['VCI-0131', 'Trần Minh Tuấn', 'Vận hành máy cắt', 'cut'],
  ['VCI-0142', 'Lê Văn Phúc', 'Thợ uốn thép', 'cut', { late: 0.12 }],
  ['VCI-0157', 'Phạm Quốc Bảo', 'Thợ uốn thép', 'cut'],
  ['VCI-0163', 'Đỗ Thị Hạnh', 'Thủ kho bán thành phẩm', 'cut', STAFF],
  ['VCI-0112', 'Hoàng Văn Thắng', 'Tổ trưởng lồng thép', 'cage', { ...CAGE, late: 0.01 }],
  ['VCI-0126', 'Vũ Đức Long', 'Thợ hàn bậc 5/7', 'cage', CAGE],
  ['VCI-0138', 'Bùi Văn Nam', 'Thợ hàn', 'cage', { ...CAGE, late: 0.16 }],
  ['VCI-0149', 'Đặng Công Minh', 'Thợ lắp lồng', 'cage', CAGE],
  ['VCI-0151', 'Ngô Văn Khải', 'Thợ lắp lồng', 'cage', { absent: 0.05 }],
  ['VCI-0170', 'Lý Thanh Sơn', 'Lái cầu trục', 'cage', CAGE],
  ['VCI-0119', 'Phan Thị Thu', 'Tổ trưởng hoàn thiện', 'finish', { late: 0.01 }],
  ['VCI-0145', 'Trịnh Văn Dũng', 'Thợ sơn', 'finish'],
  ['VCI-0166', 'Mai Xuân Trường', 'Thợ đóng kiện', 'finish', { absent: 0.03 }],
  ['VCI-0174', 'Cao Văn Tài', 'Thợ sơn', 'finish', { late: 0.09 }],
  ['VCI-0087', 'Nguyễn Thị Lan Anh', 'Kỹ sư QA/QC', 'tech'],
  ['VCI-0093', 'Đinh Quang Huy', 'Kỹ sư kế hoạch SX', 'tech', { ot: 0.12 }],
  ['VCI-0101', 'Tô Minh Châu', 'Kỹ thuật viên đo kiểm', 'tech', { late: 0.08 }],
  ['VCI-0064', 'Lương Thị Mai', 'Chuyên viên C&B', 'office'],
  ['VCI-0072', 'Võ Ngọc Hân', 'Kế toán xưởng', 'office'],
];

const WORKSHOP_DEPARTMENTS = new Set(DEPARTMENTS.filter((d) => d.workshop).map((d) => d.key));

/** 20 nhân viên mẫu; xác suất mặc định theo khối (xưởng / văn phòng) rồi ghi đè từng người. */
export const EMPLOYEES: readonly Employee[] = EMPLOYEE_ROWS.map(
  ([code, name, title, department, rates], i) => ({
    id: `e${String(i + 1).padStart(2, '0')}`,
    code,
    name,
    title,
    department,
    ...(WORKSHOP_DEPARTMENTS.has(department) ? WORKER : STAFF),
    ...rates,
  }),
);

export const TIMESHEET_MONTH_OPTIONS: DropdownOption[] = [
  { value: '2026-10', label: 'Tháng 10/2026' },
  { value: '2026-09', label: 'Tháng 9/2026' },
  { value: '2026-08', label: 'Tháng 8/2026' },
];

/** Ngày lễ có trong các tháng mẫu (ISO) — Quốc khánh 2026 nghỉ 01–02/09. */
export const TIMESHEET_HOLIDAYS: readonly string[] = ['2026-09-01', '2026-09-02'];

/** Giờ tăng ca một ngày Chủ nhật đi làm. */
export const SUNDAY_OT_HOURS = 8;

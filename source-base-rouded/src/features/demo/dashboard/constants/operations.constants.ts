import { CHART_STATUS } from '@/shared/charts';

/**
 * Số liệu vận hành của màn "Tổng quan dự án": thiết bị thi công và cảnh báo / nhật ký công trường.
 * Lưu ý: nội dung bám dự án thật của `/demo/ghep` (mã gói XL-01…XL-06) — nhãn quá ngắn giấu lỗi tràn,
 * dòng cảnh báo cố ý dài ngắn khác nhau để soi `truncate` trong bảng tự cuộn.
 */

export type DashboardEquipmentState = 'running' | 'idle' | 'maintenance';

export interface DashboardEquipmentRow extends Record<DashboardEquipmentState, number> {
  id: string;
  name: string;
}

/** Màu từng trạng thái máy, theo `CHART_STATUS`: chạy = lục · nghỉ = cam · bảo trì = đỏ. */
export const DASHBOARD_EQUIPMENT_TOKENS: Record<DashboardEquipmentState, string> = {
  running: CHART_STATUS.done,
  idle: CHART_STATUS.slow,
  maintenance: CHART_STATUS.late,
};

export const DASHBOARD_EQUIPMENT: readonly DashboardEquipmentRow[] = [
  { id: 'excavator', name: 'Máy đào', running: 9, idle: 3, maintenance: 2 },
  { id: 'tower-crane', name: 'Cẩu tháp', running: 3, idle: 1, maintenance: 0 },
  { id: 'mixer', name: 'Máy trộn bê tông', running: 5, idle: 2, maintenance: 1 },
  { id: 'truck', name: 'Xe tải', running: 15, idle: 5, maintenance: 2 },
];

export type DashboardAlertSeverity = 'critical' | 'warning' | 'info';

/** Nhãn + màu badge theo mức nghiêm trọng — MỘT nguồn cho cột "Mức" và số đếm ở tiêu đề panel. */
export const DASHBOARD_ALERT_META: Record<
  DashboardAlertSeverity,
  { label: string; color: 'error' | 'warning' | 'info' }
> = {
  critical: { label: 'Khẩn', color: 'error' },
  warning: { label: 'Cảnh báo', color: 'warning' },
  info: { label: 'Nhật ký', color: 'info' },
};

export interface DashboardAlert {
  id: string;
  /** Giờ ghi nhận trong ngày, `HH:mm`. */
  time: string;
  severity: DashboardAlertSeverity;
  message: string;
  /** Mã gói thầu liên quan (`XL-0n`); bỏ trống cho tin toàn công trường. */
  packageCode?: string;
}

export const DASHBOARD_ALERTS: readonly DashboardAlert[] = [
  {
    id: 'a01',
    time: '14:35',
    severity: 'critical',
    message: 'Hố móng hạ tầng ngập nước, tạm dừng đào',
    packageCode: 'XL-05',
  },
  {
    id: 'a02',
    time: '14:10',
    severity: 'warning',
    message: 'Cẩu tháp CT-02 vận hành ở 92% tải định mức',
    packageCode: 'XL-02',
  },
  {
    id: 'a03',
    time: '13:48',
    severity: 'info',
    message: 'Nghiệm thu nội bộ vách kính tầng 8 đạt yêu cầu',
    packageCode: 'XL-04',
  },
  {
    id: 'a04',
    time: '13:20',
    severity: 'warning',
    message: 'Thiếu 12 tấn ống thép DN100, dự kiến về ngày 16/10',
    packageCode: 'XL-03',
  },
  {
    id: 'a05',
    time: '12:55',
    severity: 'critical',
    message: 'Gói hạ tầng chậm 18 ngày so với kế hoạch',
    packageCode: 'XL-05',
  },
  {
    id: 'a06',
    time: '11:40',
    severity: 'info',
    message: 'Đổ xong bê tông sàn tầng 9 (186 m³)',
    packageCode: 'XL-02',
  },
  {
    id: 'a07',
    time: '11:05',
    severity: 'warning',
    message: 'Mẫu bê tông B30 tầng 8 chờ kết quả nén 7 ngày',
    packageCode: 'XL-02',
  },
  {
    id: 'a08',
    time: '10:30',
    severity: 'info',
    message: 'Hồ sơ hoàn công phần móng đã được chủ đầu tư duyệt',
    packageCode: 'XL-01',
  },
  {
    id: 'a09',
    time: '09:50',
    severity: 'warning',
    message: 'Biện pháp thi công ống gió tầng 5 chờ phê duyệt',
    packageCode: 'XL-03',
  },
  {
    id: 'a10',
    time: '09:15',
    severity: 'critical',
    message: 'Phát hiện nứt chân giàn giáo tại cột trục C4',
    packageCode: 'XL-02',
  },
  {
    id: 'a11',
    time: '08:40',
    severity: 'info',
    message: 'Nhà thầu cảnh quan nộp bổ sung hồ sơ năng lực',
    packageCode: 'XL-06',
  },
  {
    id: 'a12',
    time: '08:10',
    severity: 'warning',
    message: 'Hai xe tải hạ tầng quá hạn kiểm định',
    packageCode: 'XL-05',
  },
  {
    id: 'a13',
    time: '07:45',
    severity: 'info',
    message: 'Giao ban đầu ca: 428 nhân lực có mặt công trường',
  },
  {
    id: 'a14',
    time: '07:30',
    severity: 'info',
    message: 'Bàn giao mặt bằng khu vực sân đường cho nhà thầu',
    packageCode: 'XL-06',
  },
];

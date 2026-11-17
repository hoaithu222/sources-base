/**
 * Dữ liệu mẫu cho khu vực "Sống & tự chạy".
 * Lưu ý: số CỐ Ý lẻ và lệch nhau nhiều — đừng làm tròn (100 · 200 · 300): bộ tròn trịa giấu mất hai
 * lỗi hay gặp của nhóm này (trục chia độ ra số không đọc nổi, thanh ngắn nhất bị bẹp còn 1px).
 */

export interface SmartFeedRow {
  id: string;
  time: string;
  device: string;
  event: string;
  level: 'info' | 'warn' | 'error';
}

/** 14 dòng — CỐ Ý nhiều hơn `rowCount` để thấy bảng tự cuộn. */
export const DEMO_FEED_ROWS: readonly SmartFeedRow[] = [
  { id: 'f1', time: '08:12:04', device: 'Cẩu tháp CT-01', event: 'Vượt tải 8%', level: 'warn' },
  {
    id: 'f2',
    time: '08:12:31',
    device: 'Trạm quan trắc QT-03',
    event: 'Đồng bộ xong',
    level: 'info',
  },
  {
    id: 'f3',
    time: '08:13:02',
    device: 'Cổng ra vào C2',
    event: 'Thẻ lạ quét 3 lần',
    level: 'error',
  },
  { id: 'f4', time: '08:13:47', device: 'Máy bơm B-07', event: 'Khởi động', level: 'info' },
  { id: 'f5', time: '08:14:10', device: 'Cẩu tháp CT-02', event: 'Gió 14 m/s', level: 'warn' },
  {
    id: 'f6',
    time: '08:14:55',
    device: 'Trạm biến áp TBA-1',
    event: 'Điện áp ổn định',
    level: 'info',
  },
  { id: 'f7', time: '08:15:20', device: 'Camera AI-12', event: 'Không đội mũ BH', level: 'error' },
  { id: 'f8', time: '08:15:58', device: 'Máy đầm Đ-04', event: 'Bảo trì đến hạn', level: 'warn' },
  {
    id: 'f9',
    time: '08:16:33',
    device: 'Trạm quan trắc QT-01',
    event: 'Bụi PM2.5 = 42',
    level: 'info',
  },
  {
    id: 'f10',
    time: '08:17:02',
    device: 'Thang vận TV-02',
    event: 'Quá tải người',
    level: 'error',
  },
  { id: 'f11', time: '08:17:44', device: 'Máy bơm B-03', event: 'Dừng theo lịch', level: 'info' },
  { id: 'f12', time: '08:18:19', device: 'Cẩu tháp CT-01', event: 'Về vị trí nghỉ', level: 'info' },
  { id: 'f13', time: '08:18:51', device: 'Camera AI-05', event: 'Mất tín hiệu 12s', level: 'warn' },
  {
    id: 'f14',
    time: '08:19:26',
    device: 'Cổng ra vào C1',
    event: 'Ca 2 vào ổn định',
    level: 'info',
  },
];

/** Khối lượng theo nhà thầu — dùng cho bảng xếp hạng. */
export const DEMO_RANKING = [
  { id: 'r1', label: 'Trường Sơn', value: 4187 },
  { id: 'r2', label: 'Hoà Bình', value: 3642 },
  { id: 'r3', label: 'Nam Việt', value: 2915 },
  { id: 'r4', label: 'Đông Đô', value: 1436 },
  { id: 'r5', label: 'Cảnh quan Xanh', value: 872 },
  { id: 'r6', label: 'Sông Hồng', value: 318 },
] as const;

/** Sản lượng theo tổ đội — dùng cho capsule chart (có trục). */
export const DEMO_CAPSULE = [
  { id: 'c1', label: 'Tổ bê tông', value: 3820 },
  { id: 'c2', label: 'Tổ cốt thép', value: 2960 },
  { id: 'c3', label: 'Tổ cốp pha', value: 2140 },
  { id: 'c4', label: 'Tổ hoàn thiện', value: 1275 },
  { id: 'c5', label: 'Tổ cơ điện', value: 640 },
] as const;

/** Mức các bể chứa — dùng cho đồng hồ mức nước. */
export const DEMO_TANKS = [
  { id: 't1', label: 'Bể nước 1', value: 78, tone: 'sky' },
  { id: 't2', label: 'Bể nước 2', value: 46, tone: 'teal' },
  { id: 't3', label: 'Bể xăng', value: 19, tone: 'orange' },
] as const;

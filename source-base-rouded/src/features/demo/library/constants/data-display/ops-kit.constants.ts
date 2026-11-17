import type {
  BadgeColor,
  HudCalloutStatus,
  HudCalloutTone,
  NoticeBoardItem,
  StatusBoardItem,
  TabOption,
} from '@/shared/ui';

/** Số liệu mẫu của mục "Bộ điều hành" (`OpsKitSection`) — bảng điều hành xưởng / bãi đúc. */

export const DEMO_OPS_STATUS_BADGES: readonly { label: string; color: BadgeColor }[] = [
  { label: 'Đang TH', color: 'warning' },
  { label: 'Hôm nay', color: 'info' },
  { label: 'Quá hạn', color: 'error' },
  { label: 'Hoàn thành', color: 'success' },
  { label: 'Chưa bắt đầu', color: 'neutral' },
];

export const DEMO_OPS_TABS: TabOption[] = [
  { key: 'tasks', label: 'Danh sách công việc' },
  { key: 'beds', label: 'Sơ đồ bệ' },
  { key: 'qr', label: 'Quét QR' },
];

export const DEMO_OPS_TAB_NOTES: Record<string, string> = {
  tasks: '64 việc cần làm · 26 quá hạn · 5 đang thực hiện',
  beds: '8 bệ lắp thép · 6 bệ đúc — 3 bệ đang trống',
  qr: 'Quét tem QR trên dầm để mở hồ sơ thi công',
};

export const DEMO_OPS_NOTICES: readonly NoticeBoardItem[] = [
  {
    id: 'bd-02',
    title: 'Bệ BD-02 sắp đến hạn căng kéo',
    description: 'D015 · Bệ T8-02 — còn 2 ngày',
    value: '2 ngày',
    tone: 'warning',
  },
  {
    id: 'd031',
    title: 'Thiếu thép CM đợt 01',
    description: 'D031 — đạt 88% so với kế hoạch',
    value: '88%',
    tone: 'error',
  },
  {
    id: 'lt-01',
    title: 'LT-01 bảo dưỡng xong',
    description: 'Sẵn sàng tháo ván khuôn',
    tone: 'success',
  },
  {
    id: 'qr',
    title: '12 tem QR chưa gán dầm',
    description: 'Bấm để mở danh sách',
    value: '12',
    tone: 'info',
  },
];

export const DEMO_OPS_EQUIPMENT: readonly StatusBoardItem[] = [
  {
    id: 'crane-1',
    label: 'Cổng trục 30T – số 1',
    icon: 'gear-outline',
    state: 'running',
    value: 78,
  },
  { id: 'crane-2', label: 'Cổng trục 30T – số 2', icon: 'gear-outline', state: 'idle', value: 12 },
  { id: 'mixer', label: 'Trạm trộn bê tông', icon: 'bolt-outline', state: 'warning', value: 54 },
  {
    id: 'steam',
    label: 'Lò hơi bảo dưỡng',
    icon: 'bolt-outline',
    state: 'stopped',
    stateLabel: 'Mất áp suất',
    value: 0,
  },
];

export const DEMO_OPS_CALLOUTS: readonly {
  key: string;
  title: string;
  statusLabel: string;
  status: HudCalloutStatus;
  tone: HudCalloutTone;
  x: number;
  y: number;
}[] = [
  {
    key: 'a',
    title: 'Khu bệ T',
    statusLabel: 'Đang đổ bê tông',
    status: 'warning',
    tone: 'yellow',
    x: 22,
    y: 72,
  },
  {
    key: 'b',
    title: 'Khu bệ B',
    statusLabel: 'Đang hoạt động',
    status: 'success',
    tone: 'primary',
    x: 52,
    y: 58,
  },
  {
    key: 'c',
    title: 'Bãi chứa dầm',
    statusLabel: 'Còn 14 chỗ',
    status: 'info',
    tone: 'sky',
    x: 80,
    y: 80,
  },
];

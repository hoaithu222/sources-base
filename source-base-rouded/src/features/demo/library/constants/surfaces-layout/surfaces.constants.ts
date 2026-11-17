import type { BoxInfoItem, TitleIconColor } from '@/shared/ui';

/**
 * Dữ liệu giả cho mục Mặt nền · Khung thẻ · Card dashboard · Tiêu đề & header.
 * Lưu ý: mảng CỐ Ý không `readonly` — cùng lý do ở `constants/samples.constants.ts`.
 */

/**
 * 12 tone dùng chung cho HudInfoBox / DetailPanelHeader / SectionHeader / TitleScreen
 * — 1 nguồn duy nhất, đổi thứ tự ở đây là đổi khắp các khu vực demo.
 */
export const DEMO_TITLE_TONES: TitleIconColor[] = [
  'blue',
  'green',
  'yellow',
  'orange',
  'red',
  'purple',
  'sky',
  'teal',
  'indigo',
  'pink',
  'fuchsia',
  'azure',
];

/** Ba dòng số liệu giả — SỐ LIỆU chứ không phải "lorem": card dashboard sinh ra để đọc số. */
export const DEMO_PANEL_CARD_LINES: { label: string; value: string }[] = [
  { label: 'Kế hoạch', value: '84,3 tỷ' },
  { label: 'Thực tế', value: '48,1 tỷ' },
  { label: 'Luỹ kế', value: '1.572 tỷ' },
];

/** Đủ 8 màu của `BoxInfoItemColor`. */
export const DEMO_BOX_INFO_ITEMS_FULL: BoxInfoItem[] = [
  { label: 'Đã nghiệm thu', value: 42, percent: 62, color: 'success' },
  { label: 'Đang chờ duyệt', value: 18, percent: 26, color: 'warning' },
  { label: 'Quá hạn', value: 8, percent: 12, color: 'error' },
  { label: 'Ưu tiên cao', value: 5, percent: 8, color: 'accent' },
  { label: 'Theo dõi thêm', value: 14, percent: 21, color: 'teal' },
  { label: 'Ghi nhận mới', value: 9, percent: 13, color: 'info' },
  { label: 'Chỉ tiêu chính', value: 33, percent: 49, color: 'primary' },
  { label: 'Khảo sát hiện trường', value: 6, percent: 9, color: 'sky' },
];

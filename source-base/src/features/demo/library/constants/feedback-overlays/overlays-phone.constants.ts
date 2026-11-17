/**
 * Dữ liệu mẫu của mục "Lớp nổi trên điện thoại": tiêu đề dài, thân dài, tuỳ chọn của bộ lọc mẫu.
 */

export type PhoneOverlayDemo =
  'sheet-short' | 'sheet-long' | 'sheet-footer' | 'modal-long-title' | 'modal-long-body';

export const PHONE_OVERLAY_DEMO_LABELS = [
  { key: 'sheet-short', label: 'Sheet ngắn' },
  { key: 'sheet-long', label: 'Sheet dài (cuộn)' },
  { key: 'sheet-footer', label: 'Sheet có footer' },
] as const satisfies readonly { key: PhoneOverlayDemo; label: string }[];

export const PHONE_MODAL_DEMO_LABELS = [
  { key: 'modal-long-title', label: 'Modal tiêu đề dài' },
  { key: 'modal-long-body', label: 'Modal thân dài' },
] as const satisfies readonly { key: PhoneOverlayDemo; label: string }[];

export const LONG_MODAL_TITLE =
  'So sánh số lượng nhân sự công ty và các đơn vị thành viên theo từng tháng';

export const FILTER_VIEW_OPTIONS = [
  { key: 'month', label: 'Tháng' },
  { key: 'quarter', label: 'Quý' },
  { key: 'year', label: 'Năm' },
];

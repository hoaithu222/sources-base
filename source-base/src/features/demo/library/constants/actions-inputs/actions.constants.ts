import type { MenuOption, SegmentOption, SystemIconName } from '@/shared/ui';

/**
 * Trục biến thể + dữ liệu mẫu của mục "Hành động" và "Ma trận nút" (Button · SegmentToggle · ThemeToggle ·
 * Menu · ContextMenu). Icon khai bằng TÊN (`iconName`), không JSX — section dựng `<SystemIcon>` lúc render.
 */

/** Option UI kit có `icon: ReactNode` → ở đây giữ tên icon thay cho phần tử. */
type WithIconName<T> = Omit<T, 'icon'> & { iconName?: SystemIconName };

export const BUTTON_VARIANTS = ['primary', 'secondary', 'stroke', 'ghost'] as const;
export const BUTTON_SKINS = ['base', 'accent', 'danger', 'neutral'] as const;
export const BUTTON_SIZES = ['xl', 'lg', 'md', 'sm', 'xs'] as const;
export const SEGMENT_VARIANTS = [
  'pill',
  'subtle',
  'tab',
  'tab-v2',
  'tab-hud',
  'solid',
  'glass',
  'underline',
] as const;
export const SEGMENT_SIZES = ['sm', 'md', 'lg'] as const;
export const SEGMENT_SKINS = [
  'neutral',
  'primary',
  'primary-solid',
  'sky',
  'success',
  'warning',
] as const;
export const THEME_TOGGLE_SIZES = ['sm', 'md', 'lg'] as const;

export const SEGMENT_OPTIONS = [
  { key: 'day', label: 'Ngày' },
  { key: 'week', label: 'Tuần' },
  { key: 'month', label: 'Tháng' },
];

/** Hàng "SegmentToggle · variant": đoạn kèm badge đếm + một đoạn `disabled`. */
export const SEGMENT_STATE_OPTIONS: SegmentOption[] = [
  ...SEGMENT_OPTIONS.map((option, index) => (index ? { ...option, badge: index * 6 } : option)),
  { key: 'year', label: 'Năm', badge: 0, disabled: true, title: 'Chưa chốt số liệu năm' },
];

export const MENU_ITEMS: WithIconName<MenuOption>[] = [
  { key: 'edit', label: 'Sửa', iconName: 'pen-outline' },
  { key: 'copy', label: 'Nhân bản', iconName: 'copy-outline' },
  { key: 'lock', label: 'Khoá', disabled: true, hint: 'Cần quyền quản trị' },
  { key: 'delete', label: 'Xoá', danger: true, iconName: 'trash-outline' },
];

/** Icon-only + badge — biến thể SegmentToggle chỉ có hình, không chữ. */
export const ICON_SEGMENT_ITEMS: WithIconName<SegmentOption>[] = [
  { key: 'grid', iconName: 'grid-2-outline', title: 'Dạng lưới' },
  { key: 'list', iconName: 'list-outline', title: 'Dạng danh sách', badge: 3 },
  { key: 'star', iconName: 'star-outline', title: 'Đã đánh dấu' },
];

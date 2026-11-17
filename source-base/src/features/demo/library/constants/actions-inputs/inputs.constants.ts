import type { DropdownOption } from '@/shared/ui';

/** Trục biến thể + option mẫu của mục "Ô nhập", "Ô chọn" và "Chọn danh sách". */

export const FIELD_SIZES = ['sm', 'md', 'lg'] as const;
export const INPUT_VARIANTS = ['glass', 'outline', 'filled', 'ghost'] as const;
export const INPUT_BORDERS = ['default', 'none', 'bottomLine'] as const;
export const CHECKBOX_SIZES = ['sm', 'md', 'lg'] as const;

/** Đủ 6 giá trị `DropdownOptionTone` — mỗi option 1 tone, kèm icon + badge. */
export const DEMO_SEVERITY_OPTIONS: DropdownOption[] = [
  { value: 'star', label: 'Nổi bật', tone: 'primary', icon: 'star-outline' },
  { value: 'low', label: 'Nhẹ', tone: 'success', icon: 'circle-check-outline', badge: 'L' },
  {
    value: 'medium',
    label: 'Trung bình',
    tone: 'warning',
    icon: 'triangle-exclamation-outline',
    badge: 'M',
  },
  {
    value: 'high',
    label: 'Nghiêm trọng',
    tone: 'error',
    icon: 'diamond-exclamation-outline',
    badge: 'H',
  },
  { value: 'info', label: 'Thông tin', tone: 'info', icon: 'circle-question-outline' },
  { value: 'none', label: 'Chưa phân loại', tone: 'neutral' },
];

/** Chấm màu dữ liệu (`dotColor`) — vd màu nhận diện nhà thầu; `''` = chưa đặt màu. */
export const DEMO_CONTRACTOR_OPTIONS: DropdownOption[] = [
  { value: 'c1', label: 'Công ty Xây dựng Sông Đà', dotColor: '#22C55E' },
  { value: 'c2', label: 'Tổng thầu Coteccons', dotColor: '#1A94FF' },
  { value: 'c3', label: 'Liên danh Hoà Bình - Delta', dotColor: '#FC820A' },
  { value: 'c4', label: 'Chưa gán màu', dotColor: '' },
];

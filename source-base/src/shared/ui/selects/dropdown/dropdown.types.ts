import type { SystemIconName } from '@/shared/ui/icons';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';

export type DropdownVariant = 'tick' | 'radio';
export type DropdownSize = FieldSize;
export type DropdownOptionTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: SystemIconName;
  badge?: string;
  /** Text phụ căn PHẢI (ngày, mã, số lượng); chỉ hiện trong danh sách, không hiện trên trigger. */
  meta?: string;
  tone?: DropdownOptionTone;
  /** Chấm màu DỮ LIỆU (`#RRGGBB` / `var(--color-*)`); `''` = chấm rỗng, `undefined` = không có. */
  dotColor?: string;
  dotShape?: 'circle' | 'square';
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  defaultValue?: string;
  variant?: DropdownVariant;
  size?: DropdownSize;
  placeholder?: string;
  triggerDisplay?: 'label' | 'badge' | 'meta';
  searchable?: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  creatable?: boolean;
  createLabel?: (query: string) => string;
  clearable?: boolean;
  clearInList?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  onValueChange?: (value: string) => void;
  className?: string;
  contentClassName?: string;
  metaClassName?: string;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

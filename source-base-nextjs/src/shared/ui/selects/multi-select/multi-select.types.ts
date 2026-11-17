import type { FieldSize } from '@/shared/ui/inputs/field.theme';

export type MultiSelectSize = FieldSize;

export interface MultiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  size?: MultiSelectSize;
  placeholder?: string;
  maxDisplay?: number;
  hideChips?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  selectAll?: boolean;
  selectAllLabel?: string;
  clearable?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onValueChange?: (value: string[]) => void;
  className?: string;
  contentClassName?: string;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

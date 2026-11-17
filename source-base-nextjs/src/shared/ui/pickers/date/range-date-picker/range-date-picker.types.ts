import type { PopoverVariant } from '@/shared/ui/overlays/Popover';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import type { DateRange, QuickSelectOption } from '../shared/date-picker.types';

export type RangeDatePickerSize = FieldSize;

export interface RangeDatePickerProps {
  range?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  showQuickSelect?: boolean;
  quickSelectOptions?: QuickSelectOption[];
  placeholder?: string;
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  invalid?: boolean;
  size?: RangeDatePickerSize;
  className?: string;
  allowManualInput?: boolean;
  parseFormats?: string[];
  popoverVariant?: PopoverVariant;
  align?: 'start' | 'center' | 'end';
  collisionPadding?: number;
  hideFooter?: boolean;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

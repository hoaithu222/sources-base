import type { ReactNode, Ref } from 'react';

export type SegmentToggleVariant =
  'pill' | 'subtle' | 'tab' | 'tab-v2' | 'tab-hud' | 'solid' | 'glass' | 'underline';
export type SegmentToggleSize = 'sm' | 'md' | 'lg';
export type SegmentToggleSkin =
  'neutral' | 'primary' | 'primary-solid' | 'sky' | 'success' | 'warning';
export type SegmentToggleState = 'active' | 'inactive';

export interface SegmentOption {
  /** Khoá duy nhất; là giá trị nhận qua `value` / `onValueChange`. */
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  /** Số / chữ ngắn sau nhãn (vd số bản ghi của tab). */
  badge?: number | string;
  disabled?: boolean;
  /** Segment CHỈ CÓ ICON: tooltip + nhãn trình đọc màn hình (có `label` thì chỉ làm tooltip). */
  title?: string;
}

export interface SegmentToggleProps {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  variant?: SegmentToggleVariant;
  size?: SegmentToggleSize;
  skin?: SegmentToggleSkin;
  fullWidth?: boolean;
  fitContent?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

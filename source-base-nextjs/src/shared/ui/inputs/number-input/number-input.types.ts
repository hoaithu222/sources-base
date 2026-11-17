import type { FieldSize } from '../field.theme';

export type NumberInputVariant = 'glass' | 'outline' | 'filled' | 'ghost';
export type NumberInputSize = FieldSize;
export type NumberInputBorder = 'default' | 'none' | 'bottomLine';

export interface NumberInputProps extends Omit<
  React.ComponentProps<'input'>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'min' | 'max' | 'step' | 'type' | 'prefix'
> {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  allowDecimal?: boolean;
  variant?: NumberInputVariant;
  size?: NumberInputSize;
  border?: NumberInputBorder;
  invalid?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  hideStepper?: boolean;
  thousandSeparator?: boolean;
  decimalScale?: number;
  onChange?: (value: number | null) => void;
  wrapperClassName?: string;
  fieldClassName?: string;
  wrapperStepperClassName?: string;
  stepperClassName?: string;
}

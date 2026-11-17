import { useCallback, useState } from 'react';
import { NumericFormat } from 'react-number-format';
import { cn } from '@/shared/utils/style/cn';
import {
  FIELD_BORDER_CLASSES,
  FIELD_HEIGHT,
  FIELD_READONLY_FILL_CLASS,
  FIELD_VARIANT_CLASSES,
  fieldSurface,
} from '../field.theme';
import NumberInputStepper from './number-input-stepper';
import {
  NUMBER_INPUT_AFFIX_CLASSES,
  NUMBER_INPUT_FIELD_CLASSES,
  NUMBER_INPUT_INPUT_CLASSES,
  NUMBER_INPUT_WRAPPER_BASE_CLASSES,
} from './number-input.theme';
import type { NumberInputProps } from './number-input.types';
import { clamp, decimalsOf, parseValue, roundTo } from './number-input.utils';

/** Gắn vào `mousedown` của nút +/- để ô nhập không mất focus khi bấm. */
const preventFocusLoss = (event: React.MouseEvent) => event.preventDefault();

/**
 * NumberInput — ô nhập số (`number | null`) chung bề mặt với `Input`: nút tăng / giảm, kẹp `min` / `max`,
 * slot đơn vị trước / sau, tuỳ chọn dấu ngăn cách hàng nghìn. Số CĂN PHẢI + `tabular-nums` (căn trái: `className="text-left"`).
 *
 * Nhận thêm mọi thuộc tính của `<input>` (`placeholder`, `name`, `onBlur`, `aria-*`…) trừ `type` / `size` /
 * `prefix`. `min` / `max` kẹp khi rời ô và khoá nút +/- ở biên; ↑ ↓ cũng tăng / giảm theo `step`. Trong form
 * react-hook-form dùng `NumberField`.
 * Sửa giao diện: variant / viền → `FIELD_VARIANT_CLASSES` / `FIELD_BORDER_CLASSES` (`field.theme.ts`, chung với
 * `Input`) · bố cục khung / vùng nhập / đơn vị → `number-input.theme.ts` · nút +/- → `number-input-stepper.tsx`
 * · parse / kẹp / làm tròn → `number-input.utils.ts`.
 * Lưu ý: `emit` LUÔN `setText` kể cả controlled, kẻo mất dấu "." khi gõ "1.1"; nút +/- chặn `mousedown` để
 * ô không mất focus (docs/notes/components/inputs.md, mục NumberInput).
 *
 * @param props.value - Số hiện tại (controlled); `null` = ô trống. Bỏ trống (`undefined`) = tự quản.
 * @param props.defaultValue - Số ban đầu khi tự quản.
 * @param props.min - Giá trị nhỏ nhất: kẹp khi rời ô / bấm nút; `min >= 0` thì chế độ hàng nghìn chặn dấu "-".
 * @param props.max - Giá trị lớn nhất: kẹp khi rời ô / bấm nút.
 * @param props.step - Bước của nút +/- và phím ↑ ↓. Mặc định `1`.
 * @param props.allowDecimal - `false` → chỉ số nguyên: chặn gõ dấu thập phân, cắt phần lẻ khi emit.
 *   Mặc định `true`.
 * @param props.variant - Bề mặt: `glass` | `outline` | `filled` | `ghost` (như `Input`). Mặc định `glass`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.border - `default` | `none` | `bottomLine` (như `Input`; `none` / `bottomLine` bỏ cả vách ngăn
 *   cột +/-, `invalid` hiện gạch chân đỏ). Mặc định `default`.
 * @param props.invalid - `true` → viền + ring đỏ, giữ đỏ cả khi focus; gắn `aria-invalid`. Mặc định `false`.
 * @param props.prefix - Nội dung trước số (đơn vị tiền, icon).
 * @param props.suffix - Nội dung sau số (`%`, `m²`, nút xoá…).
 * @param props.hideStepper - `true` → ẩn cột nút +/- (phím ↑ ↓ vẫn chạy). Mặc định `false`.
 * @param props.readOnly - `true` → chỉ đọc: nền nhạt phẳng như `Input`, khoá nút +/- và phím ↑ ↓. Mặc định `false`.
 * @param props.thousandSeparator - `true` → hiển thị kiểu vi-VN "1.000.000,5" khi gõ (chấm tách nghìn, phẩy thập phân —
 *   khớp `formatNumber`); `onChange` vẫn nhận `number | null`.
 *   Mặc định `false`.
 * @param props.decimalScale - Số chữ số thập phân tối đa khi bật `thousandSeparator` (`0` = số nguyên, vd
 *   tiền VND). Bỏ trống = không giới hạn.
 * @param props.onChange - Gọi với số mới (`null` khi ô trống / đang gõ dở như "-") — KHÔNG phải event.
 * @param props.wrapperClassName - Class của khung ngoài: bề ngang / lề / vị trí.
 * @param props.fieldClassName - Class của vùng ô nhập + đơn vị (giữa khung và cột +/-).
 * @param props.wrapperStepperClassName - Class của cột nút +/-.
 * @param props.stepperClassName - Class của TỪNG nút + / -.
 * @param props.className - Class của `<input>` bên trong.
 * @param props.ref - Trỏ tới `<input>` bên trong (React 19: `ref` là prop thường).
 *
 * @example
 * <NumberInput max={100} min={0} step={5} suffix="%" value={percent} onChange={setPercent} />
 *
 * <NumberInput
 *   hideStepper
 *   thousandSeparator
 *   allowDecimal={false}
 *   suffix="đ"
 *   value={price}
 *   onChange={setPrice}
 * />
 */
function NumberInput({
  value,
  defaultValue,
  onChange,
  min,
  max,
  step = 1,
  allowDecimal = true,
  variant = 'glass',
  size = 'md',
  invalid = false,
  border = 'default',
  prefix,
  suffix,
  hideStepper = false,
  thousandSeparator = false,
  decimalScale,
  disabled,
  readOnly,
  wrapperClassName,
  className,
  onBlur,
  onKeyDown,
  fieldClassName,
  wrapperStepperClassName,
  stepperClassName,
  ref,
  ...rest
}: NumberInputProps) {
  const isControlled = value !== undefined;

  const [text, setText] = useState<string>(
    value != null ? String(value) : defaultValue != null ? String(defaultValue) : '',
  );

  const [syncedValue, setSyncedValue] = useState(value);

  if (isControlled && !Object.is(value, syncedValue)) {
    setSyncedValue(value);
    if (parseValue(text) !== value) setText(value == null ? '' : String(value));
  }

  const currentNumber = thousandSeparator && isControlled ? (value ?? null) : parseValue(text);

  const coerce = useCallback(
    (n: number | null): number | null => (n != null && !allowDecimal ? Math.trunc(n) : n),
    [allowDecimal],
  );

  const emit = useCallback(
    (raw: string) => {
      setText(raw);
      onChange?.(coerce(parseValue(raw)));
    },
    [onChange, coerce],
  );

  const stepBy = useCallback(
    (direction: 1 | -1) => {
      const base = currentNumber ?? 0;
      const decimals = Math.max(decimalsOf(base), decimalsOf(step));
      const next = clamp(roundTo(base + direction * step, decimals), min, max);
      const raw = String(next);
      if (!isControlled) setText(raw);
      onChange?.(coerce(next));
    },
    [currentNumber, step, min, max, isControlled, onChange, coerce],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const pattern = allowDecimal ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    if (raw !== '' && !pattern.test(raw)) return;
    emit(raw);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseValue(text);
    if (parsed !== null) {
      const clamped = clamp(parsed, min, max);
      const raw = String(clamped);
      if (raw !== text) emit(raw);
    } else if (text !== '') {
      emit('');
    }
    onBlur?.(event);
  };

  const handleFormattedBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (currentNumber !== null) {
      const clamped = clamp(currentNumber, min, max);
      if (clamped !== currentNumber) {
        if (!isControlled) setText(String(clamped));
        onChange?.(coerce(clamped));
      }
    }
    onBlur?.(event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp' && !readOnly) {
      event.preventDefault();
      stepBy(1);
    } else if (event.key === 'ArrowDown' && !readOnly) {
      event.preventDefault();
      stepBy(-1);
    }
    onKeyDown?.(event);
  };

  const atMax = max !== undefined && currentNumber !== null && currentNumber >= max;
  const atMin = min !== undefined && currentNumber !== null && currentNumber <= min;
  const validity = invalid ? 'invalid' : 'valid';
  const isFlat = variant === 'filled' || variant === 'ghost' || border !== 'default';

  const surfaceClassName = cn(
    fieldSurface({ focusMode: 'within', invalid, disabled, readOnly, flat: isFlat }),
    NUMBER_INPUT_WRAPPER_BASE_CLASSES,
    FIELD_HEIGHT[size],
    FIELD_VARIANT_CLASSES[variant][validity],
    readOnly && !invalid && !disabled && FIELD_READONLY_FILL_CLASS,
    FIELD_BORDER_CLASSES[border][validity],
    wrapperClassName,
  );
  const fieldAreaClassName = cn(NUMBER_INPUT_FIELD_CLASSES, fieldClassName);
  const inputClassName = cn(NUMBER_INPUT_INPUT_CLASSES, className);

  return (
    <div className={surfaceClassName}>
      <div className={fieldAreaClassName}>
        {prefix && <span className={NUMBER_INPUT_AFFIX_CLASSES}>{prefix}</span>}
        {thousandSeparator ? (
          <NumericFormat
            allowNegative={min === undefined || min < 0}
            aria-invalid={invalid || undefined}
            className={inputClassName}
            decimalScale={allowDecimal ? decimalScale : 0}
            decimalSeparator=","
            disabled={disabled}
            getInputRef={ref}
            inputMode={allowDecimal && decimalScale !== 0 ? 'decimal' : 'numeric'}
            readOnly={readOnly}
            thousandSeparator="."
            value={currentNumber ?? ''}
            onBlur={handleFormattedBlur}
            onKeyDown={handleKeyDown}
            onValueChange={(values, { source }) => {
              if (source !== 'event') return;
              const next = coerce(values.floatValue ?? null);
              if (!isControlled) setText(next == null ? '' : String(next));
              onChange?.(next);
            }}
            {...rest}
          />
        ) : (
          <input
            ref={ref}
            aria-invalid={invalid || undefined}
            className={inputClassName}
            disabled={disabled}
            inputMode={allowDecimal ? 'decimal' : 'numeric'}
            readOnly={readOnly}
            type="text"
            value={text}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            {...rest}
          />
        )}
        {suffix && <span className={NUMBER_INPUT_AFFIX_CLASSES}>{suffix}</span>}
      </div>
      {!hideStepper && (
        <NumberInputStepper
          atMax={atMax}
          atMin={atMin}
          border={border}
          buttonClassName={stepperClassName}
          className={wrapperStepperClassName}
          disabled={disabled || readOnly}
          size={size}
          onMouseDown={preventFocusLoss}
          onStep={stepBy}
        />
      )}
    </div>
  );
}

export default NumberInput;

import { useImperativeHandle, useRef, useState } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import {
  FIELD_BORDER_CLASSES,
  FIELD_CLEAR_BUTTON_CLASS,
  FIELD_CLEAR_ICON,
  FIELD_CONTROL_CLASS,
  FIELD_HEIGHT,
  FIELD_ICON_CLASS,
  FIELD_VARIANT_CLASSES,
  fieldSurface,
  type FieldSize,
} from './field.theme';

export type InputVariant = 'glass' | 'outline' | 'filled' | 'ghost';
export type InputSize = FieldSize;
export type InputBorder = 'default' | 'none' | 'bottomLine';

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  border?: InputBorder;
  invalid?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  clearable?: boolean;
  wrapperClassName?: string;
}

const INPUT_WRAPPER_BASE_CLASSES = 'inline-flex w-full items-center gap-2 px-3';

/**
 * Input — ô nhập một dòng của UI kit; khung / hover / focus / lỗi / tắt lấy từ `fieldSurface` (`field.theme.ts`).
 *
 * Nhận thêm mọi thuộc tính của `<input>` (`value`, `onChange`, `placeholder`, `type`, `aria-*`…) — tất cả
 * gắn vào `<input>` bên trong. Trong form react-hook-form dùng `TextField` / `EmailField` / `PasswordField`;
 * số dùng `NumberInput`; nhiều dòng dùng `Textarea`. Ô tìm kiếm tự do: `docs/rules/interaction/ime-safe-input.md`.
 * Sửa giao diện: nét riêng từng variant → `FIELD_VARIANT_CLASSES[variant][valid|invalid]` · viền / gạch chân
 * → `FIELD_BORDER_CLASSES[border][valid|invalid]` · nút ✕ → `FIELD_CLEAR_BUTTON_CLASS` (đều ở `field.theme.ts`,
 * chung với `NumberInput`) · khung ngoài → `INPUT_WRAPPER_BASE_CLASSES`.
 * Lưu ý: `className` vào `<input>` bên trong, KHÔNG vào khung — bề ngang / lề / vị trí (`w-*`, `max-w-*`,
 * `mx-*`, `flex-1`) đặt ở `wrapperClassName`.
 * Lưu ý: KHÔNG thêm prop `debounce` (biến Input thành controlled nội bộ, cắt chuỗi gõ tiếng Việt) —
 * `docs/rules/interaction/ime-safe-input.md` §3. Lý do thiết kế: `docs/notes/components/inputs.md` (mục Input).
 *
 * @param props.variant - Bề mặt: `glass` (chuẩn) | `outline` (nền trong suốt, còn viền) | `filled` (không
 *   viền, nền đặc — form dày) | `ghost` (không viền, nền mờ — inline / trong card). Mặc định `glass`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px (`FIELD_HEIGHT`). Mặc định `md`.
 * @param props.border - `default` (khung đủ 4 cạnh) | `none` (bỏ viền + nền) | `bottomLine` (như `none`,
 *   thêm gạch chân khi focus). Với `none` / `bottomLine`, `invalid` hiện gạch chân đỏ. Mặc định `default`.
 * @param props.invalid - `true` → viền + ring đỏ, GIỮ đỏ cả khi hover / focus; gắn `aria-invalid` (nơi gọi
 *   truyền `aria-invalid` riêng thì giá trị đó thắng). Mặc định `false`.
 * @param props.startIcon - Icon đầu ô (thường `<SystemIcon />`), màu `fg-muted`.
 * @param props.endIcon - Icon cuối ô, đứng sau nút ✕.
 * @param props.clearable - `true` → hiện nút ✕ khi ô có giá trị và không `disabled` / `readOnly`; bấm gửi
 *   `onChange` với chuỗi rỗng rồi focus lại ô. Mặc định `false`.
 * @param props.wrapperClassName - Class của khung ngoài: bề ngang / lề / vị trí.
 * @param props.className - Class của `<input>` bên trong (căn chữ, font số…), KHÔNG phải khung.
 * @param props.ref - Trỏ tới `<input>` bên trong (React 19: `ref` là prop thường) — react-hook-form
 *   `{...field}` focus được ô lỗi nhờ ref này.
 *
 * @example
 * <Input
 *   clearable
 *   placeholder="Mã nhân viên"
 *   size="sm"
 *   startIcon={<SystemIcon name="user-outline" />}
 *   wrapperClassName="max-w-md"
 * />
 *
 * <Input border="bottomLine" invalid={Boolean(error)} value={code} onChange={(e) => setCode(e.target.value)} />
 */
function Input({
  variant = 'glass',
  size = 'md',
  border = 'default',
  invalid = false,
  startIcon,
  endIcon,
  clearable = false,
  wrapperClassName,
  className,
  value,
  defaultValue,
  disabled,
  readOnly,
  onChange,
  ref,
  ...props
}: InputProps) {
  const innerRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

  const isControlled = value !== undefined;
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(
    defaultValue != null && String(defaultValue).length > 0,
  );
  const hasValue = isControlled ? value != null && String(value).length > 0 : uncontrolledHasValue;
  const showClear = clearable && hasValue && !disabled && !readOnly;
  const validity = invalid ? 'invalid' : 'valid';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledHasValue(event.target.value.length > 0);
    onChange?.(event);
  };

  const handleClear = () => {
    const input = innerRef.current;
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (!isControlled) setUncontrolledHasValue(false);
    input.focus();
  };

  const surfaceClassName = cn(
    fieldSurface({ focusMode: 'within', invalid, disabled }),
    INPUT_WRAPPER_BASE_CLASSES,
    FIELD_HEIGHT[size],
    FIELD_VARIANT_CLASSES[variant][validity],
    FIELD_BORDER_CLASSES[border][validity],
    wrapperClassName,
  );
  const inputClassName = cn(FIELD_CONTROL_CLASS, 'h-full', className);

  return (
    <div className={surfaceClassName}>
      {startIcon && <span className={FIELD_ICON_CLASS}>{startIcon}</span>}
      <input
        ref={innerRef}
        aria-invalid={invalid || undefined}
        className={inputClassName}
        defaultValue={defaultValue}
        disabled={disabled}
        readOnly={readOnly}
        value={value}
        onChange={handleChange}
        {...props}
      />
      {showClear && (
        <button
          aria-label="Xóa"
          className={FIELD_CLEAR_BUTTON_CLASS}
          tabIndex={-1}
          type="button"
          onClick={handleClear}
          onMouseDown={(e) => e.preventDefault()}
        >
          <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.all} />
        </button>
      )}
      {endIcon && <span className={FIELD_ICON_CLASS}>{endIcon}</span>}
    </div>
  );
}

export default Input;

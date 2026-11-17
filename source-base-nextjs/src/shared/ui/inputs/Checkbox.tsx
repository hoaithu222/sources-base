'use client';

import { useCallback, useEffect, useId, useRef } from 'react';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { CONTROL_FOCUS_RING_CLASS } from './field.theme';

export type CheckboxSize = 'sm' | 'md' | 'lg';

type CheckboxState = 'valid' | 'invalid';

export interface CheckboxProps extends Omit<
  React.ComponentProps<'input'>,
  'checked' | 'onChange' | 'type' | 'size'
> {
  size?: CheckboxSize;
  checked?: boolean | 'indeterminate';
  label?: React.ReactNode;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Khoá: hộp chìm `bg-subtle` + viền `border-default`; đã tích → khối xám `fg-faint` + tick trắng (≥ 3:1) thay
 * mảng xanh bạc màu của lớp mờ 50% — vẫn đọc được trạng thái, nhìn là biết "không đổi được".
 */
const CHECKBOX_DISABLED_CLASSES = cn(
  'disabled:border-border-default disabled:bg-bg-subtle',
  'disabled:checked:border-fg-faint disabled:checked:bg-fg-faint',
  'disabled:indeterminate:border-fg-faint disabled:indeterminate:bg-fg-faint',
);

const CHECKBOX_BASE_CLASSES = cn(
  'peer relative m-0 shrink-0 cursor-pointer appearance-none rounded-xs border bg-bg-input',
  "touch:after:absolute touch:after:-inset-3 touch:after:content-['']",
  'transition-[background-color,border-color,box-shadow] duration-100 ease-out',
  CONTROL_FOCUS_RING_CLASS,
  'checked:bg-primary-6 indeterminate:bg-primary-6',
  'disabled:cursor-not-allowed',
  CHECKBOX_DISABLED_CLASSES,
  'before:absolute before:left-1/2 before:top-1/2',
  'before:-translate-x-1/2 before:-translate-y-1/2',
  'before:block before:size-[70%] before:bg-neutral-0',
  'before:transition-[clip-path,opacity,rotate,translate] before:duration-100 before:ease-out',
  'before:rotate-45 before:opacity-0',
  'before:[clip-path:polygon(20%_100%,20%_80%,20%_80%,20%_0%,20%_0%,20%_100%)]',
  'checked:before:opacity-100',
  'checked:before:[clip-path:polygon(20%_100%,20%_80%,50%_80%,50%_0%,70%_0%,70%_100%)]',
  'indeterminate:before:rotate-0 indeterminate:before:opacity-100',
  'indeterminate:before:[clip-path:polygon(15%_58%,15%_42%,50%_42%,50%_42%,85%_42%,85%_58%)]',
  'motion-reduce:transition-none motion-reduce:before:transition-none',
);

const CHECKBOX_STATE_CLASSES = {
  valid: cn(
    'border-border-strong focus-visible:border-primary-6',
    'enabled:hover:border-primary-5 enabled:group-hover/checkbox:border-primary-5',
    'checked:border-primary-6 indeterminate:border-primary-6',
  ),
  invalid: cn(
    'border-error',
    'enabled:hover:border-error enabled:group-hover/checkbox:border-error',
    'checked:border-error indeterminate:border-error',
  ),
} satisfies Record<CheckboxState, string>;

const CHECKBOX_SIZE_CLASSES = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-5',
} satisfies Record<CheckboxSize, string>;

const CHECKBOX_LABEL_WRAPPER_CLASSES = cn(
  'group/checkbox inline-flex cursor-pointer select-none items-center gap-2',
  'has-[:disabled]:cursor-not-allowed',
);

const CHECKBOX_LABEL_SIZE_CLASSES = {
  sm: 'text-caption-12',
  md: 'text-body-14',
  lg: 'text-body-16',
} satisfies Record<CheckboxSize, string>;

const CHECKBOX_ERROR_SIZE_CLASSES = {
  sm: 'text-caption-10',
  md: 'text-caption-12',
  lg: 'text-caption-12',
} satisfies Record<CheckboxSize, string>;

/**
 * Checkbox — ô tích `<input type="checkbox">` native, dấu tick vẽ bằng CSS; có nhãn, dòng lỗi và trạng thái
 * "chọn một phần" (indeterminate).
 *
 * Nhận thêm mọi thuộc tính của `<input>` (`name`, `value`, `defaultChecked`, `disabled`, `onBlur`, `aria-*`…)
 * — tất cả gắn vào ô tích. Tự gửi theo `<form>`, bấm nhãn là tích. Trong form react-hook-form dùng
 * `CheckboxField`; công tắc bật / tắt một thiết lập thì dùng `Toggle`; chọn một trong nhóm dùng `Radio`.
 * Sửa giao diện: hộp + tick + focus / tắt → `CHECKBOX_BASE_CLASSES` · viền + hover (thường / lỗi) →
 * `CHECKBOX_STATE_CLASSES` · cỡ hộp → `CHECKBOX_SIZE_CLASSES` · khung nhãn → `CHECKBOX_LABEL_WRAPPER_CLASSES`
 * · chữ → `CHECKBOX_LABEL_SIZE_CLASSES` / `CHECKBOX_ERROR_SIZE_CLASSES`.
 * Lưu ý: `<input>` là void element nên `children` bị rút khỏi props và dùng làm nhãn
 * (`<Checkbox>Nhãn</Checkbox>`); tick PHẢI `absolute`, ring KHÔNG `ring-offset`
 * (docs/notes/components/inputs.md, mục Checkbox).
 *
 * @param props.size - Cỡ hộp: `sm` 14px | `md` 16px | `lg` 20px (kéo theo cỡ chữ nhãn / lỗi). Mặc định `md`.
 * @param props.checked - `true` | `false` | `'indeterminate'` (gạch ngang, vd "chọn tất cả" khi mới chọn
 *   một phần). Bỏ trống = tự quản (dùng `defaultChecked`).
 * @param props.label - Nhãn bên phải ô; bấm vào nhãn cũng tích. Bỏ trống thì lấy `children`.
 * @param props.error - Dòng lỗi dưới nhãn (kèm icon cảnh báo như dòng lỗi của `FormItem`); viền ô đỏ (cả
 *   khi hover), đặt `aria-invalid` và nối `aria-describedby` tới dòng lỗi.
 * @param props.onCheckedChange - Gọi với `true` / `false` mỗi lần người dùng tích / bỏ tích.
 * @param props.className - Class thêm cho chính ô tích (không phải khung nhãn).
 * @param props.ref - Trỏ tới `<input type="checkbox">` (React 19: `ref` là prop thường).
 *
 * @example
 * <Checkbox checked={agreed} label="Đồng ý điều khoản" onCheckedChange={setAgreed} />
 *
 * <Checkbox
 *   aria-label="Chọn tất cả"
 *   checked={allSelected ? true : someSelected ? 'indeterminate' : false}
 *   onCheckedChange={toggleAll}
 * />
 */
function Checkbox({
  size = 'md',
  label,
  error,
  checked,
  onCheckedChange,
  className,
  id,
  children,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...props
}: CheckboxProps) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  const errorId = useId();
  const isIndeterminate = checked === 'indeterminate';

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = isIndeterminate;
  }, [isIndeterminate]);

  const mergeRef = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.indeterminate = isIndeterminate;
    onCheckedChange?.(event.target.checked);
  };

  const labelNode = label ?? children;
  const describedBy = [ariaDescribedBy, error ? errorId : undefined].filter(Boolean).join(' ');

  const checkboxClassName = cn(
    CHECKBOX_BASE_CLASSES,
    CHECKBOX_STATE_CLASSES[error ? 'invalid' : 'valid'],
    CHECKBOX_SIZE_CLASSES[size],
    className,
  );

  const box = (
    <input
      ref={mergeRef}
      aria-describedby={describedBy || undefined}
      aria-invalid={error ? true : undefined}
      checked={isIndeterminate ? false : checked}
      className={checkboxClassName}
      id={id}
      type="checkbox"
      onChange={handleChange}
      {...props}
    />
  );

  if (!labelNode && !error) return box;

  const labelClassName = cn(
    'text-fg-heading peer-disabled:text-fg-faint',
    CHECKBOX_LABEL_SIZE_CLASSES[size],
  );
  const errorClassName = cn('flex items-start gap-1 text-error', CHECKBOX_ERROR_SIZE_CLASSES[size]);

  return (
    <div className="flex flex-col gap-1">
      <label className={CHECKBOX_LABEL_WRAPPER_CLASSES}>
        {box}
        {labelNode ? <span className={labelClassName}>{labelNode}</span> : null}
      </label>
      {error && (
        <p className={errorClassName} id={errorId}>
          <SystemIcon
            aria-hidden
            className="mt-0.5 shrink-0"
            name="circle-exclamation-outline"
            size={12}
          />
          {error}
        </p>
      )}
    </div>
  );
}

export default Checkbox;

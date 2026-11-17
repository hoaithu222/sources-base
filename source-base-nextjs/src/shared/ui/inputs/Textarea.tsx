'use client';

import { useState } from 'react';
import { cn } from '@/shared/utils/style/cn';
import { FIELD_CONTROL_CLASS, fieldSurface, type FieldSize } from './field.theme';

export type TextareaSize = FieldSize;

type TextareaCounterState = 'normal' | 'full';

export interface TextareaProps extends Omit<React.ComponentProps<'textarea'>, 'size'> {
  size?: TextareaSize;
  minHeight?: number | string;
  invalid?: boolean;
  showCount?: boolean;
  wrapperClassName?: string;
}

const TEXTAREA_FIELD_CLASSES = 'relative flex w-full flex-col px-3 py-2.5';

const TEXTAREA_CLASSES = cn(FIELD_CONTROL_CLASS, 'flex-initial resize-y');

const TEXTAREA_SIZE_CLASSES = {
  sm: 'min-h-8',
  md: 'min-h-9',
  lg: 'min-h-10',
} satisfies Record<TextareaSize, string>;

const TEXTAREA_COUNTER_ROW_CLASSES =
  'pointer-events-none absolute bottom-2.5 left-3 flex items-center gap-1 bg-inherit';

const TEXTAREA_COUNTER_STATE_CLASSES = {
  normal: 'bg-inherit text-caption-10 tabular-nums text-fg-muted',
  full: 'bg-inherit text-caption-10-medium tabular-nums text-warning',
} satisfies Record<TextareaCounterState, string>;

/**
 * Textarea — ô nhập nhiều dòng, kéo giãn được theo chiều dọc; chung bề mặt với `Input` qua `fieldSurface`.
 *
 * Nhận thêm mọi thuộc tính của `<textarea>` (`rows`, `value`, `onChange`, `maxLength`, `aria-*`…) — tất cả
 * gắn vào `<textarea>` bên trong. Trong form react-hook-form dùng `TextareaField`.
 * Sửa giao diện: ruột `<textarea>` → `TEXTAREA_CLASSES` · cỡ → `TEXTAREA_SIZE_CLASSES` · khung →
 * `TEXTAREA_FIELD_CLASSES` + `field.theme.ts` (khung / lỗi / tắt) · bộ đếm → `TEXTAREA_COUNTER_ROW_CLASSES` /
 * `TEXTAREA_COUNTER_STATE_CLASSES`.
 * Lưu ý: bộ đếm `absolute` đè lên dải đáy ô nên khi đếm `<textarea>` có thêm `pb-4`; chạm `maxLength` thì
 * bộ đếm chuyển màu cảnh báo (`warning`). `flex-initial` thay
 * `flex-1` của `FIELD_CONTROL_CLASS` kẻo khung `flex-col` nuốt chiều cao do `rows` / `minHeight` quy định
 * (docs/notes/components/inputs.md, mục Textarea).
 *
 * @param props.size - Chiều cao tối thiểu: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.minHeight - Chiều cao tối thiểu riêng: số = px, hoặc chuỗi CSS (`'8rem'`); thắng cả `size`
 *   lẫn `style.minHeight`.
 * @param props.invalid - `true` → viền + ring đỏ, GIỮ đỏ cả khi focus; gắn `aria-invalid` (nơi gọi truyền
 *   `aria-invalid` riêng thì giá trị đó thắng). Mặc định `false`.
 * @param props.showCount - Ép hiện (`true`) / ẩn (`false`) bộ đếm ký tự. Mặc định: tự hiện khi có `maxLength`.
 * @param props.disabled - `true` → khoá ô: nền chìm + chữ `fg-muted`, con trỏ cấm, bỏ hover / focus.
 *   Mặc định `false`.
 * @param props.readOnly - `true` → chỉ đọc: nền nhạt phẳng (không lõm), vẫn focus / chép chữ được. Mặc định `false`.
 * @param props.wrapperClassName - Class của khung ngoài: bề ngang / lề / vị trí.
 * @param props.className - Class của `<textarea>` bên trong, KHÔNG phải khung.
 * @param props.ref - Trỏ tới `<textarea>` bên trong (React 19: `ref` là prop thường).
 *
 * @example
 * <Textarea maxLength={500} placeholder="Ghi chú" rows={4} />
 *
 * <Textarea invalid={Boolean(error)} minHeight={120} value={note} onChange={(e) => setNote(e.target.value)} />
 */
function Textarea({
  size = 'md',
  showCount,
  maxLength,
  minHeight,
  invalid = false,
  disabled,
  readOnly,
  value,
  defaultValue,
  onChange,
  wrapperClassName,
  className,
  style,
  ref,
  ...rest
}: TextareaProps) {
  const isControlled = value !== undefined;
  const mergedStyle = minHeight !== undefined ? { ...style, minHeight } : style;

  const [internalValue, setInternalValue] = useState<string>(
    defaultValue == null ? '' : String(defaultValue),
  );
  const currentValue = isControlled ? String(value ?? '') : internalValue;
  const count = currentValue.length;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  };

  const shouldCount = showCount ?? Boolean(maxLength);
  const counterState: TextareaCounterState =
    maxLength !== undefined && count >= maxLength ? 'full' : 'normal';

  const fieldClassName = cn(
    fieldSurface({ focusMode: 'within', invalid, disabled, readOnly }),
    TEXTAREA_FIELD_CLASSES,
    wrapperClassName,
  );
  const textareaClassName = cn(
    TEXTAREA_CLASSES,
    TEXTAREA_SIZE_CLASSES[size],
    shouldCount && 'pb-4',
    className,
  );

  return (
    <div className={fieldClassName}>
      <textarea
        ref={ref}
        {...(isControlled ? { value: currentValue } : { defaultValue })}
        aria-invalid={invalid || undefined}
        className={textareaClassName}
        disabled={disabled}
        maxLength={maxLength}
        readOnly={readOnly}
        style={mergedStyle}
        onChange={handleChange}
        {...rest}
      />
      {shouldCount && (
        <div className={TEXTAREA_COUNTER_ROW_CLASSES}>
          <span className={TEXTAREA_COUNTER_STATE_CLASSES[counterState]}>
            {count}
            {maxLength ? `/${maxLength}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export default Textarea;

'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Input, { type InputProps } from '@/shared/ui/inputs/Input';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { TOUCH_HIT_CLASSES } from '@/shared/ui/primitives/touch-hit.theme';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem, { type ErrorColor } from '../../FormItem';
import PasswordStrength from '../password-strength/PasswordStrength';
import type { PasswordCondition } from '../password-strength/password-strength.utils';

export interface PasswordFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  optional?: boolean;
  optionalLabel?: string;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  errorColor?: ErrorColor;
  variant?: InputProps['variant'];
  size?: FieldSize;
  showStrength?: boolean;
  strengthConditions?: PasswordCondition[];
}

const PASSWORD_FIELD_TOGGLE_CLASSES = cn(
  TOUCH_HIT_CLASSES.icon,
  'inline-flex size-5 cursor-pointer items-center justify-center text-fg-muted',
  'transition-colors duration-150 ease-out',
  'hover:text-fg-heading',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus',
  'disabled:cursor-not-allowed',
);

/**
 * PasswordField — ô mật khẩu có nút mắt hiện / ẩn và (tuỳ chọn) thanh đo độ mạnh `PasswordStrength`.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện `••••••••`, không lộ giá trị.
 * Sửa giao diện: nút mắt → `PASSWORD_FIELD_TOGGLE_CLASSES` · thanh đo → `PasswordStrength`.
 * Lưu ý: nút mắt nhận Tab (người dùng bàn phím cũng xem lại được mật khẩu, `aria-pressed` đọc trạng thái) và
 * không cướp focus khỏi ô khi bấm chuột.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.optional - `true` → hiện `optionalLabel` sau nhãn; bị bỏ qua khi `required`.
 * @param props.optionalLabel - Chữ hiện khi `optional`. Mặc định theo ngôn ngữ (xem `FormItem`).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống. Mặc định `••••••••`.
 * @param props.disabled - `true` → khoá ô (và nút mắt).
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.autoFocus - `true` → focus ngay khi hiện.
 * @param props.errorColor - Màu dòng lỗi + dấu `*`: `error` | `warning` | `success` | `link`. Mặc định `error`.
 * @param props.variant - Kiểu ô của `Input`: `glass` | `outline` | `filled` | `ghost`. Mặc định `glass`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.showStrength - `true` → hiện thanh đo độ mạnh dưới ô. Mặc định `false`.
 * @param props.strengthConditions - Điều kiện thay thế cho thanh đo (nhãn đã dịch). Mặc định: chữ hoa · chữ số · từ 8 ký tự, nhãn
 *   theo ngôn ngữ.
 *
 * @example
 * <PasswordField name="password" label="Mật khẩu" required showStrength />
 *
 * <PasswordField name="confirm" label="Nhập lại mật khẩu" required />
 */
function PasswordField({
  name,
  label,
  required,
  optional,
  optionalLabel,
  description,
  placeholder = '••••••••',
  disabled,
  className,
  autoFocus,
  errorColor,
  variant,
  size,
  showStrength,
  strengthConditions,
}: PasswordFieldProps) {
  const t = useTranslations('ui.form');
  const [visible, setVisible] = useState(false);
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        ••••••••
      </FieldReadOnly>
    );
  }

  const toggleButton = (
    <button
      aria-label={visible ? t('password.hide') : t('password.show')}
      aria-pressed={visible}
      className={PASSWORD_FIELD_TOGGLE_CLASSES}
      disabled={disabled}
      type="button"
      onClick={() => setVisible((v) => !v)}
      onMouseDown={(e) => e.preventDefault()}
    >
      <SystemIcon name={visible ? 'eye-slash-outline' : 'eye-outline'} size={16} />
    </button>
  );

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      errorColor={errorColor}
      htmlFor={a11y.id}
      label={label}
      optional={optional}
      optionalLabel={optionalLabel}
      required={required}
    >
      <Input
        {...field}
        {...a11y.input}
        autoFocus={autoFocus}
        disabled={disabled}
        endIcon={toggleButton}
        invalid={Boolean(error)}
        placeholder={placeholder}
        size={size}
        type={visible ? 'text' : 'password'}
        variant={variant}
      />
      {showStrength && (
        <PasswordStrength conditions={strengthConditions} value={field.value ?? ''} />
      )}
    </FormItem>
  );
}

export default PasswordField;

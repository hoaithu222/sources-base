import Input from '@/shared/ui/inputs/Input';
import type { FieldSize } from '@/shared/ui/inputs/field.theme';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface IPAddressFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: FieldSize;
  withPort?: boolean;
}

const IP_MAX_LENGTH = 15;
const IP_WITH_PORT_MAX_LENGTH = 21;

const keepIpCharacters = (raw: string, withPort: boolean) =>
  raw.replace(withPort ? /[^\d.:]/g : /[^\d.]/g, '');

/**
 * IPAddressField — ô nhập địa chỉ IPv4 (`192.168.1.1`), kèm cổng (`192.168.1.1:8080`) khi `withPort`.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện chữ thay cho ô. Ô chỉ nhận chữ số, dấu `.` (và `:` khi
 * `withPort`); giá trị lưu đúng chuỗi người dùng thấy, khớp thẳng regex của Zod.
 * Lưu ý: khoảng 0–255 mỗi octet và cổng 1–65535 do Zod `ipv4Field()` / `ipv4WithPortField()` kiểm —
 * docs/rules/data/form-validation.md §3.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ mờ khi ô trống. Mặc định `0.0.0.0` (`0.0.0.0:8080` khi `withPort`).
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.withPort - `true` → nhận thêm `:cổng` sau địa chỉ. Mặc định `false`.
 *
 * @example
 * <IPAddressField name="host" label="Địa chỉ IP" required />
 *
 * <IPAddressField name="server" label="Máy chủ" withPort />
 */
function IPAddressField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  size = 'md',
  withPort = false,
}: IPAddressFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const { onChange } = field;

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {String(field.value ?? '')}
      </FieldReadOnly>
    );
  }

  const defaultPlaceholder = withPort ? '0.0.0.0:8080' : '0.0.0.0';

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      htmlFor={a11y.id}
      label={label}
      required={required}
    >
      <Input
        {...field}
        {...a11y.input}
        autoComplete="off"
        className="tabular-nums"
        disabled={disabled}
        inputMode="decimal"
        invalid={Boolean(error)}
        maxLength={withPort ? IP_WITH_PORT_MAX_LENGTH : IP_MAX_LENGTH}
        placeholder={placeholder ?? defaultPlaceholder}
        size={size}
        spellCheck={false}
        value={(field.value as string | undefined) ?? ''}
        onChange={(event) => onChange(keepIpCharacters(event.target.value, withPort))}
      />
    </FormItem>
  );
}

export default IPAddressField;

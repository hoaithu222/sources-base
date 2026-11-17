import Radio, { RadioGroup } from '@/shared/ui/inputs/Radio';
import { cn } from '@/shared/utils/style/cn';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface RadioOption {
  /** Giá trị ghi vào form khi chọn dòng này. */
  value: string;
  label: React.ReactNode;
  /** `true` → khoá riêng dòng này. */
  disabled?: boolean;
}

type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioGroupFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
  options: RadioOption[];
  orientation?: RadioGroupOrientation;
}

const RADIO_GROUP_BASE_CLASSES = 'flex gap-3';

const RADIO_GROUP_ORIENTATION_CLASSES = {
  vertical: 'flex-col',
  horizontal: 'min-h-9 flex-row flex-wrap items-center gap-x-4',
} satisfies Record<RadioGroupOrientation, string>;

/**
 * RadioGroupField — nhóm radio chọn MỘT giá trị (`string`), mọi lựa chọn hiện sẵn trên màn.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện nhãn của dòng đã chọn. Danh sách dài (> 5 dòng) →
 * `SelectField`.
 * Sửa giao diện: chiều xếp → `RADIO_GROUP_ORIENTATION_CLASSES`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `option.value`.
 * @param props.label - Nhãn phía trên nhóm; thành tên trợ năng của nhóm radio.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới nhóm; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.disabled - `true` → khoá cả nhóm.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.options - Các lựa chọn `{ value, label, disabled? }` (xem `RadioOption`).
 * @param props.orientation - Chiều xếp: `vertical` (dọc) | `horizontal` (ngang, tự xuống dòng). Mặc định
 *   `vertical`.
 *
 * @example
 * <RadioGroupField name="gender" label="Giới tính" options={GENDER_OPTIONS} orientation="horizontal" />
 */
function RadioGroupField({
  name,
  label,
  required,
  description,
  disabled,
  className,
  options,
  orientation = 'vertical',
}: RadioGroupFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const selected = options.find((o) => o.value === field.value);
  const focusTarget = selected ?? options.find((o) => !o.disabled);
  const { onChange, ref } = field;

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {selected?.label}
      </FieldReadOnly>
    );
  }

  const groupClassName = cn(RADIO_GROUP_BASE_CLASSES, RADIO_GROUP_ORIENTATION_CLASSES[orientation]);

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      label={label}
      required={required}
    >
      <RadioGroup
        {...a11y.trigger}
        className={groupClassName}
        disabled={disabled}
        value={field.value as string | undefined}
        onValueChange={(val) => onChange(val)}
      >
        {options.map((opt) => (
          <Radio
            key={opt.value}
            ref={opt === focusTarget ? ref : undefined}
            disabled={opt.disabled}
            label={opt.label}
            value={opt.value}
          />
        ))}
      </RadioGroup>
    </FormItem>
  );
}

export default RadioGroupField;

'use client';

import Dropdown from '@/shared/ui/selects/dropdown/Dropdown';
import type {
  DropdownOption,
  DropdownVariant,
  DropdownSize,
} from '@/shared/ui/selects/dropdown/dropdown.types';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface SelectFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options: DropdownOption[];
  searchable?: boolean;
  searchPlaceholder?: string;
  creatable?: boolean;
  clearable?: boolean;
  variant?: DropdownVariant;
  size?: DropdownSize;
  contentClassName?: string;
  metaClassName?: string;
}

/**
 * SelectField — chọn MỘT giá trị từ danh sách có sẵn, bọc `Dropdown` của UI kit và nối react-hook-form.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện nhãn của dòng đã chọn. Danh sách phải tải qua API theo từ
 * khoá → `AsyncSelectField`; chọn nhiều → `MultiSelectField`; vài lựa chọn nên thấy hết → `RadioGroupField`.
 * Lưu ý: giá trị form được ép về chuỗi (Radix so khớp `===` với `option.value`); `''` giữ nguyên để option
 * "Tất cả" `{ value: '' }` vẫn chọn được — docs/notes/components/form.md.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định theo ngôn ngữ (xem `Dropdown`).
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.options - Danh sách lựa chọn `{ value, label, … }` (xem `DropdownOption`).
 * @param props.searchable - `true` → ô tìm kiếm đầu panel. Mặc định `false`.
 * @param props.searchPlaceholder - Chữ mờ của ô tìm kiếm (khi `searchable`). Mặc định theo ngôn ngữ (xem `Dropdown`).
 * @param props.creatable - `true` → từ khoá chưa có trong danh sách hiện dòng "Tạo mới" (cần `searchable`).
 *   Mặc định `false`.
 * @param props.clearable - `true` → nút ✕ trên ô để bỏ chọn. Mặc định `false`.
 * @param props.variant - Dấu đánh dấu dòng đã chọn: `tick` | `radio`. Mặc định `tick`.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.contentClassName - Class cho PANEL thả xuống; option có `meta` dài thì ghim `w-*` /
 *   `max-w-*` ở đây (panel không có trần bề rộng).
 * @param props.metaClassName - Class cho cột `meta` của option; mặc định không co, không cắt — muốn "…"
 *   phải ghim bề rộng + `truncate`.
 *
 * @example
 * <SelectField name="dept" label="Phòng ban" options={DEPT_OPTIONS} searchable clearable />
 */
function SelectField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  options,
  searchable,
  searchPlaceholder,
  creatable,
  clearable,
  variant,
  size,
  contentClassName,
  metaClassName,
}: SelectFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });

  const value = field.value == null ? undefined : String(field.value);
  const { onChange, ref } = field;

  if (readOnly) {
    const selectedLabel = options.find((o) => o.value === value)?.label;
    return (
      <FieldReadOnly className={className} label={label}>
        {selectedLabel}
      </FieldReadOnly>
    );
  }

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      label={label}
      required={required}
    >
      <Dropdown
        ref={ref}
        {...a11y.trigger}
        clearable={clearable}
        contentClassName={contentClassName}
        creatable={creatable}
        disabled={disabled}
        invalid={Boolean(error)}
        metaClassName={metaClassName}
        options={options}
        placeholder={placeholder}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        size={size}
        value={value}
        variant={variant}
        onValueChange={(val) => onChange(val)}
      />
    </FormItem>
  );
}

export default SelectField;

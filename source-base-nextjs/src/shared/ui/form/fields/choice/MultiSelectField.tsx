'use client';

import MultiSelect from '@/shared/ui/selects/multi-select/MultiSelect';
import type {
  MultiSelectOption,
  MultiSelectSize,
} from '@/shared/ui/selects/multi-select/multi-select.types';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface MultiSelectFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  options: MultiSelectOption[];
  searchable?: boolean;
  size?: MultiSelectSize;
  maxDisplay?: number;
  selectAll?: boolean;
  selectAllLabel?: string;
}

/**
 * MultiSelectField — chọn NHIỀU giá trị từ danh sách, bọc `MultiSelect` của UI kit; giá trị form là `string[]`.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện các nhãn đã chọn, ngăn bằng dấu phẩy. Chọn một giá trị →
 * `SelectField`; vài lựa chọn bật / tắt độc lập → nhiều `CheckboxField`.
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `string[]`.
 * @param props.label - Nhãn phía trên ô; nối với ô để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới ô; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ khi chưa chọn gì. Mặc định theo ngôn ngữ (xem `MultiSelect`).
 * @param props.disabled - `true` → khoá ô.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.options - Danh sách lựa chọn `{ value, label, … }` (xem `MultiSelectOption`).
 * @param props.searchable - `true` → ô tìm kiếm đầu panel.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.maxDisplay - Số chip tối đa hiện trên ô, phần dư gộp thành "+N".
 * @param props.selectAll - `true` → dòng "Chọn tất cả" đầu panel (xem `MultiSelect.selectAll`).
 * @param props.selectAllLabel - Chữ của dòng chọn tất cả. Mặc định theo ngôn ngữ (xem `MultiSelect`).
 *
 * @example
 * <MultiSelectField name="tags" label="Nhãn" options={TAG_OPTIONS} searchable selectAll />
 */
function MultiSelectField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  options,
  searchable,
  size,
  maxDisplay,
  selectAll,
  selectAllLabel,
}: MultiSelectFieldProps) {
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const selectedValues = (field.value as string[] | undefined) ?? [];
  const { onChange, ref } = field;

  if (readOnly) {
    const labels = options
      .filter((o) => selectedValues.includes(o.value))
      .map((o) => o.label)
      .join(', ');
    return (
      <FieldReadOnly className={className} label={label}>
        {labels}
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
      <MultiSelect
        ref={ref}
        {...a11y.trigger}
        disabled={disabled}
        invalid={Boolean(error)}
        maxDisplay={maxDisplay}
        options={options}
        placeholder={placeholder}
        searchable={searchable}
        selectAll={selectAll}
        selectAllLabel={selectAllLabel}
        size={size}
        value={selectedValues}
        onValueChange={(vals) => onChange(vals)}
      />
    </FormItem>
  );
}

export default MultiSelectField;

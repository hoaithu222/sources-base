'use client';

import { useTranslations } from 'next-intl';
import { memo, useCallback, useState } from 'react';
import ColorPalettePanel from '@/shared/ui/inputs/ColorPalettePanel';
import { SelectChevron } from '@/shared/ui/selects/select-chevron';
import { FIELD_HEIGHT, fieldSurface } from '@/shared/ui/inputs/field.theme';
import Popover from '@/shared/ui/overlays/Popover';
import { cn } from '@/shared/utils/style/cn';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';
import { useFormField } from '../hooks/useFormField';

export interface ColorPickerFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
  preset?: readonly string[];
  usedColors?: readonly string[];
  showRandomSuggest?: boolean;
}

const COLOR_PICKER_TRIGGER_CLASSES = 'inline-flex items-center gap-2 px-3 enabled:cursor-pointer';

const COLOR_PICKER_SWATCH_CLASSES = 'size-4 shrink-0 rounded-full border border-border-strong';

const COLOR_PICKER_VALUE_CLASSES =
  'flex-1 text-left font-mono tabular-nums text-body-14 text-fg-heading';

const FALLBACK = '#06B6D4';
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const normalizeHex = (v: unknown): string => {
  if (typeof v === 'string' && HEX_RE.test(v)) return v.toUpperCase();
  return FALLBACK;
};

/**
 * ColorPickerField — chọn một màu hex nối react-hook-form: nút (chấm màu + mã hex) mở popover
 * `ColorPalettePanel`; giá trị form là chuỗi `#RRGGBB` viết hoa.
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện chấm màu + mã hex. Hex ở đây là DỮ LIỆU người dùng chọn
 * (ngoại lệ hợp lệ của luật cấm hex — docs/rules/styling/color-system.md §"Ngoại lệ").
 * Sửa giao diện: nút mở → `COLOR_PICKER_TRIGGER_CLASSES` · chấm màu → `COLOR_PICKER_SWATCH_CLASSES` ·
 * mã hex → `COLOR_PICKER_VALUE_CLASSES` · khung + dấu chọn → `field.theme` / `SelectChevron`.
 * Lưu ý: giá trị không phải hex 6 ký tự → nút hiện màu dự phòng `#06B6D4` (giá trị form không đổi tới khi chọn).
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form).
 * @param props.label - Nhãn phía trên nút; nối với nút để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới nút; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.disabled - `true` → khoá nút, không mở popover.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.preset - Danh sách hex trong lưới chọn. Mặc định 8 màu của `ColorPalettePanel`.
 * @param props.usedColors - Hex đã được bản ghi khác dùng → ô tương ứng trong lưới bị khoá.
 * @param props.showRandomSuggest - `true` → nút gợi ý màu ngẫu nhiên trong panel. Mặc định `false`.
 *
 * @example
 * <ColorPickerField name="color" label="Màu nhận diện" usedColors={takenColors} showRandomSuggest />
 */
const ColorPickerField = memo(function ColorPickerField({
  name,
  label,
  required,
  description,
  disabled,
  className,
  preset,
  usedColors,
  showRandomSuggest,
}: ColorPickerFieldProps) {
  const t = useTranslations('ui.form');
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const [open, setOpen] = useState(false);

  const value = normalizeHex(field.value);

  const commit = useCallback((hex: string) => field.onChange(hex.toUpperCase()), [field]);

  const swatch = (
    <span className={COLOR_PICKER_SWATCH_CLASSES} style={{ backgroundColor: value }} />
  );

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        <span className="flex items-center gap-2">
          {swatch}
          <span className="font-mono tabular-nums">{value}</span>
        </span>
      </FieldReadOnly>
    );
  }

  const triggerClassName = cn(
    fieldSurface({ focusMode: 'trigger', invalid: Boolean(error), disabled }),
    COLOR_PICKER_TRIGGER_CLASSES,
    FIELD_HEIGHT.md,
  );

  const popoverContent = (
    <div className="w-64 p-3">
      <ColorPalettePanel
        preset={preset}
        showRandomSuggest={showRandomSuggest}
        usedColors={usedColors}
        value={value}
        onChange={commit}
      />
    </div>
  );

  return (
    <FormItem
      {...a11y.item}
      className={className}
      description={description}
      error={error}
      label={label}
      required={required}
    >
      <Popover
        align="start"
        content={popoverContent}
        disabled={disabled}
        open={open}
        side="bottom"
        sideOffset={4}
        variant="glass"
        onOpenChange={setOpen}
      >
        <button
          ref={field.ref}
          {...a11y.trigger}
          aria-label={label ? undefined : t('colorPicker.aria')}
          className={triggerClassName}
          disabled={disabled}
          type="button"
        >
          {swatch}
          <span className={COLOR_PICKER_VALUE_CLASSES}>{value}</span>
          <SelectChevron />
        </button>
      </Popover>
    </FormItem>
  );
});

export default ColorPickerField;

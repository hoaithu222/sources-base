import { SystemIcon } from '@/shared/ui/icons/Icons';
import { cn } from '@/shared/utils/style/cn';
import { FIELD_ICON_CLASS } from '@/shared/ui/inputs/field.theme';

interface SelectChevronProps {
  className?: string;
}

/** Chevron lên-xuống TĨNH (nút pop-up macOS) — đứng yên cả khi panel mở. */
const SELECT_CHEVRON_ICON_CLASSES = cn(FIELD_ICON_CLASS, 'size-auto');

/**
 * SelectChevron — dấu "bấm để chọn" ở cuối trigger chọn (Dropdown · MultiSelect · DropdownTreeSelect ·
 * AsyncSelectField · ColorPickerField).
 *
 * Helper NỘI BỘ của UI kit. Chevron lên-xuống tĩnh như nút pop-up macOS — nhìn là biết ô này mở ra một danh
 * sách, không nhầm với ô gõ. Một icon cho cả hai theme (màu theo `FIELD_ICON_CLASS`).
 *
 * @param props.className - Class thêm cho khung ngoài (vd `self-center` khi trigger nhiều dòng chip).
 *
 * @example
 * <SelectPrimitive.Icon>
 *   <SelectChevron />
 * </SelectPrimitive.Icon>
 */
export function SelectChevron({ className }: SelectChevronProps) {
  return (
    <span aria-hidden className={cn('inline-flex shrink-0', className)}>
      <span className={SELECT_CHEVRON_ICON_CLASSES}>
        <SystemIcon name="chevrons-up-down-bold" size={12} />
      </span>
    </span>
  );
}

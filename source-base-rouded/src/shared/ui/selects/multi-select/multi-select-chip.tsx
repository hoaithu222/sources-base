import { SystemIcon } from '@/shared/ui/icons/Icons';
import { FIELD_CHIP_CLEAR_CLASS, FIELD_CLEAR_ICON } from '@/shared/ui/inputs/field.theme';
import Badge from '@/shared/ui/primitives/Badge';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import type { MultiSelectOption } from './multi-select.types';

interface MultiSelectChipProps {
  option: MultiSelectOption;
  disabled?: boolean;
  onToggle: (value: string, checked: boolean) => void;
}

const MULTI_SELECT_CHIP_CLASSES = 'min-w-0 max-w-full animate-pop-in motion-reduce:animate-none';

/**
 * MultiSelectChip — chip một giá trị đã chọn trên trigger `MultiSelect` (xám trung tính), kèm ✕ gỡ riêng giá
 * trị đó.
 *
 * Phần con NỘI BỘ của MultiSelect. Chip hẹp thì nhãn cắt "…" thay vì xuống dòng.
 * Sửa giao diện: chip → `MULTI_SELECT_CHIP_CLASSES` · nút ✕ → `FIELD_CHIP_CLEAR_CLASS` (field.theme).
 * Lưu ý: ✕ là `<span role="button">` (không lồng `<button>` trong trigger), chặn lan `click` lẫn
 * `pointerdown` để không mở popover.
 *
 * @param props.option - Giá trị đã chọn (`MultiSelectOption`).
 * @param props.disabled - `true` → ẩn ✕ (MultiSelect đang khoá). Mặc định `false`.
 * @param props.onToggle - Gọi `onToggle(option.value, false)` khi bấm ✕.
 *
 * @example
 * <MultiSelectChip option={{ value: 'a', label: 'Alpha' }} onToggle={toggle} />
 */
function MultiSelectChip({ option, disabled = false, onToggle }: MultiSelectChipProps) {
  const removeButton = disabled ? undefined : (
    <span
      aria-label={`Bỏ chọn ${option.label}`}
      className={FIELD_CHIP_CLEAR_CLASS}
      role="button"
      tabIndex={-1}
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();
        onToggle(option.value, false);
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.chip} />
    </span>
  );

  return (
    <Badge
      className={MULTI_SELECT_CHIP_CLASSES}
      color="neutral"
      endIcon={removeButton}
      variant="tinted"
    >
      <span className={TEXT_ELLIPSIS_CLASSES}>{option.label}</span>
    </Badge>
  );
}

export default MultiSelectChip;

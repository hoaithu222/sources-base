import * as SelectPrimitive from '@radix-ui/react-select';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { SelectChevron } from '@/shared/ui/selects/select-chevron';
import { FIELD_CLEAR_BUTTON_CLASS, FIELD_CLEAR_ICON } from '@/shared/ui/inputs/field.theme';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import DropdownOptionDot from './dropdown-option-dot';
import { DROPDOWN_TONE_CLASSES } from '../dropdown.theme';
import type { DropdownOption } from '../dropdown.types';

interface DropdownValueProps {
  selectedLabel: string;
  selectedOption?: DropdownOption;
  placeholder: string;
  showClear: boolean;
  onClear: () => void;
}

/**
 * DropdownValue — ruột trigger của `Dropdown`: chấm màu · nhãn hoặc placeholder · ✕ xoá · dấu chọn
 * `SelectChevron` (chevron lên-xuống của nút pop-up).
 *
 * Phần con NỘI BỘ, đặt trong `SelectPrimitive.Trigger`; Dropdown truyền sẵn nhãn đã tính.
 * Lưu ý: ✕ bắt ở cả `pointerdown` lẫn `click` và chặn lan lên trigger để không mở panel.
 *
 * @param props.selectedLabel - Chữ hiện trên trigger; rỗng → hiện `placeholder`.
 * @param props.selectedOption - Option đang chọn (lấy chấm màu và màu tone); `undefined` khi chưa chọn.
 * @param props.placeholder - Chữ khi chưa chọn.
 * @param props.showClear - `true` → hiện ✕ "Xoá lựa chọn".
 * @param props.onClear - Gọi khi bấm ✕.
 *
 * @example
 * <DropdownValue placeholder="Chọn" selectedLabel="Alpha" showClear onClear={clear} />
 */
function DropdownValue({
  selectedLabel,
  selectedOption,
  placeholder,
  showClear,
  onClear,
}: DropdownValueProps) {
  const tone = selectedOption?.tone && DROPDOWN_TONE_CLASSES[selectedOption.tone];

  const clear = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onClear();
  };

  return (
    <>
      {selectedLabel && selectedOption?.dotColor !== undefined && (
        <DropdownOptionDot color={selectedOption.dotColor} shape={selectedOption.dotShape} />
      )}
      <span className={cn('flex-1', TEXT_ELLIPSIS_CLASSES, tone && tone.text)}>
        {selectedLabel || <span className="text-fg-faint">{placeholder}</span>}
      </span>
      {showClear && (
        <span
          aria-label="Xoá lựa chọn"
          className={FIELD_CLEAR_BUTTON_CLASS}
          role="button"
          tabIndex={-1}
          onClick={clear}
          onPointerDown={clear}
        >
          <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.all} />
        </span>
      )}
      <SelectPrimitive.Icon>
        <SelectChevron />
      </SelectPrimitive.Icon>
    </>
  );
}

export default DropdownValue;

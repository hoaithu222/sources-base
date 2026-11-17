'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Badge from '@/shared/ui/primitives/Badge';
import { FIELD_CLEAR_ICON } from '@/shared/ui/inputs/field.theme';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import DropdownOptionDot from './dropdown-option-dot';
import {
  DROPDOWN_ITEM_CHECK_CLASSES,
  DROPDOWN_ITEM_CLASSES,
  DROPDOWN_ITEM_CLEAR_CLASSES,
  DROPDOWN_ITEM_ICON_CLASSES,
  DROPDOWN_ITEM_META_CLASSES,
  DROPDOWN_RADIO_DOT_CLASSES,
  DROPDOWN_RADIO_RING_CLASSES,
  DROPDOWN_TONE_CLASSES,
} from '../dropdown.theme';
import type { DropdownOption, DropdownVariant } from '../dropdown.types';
import { toRadix } from '../dropdown.utils';

interface DropdownItemProps {
  option: DropdownOption;
  variant: DropdownVariant;
  hidden: boolean;
  metaClassName?: string;
  showClear: boolean;
  onClear: () => void;
}

/**
 * DropdownItem — một dòng option của `Dropdown` (chấm màu · icon · badge · nhãn · meta · ✕ · dấu chọn).
 *
 * Phần con NỘI BỘ của Dropdown, dựng trên `SelectPrimitive.Item`; chỉ render khi panel mở.
 * Sửa giao diện: dòng → `DROPDOWN_ITEM_CLASSES` · màu theo tone → `DROPDOWN_TONE_CLASSES` (dropdown.theme.ts).
 * Lưu ý: option không khớp từ khoá truyền `hidden` (ẩn + disabled), KHÔNG unmount — search-matching.md §4.
 *
 * @param props.option - Dữ liệu dòng (`DropdownOption`).
 * @param props.variant - Dấu chọn: `tick` (✓) | `radio` (vòng tròn).
 * @param props.hidden - `true` → ẩn dòng và chặn chọn (không khớp từ khoá tìm kiếm).
 * @param props.metaClassName - Class thêm cho chữ `meta` căn phải.
 * @param props.showClear - `true` → hiện ✕ "Gỡ lựa chọn" trên dòng (chế độ `clearInList`).
 * @param props.onClear - Gọi khi bấm ✕ (bắt ở pointer-down, trước khi Radix chốt lựa chọn).
 *
 * @example
 * <DropdownItem option={option} variant="tick" hidden={false} showClear={false} onClear={clear} />
 */
function DropdownItem({
  option,
  variant,
  hidden,
  metaClassName,
  showClear,
  onClear,
}: DropdownItemProps) {
  const t = useTranslations('ui.selects');
  const tone = option.tone && DROPDOWN_TONE_CLASSES[option.tone];

  const itemClassName = cn(DROPDOWN_ITEM_CLASSES, tone && tone.item, hidden && 'hidden');
  const iconClassName = cn(DROPDOWN_ITEM_ICON_CLASSES, tone && 'text-current');
  const checkClassName = cn(DROPDOWN_ITEM_CHECK_CLASSES, tone && tone.check);
  const metaClassNames = cn(DROPDOWN_ITEM_META_CLASSES, metaClassName);

  return (
    <SelectPrimitive.Item
      className={itemClassName}
      disabled={option.disabled || hidden}
      value={toRadix(option.value)}
    >
      {option.dotColor !== undefined && (
        <DropdownOptionDot color={option.dotColor} shape={option.dotShape} />
      )}
      {option.icon && <SystemIcon className={iconClassName} name={option.icon} size={12} />}
      {option.badge && (
        <Badge className="shrink-0" color="neutral" variant="tinted">
          {option.badge}
        </Badge>
      )}
      <SelectPrimitive.ItemText asChild>
        <span className={cn('flex-1', TEXT_ELLIPSIS_CLASSES)} title={option.label}>
          {option.label}
        </span>
      </SelectPrimitive.ItemText>

      {option.meta && (
        <span className={metaClassNames} title={option.meta}>
          {option.meta}
        </span>
      )}

      {showClear && (
        <span
          aria-label={t('dropdown.removeSelection')}
          className={DROPDOWN_ITEM_CLEAR_CLASSES}
          role="button"
          tabIndex={-1}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClear();
          }}
        >
          <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.chip} />
        </span>
      )}

      {variant === 'radio' ? (
        <span className={DROPDOWN_RADIO_RING_CLASSES}>
          <SelectPrimitive.ItemIndicator>
            <span className={DROPDOWN_RADIO_DOT_CLASSES} />
          </SelectPrimitive.ItemIndicator>
        </span>
      ) : (
        <SelectPrimitive.ItemIndicator>
          <SystemIcon className={checkClassName} name="check-outline" size={12} />
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  );
}

export default DropdownItem;

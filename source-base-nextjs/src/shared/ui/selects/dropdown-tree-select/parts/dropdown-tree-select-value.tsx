'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import Badge from '@/shared/ui/primitives/Badge';
import { SelectChevron } from '@/shared/ui/selects/select-chevron';
import {
  FIELD_CHIP_CLEAR_CLASS,
  FIELD_CLEAR_BUTTON_CLASS,
  FIELD_CLEAR_ICON,
} from '@/shared/ui/inputs/field.theme';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { DROPDOWN_TREE_SELECT_CHIP_CLASSES } from '../dropdown-tree-select.theme';
import type { SelectedLabel } from '../dropdown-tree-select.utils';

interface DropdownTreeSelectValueProps {
  multi: boolean;
  labels: SelectedLabel[];
  placeholder: string;
  clearable: boolean;
  disabled?: boolean;
  maxDisplay?: number;
  onRemove: (id: string) => void;
  onClear: (event: React.MouseEvent) => void;
}

/**
 * DropdownTreeSelectValue — ruột trigger của `DropdownTreeSelect`: placeholder · nhãn đơn hoặc chip
 * (`multi`) · ✕ xoá · dấu chevron chọn (`SelectChevron`).
 *
 * Phần con NỘI BỘ, đặt trong `Popover.Trigger`.
 * Lưu ý: mọi ✕ là `<span role="button">` (không lồng `<button>` trong trigger), chặn lan ở `pointerdown`
 * để không mở panel.
 *
 * @param props.multi - `true` → hiện chip từng node đã chọn; `false` → một dòng nhãn.
 * @param props.labels - Node đã chọn `{ id, label }[]` theo thứ tự trong cây.
 * @param props.placeholder - Chữ khi chưa chọn.
 * @param props.clearable - `true` → hiện ✕ "Xoá lựa chọn" khi có lựa chọn.
 * @param props.disabled - `true` → ẩn mọi ✕ (chip lẫn xoá tất cả). Mặc định `false`.
 * @param props.maxDisplay - Số chip tối đa, phần dư gộp "+N"; bỏ trống = hiện hết (xuống dòng).
 * @param props.onRemove - Gọi với `id` khi bấm ✕ trên chip.
 * @param props.onClear - Gọi khi bấm ✕ xoá tất cả.
 *
 * @example
 * <DropdownTreeSelectValue clearable labels={labels} multi placeholder="Chọn" onClear={clear}
 *   onRemove={remove} />
 */
const DropdownTreeSelectValue = memo(function DropdownTreeSelectValue({
  multi,
  labels,
  placeholder,
  clearable,
  disabled = false,
  maxDisplay,
  onRemove,
  onClear,
}: DropdownTreeSelectValueProps) {
  const t = useTranslations('ui.selects');
  const hasSelection = labels.length > 0;

  const visibleLabels = maxDisplay != null ? labels.slice(0, maxDisplay) : labels;
  const overflowCount = maxDisplay != null ? Math.max(0, labels.length - maxDisplay) : 0;

  const renderRemove = (item: SelectedLabel) =>
    disabled ? undefined : (
      <span
        aria-label={t('shared.deselect', { label: item.label })}
        className={FIELD_CHIP_CLEAR_CLASS}
        role="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(item.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.chip} />
      </span>
    );

  const renderSelection = () => {
    if (!hasSelection)
      return (
        <span className={cn('flex-1 text-fg-faint', TEXT_ELLIPSIS_CLASSES)}>{placeholder}</span>
      );
    if (!multi)
      return <span className={cn('flex-1', TEXT_ELLIPSIS_CLASSES)}>{labels[0].label}</span>;
    return (
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
        {visibleLabels.map((item) => (
          <Badge
            key={item.id}
            className={DROPDOWN_TREE_SELECT_CHIP_CLASSES}
            color="neutral"
            endIcon={renderRemove(item)}
            variant="tinted"
          >
            <span className={TEXT_ELLIPSIS_CLASSES}>{item.label}</span>
          </Badge>
        ))}
        {overflowCount > 0 && (
          <Badge className="shrink-0" color="neutral" variant="tinted">
            +{overflowCount}
          </Badge>
        )}
      </span>
    );
  };

  return (
    <>
      {renderSelection()}

      {clearable && hasSelection && !disabled && (
        <span
          aria-label={t('shared.clearSelection')}
          className={cn(FIELD_CLEAR_BUTTON_CLASS, 'self-center')}
          role="button"
          tabIndex={-1}
          onClick={onClear}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.all} />
        </span>
      )}
      <SelectChevron className="self-center" />
    </>
  );
});

export default DropdownTreeSelectValue;

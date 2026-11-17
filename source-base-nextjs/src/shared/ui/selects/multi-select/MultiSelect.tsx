'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { useDebounce, useImeSafeSearchInput } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import { SelectChevron } from '@/shared/ui/selects/select-chevron';
import {
  FIELD_CLEAR_BUTTON_CLASS,
  FIELD_CLEAR_ICON,
  FIELD_POPUP_EMPTY_CLASS,
  FIELD_POPUP_LIST_CLASS,
  FIELD_POPUP_SEARCH_CLASS,
  FIELD_POPUP_SEARCH_ICON_CLASS,
  FIELD_POPUP_SEARCH_INPUT_CLASS,
  fieldSurface,
} from '@/shared/ui/inputs/field.theme';
import Checkbox from '@/shared/ui/inputs/Checkbox';
import Badge from '@/shared/ui/primitives/Badge';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import MultiSelectChip from './multi-select-chip';
import {
  MULTI_SELECT_ALL_ROW_CLASSES,
  MULTI_SELECT_CHIPS_CLASSES,
  MULTI_SELECT_CONTENT_CLASSES,
  MULTI_SELECT_ITEM_CLASSES,
  MULTI_SELECT_SIZE_CLASSES,
  MULTI_SELECT_TRIGGER_BASE_CLASSES,
} from './multi-select.theme';
import type { MultiSelectProps } from './multi-select.types';
import { useMultiSelectSelection } from './useMultiSelectSelection';

/**
 * MultiSelect — chọn NHIỀU giá trị từ danh sách: popover có checkbox, chip trên trigger, tìm kiếm.
 *
 * Chọn MỘT giá trị → `Dropdown`; dữ liệu dạng cây → `DropdownTreeSelect`. Trong form dùng
 * `MultiSelectField` (đã nối nhãn, lỗi, `aria-*`).
 * Sửa giao diện: trigger / panel / dòng → `multi-select.theme.ts` · chip → `multi-select-chip.tsx`
 * · lọc + chọn tất cả → `useMultiSelectSelection.ts`.
 * Lưu ý: popover non-modal (không lồng 2 lớp modal trong Dialog) nên cuộn chuột trong danh sách do
 * listener `wheel` riêng xử lý. Lý do thiết kế: docs/notes/components/selects.md (## MultiSelect).
 *
 * @param props.options - Danh sách lựa chọn `MultiSelectOption[]` (`value` · `label` · `disabled`).
 * @param props.value - Các `value` đang chọn (controlled). Mặc định `[]`.
 * @param props.size - Cao TỐI THIỂU của trigger: `sm` 32px | `md` 36px | `lg` 40px (chip xuống dòng
 *   thì cao thêm). Mặc định `md`.
 * @param props.placeholder - Chữ khi chưa chọn (và luôn hiện khi `hideChips`). Mặc định theo ngôn ngữ
 *   (`ui.selects` → `shared.placeholder`).
 * @param props.maxDisplay - Số chip tối đa hiện trên trigger, phần dư gộp "+N" (một hàng, không xuống
 *   dòng); bỏ trống = hiện hết, xuống dòng.
 * @param props.hideChips - `true` → không hiện chip, trigger luôn hiện `placeholder`. Mặc định `false`.
 * @param props.searchable - `true` → ô tìm kiếm đầu panel (khớp bỏ dấu trên `label`). Mặc định `false`.
 * @param props.searchPlaceholder - Gợi ý trong ô tìm kiếm. Mặc định theo ngôn ngữ (`ui.selects` → `shared.searchPlaceholder`).
 * @param props.searchDebounce - Độ trễ lọc khi gõ (ms); `0` = lọc ngay. Mặc định `300`.
 * @param props.selectAll - `true` → dòng "Chọn tất cả" 3 trạng thái; khi đang lọc chỉ tác động mục
 *   ĐANG HIỂN THỊ (bỏ `disabled`), lựa chọn ngoài bộ lọc giữ nguyên. Mặc định `false`.
 * @param props.selectAllLabel - Nhãn dòng chọn tất cả (tự thêm số mục "(N)"). Mặc định theo ngôn ngữ (`ui.common` → `selectAll`).
 * @param props.clearable - `true` → ✕ "Bỏ chọn tất cả" trên trigger khi có lựa chọn, gọi
 *   `onValueChange([])`. Mặc định `false`.
 * @param props.disabled - Khoá: không mở popover, ẩn mọi ✕ (chip lẫn xoá tất cả).
 * @param props.invalid - `true` → viền đỏ + `aria-invalid` trên trigger.
 * @param props.side - Phía bung panel: `top` | `right` | `bottom` | `left`. Mặc định `bottom`.
 * @param props.align - Căn panel theo trigger: `start` | `center` | `end`. Mặc định `start`.
 * @param props.defaultOpen - Mở sẵn popover khi mount (uncontrolled).
 * @param props.open - Điều khiển đóng / mở TỪ NGOÀI (controlled); bỏ trống = uncontrolled.
 * @param props.onOpenChange - Gọi khi popover muốn đóng / mở.
 * @param props.onValueChange - Gọi với mảng `value` mới mỗi lần tick / bỏ tick / gỡ chip / xoá tất cả.
 * @param props.className - Class thêm cho trigger.
 * @param props.contentClassName - Class thêm cho panel.
 * @param props.id - Gắn lên trigger để `<label htmlFor>` bên ngoài trỏ tới.
 * @param props.aria-labelledby - Gắn lên trigger, trỏ tới nhãn NGOÀI.
 * @param props.aria-describedby - Gắn lên trigger, trỏ tới dòng mô tả / lỗi.
 * @param props.aria-invalid - Ghi đè `aria-invalid` của trigger. Mặc định theo `invalid`.
 * @param props.ref - Trỏ tới `<button>` trigger (React 19: `ref` là prop thường).
 *
 * @example
 * <MultiSelect options={TAG_OPTIONS} value={tags} onValueChange={setTags} searchable selectAll clearable />
 *
 * <MultiSelect maxDisplay={2} options={TEAM_OPTIONS} size="sm" value={teamIds} onValueChange={setTeamIds} />
 */
function MultiSelect({
  options,
  value = [],
  size = 'md',
  placeholder,
  maxDisplay,
  hideChips = false,
  searchable = false,
  searchPlaceholder,
  searchDebounce = 300,
  selectAll = false,
  selectAllLabel,
  clearable = false,
  disabled,
  invalid,
  side = 'bottom',
  align = 'start',
  defaultOpen,
  open,
  onOpenChange,
  onValueChange,
  className,
  contentClassName,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ref,
}: MultiSelectProps) {
  const t = useTranslations('ui.selects');
  const tCommon = useTranslations('ui.common');
  const [search, setSearch] = useState('');
  const { inputProps: searchInputProps } = useImeSafeSearchInput(search, setSearch);
  const debouncedSearch = useDebounce(search, searchDebounce);

  const attachWheelScroll = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      node.scrollTop += event.deltaY;
      event.preventDefault();
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, []);

  const {
    filteredOptions,
    selectedOptions,
    visibleSelected,
    overflowCount,
    toggle,
    selectableValues,
    allSelected,
    someSelected,
    toggleAll,
  } = useMultiSelectSelection({
    options,
    value,
    onValueChange,
    searchable,
    debouncedSearch,
    maxDisplay,
  });

  const chipElements = useMemo(
    () =>
      visibleSelected.map((option) => (
        <MultiSelectChip key={option.value} disabled={disabled} option={option} onToggle={toggle} />
      )),
    [visibleSelected, disabled, toggle],
  );

  const optionElements = filteredOptions.map((option) => (
    <label
      key={option.value}
      className={MULTI_SELECT_ITEM_CLASSES}
      data-disabled={option.disabled || undefined}
    >
      <Checkbox
        checked={value.includes(option.value)}
        disabled={option.disabled}
        label={option.label}
        onCheckedChange={(nextChecked) => toggle(option.value, nextChecked === true)}
      />
    </label>
  ));

  const triggerClassName = cn(
    MULTI_SELECT_TRIGGER_BASE_CLASSES,
    MULTI_SELECT_SIZE_CLASSES[size],
    fieldSurface({ focusMode: 'trigger', invalid, disabled }),
    className,
  );
  const panelClassName = cn(MULTI_SELECT_CONTENT_CLASSES, contentClassName);
  const chipsClassName = MULTI_SELECT_CHIPS_CLASSES[maxDisplay != null ? 'nowrap' : 'wrap'];

  return (
    <PopoverPrimitive.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger
        ref={ref}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid ?? (invalid || undefined)}
        aria-labelledby={ariaLabelledBy}
        className={triggerClassName}
        disabled={disabled}
        id={id}
      >
        {hideChips || selectedOptions.length === 0 ? (
          <span className={cn('flex-1 text-fg-faint', TEXT_ELLIPSIS_CLASSES)}>
            {placeholder ?? t('shared.placeholder')}
          </span>
        ) : (
          <span className={chipsClassName}>
            {chipElements}
            {overflowCount > 0 && (
              <Badge className="shrink-0" color="neutral" variant="tinted">
                +{overflowCount}
              </Badge>
            )}
          </span>
        )}
        {clearable && value.length > 0 && !disabled && (
          <span
            aria-label={t('multiSelect.clearAll')}
            className={cn(FIELD_CLEAR_BUTTON_CLASS, 'self-center')}
            role="button"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onValueChange?.([]);
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <SystemIcon name="xmark-outline" size={FIELD_CLEAR_ICON.all} />
          </span>
        )}
        <SelectChevron className="self-center" />
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align={align}
          className={panelClassName}
          collisionPadding={8}
          side={side}
          sideOffset={4}
        >
          {searchable && (
            <div className={FIELD_POPUP_SEARCH_CLASS}>
              <SystemIcon
                className={FIELD_POPUP_SEARCH_ICON_CLASS}
                name="magnifying-glass-outline"
                size={14}
              />
              <input
                {...searchInputProps}
                className={FIELD_POPUP_SEARCH_INPUT_CLASS}
                placeholder={searchPlaceholder ?? t('shared.searchPlaceholder')}
                type="text"
              />
            </div>
          )}

          {selectAll && filteredOptions.length > 0 && (
            <label className={MULTI_SELECT_ALL_ROW_CLASSES}>
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                label={`${selectAllLabel ?? tCommon('selectAll')} (${selectableValues.length})`}
                onCheckedChange={(next) => toggleAll(next === true)}
              />
            </label>
          )}

          <div
            ref={attachWheelScroll}
            className={cn(
              'max-h-[min(300px,calc(var(--radix-popper-available-height,380px)-5rem))] overflow-auto',
              FIELD_POPUP_LIST_CLASS,
            )}
          >
            {optionElements}

            {filteredOptions.length === 0 && (
              <div className={FIELD_POPUP_EMPTY_CLASS}>{t('shared.empty')}</div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export default MultiSelect;

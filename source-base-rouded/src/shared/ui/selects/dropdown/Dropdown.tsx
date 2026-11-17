import { useCallback, useMemo, useState } from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import {
  FIELD_HEIGHT,
  FIELD_POPUP_EMPTY_CLASS,
  FIELD_POPUP_LIST_CLASS,
  FIELD_POPUP_SEARCH_CLASS,
  FIELD_POPUP_SEARCH_ICON_CLASS,
  FIELD_POPUP_SEARCH_INPUT_CLASS,
  fieldSurface,
} from '@/shared/ui/inputs/field.theme';
import { useDebounce, useImeSafeSearchInput } from '@/shared/hooks';
import { cn } from '@/shared/utils/style/cn';
import DropdownItem from './parts/dropdown-item';
import DropdownValue from './parts/dropdown-value';
import { DROPDOWN_CONTENT_CLASSES, DROPDOWN_TRIGGER_BASE_CLASSES } from './dropdown.theme';
import type { DropdownProps } from './dropdown.types';
import { fromRadix, toRadix } from './dropdown.utils';
import { useDropdownOptions } from './hooks/useDropdownOptions';
import { useDropdownSearchFocus } from './hooks/useDropdownSearchFocus';

/**
 * Dropdown — chọn MỘT giá trị từ danh sách (Radix Select); có ô tìm kiếm, tạo mới, nút xoá.
 *
 * Chọn nhiều → `MultiSelect`; dữ liệu dạng cây → `DropdownTreeSelect`; menu thao tác (không chọn
 * giá trị) → `Menu`. Trong form dùng `SelectField` (đã nối nhãn, lỗi, `aria-*`).
 * Sửa giao diện: trigger / panel / dòng / màu tone → `dropdown.theme.ts` · lọc + nhãn trigger →
 * `hooks/useDropdownOptions.ts` · ruột trigger → `parts/dropdown-value.tsx` · dòng → `parts/dropdown-item.tsx`.
 * Lưu ý: KHÔNG gỡ 3 lớp giữ focus ô tìm kiếm (`useDropdownSearchFocus`) — search-matching.md §4.
 * Không truyền cả `value` lẫn `defaultValue` = ô controlled RỖNG: chọn chỉ gọi `onValueChange`, không tự
 * tick; muốn Dropdown tự giữ lựa chọn thì truyền `defaultValue` (kể cả `''`).
 * Trigger có `min-w-[180px]`: ô bảng hẹp thêm `className="min-w-0"` — search-matching.md §5.
 * Lý do thiết kế: docs/notes/components/selects.md (## Dropdown).
 *
 * @param props.options - Danh sách lựa chọn `DropdownOption[]` (`value` · `label` · `disabled` · `icon` ·
 *   `badge` · `meta` · `tone` · `dotColor` / `dotShape`).
 * @param props.value - Giá trị đang chọn (controlled). `''` hoặc `undefined` = chưa chọn.
 * @param props.defaultValue - Giá trị khởi tạo khi KHÔNG truyền `value` (uncontrolled): Dropdown tự giữ
 *   lựa chọn, nhãn trigger và nút ✕ đọc theo giá trị nội bộ đó.
 * @param props.variant - Dấu chọn trên dòng: `tick` (✓ cuối dòng) | `radio` (vòng tròn). Mặc định `tick`.
 * @param props.size - Cao trigger: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 * @param props.placeholder - Chữ khi chưa chọn. Mặc định `'Chọn'`.
 * @param props.triggerDisplay - Trigger hiện gì của option đang chọn: `label` | `badge` | `meta` (thiếu
 *   thì lùi về `label`). Mặc định `label`.
 * @param props.searchable - `true` → ô tìm kiếm đầu panel (khớp bỏ dấu trên label · badge · meta,
 *   không khớp `value`). Mặc định `false`.
 * @param props.searchPlaceholder - Gợi ý trong ô tìm kiếm. Mặc định `'Tìm kiếm...'`.
 * @param props.searchDebounce - Độ trễ lọc khi gõ (ms); `0` = lọc ngay. Mặc định `300`.
 * @param props.creatable - `true` → từ khoá chưa có trong danh sách hiện dòng "Tạo mới" (cần
 *   `searchable`); chọn dòng đó gọi `onValueChange(từ khoá)`. Mặc định `false`.
 * @param props.createLabel - Nhãn dòng tạo mới theo từ khoá. Mặc định `` q => `Tạo mới: "${q}"` ``.
 * @param props.clearable - `true` → ✕ trên trigger khi đã chọn (ẩn khi `disabled`), bấm gọi
 *   `onValueChange('')`. Mặc định `false`.
 * @param props.clearInList - `true` → đặt ✕ trên dòng đang chọn trong danh sách thay cho ✕ ở trigger
 *   (ô trong bảng). Mặc định `false`.
 * @param props.disabled - Khoá: không mở panel, ẩn ✕.
 * @param props.invalid - `true` → viền đỏ + `aria-invalid` trên trigger.
 * @param props.side - Phía bung panel: `top` | `right` | `bottom` | `left`. Mặc định `bottom`.
 * @param props.align - Căn panel theo trigger: `start` | `center` | `end`. Mặc định `start`.
 * @param props.onValueChange - Gọi với `value` mới khi chọn; `''` khi xoá.
 * @param props.className - Class thêm cho trigger (vd `min-w-0`, `w-40`).
 * @param props.contentClassName - Class thêm cho panel (vd `max-w-80`).
 * @param props.metaClassName - Class thêm cho chữ `meta` căn phải của mỗi dòng.
 * @param props.id - Gắn lên trigger để `<label htmlFor>` bên ngoài trỏ tới.
 * @param props.aria-labelledby - Gắn lên trigger, trỏ tới nhãn NGOÀI.
 * @param props.aria-describedby - Gắn lên trigger, trỏ tới dòng mô tả / lỗi.
 * @param props.aria-invalid - Ghi đè `aria-invalid` của trigger. Mặc định theo `invalid`.
 * @param props.ref - Trỏ tới `<button>` trigger (React 19: `ref` là prop thường).
 *
 * @example
 * <Dropdown options={STATUS_OPTIONS} value={status} onValueChange={setStatus} searchable clearable />
 *
 * <Dropdown defaultValue="vn" options={COUNTRY_OPTIONS} size="sm" variant="radio" />
 */
function Dropdown({
  options,
  value,
  defaultValue,
  variant = 'tick',
  size = 'md',
  placeholder = 'Chọn',
  triggerDisplay = 'label',
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  searchDebounce = 300,
  creatable = false,
  createLabel,
  clearable = false,
  clearInList = false,
  disabled,
  invalid,
  side = 'bottom',
  align = 'start',
  onValueChange,
  className,
  contentClassName,
  metaClassName,
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  ref,
}: DropdownProps) {
  const [search, setSearch] = useState('');
  const { inputProps: searchInputProps } = useImeSafeSearchInput(search, setSearch);
  const debouncedSearch = useDebounce(search, searchDebounce);
  const [open, setOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isUncontrolled = value === undefined && defaultValue !== undefined;
  const currentValue = isUncontrolled ? uncontrolledValue : value;

  const { matchCount, selectedOption, selectedLabel, createOption, renderedOptions } =
    useDropdownOptions({
      options,
      value: currentValue,
      creatable,
      searchable,
      debouncedSearch,
      triggerDisplay,
      createLabel,
    });

  const {
    contentRef,
    handleContentFocus,
    handleContentKeyDown,
    handleSearchKeyDown,
    resetFocusClaim,
  } = useDropdownSearchFocus({
    open,
    searchable,
    searchInputRef: searchInputProps.ref,
    setSearch,
  });

  const changeValue = useCallback(
    (next: string) => {
      if (isUncontrolled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isUncontrolled, onValueChange],
  );

  const optionElements = useMemo(
    () =>
      !open
        ? null
        : renderedOptions.map(({ option, hidden }) => (
            <DropdownItem
              key={option.value}
              hidden={hidden}
              metaClassName={metaClassName}
              option={option}
              showClear={clearInList && currentValue === option.value}
              variant={variant}
              onClear={() => {
                changeValue('');
                setOpen(false);
              }}
            />
          )),
    [open, renderedOptions, variant, metaClassName, clearInList, currentValue, changeValue],
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch('');
    if (nextOpen) resetFocusClaim();
  };

  const handleValueChange = (next: string) => {
    if (!open && fromRadix(next) === '') return;
    changeValue(fromRadix(next));
  };

  const triggerClassName = cn(
    DROPDOWN_TRIGGER_BASE_CLASSES,
    FIELD_HEIGHT[size],
    fieldSurface({ focusMode: 'trigger', invalid, disabled }),
    className,
  );
  const panelClassName = cn(DROPDOWN_CONTENT_CLASSES, contentClassName);

  return (
    <SelectPrimitive.Root
      disabled={disabled}
      open={open}
      value={toRadix(currentValue ?? '')}
      onOpenChange={handleOpenChange}
      onValueChange={handleValueChange}
    >
      <SelectPrimitive.Trigger
        ref={ref}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid ?? (invalid || undefined)}
        aria-labelledby={ariaLabelledBy}
        className={triggerClassName}
        id={id}
      >
        <DropdownValue
          placeholder={placeholder}
          selectedLabel={selectedLabel}
          selectedOption={selectedOption}
          showClear={!!(clearable && currentValue && !disabled)}
          onClear={() => changeValue('')}
        />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          ref={contentRef}
          align={align}
          className={panelClassName}
          position="popper"
          side={side}
          sideOffset={4}
          tabIndex={searchable ? undefined : -1}
          onFocus={handleContentFocus}
          onKeyDownCapture={handleContentKeyDown}
        >
          {searchable && (
            <div className={FIELD_POPUP_SEARCH_CLASS} onKeyDown={handleSearchKeyDown}>
              <SystemIcon
                className={FIELD_POPUP_SEARCH_ICON_CLASS}
                name="magnifying-glass-outline"
                size={14}
              />
              <input
                {...searchInputProps}
                className={FIELD_POPUP_SEARCH_INPUT_CLASS}
                placeholder={searchPlaceholder}
                type="text"
              />
            </div>
          )}

          <SelectPrimitive.Viewport>
            <div
              className={cn(
                'max-h-[min(300px,calc(var(--radix-popper-available-height,344px)-3rem))] overflow-y-auto',
                FIELD_POPUP_LIST_CLASS,
              )}
            >
              {optionElements}

              {matchCount === 0 && !createOption && (
                <div className={FIELD_POPUP_EMPTY_CLASS}>Không có kết quả</div>
              )}
            </div>
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export default Dropdown;

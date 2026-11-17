'use client';

import { useTranslations } from 'next-intl';
import { useState, useCallback, useEffect, useMemo } from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { SystemIcon } from '@/shared/ui/icons/Icons';
import { SelectChevron } from '@/shared/ui/selects/select-chevron';
import {
  FIELD_HEIGHT,
  FIELD_POPUP_CLASS,
  FIELD_POPUP_EMPTY_CLASS,
  FIELD_POPUP_ITEM_CLASS,
  FIELD_POPUP_LIST_CLASS,
  FIELD_POPUP_SEARCH_CLASS,
  FIELD_POPUP_SEARCH_ICON_CLASS,
  FIELD_POPUP_SEARCH_INPUT_CLASS,
  fieldSurface,
  type FieldSize,
} from '@/shared/ui/inputs/field.theme';
import { useEventCallback, useImeSafeSearchInput, useLatestRequest } from '@/shared/hooks';
import { debounce } from '@/shared/utils/browser/debounce.utils';
import { cn } from '@/shared/utils/style/cn';
import { TEXT_ELLIPSIS_CLASSES } from '@/shared/ui/primitives/text-ellipsis.theme';
import { useFormField } from '../hooks/useFormField';
import FieldReadOnly from '../../field-read-only';
import FormItem from '../../FormItem';

export interface AsyncOption {
  /** Giá trị ghi vào form khi chọn dòng này (thường là id). */
  value: string;
  /** Chữ hiện trong danh sách và trên nút sau khi chọn. */
  label: string;
}

export interface AsyncSelectFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  fetchOptions: (search: string) => Promise<AsyncOption[]>;
  debounceMs?: number;
  valueLabel?: string;
  size?: FieldSize;
}

const ASYNC_SELECT_TRIGGER_CLASSES =
  'inline-flex items-center justify-between gap-2 px-3 text-left text-body-14 enabled:cursor-pointer';

const ASYNC_SELECT_CONTENT_CLASSES = cn(
  FIELD_POPUP_CLASS,
  'min-w-[var(--radix-popover-trigger-width)]',
  'origin-[var(--radix-popover-content-transform-origin)]',
);

/** Dòng option: rê / focus = nền `bg-nav-hover`; đang chọn (`aria-current`) = nền `primary-5` 15% + chữ `link`. */
const ASYNC_SELECT_OPTION_CLASSES = cn(
  FIELD_POPUP_ITEM_CLASS,
  'w-full text-left',
  'hover:bg-bg-nav-hover hover:text-fg-heading',
  'focus-visible:bg-bg-nav-hover focus-visible:text-fg-heading',
  'aria-[current=true]:bg-primary-5/15 aria-[current=true]:text-link',
);

const toFormString = (value: unknown) => (value == null ? '' : String(value));

/**
 * AsyncSelectField — chọn MỘT giá trị từ danh sách tải qua API theo từ khoá (ô tìm kiếm có debounce).
 *
 * Đặt trong `<Form>`; form `readOnly` thì hiện nhãn thay cho nút. Danh sách có sẵn trong bộ nhớ →
 * `SelectField`; các cấp phụ thuộc nhau (tỉnh → huyện) → `CascadeSelectField`.
 * Nhãn trên nút lấy theo thứ tự: dòng người dùng vừa chọn (nếu vẫn đúng giá trị form) → dòng cùng giá trị
 * trong danh sách đã tải → `valueLabel` → giá trị thô.
 * Sửa giao diện: nút mở → `ASYNC_SELECT_TRIGGER_CLASSES` · panel → `ASYNC_SELECT_CONTENT_CLASSES` · dòng
 * option (đang chọn = `aria-current`) → `ASYNC_SELECT_OPTION_CLASSES` · khung nút, mũi tên, ô tìm, dòng rỗng
 * → `field.theme` (`fieldSurface`, `FIELD_POPUP_*`) · dấu chọn `SelectChevron`.
 * Lưu ý: ô tìm kiếm dùng `useImeSafeSearchInput` để gõ tiếng Việt không mất dấu (docs/rules/interaction/ime-safe-input.md).
 * Chỉ lượt tìm MỚI NHẤT được ghi danh sách; API lỗi → xoá danh sách, hiện thông báo lỗi tải (`ui.form` → `asyncSelect.loadFailed`).
 *
 * @param props.name - Tên field trong form (đường dẫn react-hook-form); giá trị là `option.value`.
 * @param props.label - Nhãn phía trên nút; nối với nút để trình đọc màn hình đọc được.
 * @param props.required - `true` → dấu `*` cạnh nhãn (chỉ hiển thị; ràng buộc thật nằm ở schema Zod).
 * @param props.description - Dòng gợi ý dưới nút; khi có lỗi thì chỉ còn cho trình đọc màn hình.
 * @param props.placeholder - Chữ trên nút khi chưa chọn. Bỏ trống thì theo ngôn ngữ (`ui.form` → `asyncSelect.placeholder`).
 * @param props.disabled - `true` → khoá nút.
 * @param props.className - Class cho khung `FormItem` bọc ngoài (bề ngang, lề).
 * @param props.fetchOptions - `(từ khoá) => Promise<AsyncOption[]>`; gọi với `''` khi mở lần đầu. Luôn gọi
 *   bản mới nhất, không cần `useCallback`.
 * @param props.debounceMs - Thời gian chờ ngừng gõ trước khi gọi API, ms. Mặc định `300`.
 * @param props.valueLabel - Nhãn của giá trị form ĐANG giữ khi danh sách chưa có dòng đó (form sửa điền
 *   sẵn id). Giá trị đổi từ ngoài (`reset` / `setValue`) thì truyền nhãn mới theo.
 * @param props.size - Chiều cao: `sm` 32px | `md` 36px | `lg` 40px. Mặc định `md`.
 *
 * @example
 * <AsyncSelectField name="unitId" label="Đơn vị" fetchOptions={(q) => api.searchUnits(q)} />
 *
 * <AsyncSelectField name="ownerId" label="Người phụ trách" fetchOptions={searchUsers} valueLabel={task.ownerName} />
 */
function AsyncSelectField({
  name,
  label,
  required,
  description,
  placeholder,
  disabled,
  className,
  fetchOptions,
  debounceMs = 300,
  valueLabel,
  size = 'md',
}: AsyncSelectFieldProps) {
  const t = useTranslations('ui.form');
  const { field, error, a11y, readOnly } = useFormField(name, { label, description });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<AsyncOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [picked, setPicked] = useState<AsyncOption | null>(null);
  const { begin } = useLatestRequest();
  const { value: fieldValue, onChange, ref } = field;

  const currentValue = toFormString(fieldValue);
  const knownLabel =
    (picked?.value === currentValue ? picked.label : undefined) ??
    options.find((o) => o.value === currentValue)?.label;
  const displayLabel = knownLabel || valueLabel || currentValue;

  const load = useEventCallback(async (q: string) => {
    const isCurrent = begin();
    setLoading(true);
    let next: AsyncOption[] | undefined;
    try {
      next = await fetchOptions(q);
    } catch {
      next = undefined;
    }
    if (!isCurrent()) return;
    setOptions(next ?? []);
    setFailed(next === undefined);
    setLoading(false);
  });

  const debouncedLoad = useMemo(() => debounce(load, debounceMs), [load, debounceMs]);

  useEffect(() => () => debouncedLoad.cancel(), [debouncedLoad]);

  const handleSearchChange = useCallback(
    (next: string) => {
      setSearch(next);
      debouncedLoad(next);
    },
    [debouncedLoad],
  );

  const { inputProps } = useImeSafeSearchInput(search, handleSearchChange);

  const handleOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next && !search) debouncedLoad('');
    },
    [search, debouncedLoad],
  );

  const handleSelect = useCallback(
    (opt: AsyncOption) => {
      onChange(opt.value);
      setPicked(opt);
      setOpen(false);
      setSearch('');
    },
    [onChange],
  );

  if (readOnly) {
    return (
      <FieldReadOnly className={className} label={label}>
        {currentValue && displayLabel}
      </FieldReadOnly>
    );
  }

  const triggerClassName = cn(
    fieldSurface({ focusMode: 'trigger', invalid: Boolean(error), disabled }),
    ASYNC_SELECT_TRIGGER_CLASSES,
    FIELD_HEIGHT[size],
  );
  const valueClassName = cn(
    TEXT_ELLIPSIS_CLASSES,
    'flex-1',
    currentValue ? 'text-fg-heading' : 'text-fg-faint',
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
      <PopoverPrimitive.Root open={open} onOpenChange={handleOpen}>
        <PopoverPrimitive.Trigger
          ref={ref}
          {...a11y.trigger}
          className={triggerClassName}
          disabled={disabled}
        >
          <span className={valueClassName}>
            {currentValue ? displayLabel : (placeholder ?? t('asyncSelect.placeholder'))}
          </span>
          <SelectChevron />
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            className={ASYNC_SELECT_CONTENT_CLASSES}
            collisionPadding={8}
            side="bottom"
            sideOffset={4}
          >
            <div className={FIELD_POPUP_SEARCH_CLASS} onKeyDown={(e) => e.stopPropagation()}>
              <SystemIcon
                className={cn(FIELD_POPUP_SEARCH_ICON_CLASS, 'size-5')}
                name="magnifying-glass-outline"
              />
              <input
                {...inputProps}
                aria-label={t('asyncSelect.searchAria')}
                autoFocus
                className={FIELD_POPUP_SEARCH_INPUT_CLASS}
                placeholder={t('asyncSelect.searchPlaceholder')}
                type="text"
              />
              {loading && (
                <SystemIcon
                  className="size-4 text-fg-on-chrome-muted animate-spin motion-reduce:animate-none"
                  name="arrows-rotate-outline"
                />
              )}
            </div>

            <div
              className={cn(
                'max-h-[min(300px,calc(var(--radix-popper-available-height,360px)-4rem))] overflow-auto',
                FIELD_POPUP_LIST_CLASS,
              )}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  aria-current={opt.value === currentValue || undefined}
                  className={ASYNC_SELECT_OPTION_CLASSES}
                  type="button"
                  onClick={() => handleSelect(opt)}
                >
                  <span className={TEXT_ELLIPSIS_CLASSES}>{opt.label}</span>
                </button>
              ))}
              {!loading && !failed && options.length === 0 && (
                <p className={FIELD_POPUP_EMPTY_CLASS}>{t('asyncSelect.empty')}</p>
              )}
              {!loading && failed && (
                <p className={cn(FIELD_POPUP_EMPTY_CLASS, 'text-error')} role="alert">
                  {t('asyncSelect.loadFailed')}
                </p>
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </FormItem>
  );
}

export default AsyncSelectField;

'use client';

import { useCallback, useMemo } from 'react';
import { includesNormalized, normalizeSearch } from '@/shared/utils/format/string.utils';
import type { MultiSelectOption } from './multi-select.types';

interface UseMultiSelectSelectionParams {
  options: MultiSelectOption[];
  value: string[];
  onValueChange?: (value: string[]) => void;
  searchable: boolean;
  debouncedSearch: string;
  maxDisplay?: number;
}

/**
 * useMultiSelectSelection — lọc option, tập đã chọn, bật / tắt từng mục và "chọn tất cả" của `MultiSelect`.
 *
 * Hook NỘI BỘ của MultiSelect; mọi thay đổi đi qua `onValueChange` (component không giữ state chọn).
 * Lưu ý: phạm vi "chọn tất cả" = mục ĐANG HIỂN THỊ (đã lọc), bỏ `disabled`; lựa chọn ngoài bộ lọc được
 * giữ nguyên (union khi chọn, chỉ gỡ phần trong phạm vi khi bỏ).
 *
 * @returns `{ filteredOptions, selectedOptions, visibleSelected, overflowCount, toggle, selectableValues,
 *   allSelected, someSelected, toggleAll }`.
 *
 * @example
 * const { filteredOptions, toggle, toggleAll } = useMultiSelectSelection({ options, value,
 *   onValueChange, searchable, debouncedSearch, maxDisplay });
 */
export function useMultiSelectSelection({
  options,
  value,
  onValueChange,
  searchable,
  debouncedSearch,
  maxDisplay,
}: UseMultiSelectSelectionParams) {
  const filteredOptions = useMemo(() => {
    const query = searchable ? normalizeSearch(debouncedSearch) : '';
    if (!query) return options;
    return options.filter((option) => includesNormalized(option.label, query));
  }, [options, searchable, debouncedSearch]);

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  );

  const toggle = useCallback(
    (optionValue: string, isChecked: boolean) => {
      onValueChange?.(isChecked ? [...value, optionValue] : value.filter((v) => v !== optionValue));
    },
    [value, onValueChange],
  );

  const visibleSelected = useMemo(
    () => (maxDisplay != null ? selectedOptions.slice(0, maxDisplay) : selectedOptions),
    [selectedOptions, maxDisplay],
  );
  const overflowCount = maxDisplay != null ? Math.max(0, selectedOptions.length - maxDisplay) : 0;

  const selectableValues = useMemo(
    () => filteredOptions.filter((o) => !o.disabled).map((o) => o.value),
    [filteredOptions],
  );
  const selectedInScope = useMemo(
    () => selectableValues.filter((v) => value.includes(v)).length,
    [selectableValues, value],
  );
  const allSelected = selectableValues.length > 0 && selectedInScope === selectableValues.length;
  const someSelected = selectedInScope > 0 && !allSelected;

  const toggleAll = useCallback(
    (nextChecked: boolean) => {
      onValueChange?.(
        nextChecked
          ? [...value, ...selectableValues.filter((v) => !value.includes(v))]
          : value.filter((v) => !selectableValues.includes(v)),
      );
    },
    [value, selectableValues, onValueChange],
  );

  return {
    filteredOptions,
    selectedOptions,
    visibleSelected,
    overflowCount,
    toggle,
    selectableValues,
    allSelected,
    someSelected,
    toggleAll,
  };
}

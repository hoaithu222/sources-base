import { useMemo } from 'react';
import { includesNormalized, normalizeSearch } from '@/shared/utils/format/string.utils';
import type { DropdownOption, DropdownProps } from '../dropdown.types';

interface UseDropdownOptionsParams {
  options: DropdownOption[];
  value?: string;
  creatable: boolean;
  searchable: boolean;
  debouncedSearch: string;
  triggerDisplay: NonNullable<DropdownProps['triggerDisplay']>;
  createLabel?: DropdownProps['createLabel'];
}

/**
 * useDropdownOptions — dữ liệu dẫn xuất của `Dropdown`: option đã ép (creatable), nhãn trigger, dòng
 * "Tạo mới" và `renderedOptions` (mọi option + cờ `hidden` cho dòng không khớp từ khoá).
 *
 * Hook NỘI BỘ của Dropdown.
 * Lưu ý: khớp bỏ dấu trên label · badge · meta, KHÔNG khớp `value` (thường là id kỹ thuật); dòng không
 * khớp vẫn phải render (ẩn), không được unmount — search-matching.md §3–§4.
 *
 * @returns `{ matchCount, selectedOption, selectedLabel, createOption, renderedOptions }`.
 *
 * @example
 * const { renderedOptions, selectedLabel } = useDropdownOptions({ options, value, creatable,
 *   searchable, debouncedSearch, triggerDisplay: 'label' });
 */
export function useDropdownOptions({
  options,
  value,
  creatable,
  searchable,
  debouncedSearch,
  triggerDisplay,
  createLabel,
}: UseDropdownOptionsParams) {
  const baseOptions = useMemo<DropdownOption[]>(() => {
    if (!creatable || !value || options.some((o) => o.value === value)) {
      return options;
    }
    return [{ value, label: value }, ...options];
  }, [options, creatable, value]);

  const matchedValues = useMemo(() => {
    const query = searchable ? normalizeSearch(debouncedSearch) : '';
    if (!query) return null;
    const matched = new Set<string>();
    for (const option of baseOptions) {
      if (
        includesNormalized(option.label, query) ||
        includesNormalized(option.badge, query) ||
        includesNormalized(option.meta, query)
      ) {
        matched.add(option.value);
      }
    }
    return matched;
  }, [baseOptions, searchable, debouncedSearch]);

  const matchCount = matchedValues ? matchedValues.size : baseOptions.length;

  const selectedOption = useMemo(
    () => (value ? baseOptions.find((o) => o.value === value) : undefined),
    [value, baseOptions],
  );

  const selectedLabel = useMemo(() => {
    if (!selectedOption) return '';
    if (triggerDisplay === 'badge') return selectedOption.badge ?? selectedOption.label;
    if (triggerDisplay === 'meta') return selectedOption.meta ?? selectedOption.label;
    return selectedOption.label;
  }, [selectedOption, triggerDisplay]);

  const createOption = useMemo<DropdownOption | null>(() => {
    if (!creatable) return null;
    const q = debouncedSearch.trim();
    if (!q) return null;
    const normalized = normalizeSearch(q);
    const exists = baseOptions.some((o) => normalizeSearch(o.label) === normalized);
    return exists
      ? null
      : {
          value: q,
          label: createLabel ? createLabel(q) : `Tạo mới: "${q}"`,
          icon: 'plus-outline',
        };
  }, [creatable, debouncedSearch, baseOptions, createLabel]);

  const renderedOptions = useMemo(() => {
    const rows = baseOptions.map((option) => ({
      option,
      hidden: !!matchedValues && !matchedValues.has(option.value),
    }));
    return createOption ? [...rows, { option: createOption, hidden: false }] : rows;
  }, [baseOptions, matchedValues, createOption]);

  return { matchCount, selectedOption, selectedLabel, createOption, renderedOptions };
}

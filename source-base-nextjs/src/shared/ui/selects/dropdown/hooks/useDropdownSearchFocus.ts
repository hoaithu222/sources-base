'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseDropdownSearchFocusParams {
  open: boolean;
  searchable: boolean;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  setSearch: (value: string) => void;
}

/**
 * useDropdownSearchFocus — giữ con trỏ ở ô tìm kiếm của panel `Dropdown` (Radix hay cướp focus về item).
 *
 * Hook NỘI BỘ của Dropdown: gắn `contentRef` + `handleContentFocus` + `handleContentKeyDown` lên
 * `Select.Content`, `handleSearchKeyDown` lên khối ô tìm kiếm, gọi `resetFocusClaim()` mỗi lần mở.
 * Lưu ý: KHÔNG gỡ lớp nào trong 3 lớp (effect lúc mở panel · `onFocus` · `onKeyDownCapture` của
 * Content) — search-matching.md §4. `onKeyDownCapture` phải ở pha capture.
 *
 * @returns `{ contentRef, handleContentFocus, handleContentKeyDown, handleSearchKeyDown, resetFocusClaim }`.
 *
 * @example
 * const { contentRef, handleContentFocus, handleContentKeyDown, handleSearchKeyDown, resetFocusClaim } =
 *   useDropdownSearchFocus({ open, searchable, searchInputRef, setSearch });
 */
export function useDropdownSearchFocus({
  open,
  searchable,
  searchInputRef,
  setSearch,
}: UseDropdownSearchFocusParams) {
  const contentRef = useRef<HTMLDivElement>(null);
  const searchFocusClaimedRef = useRef(false);

  useEffect(() => {
    if (!open || !searchable) return;
    const input = searchInputRef.current;
    if (!input) return;
    input.focus();
    const timer = window.setTimeout(() => {
      const active = document.activeElement;
      if (active === input) return;
      if (active && contentRef.current?.contains(active)) return;
      input.focus();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchInputRef là ref ổn định
  }, [open, searchable]);

  const handleContentKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const input = searchInputRef.current;
      if (!searchable || !input || event.target === input) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.nativeEvent.isComposing) return;
      const isChar = event.key.length === 1;
      const isBackspace = event.key === 'Backspace';
      if (!isChar && !isBackspace) return;
      event.preventDefault();
      const next = isBackspace ? input.value.slice(0, -1) : input.value + event.key;
      input.value = next;
      setSearch(next);
      input.focus();
      input.setSelectionRange(next.length, next.length);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- searchInputRef và setSearch ổn định
    [searchable],
  );

  const handleContentFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!searchable) return;
    const input = searchInputRef.current;
    if (!input || event.target === input) return;
    if (event.target === contentRef.current) {
      input.focus();
      return;
    }
    if (searchFocusClaimedRef.current) return;
    searchFocusClaimedRef.current = true;
    input.focus();
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const items = contentRef.current?.querySelectorAll<HTMLElement>(
      '[role="option"]:not([data-disabled])',
    );
    if (!items?.length) return;
    event.preventDefault();
    searchFocusClaimedRef.current = true;
    (event.key === 'ArrowDown' ? items[0] : items[items.length - 1]).focus();
  };

  const resetFocusClaim = () => {
    searchFocusClaimedRef.current = false;
  };

  return {
    contentRef,
    handleContentFocus,
    handleContentKeyDown,
    handleSearchKeyDown,
    resetFocusClaim,
  };
}

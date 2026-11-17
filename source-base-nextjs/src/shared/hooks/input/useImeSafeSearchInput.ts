'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * `const { inputProps, clear } = useImeSafeSearchInput(search, setSearch)` → `<Input {...inputProps} />`.
 * Uncontrolled: `onChange` chỉ chạy khi gõ ASCII hoặc `compositionEnd`; `value` đổi từ ngoài vẫn đồng bộ vào DOM.
 */
export function useImeSafeSearchInput(value: string, onChange: (next: string) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || isComposingRef.current) return;
    if (el.value !== value) el.value = value;
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isComposingRef.current) return;
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleCompositionStart = useCallback(() => {
    isComposingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      onChange((e.target as HTMLInputElement).value);
    },
    [onChange],
  );

  const clear = useCallback(() => {
    if (inputRef.current) inputRef.current.value = '';
    onChange('');
  }, [onChange]);

  return {
    inputProps: {
      ref: inputRef,
      defaultValue: value,
      onChange: handleChange,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
    },
    clear,
  };
}

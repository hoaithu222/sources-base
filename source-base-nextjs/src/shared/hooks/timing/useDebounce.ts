'use client';

import { useEffect, useState } from 'react';

/** `const q = useDebounce(value, 300)` — trả `value` sau khi nó đứng yên `delay` ms (lần đầu trả ngay). */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

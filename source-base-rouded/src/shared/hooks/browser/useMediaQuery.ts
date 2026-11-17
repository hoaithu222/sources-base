import { useEffect, useState } from 'react';

/**
 * `useMediaQuery('(hover: none)')` → `true` khi query đang khớp; tự cập nhật theo sự kiện `change`.
 * ⛔ Không tự gõ query bề rộng để chia bố cục — dùng preset `useIsPhone` · `useIsBelowWide` · `useIsCoarsePointer`
 * (có biến thể CSS cùng điều kiện); đổi class thì viết biến thể Tailwind (`ipad-responsive.md`).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.(query).matches === true,
  );

  useEffect(() => {
    const mql = typeof window === 'undefined' ? undefined : window.matchMedia?.(query);
    if (!mql) return;
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

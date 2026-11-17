import { useEffect, useMemo, useState } from 'react';

type MatchMap = Record<string, boolean>;

function readMatches(queries: readonly string[]): MatchMap {
  const out: MatchMap = {};
  for (const query of queries) {
    out[query] = typeof window !== 'undefined' && window.matchMedia?.(query).matches === true;
  }
  return out;
}

/**
 * useMatchedQueries — nghe NHIỀU media query cùng lúc và trả `{ [query]: đang khớp }`, cập nhật theo sự kiện
 * `change`. Dùng cho dải chip "biến thể nào đang khớp" — gọi `useMediaQuery` trong vòng lặp là sai luật hook.
 *
 * @param queries - Danh sách media query (đổi nội dung thì nghe lại; đừng tạo mảng mới mỗi lần render).
 * @returns Bản đồ query → `true` khi đang khớp (`false` khi môi trường không có `matchMedia`).
 *
 * @example
 * const matches = useMatchedQueries(['(min-width: 768px)', '(hover: none)']);
 */
export function useMatchedQueries(queries: readonly string[]): MatchMap {
  const key = useMemo(() => queries.join('\n'), [queries]);
  const [matches, setMatches] = useState<MatchMap>(() => readMatches(queries));

  useEffect(() => {
    const list = key.split('\n').filter(Boolean);
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const sync = () => setMatches(readMatches(list));
    sync();
    const lists = list.map((query) => window.matchMedia(query));
    for (const mql of lists) mql.addEventListener('change', sync);
    return () => {
      for (const mql of lists) mql.removeEventListener('change', sync);
    };
  }, [key]);

  return matches;
}

import { useCallback, useRef } from 'react';

import {
  arrowDirection,
  canLeaveField,
  collectNavFields,
  findFieldInDirection,
  focusField,
  isNavField,
} from '@/shared/utils/browser/field-nav.utils';

/** `[ref, onKeyDown]` — gắn cả hai vào CÙNG phần tử bọc ngoài; tuple để `react-hooks/refs` không bắt lỗi. */
export type ArrowFieldNav<T extends HTMLElement> = readonly [
  React.RefObject<T | null>,
  (e: React.KeyboardEvent) => void,
];

/** `const [navRef, onNavKey] = useArrowFieldNav<HTMLDivElement>()` — ↑ ↓ ← → đi giữa các ô nhập của cụm. */
export function useArrowFieldNav<T extends HTMLElement>(): ArrowFieldNav<T> {
  const ref = useRef<T>(null);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const direction = arrowDirection(e.key);
    const container = ref.current;
    if (!direction || !container) return;

    const active = e.target as HTMLElement;
    if (!container.contains(active) || !isNavField(active)) return;
    if (!canLeaveField(active, direction)) return;

    const scope = active.closest('tr') ?? container;
    const next = findFieldInDirection(collectNavFields(scope), active, direction);
    if (!next) return;

    e.preventDefault();
    focusField(next, direction);
  }, []);

  return [ref, onKeyDown] as const;
}

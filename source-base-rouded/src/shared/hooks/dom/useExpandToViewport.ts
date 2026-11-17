import { useCallback, useEffect, useState } from 'react';

import { OPEN_DIALOG_SELECTOR } from '@/shared/constants/dom.constants';

import { useKeyboardShortcut } from '../input/useKeyboardShortcut';

export interface ExpandToViewport {
  expanded: boolean;
  toggle: () => void;
}

/**
 * `const { expanded, toggle } = useExpandToViewport()` — phóng MỘT khối ra trọn viewport tại chỗ: khi `expanded`,
 * nơi gọi đổi class của CHÍNH node gốc sang `fixed inset-0` (không portal / Fullscreen API); Esc thu nhỏ (nhường
 * dialog đang mở). Không bọc node trong ancestor có `transform` / `filter` / `will-change` — `fixed` sẽ neo sai.
 */
export function useExpandToViewport(): ExpandToViewport {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  useKeyboardShortcut({
    code: 'Escape',
    enabled: expanded,
    preventDefault: false,
    onTrigger: (event) => {
      if (event.defaultPrevented || document.querySelector(OPEN_DIALOG_SELECTOR)) return;
      setExpanded(false);
      (document.activeElement as HTMLElement | null)?.blur();
    },
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    return () => cancelAnimationFrame(raf);
  }, [expanded]);

  return { expanded, toggle };
}

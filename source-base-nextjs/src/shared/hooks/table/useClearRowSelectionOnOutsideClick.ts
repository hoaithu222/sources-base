'use client';

import { useEffect } from 'react';

import { OPEN_DIALOG_SELECTOR } from '@/shared/constants/dom.constants';
import { KEEP_ROW_SELECTION_SELECTOR } from '@/shared/constants/row-selection.constants';

import { useEventCallback } from '../state/useEventCallback';

/**
 * `useClearRowSelectionOnOutsideClick(enabled, onClear)` — `mousedown` ngoài dòng dữ liệu và vùng giữ chọn
 * (`KEEP_ROW_SELECTION_SELECTOR`) thì gọi `onClear`; tạm dừng khi có dialog mở. `enabled` = đang có dòng chọn.
 */
export function useClearRowSelectionOnOutsideClick(enabled: boolean, onClear: () => void): void {
  const clear = useEventCallback(onClear);

  useEffect(() => {
    if (!enabled) return;

    const handle = (e: MouseEvent) => {
      if (document.querySelector(OPEN_DIALOG_SELECTOR)) return;
      const el = e.target as HTMLElement | null;
      if (!el?.isConnected) return;
      if (el.closest(KEEP_ROW_SELECTION_SELECTOR)) return;
      clear();
    };

    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [enabled, clear]);
}

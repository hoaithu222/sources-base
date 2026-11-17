import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

import { DISPLAY_INITIAL_STATE, DISPLAY_STORAGE } from './display.constants';
import type { DisplayStoreType } from './display.types';
import { sanitizeDisplayState } from './display.utils';

/**
 * useDisplayStore — chế độ hiển thị (standard / TV) và mức phóng chữ TV, persist ở localStorage.
 *
 * Bật TV → cỡ chữ ×`uiScale` (1.1 / 1.2 / 1.3), tắt → ×1; bố cục giữ nguyên cả hai chế độ. Đọc qua
 * selector: `selectIsTv`, `selectEffectiveUiScale`. Giá trị từ URL ghi bằng `applyDisplayOverrides`.
 * Lưu ý: KHÔNG đọc thẳng `state.uiScale` để nhân cỡ chữ (store vẫn nhớ mức TV khi đã tắt TV). Dữ liệu
 * đã lưu được kiểm lại ở MỖI lần khôi phục (`merge`) lẫn khi đổi version (`migrate`) —
 * docs/notes/code/domains.md.
 *
 * @example
 * const uiScale = useDisplayStore(selectEffectiveUiScale);
 */
export const useDisplayStore = create<DisplayStoreType>()(
  persist(
    (set) => ({
      ...DISPLAY_INITIAL_STATE,

      setMode: (mode) => {
        set({ mode });
      },

      setUiScale: (uiScale) => {
        set({ uiScale });
      },

      applyDisplayOverrides: (overrides) => {
        if (Object.keys(overrides).length > 0) set(overrides);
      },
    }),
    {
      name: DISPLAY_STORAGE.key,
      version: DISPLAY_STORAGE.version,
      storage: createSafeJSONStorage(),
      migrate: sanitizeDisplayState,
      merge: (persisted, current) => ({ ...current, ...sanitizeDisplayState(persisted) }),
      partialize: (state) => ({ mode: state.mode, uiScale: state.uiScale }),
    },
  ),
);

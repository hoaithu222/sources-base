import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

/**
 * header-appearance.store — store CỤC BỘ của widget header: KIỂU thanh header, người dùng chọn trong menu người dùng
 * ("Kiểu header") và lưu `localStorage`.
 *
 * Dùng:   const appearance = useHeaderAppearance();  → `HEADER_APPEARANCE_CLASSES[appearance]` + `data-appearance` ở `<header>`
 *         `brand` (mặc định) — gradient ngọc BIDV, chữ trắng, vạch vàng kim · `glass` — kính mờ (trắng ở theme sáng, than chì
 *         ở theme tối — token `bg-glass` tự lật), chữ `fg-on-chrome`, vạch ngọc. Hai kiểu CÙNG hình ở cả hai theme.
 * Lưu ý:  ⛔ Chỉ `Header` và menu người dùng đọc / ghi (`widget-composition.md` — Store cục bộ). Đổi kiểu mặc định →
 *         tăng `version` (persist ghi cả giá trị mặc định nên bản cũ sẽ giữ kiểu cũ).
 */

export type HeaderAppearance = 'brand' | 'glass';

/** Danh sách hợp lệ — cũng là thứ tự trong menu người dùng. */
export const HEADER_APPEARANCE_ORDER: readonly HeaderAppearance[] = ['brand', 'glass'];

export const HEADER_APPEARANCE_LABEL = {
  brand: 'Thương hiệu (gradient)',
  glass: 'Kính mờ (sáng)',
} satisfies Record<HeaderAppearance, string>;

const DEFAULT_APPEARANCE: HeaderAppearance = 'brand';

const HEADER_APPEARANCE_STORAGE = { key: 'header-appearance-storage', version: 1 } as const;

interface HeaderAppearanceState {
  appearance: HeaderAppearance;
  setAppearance: (appearance: HeaderAppearance) => void;
}

const sanitizeHeaderAppearance = (raw: unknown): Pick<HeaderAppearanceState, 'appearance'> => {
  const value = (typeof raw === 'object' && raw !== null ? raw : {}) as { appearance?: unknown };
  return {
    appearance:
      HEADER_APPEARANCE_ORDER.find((option) => option === value.appearance) ?? DEFAULT_APPEARANCE,
  };
};

export const useHeaderAppearanceStore = create<HeaderAppearanceState>()(
  persist(
    (set) => ({
      appearance: DEFAULT_APPEARANCE,
      setAppearance: (appearance) => set({ appearance }),
    }),
    {
      name: HEADER_APPEARANCE_STORAGE.key,
      version: HEADER_APPEARANCE_STORAGE.version,
      storage: createSafeJSONStorage(),
      migrate: sanitizeHeaderAppearance,
      merge: (persisted, current) => ({ ...current, ...sanitizeHeaderAppearance(persisted) }),
      partialize: (state) => ({ appearance: state.appearance }),
    },
  ),
);

/** Kiểu header đang chọn (selector gọn cho `Header` / menu người dùng). */
export function useHeaderAppearance(): HeaderAppearance {
  return useHeaderAppearanceStore((state) => state.appearance);
}

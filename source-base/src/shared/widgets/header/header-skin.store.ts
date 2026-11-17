import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

/**
 * header-skin.store — store CỤC BỘ của widget header: KIỂU KHUNG của thanh header (chip + bảng tên), người dùng chọn trong
 * menu người dùng và lưu `localStorage`.
 *
 * Dùng:   const skin = useHeaderSkin();  → `HEADER_SKIN_SPECS[skin]` (`page-header/header-skin.theme.ts`) + `data-skin` ở `<header>`
 *         tray (mặc định) — khay: mũi tên + bảng tên treo dưới thanh khay, cạnh chéo thu vào ở đáy · tray-flip — khay ngược (dải ngang
 *         gạch đứt, bảng tên xoè ra dưới) · tray-slant — khay tab vát · command — khay tab bình hành + vạch xiên (mẫu 106) · facet — khay hai
 *         lớp vát + cánh sáng (mẫu 061) · slant — vát chéo · chevron — mũi tên hướng về bảng tên ·
 *         hex — cắt góc · tag — nhãn cắt một góc · stair — bậc thang · square — vuông, ngoặc chữ L · folder — tab thư mục ·
 *         solid — khối đặc · gauge — thang vạch · line — gạch chân.
 * Lưu ý:  ⛔ Chỉ `Header`, menu người dùng và các phần dựng khung của widget đọc (`widget-composition.md` — Store cục bộ).
 *         ⛔ Bố cục cụm tâm KHÔNG có lựa chọn: cụm tâm luôn ở GIỮA thanh (từ 1280px tuyệt đối giữa; dưới đó chạy trong luồng);
 *            bảng tên chỉ lệch khi hai cánh tab không cân (ô nav `xl:basis-auto`).
 */

export type HeaderSkin =
  | 'tray-flip'
  | 'tray'
  | 'tray-slant'
  | 'command'
  | 'facet'
  | 'slant'
  | 'chevron'
  | 'hex'
  | 'tag'
  | 'stair'
  | 'square'
  | 'folder'
  | 'solid'
  | 'gauge'
  | 'line';

/** Danh sách hợp lệ — cũng là thứ tự hiện trong menu người dùng. */
export const HEADER_SKIN_ORDER: readonly HeaderSkin[] = [
  'tray',
  'tray-flip',
  'tray-slant',
  'command',
  'facet',
  'slant',
  'chevron',
  'hex',
  'tag',
  'stair',
  'square',
  'folder',
  'solid',
  'gauge',
  'line',
];

const DEFAULT_SKIN: HeaderSkin = 'tray';

/**
 * Khoá + `version` lưu `localStorage`: đổi khoá = mất lựa chọn đã lưu; đổi shape / đổi KIỂU MẶC ĐỊNH → tăng `version`.
 * v2: mặc định đổi `tray-flip` → `tray` — persist ghi cả mặc định, nên bản cũ (v1) bỏ lựa chọn lưu để mặc định mới hiện ra.
 */
const HEADER_SKIN_STORAGE = { key: 'header-skin-storage', version: 2 } as const;

interface HeaderSkinState {
  skin: HeaderSkin;
  setSkin: (skin: HeaderSkin) => void;
}

/**
 * Dữ liệu lưu là đầu vào KHÔNG tin cậy: giá trị ngoài danh sách (hoặc sai kiểu) → mặc định. `version` (chỉ `migrate` truyền) cũ hơn
 * hiện hành → bỏ lựa chọn đã lưu, về mặc định mới.
 */
const sanitizeHeaderSkinState = (raw: unknown, version?: number): Pick<HeaderSkinState, 'skin'> => {
  if (version !== undefined && version < HEADER_SKIN_STORAGE.version) return { skin: DEFAULT_SKIN };
  const { skin } = (typeof raw === 'object' && raw !== null ? raw : {}) as { skin?: unknown };
  return { skin: HEADER_SKIN_ORDER.find((value) => value === skin) ?? DEFAULT_SKIN };
};

export const useHeaderSkinStore = create<HeaderSkinState>()(
  persist(
    (set) => ({
      skin: DEFAULT_SKIN,

      setSkin: (skin) => set({ skin }),
    }),
    {
      name: HEADER_SKIN_STORAGE.key,
      version: HEADER_SKIN_STORAGE.version,
      storage: createSafeJSONStorage(),
      migrate: sanitizeHeaderSkinState,
      merge: (persisted, current) => ({ ...current, ...sanitizeHeaderSkinState(persisted) }),
      partialize: (state) => ({ skin: state.skin }),
    },
  ),
);

/** Kiểu khung hiện hành — luôn hợp lệ, mặc định `'tray'` (kể cả lúc HMR / rehydrate). */
export function useHeaderSkin(): HeaderSkin {
  return useHeaderSkinStore((s) => s?.skin) ?? DEFAULT_SKIN;
}

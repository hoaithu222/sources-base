import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

import { DOCK_MODE_OPTIONS } from './dock-settings.constants';
import type { DockDisplayMode, DockSettings } from './dock.types';

/**
 * dock-settings.store — store CỤC BỘ của widget Dock: chế độ hiển thị + công tắc phóng lân cận, người
 * dùng chọn trên panel bánh răng và lưu `localStorage`.
 *
 * Dùng:   const mode = useDockSettingsStore((s) => s.mode);   // selector — chỉ theo dõi trường cần
 * Lưu ý:  ⛔ KHÔNG truyền qua prop của `<Dock>` (mỗi nơi gọi sẽ ghi đè lựa chọn của người dùng). Ngoài
 *         widget chỉ tầng `app/shell` được đọc (gắn mục "Ẩn / Hiện thanh Dock" vào menu người dùng).
 *         Dữ liệu khôi phục được kiểm ở MỌI lần (`merge` + `migrate`); đổi tên / bỏ chế độ → tăng `version`.
 */

interface DockSettingsState extends DockSettings {
  setMode: (mode: DockDisplayMode) => void;
  setMagnify: (magnify: boolean) => void;
  /** Ẩn hẳn Dock; đang ẩn thì bật lại về `DEFAULT_DOCK_SETTINGS.mode`. */
  toggleHidden: () => void;
}

/** Giá trị xuất xưởng: đổi `mode` Ở ĐÂY để đổi mặc định cả dự án (vd `'collapsed'`). */
export const DEFAULT_DOCK_SETTINGS: DockSettings = {
  mode: 'pinned',
  magnify: true,
};

/** Khoá + `version` lưu `localStorage`: đổi khoá = mất lựa chọn đã lưu; đổi shape → tăng `version`. */
const DOCK_SETTINGS_STORAGE = { key: 'dock-storage', version: 1 } as const;

const sanitizeDockSettings = (raw: unknown): DockSettings => {
  const { mode, magnify } = (typeof raw === 'object' && raw !== null ? raw : {}) as Partial<
    Record<keyof DockSettings, unknown>
  >;
  return {
    mode:
      DOCK_MODE_OPTIONS.find((option) => option.value === mode)?.value ??
      DEFAULT_DOCK_SETTINGS.mode,
    magnify: typeof magnify === 'boolean' ? magnify : DEFAULT_DOCK_SETTINGS.magnify,
  };
};

export const useDockSettingsStore = create<DockSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_DOCK_SETTINGS,
      setMode: (mode) => set({ mode }),
      setMagnify: (magnify) => set({ magnify }),
      toggleHidden: () =>
        set((s) => ({ mode: s.mode === 'hidden' ? DEFAULT_DOCK_SETTINGS.mode : 'hidden' })),
    }),
    {
      name: DOCK_SETTINGS_STORAGE.key,
      version: DOCK_SETTINGS_STORAGE.version,
      storage: createSafeJSONStorage(),
      migrate: sanitizeDockSettings,
      merge: (persisted, current) => ({ ...current, ...sanitizeDockSettings(persisted) }),
      partialize: (state) => ({ mode: state.mode, magnify: state.magnify }),
    },
  ),
);

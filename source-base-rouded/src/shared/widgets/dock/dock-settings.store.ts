import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useIsCoarsePointer } from '@/shared/hooks';
import { createSafeJSONStorage } from '@/shared/utils/browser/storage.utils';

import { DOCK_RESERVE_CLASSES } from './dock.theme';
import type {
  DockDisplayMode,
  DockModeOption,
  DockPosition,
  DockPositionOption,
  DockSettings,
} from './dock.types';

/**
 * dock-settings.store — store CỤC BỘ của widget Dock: chế độ hiển thị + công tắc phóng lân cận + cạnh neo, người
 * dùng chọn trên panel bánh răng và lưu `localStorage`.
 *
 * Dùng:   const mode = useDockSettingsStore((s) => s.mode);   // selector — chỉ theo dõi trường cần
 *         DOCK_MODE_OPTIONS / DOCK_POSITION_OPTIONS → hàng chọn của panel cấu hình (cũng dùng để kiểm giá trị khôi phục)
 * Lưu ý:  ⛔ KHÔNG truyền qua prop của `<Dock>` (mỗi nơi gọi sẽ ghi đè lựa chọn của người dùng). Ngoài
 *         widget chỉ tầng `app/shell` được đọc (mục "Ẩn / Hiện thanh Dock", chừa chỗ cho Dock ghim — `useDockReserve`).
 *         Dữ liệu khôi phục được kiểm ở MỌI lần (`merge` + `migrate`); đổi tên / bỏ chế độ → tăng `version`.
 */

/** Thứ tự mảng = thứ tự hàng trên panel cấu hình, từ "hiện nhiều" tới "hiện ít". */
export const DOCK_MODE_OPTIONS: readonly DockModeOption[] = [
  {
    value: 'pinned',
    icon: 'location-pin-bold',
    label: 'Ghim cố định',
    description: 'Luôn hiển thị; màn bảng vẫn cao trọn, Dock nổi ở dải đáy',
  },
  {
    value: 'autohide',
    icon: 'eye-slash-bold',
    label: 'Tự ẩn',
    description: 'Hiện khi rê chuột vào giữa mép neo',
  },
  {
    value: 'collapsed',
    icon: 'angle-up-bold',
    label: 'Thu gọn',
    description: 'Co thành tay nắm nhỏ sát mép',
  },
  {
    value: 'hidden',
    icon: 'do-not-enter-bold',
    label: 'Ẩn hoàn toàn',
    description: 'Không để lại gợi ý nào trên màn',
  },
];

/** Thứ tự = thứ tự ô trên panel: trái · đáy · phải (đọc như vị trí thật trên màn). */
export const DOCK_POSITION_OPTIONS: readonly DockPositionOption[] = [
  { value: 'left', label: 'Trái' },
  { value: 'bottom', label: 'Đáy' },
  { value: 'right', label: 'Phải' },
];

interface DockSettingsState extends DockSettings {
  setMode: (mode: DockDisplayMode) => void;
  setMagnify: (magnify: boolean) => void;
  setPosition: (position: DockPosition) => void;
  /** Ẩn hẳn Dock; đang ẩn thì bật lại về `DEFAULT_DOCK_SETTINGS.mode`. */
  toggleHidden: () => void;
}

/** Giá trị xuất xưởng: đổi Ở ĐÂY để đổi mặc định cả dự án (vd `mode: 'collapsed'`, `position: 'left'`). */
export const DEFAULT_DOCK_SETTINGS: DockSettings = {
  mode: 'pinned',
  magnify: true,
  position: 'bottom',
};

/** Khoá + `version` lưu `localStorage`: đổi khoá = mất lựa chọn đã lưu; đổi shape → tăng `version`. v2: thêm `position`. */
const DOCK_SETTINGS_STORAGE = { key: 'dock-storage', version: 2 } as const;

const sanitizeDockSettings = (raw: unknown): DockSettings => {
  const { mode, magnify, position } = (
    typeof raw === 'object' && raw !== null ? raw : {}
  ) as Partial<Record<keyof DockSettings, unknown>>;
  return {
    mode:
      DOCK_MODE_OPTIONS.find((option) => option.value === mode)?.value ??
      DEFAULT_DOCK_SETTINGS.mode,
    magnify: typeof magnify === 'boolean' ? magnify : DEFAULT_DOCK_SETTINGS.magnify,
    position:
      DOCK_POSITION_OPTIONS.find((option) => option.value === position)?.value ??
      DEFAULT_DOCK_SETTINGS.position,
  };
};

export const useDockSettingsStore = create<DockSettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_DOCK_SETTINGS,
      setMode: (mode) => set({ mode }),
      setMagnify: (magnify) => set({ magnify }),
      setPosition: (position) => set({ position }),
      toggleHidden: () =>
        set((s) => ({ mode: s.mode === 'hidden' ? DEFAULT_DOCK_SETTINGS.mode : 'hidden' })),
    }),
    {
      name: DOCK_SETTINGS_STORAGE.key,
      version: DOCK_SETTINGS_STORAGE.version,
      storage: createSafeJSONStorage(),
      migrate: sanitizeDockSettings,
      merge: (persisted, current) => ({ ...current, ...sanitizeDockSettings(persisted) }),
      partialize: (state) => ({
        mode: state.mode,
        magnify: state.magnify,
        position: state.position,
      }),
    },
  ),
);

/**
 * Class chỗ cho Dock ĐANG GHIM ở cạnh neo (`DOCK_RESERVE_CLASSES`: đáy — trang trôi chừa 80px, trang khoá cao cao trọn
 * màn + `--dock-inset-b`; trái / phải KHÔNG chừa — Dock dọc nổi đè); `''` khi Dock tự ẩn / thu gọn / ẩn (Dock nổi đè). Máy chạm luôn ghim.
 * CHỈ `AppShellLayout` gọi.
 */
export function useDockReserveClass(): string {
  const mode = useDockSettingsStore((s) => s.mode);
  const position = useDockSettingsStore((s) => s.position);
  const isCoarsePointer = useIsCoarsePointer();
  return isCoarsePointer || mode === 'pinned' ? DOCK_RESERVE_CLASSES[position] : '';
}

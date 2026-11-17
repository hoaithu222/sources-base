import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createSafeJSONStorage,
  registerPersistedStore,
} from '@/shared/utils/browser/storage.utils';

/**
 * recent-modules.store — store CỤC BỘ của widget header: các phân hệ người dùng mở GẦN ĐÂY (mới nhất trước, tối đa
 * `RECENT_MODULES_LIMIT`), hiện thành hàng "Gần đây" đầu launcher — một chạm quay lại chỗ đang làm.
 *
 * Dùng:   const recentIds = useRecentModulesStore((s) => s.ids) · useRecentModulesStore.getState().record(id)
 * Lưu ý:  ⛔ Chỉ widget header đọc / ghi (`ModuleCluster` ghi khi phân hệ đang mở đổi). Lưu id, KHÔNG lưu tên / quyền:
 *         launcher đối chiếu id với danh sách đã lọc quyền nên phân hệ mất quyền tự biến khỏi "Gần đây".
 */

export const RECENT_MODULES_LIMIT = 4;

const RECENT_MODULES_STORAGE = { key: 'next-base:recent-modules', version: 1 } as const;

interface RecentModulesState {
  ids: string[];
  record: (id: string) => void;
}

const sanitizeRecentModules = (raw: unknown): Pick<RecentModulesState, 'ids'> => {
  const value = (typeof raw === 'object' && raw !== null ? raw : {}) as { ids?: unknown };
  const ids = Array.isArray(value.ids)
    ? value.ids.filter((id): id is string => typeof id === 'string')
    : [];
  return { ids: [...new Set(ids)].slice(0, RECENT_MODULES_LIMIT) };
};

export const useRecentModulesStore = create<RecentModulesState>()(
  persist(
    (set) => ({
      ids: [],
      record: (id) =>
        set((state) =>
          state.ids[0] === id
            ? state
            : {
                ids: [id, ...state.ids.filter((other) => other !== id)].slice(
                  0,
                  RECENT_MODULES_LIMIT,
                ),
              },
        ),
    }),
    {
      name: RECENT_MODULES_STORAGE.key,
      version: RECENT_MODULES_STORAGE.version,
      storage: createSafeJSONStorage(),
      skipHydration: true,
      migrate: sanitizeRecentModules,
      merge: (persisted, current) => ({ ...current, ...sanitizeRecentModules(persisted) }),
      partialize: (state) => ({ ids: state.ids }),
    },
  ),
);

registerPersistedStore(useRecentModulesStore);

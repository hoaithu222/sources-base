import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  createSafeJSONStorage,
  registerPersistedStore,
} from '@/shared/utils/browser/storage.utils';

import type { WorkTab, WorkTabVisit } from './work-tabs.types';

/**
 * work-tabs.store — store CỤC BỘ của widget `work-tabs`: các thẻ màn hình đã mở + bật / tắt lịch sử thẻ. Lưu localStorage để mở
 * lại trình duyệt vẫn còn chỗ đang làm.
 *
 * Dùng:   useWorkTabsStore((s) => s.tabs) · useWorkTabsStore.getState().visit({ path, search, title, … })
 * Lưu ý:  ⛔ Tầng app đẩy màn đang mở vào bằng `visit` (`AppWorkTabs`); widget không đọc registry. Tối đa
 *         `WORK_TABS_LIMIT` thẻ: mở thẻ mới khi đã đủ thì bỏ thẻ CŨ nhất chưa ghim. Thẻ ghim đứng đầu mảng.
 *         `tabs` giữ THỨ TỰ MỞ (phím chuyển thẻ đi theo thứ tự này); độ gần đây đọc ở `visitedAt` (`splitHistory`).
 */

export const WORK_TABS_LIMIT = 12;

const WORK_TABS_STORAGE = { key: 'next-base:work-tabs', version: 1 } as const;

interface WorkTabsState {
  tabs: WorkTab[];
  enabled: boolean;
  visit: (tab: WorkTabVisit) => void;
  close: (path: string) => void;
  closeOthers: (path: string) => void;
  closeRight: (path: string) => void;
  togglePin: (path: string) => void;
  setEnabled: (enabled: boolean) => void;
}

const isTab = (value: unknown): value is WorkTab => {
  const tab = value as Partial<WorkTab> | null;
  return (
    typeof tab?.path === 'string' &&
    typeof tab.title === 'string' &&
    typeof tab.search === 'string' &&
    typeof tab.visitedAt === 'number'
  );
};

/** Mốc mở mới: tăng NGẶT so với mọi thẻ — hai lần mở trong cùng một ms vẫn phân được thẻ nào gần hơn. */
const nextVisitStamp = (tabs: readonly WorkTab[]) =>
  tabs.reduce((stamp, tab) => Math.max(stamp, tab.visitedAt + 1), Date.now());

/** Thẻ ghim lên đầu, giữ thứ tự mở trong từng nhóm. */
const pinnedFirst = (tabs: readonly WorkTab[]) => [
  ...tabs.filter((tab) => tab.pinned),
  ...tabs.filter((tab) => !tab.pinned),
];

/** Quá giới hạn → bỏ thẻ chưa ghim mở lâu nhất (không bao giờ bỏ `keepPath`). */
function trim(tabs: WorkTab[], keepPath: string): WorkTab[] {
  let next = tabs;
  while (next.length > WORK_TABS_LIMIT) {
    const candidates = next.filter((tab) => !tab.pinned && tab.path !== keepPath);
    if (candidates.length === 0) break;
    const oldest = candidates.reduce((a, b) => (a.visitedAt <= b.visitedAt ? a : b));
    next = next.filter((tab) => tab !== oldest);
  }
  return next;
}

const sanitizeWorkTabs = (raw: unknown): Pick<WorkTabsState, 'tabs' | 'enabled'> => {
  const value = (typeof raw === 'object' && raw !== null ? raw : {}) as {
    tabs?: unknown;
    enabled?: unknown;
  };
  const tabs = Array.isArray(value.tabs) ? value.tabs.filter(isTab) : [];
  const unique = tabs.filter((tab, index) => tabs.findIndex((t) => t.path === tab.path) === index);
  return {
    tabs: pinnedFirst(unique).slice(0, WORK_TABS_LIMIT),
    enabled: typeof value.enabled === 'boolean' ? value.enabled : true,
  };
};

export const useWorkTabsStore = create<WorkTabsState>()(
  persist(
    (set) => ({
      tabs: [],
      enabled: true,
      visit: (visit) =>
        set((state) => {
          const now = nextVisitStamp(state.tabs);
          const existing = state.tabs.find((tab) => tab.path === visit.path);
          if (existing) {
            return {
              tabs: state.tabs.map((tab) =>
                tab.path === visit.path ? { ...tab, ...visit, visitedAt: now } : tab,
              ),
            };
          }
          return { tabs: trim([...state.tabs, { ...visit, visitedAt: now }], visit.path) };
        }),
      close: (path) => set((state) => ({ tabs: state.tabs.filter((tab) => tab.path !== path) })),
      closeOthers: (path) =>
        set((state) => ({ tabs: state.tabs.filter((tab) => tab.path === path || tab.pinned) })),
      closeRight: (path) =>
        set((state) => {
          const index = state.tabs.findIndex((tab) => tab.path === path);
          return { tabs: state.tabs.filter((tab, i) => i <= index || tab.pinned) };
        }),
      togglePin: (path) =>
        set((state) => ({
          tabs: pinnedFirst(
            state.tabs.map((tab) => (tab.path === path ? { ...tab, pinned: !tab.pinned } : tab)),
          ),
        })),
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: WORK_TABS_STORAGE.key,
      version: WORK_TABS_STORAGE.version,
      storage: createSafeJSONStorage(),
      skipHydration: true,
      migrate: sanitizeWorkTabs,
      merge: (persisted, current) => ({ ...current, ...sanitizeWorkTabs(persisted) }),
      partialize: (state) => ({ tabs: state.tabs, enabled: state.enabled }),
    },
  ),
);

registerPersistedStore(useWorkTabsStore);

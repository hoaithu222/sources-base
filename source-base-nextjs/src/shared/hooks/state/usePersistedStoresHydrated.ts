'use client';

import { useSyncExternalStore } from 'react';

import {
  arePersistedStoresHydrated,
  subscribePersistedStoresHydrated,
} from '@/shared/utils/browser/storage.utils';

/**
 * usePersistedStoresHydrated — `true` sau khi MỌI store `persist` đã nạp lại từ localStorage (`rehydratePersistedStores`);
 * `false` ở server và ở lần render đầu của trình duyệt (khớp HTML server, không lỗi hydration).
 *
 * Dùng cho code CHỈ được hành động theo state đã lưu của người dùng (vd `AppearanceSync` không ghi đè giao diện mà script khởi
 * tạo đã áp trước khi store nạp xong).
 *
 * @example
 * const hydrated = usePersistedStoresHydrated();
 * useLayoutEffect(() => { if (hydrated) applyAppearance(…); }, [hydrated, …]);
 */
export function usePersistedStoresHydrated(): boolean {
  return useSyncExternalStore(
    subscribePersistedStoresHydrated,
    arePersistedStoresHydrated,
    () => false,
  );
}

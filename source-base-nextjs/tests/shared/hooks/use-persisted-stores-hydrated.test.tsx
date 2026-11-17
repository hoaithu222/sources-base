/**
 * `usePersistedStoresHydrated` — `false` ở server và ở lần render đầu của trình duyệt (khớp HTML server), `true` sau khi
 * `rehydratePersistedStores()` nạp xong MỌI store `persist`. Cờ nằm ở biến toàn cục của `storage.utils` nên mỗi ca nạp module mới.
 */

import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type StorageModule = typeof import('@/shared/utils/browser/storage.utils');
type HookModule = typeof import('@/shared/hooks/state/usePersistedStoresHydrated');

let storage: StorageModule;
let usePersistedStoresHydrated: HookModule['usePersistedStoresHydrated'];

beforeEach(async () => {
  vi.resetModules();
  storage = await import('@/shared/utils/browser/storage.utils');
  ({ usePersistedStoresHydrated } =
    await import('@/shared/hooks/state/usePersistedStoresHydrated'));
});

describe('usePersistedStoresHydrated', () => {
  it('chưa nạp → false; `rehydratePersistedStores()` → true và component render lại', () => {
    const { result } = renderHook(() => usePersistedStoresHydrated());
    expect(result.current).toBe(false);

    act(() => storage.rehydratePersistedStores());

    expect(result.current).toBe(true);
  });

  it('mount SAU khi đã nạp → true ngay', () => {
    storage.rehydratePersistedStores();

    const { result } = renderHook(() => usePersistedStoresHydrated());

    expect(result.current).toBe(true);
  });

  it('⛔ render ở server luôn là false kể cả khi cờ đã bật (HTML server không đổi theo localStorage)', () => {
    storage.rehydratePersistedStores();

    function Probe() {
      return createElement('span', null, String(usePersistedStoresHydrated()));
    }

    expect(renderToString(createElement(Probe))).toContain('false');
  });
});

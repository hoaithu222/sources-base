import { useCallback, useEffect, useRef } from 'react';

import { safeStorage } from '@/shared/utils/browser/storage.utils';

import { useEventCallback } from '../state/useEventCallback';

/**
 * useMultiTabSync / useMultiTabBroadcaster — đồng bộ trạng thái GIAO DIỆN giữa các tab cùng trình duyệt
 * (`BroadcastChannel`; trình duyệt cũ fallback sang `storage` event của localStorage).
 *
 * Dùng:   useMultiTabSync<{ type: 'notifications-read' }>('notifications', (msg) => { … });   // nhận
 *         const broadcast = useMultiTabBroadcaster('notifications');                           // gửi
 *         broadcast({ type: 'notifications-read' });
 * Lưu ý:  ⛔ Đăng nhập / đăng xuất KHÔNG dùng hook này: phiên đã tự đồng bộ giữa các tab ở `@/domains/session`
 *            (`startSessionSync`, chạy ngoài React để cả interceptor HTTP cũng báo được).
 */

const CHANNEL_PREFIX = 'app:sync:';

/** Nhận tin trên kênh `channelName`; tự huỷ đăng ký khi unmount / đổi kênh. `handler` không cần ổn định tham chiếu. */
export function useMultiTabSync<T = unknown>(
  channelName: string,
  handler: (message: T) => void,
): void {
  const onMessage = useEventCallback(handler as (message: never) => void) as (message: T) => void;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const key = CHANNEL_PREFIX + channelName;

    if (typeof BroadcastChannel !== 'undefined') {
      let bc: BroadcastChannel | undefined;
      try {
        bc = new BroadcastChannel(key);
        bc.onmessage = (e: MessageEvent<T>) => onMessage(e.data);
        return () => bc?.close();
      } catch {
        /* fallthrough */
      }
    }

    const storageHandler = (e: StorageEvent) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue) as { _t: number; payload: T };
        onMessage(parsed.payload);
      } catch {
        /* noop */
      }
    };
    window.addEventListener('storage', storageHandler);
    return () => window.removeEventListener('storage', storageHandler);
  }, [channelName, onMessage]);
}

/** Trả hàm gửi tin lên kênh `channelName`; nơi nhận dùng `useMultiTabSync` cùng tên kênh. */
export function useMultiTabBroadcaster<T = unknown>(channelName: string): (message: T) => void {
  const bcRef = useRef<BroadcastChannel | undefined>(undefined);
  const keyRef = useRef<string>(CHANNEL_PREFIX + channelName);

  useEffect(() => {
    keyRef.current = CHANNEL_PREFIX + channelName;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bcRef.current = new BroadcastChannel(keyRef.current);
      } catch {
        bcRef.current = undefined;
      }
    }
    return () => {
      bcRef.current?.close();
      bcRef.current = undefined;
    };
  }, [channelName]);

  return useCallback((message: T) => {
    if (bcRef.current) {
      try {
        bcRef.current.postMessage(message);
        return;
      } catch {
        /* fallthrough */
      }
    }
    try {
      const payload = JSON.stringify({ _t: Date.now(), payload: message });
      if (safeStorage.setItem(keyRef.current, payload)) safeStorage.removeItem(keyRef.current);
    } catch {
      /* tin không tuần tự hoá được: bỏ */
    }
  }, []);
}

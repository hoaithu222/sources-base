import { useEffect, useState } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  /** `true` từ lần mất mạng đầu tiên sau khi mount; không tự tắt lại. */
  wasOffline: boolean;
  /** Mốc đổi trạng thái gần nhất (ms epoch); `null` nếu chưa đổi lần nào. */
  lastChangedAt: number | null;
}

const getInitialOnline = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
};

/** `const { isOnline, wasOffline } = useNetworkStatus()` — đồng bộ lại khi `wasOffline && isOnline`. */
export function useNetworkStatus(): NetworkStatus {
  const [state, setState] = useState<NetworkStatus>(() => ({
    isOnline: getInitialOnline(),
    wasOffline: false,
    lastChangedAt: null,
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setState((prev) => ({
        isOnline: true,
        wasOffline: prev.wasOffline || !prev.isOnline,
        lastChangedAt: Date.now(),
      }));
    };

    const handleOffline = () => {
      setState({
        isOnline: false,
        wasOffline: true,
        lastChangedAt: Date.now(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return state;
}

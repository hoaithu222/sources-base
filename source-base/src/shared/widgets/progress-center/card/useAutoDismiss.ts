import { useEffect, useMemo, useRef, useState, type FocusEvent } from 'react';

import { useEventCallback } from '@/shared/hooks';

interface UseAutoDismissOptions {
  /** Thời gian chờ (ms). Bỏ trống → không tự đóng. */
  durationMs?: number;
  onDismiss?: () => void;
}

interface AutoDismissHandlers {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onBlur: (event: FocusEvent<HTMLElement>) => void;
}

interface UseAutoDismissReturn {
  /** Đang có đồng hồ đếm (có `durationMs` lẫn `onDismiss`). */
  active: boolean;
  /** Đang dừng đếm vì con trỏ HOẶC focus còn nằm trong phần tử gắn `handlers`. */
  paused: boolean;
  /** Rải vào phần tử gốc của thẻ: `<div {...handlers}>`. */
  handlers: AutoDismissHandlers;
}

const noop = (): void => undefined;

/**
 * useAutoDismiss — tự gọi `onDismiss` sau `durationMs`; dừng đếm khi con trỏ hoặc focus ở trong thẻ và
 * chạy TIẾP phần còn lại khi cả hai đã rời ra — thẻ không biến mất đúng lúc người dùng đang đọc / sắp bấm.
 *
 * Dùng:   const countdown = useAutoDismiss({ durationMs: 6000, onDismiss: close });
 *         <div {...countdown.handlers}>…</div>
 */
export function useAutoDismiss({
  durationMs,
  onDismiss,
}: UseAutoDismissOptions): UseAutoDismissReturn {
  const active = durationMs !== undefined && onDismiss !== undefined;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const paused = hovered || focused;
  const remainingRef = useRef(0);
  const dismiss = useEventCallback(onDismiss ?? noop);

  useEffect(() => {
    remainingRef.current = durationMs ?? 0;
  }, [durationMs]);

  useEffect(() => {
    if (!active || paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(dismiss, remainingRef.current);
    return () => {
      clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAt));
    };
  }, [active, paused, dismiss]);

  const handlers = useMemo<AutoDismissHandlers>(
    () => ({
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setFocused(true),
      onBlur: (event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      },
    }),
    [],
  );

  return { active, paused, handlers };
}

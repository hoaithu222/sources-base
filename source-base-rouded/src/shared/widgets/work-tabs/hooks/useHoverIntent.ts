import { useEffect, useRef, type PointerEvent } from 'react';

import { useEventCallback } from '@/shared/hooks';

export interface HoverIntentOptions {
  /** `false` → bỏ qua chuột (đang mở bằng bấm / phím — chỉ bấm ra ngoài hoặc Esc mới đóng). */
  enabled: boolean;
  /** Mở sau khi chuột ĐỨNG trên nút ngần này (ms) — lướt ngang qua không mở. */
  openDelay?: number;
  /** Đóng sau khi chuột rời cả nút lẫn bảng ngần này (ms) — đi chéo từ nút xuống bảng không bị đóng. */
  closeDelay?: number;
  onOpenChange: (open: boolean) => void;
}

const isMouse = (event: PointerEvent) => event.pointerType === 'mouse';

/**
 * useHoverIntent — mở / đóng lớp nổi theo Ý ĐỊNH rê chuột kiểu menu macOS: đứng trên nút `openDelay` ms thì mở, rời nút
 * và bảng `closeDelay` ms thì đóng; quay lại kịp thì huỷ đóng. Chỉ chuột (`pointerType === 'mouse'`) — bút / chạm vẫn bấm.
 * Trả hai bộ handler gắn lên nút (`trigger`) và nội dung lớp nổi (`content`).
 *
 * @param options - `enabled` · `openDelay` (mặc định 150) · `closeDelay` (mặc định 220) · `onOpenChange`.
 *
 * @example
 * const hover = useHoverIntent({ enabled: !sticky, onOpenChange: setOpen });
 * <button {...hover.trigger} /> · <div {...hover.content} />
 */
export function useHoverIntent({
  enabled,
  openDelay = 150,
  closeDelay = 220,
  onOpenChange,
}: HoverIntentOptions) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!enabled) clearTimeout(timer.current);
  }, [enabled]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const schedule = useEventCallback((open: boolean, event: PointerEvent) => {
    if (!enabled || !isMouse(event)) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onOpenChange(open), open ? openDelay : closeDelay);
  });
  const cancel = useEventCallback((event: PointerEvent) => {
    if (isMouse(event)) clearTimeout(timer.current);
  });

  return {
    trigger: {
      onPointerEnter: (event: PointerEvent) => schedule(true, event),
      onPointerLeave: (event: PointerEvent) => schedule(false, event),
    },
    content: {
      onPointerEnter: cancel,
      onPointerLeave: (event: PointerEvent) => schedule(false, event),
    },
  };
}

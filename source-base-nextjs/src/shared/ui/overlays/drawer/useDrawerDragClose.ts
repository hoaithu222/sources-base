'use client';

import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';

const DRAWER_CLOSE_DISTANCE = 80;

/**
 * useDrawerDragClose — kéo-để-đóng cho ngăn kéo ĐÁY (bottom sheet) ở tablet / điện thoại.
 *
 * Gắn `handleProps` lên thanh nắm kéo ở đỉnh sheet và áp `style` lên khung sheet: sheet đi xuống theo ngón tay,
 * thả quá 80px thì gọi `onClose`, chưa tới thì bật về. Chỉ vuốt XUỐNG (kéo lên bị chặn ở 0) nên không tranh với
 * cuộn thân sheet. Lưu ý: thanh nắm kéo phải nằm NGOÀI vùng cuộn và có `touch-none`, nếu không ngón kéo bị trình
 * duyệt hiểu là cuộn trang.
 *
 * @param onClose - Gọi khi thả sau khi kéo xuống quá ngưỡng.
 * @returns `handleProps` (gắn lên thanh nắm), `style` (gắn lên khung sheet; `undefined` khi không kéo), `dragging`.
 *
 * @example
 * const drag = useDrawerDragClose(() => onOpenChange(false));
 *
 * <Dialog.Content style={drag.style}>
 *   <div {...drag.handleProps} className="touch-none">…</div>
 * </Dialog.Content>
 */
export function useDrawerDragClose(onClose: () => void) {
  const [offset, setOffset] = useState(0);
  const startY = useRef<number | null>(null);
  const latest = useRef(0);

  const finish = (event: PointerEvent<HTMLElement>) => {
    if (startY.current === null) return;
    startY.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const shouldClose = latest.current > DRAWER_CLOSE_DISTANCE;
    latest.current = 0;
    setOffset(0);
    if (shouldClose) onClose();
  };

  const handleProps = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      startY.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (startY.current === null) return;
      latest.current = Math.max(0, event.clientY - startY.current);
      setOffset(latest.current);
    },
    onPointerUp: finish,
    onPointerCancel: finish,
  };

  const style: CSSProperties | undefined =
    offset > 0 ? { transform: `translateY(${offset}px)`, transition: 'none' } : undefined;

  return { handleProps, style, dragging: offset > 0 };
}

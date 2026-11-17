'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type { SplitterOrientation } from './splitter.types';
import { clampSize, resolveBound, resolveInitialPx } from './splitter.utils';

interface DragState {
  startCoord: number;
  startSize: number;
  total: number;
}

interface UseSplitterDragOptions {
  deferResize: boolean;
  initialSize: number | string;
  maxSize?: number | string;
  minSize?: number | string;
  onResize?: (size: number) => void;
  orientation: SplitterOrientation;
  sizedSide: 'first' | 'second';
}

const KEY_STEP_PX = 10;
const KEY_STEP_LARGE_PX = 50;

function keyDirection(orientation: SplitterOrientation, key: string): number {
  const [back, forward] =
    orientation === 'horizontal' ? ['ArrowLeft', 'ArrowRight'] : ['ArrowUp', 'ArrowDown'];
  if (key === back) return -1;
  return key === forward ? 1 : 0;
}

const measureTotal = (el: HTMLElement, orientation: SplitterOrientation) =>
  orientation === 'horizontal' ? el.clientWidth : el.clientHeight;

/**
 * useSplitterDrag — trạng thái kéo của `Splitter`: đo khung, kéo bằng pointer, đổi cỡ bằng phím mũi tên.
 *
 * Lưu ý: kéo bằng POINTER events, đừng đổi sang mouse (Safari iPad không giả lập chuột cho thao tác kéo).
 * Khung chưa có kích thước lúc mount (tab ẩn, `display: none`) thì `ResizeObserver` đo lại khi khung
 * hiện ra; tới lúc đó `size` là `null` và pane chốt dùng `flex-basis` theo `initialSize`.
 *
 * @param options.initialSize - Cỡ ban đầu của pane chốt: số (px) hoặc chuỗi `"40%"` / `"320px"`.
 * @param options.minSize - Cận dưới, cùng dạng `initialSize`.
 * @param options.maxSize - Cận trên, cùng dạng `initialSize`.
 * @param options.orientation - `horizontal` (kéo ngang) | `vertical` (kéo dọc).
 * @param options.sizedSide - Pane chốt kích thước: `first` | `second` (kéo / phím đảo chiều).
 * @param options.deferResize - `true` → lúc kéo chỉ cập nhật `previewSize`; `size` + `onResize` chạy khi thả.
 * @param options.onResize - Gọi với cỡ mới (px) của pane chốt.
 * @returns `containerRef` · `size` (px hoặc `null`) · `total` (px của khung, 0 khi chưa đo) · `dragging`
 *   · `previewSize` · `handlePointerDown` / `handleKeyDown` gắn vào tay nắm.
 *
 * @example
 * const drag = useSplitterDrag({ initialSize: '40%', orientation: 'horizontal', sizedSide: 'first', deferResize: false });
 */
export function useSplitterDrag({
  deferResize,
  initialSize,
  maxSize,
  minSize,
  onResize,
  orientation,
  sizedSide,
}: UseSplitterDragOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [previewSize, setPreviewSize] = useState<number | null>(null);
  const previewSizeRef = useRef<number | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const initialRef = useRef({ initialSize, minSize, maxSize });

  useLayoutEffect(() => {
    initialRef.current = { initialSize, minSize, maxSize };
  });

  const resolveStart = useCallback((nextTotal: number): number | null => {
    const { initialSize: init, minSize: min, maxSize: max } = initialRef.current;
    const next = resolveInitialPx(init, nextTotal);
    if (next == null) return null;
    return clampSize(next, resolveBound(min, nextTotal), resolveBound(max, nextTotal), nextTotal);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let measured = false;
    const measure = () => {
      const nextTotal = measureTotal(el, orientation);
      setTotal(nextTotal);
      if (measured || nextTotal <= 0) return;
      const start = resolveStart(nextTotal);
      if (start == null) return;
      measured = true;
      setSize(start);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [orientation, resolveStart]);

  const currentSize = useCallback(
    (nextTotal: number): number | null => {
      if (size != null) return size;
      const start = resolveStart(nextTotal);
      if (start != null) setSize(start);
      return start;
    },
    [size, resolveStart],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const nextTotal = measureTotal(el, orientation);
      const startSize = nextTotal > 0 ? currentSize(nextTotal) : null;
      if (startSize == null) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      const startCoord = orientation === 'horizontal' ? event.clientX : event.clientY;
      dragStateRef.current = { startCoord, startSize, total: nextTotal };
      setDragging(true);
    },
    [orientation, currentSize],
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const direction = keyDirection(orientation, event.key);
      const el = containerRef.current;
      if (!direction || !el) return;
      const nextTotal = measureTotal(el, orientation);
      const startSize = nextTotal > 0 ? currentSize(nextTotal) : null;
      if (startSize == null) return;
      event.preventDefault();
      const step = event.shiftKey ? KEY_STEP_LARGE_PX : KEY_STEP_PX;
      const next = clampSize(
        startSize + direction * step * (sizedSide === 'second' ? -1 : 1),
        resolveBound(minSize, nextTotal),
        resolveBound(maxSize, nextTotal),
        nextTotal,
      );
      setSize(next);
      onResize?.(next);
    },
    [orientation, currentSize, sizedSide, minSize, maxSize, onResize],
  );

  useEffect(() => {
    if (!dragging) return;
    const bodyClass = orientation === 'horizontal' ? 'splitter-resizing-x' : 'splitter-resizing-y';
    document.body.classList.add(bodyClass);
    const onMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (!state) return;
      const coord = orientation === 'horizontal' ? event.clientX : event.clientY;
      const delta = (coord - state.startCoord) * (sizedSide === 'second' ? -1 : 1);
      const next = clampSize(
        state.startSize + delta,
        resolveBound(minSize, state.total),
        resolveBound(maxSize, state.total),
        state.total,
      );
      if (deferResize) {
        previewSizeRef.current = next;
        setPreviewSize(next);
      } else {
        setSize(next);
        onResize?.(next);
      }
    };
    const onUp = () => {
      if (deferResize && previewSizeRef.current != null) {
        setSize(previewSizeRef.current);
        onResize?.(previewSizeRef.current);
      }
      previewSizeRef.current = null;
      setPreviewSize(null);
      dragStateRef.current = null;
      setDragging(false);
    };
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.body.classList.remove(bodyClass);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, orientation, minSize, maxSize, onResize, deferResize, sizedSide]);

  return {
    containerRef,
    dragging,
    handleKeyDown,
    handlePointerDown,
    previewSize,
    size,
    total,
  };
}

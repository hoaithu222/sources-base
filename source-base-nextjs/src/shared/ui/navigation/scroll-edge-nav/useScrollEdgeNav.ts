'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { resolveScrollStop, SCROLL_EDGE_EPSILON } from './scroll-snap.utils';

interface HoldState {
  timeout?: number;
  raf?: number;
  prev?: number;
  /** Đã THẬT SỰ cuộn liên tục — để nuốt cú click phát ra khi nhả nút. */
  ran: boolean;
}

interface ScrollEdgeNavOptions {
  /** Mốc `scrollLeft` được phép dừng, thường là mép trái từng cột. Bỏ trống → đi gần một khung màn hình. */
  getStops?: () => number[];
}

interface ScrollEdgeNavApi {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  /** Bấm 1 nhịp (-1 trái, 1 phải). Vừa cuộn liên tục xong thì nhịp này bị bỏ qua. */
  step: (dir: -1 | 1) => void;
  startHold: (dir: -1 | 1) => void;
  endHold: () => void;
}

const STEP_RATIO = 0.8;
const MIN_STEP = 200;
const HOLD_DELAY = 260;
const HOLD_SPEED = 1000;
/** Bấm liên tiếp trong cửa sổ này (ms) thì mốc kế tính từ ĐÍCH của nhịp trước, không từ `scrollLeft` dở dang. */
const STEP_CHAIN_MS = 400;

/**
 * useScrollEdgeNav — trạng thái + hành vi cuộn ngang cho `<ScrollEdgeNav>`: còn cuộn được về phía nào,
 * bấm một nhịp, giữ để cuộn liên tục.
 *
 * Nhịp: có `getStops` → một lần bấm = ĐÚNG một cột; không có → 80% khung nhìn (tối thiểu 200px).
 * Giữ nút quá 260ms → cuộn liên tục 1000px/giây cho tới khi nhả.
 * Lưu ý: `getStops` được gọi lại ở MỖI lần bấm (không cache); `<ScrollEdgeNav>` là `memo` nên hàm
 * phải ổn định reference (notes/components/navigation.md#usescrolledgenav).
 *
 * @param targetRef - Ref tới phần tử cuộn ngang.
 * @param options.getStops - Trả các mốc `scrollLeft` được dừng (thường là mép trái từng cột).
 * @returns `canScrollLeft` / `canScrollRight`, `step(dir)`, `startHold(dir)`, `endHold()` — `dir` là
 *   `-1` (trái) | `1` (phải).
 *
 * @example
 * const { canScrollLeft, canScrollRight, step } = useScrollEdgeNav(scrollRef, { getStops });
 */
export function useScrollEdgeNav(
  targetRef: React.RefObject<HTMLElement | null>,
  { getStops }: ScrollEdgeNavOptions = {},
): ScrollEdgeNavApi {
  const [edges, setEdges] = useState({ left: false, right: false });
  const hold = useRef<HoldState>({ ran: false });
  const pending = useRef<{ left: number; at: number } | null>(null);

  const sync = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft > SCROLL_EDGE_EPSILON;
    const right = el.scrollLeft < max - SCROLL_EDGE_EPSILON;
    setEdges((prev) => (prev.left === left && prev.right === right ? prev : { left, right }));
  }, [targetRef]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let frame = 0;
    const requestSync = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    };
    sync();

    el.addEventListener('scroll', requestSync, { passive: true });

    const resizeObserver = new ResizeObserver(requestSync);
    resizeObserver.observe(el);
    let content = el.firstElementChild;
    if (content) resizeObserver.observe(content);

    const childObserver = new MutationObserver(() => {
      const next = el.firstElementChild;
      if (next === content) return;
      if (content) resizeObserver.unobserve(content);
      content = next;
      if (content) resizeObserver.observe(content);
      requestSync();
    });
    childObserver.observe(el, { childList: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener('scroll', requestSync);
      resizeObserver.disconnect();
      childObserver.disconnect();
    };
  }, [targetRef, sync]);

  const endHold = useCallback(() => {
    const state = hold.current;
    if (state.timeout != null) window.clearTimeout(state.timeout);
    if (state.raf != null) cancelAnimationFrame(state.raf);
    state.timeout = state.raf = state.prev = undefined;
  }, []);

  const startHold = useCallback(
    (dir: -1 | 1) => {
      endHold();
      hold.current.ran = false;

      hold.current.timeout = window.setTimeout(() => {
        hold.current.ran = true;
        const tick = (now: number) => {
          const el = targetRef.current;
          if (!el) return;
          const delta = now - (hold.current.prev ?? now);
          hold.current.prev = now;
          el.scrollLeft += (dir * HOLD_SPEED * delta) / 1000;
          hold.current.raf = requestAnimationFrame(tick);
        };
        hold.current.raf = requestAnimationFrame(tick);
      }, HOLD_DELAY);
    },
    [endHold, targetRef],
  );

  const step = useCallback(
    (dir: -1 | 1) => {
      if (hold.current.ran) {
        hold.current.ran = false;
        pending.current = null;
        return;
      }
      const el = targetRef.current;
      if (!el) return;

      const stops = getStops?.();
      if (stops?.length) {
        const max = Math.max(0, el.scrollWidth - el.clientWidth);
        const now = performance.now();
        const last = pending.current;
        const from = last && now - last.at < STEP_CHAIN_MS ? last.left : el.scrollLeft;
        const left = resolveScrollStop(stops, from, dir, max);
        pending.current = { left, at: now };
        el.scrollTo({ left, behavior: 'smooth' });
        return;
      }

      const distance = Math.max(MIN_STEP, el.clientWidth * STEP_RATIO);
      el.scrollBy({ left: dir * distance, behavior: 'smooth' });
    },
    [getStops, targetRef],
  );

  useEffect(() => endHold, [endHold]);

  return { canScrollLeft: edges.left, canScrollRight: edges.right, step, startHold, endHold };
}

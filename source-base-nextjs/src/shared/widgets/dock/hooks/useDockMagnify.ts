'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { DOCK_MAGNIFY_ITEM_CLASS } from '../dock.theme';
import type { DockPosition } from '../dock.types';
import {
  dockMagnifyEase,
  dockMagnifyFit,
  dockMagnifyLayout,
  dockMagnifyRadius,
  dockMagnifyTargets,
  type DockMagnifySlot,
} from '../utils/dock-magnify.utils';

interface UseDockMagnifyOptions {
  /** `<nav>` của Dock — dùng chung ref với `useDockReveal`. */
  navRef: RefObject<HTMLElement | null>;
  /** Bật phóng: công tắc `magnify` + đang hiện dãy ô + không phải máy chạm. Đổi giá trị → về gốc ngay. */
  enabled: boolean;
  /** Giữ nguyên độ phóng (panel cài đặt đang mở — popover neo vào nút trên thanh). */
  frozen: boolean;
  position: DockPosition;
}

interface DockMagnifyRuntime {
  els: HTMLElement[];
  slots: DockMagnifySlot[];
  current: number[];
  target: number[];
  radius: number;
  maxGrow: number;
  navCenter: number;
  grow: number;
  inside: boolean;
  dirty: boolean;
  raf: number;
}

/** Chỉ máy có con trỏ thật và không bật "giảm chuyển động" (cùng điều kiện với gate của `dock-magnify.css` §1). */
const MAGNIFY_MEDIA =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

/** Khoảng chừa (px) tới mép màn ở mỗi đầu khi vỏ nở: đáy khớp `max-w-[calc(100vw-1rem)]`, dọc khớp `100dvh-5rem`. */
const EDGE_MARGIN = { bottom: 8, side: 40 } as const;

/** Bước thời gian tối đa (ms) một khung hình — tab vừa quay lại không làm ô nhảy cóc. */
const MAX_FRAME_MS = 50;

const LIVE_ATTR = 'data-dock-magnify';

const createRuntime = (): DockMagnifyRuntime => ({
  els: [],
  slots: [],
  current: [],
  target: [],
  radius: 0,
  maxGrow: 0,
  navCenter: 0,
  grow: 0,
  inside: false,
  dirty: true,
  raf: 0,
});

function isOverflowing(nav: HTMLElement, vertical: boolean): boolean {
  return vertical ? nav.scrollHeight > nav.clientHeight + 1 : nav.scrollWidth > nav.clientWidth + 1;
}

function measure(rt: DockMagnifyRuntime, nav: HTMLElement, vertical: boolean): boolean {
  const els = Array.from(nav.children).filter((el): el is HTMLElement => el instanceof HTMLElement);
  if (els.length === 0 || (rt.els.length === 0 && isOverflowing(nav, vertical))) return false;

  const navLength = vertical ? nav.clientHeight : nav.clientWidth;
  const slots = els.map((el) => {
    const size = vertical ? el.offsetHeight : el.offsetWidth;
    const start = vertical ? el.offsetTop : el.offsetLeft;
    return {
      center: start + size / 2 - navLength / 2,
      size,
      magnifies: el.classList.contains(DOCK_MAGNIFY_ITEM_CLASS),
    };
  });
  const rect = nav.getBoundingClientRect();
  const baseLength = (vertical ? rect.height : rect.width) - rt.grow;
  const viewport = vertical ? window.innerHeight : window.innerWidth;
  const margin = vertical ? EDGE_MARGIN.side : EDGE_MARGIN.bottom;
  const previous = new Map(rt.els.map((el, i) => [el, rt.current[i]]));

  rt.els = els;
  rt.slots = slots;
  rt.current = els.map((el) => previous.get(el) ?? 1);
  rt.target = [...rt.current];
  rt.radius = dockMagnifyRadius(slots);
  rt.maxGrow = Math.max(0, viewport - baseLength - 2 * margin);
  rt.navCenter = vertical ? rect.top + rect.height / 2 : rect.left + rect.width / 2;
  rt.dirty = false;
  return true;
}

function paint(rt: DockMagnifyRuntime, nav: HTMLElement): void {
  const { shifts, grow } = dockMagnifyLayout(rt.slots, rt.current);
  rt.els.forEach((el, i) => {
    el.style.setProperty('--dock-t-push', `${shifts[i].toFixed(2)}px`);
    if (!rt.slots[i].magnifies) return;
    el.style.setProperty('--dock-t-scale', rt.current[i].toFixed(4));
    el.style.zIndex = String(2 + Math.round((rt.current[i] - 1) * 100));
  });
  nav.style.setProperty('--dock-grow', `${grow.toFixed(2)}px`);
  nav.setAttribute(LIVE_ATTR, 'live');
  rt.grow = grow;
}

function clear(rt: DockMagnifyRuntime, nav: HTMLElement | null): void {
  if (rt.raf) window.cancelAnimationFrame(rt.raf);
  rt.els.forEach((el) => {
    el.style.removeProperty('--dock-t-push');
    el.style.removeProperty('--dock-t-scale');
    el.style.removeProperty('z-index');
  });
  nav?.style.removeProperty('--dock-grow');
  nav?.removeAttribute(LIVE_ATTR);
  Object.assign(rt, createRuntime(), { inside: rt.inside });
}

/** Chạy vòng khung hình (nếu chưa chạy): trôi `current → target`, vẽ, tự dừng khi đứng yên và dọn sạch khi về gốc. */
function animate(rt: DockMagnifyRuntime, getNav: () => HTMLElement | null): void {
  if (rt.raf) return;
  let last = 0;

  function frame(now: number) {
    rt.raf = 0;
    const nav = getNav();
    if (!nav) return;

    const dt = last ? Math.min(now - last, MAX_FRAME_MS) : 16;
    last = now;
    let moving = false;
    rt.current = rt.current.map((value, i) => {
      const next = dockMagnifyEase(value, rt.target[i], dt);
      if (next !== rt.target[i]) moving = true;
      return next;
    });
    paint(rt, nav);

    if (moving) rt.raf = window.requestAnimationFrame(frame);
    else if (rt.target.every((value) => value === 1)) clear(rt, nav);
  }

  rt.raf = window.requestAnimationFrame(frame);
}

/** Con trỏ di trên thanh: đo vị trí gốc nếu cần rồi đặt hệ số đích theo toạ độ con trỏ dọc trục. */
function track(
  rt: DockMagnifyRuntime,
  nav: HTMLElement,
  e: PointerEvent,
  vertical: boolean,
): boolean {
  if (e.pointerType === 'touch' || !window.matchMedia(MAGNIFY_MEDIA).matches) return false;
  if (rt.dirty && !measure(rt, nav, vertical)) return false;
  const pointer = (vertical ? e.clientY : e.clientX) - rt.navCenter;
  rt.target = dockMagnifyFit(
    dockMagnifyTargets(rt.slots, pointer, rt.radius),
    rt.slots,
    rt.maxGrow,
  );
  return true;
}

/**
 * useDockMagnify — phóng lân cận LIÊN TỤC kiểu Dock macOS: hệ số mỗi ô theo khoảng cách tới con trỏ dọc trục thanh
 * (vị trí GỐC đo lúc con trỏ vào), trôi mượt bằng vòng `requestAnimationFrame`, ô kề nhường chỗ vừa khít, vỏ nở đúng
 * bằng phần ô nở (chia đều hai đầu quanh tâm thanh — mép trên của Dock đáy đứng yên).
 *
 * Dùng:   useDockMagnify({ navRef, enabled: magnify && hasItems && !collapsed && !isCoarsePointer, frozen, position });
 * Lưu ý:  ⛔ Không re-render mỗi khung hình: chỉ ghi biến CSS (`--dock-t-scale` · `--dock-t-push` · `z-index` trên con
 *         của `<nav>`, `--dock-grow` + `data-dock-magnify="live"` trên `<nav>`); `dock-magnify.css` §1 dựng transform.
 *         Ô phóng = con mang `DOCK_MAGNIFY_ITEM_CLASS`, con khác chỉ dời theo. Nghe `pointer*` THẬT của DOM (không
 *         qua React): tooltip / panel là portal, sự kiện React coi chúng là con của `<nav>` nên không bao giờ "rời".
 *         `enabled` phải `false` khi `<nav>` chưa có (không mục) để effect gắn lại lúc thanh xuất hiện.
 *         Lý do thiết kế: notes/code/widgets.md.
 */
export function useDockMagnify({ navRef, enabled, frozen, position }: UseDockMagnifyOptions): void {
  const runtime = useRef<DockMagnifyRuntime>(createRuntime());
  const frozenRef = useRef(frozen);
  const vertical = position !== 'bottom';

  const getNav = useCallback(() => navRef.current, [navRef]);

  const release = useCallback(() => {
    const rt = runtime.current;
    if (rt.els.length === 0) return;
    rt.target = rt.target.map(() => 1);
    animate(rt, getNav);
  }, [getNav]);

  useEffect(() => {
    frozenRef.current = frozen;
    if (!frozen && !runtime.current.inside) release();
  }, [frozen, release]);

  useEffect(() => {
    const nav = getNav();
    if (!enabled || !nav) return undefined;
    const rt = runtime.current;

    const onMove = (e: PointerEvent) => {
      rt.inside = true;
      if (!frozenRef.current && track(rt, nav, e, vertical)) animate(rt, getNav);
    };
    const onEnter = (e: PointerEvent) => {
      rt.dirty = true;
      onMove(e);
    };
    const onLeave = () => {
      rt.inside = false;
      if (!frozenRef.current) release();
    };
    const markDirty = () => {
      rt.dirty = true;
    };

    nav.addEventListener('pointerenter', onEnter);
    nav.addEventListener('pointermove', onMove, { passive: true });
    nav.addEventListener('pointerleave', onLeave);
    window.addEventListener('resize', markDirty);
    return () => {
      nav.removeEventListener('pointerenter', onEnter);
      nav.removeEventListener('pointermove', onMove);
      nav.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', markDirty);
      clear(rt, nav);
    };
  }, [enabled, getNav, release, vertical]);
}

'use client';

import { useLayoutEffect, type RefObject } from 'react';

/** Biến CSS trên `:root` (px) = mép DƯỚI của thanh dọc lịch sử thẻ — vỏ ứng dụng đọc để xếp Dock trái bên dưới thanh. */
export const WORK_TABS_RAIL_BOTTOM_VAR = '--work-tabs-rail-bottom';

/**
 * usePublishRailBottom — khi thanh dọc đang dựng (`active`), ghi mép dưới của nó (px, `offsetTop + offsetHeight` — không
 * lệch theo hiệu ứng phóng lúc bung) vào `--work-tabs-rail-bottom` trên `document.documentElement`; cập nhật khi thanh đổi
 * cỡ (ResizeObserver) hoặc cửa sổ đổi cỡ; gỡ biến khi thanh ẩn / gỡ. Biến CSS = không widget nào phải import widget khác.
 *
 * @param railRef - Phần tử thanh (`position: fixed`).
 * @param active - Thanh đang dựng.
 *
 * @example
 * usePublishRailBottom(railRef, visible);
 */
export function usePublishRailBottom(railRef: RefObject<HTMLElement | null>, active: boolean) {
  useLayoutEffect(() => {
    const rail = railRef.current;
    if (!active || !rail) return;
    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(WORK_TABS_RAIL_BOTTOM_VAR, `${rail.offsetTop + rail.offsetHeight}px`);

    publish();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(publish);
    observer?.observe(rail);
    window.addEventListener('resize', publish);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', publish);
      root.style.removeProperty(WORK_TABS_RAIL_BOTTOM_VAR);
    };
  }, [active, railRef]);
}

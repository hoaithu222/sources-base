import { useLayoutEffect, type RefObject } from 'react';

const BOTTOM_CHROME_VAR = '--bottom-chrome';

/**
 * useBottomChromeInset — đo CHIỀU CAO THẬT của thanh tab đáy (gồm viền và vạch Home) và ghi vào `--bottom-chrome` trên `<html>`
 * để phần tử cố định ở đáy (toast, rail tiến trình) nằm ngay trên thanh: `max(--bottom-chrome, --safe-b)` + khe. Đo lại khi thanh đổi cỡ (xoay máy, đổi
 * cỡ chữ); gỡ biến khi thanh biến mất (laptop dùng Dock, danh sách mục rỗng).
 *
 * @param ref - Ref tới phần tử `<nav>` của thanh tab.
 * @param enabled - `false` → không đo, không ghi biến (thanh không được dựng).
 */
export function useBottomChromeInset(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  useLayoutEffect(() => {
    const bar = ref.current;
    if (!enabled || !bar) return;

    const root = document.documentElement;
    const publish = () =>
      root.style.setProperty(BOTTOM_CHROME_VAR, `${bar.getBoundingClientRect().height}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(bar);
    return () => {
      observer.disconnect();
      root.style.removeProperty(BOTTOM_CHROME_VAR);
    };
  }, [ref, enabled]);
}

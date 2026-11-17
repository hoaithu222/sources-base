'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { usePathname } from '@/core/i18n';

/** Vị trí cuộn đã lưu theo `<scope>:<pathname>` — sống qua lần layout dựng lại (vd ra 403 rồi Back). */
const SCROLL_POSITIONS = new Map<string, number>();

/**
 * Back / Forward vừa xảy ra mà chưa có lần đổi pathname nào dùng tới. Cấp MODULE (không phải `useRef`) vì `popstate` tới TRƯỚC khi
 * layout vừa bị gỡ dựng lại — hook mới chưa kịp gắn listener của riêng nó. Listener gắn một lần, lúc hook chạy lần đầu; cờ được hạ
 * bằng microtask SAU commit để mọi vùng cuộn trong cùng lượt render đều thấy nó.
 */
let poppedPending = false;
let listeningForPop = false;

function listenForPop(): void {
  if (listeningForPop) return;
  listeningForPop = true;
  window.addEventListener('popstate', () => {
    poppedPending = true;
  });
}

/**
 * useRouteScrollRestoration — quản vị trí cuộn của một vùng cuộn RIÊNG không dựng lại khi đổi route
 * (`<main overflow-y-auto>` của `AppShellLayout`): không có hook này thì sang trang mới vẫn đứng ở vị trí cuộn của trang cũ.
 *
 * Đổi `pathname` bằng liên kết / `router.push` → về đầu; Back / Forward → khôi phục vị trí đã lưu của trang đó; chỉ đổi
 * `?search` / `#hash` (lọc, tab trên URL) → giữ nguyên.
 * Lưu ý: bộ khôi phục cuộn mặc định của Next chỉ cuộn `window` nên không với tới vùng cuộn riêng. App Router không cho
 * biết kiểu điều hướng, nên Back / Forward nhận diện bằng sự kiện `popstate` (chỉ phát khi bấm Back / Forward — nó tới TRƯỚC
 * lần đổi pathname). Mỗi vùng cuộn một `scope` riêng. Trang tự tải dữ liệu sau khi hiện thì chỉ khôi phục được tới chiều
 * cao đang có.
 *
 * @param scrollRef - Ref tới phần tử cuộn (gắn vào `ref` của nó).
 * @param scope - Tên vùng cuộn (`'main'`…) — vị trí của các vùng khác nhau không lẫn vào nhau.
 *
 * @example
 * const mainRef = useRef<HTMLElement>(null);
 * useRouteScrollRestoration(mainRef, 'main');
 * return <main ref={mainRef} className="overflow-y-auto">…</main>;
 */
export function useRouteScrollRestoration(
  scrollRef: RefObject<HTMLElement | null>,
  scope: string,
): void {
  const pathname = usePathname();
  const keyRef = useRef(`${scope}:${pathname}`);
  const pathnameRef = useRef<string | null>(null);

  useEffect(listenForPop, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const remember = () => SCROLL_POSITIONS.set(keyRef.current, element.scrollTop);
    element.addEventListener('scroll', remember, { passive: true });
    return () => element.removeEventListener('scroll', remember);
  }, [scrollRef]);

  useLayoutEffect(() => {
    const pathnameChanged = pathnameRef.current !== pathname;
    keyRef.current = `${scope}:${pathname}`;
    pathnameRef.current = pathname;

    const element = scrollRef.current;
    if (!element || !pathnameChanged) return;
    element.scrollTop = poppedPending ? (SCROLL_POSITIONS.get(keyRef.current) ?? 0) : 0;
    queueMicrotask(() => {
      poppedPending = false;
    });
  }, [scrollRef, scope, pathname]);
}

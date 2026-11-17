import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Vị trí cuộn đã lưu theo `<scope>:<location.key>` — sống qua lần layout dựng lại (vd ra 403 rồi Back). */
const SCROLL_POSITIONS = new Map<string, number>();

/**
 * useRouteScrollRestoration — quản vị trí cuộn của một vùng cuộn RIÊNG không dựng lại khi đổi route
 * (`<main overflow-y-auto>` của `AppShellLayout`, khung `RootLayout`): không có hook này thì sang trang mới
 * vẫn đứng ở vị trí cuộn của trang cũ.
 *
 * Đổi `pathname` bằng PUSH / REPLACE → về đầu; POP (Back / Forward) → khôi phục vị trí đã lưu của mục
 * lịch sử đó (`location.key`); chỉ đổi `?search` / `#hash` (lọc, tab trên URL) → giữ nguyên.
 * Lưu ý: KHÔNG dùng `<ScrollRestoration>` của React Router — nó chỉ cuộn `window`. Mỗi vùng cuộn một `scope`
 * riêng. Trang tự tải dữ liệu sau khi hiện thì chỉ khôi phục được tới chiều cao đang có.
 *
 * @param scrollRef - Ref tới phần tử cuộn (gắn vào `ref` của nó).
 * @param scope - Tên vùng cuộn (`'main'`, `'root'`…) — vị trí của các vùng khác nhau không lẫn vào nhau.
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
  const { key, pathname } = useLocation();
  const navigationType = useNavigationType();
  const keyRef = useRef(`${scope}:${key}`);
  const pathnameRef = useRef<string | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const remember = () => SCROLL_POSITIONS.set(keyRef.current, element.scrollTop);
    element.addEventListener('scroll', remember, { passive: true });
    return () => element.removeEventListener('scroll', remember);
  }, [scrollRef]);

  useLayoutEffect(() => {
    const pathnameChanged = pathnameRef.current !== pathname;
    keyRef.current = `${scope}:${key}`;
    pathnameRef.current = pathname;

    const element = scrollRef.current;
    if (!element || !pathnameChanged) return;
    element.scrollTop = navigationType === 'POP' ? (SCROLL_POSITIONS.get(keyRef.current) ?? 0) : 0;
  }, [scrollRef, scope, key, pathname, navigationType]);
}

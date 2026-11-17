import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Vị trí cuộn đã lưu theo `<scope>:<location.key>` — sống qua lần layout dựng lại (vd ra 403 rồi Back). */
const SCROLL_POSITIONS = new Map<string, number>();

/** Trang tự tải dữ liệu sau khi hiện (cao dần) được chờ tối đa chừng này ms để cuộn tới đúng chỗ cũ. */
const RESTORE_BUDGET_MS = 1500;

/** Người dùng tự cuộn / bấm / gõ → bỏ khôi phục, không giằng lại vị trí họ vừa chọn. */
const USER_INPUT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

/**
 * Cuộn `element` tới `target`; chưa tới được (nội dung còn thấp hơn vị trí cần về) thì thử lại mỗi khung hình
 * trong `RESTORE_BUDGET_MS`. Trả hàm huỷ — gọi khi đổi trang / gỡ layout.
 */
function restoreScrollPosition(element: HTMLElement, target: number, onDone: () => void) {
  element.scrollTop = target;
  if (target === 0 || element.scrollTop >= target) {
    onDone();
    return () => undefined;
  }

  const startedAt = performance.now();
  let frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    USER_INPUT_EVENTS.forEach((type) => element.removeEventListener(type, finish));
  };
  function finish() {
    stop();
    onDone();
  }
  const step = () => {
    element.scrollTop = target;
    if (element.scrollTop >= target || performance.now() - startedAt > RESTORE_BUDGET_MS) {
      finish();
      return;
    }
    frame = requestAnimationFrame(step);
  };

  USER_INPUT_EVENTS.forEach((type) =>
    element.addEventListener(type, finish, { passive: true, once: true }),
  );
  frame = requestAnimationFrame(step);
  return stop;
}

/**
 * useRouteScrollRestoration — quản vị trí cuộn của một vùng cuộn RIÊNG không dựng lại khi đổi route
 * (`<main overflow-y-auto>` của `AppShellLayout`, khung `RootLayout`): không có hook này thì sang trang mới
 * vẫn đứng ở vị trí cuộn của trang cũ.
 *
 * Đổi `pathname` bằng PUSH / REPLACE → về đầu; POP (Back / Forward) → khôi phục vị trí đã lưu của mục
 * lịch sử đó (`location.key`); chỉ đổi `?search` / `#hash` (lọc, tab trên URL) → giữ nguyên.
 * Lưu ý: KHÔNG dùng `<ScrollRestoration>` của React Router — nó chỉ cuộn `window`. Mỗi vùng cuộn một `scope`
 * riêng. Trang tự tải dữ liệu sau khi hiện (cao dần) thì hook thử lại mỗi khung hình tới `RESTORE_BUDGET_MS` hoặc
 * tới khi người dùng tự cuộn; trong lúc chờ, vị trí bị trình duyệt kẹp thấp hơn KHÔNG được ghi đè vị trí đã lưu.
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
  const restoringRef = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const remember = () => {
      if (restoringRef.current) return;
      SCROLL_POSITIONS.set(keyRef.current, element.scrollTop);
    };
    element.addEventListener('scroll', remember, { passive: true });
    return () => element.removeEventListener('scroll', remember);
  }, [scrollRef]);

  useLayoutEffect(() => {
    const pathnameChanged = pathnameRef.current !== pathname;
    keyRef.current = `${scope}:${key}`;
    pathnameRef.current = pathname;

    const element = scrollRef.current;
    if (!element || !pathnameChanged) return;

    const target = navigationType === 'POP' ? (SCROLL_POSITIONS.get(keyRef.current) ?? 0) : 0;
    restoringRef.current = target > 0;
    const cancel = restoreScrollPosition(element, target, () => {
      restoringRef.current = false;
    });
    return () => {
      cancel();
      restoringRef.current = false;
    };
  }, [scrollRef, scope, key, pathname, navigationType]);
}

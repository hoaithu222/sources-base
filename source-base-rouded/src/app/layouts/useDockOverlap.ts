import { useEffect, type RefObject } from 'react';

/** Vỏ Dock (class móc của `dock.theme.ts`) — đo vị trí THẬT thay vì đoán số. */
const DOCK_SHELL_SELECTOR = '.dock-shell';

/**
 * Vùng tự khai "biết tránh Dock" (`PageBody` cuộn · khung cuộn `Table`) — CHỈ trong trang khoá
 * cao; trang trôi đã có đệm 80px của `<main>` (đo khi nó đang cuộn qua Dock sẽ làm khối giật).
 */
const DOCK_AWARE_SELECTOR = '[data-page-shell="scroll"] [data-dock-aware]';

/** Khe thở giữa nội dung cuối và mép trên Dock. */
const DOCK_OVERLAP_GAP = 8;

/**
 * Độ lấn (px) của Dock vào phần dưới `el`; chỉ vùng nằm trọn trong màn. `margin` (khung tự thu lên) đo theo mép dưới CŨ =
 * mép hiện tại + phần đã chừa, không thì đo lại sẽ dao động; `scroll` chỉ khi nội dung (trừ phần đã chừa) dài hơn vùng.
 */
function overlapOf(el: HTMLElement, dock: DOMRect): number {
  const box = el.getBoundingClientRect();
  const mode = el.dataset.dockAware;
  const applied = parseFloat(el.style.getPropertyValue('--dock-overlap')) || 0;
  if (mode === 'scroll' && el.scrollHeight - applied <= el.clientHeight + 1) return 0;
  const bottom = box.bottom + (mode === 'margin' ? applied : 0);
  if (bottom > window.innerHeight || box.right <= dock.left || box.left >= dock.right) return 0;
  return Math.max(0, Math.ceil(bottom - dock.top + DOCK_OVERLAP_GAP));
}

/**
 * useDockOverlap — Dock GHIM ĐÁY nổi đè lên trang khoá cao: đo vỏ Dock, vùng cuộn `[data-dock-aware]` nào nằm dưới nó
 * nhận `--dock-overlap` = đúng phần bị lấn (+ khe 8px). `"scroll"` (`PageBody`, khung cuộn `Table`): CHỈ khi nội dung dài hơn
 * vùng — chừa cuối để dòng cuối cuộn lên được trên Dock; vừa khung thì nội dung LẤP TRỌN tới đáy (Dock nổi giữa dải đáy, hai
 * bên vẫn là nội dung). `"margin"`: vùng tự thu lên. Vùng nằm trong vùng đã chừa thì bỏ qua (khỏi chừa hai lần). Đo lại theo khung (`ResizeObserver`), đổi trang (`MutationObserver`) và
 * cửa sổ — gộp vào một khung hình. Chỉ `AppShellLayout` gọi.
 *
 * @param mainRef - `<main>` của vỏ app.
 * @param enabled - Dock đang ghim ở cạnh đáy (máy tính / tablet).
 */
export function useDockOverlap(mainRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const main = mainRef.current;
    if (!main || !enabled || typeof ResizeObserver === 'undefined') return undefined;

    let frame = 0;
    let applied = new Set<HTMLElement>();
    const measure = () => {
      frame = 0;
      const dock = document
        .querySelector<HTMLElement>(DOCK_SHELL_SELECTOR)
        ?.getBoundingClientRect();
      const next = new Set<HTMLElement>();
      main.querySelectorAll<HTMLElement>(DOCK_AWARE_SELECTOR).forEach((el) => {
        if ([...next].some((outer) => outer.contains(el))) return;
        const overlap = dock ? overlapOf(el, dock) : 0;
        if (overlap <= 0) return;
        el.style.setProperty('--dock-overlap', `${overlap}px`);
        next.add(el);
      });
      applied.forEach((el) => !next.has(el) && el.style.removeProperty('--dock-overlap'));
      applied = next;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(main);
    const pages = new MutationObserver(schedule);
    pages.observe(main, { childList: true, subtree: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      pages.disconnect();
      window.removeEventListener('resize', schedule);
      applied.forEach((el) => el.style.removeProperty('--dock-overlap'));
    };
  }, [mainRef, enabled]);
}

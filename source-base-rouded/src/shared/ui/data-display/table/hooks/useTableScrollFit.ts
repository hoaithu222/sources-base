import { useCallback, useRef } from 'react';

/** Focus do bàn phím? Bấm chuột vào nút thì KHÔNG cuộn (cuộn giữa nhấn / nhả làm mất cú bấm). */
const isKeyboardFocus = (el: Element) => {
  try {
    return el.matches(':focus-visible');
  } catch {
    return true;
  }
};

/** Focus bàn phím vào một ô → kéo CẢ dòng vào vùng nhìn (đã trừ `scroll-padding`), không chỉ phần tử được focus. */
function revealFocusedRow(event: FocusEvent) {
  const target = event.target as Element;
  const row = target.closest('tr');
  if (row?.parentElement?.tagName === 'TBODY' && isKeyboardFocus(target)) {
    row.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}

/** Chiều cao LAYOUT có phần lẻ (px CSS, không bị `transform` của Modal / Drawer đang mở co giãn như rect). */
const usedHeight = (el: Element) => parseFloat(getComputedStyle(el).height) || 0;

/**
 * Ghi `scroll-padding` + chiều cao ô đệm. Đo phần trống khi đệm tạm = 0 (vùng cuộn cao theo nội dung → đệm về 0);
 * làm tròn XUỐNG theo 1/64px (đơn vị layout) — lố dù 1px là hiện thanh cuộn dọc.
 */
function fitTable(scroller: HTMLElement, table: HTMLTableElement, spacer: HTMLElement | null) {
  scroller.style.scrollPaddingTop = `${table.tHead?.offsetHeight ?? 0}px`;
  const dockOverlap = parseFloat(scroller.style.getPropertyValue('--dock-overlap')) || 0;
  scroller.style.scrollPaddingBottom = `${(table.tFoot?.offsetHeight ?? 0) + dockOverlap}px`;
  if (!spacer) return;
  spacer.style.height = '0px';
  const avail = usedHeight(scroller) - (scroller.offsetHeight - scroller.clientHeight);
  const gap = Math.floor((avail - usedHeight(table)) * 64) / 64;
  spacer.style.height = `${Math.max(0, gap)}px`;
}

/**
 * useTableScrollFit — đo `<thead>` / `<tfoot>` dính của `<Table>`: dòng tổng sát đáy, dòng focus không nấp dưới phần dính.
 *
 * - `scroll-padding-top/bottom` của vùng cuộn = chiều cao header / dòng tổng: `scrollIntoView` và focus bàn phím chừa
 *   chỗ cho phần dính; focus bàn phím vào ô còn kéo CẢ dòng vào vùng nhìn.
 * - Ô đệm (`spacerRef`, `<tbody>` riêng ngay trước `<tfoot>`) cao bằng phần trống còn lại của vùng cuộn → bảng ít dòng
 *   thì dòng tổng nằm sát đáy (ngay trên phân trang), khoảng trống dồn lên trên nó. Bảng cao theo nội dung → đệm 0.
 *
 * Lưu ý: ghi style THẲNG vào DOM trong callback `ResizeObserver` (không setState) — áp trước lần vẽ, không render lại
 * bảng. `attach` là phần thân của ref callback vùng cuộn (React 19: trả hàm dọn) — gắn theo NODE nên vùng cuộn dựng
 * lại (bật / tắt `scrollNav`, `sortable`) vẫn được theo dõi. Lý do: docs/notes/components/data-display-table.md.
 *
 * @param hasFooter - `true` khi đang dựng `<tfoot>` + ô đệm; đổi thì `attach` đổi → gắn lại observer.
 * @returns `{ attach, spacerRef }` — `attach(scroller)` gọi trong ref callback vùng cuộn, trả hàm dọn;
 *   `spacerRef` gắn vào `<td>` của dòng đệm.
 *
 * @example
 * const { attach, spacerRef } = useTableScrollFit(showFooter);
 * const setScrollNode = useCallback((node: HTMLDivElement | null) => (node ? attach(node) : undefined), [attach]);
 */
export function useTableScrollFit(hasFooter: boolean) {
  const spacerRef = useRef<HTMLTableCellElement>(null);

  const attach = useCallback(
    (scroller: HTMLDivElement) => {
      const table = scroller.querySelector('table');
      if (!table) return undefined;
      const fit = () => fitTable(scroller, table, spacerRef.current);
      fit();
      const observer = new ResizeObserver(fit);
      const footer = hasFooter ? table.tFoot : null;
      [scroller, table.tHead, table.tBodies[0], footer].forEach((el) => el && observer.observe(el));
      scroller.addEventListener('focusin', revealFocusedRow);
      return () => {
        observer.disconnect();
        scroller.removeEventListener('focusin', revealFocusedRow);
      };
    },
    [hasFooter],
  );

  return { attach, spacerRef };
}

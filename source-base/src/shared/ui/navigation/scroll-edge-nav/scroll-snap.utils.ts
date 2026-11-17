/**
 * scroll-snap.utils — mốc dừng khi cuộn NGANG theo CỘT cho `<ScrollEdgeNav>`: bấm 1 nhịp đi đúng MỘT cột
 * (mép trái cột kế tiếp về sát mép vùng cuộn), không nhảy gần một khung màn hình qua nhiều cột.
 *
 * Dùng:   <ScrollEdgeNav getStops={() => measureColumnStops(scrollEl, frozenCount)} />
 *         el.scrollTo({ left: resolveScrollStop(stops, el.scrollLeft, 1, el.scrollWidth - el.clientWidth) });
 */

/** Sai số khi so mép / so mốc (px) — tránh nút nhấp nháy vì lẻ nửa pixel khi zoom trình duyệt. */
export const SCROLL_EDGE_EPSILON = 2;

/**
 * Đo mốc dừng theo cột của `<table>` nằm trong vùng cuộn `root`.
 * `stickyCount` = số cột ghim LIÊN TIẾP từ trái; bề rộng khối ghim bị trừ vì cột cuộn đầu tiên nấp ngay sau nó.
 */
export function measureColumnStops(root: HTMLElement | null, stickyCount = 0): number[] {
  const head = root?.querySelector('thead > tr');
  if (!root || !head) return [];

  const cells = Array.from(head.children) as HTMLElement[];
  let stickyWidth = 0;
  for (let i = 0; i < Math.min(stickyCount, cells.length); i += 1) {
    stickyWidth += cells[i].offsetWidth;
  }

  const rootLeft = root.getBoundingClientRect().left;
  const stops = [0];
  for (let i = stickyCount; i < cells.length; i += 1) {
    const x = cells[i].getBoundingClientRect().left - rootLeft + root.scrollLeft - stickyWidth;
    if (x > SCROLL_EDGE_EPSILON) stops.push(x);
  }
  return stops;
}

/** Mốc kế tiếp theo hướng `dir` (1 = sang phải, -1 = sang trái), kẹp trong `[0, max]`; hết mốc → về hẳn mép. */
export function resolveScrollStop(
  stops: readonly number[],
  current: number,
  dir: -1 | 1,
  max: number,
): number {
  const sorted = Array.from(new Set(stops.map((s) => Math.min(Math.max(s, 0), max)))).sort(
    (a, b) => a - b,
  );

  if (dir === 1) return sorted.find((s) => s > current + SCROLL_EDGE_EPSILON) ?? max;

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if (sorted[i] < current - SCROLL_EDGE_EPSILON) return sorted[i];
  }
  return 0;
}

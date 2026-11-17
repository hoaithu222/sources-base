import { DOCK_DURATION, DOCK_TRIGGER_ZONE } from './dock.theme';

/**
 * dock-reveal.utils.ts — hàm thuần của `useDockReveal`: vùng con trỏ ở mép dưới và thời gian bung thanh.
 *
 * Dùng:   isInTriggerZone(e) → bắt đầu gọi thanh ra · isInShellZone(e, nav) → giữ thanh · clearTimer(ref)
 *         · revealDurationMs(itemCount) → lúc chuyển pha `opening` → `shown`.
 */

/** Đệm (px) quanh khung thanh: con trỏ còn trong vùng này thì thanh chưa thu. */
const SHELL_ZONE_PAD_PX = 8;

/** Vạch ngăn + nút cài đặt cũng bay vào theo (sau các mục) nên tính thêm vào thời gian chờ. */
const TAIL_ENTER_SLOTS = 2;

/** Con trỏ ở dải kích hoạt giữa mép dưới màn hình (`DOCK_TRIGGER_ZONE`, khớp `.dock-hint`). */
export function isInTriggerZone(e: MouseEvent): boolean {
  return (
    e.clientY >= window.innerHeight - DOCK_TRIGGER_ZONE.height &&
    Math.abs(e.clientX - window.innerWidth / 2) <= DOCK_TRIGGER_ZONE.halfWidth
  );
}

/** Con trỏ ở trong khung thanh (+ `SHELL_ZONE_PAD_PX`). */
export function isInShellZone(e: MouseEvent, nav: HTMLElement): boolean {
  const r = nav.getBoundingClientRect();
  return (
    e.clientX >= r.left - SHELL_ZONE_PAD_PX &&
    e.clientX <= r.right + SHELL_ZONE_PAD_PX &&
    e.clientY >= r.top - SHELL_ZONE_PAD_PX &&
    e.clientY <= r.bottom + SHELL_ZONE_PAD_PX
  );
}

/** Huỷ hẹn giờ đang giữ trong `ref` (nếu có) và xoá dấu. */
export function clearTimer(ref: { current: number | null }): void {
  if (ref.current === null) return;
  window.clearTimeout(ref.current);
  ref.current = null;
}

/** Thời gian (ms) từ lúc bung tới khi icon CUỐI bay xong — sớm hơn là icon giật một nhịp. */
export function revealDurationMs(itemCount = 0): number {
  const count = itemCount + TAIL_ENTER_SLOTS;
  return Math.max(
    DOCK_DURATION.shellOpen,
    count * DOCK_DURATION.iconStagger + DOCK_DURATION.iconEnter,
  );
}

'use client';

import { useMemo, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';

const NAV_ITEM = '[data-nav-item]';
const ROW = '[data-panel-row]';
const ROW_LINK = '[data-row-link]';

const isRowLink = (node: Element | null): node is HTMLElement =>
  node instanceof HTMLElement && node.matches(ROW_LINK);

/** Mục đi được bằng ↑↓ theo thứ tự DOM, bỏ mục nằm trong vùng `inert` (đang ẩn). */
const navItemsOf = (panel: HTMLElement | null) =>
  [...(panel?.querySelectorAll<HTMLElement>(NAV_ITEM) ?? [])].filter(
    (item) => !item.closest('[inert]'),
  );

const isTypingField = (node: EventTarget) =>
  node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement;

function handleKeyDown(event: KeyboardEvent<HTMLElement>, panel: HTMLElement | null) {
  if (event.nativeEvent.isComposing) return;
  const items = navItemsOf(panel);
  const focused = document.activeElement;
  const index = items.findIndex((item) => item === focused || item.closest(ROW)?.contains(focused));
  const typing = isTypingField(event.target);
  if (event.key === 'Enter' && typing) {
    event.preventDefault();
    items
      .slice(index + 1)
      .find((item) => item.matches(ROW_LINK))
      ?.click();
    return;
  }
  const targets: Partial<Record<string, HTMLElement | undefined>> = {
    ArrowDown: items[index + 1] ?? (index < 0 ? items[0] : undefined),
    ArrowUp: index > 0 ? items[index - 1] : undefined,
    ...(typing ? {} : { Home: items[0], End: items.at(-1) }),
  };
  if (!(event.key in targets)) return;
  event.preventDefault();
  targets[event.key]?.focus();
}

function followPointer(event: PointerEvent<HTMLElement>) {
  if (!isRowLink(document.activeElement)) return;
  const link = (event.target as Element).closest(ROW)?.querySelector(ROW_LINK) ?? null;
  if (isRowLink(link) && link !== document.activeElement) link.focus({ preventScroll: true });
}

/**
 * usePanelKeyNav — phím của bảng lịch sử thẻ: ↑ / ↓ chuyển TIÊU ĐIỂM THẬT qua các mục `[data-nav-item]` theo thứ tự (dòng
 * thẻ — Enter mở như bấm · ô lọc · "Trang chủ"), Home / End về đầu / cuối; Enter trong ô lọc mở dòng
 * khớp đầu tiên (bỏ qua khi đang gõ dở IME). Mục trong vùng `inert` bị bỏ qua. Rê chuột lên dòng khác lúc tiêu điểm đang
 * ở một dòng → tiêu điểm theo chuột (một dòng sáng như menu macOS). `focusNeighbour(path)` gọi TRƯỚC khi gỡ dòng để tiêu
 * điểm sang dòng kế. Esc do `Popover` lo.
 *
 * @param panelRef - Khung bảng (chứa mọi mục).
 *
 * @example
 * const { onKeyDown, onPointerMove, focusNeighbour } = usePanelKeyNav(panelRef);
 */
export function usePanelKeyNav(panelRef: RefObject<HTMLElement | null>) {
  return useMemo(
    () => ({
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleKeyDown(event, panelRef.current),
      onPointerMove: followPointer,
      focusNeighbour: (path: string) => {
        const links = navItemsOf(panelRef.current).filter((item) => item.matches(ROW_LINK));
        const index = links.findIndex((link) => link.dataset.path === path);
        (links[index + 1] ?? links[index - 1] ?? panelRef.current)?.focus({ preventScroll: true });
      },
    }),
    [panelRef],
  );
}

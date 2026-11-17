import { createContext, useCallback, useContext } from 'react';

/**
 * header-slots.context.ts — hai context nối ô slot của `<Header>` với nội dung page bơm vào.
 *
 * Dùng:   `<Header>` gắn `useHeaderSlotRef(name)` lên container của từng ô; `HeaderSlotPortal` đọc
 *         `useHeaderSlotNode(name)`; `HeaderSlotsProvider` giữ bản đồ node.
 * Lưu ý:  ⛔ Hai context RIÊNG, đừng gộp: callback ref của `<Header>` chỉ được phụ thuộc
 *         `HeaderSlotSetterContext` (identity ổn định); gộp với bản đồ node thì ref đổi theo node
 *         → detach → attach → set state → vòng lặp vô tận.
 */

/** `start` = mép trái · `title` = cụm tâm · `end` = mép phải · `nav` = dải tab dưới top bar (CHỈ top bar điện thoại có ô này). */
export type HeaderSlotName = 'start' | 'title' | 'end' | 'nav';

export type HeaderSlotNodes = Record<HeaderSlotName, HTMLElement | null>;
export type SetHeaderSlotNode = (name: HeaderSlotName, node: HTMLElement | null) => void;

export const EMPTY_HEADER_SLOT_NODES: HeaderSlotNodes = {
  start: null,
  title: null,
  end: null,
  nav: null,
};

export const HeaderSlotNodesContext = createContext<HeaderSlotNodes>(EMPTY_HEADER_SLOT_NODES);
export const HeaderSlotSetterContext = createContext<SetHeaderSlotNode | null>(null);

/**
 * useHeaderSlotRef — dùng TRONG `<Header>`: trả callback ref gắn vào container của ô `name`.
 * Identity ổn định nên React chỉ gọi 1 lần lúc mount, 1 lần lúc unmount.
 */
export function useHeaderSlotRef(name: HeaderSlotName) {
  const setNode = useContext(HeaderSlotSetterContext);
  return useCallback((node: HTMLElement | null) => setNode?.(name, node), [setNode, name]);
}

/** useHeaderSlotNode — DOM node của ô `name`; `null` khi chưa có provider hoặc header chưa mount. */
export function useHeaderSlotNode(name: HeaderSlotName): HTMLElement | null {
  return useContext(HeaderSlotNodesContext)[name];
}

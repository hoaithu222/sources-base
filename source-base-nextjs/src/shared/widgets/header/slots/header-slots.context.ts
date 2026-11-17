'use client';

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

/**
 * `start` = trước tab bên TRÁI · `tabsLeft` / `tabsRight` = nửa trái / nửa phải tab của trang hai bên khối tiêu đề (máy tính
 * ≥ `xl`) · `end` = mép phải trước ô tìm kiếm · `title` / `nav` = tên + dải tab của top bar ĐIỆN THOẠI.
 */
export type HeaderSlotName = 'start' | 'title' | 'tabsLeft' | 'tabsRight' | 'end' | 'nav';

export type HeaderSlotNodes = Record<HeaderSlotName, HTMLElement | null>;
export type SetHeaderSlotNode = (name: HeaderSlotName, node: HTMLElement | null) => void;

export const EMPTY_HEADER_SLOT_NODES: HeaderSlotNodes = {
  start: null,
  title: null,
  tabsLeft: null,
  tabsRight: null,
  end: null,
  nav: null,
};

export const HeaderSlotNodesContext = createContext<HeaderSlotNodes>(EMPTY_HEADER_SLOT_NODES);
export const HeaderSlotSetterContext = createContext<SetHeaderSlotNode | null>(null);

/**
 * Thông tin TRANG do `<PageHeader>` báo lên (chỉ giá trị nguyên thuỷ — đổi mới set lại, không vòng lặp): khối tiêu đề giữa
 * thanh hiện `title` (tooltip `subtitle`), `hasTabs` → hai bên thanh là tab của TRANG thay cho dải màn hình phân hệ.
 */
export interface HeaderPageMeta {
  title: string;
  subtitle?: string;
  tone?: string;
  hasTabs: boolean;
}

export const HeaderPageContext = createContext<HeaderPageMeta | null>(null);
export const HeaderPageSetterContext = createContext<
  ((meta: HeaderPageMeta | null) => void) | null
>(null);

/** useHeaderPage — thông tin trang đang mở (`null`: trang không dựng `PageHeader` hoặc chưa có provider). */
export function useHeaderPage(): HeaderPageMeta | null {
  return useContext(HeaderPageContext);
}

/** useSetHeaderPage — dùng trong `PageHeader`: báo thông tin trang lên thanh (identity ổn định). */
export function useSetHeaderPage() {
  return useContext(HeaderPageSetterContext);
}

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

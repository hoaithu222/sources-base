import { useCallback, useState } from 'react';
import type { ReactNode } from 'react';

import {
  EMPTY_HEADER_SLOT_NODES,
  HeaderSlotNodesContext,
  HeaderSlotSetterContext,
  type HeaderSlotNodes,
  type SetHeaderSlotNode,
} from './header-slots.context';

interface HeaderSlotsProviderProps {
  children: ReactNode;
}

/**
 * HeaderSlotsProvider — cầu nối cho PAGE render nội dung vào THANH HEADER toàn cục (tiêu đề module ở
 * giữa, nav / action đẩy ra hai mép, qua `<PageHeader>`). Đặt ở layout gốc, bọc CẢ `<Header>` lẫn vùng
 * nội dung.
 *
 * Lưu ý: thiếu provider (showcase, test, trang đứng riêng) thì `<PageHeader>` im lặng không hiện gì —
 * không crash.
 *
 * @param props.children - Cây chứa cả `<Header>` lẫn vùng nội dung của layout.
 *
 * @example
 * <HeaderSlotsProvider>
 *   <Header brandLabel="APP" />
 *   <main><Outlet /></main>
 * </HeaderSlotsProvider>
 */
function HeaderSlotsProvider({ children }: HeaderSlotsProviderProps) {
  const [nodes, setNodes] = useState<HeaderSlotNodes>(EMPTY_HEADER_SLOT_NODES);

  const setNode = useCallback<SetHeaderSlotNode>((name, node) => {
    setNodes((prev) => (prev[name] === node ? prev : { ...prev, [name]: node }));
  }, []);

  return (
    <HeaderSlotSetterContext.Provider value={setNode}>
      <HeaderSlotNodesContext.Provider value={nodes}>{children}</HeaderSlotNodesContext.Provider>
    </HeaderSlotSetterContext.Provider>
  );
}

export default HeaderSlotsProvider;

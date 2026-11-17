'use client';

import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useHeaderSlotNode, type HeaderSlotName } from './header-slots.context';

interface HeaderSlotPortalProps {
  slot: HeaderSlotName;
  children: ReactNode;
}

/**
 * HeaderSlotPortal — bơm `children` vào một ô của thanh header toàn cục; page thường dùng qua
 * `<PageHeader>` thay vì gọi trực tiếp.
 *
 * Render `null` khi chưa có `HeaderSlotsProvider` / header chưa mount xong. Là PORTAL (không lưu node vào
 * store) nên nội dung vẫn dùng được context của page (router, query…).
 *
 * @param props.slot - Ô đích: `start` (mép trái) | `title` (cụm tâm) | `end` (mép phải) | `nav` (dải tab, chỉ có ở
 *   top bar điện thoại — nơi khác không có ô này thì không render gì).
 * @param props.children - Nội dung bơm vào; `null` / `false` → không render gì.
 *
 * @example
 * <HeaderSlotPortal slot="end">
 *   <Badge color="warning">Bản nháp</Badge>
 * </HeaderSlotPortal>
 */
function HeaderSlotPortal({ slot, children }: HeaderSlotPortalProps) {
  const target = useHeaderSlotNode(slot);

  if (!target || children == null || children === false) return null;

  return createPortal(children, target);
}

export default HeaderSlotPortal;

'use client';

import { useCallback, useState } from 'react';

interface UseDisclosureReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Đặt đúng trạng thái được yêu cầu — truyền thẳng vào `onOpenChange` của Modal / Drawer / Popover. */
  onOpenChange: (open: boolean) => void;
}

/**
 * useDisclosure — trạng thái mở / đóng cho modal, drawer, popover, lightbox.
 *
 * Lưu ý: nối `onOpenChange={x.onOpenChange}`, KHÔNG `onOpenChange={x.toggle}` — `toggle` bỏ qua giá
 * trị được yêu cầu, nên khi component tự báo "đóng" sau lúc bạn đã `close()` thì nó lại MỞ ra.
 *
 * @param defaultOpen - Trạng thái ban đầu. Mặc định `false`.
 * @returns `isOpen` · `open()` · `close()` · `toggle()` (cho nút bật/tắt) · `onOpenChange(open)`.
 *
 * @example
 * const dialog = useDisclosure();
 * <Button onClick={dialog.open}>Sửa</Button>
 * <FormModal open={dialog.isOpen} onOpenChange={dialog.onOpenChange} onConfirm={save} … />
 */
export function useDisclosure(defaultOpen = false): UseDisclosureReturn {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle, onOpenChange: setIsOpen };
}

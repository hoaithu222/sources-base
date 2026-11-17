import { useCallback, useState } from 'react';

import { useDisclosure } from './useDisclosure';

interface UseDeleteWithConfirmOptions {
  onConfirm: (id: number) => Promise<void>;
}

interface UseDeleteWithConfirmReturn {
  isOpen: boolean;
  pendingId: number | null;
  pendingName: string;
  isDeleting: boolean;
  requestDelete: (id: number, name: string) => void;
  confirm: () => Promise<void>;
  cancel: () => void;
}

/**
 * `const del = useDeleteWithConfirm({ onConfirm: (id) => remove(id) })`; `del.requestDelete(id, name)` mở hộp thoại.
 * Render `ConfirmDialog` với `del.isOpen`, `del.pendingName`; nối `del.confirm` / `del.cancel` vào hai nút.
 * `pendingId` chụp lúc `requestDelete` nên refetch danh sách không làm lệch đối tượng xoá.
 */
export function useDeleteWithConfirm(
  options: UseDeleteWithConfirmOptions,
): UseDeleteWithConfirmReturn {
  const { onConfirm } = options;
  const { isOpen, open, close } = useDisclosure();
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const reset = useCallback(() => {
    setPendingId(null);
    setPendingName('');
  }, []);

  const requestDelete = useCallback(
    (id: number, name: string) => {
      setPendingId(id);
      setPendingName(name);
      open();
    },
    [open],
  );

  const confirm = useCallback(async () => {
    if (pendingId == null) return;
    setIsDeleting(true);
    try {
      await onConfirm(pendingId);
      close();
      reset();
    } finally {
      setIsDeleting(false);
    }
  }, [pendingId, onConfirm, close, reset]);

  const cancel = useCallback(() => {
    close();
    reset();
  }, [close, reset]);

  return {
    isOpen,
    pendingId,
    pendingName,
    isDeleting,
    requestDelete,
    confirm,
    cancel,
  };
}

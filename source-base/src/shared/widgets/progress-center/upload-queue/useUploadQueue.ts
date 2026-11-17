import { useMemo } from 'react';

import type { UploadFile } from '@/shared/ui';

import { useUploadQueueStore } from './upload-queue.store';

export interface UploadQueueSummary {
  total: number;
  done: number;
  failed: number;
  /** Task đầu tiên đang tải hoặc chờ tải (nếu có) — nguồn tên tệp + %. */
  active?: UploadFile;
  /** Xong SẠCH: có task và không còn task nào lỗi/đang chạy. */
  allDone: boolean;
}

interface UseUploadQueueReturn {
  tasks: UploadFile[];
  enqueue: ReturnType<typeof useUploadQueueStore.getState>['enqueue'];
  retryFailed: () => void;
  clear: () => void;
  cancel: () => void;
  summary: UploadQueueSummary;
}

/**
 * useUploadQueue — hàng đợi TẢI LÊN dùng chung toàn app (trình duyệt đang đẩy tệp lên), thẻ
 * `UploadQueueCard` của `ProgressCenter` tự hiện tiến độ.
 *
 * Dùng:   const { enqueue } = useUploadQueue();
 *         enqueue(files, (file, { onProgress, signal }) => api.upload(file, onProgress, signal));
 * Lưu ý:  chỉ đọc store + tổng hợp `summary` (điều phối thật nằm trong store, ngoài React) nên mount ở
 *         nhiều component cùng lúc vẫn an toàn.
 */
export function useUploadQueue(): UseUploadQueueReturn {
  const tasks = useUploadQueueStore((s) => s.tasks);
  const enqueue = useUploadQueueStore((s) => s.enqueue);
  const retryFailed = useUploadQueueStore((s) => s.retryFailed);
  const clear = useUploadQueueStore((s) => s.clear);
  const cancel = useUploadQueueStore((s) => s.cancel);

  const summary = useMemo<UploadQueueSummary>(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'success').length;
    const failed = tasks.filter((t) => t.status === 'error').length;
    const active = tasks.find((t) => t.status === 'uploading' || t.status === 'pending');
    return { total, done, failed, active, allDone: total > 0 && done === total };
  }, [tasks]);

  return { tasks, enqueue, retryFailed, clear, cancel, summary };
}

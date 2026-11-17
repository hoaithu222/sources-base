import { create } from 'zustand';

import { generateFileId, type UploadFile, type UploadHandler } from '@/shared/ui';

/**
 * upload-queue.store — hàng đợi TẢI LÊN dùng chung toàn app, chạy tuần tự từng tệp.
 *
 * Dùng:   const { enqueue } = useUploadQueue();   enqueue(files, uploader);   // `UploadHandler`
 * Lưu ý:  ⛔ Dùng LẠI `UploadFile` / `UploadHandler` của UI kit, KHÔNG tự định nghĩa bộ trạng thái thứ
 *         hai. Store KHÔNG gọi API nào — caller truyền `uploader` khi `enqueue`; mỗi tệp chạy bằng
 *         `uploader` của lần `enqueue` tạo ra nó, kể cả khi bấm "Thử lại". Sống NGOÀI cây React nên
 *         tiến trình vẫn chạy khi người dùng sang màn khác.
 */

interface UploadQueueState {
  tasks: UploadFile[];
  /** Đẩy tệp vào hàng đợi và chạy ngay (tuần tự). Trả về id các task vừa tạo. */
  enqueue: (files: File[], uploader: UploadHandler) => string[];
  /** Chạy lại các task lỗi, mỗi task bằng `uploader` của lần `enqueue` đã tạo ra nó. */
  retryFailed: () => void;
  /** Huỷ task đang chạy + xoá sạch hàng đợi; kết quả muộn của lượt chạy cũ bị bỏ qua. */
  cancel: () => void;
  /** Xoá sạch hàng đợi (không huỷ task đang chạy). */
  clear: () => void;
  /** Cập nhật một task; bỏ qua id đã bị xoá (kết quả muộn không dựng lại task). */
  update: (id: string, patch: Partial<UploadFile>) => void;
}

interface Runner {
  controller: AbortController | null;
}

const UPLOAD_FAILED_MESSAGE = 'Tải lên thất bại';

const handlers = new Map<string, UploadHandler>();
let runner: Runner | null = null;

async function drain(): Promise<void> {
  if (runner) return;
  const self: Runner = { controller: null };
  runner = self;
  try {
    while (runner === self) {
      const { tasks, update } = useUploadQueueStore.getState();
      const next = tasks.find((t) => t.status === 'pending');
      if (!next) return;

      const handler = handlers.get(next.id);
      if (!handler) {
        update(next.id, { status: 'error', error: UPLOAD_FAILED_MESSAGE });
        continue;
      }

      const controller = new AbortController();
      self.controller = controller;
      const isLive = () => runner === self && self.controller === controller;
      update(next.id, { status: 'uploading', progress: 0 });
      try {
        const url = await handler(next.file as File, {
          onProgress: (percent) => {
            if (isLive()) update(next.id, { progress: Math.round(percent) });
          },
          signal: controller.signal,
        });
        if (!isLive()) return;
        handlers.delete(next.id);
        update(next.id, { status: 'success', progress: 100, url });
      } catch (err) {
        if (!isLive()) return;
        update(next.id, {
          status: 'error',
          error: err instanceof Error ? err.message : UPLOAD_FAILED_MESSAGE,
        });
      } finally {
        self.controller = null;
      }
    }
  } finally {
    if (runner === self) runner = null;
  }
}

export const useUploadQueueStore = create<UploadQueueState>((set, get) => ({
  tasks: [],

  enqueue: (files, uploader) => {
    const created: UploadFile[] = files.map((file) => ({
      id: generateFileId(),
      file,
      name: file.name,
      size: file.size,
      type: file.type.toLowerCase(),
      status: 'pending',
      progress: 0,
    }));
    created.forEach((task) => handlers.set(task.id, uploader));
    set((s) => ({ tasks: [...s.tasks, ...created] }));
    void drain();
    return created.map((t) => t.id);
  },

  retryFailed: () => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.status === 'error' ? { ...t, status: 'pending', progress: 0, error: undefined } : t,
      ),
    }));
    void drain();
  },

  cancel: () => {
    const running = runner?.controller;
    runner = null;
    handlers.clear();
    set({ tasks: [] });
    running?.abort();
  },

  clear: () => {
    handlers.clear();
    set({ tasks: [] });
  },

  update: (id, patch) => {
    if (!get().tasks.some((t) => t.id === id)) return;
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
  },
}));

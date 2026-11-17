import { create } from 'zustand';

import type { ProgressCardStatus } from '../progress-center.types';

/**
 * server-task.store — danh sách TÁC VỤ CHẠY DÀI phía máy chủ (nhập Excel, kết xuất báo cáo…).
 *
 * Dùng:   const { start, update, finishSuccess, finishError } = useServerTasks();
 * Lưu ý:  trình duyệt KHÔNG làm gì, chỉ theo dõi việc máy chủ chạy; luồng gọi API tự bơm tiến độ qua
 *         `update` / `finishSuccess` / `finishError` (store không dính SSE / WebSocket / REST).
 *         Id đã bị xoá (`remove` / `clear`) thì mọi lời gọi cập nhật muộn bị bỏ qua.
 */

export interface ServerTask {
  id: string;
  label: string;
  fileName?: string;
  status: ProgressCardStatus;
  message: string;
  /** Tiến độ %, bỏ trống khi máy chủ không trả về. */
  progress?: number;
  startedAt: number;
  /** Tự đóng sau bao lâu kể từ lúc xong (ms). Bỏ trống → mặc định của `ServerTaskList`. */
  autoDismissMs?: number;
}

export type ServerTaskInit = Omit<ServerTask, 'id' | 'status' | 'startedAt'> &
  Partial<Pick<ServerTask, 'status'>>;

interface ServerTaskState {
  tasks: ServerTask[];
  /** Thêm một tác vụ (mặc định `running`); trả về id để cập nhật về sau. */
  start: (init: ServerTaskInit) => string;
  update: (id: string, patch: Partial<ServerTask>) => void;
  finishSuccess: (id: string, message: string) => void;
  finishError: (id: string, message: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

let seq = 0;
const nextId = () => `task-${++seq}`;

export const useServerTaskStore = create<ServerTaskState>((set) => ({
  tasks: [],

  start: (init) => {
    const id = nextId();
    set((s) => ({
      tasks: [...s.tasks, { ...init, id, status: init.status ?? 'running', startedAt: Date.now() }],
    }));
    return id;
  },

  update: (id, patch) =>
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  finishSuccess: (id, message) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, status: 'success', message, progress: 100 } : t,
      ),
    })),

  finishError: (id, message) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, status: 'error', message } : t)),
    })),

  remove: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  clear: () => set({ tasks: [] }),
}));

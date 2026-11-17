import { useServerTaskStore, type ServerTask, type ServerTaskInit } from './server-task.store';

interface UseServerTasksReturn {
  tasks: ServerTask[];
  start: (init: ServerTaskInit) => string;
  update: (id: string, patch: Partial<ServerTask>) => void;
  finishSuccess: (id: string, message: string) => void;
  finishError: (id: string, message: string) => void;
  remove: (id: string) => void;
}

/**
 * useServerTasks — theo dõi TÁC VỤ CHẠY DÀI phía máy chủ (nhập Excel, kết xuất báo cáo…); thẻ của
 * `ServerTaskList` trong `ProgressCenter` tự hiện tiến độ.
 *
 * Dùng:   const { start, update, finishSuccess, finishError } = useServerTasks();
 *         const id = start({ label: 'Nhập vật tư', fileName: 'vt.xlsx', message: 'Đang đọc tệp…' });
 *         update(id, { progress: 40 });  →  finishSuccess(id, 'Đã nhập 400 dòng');
 * Lưu ý:  trình duyệt chỉ THEO DÕI; luồng gọi API tự bơm tiến độ. Thẻ xong tự đóng sau 10 giây, thẻ lỗi
 *         ở lại tới khi người dùng bấm × (trừ khi tác vụ tự khai `autoDismissMs`).
 */
export function useServerTasks(): UseServerTasksReturn {
  const tasks = useServerTaskStore((s) => s.tasks);
  const start = useServerTaskStore((s) => s.start);
  const update = useServerTaskStore((s) => s.update);
  const finishSuccess = useServerTaskStore((s) => s.finishSuccess);
  const finishError = useServerTaskStore((s) => s.finishError);
  const remove = useServerTaskStore((s) => s.remove);

  return { tasks, start, update, finishSuccess, finishError, remove };
}

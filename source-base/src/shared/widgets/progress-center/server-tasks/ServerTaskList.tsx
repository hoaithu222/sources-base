import { memo, useCallback } from 'react';

import { ProgressCard } from '../card';
import type { ServerTask } from './server-task.store';
import { useServerTasks } from './useServerTasks';

interface ServerTaskCardProps {
  task: ServerTask;
  onClose: (id: string) => void;
}

const MAX_VISIBLE = 3;

const AUTO_DISMISS_MS = 10_000;

const ServerTaskCard = memo(function ServerTaskCard({ task, onClose }: ServerTaskCardProps) {
  const isRunning = task.status === 'running';
  const handleClose = useCallback(() => onClose(task.id), [onClose, task.id]);

  const autoCloseMs =
    task.status === 'error' ? task.autoDismissMs : (task.autoDismissMs ?? AUTO_DISMISS_MS);

  return (
    <ProgressCard
      autoCloseMs={autoCloseMs}
      message={task.message}
      progress={isRunning ? task.progress : undefined}
      status={task.status}
      subtitle={task.fileName}
      title={task.label}
      onClose={isRunning ? undefined : handleClose}
    />
  );
});

/**
 * ServerTaskList — thẻ của các tác vụ chạy dài phía máy chủ (`useServerTasks`); không tự neo,
 * `ProgressCenter` lo chỗ đứng. Không có prop: đọc thẳng danh sách tác vụ dùng chung.
 *
 * Mới nhất lên trên, tối đa `MAX_VISIBLE` (3) thẻ — nhiều hơn thì rail cao quá nửa màn và che nội dung
 * đang làm. Đang chạy: không có nút ×. Thành công: tự đóng sau `AUTO_DISMISS_MS` (10 giây, rê chuột thì
 * dừng đếm). Lỗi: ở lại tới khi bấm × — trừ khi tác vụ tự khai `autoDismissMs`.
 *
 * @example
 * const { start, finishSuccess } = useServerTasks();   // từ màn bất kỳ — thẻ tự hiện
 * const id = start({ label: 'Nhập vật tư', message: 'Đang đọc tệp…' });
 */
const ServerTaskList = memo(function ServerTaskList() {
  const { tasks, remove } = useServerTasks();

  const visible = [...tasks].sort((a, b) => b.startedAt - a.startedAt).slice(0, MAX_VISIBLE);

  if (visible.length === 0) return null;

  return (
    <>
      {visible.map((task) => (
        <ServerTaskCard key={task.id} task={task} onClose={remove} />
      ))}
    </>
  );
});

export default ServerTaskList;

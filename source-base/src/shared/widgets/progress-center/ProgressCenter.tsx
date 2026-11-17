import { memo } from 'react';

import { PROGRESS_CENTER_RAIL_CLASSES } from './progress-center.theme';
import { ServerTaskList } from './server-tasks';
import { UploadQueueCard } from './upload-queue';

/**
 * ProgressCenter — ĐIỂM MOUNT DUY NHẤT của mọi thẻ tiến trình neo góc dưới phải màn hình: thẻ tác vụ máy
 * chủ (`useServerTasks`) xếp trên, thẻ hàng đợi tải lên (`useUploadQueue`) xếp dưới. Không có prop.
 *
 * Mount MỘT lần ở provider gốc (`app/providers/AppOverlays.tsx`); store phía sau là global nên thẻ sống
 * sót khi đổi route / đóng modal. Đổi / mất tài khoản → `resetProgressCenter()`.
 * Sửa giao diện: chỗ đứng · bề rộng rail → `PROGRESS_CENTER_RAIL_CLASSES` · thẻ → `card/progress-card.theme.ts`.
 * Lưu ý: rail neo MỘT lần, thẻ con xếp bằng `flex-col` + `gap` — đừng cho thẻ tự neo `fixed` (chồng nhau).
 *
 * @example
 * <ProgressCenter />
 */
const ProgressCenter = memo(function ProgressCenter() {
  return (
    <div aria-live="polite" className={PROGRESS_CENTER_RAIL_CLASSES} role="status">
      <ServerTaskList />
      <UploadQueueCard />
    </div>
  );
});

export default ProgressCenter;
